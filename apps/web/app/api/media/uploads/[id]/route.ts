import { proxyMediaJson } from "@/lib/media-proxy";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyMediaJson(request, `/media/uploads/${encodeURIComponent(id)}`);
}
