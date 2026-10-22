const assert = require("node:assert/strict");

process.env.DATABASE_URL ??= "postgresql://mimelux:mimelux_dev@127.0.0.1:5432/mimelux?schema=public";
process.env.AUTH_RATE_LIMIT = "5000";
process.env.AUTH_EMAIL_FAIL_LIMIT = "50";
process.env.AUTH_RATE_TTL_MS = "60000";
process.env.JWT_ACCESS_SECRET ??= "local-access-only";
process.env.JWT_REFRESH_SECRET ??= "local-refresh-only";
process.env.DEMO_MODE = "true";
process.env.PRIVACY_EXPORT_LIMIT = "2";
process.env.STRIPE_ALLOW_LIVE = "false";
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;

require("reflect-metadata");
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const { database: prisma } = require("@mimelux/db/runtime");

const consentVersion = "2026-10-22";

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("v1");
  await app.listen(0, "127.0.0.1");
  const base = baseUrl(app);
  const stamp = Date.now();
  const password = "mimelux123";
  const fanEmail = `privacy.fan.${stamp}@mimelux.test`;
  const creatorEmail = `privacy.creator.${stamp}@mimelux.test`;

  const fan = await register(base, fanEmail, "FAN", "Fa Privacidade");
  const creatorAccount = await register(base, creatorEmail, "CREATOR", "Criador Privacidade");
  const username = `lgpd${stamp}`;
  await prisma.profile.update({
    where: { userId: creatorAccount.id },
    data: { username, bio: "Bio publica", city: "Recife" },
  });
  await prisma.user.update({
    where: { id: creatorAccount.id },
    data: { stripeCustomerId: `cus_lgpd_${stamp}`, acceptedTermsIp: "203.0.113.77" },
  });
  const creator = await prisma.creator.create({
    data: { userId: creatorAccount.id, status: "ACTIVE", category: "Geral" },
  });
  const plan = await prisma.plan.create({
    data: {
      creatorId: creator.id,
      name: "Mensal",
      description: "Acesso",
      priceCents: 1990,
      durationMonths: 1,
    },
  });
  const post = await prisma.post.create({
    data: { creatorId: creator.id, caption: "Publicacao visivel", visibility: "FREE", publishedAt: new Date() },
  });
  const subscription = await prisma.subscription.create({
    data: {
      fanId: fan.id,
      creatorId: creator.id,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  const purchase = await prisma.purchase.create({
    data: {
      buyerId: fan.id,
      creatorId: creator.id,
      postId: post.id,
      kind: "POST",
      status: "PAID",
      amountCents: 2500,
      idempotencyKey: `lgpd-purchase-${stamp}`,
    },
  });
  await prisma.ledgerEntry.create({
    data: {
      userId: fan.id,
      creatorId: creator.id,
      purchaseId: purchase.id,
      direction: "CREDIT",
      account: "creator",
      amountCents: 2000,
      reference: `lgpd-${stamp}`,
    },
  });
  const conversation = await prisma.conversation.create({
    data: { participantIds: [fan.id, creatorAccount.id] },
  });
  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: fan.id, body: "texto secreto" },
  });
  const affiliate = await prisma.affiliate.create({
    data: {
      userId: creatorAccount.id,
      code: `lgpd${stamp}`,
      displayName: "Criador Privacidade",
      payoutDetails: { pix: "segredo" },
    },
  });

  const outdated = await request("POST", `${base}/privacy/consent`, {
    version: "1999-01-01",
    analytics: true,
    marketing: true,
  }, fan.token);
  assert.equal(outdated.status, 400, JSON.stringify(outdated.body));

  const saved = await request("POST", `${base}/privacy/consent`, {
    version: consentVersion,
    analytics: false,
    marketing: true,
  }, fan.token);
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  assert.equal(saved.body.consent.necessary, true);
  assert.equal(saved.body.consent.marketing, true);
  assert.equal(saved.body.consent.analytics, false);
  assert.ok(saved.body.consent.createdAt);

  const visible = await request("GET", `${base}/creators/${username}`);
  assert.equal(visible.status, 200, JSON.stringify(visible.body));
  assert.equal(visible.body.name, "Criador Privacidade");

  const first = await request("GET", `${base}/privacy/export`, undefined, fan.token);
  assert.equal(first.status, 200, JSON.stringify(first.body));
  assert.equal(first.body.profile.email, fanEmail);
  assert.equal(first.body.subscriptions.length, 1);
  assert.equal(first.body.purchases[0].amountCents, 2500);
  assert.equal(first.body.purchases[0].providerRef, undefined);
  assert.equal(first.body.consents[0].marketing, true);
  assert.equal(first.body.messages.length, 1);
  assert.equal(first.body.messages[0].conversationId, conversation.id);
  assert.equal(JSON.stringify(first.body).includes("texto secreto"), false);
  assert.equal(JSON.stringify(first.body).includes("passwordHash"), false);

  const second = await request("GET", `${base}/privacy/export`, undefined, fan.token);
  assert.equal(second.status, 200, JSON.stringify(second.body));
  const limited = await request("GET", `${base}/privacy/export`, undefined, fan.token);
  assert.equal(limited.status, 429, JSON.stringify(limited.body));
  const exportRows = await prisma.privacyRequest.count({ where: { userId: fan.id, kind: "export" } });
  assert.equal(exportRows, 2);

  const wrong = await request("POST", `${base}/privacy/deletion`, {
    password: "errada123",
    confirm: "EXCLUIR",
  }, creatorAccount.token);
  assert.equal(wrong.status, 401, JSON.stringify(wrong.body));
  const stillNamed = await prisma.profile.findUnique({ where: { userId: creatorAccount.id } });
  assert.equal(stillNamed.name, "Criador Privacidade");

  const unconfirmed = await request("POST", `${base}/privacy/deletion`, {
    password,
    confirm: "apagar",
  }, creatorAccount.token);
  assert.equal(unconfirmed.status, 400, JSON.stringify(unconfirmed.body));

  const removed = await request("POST", `${base}/privacy/deletion`, {
    password,
    confirm: "EXCLUIR",
  }, creatorAccount.token);
  assert.equal(removed.status, 200, JSON.stringify(removed.body));
  assert.equal(removed.body.deleted, true);

  const hidden = await request("GET", `${base}/creators/${username}`);
  assert.equal(hidden.status, 200);
  assert.notEqual(hidden.body?.name, "Criador Privacidade");
  const listed = await request("GET", `${base}/creators?search=${username}`);
  assert.equal(listed.body.items.some((item) => item.username === username), false);

  const storedCreator = await prisma.creator.findUnique({ where: { id: creator.id } });
  assert.equal(storedCreator.status, "SUSPENDED");
  const storedPost = await prisma.post.findUnique({ where: { id: post.id } });
  assert.ok(storedPost.deletedAt instanceof Date);
  const storedUser = await prisma.user.findUnique({ where: { id: creatorAccount.id } });
  assert.ok(storedUser.email.startsWith("deleted-"));
  assert.equal(storedUser.email.endsWith("@users.invalid"), true);
  assert.equal(storedUser.email.includes(creatorEmail.split("@")[0]), false);
  assert.ok(storedUser.deletedAt instanceof Date);
  assert.equal(storedUser.stripeCustomerId, null);
  assert.equal(storedUser.acceptedTermsIp, null);
  assert.ok(storedUser.acceptedTermsAt instanceof Date);
  const storedProfile = await prisma.profile.findUnique({ where: { userId: creatorAccount.id } });
  assert.equal(storedProfile.name, "Conta excluída");
  assert.equal(storedProfile.bio, null);
  assert.equal(storedProfile.city, null);
  assert.equal(storedProfile.username.startsWith("excluida-"), true);
  const storedAffiliate = await prisma.affiliate.findUnique({ where: { id: affiliate.id } });
  assert.equal(storedAffiliate.status, "INACTIVE");
  assert.equal(storedAffiliate.displayName, "Conta excluída");
  assert.equal(storedAffiliate.payoutDetails, null);
  const storedSubscription = await prisma.subscription.findUnique({ where: { id: subscription.id } });
  assert.equal(storedSubscription.status, "EXPIRED");
  const keptPurchase = await prisma.purchase.findUnique({ where: { id: purchase.id } });
  assert.equal(keptPurchase.amountCents, 2500);
  assert.equal(keptPurchase.buyerId, fan.id);
  assert.equal(keptPurchase.status, "PAID");
  const keptLedger = await prisma.ledgerEntry.findFirst({ where: { reference: `lgpd-${stamp}` } });
  assert.equal(keptLedger.amountCents, 2000);
  assert.equal(keptLedger.userId, fan.id);
  const audit = await prisma.auditLog.findFirst({
    where: { actorId: creatorAccount.id, action: "privacy.deletion" },
  });
  assert.ok(audit);
  assert.equal(audit.metadata.creatorHidden, true);

  const creatorLogin = await request("POST", `${base}/auth/login`, { email: creatorEmail, password });
  assert.equal(creatorLogin.status, 401);

  const fanRemoved = await request("POST", `${base}/privacy/deletion`, {
    password,
    confirm: "EXCLUIR",
  }, fan.token);
  assert.equal(fanRemoved.status, 200, JSON.stringify(fanRemoved.body));
  const wiped = await prisma.message.findUnique({ where: { id: message.id } });
  assert.equal(wiped.body, "");
  const fanUser = await prisma.user.findUnique({ where: { id: fan.id } });
  assert.ok(fanUser.email.startsWith("deleted-"));
  assert.equal(fanUser.email.includes("privacy.fan"), false);
  const fanPurchase = await prisma.purchase.findUnique({ where: { id: purchase.id } });
  assert.equal(fanPurchase.buyerId, fan.id);
  assert.equal(fanPurchase.amountCents, 2500);
  const fanAudit = await prisma.auditLog.findFirst({ where: { actorId: fan.id, action: "privacy.deletion" } });
  assert.equal(fanAudit.metadata.creatorHidden, false);
  const fanLogin = await request("POST", `${base}/auth/login`, { email: fanEmail, password });
  assert.equal(fanLogin.status, 401);

  await app.close();
  await prisma.$disconnect();
  console.log("api privacy e2e passed");
}

function baseUrl(app) {
  const { port } = app.getHttpServer().address();
  return `http://127.0.0.1:${port}/v1`;
}

async function register(base, email, role, name) {
  const response = await request("POST", `${base}/auth/register`, {
    email,
    password: "mimelux123",
    name,
    role,
    acceptTerms: true,
    ...(role === "CREATOR" ? { acceptCreatorTerms: true } : {}),
  });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return { id: response.body.user.id, token: response.body.accessToken, email };
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
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
