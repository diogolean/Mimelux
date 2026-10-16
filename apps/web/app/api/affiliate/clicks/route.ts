import { NextResponse } from "next/server";
import { z } from "zod";
import { isSuspiciousClick } from "@/lib/affiliates";

const schema = z.object({
  code: z.string().min(2).max(40),
  slug: z.string().min(2).max(60),
  creatorId: z.string().min(2).max(80),
  subId: z.string().max(40).optional(),
  locale: z.string().max(12).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_click" }, { status: 400 });
  }
  const userAgent = request.headers.get("user-agent");
  const subId = parsed.data.subId || "direct";
  const suspicious = isSuspiciousClick(subId, userAgent);
  const click = {
    id: `clk_${crypto.randomUUID()}`,
    ...parsed.data,
    subId,
    suspicious,
    createdAt: new Date().toISOString(),
    simulated: true as const,
  };
  const response = NextResponse.json({ click });
  response.cookies.set({
    name: "mimelux_attr",
    value: JSON.stringify({
      code: click.code,
      slug: click.slug,
      subId,
      clickId: click.id,
      clickedAt: click.createdAt,
    }),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
