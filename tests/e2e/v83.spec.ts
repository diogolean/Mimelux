import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const shots = "/opt/cursor/artifacts/screenshots/v8.3";

async function acceptCookies(page: Page) {
  await page.evaluate(() => {
    const current = JSON.parse(localStorage.getItem("mimelux-demo") || "{}");
    localStorage.setItem(
      "mimelux-demo",
      JSON.stringify({ ...current, cookieAccepted: true }),
    );
  });
}

async function frame(page: Page) {
  return page.evaluate(() => {
    const slide = document.querySelector("[data-testid='creator-slideshow']");
    const panel = document.querySelector("aside");
    if (!slide) return null;
    const slideBox = slide.getBoundingClientRect();
    const style = getComputedStyle(slide);
    const panelBox = panel && getComputedStyle(panel).display !== "none" ? panel.getBoundingClientRect() : null;
    return {
      slide: { x: slideBox.x, y: slideBox.y, width: slideBox.width, right: slideBox.right },
      panel: panelBox ? { x: panelBox.x, y: panelBox.y, width: panelBox.width, right: panelBox.right, bottom: panelBox.bottom } : null,
      radius: style.borderRadius,
      overflow: style.overflow,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/auth?route=sign-in");
  await page.evaluate(() => localStorage.clear());
  await acceptCookies(page);
});

test("slideshow matches the hero panel and stays rounded at each breakpoint", async ({ page }) => {
  await mkdir(shots, { recursive: true });

  for (const width of [1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.goto("/auth?route=sign-in");
    await acceptCookies(page);
    await page.reload();
    const box = await frame(page);
    expect(box?.panel, `panel at ${width}`).toBeTruthy();
    expect(Math.abs(box!.slide.x - box!.panel!.x)).toBeLessThan(2);
    expect(Math.abs(box!.slide.right - box!.panel!.right)).toBeLessThan(2);
    expect(Math.abs(box!.slide.width - box!.panel!.width)).toBeLessThan(2);
    const gap = box!.slide.y - box!.panel!.bottom;
    expect(gap).toBeGreaterThanOrEqual(8);
    expect(gap).toBeLessThanOrEqual(20);
    expect(box!.radius).toBe("36px");
    expect(box!.overflow).toBe("hidden");
    expect(box!.scrollWidth).toBeLessThanOrEqual(box!.clientWidth + 1);
  }

  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/auth?route=sign-in");
    const box = await frame(page);
    expect(box?.panel).toBeNull();
    expect(box!.radius).toBe("36px");
    expect(box!.overflow).toBe("hidden");
    expect(box!.slide.x).toBeGreaterThanOrEqual(10);
    expect(box!.slide.right).toBeLessThanOrEqual(width - 10);
    expect(box!.scrollWidth).toBeLessThanOrEqual(box!.clientWidth + 1);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload();
  await page.evaluate(() => {
    const panel = document.querySelector("aside");
    if (!panel) return;
    const top = panel.getBoundingClientRect().bottom + window.scrollY - 320;
    window.scrollTo(0, Math.max(0, top));
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/home-light.png` });

  await page.evaluate(() => localStorage.setItem("theme", "dark"));
  await page.reload();
  await page.evaluate(() => {
    const panel = document.querySelector("aside");
    if (!panel) return;
    const top = panel.getBoundingClientRect().bottom + window.scrollY - 320;
    window.scrollTo(0, Math.max(0, top));
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/home-dark.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.getByTestId("creator-slideshow").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shots}/home-mobile.png` });
});
