const assert = require("node:assert/strict");
const { mkdtempSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");

process.env.DATABASE_URL ??= "postgresql://mimelux:mimelux_dev@127.0.0.1:5432/mimelux?schema=public";
process.env.AUTH_RATE_LIMIT = "5000";
process.env.AUTH_EMAIL_FAIL_LIMIT = "50";
process.env.AUTH_RATE_TTL_MS = "60000";
process.env.JWT_ACCESS_SECRET ??= "local-access-only";
process.env.JWT_REFRESH_SECRET ??= "local-refresh-only";
process.env.DEMO_MODE = "true";
process.env.MEDIA_ROOT = mkdtempSync(path.join(tmpdir(), "patrocino-scope-"));
process.env.MEDIA_PHOTO_MAX_BYTES = "1048576";
if (process.env.NODE_ENV === "production") process.env.NODE_ENV = "development";
delete process.env.ADMIN_EMAIL;
delete process.env.ADMIN_PASSWORD;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_PUBLISHABLE_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;
process.env.STRIPE_ALLOW_LIVE = "false";

require("reflect-metadata");
const Stripe = require("stripe");
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const { database: prisma } = require("@mimelux/db/runtime");

const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(80, 1)]);

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false, rawBody: true });
  app.setGlobalPrefix("v1");
  await app.listen(0, "127.0.0.1");
  const base = baseUrl(app);
  const stamp = Date.now();

  const creatorAAccount = await register(base, `scope.creator.a.${stamp}@mimelux.test`, "CREATOR", "Criador A");
  const creatorBAccount = await register(base, `scope.creator.b.${stamp}@mimelux.test`, "CREATOR", "Criador B");
  const fan = await register(base, `scope.fan.${stamp}@mimelux.test`, "FAN", "Fa Escopo");
  const creatorA = await prisma.creator.create({
    data: { userId: creatorAAccount.id, status: "ACTIVE", category: "Geral" },
  });
  const creatorB = await prisma.creator.create({
    data: { userId: creatorBAccount.id, status: "ACTIVE", category: "Geral" },
  });

  const admin = await request("POST", `${base}/auth/login`, {
    email: "admin@patrocino.com",
    password: "mimelux123",
  });
  assert.equal(admin.status, 200, JSON.stringify(admin.body));
  const adminToken = admin.body.accessToken;

  const own = await upload(base, creatorAAccount.token, jpeg, "proprio.jpg", "image/jpeg", {
    caption: "Do criador",
    visibility: "subscribers",
  });
  assert.equal(own.status, 201, JSON.stringify(own.body));
  assert.equal(own.body.item.creatorId, creatorA.id);
  const postId = own.body.item.id;
  const media = await prisma.media.findFirst({ where: { postId } });
  assert.ok(media);

  const listed = await request("GET", `${base}/media/items`, undefined, creatorAAccount.token);
  assert.equal(listed.status, 200, JSON.stringify(listed.body));
  assert.equal(listed.body.items.some((item) => item.id === postId), true);

  const otherList = await request("GET", `${base}/media/items?creatorId=${creatorB.id}`, undefined, creatorAAccount.token);
  assert.equal(otherList.status, 403, JSON.stringify(otherList.body));
  const fanList = await request("GET", `${base}/media/items?creatorId=${creatorA.id}`, undefined, fan.token);
  assert.equal(fanList.status, 403, JSON.stringify(fanList.body));

  const edited = await request("PATCH", `${base}/media/items/${postId}`, { caption: "Editado pelo dono" }, creatorAAccount.token);
  assert.equal(edited.status, 200, JSON.stringify(edited.body));
  assert.equal(edited.body.item.caption, "Editado pelo dono");
  const ownPost = await request("GET", `${base}/posts/${postId}`, undefined, creatorAAccount.token);
  assert.equal(ownPost.status, 200, JSON.stringify(ownPost.body));
  assert.equal(ownPost.body.item.locked, false);
  assert.equal(ownPost.body.item.caption, "Editado pelo dono");

  const otherUpload = await upload(base, creatorAAccount.token, jpeg, "alheio.jpg", "image/jpeg", { visibility: "free" }, creatorB.id);
  assert.equal(otherUpload.status, 403, JSON.stringify(otherUpload.body));
  const fanUpload = await upload(base, fan.token, jpeg, "fa.jpg", "image/jpeg", { visibility: "free" }, creatorA.id);
  assert.equal(fanUpload.status, 403, JSON.stringify(fanUpload.body));

  const otherOwned = await upload(base, creatorBAccount.token, jpeg, "b.jpg", "image/jpeg", {
    caption: "Do criador B",
    visibility: "subscribers",
  });
  assert.equal(otherOwned.status, 201, JSON.stringify(otherOwned.body));
  const otherPostId = otherOwned.body.item.id;
  const otherMedia = await prisma.media.findFirst({ where: { postId: otherPostId } });
  assert.ok(otherMedia);

  const otherEdit = await request("PATCH", `${base}/media/items/${otherPostId}`, { caption: "Invasao" }, creatorAAccount.token);
  assert.equal(otherEdit.status, 403, JSON.stringify(otherEdit.body));
  const fanEdit = await request("PATCH", `${base}/media/items/${postId}`, { caption: "Fa" }, fan.token);
  assert.equal(fanEdit.status, 403, JSON.stringify(fanEdit.body));
  const otherDelete = await request("DELETE", `${base}/media/items/${otherPostId}`, undefined, creatorAAccount.token);
  assert.equal(otherDelete.status, 403, JSON.stringify(otherDelete.body));
  const fanDelete = await request("DELETE", `${base}/media/items/${postId}`, undefined, fan.token);
  assert.equal(fanDelete.status, 403, JSON.stringify(fanDelete.body));
  const stillThere = await prisma.post.findUnique({ where: { id: otherPostId } });
  assert.equal(stillThere.deletedAt, null);
  assert.equal(stillThere.caption, "Do criador B");

  const reorder = await request("PATCH", `${base}/media/items/order`, { ids: [postId] }, creatorAAccount.token);
  assert.equal(reorder.status, 200, JSON.stringify(reorder.body));
  const foreignOrder = await request("PATCH", `${base}/media/items/order`, { ids: [otherPostId] }, creatorAAccount.token);
  assert.equal(foreignOrder.status, 403, JSON.stringify(foreignOrder.body));
  const fanOrder = await request("PATCH", `${base}/media/items/order`, { creatorId: creatorA.id, ids: [postId] }, fan.token);
  assert.equal(fanOrder.status, 403, JSON.stringify(fanOrder.body));

  const started = await request("POST", `${base}/media/uploads`, {
    filename: "sessao.jpg",
    mimeType: "image/jpeg",
    byteSize: jpeg.length,
  }, creatorAAccount.token);
  assert.equal(started.status, 201, JSON.stringify(started.body));
  const stolenChunk = await binaryPut(`${base}/media/uploads/${started.body.id}/chunks/0`, jpeg, creatorBAccount.token);
  assert.equal(stolenChunk.status, 403);
  const stolenComplete = await request("POST", `${base}/media/uploads/${started.body.id}/complete`, { visibility: "free", caption: "Roubado" }, creatorBAccount.token);
  assert.equal(stolenComplete.status, 403, JSON.stringify(stolenComplete.body));
  const fanChunk = await binaryPut(`${base}/media/uploads/${started.body.id}/chunks/0`, jpeg, fan.token);
  assert.equal(fanChunk.status, 403);
  const finished = await binaryPut(`${base}/media/uploads/${started.body.id}/chunks/0`, jpeg, creatorAAccount.token);
  assert.equal(finished.status, 200);
  const completed = await request("POST", `${base}/media/uploads/${started.body.id}/complete`, { visibility: "free", caption: "Extra" }, creatorAAccount.token);
  assert.equal(completed.status, 201, JSON.stringify(completed.body));
  const removed = await request("DELETE", `${base}/media/items/${completed.body.item.id}`, undefined, creatorAAccount.token);
  assert.equal(removed.status, 200, JSON.stringify(removed.body));

  const ownCreate = await request("POST", `${base}/posts`, {
    caption: "Contrato",
    visibility: "subscriber",
    mediaIds: [media.id],
  }, creatorAAccount.token);
  assert.equal(ownCreate.status, 501, JSON.stringify(ownCreate.body));
  const crossCreate = await request("POST", `${base}/posts`, {
    caption: "Contrato alheio",
    visibility: "subscriber",
    mediaIds: [otherMedia.id],
  }, creatorAAccount.token);
  assert.equal(crossCreate.status, 403, JSON.stringify(crossCreate.body));
  const fanCreate = await request("POST", `${base}/posts`, {
    caption: "Fa",
    visibility: "free",
    mediaIds: [media.id],
  }, fan.token);
  assert.equal(fanCreate.status, 403, JSON.stringify(fanCreate.body));

  const hidden = await request("GET", `${base}/posts/${postId}`, undefined, creatorBAccount.token);
  assert.equal(hidden.body.item.locked, true);
  assert.equal(hidden.body.item.caption, "");
  const otherFile = await binary(`${base}/media/${media.id}/file`, creatorBAccount.token);
  assert.equal(otherFile.status, 403);
  const ownFile = await binary(`${base}/media/${media.id}/file`, creatorAAccount.token);
  assert.equal(ownFile.status, 200);
  assert.deepEqual(ownFile.body, jpeg);

  const profile = await request("GET", `${base}/creators/${creatorA.id}/profile`, undefined, creatorAAccount.token);
  assert.equal(profile.status, 200, JSON.stringify(profile.body));
  const saved = await request("PATCH", `${base}/creators/${creatorA.id}/profile`, { bio: "Bio do dono", city: "Recife" }, creatorAAccount.token);
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  assert.equal(saved.body.profile.bio, "Bio do dono");
  assert.equal(saved.body.profile.city, "Recife");
  const otherProfile = await request("PATCH", `${base}/creators/${creatorB.id}/profile`, { city: "Outra" }, creatorAAccount.token);
  assert.equal(otherProfile.status, 403, JSON.stringify(otherProfile.body));
  const otherRead = await request("GET", `${base}/creators/${creatorB.id}/profile`, undefined, creatorAAccount.token);
  assert.equal(otherRead.status, 403, JSON.stringify(otherRead.body));
  const fanProfile = await request("PATCH", `${base}/creators/${creatorA.id}/profile`, { city: "Fa" }, fan.token);
  assert.equal(fanProfile.status, 403, JSON.stringify(fanProfile.body));
  const fanRead = await request("GET", `${base}/creators/${creatorA.id}/profile`, undefined, fan.token);
  assert.equal(fanRead.status, 403, JSON.stringify(fanRead.body));
  const untouched = await prisma.profile.findUnique({ where: { userId: creatorB.userId } });
  assert.notEqual(untouched?.city, "Outra");

  const fanUsers = await request("GET", `${base}/admin/users`, undefined, fan.token);
  assert.equal(fanUsers.status, 403);
  const creatorUsers = await request("PATCH", `${base}/admin/users/${creatorBAccount.id}`, { city: "Admin falso" }, creatorAAccount.token);
  assert.equal(creatorUsers.status, 403, JSON.stringify(creatorUsers.body));
  const fanRevenue = await request("PATCH", `${base}/admin/creators/${creatorA.id}`, { creatorSharePercent: 50 }, fan.token);
  assert.equal(fanRevenue.status, 403);
  const creatorRevenue = await request("PATCH", `${base}/admin/creators/${creatorA.id}`, { creatorSharePercent: 50 }, creatorAAccount.token);
  assert.equal(creatorRevenue.status, 403);

  const adminListA = await request("GET", `${base}/media/items?creatorId=${creatorA.id}`, undefined, adminToken);
  assert.equal(adminListA.status, 200, JSON.stringify(adminListA.body));
  assert.equal(adminListA.body.items.some((item) => item.id === postId), true);
  const adminListB = await request("GET", `${base}/media/items?creatorId=${creatorB.id}`, undefined, adminToken);
  assert.equal(adminListB.status, 200, JSON.stringify(adminListB.body));
  const adminEditA = await request("PATCH", `${base}/media/items/${postId}`, { caption: "Admin A" }, adminToken);
  assert.equal(adminEditA.status, 200, JSON.stringify(adminEditA.body));
  const adminEditB = await request("PATCH", `${base}/media/items/${otherPostId}`, { caption: "Admin B" }, adminToken);
  assert.equal(adminEditB.status, 200, JSON.stringify(adminEditB.body));
  const adminUploadA = await upload(base, adminToken, jpeg, "admin-a.jpg", "image/jpeg", { caption: "Admin sobe A", visibility: "free" }, creatorA.id);
  assert.equal(adminUploadA.status, 201, JSON.stringify(adminUploadA.body));
  const adminUploadB = await upload(base, adminToken, jpeg, "admin-b.jpg", "image/jpeg", { caption: "Admin sobe B", visibility: "free" }, creatorB.id);
  assert.equal(adminUploadB.status, 201, JSON.stringify(adminUploadB.body));
  const adminDeleteA = await request("DELETE", `${base}/media/items/${adminUploadA.body.item.id}`, undefined, adminToken);
  assert.equal(adminDeleteA.status, 200, JSON.stringify(adminDeleteA.body));
  const adminDeleteB = await request("DELETE", `${base}/media/items/${adminUploadB.body.item.id}`, undefined, adminToken);
  assert.equal(adminDeleteB.status, 200, JSON.stringify(adminDeleteB.body));
  const adminOrder = await request("PATCH", `${base}/media/items/order`, { creatorId: creatorB.id, ids: [otherPostId] }, adminToken);
  assert.equal(adminOrder.status, 200, JSON.stringify(adminOrder.body));
  const adminProfile = await request("PATCH", `${base}/creators/${creatorB.id}/profile`, { city: "Porto" }, adminToken);
  assert.equal(adminProfile.status, 200, JSON.stringify(adminProfile.body));
  assert.equal(adminProfile.body.profile.city, "Porto");
  const adminPost = await request("POST", `${base}/posts`, {
    caption: "Admin contrato",
    visibility: "free",
    mediaIds: [otherMedia.id],
  }, adminToken);
  assert.equal(adminPost.status, 501, JSON.stringify(adminPost.body));

  const deniedFile = await binary(`${base}/media/${media.id}/file`, fan.token);
  assert.equal(deniedFile.status, 403);
  assert.equal(deniedFile.body.includes(jpeg), false);

  const plan = await prisma.plan.create({
    data: { creatorId: creatorA.id, name: "Mensal", description: "Acesso", priceCents: 1990, durationMonths: 1 },
  });
  const pendingSub = await prisma.subscription.create({
    data: { fanId: fan.id, creatorId: creatorA.id, planId: plan.id, status: "PENDING" },
  });
  const pendingPurchase = await prisma.purchase.create({
    data: {
      buyerId: fan.id,
      creatorId: creatorA.id,
      kind: "SUBSCRIPTION",
      status: "PENDING",
      amountCents: 1990,
      subscriptionId: pendingSub.id,
      idempotencyKey: `scope-sub-${stamp}`,
    },
  });
  const stillDenied = await binary(`${base}/media/${media.id}/file`, fan.token);
  assert.equal(stillDenied.status, 403);

  process.env.STRIPE_SECRET_KEY = "sk_test_example";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  const subscribed = await signed(base, `evt_scope_sub_${stamp}`, "checkout.session.completed", {
    id: `cs_scope_${stamp}`,
    object: "checkout.session",
    mode: "subscription",
    payment_status: "paid",
    subscription: `sub_scope_${stamp}`,
    metadata: { purchaseId: pendingPurchase.id, userId: fan.id, creatorId: creatorA.id, planId: plan.id },
  });
  assert.equal(subscribed.status, 200, JSON.stringify(subscribed.body));
  const active = await prisma.subscription.findUnique({ where: { id: pendingSub.id } });
  assert.equal(active.status, "ACTIVE");
  const allowedFile = await binary(`${base}/media/${media.id}/file`, fan.token);
  assert.equal(allowedFile.status, 200);
  assert.equal(allowedFile.headers.get("content-type"), "image/jpeg");
  assert.deepEqual(allowedFile.body, jpeg);

  const ppv = await upload(base, creatorAAccount.token, jpeg, "ppv.jpg", "image/jpeg", {
    caption: "Avulso",
    visibility: "ppv",
    priceCents: 990,
  });
  assert.equal(ppv.status, 201, JSON.stringify(ppv.body));
  const ppvMedia = await prisma.media.findFirst({ where: { postId: ppv.body.item.id } });
  const ppvUrl = `${base}/media/${ppvMedia.id}/file`;
  const ppvDenied = await binary(ppvUrl, fan.token);
  assert.equal(ppvDenied.status, 403);
  const pendingPpv = await prisma.purchase.create({
    data: {
      buyerId: fan.id,
      creatorId: creatorA.id,
      postId: ppv.body.item.id,
      kind: "POST",
      status: "PENDING",
      amountCents: 990,
      idempotencyKey: `scope-ppv-${stamp}`,
    },
  });
  const ppvStill = await binary(ppvUrl, fan.token);
  assert.equal(ppvStill.status, 403);
  const ppvPaid = await signed(base, `evt_scope_ppv_${stamp}`, "payment_intent.succeeded", {
    id: `pi_scope_${stamp}`,
    object: "payment_intent",
    metadata: { purchaseId: pendingPpv.id, userId: fan.id },
  });
  assert.equal(ppvPaid.status, 200, JSON.stringify(ppvPaid.body));
  const ppvRow = await prisma.purchase.findUnique({ where: { id: pendingPpv.id } });
  assert.equal(ppvRow.status, "PAID");
  const ppvAllowed = await binary(ppvUrl, fan.token);
  assert.equal(ppvAllowed.status, 200);
  assert.deepEqual(ppvAllowed.body, jpeg);

  await app.close();
  await prisma.$disconnect();
  console.log("api creator scope e2e passed");
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

async function binary(url, token) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  const body = Buffer.from(await response.arrayBuffer());
  return { status: response.status, headers: response.headers, body };
}

async function binaryPut(url, body, token) {
  const response = await fetch(url, {
    method: "PUT",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" },
    body,
    signal: AbortSignal.timeout(20000),
  });
  return { status: response.status, body: Buffer.from(await response.arrayBuffer()) };
}

async function upload(base, token, file, filename, mimeType, extra, creatorId) {
  const started = await request(
    "POST",
    `${base}/media/uploads`,
    { filename, mimeType, byteSize: file.length, ...(creatorId ? { creatorId } : {}) },
    token,
  );
  if (started.status !== 201) return started;
  const chunk = await binaryPut(`${base}/media/uploads/${started.body.id}/chunks/0`, file, token);
  if (chunk.status !== 200) {
    return { status: chunk.status, body: JSON.parse(chunk.body.toString("utf8") || "{}") };
  }
  return request("POST", `${base}/media/uploads/${started.body.id}/complete`, extra, token);
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

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
