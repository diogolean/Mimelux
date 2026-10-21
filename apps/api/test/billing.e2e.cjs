const assert = require("node:assert/strict");

process.env.DATABASE_URL ??= "postgresql://mimelux:mimelux_dev@127.0.0.1:5432/mimelux?schema=public";
process.env.AUTH_RATE_LIMIT = "5000";
process.env.AUTH_EMAIL_FAIL_LIMIT = "50";
process.env.JWT_ACCESS_SECRET ??= "local-access-only";
process.env.JWT_REFRESH_SECRET ??= "local-refresh-only";
process.env.DEMO_MODE = "true";
if (process.env.NODE_ENV === "production") process.env.NODE_ENV = "development";
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_PUBLISHABLE_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;
process.env.STRIPE_ALLOW_LIVE = "false";

require("reflect-metadata");
const Stripe = require("stripe");
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const { database: prisma } = require("@mimelux/db/runtime");

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false, rawBody: true });
  app.setGlobalPrefix("v1");
  await app.listen(0, "127.0.0.1");
  const base = baseUrl(app);
  const stamp = Date.now();

  const creator = await prisma.creator.findFirst({
    where: { user: { profile: { username: "lunaferraz" } } },
    include: { plans: true, user: { include: { profile: true } } },
  });
  assert.ok(creator, "seeded creator missing");
  const plan = creator.plans.find((item) => item.durationMonths === 1);
  assert.ok(plan);
  const gross = Math.round(plan.priceCents * (1 - plan.discountPercent / 100));
  const affiliate = await prisma.user.findUnique({
    where: { email: "afiliado@mimelux.com.br" },
    include: { affiliate: true },
  });
  assert.ok(affiliate?.affiliate);

  const admin = await request("POST", `${base}/auth/login`, {
    email: "admin@patrocino.com",
    password: "mimelux123",
  });
  assert.equal(admin.status, 200, JSON.stringify(admin.body));
  const adminToken = admin.body.accessToken;

  const saved = await request("PATCH", `${base}/admin/settings`, {
    creatorSharePercent: 80,
    affiliateCommissionPercent: 10,
  }, adminToken);
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  await request("PATCH", `${base}/admin/creators/${creator.id}`, {
    ownership: "HOUSE",
    creatorSharePercent: null,
    affiliateCommissionPercent: null,
  }, adminToken);

  const unauthenticated = await request("POST", `${base}/payments/checkout`, {
    provider: "pix",
    creatorId: "lunaferraz",
    planId: "monthly",
  });
  assert.equal(unauthenticated.status, 401);

  const fan = await register(base, `billing.${stamp}@mimelux.test`);
  const forged = await request("POST", `${base}/payments/checkout`, {
    provider: "pix",
    creatorId: "lunaferraz",
    planId: "monthly",
    amountCents: 1,
    purchaseId: "someone-else",
  }, fan.token);
  assert.equal(forged.status, 400, JSON.stringify(forged.body));

  const priced = await request("POST", `${base}/payments/checkout`, {
    provider: "pix",
    creatorId: "lunaferraz",
    planId: "monthly",
  }, fan.token);
  assert.equal(priced.status, 201, JSON.stringify(priced.body));
  assert.equal(priced.body.purchase.amountCents, gross);
  assert.equal(priced.body.purchase.buyerId, fan.id);
  assert.notEqual(priced.body.purchase.amountCents, 1);

  const stranger = await register(base, `stranger.${stamp}@mimelux.test`);
  assert.notEqual(stranger.id, priced.body.purchase.buyerId);

  process.env.STRIPE_SECRET_KEY = "sk_live_example";
  const live = await request("POST", `${base}/payments/checkout`, {
    provider: "stripe",
    creatorId: "lunaferraz",
    planId: "monthly",
  }, fan.token);
  assert.equal(live.status, 400, JSON.stringify(live.body));
  assert.match(String(live.body.message), /Live Stripe keys are disabled/);
  delete process.env.STRIPE_SECRET_KEY;

  const denied = await request("PATCH", `${base}/admin/settings`, {
    creatorSharePercent: 50,
    affiliateCommissionPercent: 10,
  }, fan.token);
  assert.equal(denied.status, 403, JSON.stringify(denied.body));

  const houseDirect = await subscribe(base, `house.direct.${stamp}@mimelux.test`, false);
  await expectSplit(houseDirect.purchaseId, { creator: 0, affiliate: 0, platform: gross });

  const houseReferred = await subscribe(base, `house.ref.${stamp}@mimelux.test`, true);
  await expectSplit(houseReferred.purchaseId, { creator: 0, affiliate: Math.round(gross * 0.1), platform: gross - Math.round(gross * 0.1) });

  const independent = await request("PATCH", `${base}/admin/creators/${creator.id}`, { ownership: "INDEPENDENT" }, adminToken);
  assert.equal(independent.status, 200, JSON.stringify(independent.body));
  assert.equal(independent.body.creator.ownership, "INDEPENDENT");

  const independentDirect = await subscribe(base, `ind.direct.${stamp}@mimelux.test`, false);
  const creatorShare = Math.round(gross * 0.8);
  await expectSplit(independentDirect.purchaseId, { creator: creatorShare, affiliate: 0, platform: gross - creatorShare });

  const independentReferred = await subscribe(base, `ind.ref.${stamp}@mimelux.test`, true);
  const affiliateCut = Math.round(gross * 0.1);
  await expectSplit(independentReferred.purchaseId, {
    creator: creatorShare - affiliateCut,
    affiliate: affiliateCut,
    platform: gross - (creatorShare - affiliateCut) - affiliateCut,
  });

  const access = await request("GET", `${base}/subscriptions/access?creatorId=lunaferraz`, undefined, independentReferred.token);
  assert.equal(access.status, 200, JSON.stringify(access.body));
  assert.equal(access.body.access, true);
  const mine = await request("GET", `${base}/subscriptions/me`, undefined, independentReferred.token);
  assert.equal(mine.body.items.some((item) => item.access && item.creatorUsername === "lunaferraz"), true);
  const canceled = await request("POST", `${base}/subscriptions/${mine.body.items[0].id}/cancel`, {}, independentReferred.token);
  assert.equal(canceled.status, 201, JSON.stringify(canceled.body));
  assert.equal(canceled.body.subscription.cancelAtPeriodEnd, true);
  assert.equal(canceled.body.subscription.access, true);

  const lockedPost = await prisma.post.create({
    data: {
      creatorId: creator.id,
      caption: "Conteúdo de assinante",
      visibility: "SUBSCRIBERS",
      isDemo: true,
      publishedAt: new Date(),
    },
  });
  const hidden = await request("GET", `${base}/posts/${lockedPost.id}`);
  assert.equal(hidden.body.item.locked, true);
  assert.equal(hidden.body.item.caption, "");
  const open = await request("GET", `${base}/posts/${lockedPost.id}`, undefined, independentReferred.token);
  assert.equal(open.body.item.locked, false);
  assert.equal(open.body.item.caption, "Conteúdo de assinante");

  process.env.STRIPE_SECRET_KEY = "sk_test_example";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  const webhookFan = await register(base, `webhook.${stamp}@mimelux.test`);
  const pendingSub = await prisma.subscription.upsert({
    where: { fanId_creatorId: { fanId: webhookFan.id, creatorId: creator.id } },
    create: { fanId: webhookFan.id, creatorId: creator.id, planId: plan.id, status: "PENDING" },
    update: { planId: plan.id, status: "PENDING", currentPeriodEnd: null, stripeSubscriptionId: null },
  });
  const pendingPurchase = await prisma.purchase.create({
    data: {
      buyerId: webhookFan.id,
      creatorId: creator.id,
      kind: "SUBSCRIPTION",
      status: "PENDING",
      amountCents: gross,
      currency: "BRL",
      subscriptionId: pendingSub.id,
      idempotencyKey: `webhook-${stamp}`,
    },
  });
  const paid = await signed(base, `evt_checkout_${stamp}`, "checkout.session.completed", {
    id: `cs_${stamp}`,
    object: "checkout.session",
    mode: "subscription",
    payment_status: "paid",
    subscription: `sub_${stamp}`,
    metadata: { purchaseId: pendingPurchase.id, userId: webhookFan.id, creatorId: creator.id, planId: plan.id },
  });
  assert.equal(paid.status, 200, JSON.stringify(paid.body));
  assert.equal(paid.body.duplicate, false);
  const again = await signed(base, `evt_checkout_${stamp}`, "checkout.session.completed", {
    id: "cs_test_1",
    object: "checkout.session",
    mode: "subscription",
    metadata: { purchaseId: pendingPurchase.id, userId: webhookFan.id },
  });
  assert.equal(again.body.duplicate, true);
  const settled = await prisma.purchase.findUnique({ where: { id: pendingPurchase.id }, include: { ledgerEntries: true } });
  assert.equal(settled.status, "PAID");
  assert.equal(settled.ledgerEntries.length > 0, true);
  const active = await prisma.subscription.findUnique({ where: { id: pendingSub.id } });
  assert.equal(active.status, "ACTIVE");
  assert.equal(active.stripeSubscriptionId, `sub_${stamp}`);

  await prisma.purchase.update({ where: { id: pendingPurchase.id }, data: { providerRef: `pi_${stamp}` } });
  const refund = await signed(base, `evt_refund_${stamp}`, "charge.refunded", {
    id: `ch_${stamp}`,
    object: "charge",
    payment_intent: `pi_${stamp}`,
  });
  assert.equal(refund.status, 200, JSON.stringify(refund.body));
  const refunded = await prisma.purchase.findUnique({ where: { id: pendingPurchase.id }, include: { ledgerEntries: true } });
  assert.equal(refunded.status, "REFUNDED");
  assert.equal(refunded.ledgerEntries.some((entry) => entry.reference.startsWith("refund:")), true);
  const closed = await request("GET", `${base}/subscriptions/access?creatorId=lunaferraz`, undefined, webhookFan.token);
  assert.equal(closed.body.access, false);

  await prisma.post.delete({ where: { id: lockedPost.id } }).catch(() => undefined);
  await request("PATCH", `${base}/admin/creators/${creator.id}`, {
    ownership: "HOUSE",
    creatorSharePercent: null,
    affiliateCommissionPercent: null,
  }, adminToken);

  await app.close();
  await prisma.$disconnect();
  console.log("api billing e2e passed");

  async function subscribe(urlBase, email, referred) {
    const account = await register(urlBase, email);
    if (referred) await attribute(account.id);
    const response = await request("POST", `${urlBase}/subscriptions/checkout`, {
      creatorId: "lunaferraz",
      planId: "monthly",
    }, account.token);
    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(response.body.simulation, true);
    assert.equal(response.body.amountCents, gross);
    return { ...account, purchaseId: response.body.purchaseId };
  }

  async function attribute(fanId) {
    const link = await prisma.affiliateLink.upsert({
      where: { affiliateId_creatorId: { affiliateId: affiliate.affiliate.id, creatorId: creator.id } },
      update: {},
      create: { affiliateId: affiliate.affiliate.id, creatorId: creator.id, slug: `e2e-${stamp}-${fanId.slice(-4)}`, isDemo: true },
    });
    const click = await prisma.click.create({ data: { linkId: link.id, subId: "e2e", isDemo: true } });
    await prisma.attribution.create({
      data: { clickId: click.id, fanId, expiresAt: new Date(Date.now() + 86_400_000), isDemo: true },
    });
  }
}

