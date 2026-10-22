import { expect, test } from "@playwright/test";

test("a new account stays signed in and demo login still opens the feed", async ({ page }) => {
  const email = `pessoa.${Date.now()}@mimelux.test`;
  const password = "mimelux123";

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/auth?route=sign-up");
  await page.getByLabel("Seu nome").fill("Pessoa Real");
  await page.getByLabel("Email ou CPF").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByTestId("accept-terms").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/verificacao/);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Verificar e continuar" }).click();
  await page.getByRole("button", { name: /Pular tutorial/ }).click();

  await page.goto("/feed");
  await expect(page.getByRole("heading", { name: "Seu feed" })).toBeVisible();
  await expect(page.getByText("Luna Ferraz").first()).toBeVisible();
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", email);

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/auth\?route=sign-in/);
  await page.goto("/feed");
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", "");

  await page.goto("/auth?route=sign-in");
  await page.getByLabel("Email ou CPF").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/(topcreators|feed|painel|afiliados)/);
  await page.goto("/feed");
  await expect(page.getByRole("heading", { name: "Seu feed" })).toBeVisible();
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", email);
  await page.reload();
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", email);
  await expect(page.getByText("Luna Ferraz").first()).toBeVisible();

  const access = (await page.context().cookies()).find((cookie) => cookie.name === "patrocino_access");
  expect(access?.httpOnly).toBe(true);

  await page.getByRole("button", { name: "Sair" }).click();
  await page.getByLabel("Email ou CPF").fill("fan@patrocino.com");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/topcreators/);
  await expect(page.getByRole("heading", { name: "Em alta", exact: true })).toBeVisible();
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", "fan@mimelux.com.br");
});
