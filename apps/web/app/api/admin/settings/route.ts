import { proxyApi } from "@/lib/admin-proxy";

export async function GET(request: Request) {
  return proxyApi(request, "/admin/settings");
}

export async function PATCH(request: Request) {
  const body = await request.text();
  return proxyApi(request, "/admin/settings", { method: "PATCH", body });
}
