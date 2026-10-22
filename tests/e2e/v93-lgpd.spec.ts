import { expect, test } from "@playwright/test";

test("cookie consent waits for the age gate and gates optional scripts", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/auth?route=sign-in");
  const gate = page.getByRole("dialog");
  await expect(gate).toBeVisible();
  await expect(page.getByTestId("cookie-banner")).toHaveCount(0);
  await expect(page.locator("#patrocino-analytics")).toHaveCount(0);
  await expect(page.locator("#patrocino-marketing")).toHaveCount(0);

  await gate.getByRole("button", { name: "Sim", exact: true }).click();
  const banner = page.getByTestId("cookie-banner");
  await expect(banner).toBeVisible();
  await expect(banner.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
  await expect(page.locator("#patrocino-analytics")).toHaveCount(0);

  await banner.getByRole("button", { name: "Personalizar" }).click();
  await page.getByTestId("cookie-analytics").check();
  await page.getByTestId("cookie-marketing").uncheck();
  await banner.getByRole("button", { name: "Salvar escolha" }).click();
  await expect(banner).toHaveCount(0);
  await expect(page.locator("#patrocino-analytics")).toHaveAttribute("type", "text/plain");
  await expect(page.locator("#patrocino-marketing")).toHaveCount(0);

  const stored = await page.evaluate(() => ({
    local: window.localStorage.getItem("patrocino-consent") ?? "",
    cookie: document.cookie.includes("patrocino_consent="),
  }));
  expect(stored.cookie).toBe(true);
  expect(stored.local).toContain("2026-10-22");
  expect(stored.local).toContain('"analytics":true');
  expect(stored.local).toContain('"marketing":false');

  await page.getByTestId("cookie-preferences").click();
  await expect(page.getByTestId("cookie-banner")).toBeVisible();
  await page.getByRole("button", { name: "Aceitar todos" }).click();
  await expect(page.locator("#patrocino-analytics")).toHaveCount(1);
  await expect(page.locator("#patrocino-marketing")).toHaveAttribute("type", "text/plain");
  await page.reload();
  await expect(page.locator("#patrocino-analytics")).toHaveCount(1);
  await expect(page.locator("#patrocino-marketing")).toHaveCount(1);

  await page.getByTestId("cookie-preferences").click();
  await page.getByRole("button", { name: "Só necessários" }).click();
  await expect(page.locator("#patrocino-analytics")).toHaveCount(0);
  await expect(page.locator("#patrocino-marketing")).toHaveCount(0);
});

test("the privacy page describes the banner, retention, and self-service", async ({ page }) => {
  await page.goto("/privacidade");
  const main = page.locator("main");
  await expect(main.getByText("Aceitar todos").first()).toBeVisible();
  await expect(main.getByText("Só necessários").first()).toBeVisible();
  await expect(main.getByText("Preferências de cookies").first()).toBeVisible();
  await expect(main.getByText("5 anos").first()).toBeVisible();
  await expect(main.getByText("Baixar meus dados").first()).toBeVisible();
  await expect(main.getByText("Excluir minha conta").first()).toBeVisible();
});

test("english privacy copy and the cookie banner follow the locale", async ({ page, context }) => {
  await context.addCookies([{ name: "mimelux-locale", value: "en", domain: "127.0.0.1", path: "/" }]);
  await page.goto("/auth?route=sign-in");
  await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Necessary only" })).toBeVisible();
  await page.goto("/privacidade");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeVisible();
  await expect(main.getByText("Download my data").first()).toBeVisible();
  await expect(main.getByText("Delete my account").first()).toBeVisible();
  await expect(main.getByText("5 years").first()).toBeVisible();
  await expect(main.getByText("Cookie preferences").first()).toBeVisible();
});

test("a signed-in person can export data and delete the account", async ({ page }) => {
  const email = `lgpd.${Date.now()}@mimelux.test`;
  const password = "mimelux123";
  const registered = await page.request.post("/api/session/register", {
    data: { name: "Pessoa LGPD", email, password, role: "fan", acceptTerms: true },
  });
  expect(registered.ok()).toBeTruthy();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/conta");
  const banner = page.getByTestId("cookie-banner");
  if (await banner.isVisible()) await banner.getByRole("button", { name: "Só necessários" }).click();
  await expect(page.getByRole("heading", { name: "Dados e privacidade" })).toBeVisible();
  await expect(page.getByTestId("account-settings")).toBeVisible();

  const exported = await page.evaluate(async () => {
    const response = await fetch("/api/privacy/export", { cache: "no-store" });
    return { status: response.status, body: await response.json() };
  });
  expect(exported.status).toBe(200);
  expect(exported.body.profile.email).toBe(email);
  expect(Array.isArray(exported.body.subscriptions)).toBe(true);
  expect(Array.isArray(exported.body.purchases)).toBe(true);
  expect(Array.isArray(exported.body.consents)).toBe(true);
  expect(Array.isArray(exported.body.messages)).toBe(true);
  expect(JSON.stringify(exported.body)).not.toContain("passwordHash");

  await page.getByTestId("export-data").click();
  await expect(page.getByText("Arquivo gerado neste navegador")).toBeVisible();

  await page.getByTestId("delete-account").click();
  await page.getByTestId("delete-password").fill("errada123");
  await page.getByTestId("delete-confirm").fill("EXCLUIR");
  await page.getByTestId("delete-submit").click();
  await expect(page.getByText("Senha incorreta.")).toBeVisible();

  await page.getByTestId("delete-password").fill(password);
  await page.getByTestId("delete-confirm").fill("EXCLUIR");
  await page.getByTestId("delete-submit").click();
  await expect(page).toHaveURL(/\/auth\?route=sign-in/);

  await page.getByLabel("Email ou CPF").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
});
