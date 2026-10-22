import { describe, expect, it } from "vitest";
import { ASSET_VERSION } from "./assets";
import {
  allDemoExtraPosts,
  demoExtraCreators,
  demoExtraMediaPath,
  demoExtraPostPublishedAt,
  demoExtraPostsFor,
  demoVideoMediaId,
  demoWave2PublishedAt,
} from "./demo-extra-posts";
import { demoPostPublishedAt, initialCreators, initialPosts, launchPostPublishedAt } from "./initial-creators";

describe("demo extra posts", () => {
  it("keeps the july photos and adds five images plus one video before every launch post", () => {
    const posts = allDemoExtraPosts();
    expect(demoExtraCreators).toHaveLength(16);
    expect(posts).toHaveLength(256);
    const oldestLaunch = Math.min(
      ...initialCreators.map((creator, index) => launchPostPublishedAt(index, initialPosts(creator).length - 1).getTime()),
    );
    const newestJuly = demoExtraPostPublishedAt(0, 0).getTime();
    let lockedVideos = 0;
    let freeVideos = 0;
    for (const [creatorIndex, creator] of demoExtraCreators.entries()) {
      const own = demoExtraPostsFor(creator.slug);
      expect(own).toHaveLength(16);
      const july = own.filter((post) => post.kind === "image" && Number(post.file.slice(0, 3)) <= 10);
      expect(july).toHaveLength(10);
      expect(july.filter((post) => post.free)).toHaveLength(3);
      for (const [index, post] of july.entries()) {
        expect(post.file).toBe(`${String(index + 1).padStart(3, "0")}.jpg`);
        expect(post.path).toBe(demoExtraMediaPath(creator.slug, post.file));
        expect(post.path).toBe(`/media/models/demo/${creator.slug}/${post.file}?v=${ASSET_VERSION}`);
        expect(post.playback).toBe(post.path);
        expect(post.likes).toBeGreaterThanOrEqual(10);
        expect(post.likes).toBeLessThanOrEqual(400);
        expect(post.caption.length).toBeGreaterThan(10);
        expect(post.publishedAt.getTime()).toBe(demoExtraPostPublishedAt(creatorIndex, index).getTime());
        expect(post.publishedAt.getTime()).toBeGreaterThan(demoPostPublishedAt(0).getTime());
        expect(post.publishedAt.getTime()).toBeLessThan(oldestLaunch);
      }
      expect(july[0]!.publishedAt.getTime()).toBeGreaterThan(july[9]!.publishedAt.getTime());

      const wave = own.filter((post) => post.kind === "image" && Number(post.file.slice(0, 3)) >= 11);
      expect(wave.map((post) => post.file)).toEqual(["011.jpg", "012.jpg", "013.jpg", "014.jpg", "015.jpg"]);
      expect(wave.filter((post) => post.free)).toHaveLength(2);
      for (const [index, post] of wave.entries()) {
        expect(post.path).toBe(`/media/models/demo/${creator.slug}/${post.file}?v=${ASSET_VERSION}`);
        expect(post.likes).toBeGreaterThanOrEqual(10);
        expect(post.likes).toBeLessThanOrEqual(400);
        expect(post.caption.length).toBeGreaterThan(10);
        expect(post.publishedAt.getTime()).toBe(demoWave2PublishedAt(creatorIndex, index + 1).getTime());
        expect(post.publishedAt.getTime()).toBeGreaterThan(newestJuly);
        expect(post.publishedAt.getTime()).toBeLessThan(oldestLaunch);
      }

      const video = own.find((post) => post.kind === "video");
      expect(video?.file).toBe("v001.mp4");
      expect(video?.path).toBe(`/media/models/demo/${creator.slug}/v001.mp4?v=${ASSET_VERSION}`);
      expect(video?.poster).toBe(`/media/models/demo/${creator.slug}/v001.jpg?v=${ASSET_VERSION}`);
      expect(video?.mediaId).toBe(demoVideoMediaId(creator.slug));
      expect(video?.durationMs).toBe(6040);
      expect(video?.width).toBe(480);
      expect(video?.height).toBe(640);
      expect(video?.caption.length).toBeGreaterThan(10);
      expect(video?.likes).toBeGreaterThanOrEqual(10);
      expect(video?.likes).toBeLessThanOrEqual(400);
      expect(video?.publishedAt.getTime()).toBe(demoWave2PublishedAt(creatorIndex, 0).getTime());
      expect(video!.publishedAt.getTime()).toBeGreaterThan(newestJuly);
      expect(video!.publishedAt.getTime()).toBeLessThan(oldestLaunch);
      if (creatorIndex % 2 === 1) {
        expect(video?.free).toBe(true);
        expect(video?.playback).toBe(video?.path);
        freeVideos += 1;
      } else {
        expect(video?.free).toBe(false);
        expect(video?.playback).toBe(`/api/media/file/${demoVideoMediaId(creator.slug)}`);
        expect(video?.playback.includes(".mp4")).toBe(false);
        lockedVideos += 1;
      }
    }
    expect(lockedVideos).toBe(8);
    expect(freeVideos).toBe(8);
    expect(demoWave2PublishedAt(0, 0).getTime()).toBeGreaterThan(newestJuly);
    expect(demoWave2PublishedAt(0, 0).getTime()).toBeLessThan(oldestLaunch);
  });
});
