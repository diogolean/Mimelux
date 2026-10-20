import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "patrocino_access";
export const REFRESH_COOKIE = "patrocino_refresh";

function secureCookie() {
  return process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
}

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: secureCookie(),
};

export function applyAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: 60 * 15 });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...base, maxAge: 0 });
}
