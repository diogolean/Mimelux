import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const shots = "/opt/cursor/artifacts/screenshots/v8.2";
const spark = "M23.2 13.6";
const heart = "M22.4 15.2";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth?route=sign-in");
  await page.evaluate(() => localStorage.clear());
});

test("Centelha is the default mark on login, home, and the favicon", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mkdir(shots, { recursive: true });
  await page.evaluate(() => {
    const current = JSON.parse(localStorage.getItem("mimelux-demo") || "{}");
    localStorage.setItem(
      "mimelux-demo",
      JSON.stringify({ ...current, cookieAccepted: true }),
    );
    localStorage.setItem("theme", "dark");
  });
  await page.goto("/auth?route=sign-in");
  await expect(page.locator("aside h2")).toHaveText("Monetize com a gente, do seu jeito");
  const badge = await page.getByTestId("auth-mark").locator("svg").innerHTML();
  expect(badge).toContain(spark);
  expect(badge).not.toContain(heart);
  const wordmark = await page.locator("header, main").locator("svg").first().innerHTML();
  expect(wordmark).toContain(spark);
  await expect(page.getByRole("button", { name: "Entendi" })).toHaveCount(0);
  await page.screenshot({ path: `${shots}/login.png` });

  await page.getByTestId("creator-hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${shots}/home.png` });
  const footer = await page.locator("footer svg").first().innerHTML();
  expect(footer).toContain(spark);
  expect(footer).not.toContain(heart);

  await page.goto("/marca");
  await expect(page.getByText("Centelha · padrão").first()).toBeVisible();
  await expect(page.getByText("Apoio · alternativa").first()).toBeVisible();
  await expect(page.getByTestId("logo-options-light").getByText("A ·")).toBeVisible();
  const icon = await page.getByAltText("Favicon 64").getAttribute("src");
  expect(icon).toBe("/icon.svg");
  const svg = await page.request.get("/icon.svg");
  expect(svg.ok()).toBeTruthy();
  const body = await svg.text();
  expect(body).toContain(spark);
  expect(body).not.toContain(heart);
  await page.getByTestId("favicon-preview").screenshot({ path: `${shots}/favicon-preview.png` });
});
