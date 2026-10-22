import { proxyMediaJson } from "@/lib/media-proxy";

export async function GET(request: Request) {
  const creatorId = new URL(request.url).searchParams.get("creatorId") ?? "";
  const path = creatorId ? `/media/items?creatorId=${encodeURIComponent(creatorId)}` : "/media/items";
  return proxyMediaJson(request, path);
}
