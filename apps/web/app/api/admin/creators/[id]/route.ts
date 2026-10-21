import { proxyApi } from "@/lib/admin-proxy";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.text();
  return proxyApi(request, `/admin/creators/${id}`, { method: "PATCH", body });
}
