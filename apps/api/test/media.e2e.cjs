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
process.env.MEDIA_ROOT = mkdtempSync(path.join(tmpdir(), "patrocino-media-"));
process.env.MEDIA_PHOTO_MAX_BYTES = "1048576";
if (process.env.NODE_ENV === "production") process.env.NODE_ENV = "development";
delete process.env.ADMIN_EMAIL;
delete process.env.ADMIN_PASSWORD;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_PUBLISHABLE_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;
process.env.STRIPE_ALLOW_LIVE = "false";

require("reflect-metadata");
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const { database: prisma } = require("@mimelux/db/runtime");

const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(80, 1)]);
const mp4 = Buffer.alloc(40);
mp4.write("ftyp", 4, "ascii");
mp4.write("isom", 8, "ascii");

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false, rawBody: true });
  app.setGlobalPrefix("v1");
  await app.listen(0, "127.0.0.1");
  const base = baseUrl(app);
  const stamp = Date.now();

  const creator = await request("POST", `${base}/auth/register`, {
    email: `media.creator.${stamp}@mimelux.test`,
    password: "mimelux123",
    name: "Criador Midia",
    role: "CREATOR",
    acceptTerms: true,
    acceptCreatorTerms: true,
  });
  assert.equal(creator.status, 201, JSON.stringify(creator.body));
  const creatorToken = creator.body.accessToken;

  const fan = await request("POST", `${base}/auth/register`, {
    email: `media.fan.${stamp}@mimelux.test`,
    password: "mimelux123",
    name: "Fa Midia",
    role: "FAN",
    acceptTerms: true,
  });
  assert.equal(fan.status, 201, JSON.stringify(fan.body));
  const fanToken = fan.body.accessToken;

  const denied = await request("GET", `${base}/media/items`, undefined, fanToken);
  assert.equal(denied.status, 403, JSON.stringify(denied.body));

  const text = await upload(base, creatorToken, Buffer.from("this is plain text, not media"), "note.txt", "text/plain", {
    visibility: "subscribers",
  });
  assert.equal(text.status, 400, JSON.stringify(text.body));

  const locked = await upload(base, creatorToken, jpeg, "locked.jpg", "image/jpeg", {
    caption: "Video bloqueado",
    visibility: "subscribers",
  });
  assert.equal(locked.status, 201, JSON.stringify(locked.body));
  const postId = locked.body.item.id;
  const creatorId = locked.body.item.creatorId;
  assert.equal(locked.body.item.fileUrl.startsWith("/v1/media/"), true);
  assert.equal(JSON.stringify(locked.body).includes("storageKey"), false);
  assert.equal(JSON.stringify(locked.body).includes("/private/"), false);

  const stored = await prisma.media.findFirst({ where: { postId } });
  assert.ok(stored);
  assert.match(stored.storageKey, /\/private\//);
  assert.equal(stored.private, true);
  assert.ok(stored.posterKey);
  assert.ok(stored.previewKey);
  const mediaId = stored.id;

  const listed = await request("GET", `${base}/media/items`, undefined, creatorToken);
  assert.equal(listed.status, 200, JSON.stringify(listed.body));
  assert.equal(JSON.stringify(listed.body).includes(stored.storageKey), false);
  assert.equal(JSON.stringify(listed.body).includes("/private/"), false);

  const anonymous = await binary(`${base}/media/${mediaId}/file`);
  assert.equal(anonymous.status, 401);
  assert.notDeepEqual(anonymous.body.subarray(0, 3), jpeg.subarray(0, 3));

  const stranger = await binary(`${base}/media/${mediaId}/file`, fanToken);
  assert.equal(stranger.status, 403);
  assert.equal(stranger.body.includes(jpeg), false);
  const strangerJson = JSON.parse(stranger.body.toString("utf8"));
  assert.match(String(strangerJson.message), /Subscription required/);

  const video = await upload(base, creatorToken, mp4, "locked.mp4", "video/mp4", { visibility: "subscribers" });
  assert.equal(video.status, 201, JSON.stringify(video.body));
  assert.equal(video.body.item.kind, "VIDEO");
  const videoRow = await prisma.media.findFirst({ where: { postId: video.body.item.id } });
  assert.match(videoRow.storageKey, /\/private\/.+\.mp4$/);
  const videoDenied = await binary(`${base}/media/${videoRow.id}/file`, fanToken);
  assert.equal(videoDenied.status, 403);
  assert.equal(videoDenied.body.includes(mp4), false);

  const plan = await prisma.plan.create({
    data: {
      creatorId,
      name: "Mensal",
      description: "Acesso",
      priceCents: 1990,
      durationMonths: 1,
    },
  });
  await prisma.subscription.create({
    data: {
      fanId: fan.body.user.id,
      creatorId,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  const allowed = await binary(`${base}/media/${mediaId}/file`, fanToken);
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get("content-type"), "image/jpeg");
  assert.deepEqual(allowed.body, jpeg);

  const ppv = await upload(base, creatorToken, jpeg, "ppv.jpg", "image/jpeg", {
    visibility: "ppv",
    priceCents: 990,
  });
  assert.equal(ppv.status, 201, JSON.stringify(ppv.body));
  const ppvRow = await prisma.media.findFirst({ where: { postId: ppv.body.item.id } });
  const ppvDenied = await binary(`${base}/media/${ppvRow.id}/file`, fanToken);
  assert.equal(ppvDenied.status, 403);
  await prisma.purchase.create({
    data: {
      buyerId: fan.body.user.id,
      creatorId,
      postId: ppv.body.item.id,
      kind: "POST",
      status: "PAID",
      amountCents: 990,
      idempotencyKey: `ppv-${stamp}`,
    },
  });
  const ppvAllowed = await binary(`${base}/media/${ppvRow.id}/file`, fanToken);
  assert.equal(ppvAllowed.status, 200);
  assert.deepEqual(ppvAllowed.body, jpeg);

  const selfEdit = await request("PATCH", `${base}/media/items/${postId}`, { caption: "Editado pelo criador" }, creatorToken);
  assert.equal(selfEdit.status, 200, JSON.stringify(selfEdit.body));
  const creatorAudit = await prisma.auditLog.count({ where: { action: "media.update", entityId: postId } });
  assert.equal(creatorAudit, 0);

  const admin = await request("POST", `${base}/auth/login`, {
    email: "admin@patrocino.com",
    password: "mimelux123",
  });
  assert.equal(admin.status, 200, JSON.stringify(admin.body));
  const adminToken = admin.body.accessToken;
  const adminEdit = await request(
    "PATCH",
    `${base}/media/items/${postId}`,
    { caption: "Editado pelo admin", visibility: "free" },
    adminToken,
  );
  assert.equal(adminEdit.status, 200, JSON.stringify(adminEdit.body));
  assert.equal(adminEdit.body.item.locked, false);
  const moved = await prisma.media.findFirst({ where: { postId } });
  assert.match(moved.storageKey, /\/public\//);
  assert.equal(JSON.stringify(adminEdit.body).includes(moved.storageKey), false);
  const audit = await prisma.auditLog.findFirst({ where: { action: "media.update", entityId: postId, actorId: admin.body.user.id } });
  assert.ok(audit);

  const publicFile = await binary(`${base}/media/${mediaId}/file`);
  assert.equal(publicFile.status, 200);
  assert.deepEqual(publicFile.body, jpeg);

  const removed = await request("DELETE", `${base}/media/items/${video.body.item.id}`, undefined, adminToken);
  assert.equal(removed.status, 200, JSON.stringify(removed.body));
  const deleteAudit = await prisma.auditLog.findFirst({
    where: { action: "media.delete", entityId: video.body.item.id, actorId: admin.body.user.id },
  });
  assert.ok(deleteAudit);
  const afterDelete = await binary(`${base}/media/${videoRow.id}/file`, creatorToken);
  assert.equal(afterDelete.status, 404);
  const stillListed = await request("GET", `${base}/media/items?creatorId=${creatorId}`, undefined, adminToken);
  assert.equal(stillListed.body.items.some((item) => item.id === video.body.item.id), false);

  const partial = Buffer.concat([jpeg, Buffer.alloc(20, 2)]);
  const session = await request(
    "POST",
    `${base}/media/uploads`,
    { filename: "resume.jpg", mimeType: "image/jpeg", byteSize: partial.length, chunkSize: 64 },
    creatorToken,
  );
  assert.equal(session.status, 201, JSON.stringify(session.body));
  assert.equal(session.body.totalChunks, 2);
  const first = await binaryPut(`${base}/media/uploads/${session.body.id}/chunks/0`, partial.subarray(0, 64), creatorToken);
  assert.equal(first.status, 200, first.body.toString("utf8"));
  const status = await request("GET", `${base}/media/uploads/${session.body.id}`, undefined, creatorToken);
  assert.deepEqual(status.body.received, [0]);
  const early = await request("POST", `${base}/media/uploads/${session.body.id}/complete`, { visibility: "free" }, creatorToken);
  assert.equal(early.status, 400, JSON.stringify(early.body));
  const second = await binaryPut(`${base}/media/uploads/${session.body.id}/chunks/1`, partial.subarray(64), creatorToken);
  assert.equal(second.status, 200, second.body.toString("utf8"));
  const finished = await request(
    "POST",
    `${base}/media/uploads/${session.body.id}/complete`,
    { visibility: "free", caption: "Retomado" },
    creatorToken,
  );
  assert.equal(finished.status, 201, JSON.stringify(finished.body));

  const content = await request("GET", `${base}/posts/${postId}`);
  assert.equal(content.body.item.locked, false);
  assert.equal(JSON.stringify(content.body).includes("storageKey"), false);
  assert.equal(JSON.stringify(content.body).includes(moved.storageKey), false);

  await app.close();
  console.log("api media e2e passed");
}

function baseUrl(app) {
  const { port } = app.getHttpServer().address();
  return `http://127.0.0.1:${port}/v1`;
}

async function request(method, url, body, token) {
  const headers = {};
  if (body !== undefined && !(body instanceof Buffer)) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : body instanceof Buffer ? body : JSON.stringify(body),
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

async function upload(base, token, file, filename, mimeType, extra) {
  const started = await request(
    "POST",
    `${base}/media/uploads`,
    { filename, mimeType, byteSize: file.length },
    token,
  );
  if (started.status !== 201) return started;
  const chunk = await binaryPut(`${base}/media/uploads/${started.body.id}/chunks/0`, file, token);
  if (chunk.status !== 200) {
    return { status: chunk.status, body: JSON.parse(chunk.body.toString("utf8") || "{}") };
  }
  return request("POST", `${base}/media/uploads/${started.body.id}/complete`, extra, token);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
