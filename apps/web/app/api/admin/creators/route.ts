import { proxyApi } from "@/lib/admin-proxy";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const path = query ? `/admin/creators?q=${encodeURIComponent(query)}` : "/admin/creators";
  return proxyApi(request, path);
}
