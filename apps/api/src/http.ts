import type { INestApplication } from "@nestjs/common";

export function applyTrustProxy(app: INestApplication) {
  const value = process.env.TRUST_PROXY;
  if (!value || value === "false" || value === "0") return;
  const setting = value === "true" ? true : /^\d+$/.test(value) ? Number(value) : value;
  app.getHttpAdapter().getInstance().set("trust proxy", setting);
}
