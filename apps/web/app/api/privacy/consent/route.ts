import { proxyApi } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyApi(request, "/privacy/consent", { method: "POST", body });
}
