import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth?route=sign-in");
  await page.evaluate(() => localStorage.clear());
});

test("signup offers fan, creator, and affiliate areas", async ({ page }) => {
  await page.goto("/auth?route=sign-up");
  await expect(page.getByRole("heading", { name: "Como você quer usar a Mimelux?" })).toBeVisible();
  await page.getByRole("button", { name: "Afiliado" }).click();
  await expect(page.getByRole("heading", { name: "Crie sua conta" })).toBeVisible();
  await page.getByRole("button", { name: "Voltar" }).click();
  await page.getByRole("button", { name: /^Criador/ }).click();
  await expect(page.getByRole("heading", { name: "Crie sua conta" })).toBeVisible();
});

test("affiliate link signup and simulated subscription create a commission", async ({ page }) => {
  const clickLogged = page.waitForResponse(
    (response) => response.url().includes("/api/affiliate/clicks") && response.ok(),
  );
  await page.goto("/r/nara/lunaferraz?lang=pt-BR&sub=qa-tiktok");
  await clickLogged;
  await expect(page.getByRole("heading", { name: "Luna Ferraz" })).toBeVisible();
  await expect.poll(() =>
    page.evaluate(() => localStorage.getItem("mimelux-demo")?.includes("qa-tiktok") ?? false),
  ).toBe(true);
  const cookies = await page.context().cookies();
  expect(cookies.some((cookie) => cookie.name === "mimelux_attr" && cookie.httpOnly)).toBe(true);

  await page.getByRole("link", { name: "Quero fazer parte" }).first().click();
  await page.getByLabel("Seu nome").fill("Pessoa Indicada");
  await page.getByLabel("Email ou CPF").fill("indicada@mimelux.test");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/verificacao/);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Verificar e continuar" }).click();
  await page.getByRole("button", { name: /Pular tutorial/ }).click();

  await page.goto("/creator/lunaferraz");
  await page.getByRole("button", { name: "Escolher" }).first().click();
  await page.getByRole("button", { name: "Simular pagamento" }).click();
  await expect(page.getByText("Você faz parte!")).toBeVisible();

  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("mimelux-demo") || "{}");
    localStorage.setItem("mimelux-demo", JSON.stringify({ ...state, role: "affiliate" }));
  });
  await page.goto("/afiliados");
  await expect(page.getByText("qa-tiktok").first()).toBeVisible();
  await expect(page.getByText("R$ 5,98").first()).toBeVisible();
});

test("language switch and browser language change the login copy", async ({ page, browser }) => {
  await page.goto("/auth?route=sign-in");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Good to see you." })).toBeVisible();
  await expect(page.getByTestId("monetize-section")).toContainText("Monetize with us, your way");

  const german = await browser.newContext({ locale: "de-DE" });
  const germanPage = await german.newPage();
  await germanPage.goto("/auth?route=sign-in");
  await expect(germanPage.getByRole("heading", { name: "Schön, dass du da bist." })).toBeVisible();
  await german.close();
});

test("monetize section stays within the viewport width", async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 1024, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/auth?route=sign-in");
    await page.getByTestId("monetize-section").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Monetize com a gente, do seu jeito" }).last()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow, `horizontal overflow at ${viewport.width}px`).toBe(false);
  }
});
