import { proxyMediaJson } from "@/lib/media-proxy";

export async function POST(request: Request) {
  return proxyMediaJson(request, "/media/uploads", { method: "POST", body: await request.text() });
}
