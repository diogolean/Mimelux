import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/opt/cursor/artifacts/screenshots";
const widths = [360, 390, 768, 1024, 1440] as const;

async function prepare(page: Page, theme: "light" | "dark") {
  await page.goto("/auth?route=sign-in");
  await page.evaluate((nextTheme) => {
    localStorage.setItem(
      "mimelux-demo",
      JSON.stringify({
        signedIn: true,
        role: "fan",
        coachSeen: true,
        demoMode: true,
        verified: true,
        onboarding: true,
      }),
    );
    localStorage.setItem("theme", nextTheme);
  }, theme);
  await page.goto("/topcreators?tab=top-creators");
  await expect(page.getByRole("heading", { name: "Em alta", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /light/);
  await expect(page.getByTestId("ranking-avatar").first()).toBeVisible();
}

test("ranking avatars stay in front of covers across themes and widths", async ({
  page,
}) => {
  await mkdir(artifactDir, { recursive: true });

  for (const theme of ["light", "dark"] as const) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: width >= 1024 ? 900 : 844 });
      await prepare(page, theme);

      const avatar = page.getByTestId("ranking-avatar").first();
      await expect(avatar).toBeVisible();
      const card = page.getByTestId("ranking-card").first();
      const cover = card.locator("img").first();
      const avatarBox = await avatar.boundingBox();
      const coverBox = await cover.boundingBox();
      expect(avatarBox, `${theme} ${width}`).toBeTruthy();
      expect(coverBox, `${theme} ${width}`).toBeTruthy();
      const expected = width < 640 ? 80 : width < 1024 ? 96 : 112;
      expect(avatarBox!.width).toBeGreaterThanOrEqual(expected - 1);
      expect(avatarBox!.y).toBeLessThan(coverBox!.y + coverBox!.height - 8);
      expect(avatarBox!.y + avatarBox!.height).toBeGreaterThan(coverBox!.y + coverBox!.height);

      const inFront = await avatar.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const target = document.elementFromPoint(
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height * 0.2,
        );
        return target === element;
      });
      expect(inFront, `avatar covered at ${theme} ${width}px`).toBe(true);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, `overflow at ${theme} ${width}px`).toBe(false);

      await page.screenshot({
        path: `${artifactDir}/em-alta-${theme}-${width}.png`,
      });
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page, "light");
  await page.goto("/busca");
  const searchAvatar = page.getByTestId("search-avatar").first();
  await expect(searchAvatar).toBeVisible();
  expect(await searchAvatar.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + 8) === element;
  })).toBe(true);

  await page.goto("/feed");
  const feedAvatar = page.getByTestId("feed-avatar").first();
  await feedAvatar.scrollIntoViewIfNeeded();
  expect(await feedAvatar.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height * 0.75) === element;
  })).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/creator/lunaferraz");
  const profileAvatar = page.getByTestId("profile-avatar");
  await expect(profileAvatar).toBeVisible();
  expect(await profileAvatar.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + 12) === element;
  })).toBe(true);
});
