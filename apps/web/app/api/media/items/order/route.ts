import { proxyMediaJson } from "@/lib/media-proxy";

export async function PATCH(request: Request) {
  return proxyMediaJson(request, "/media/items/order", { method: "PATCH", body: await request.text() });
}
