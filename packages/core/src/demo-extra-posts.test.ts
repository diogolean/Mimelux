import { describe, expect, it } from "vitest";
import { ASSET_VERSION } from "./assets";
import {
  allDemoExtraPosts,
  demoExtraCreators,
  demoExtraMediaPath,
  demoExtraPostPublishedAt,
  demoExtraPostsFor,
} from "./demo-extra-posts";
import { demoPostPublishedAt, initialCreators, initialPosts, launchPostPublishedAt } from "./initial-creators";

describe("demo extra posts", () => {
  it("adds ten posts per demo creator between the old demo posts and every launch post", () => {
    const posts = allDemoExtraPosts();
    expect(demoExtraCreators).toHaveLength(16);
    expect(posts).toHaveLength(160);
    const oldestLaunch = Math.min(
      ...initialCreators.map((creator, index) => launchPostPublishedAt(index, initialPosts(creator).length - 1).getTime()),
    );
    for (const [creatorIndex, creator] of demoExtraCreators.entries()) {
      const own = demoExtraPostsFor(creator.slug);
      expect(own).toHaveLength(10);
      expect(own.filter((post) => post.free)).toHaveLength(3);
      for (const [index, post] of own.entries()) {
        expect(post.file).toBe(`${String(index + 1).padStart(3, "0")}.jpg`);
        expect(post.path).toBe(demoExtraMediaPath(creator.slug, post.file));
        expect(post.path).toBe(`/media/models/demo/${creator.slug}/${post.file}?v=${ASSET_VERSION}`);
        expect(post.likes).toBeGreaterThanOrEqual(10);
        expect(post.likes).toBeLessThanOrEqual(400);
        expect(post.caption.length).toBeGreaterThan(10);
        expect(post.publishedAt.getTime()).toBe(demoExtraPostPublishedAt(creatorIndex, index).getTime());
        expect(post.publishedAt.getTime()).toBeGreaterThan(demoPostPublishedAt(0).getTime());
        expect(post.publishedAt.getTime()).toBeLessThan(oldestLaunch);
      }
      expect(own[0]!.publishedAt.getTime()).toBeGreaterThan(own[9]!.publishedAt.getTime());
    }
    const newestExtra = demoExtraPostPublishedAt(0, 0).getTime();
    const oldestExtra = demoExtraPostPublishedAt(demoExtraCreators.length - 1, 9).getTime();
    expect(newestExtra).toBeGreaterThan(oldestExtra);
    expect(demoExtraPostsFor("luna-ferraz")).toEqual(demoExtraPostsFor("luna-ferraz"));
  });
});
