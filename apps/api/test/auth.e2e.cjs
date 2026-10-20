const assert = require("node:assert/strict");

process.env.DATABASE_URL ??= "postgresql://mimelux:mimelux_dev@127.0.0.1:5432/mimelux?schema=public";
process.env.AUTH_RATE_LIMIT = "4";
process.env.AUTH_RATE_TTL_MS = "60000";
process.env.JWT_ACCESS_SECRET ??= "local-access-only";
process.env.JWT_REFRESH_SECRET ??= "local-refresh-only";
process.env.RESEND_API_KEY = "";

require("reflect-metadata");
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("v1");
  await app.listen(0, "127.0.0.1");
  const { port } = app.getHttpServer().address();
  const base = `http://127.0.0.1:${port}/v1`;
  const email = `api.${Date.now()}@mimelux.test`;
  const password = "mimelux123";

  const register = await request(`${base}/auth/register`, {
    email,
    password,
    name: "API Test",
    role: "FAN",
  });
  assert.equal(register.status, 201, JSON.stringify(register.body));
  assert.equal(register.body.user.emailVerified, false);
  assert.ok(register.body.accessToken);
  const firstRefresh = register.body.refreshToken;

  const login = await request(`${base}/auth/login`, { email, password });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  assert.notEqual(login.body.refreshToken, firstRefresh);

  const rotated = await request(`${base}/auth/refresh`, { refreshToken: login.body.refreshToken });
  assert.equal(rotated.status, 200, JSON.stringify(rotated.body));
  assert.notEqual(rotated.body.refreshToken, login.body.refreshToken);

  const reused = await request(`${base}/auth/refresh`, { refreshToken: login.body.refreshToken });
  assert.equal(reused.status, 401);

  const logout = await request(`${base}/auth/logout`, { refreshToken: rotated.body.refreshToken });
  assert.equal(logout.status, 200);
  const afterLogout = await request(`${base}/auth/refresh`, { refreshToken: rotated.body.refreshToken });
  assert.equal(afterLogout.status, 401);

  let limited = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await request(`${base}/auth/login`, { email: "fan@mimelux.com.br", password: "wrong-password" });
    if (response.status === 429) limited += 1;
  }
  assert.ok(limited >= 1, "expected the auth rate limit to return 429");

  await app.close();
  console.log("api auth e2e passed");
}

async function request(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, body: payload };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
