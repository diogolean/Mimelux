import { describe, expect, it } from "vitest";
import {
  demoCreatorCreatedAt,
  demoPostPublishedAt,
  imageFile,
  initialCreatorPosts,
  initialCreators,
  initialPosts,
  launchCreatorCreatedAt,
  launchPostPublishedAt,
  modelMediaPath,
} from "./initial-creators";

describe("initial creators", () => {
  it("keeps nine house catalogs with modest stats and local prices", () => {
    expect(initialCreators).toHaveLength(9);
    const slugs = initialCreators.map((creator) => creator.slug);
    expect(new Set(slugs).size).toBe(9);
    for (const creator of initialCreators) {
      expect(creator.displayName).not.toMatch(/ai/i);
      expect(creator.slug).not.toMatch(/ai/i);
      expect(creator.bio).not.toMatch(/\bAI\b/);
      expect(creator.followers).toBeGreaterThanOrEqual(800);
      expect(creator.followers).toBeLessThanOrEqual(12_000);
      expect(creator.subscribers).toBeGreaterThanOrEqual(15);
      expect(creator.subscribers).toBeLessThanOrEqual(400);
      if (creator.market === "BR") {
        expect(creator.monthlyPriceCents).toBeGreaterThanOrEqual(2490);
        expect(creator.monthlyPriceCents).toBeLessThanOrEqual(4990);
      } else {
        expect(creator.monthlyPriceCents).toBeGreaterThanOrEqual(990);
        expect(creator.monthlyPriceCents).toBeLessThanOrEqual(1990);
      }
      const posts = initialPosts(creator);
      expect(posts).toHaveLength(creator.count - 2);
      expect(modelMediaPath(creator.slug, imageFile(1))).not.toBe(modelMediaPath(creator.slug, imageFile(2)));
      const free = posts.filter((post) => post.free).length;
      expect(free / posts.length).toBeGreaterThan(0.2);
      expect(free / posts.length).toBeLessThan(0.3);
      for (const post of posts) {
        expect(post.likes).toBeGreaterThanOrEqual(20);
        expect(post.likes).toBeLessThanOrEqual(900);
        expect(post.path.startsWith(`/media/models/${creator.slug}/`)).toBe(true);
        expect(post.path).toContain("?v=2");
      }
    }
  });

  it("lists the launch catalog ahead of the demo catalog by time", () => {
    const newestLaunch = launchCreatorCreatedAt(0).getTime();
    const oldestLaunch = launchCreatorCreatedAt(initialCreators.length - 1).getTime();
    const newestDemo = demoCreatorCreatedAt(0).getTime();
    expect(newestLaunch).toBeGreaterThan(oldestLaunch);
    expect(oldestLaunch).toBeGreaterThan(newestDemo);
    expect(launchPostPublishedAt(0, 0).getTime()).toBeGreaterThan(launchPostPublishedAt(0, 1).getTime());
    expect(launchPostPublishedAt(initialCreators.length - 1, 200).getTime()).toBeGreaterThan(demoPostPublishedAt(0).getTime());
  });

  it("uses the first photo as the avatar and the second as the cover", () => {
    const amanda = initialCreators.find((creator) => creator.slug === "amanda-ribeiro");
    expect(amanda?.count).toBe(135);
    expect(imageFile(1)).toBe("001.jpg");
    expect(imageFile(2)).toBe("002.jpg");
    expect(initialCreatorPosts().some((post) => post.file === "001.jpg" || post.file === "002.jpg")).toBe(false);
  });
});
