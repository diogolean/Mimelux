import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const shots = "/opt/cursor/artifacts/screenshots";

async function shot(page: Page, name: string, fullPage = false) {
  await mkdir(shots, { recursive: true });
  await page.screenshot({ path: `${shots}/${name}.png`, fullPage });
}

async function acceptCookies(page: Page) {
  await page.evaluate(() => {
    const current = JSON.parse(localStorage.getItem("mimelux-demo") || "{}");
    localStorage.setItem("mimelux-demo", JSON.stringify({ ...current, cookieAccepted: true }));
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/auth?route=sign-in");
  await page.evaluate(() => localStorage.clear());
});

test("role switch stays off for visitors and routes creator or affiliate", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/auth?route=sign-up");
  const toggle = page.getByRole("switch", { name: "Criador ou afiliado" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await page.getByLabel("Seu nome").fill("Visitante V5");
  await page.getByLabel("Email ou CPF").fill("visitante.v5@mimelux.test");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/verificacao/);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Verificar e continuar" }).click();
  await page.getByRole("button", { name: /Pular tutorial/ }).click();
  await expect(page).toHaveURL(/\/topcreators/);

  await page.evaluate(() => localStorage.clear());
  await acceptCookies(page);
  await page.goto("/auth?route=sign-up");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await page.getByRole("button", { name: "Criador", exact: true }).click();
  await page.getByLabel("Seu nome").fill("Criador V5");
  await page.getByLabel("Email ou CPF").fill("criador.v5@mimelux.test");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Verificar e continuar" }).click();
  await page.getByRole("button", { name: /Pular tutorial/ }).click();
  await expect(page).toHaveURL(/\/painel$/);

  await page.evaluate(() => localStorage.clear());
  await acceptCookies(page);
  await page.goto("/auth?route=sign-up&role=affiliate");
  await expect(page.getByRole("switch", { name: "Criador ou afiliado" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("button", { name: "Afiliado", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await expect(page.getByRole("button", { name: "Afiliado", exact: true })).toHaveCount(0);
});

test("captures condensed home, login switch, and profile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await acceptCookies(page);
  await page.goto("/auth?route=sign-in");
  await expect(page.getByRole("heading", { name: "Que bom ter você aqui." })).toBeVisible();
  await shot(page, "v5-home-login-desktop");

  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await expect(page.getByRole("button", { name: "Criador", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Afiliado", exact: true })).toBeVisible();
  await shot(page, "v5-login-switch-on-desktop");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await expect(page.getByRole("button", { name: "Criador", exact: true })).toHaveCount(0);
  await shot(page, "v5-login-switch-off-desktop");

  await page.getByTestId("creator-hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.getByRole("heading", { name: "Transforme atenção em renda." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Começar" })).toBeVisible();
  await expect(page.getByTestId("creator-slideshow")).toBeVisible();
  await shot(page, "v5-home-hero-desktop");
  await page.getByTestId("monetize-section").getByRole("heading", { name: "Monetize com a gente, do seu jeito" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, "v5-home-models-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await acceptCookies(page);
  await page.goto("/auth?route=sign-in");
  const heading = await page.getByRole("heading", { name: "Que bom ter você aqui." }).boundingBox();
  expect(heading?.x ?? 0).toBeGreaterThanOrEqual(8);
  expect((heading?.x ?? 0) + (heading?.width ?? 0)).toBeLessThanOrEqual(392);
  await shot(page, "v5-home-login-mobile");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await shot(page, "v5-login-switch-on-mobile");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await shot(page, "v5-login-switch-off-mobile");
  await page.getByTestId("creator-hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "v5-home-hero-mobile");
  await page.getByTestId("monetize-section").getByRole("heading", { name: "Monetize com a gente, do seu jeito" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, "v5-home-models-mobile");

  const loginOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(loginOverflow, "home overflow at 390px").toBe(false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.goto("/creator/lunaferraz");
  await expect(page.getByRole("heading", { name: "Luna Ferraz" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ler mais" })).toBeVisible();
  await expect(page.getByRole("link", { name: /1 mês/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Promoções" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "Pedido especial" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Postagens/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Mídias/ })).toBeVisible();
  await shot(page, "v5-profile-desktop", true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.getByTestId("profile-avatar").scrollIntoViewIfNeeded();
  const profileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(profileOverflow, "profile overflow at 390px").toBe(false);
  await shot(page, "v5-profile-mobile");
});
