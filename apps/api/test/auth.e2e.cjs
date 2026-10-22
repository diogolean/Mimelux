const assert = require("node:assert/strict");

process.env.DATABASE_URL ??= "postgresql://mimelux:mimelux_dev@127.0.0.1:5432/mimelux?schema=public";
process.env.AUTH_RATE_LIMIT = "3";
process.env.AUTH_EMAIL_FAIL_LIMIT = "5";
process.env.AUTH_RATE_TTL_MS = "60000";
process.env.JWT_ACCESS_SECRET ??= "local-access-only";
process.env.JWT_REFRESH_SECRET ??= "local-refresh-only";
process.env.RESEND_API_KEY = "";
process.env.INTERNAL_PROXY_SECRET = "test-proxy-secret";
delete process.env.TRUST_PROXY;

require("reflect-metadata");
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const { applyTrustProxy } = require("../dist/http");

const secret = process.env.INTERNAL_PROXY_SECRET;

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("v1");
  await app.listen(0, "127.0.0.1");
  const base = baseUrl(app);

  const email = `api.${Date.now()}@mimelux.test`;
  const password = "mimelux123";
  const sessionIp = { "x-patrocino-client-ip": "203.0.113.10", "x-patrocino-proxy-secret": secret };

  const register = await request(`${base}/auth/register`, {
    email,
    password,
    name: "API Test",
    role: "FAN",
    acceptTerms: true,
  }, sessionIp);
  assert.equal(register.status, 201, JSON.stringify(register.body));
  assert.equal(register.body.user.emailVerified, false);
  assert.equal(register.body.user.acceptedTermsAt, undefined);
  assert.ok(register.body.accessToken);
  const { database } = require("@mimelux/db/runtime");
  const stored = await database.user.findUnique({ where: { email } });
  assert.ok(stored.acceptedTermsAt instanceof Date);
  assert.equal(stored.termsVersion, "2026-10-22");
  assert.equal(stored.acceptedTermsIp, "203.0.113.10");
  const firstRefresh = register.body.refreshToken;

  const login = await request(`${base}/auth/login`, { email, password }, sessionIp);
  assert.equal(login.status, 200, JSON.stringify(login.body));
  assert.notEqual(login.body.refreshToken, firstRefresh);

  const rotated = await request(`${base}/auth/refresh`, { refreshToken: login.body.refreshToken }, sessionIp);
  assert.equal(rotated.status, 200, JSON.stringify(rotated.body));
  assert.notEqual(rotated.body.refreshToken, login.body.refreshToken);

  const reused = await request(`${base}/auth/refresh`, { refreshToken: login.body.refreshToken }, sessionIp);
  assert.equal(reused.status, 401);

  const logout = await request(`${base}/auth/logout`, { refreshToken: rotated.body.refreshToken }, sessionIp);
  assert.equal(logout.status, 200);
  const afterLogout = await request(`${base}/auth/refresh`, { refreshToken: rotated.body.refreshToken }, sessionIp);
  assert.equal(afterLogout.status, 401);

  const demo = await request(
    `${base}/auth/login`,
    { email: "fan@patrocino.com", password: "mimelux123" },
    { "x-patrocino-client-ip": "203.0.113.11", "x-patrocino-proxy-secret": secret },
  );
  assert.equal(demo.status, 200, JSON.stringify(demo.body));
  assert.equal(demo.body.user.email, "fan@mimelux.com.br");

  const limitedIp = "203.0.113.21";
  const limited = [];
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await request(
      `${base}/auth/login`,
      { email: "nobody.ip@mimelux.test", password: "wrong-password" },
      { "x-patrocino-client-ip": limitedIp, "x-patrocino-proxy-secret": secret },
    );
    limited.push(response.status);
  }
  assert.deepEqual(limited, [401, 401, 401, 429]);

  const otherIp = await request(
    `${base}/auth/login`,
    { email: "nobody.ip@mimelux.test", password: "wrong-password" },
    { "x-patrocino-client-ip": "203.0.113.22", "x-patrocino-proxy-secret": secret },
  );
  assert.equal(otherIp.status, 401);

  const spoofed = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await request(
      `${base}/auth/login`,
      { email: "nobody.spoof@mimelux.test", password: "wrong-password" },
      { "x-patrocino-client-ip": `203.0.113.${30 + attempt}` },
    );
    spoofed.push(response.status);
  }
  const ignoredForward = await request(
    `${base}/auth/login`,
    { email: "nobody.spoof@mimelux.test", password: "wrong-password" },
    { "x-forwarded-for": "198.51.100.9", "x-patrocino-client-ip": "203.0.113.99" },
  );
  assert.deepEqual(spoofed, [401, 401, 401]);
  assert.equal(ignoredForward.status, 429);

  const guessed = `guess.${Date.now()}@mimelux.test`;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request(
      `${base}/auth/login`,
      { email: guessed, password: "wrong-password" },
      { "x-patrocino-client-ip": `203.0.113.${40 + attempt}`, "x-patrocino-proxy-secret": secret },
    );
    assert.equal(response.status, 401, `failure ${attempt}`);
  }
  const emailLimited = await request(
    `${base}/auth/login`,
    { email: guessed, password: "wrong-password" },
    { "x-patrocino-client-ip": "203.0.113.50", "x-patrocino-proxy-secret": secret },
  );
  assert.equal(emailLimited.status, 429);
  const demoStillWorks = await request(
    `${base}/auth/login`,
    { email: "criadora@patrocino.com", password: "mimelux123" },
    { "x-patrocino-client-ip": "203.0.113.80", "x-patrocino-proxy-secret": secret },
  );
  assert.equal(demoStillWorks.status, 200, JSON.stringify(demoStillWorks.body));
  assert.equal(demoStillWorks.body.user.email, "criadora@mimelux.com.br");

  const creatorIp = { "x-patrocino-client-ip": "203.0.113.90", "x-patrocino-proxy-secret": secret };
  const creatorDenied = await request(`${base}/auth/register`, {
    email: `creator.deny.${Date.now()}@mimelux.test`,
    password,
    name: "API Creator",
    role: "CREATOR",
    acceptTerms: true,
  }, creatorIp);
  assert.equal(creatorDenied.status, 400);
  const creatorOk = await request(`${base}/auth/register`, {
    email: `creator.ok.${Date.now()}@mimelux.test`,
    password,
    name: "API Creator",
    role: "CREATOR",
    acceptTerms: true,
    acceptCreatorTerms: true,
  }, creatorIp);
  assert.equal(creatorOk.status, 201, JSON.stringify(creatorOk.body));

  await app.close();

  delete process.env.INTERNAL_PROXY_SECRET;
  process.env.TRUST_PROXY = "true";
  const proxied = await NestFactory.create(AppModule, { logger: false });
  applyTrustProxy(proxied);
  proxied.setGlobalPrefix("v1");
  await proxied.listen(0, "127.0.0.1");
  const proxyBase = baseUrl(proxied);
  const forwarded = [];
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await request(
      `${proxyBase}/auth/login`,
      { email: "nobody.proxy@mimelux.test", password: "wrong-password" },
      { "x-forwarded-for": "198.51.100.1" },
    );
    forwarded.push(response.status);
  }
  assert.deepEqual(forwarded, [401, 401, 401, 429]);
  const secondHop = await request(
    `${proxyBase}/auth/login`,
    { email: "nobody.proxy@mimelux.test", password: "wrong-password" },
    { "x-forwarded-for": "198.51.100.2" },
  );
  assert.equal(secondHop.status, 401);
  const untrustedHeader = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await request(
      `${proxyBase}/auth/login`,
      { email: "nobody.header@mimelux.test", password: "wrong-password" },
      { "x-forwarded-for": "198.51.100.2", "x-patrocino-client-ip": `203.0.113.${70 + attempt}` },
    );
    untrustedHeader.push(response.status);
  }
  assert.deepEqual(untrustedHeader, [401, 401, 429]);
  const demoBehindProxy = await request(
    `${proxyBase}/auth/login`,
    { email: "afiliado@mimelux.com.br", password: "mimelux123" },
    { "x-forwarded-for": "198.51.100.50" },
  );
  assert.equal(demoBehindProxy.status, 200, JSON.stringify(demoBehindProxy.body));
  assert.equal(demoBehindProxy.body.user.email, "afiliado@mimelux.com.br");
  await proxied.close();

  console.log("api auth e2e passed");
}

function baseUrl(app) {
  const { port } = app.getHttpServer().address();
  return `http://127.0.0.1:${port}/v1`;
}

async function request(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, body: payload };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
