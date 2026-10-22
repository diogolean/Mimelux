import { describe, expect, it } from "vitest";
import { ASSET_VERSION, withAssetVersion } from "./assets";
import { modelMediaPath } from "./initial-creators";

describe("asset version", () => {
  it("adds one cache buster to public demo and model media", () => {
    for (const url of [
      "/media/generated/creator-luna-ferraz-avatar.jpg",
      "/media/avatars/marina.jpg",
      "/media/covers/sofia.jpg",
      "/media/posts/marina-1.jpg",
      "/media/models/albina-schneider/001.jpg",
    ]) {
      expect(withAssetVersion(url)).toBe(`${url}?v=${ASSET_VERSION}`);
    }
    expect(modelMediaPath("albina-schneider", "002.jpg")).toBe(
      `/media/models/albina-schneider/002.jpg?v=${ASSET_VERSION}`,
    );
  });

  it("is idempotent and leaves other urls alone", () => {
    const versioned = withAssetVersion("/media/generated/post-01.jpg?v=1");
    expect(versioned).toBe(`/media/generated/post-01.jpg?v=${ASSET_VERSION}`);
    expect(withAssetVersion(versioned)).toBe(versioned);
    expect(withAssetVersion("/og-patrocino.png")).toBe("/og-patrocino.png");
    expect(withAssetVersion("uploads/creator/public/photo.jpg")).toBe("uploads/creator/public/photo.jpg");
    const kept = withAssetVersion("/media/posts/bia-1.jpg?x=1#top");
    expect(kept.startsWith("/media/posts/bia-1.jpg?")).toBe(true);
    expect(kept.endsWith("#top")).toBe(true);
    expect(new URLSearchParams(kept.slice(kept.indexOf("?") + 1, kept.indexOf("#"))).get("v")).toBe(ASSET_VERSION);
    expect(new URLSearchParams(kept.slice(kept.indexOf("?") + 1, kept.indexOf("#"))).get("x")).toBe("1");
  });
});
