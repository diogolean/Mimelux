import { expect, test } from "@playwright/test";

test("signing up as afiliado creates an affiliate account", async ({ page }) => {
  const email = `afiliada.${Date.now()}@mimelux.test`;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/auth?route=sign-up");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await page.getByRole("button", { name: "Afiliado", exact: true }).click();
  await page.getByLabel("Seu nome").fill("Afiliada Nova");
  await page.getByLabel("Email ou CPF").fill(email);
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByTestId("accept-terms").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/verificacao/);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Verificar e continuar" }).click();
  await expect(page.getByTestId("affiliate-onboarding")).toBeVisible();
  await page.getByRole("button", { name: /Pular tutorial/ }).click();
  await expect(page).toHaveURL(/\/afiliados/);
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-role", "affiliate");
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", email);
});

test("an admin can change another account role", async ({ page }) => {
  const email = `papel.${Date.now()}@mimelux.test`;
  const registered = await page.request.post("/api/session/register", {
    data: { name: "Conta Papel", email, password: "mimelux123", role: "fan", acceptTerms: true },
  });
  expect(registered.ok()).toBeTruthy();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/auth?route=sign-in");
  await page.getByLabel("Email ou CPF").fill("admin@patrocino.com");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: "Contas" })).toBeVisible();
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-role", "admin");

  await page.getByTestId("admin-search").fill(email);
  await page.getByTestId("admin-user").filter({ hasText: email }).click();
  await page.getByTestId("admin-role").selectOption("AFFILIATE");
  await page.getByTestId("admin-save").click();
  await expect(page.getByText("Conta atualizada.")).toBeVisible();
  await expect(page.getByTestId("admin-role")).toHaveValue("AFFILIATE");
});

test("a fan cannot open the admin panel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/auth?route=sign-in");
  await page.getByLabel("Email ou CPF").fill("fan@patrocino.com");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/topcreators/);

  const denied = await page.request.get("/api/admin/users");
  expect(denied.status()).toBe(403);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/topcreators/);
  await expect(page.getByRole("heading", { name: "Contas" })).toHaveCount(0);
});
