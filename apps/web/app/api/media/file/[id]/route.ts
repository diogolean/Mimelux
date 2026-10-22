import { proxyMediaFile } from "@/lib/media-proxy";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyMediaFile(request, id);
}
