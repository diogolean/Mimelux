const assert = require("node:assert/strict");

process.env.DATABASE_URL ??= "postgresql://mimelux:mimelux_dev@127.0.0.1:5432/mimelux?schema=public";
process.env.AUTH_RATE_LIMIT = "5000";
process.env.AUTH_EMAIL_FAIL_LIMIT = "50";
process.env.AUTH_RATE_TTL_MS = "60000";
process.env.JWT_ACCESS_SECRET ??= "local-access-only";
process.env.JWT_REFRESH_SECRET ??= "local-refresh-only";
process.env.DEMO_MODE = "true";
if (process.env.NODE_ENV === "production") process.env.NODE_ENV = "development";
delete process.env.ADMIN_EMAIL;
delete process.env.ADMIN_PASSWORD;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_PUBLISHABLE_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;
delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
process.env.STRIPE_ALLOW_LIVE = "false";

require("reflect-metadata");
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const { readStripeSecret, readStripePublishable } = require("../dist/modules/payments/payment-gateways");

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false, rawBody: true });
  app.setGlobalPrefix("v1");
  await app.listen(0, "127.0.0.1");
  const base = baseUrl(app);
  const stamp = Date.now();

  const affiliate = await request("POST", `${base}/auth/register`, {
    email: `affiliate.${stamp}@mimelux.test`,
    password: "mimelux123",
    name: "Afiliada Nova",
    role: "AFFILIATE",
  });
  assert.equal(affiliate.status, 201, JSON.stringify(affiliate.body));
  assert.equal(affiliate.body.user.role, "AFFILIATE");

  const creator = await request("POST", `${base}/auth/register`, {
    email: `creator.${stamp}@mimelux.test`,
    password: "mimelux123",
    name: "Criadora Nova",
    role: "CREATOR",
  });
  assert.equal(creator.status, 201, JSON.stringify(creator.body));
  assert.equal(creator.body.user.role, "CREATOR");

  const rejected = await request("POST", `${base}/auth/register`, {
    email: `admin.${stamp}@mimelux.test`,
    password: "mimelux123",
    name: "Falsa Admin",
    role: "ADMIN",
  });
  assert.equal(rejected.status, 400, JSON.stringify(rejected.body));

  const fan = await request("POST", `${base}/auth/login`, {
    email: "fan@patrocino.com",
    password: "mimelux123",
  });
  assert.equal(fan.status, 200, JSON.stringify(fan.body));
  const fanDenied = await request("GET", `${base}/admin/users`, undefined, fan.body.accessToken);
  assert.equal(fanDenied.status, 403, JSON.stringify(fanDenied.body));

  const admin = await request("POST", `${base}/auth/login`, {
    email: "admin@patrocino.com",
    password: "mimelux123",
  });
  assert.equal(admin.status, 200, JSON.stringify(admin.body));
  assert.equal(admin.body.user.role, "ADMIN");
  const token = admin.body.accessToken;

  const listed = await request(
    "GET",
    `${base}/admin/users?q=${encodeURIComponent(affiliate.body.user.email)}`,
    undefined,
    token,
  );
  assert.equal(listed.status, 200, JSON.stringify(listed.body));
  assert.equal(listed.body.users.length, 1);
  const userId = listed.body.users[0].id;

  const changed = await request(
    "PATCH",
    `${base}/admin/users/${userId}`,
    { role: "CREATOR", name: "Agora Criadora", city: "Lisboa" },
    token,
  );
  assert.equal(changed.status, 200, JSON.stringify(changed.body));
  assert.equal(changed.body.user.role, "CREATOR");
  assert.equal(changed.body.user.city, "Lisboa");

  const detail = await request("GET", `${base}/admin/users/${userId}`, undefined, token);
  assert.equal(detail.status, 200, JSON.stringify(detail.body));
  assert.equal(detail.body.user.role, "CREATOR");
  assert.ok(detail.body.audit.some((entry) => entry.action === "user.update"));
  assert.equal(JSON.stringify(detail.body).includes("passwordHash"), false);

  const reset = await request("POST", `${base}/admin/users/${userId}/reset-password`, {}, token);
  assert.equal(reset.status, 201, JSON.stringify(reset.body));
  assert.equal(typeof reset.body.temporaryPassword, "string");
  assert.ok(reset.body.temporaryPassword.length >= 8);
  const withTemp = await request("POST", `${base}/auth/login`, {
    email: affiliate.body.user.email,
    password: reset.body.temporaryPassword,
  });
  assert.equal(withTemp.status, 200, JSON.stringify(withTemp.body));
  const afterReset = await request("GET", `${base}/admin/users/${userId}`, undefined, token);
  assert.equal(afterReset.body.user.mustResetPassword, true);
  assert.equal(JSON.stringify(afterReset.body).includes(reset.body.temporaryPassword), false);

  const suspended = await request("PATCH", `${base}/admin/users/${userId}`, { suspended: true }, token);
  assert.equal(suspended.status, 200, JSON.stringify(suspended.body));
  assert.equal(suspended.body.user.suspended, true);
  const blocked = await request("POST", `${base}/auth/login`, {
    email: affiliate.body.user.email,
    password: reset.body.temporaryPassword,
  });
  assert.equal(blocked.status, 401);

  const restored = await request("PATCH", `${base}/admin/users/${userId}`, { suspended: false }, token);
  assert.equal(restored.body.user.suspended, false);
  const openAgain = await request("POST", `${base}/auth/login`, {
    email: affiliate.body.user.email,
    password: reset.body.temporaryPassword,
  });
  assert.equal(openAgain.status, 200, JSON.stringify(openAgain.body));

  const removed = await request("DELETE", `${base}/admin/users/${userId}`, undefined, token);
  assert.equal(removed.status, 200, JSON.stringify(removed.body));
  const gone = await request("POST", `${base}/auth/login`, {
    email: affiliate.body.user.email,
    password: reset.body.temporaryPassword,
  });
  assert.equal(gone.status, 401);

  const self = await request("PATCH", `${base}/admin/users/${admin.body.user.id}`, { role: "FAN" }, token);
  assert.equal(self.status, 400, JSON.stringify(self.body));

  const missingStripe = await request("POST", `${base}/payments/checkout`, {
    provider: "stripe",
    creatorId: "lunaferraz",
    planId: "monthly",
  });
  assert.equal(missingStripe.status, 401, JSON.stringify(missingStripe.body));

  process.env.STRIPE_SECRET_KEY = "sk_test_replace_me";
  assert.equal(readStripeSecret().ok, false);
  const placeholder = await request("POST", `${base}/payments/checkout`, {
    provider: "stripe",
    creatorId: "lunaferraz",
    planId: "monthly",
  });
  assert.equal(placeholder.status, 401);

  process.env.STRIPE_SECRET_KEY = "sk_live_example";
  process.env.STRIPE_PUBLISHABLE_KEY = "pk_live_example";
  assert.equal(readStripeSecret().reason, "live_disabled");
  const liveBlocked = await request("POST", `${base}/payments/checkout`, {
    provider: "stripe",
    creatorId: "lunaferraz",
    planId: "monthly",
  });
  assert.equal(liveBlocked.status, 401);
  const liveConfig = await request("GET", `${base}/payments/config`);
  assert.equal(liveConfig.body.enabled, false);

  process.env.STRIPE_ALLOW_LIVE = "true";
  assert.equal(readStripeSecret().ok, true);
  assert.equal(readStripePublishable().ok, true);
  const liveAllowed = await request("GET", `${base}/payments/config`);
  assert.equal(liveAllowed.body.enabled, true);
  assert.equal(liveAllowed.body.live, true);
  process.env.STRIPE_ALLOW_LIVE = "false";

  process.env.STRIPE_SECRET_KEY = "sk_test_example";
  process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_example";
  const testConfig = await request("GET", `${base}/payments/config`);
  assert.equal(testConfig.body.enabled, true);
  assert.equal(testConfig.body.live, false);
  assert.equal(testConfig.body.publishableKey, "pk_test_example");

  delete process.env.STRIPE_WEBHOOK_SECRET;
  const unconfiguredHook = await request("POST", `${base}/payments/webhooks/stripe`, { id: "evt_test" }, undefined, {
    "stripe-signature": "t=1,v1=bad",
  });
  assert.equal(unconfiguredHook.status, 200, JSON.stringify(unconfiguredHook.body));
  assert.equal(unconfiguredHook.body.accepted, false);
  assert.equal(unconfiguredHook.body.reason, "stripe_webhook_not_configured");

  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  const badSignature = await request("POST", `${base}/payments/webhooks/stripe`, { id: "evt_bad" }, undefined, {
    "stripe-signature": "t=1,v1=bad",
  });
  assert.equal(badSignature.status, 400, JSON.stringify(badSignature.body));
  assert.match(String(badSignature.body.message), /Invalid Stripe signature/);

  await app.close();
  console.log("api admin e2e passed");
}

function baseUrl(app) {
  const { port } = app.getHttpServer().address();
  return `http://127.0.0.1:${port}/v1`;
}

async function request(method, url, body, token, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, body: payload };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
