import { NextResponse } from "next/server";
import { apiAuth } from "@/lib/api-auth";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const destination = new URL("/auth?route=sign-in", request.url);
  if (!token) {
    destination.searchParams.set("verified", "0");
    return NextResponse.redirect(destination);
  }
  const { response } = await apiAuth("/auth/verify-email", { token });
  destination.searchParams.set("verified", response.ok ? "1" : "0");
  return NextResponse.redirect(destination);
}
