import { proxyMediaJson } from "@/lib/media-proxy";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyMediaJson(request, `/media/uploads/${encodeURIComponent(id)}/complete`, {
    method: "POST",
    body: await request.text(),
  });
}
