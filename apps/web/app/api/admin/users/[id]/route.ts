import { proxyApi as proxyAdmin } from "@/lib/admin-proxy";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyAdmin(request, `/admin/users/${id}`);
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.text();
  return proxyAdmin(request, `/admin/users/${id}`, { method: "PATCH", body });
}

export async function DELETE(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyAdmin(request, `/admin/users/${id}`, { method: "DELETE" });
}
