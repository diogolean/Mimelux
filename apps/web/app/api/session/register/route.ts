import { NextResponse } from "next/server";
import type { AccountRole } from "@mimelux/core";
import { apiAuth, authErrorMessage, toApiRole, toSessionUser } from "@/lib/api-auth";
import { applyAuthCookies } from "@/lib/session-cookies";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
    role?: AccountRole;
  } | null;
  const { response, data } = await apiAuth("/auth/register", {
    name: body?.name ?? "",
    email: body?.email ?? "",
    password: body?.password ?? "",
    role: toApiRole(body?.role ?? "fan"),
  });
  if (!response.ok || !data.user || !data.accessToken || !data.refreshToken) {
    return NextResponse.json(
      { message: authErrorMessage(response.status, "Não foi possível criar a conta.") },
      { status: response.status || 500 },
    );
  }
  const next = NextResponse.json({ user: toSessionUser(data.user) });
  applyAuthCookies(next, { accessToken: data.accessToken, refreshToken: data.refreshToken });
  return next;
}
