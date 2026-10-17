import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const shots = "/opt/cursor/artifacts/screenshots";

async function shot(page: Page, name: string) {
  await mkdir(shots, { recursive: true });
  await page.screenshot({ path: `${shots}/${name}.png` });
}

async function acceptCookies(page: Page) {
  await page.evaluate(() => {
    const current = JSON.parse(localStorage.getItem("mimelux-demo") || "{}");
    localStorage.setItem("mimelux-demo", JSON.stringify({ ...current, cookieAccepted: true }));
  });
}

async function topWithin(locator: Locator, height: number, fully = true) {
  const box = await locator.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(fully ? box!.y + box!.height : box!.y).toBeLessThanOrEqual(height + 1);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/auth?route=sign-in");
  await page.evaluate(() => localStorage.clear());
});

test("plans and special request stay inside the first 1366 viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/creator/lunaferraz");
  await page.evaluate(() => window.scrollTo(0, 0));
  const plan = page.getByRole("link", { name: /1 mês/ });
  const promo = page.getByRole("link", { name: /3 meses/ });
  const special = page.getByRole("button", { name: "Pedido especial" });
  const post = page.getByTestId("profile-post").first();
  await topWithin(plan, 768);
  await topWithin(promo, 768);
  await topWithin(special, 768);
  await topWithin(post, 768, false);
  await shot(page, "v6-profile-desktop-1366");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await topWithin(plan, 900);
  await topWithin(special, 900);
  await topWithin(post, 900, false);
});

test("captures the shifted home and the tighter profile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await acceptCookies(page);
  await page.goto("/auth?route=sign-in");
  await page.getByTestId("creator-hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.getByTestId("creator-slideshow")).toBeVisible();
  const slideshow = await page.getByTestId("creator-slideshow").boundingBox();
  expect(slideshow).toBeTruthy();
  expect((slideshow!.x + slideshow!.width)).toBeGreaterThan(1400);
  await shot(page, "v6-home-hero-desktop");
  await page.getByTestId("monetize-section").getByRole("heading", { name: "Monetize com a gente, do seu jeito" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, "v6-home-models-desktop");
  await page.getByTestId("how-it-works").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(page.getByRole("heading", { name: "Como funciona" })).toBeVisible();
  await expect(page.getByText("em breve")).toBeVisible();
  await expect(page.getByText("Pix").first()).toBeVisible();
  await shot(page, "v6-home-how-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.getByTestId("creator-hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "v6-home-hero-mobile");
  await page.getByTestId("monetize-section").getByRole("heading", { name: "Monetize com a gente, do seu jeito" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, "v6-home-models-mobile");
  await page.getByTestId("how-it-works").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, "v6-home-how-mobile");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow, "home overflow at 390px").toBe(false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(400);
  await page.goto("/creator/lunaferraz");
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "v6-profile-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.getByTestId("profile-avatar").scrollIntoViewIfNeeded();
  const profileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(profileOverflow, "profile overflow at 390px").toBe(false);
  await shot(page, "v6-profile-mobile");
});
