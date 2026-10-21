import { proxyApi } from "@/lib/admin-proxy";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyApi(request, `/subscriptions/${id}/cancel`, { method: "POST", body: "{}" });
}
