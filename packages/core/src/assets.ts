export const ASSET_VERSION = "2";

const versionedPrefixes = [
  "/media/generated/",
  "/media/avatars/",
  "/media/covers/",
  "/media/posts/",
  "/media/models/",
];

function pathnameOf(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  const withoutHash = url.split("#")[0] ?? url;
  return withoutHash.split("?")[0] ?? withoutHash;
}

export function withAssetVersion(url: string) {
  const hashAt = url.indexOf("#");
  const hash = hashAt >= 0 ? url.slice(hashAt) : "";
  const withoutHash = hashAt >= 0 ? url.slice(0, hashAt) : url;
  const queryAt = withoutHash.indexOf("?");
  const path = queryAt >= 0 ? withoutHash.slice(0, queryAt) : withoutHash;
  const query = queryAt >= 0 ? withoutHash.slice(queryAt + 1) : "";
  const pathname = pathnameOf(path);
  if (!versionedPrefixes.some((prefix) => pathname.startsWith(prefix))) return url;
  const params = new URLSearchParams(query);
  params.set("v", ASSET_VERSION);
  return `${path}?${params.toString()}${hash}`;
}
