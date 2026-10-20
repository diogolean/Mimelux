import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiBase } from "@/lib/api-auth";
import { upstreamAuthHeaders } from "@/lib/client-ip";
import { ACCESS_COOKIE } from "@/lib/session-cookies";

export async function proxyAdmin(request: Request, path: string, init?: { method?: string; body?: string }) {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  if (!access) return NextResponse.json({ message: "Missing access token" }, { status: 401 });
  const response = await fetch(`${apiBase()}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      authorization: `Bearer ${access}`,
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...upstreamAuthHeaders(request),
    },
    body: init?.body,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
