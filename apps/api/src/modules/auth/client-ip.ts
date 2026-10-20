import { timingSafeEqual } from "node:crypto";

export const CLIENT_IP_HEADER = "x-patrocino-client-ip";
export const PROXY_SECRET_HEADER = "x-patrocino-proxy-secret";

const ipToken = /^[0-9a-fA-F:.]+$/;

type HeaderRequest = {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

export function clientIpToken(value: string | undefined): string | undefined {
  const token = value?.split(",")[0]?.trim() ?? "";
  if (!token || token.length > 64 || !ipToken.test(token)) return undefined;
  return token;
}

function header(req: HeaderRequest, name: string): string | undefined {
  const value = req.headers?.[name];
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : undefined;
}

function secretsMatch(expected: string, provided: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function resolveClientIp(req: HeaderRequest): string {
  const secret = process.env.INTERNAL_PROXY_SECRET;
  const provided = header(req, PROXY_SECRET_HEADER);
  if (secret && provided && secretsMatch(secret, provided)) {
    const forwarded = clientIpToken(header(req, CLIENT_IP_HEADER));
    if (forwarded) return forwarded;
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}
