const ipToken = /^[0-9a-fA-F:.]+$/;

export const CLIENT_IP_HEADER = "x-patrocino-client-ip";
export const PROXY_SECRET_HEADER = "x-patrocino-proxy-secret";

function firstIp(value: string | null): string | undefined {
  const token = value?.split(",")[0]?.trim() ?? "";
  if (!token || token.length > 64 || !ipToken.test(token)) return undefined;
  return token;
}

export function clientIpFrom(headers: { get(name: string): string | null }): string | undefined {
  return firstIp(headers.get("cf-connecting-ip")) ?? firstIp(headers.get("x-forwarded-for"));
}

export function upstreamAuthHeaders(request?: { headers: { get(name: string): string | null } }): Record<string, string> {
  const headers: Record<string, string> = {};
  const ip = request ? clientIpFrom(request.headers) : undefined;
  if (ip) headers[CLIENT_IP_HEADER] = ip;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (secret) headers[PROXY_SECRET_HEADER] = secret;
  return headers;
}
