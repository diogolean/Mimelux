import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api-auth";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/session-cookies";

export async function POST(request: Request) {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    await apiAuth("/auth/logout", { refreshToken: refresh }, request).catch(() => undefined);
  }
  const next = NextResponse.json({ loggedOut: true });
  clearAuthCookies(next);
  return next;
}