async function expectSplit(purchaseId, expected) {
  const entries = await prisma.ledgerEntry.findMany({ where: { purchaseId } });
  const credit = (account) => entries.find((entry) => entry.account === account && entry.direction === "CREDIT")?.amountCents ?? 0;
  const debit = entries.find((entry) => entry.account === "platform_cash" && entry.direction === "DEBIT")?.amountCents ?? 0;
  assert.equal(debit, expected.creator + expected.affiliate + expected.platform, JSON.stringify(entries));
  assert.equal(credit("creator_payable"), expected.creator);
  assert.equal(credit("affiliate_payable"), expected.affiliate);
  assert.equal(credit("platform_revenue"), expected.platform);
}

async function register(base, email) {
  const response = await request("POST", `${base}/auth/register`, {
    email,
    password: "mimelux123",
    name: "Conta Teste",
    role: "FAN",
  });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return { id: response.body.user.id, token: response.body.accessToken, email };
}

async function signed(base, id, type, object) {
  const payload = JSON.stringify({ id, object: "event", type, data: { object } });
  const stripe = new Stripe("sk_test_example");
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const response = await fetch(`${base}/payments/webhooks/stripe`, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": signature },
    body: payload,
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

function baseUrl(app) {
  const { port } = app.getHttpServer().address();
  return `http://127.0.0.1:${port}/v1`;
}

async function request(method, url, body, token) {
  const headers = {};
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

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
