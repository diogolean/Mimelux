import { proxyAdmin } from "@/lib/admin-proxy";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const path = query ? `/admin/users?q=${encodeURIComponent(query)}` : "/admin/users";
  return proxyAdmin(request, path);
}
