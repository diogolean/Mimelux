import { proxyApi as proxyAdmin } from "@/lib/admin-proxy";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyAdmin(request, `/admin/users/${id}/reset-password`, { method: "POST", body: "{}" });
}
