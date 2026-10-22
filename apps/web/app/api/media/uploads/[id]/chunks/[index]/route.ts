import { proxyMediaChunk } from "@/lib/media-proxy";

type Context = { params: Promise<{ id: string; index: string }> };

export async function PUT(request: Request, context: Context) {
  const { id, index } = await context.params;
  return proxyMediaChunk(
    request,
    `/media/uploads/${encodeURIComponent(id)}/chunks/${encodeURIComponent(index)}`,
  );
}
