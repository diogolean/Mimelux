import { expect, test } from "@playwright/test";

test("the sign-in role picker uses the matching demo account", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/auth?route=sign-in");

  await page.getByLabel("Email ou CPF").fill("pessoa.real@mimelux.test");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await expect(page.getByLabel("Email ou CPF")).toHaveValue("pessoa.real@mimelux.test");

  await page.goto("/auth?route=sign-in");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await page.getByRole("button", { name: "Afiliado", exact: true }).click();
  await expect(page.getByLabel("Email ou CPF")).toHaveValue("afiliado@patrocino.com");
  await expect(page.locator('input[name="password"]')).toHaveValue("mimelux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/afiliados/);
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-role", "affiliate");
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", "afiliado@mimelux.com.br");

  await page.goto("/auth?route=sign-in");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await page.getByRole("button", { name: "Criador", exact: true }).click();
  await expect(page.getByLabel("Email ou CPF")).toHaveValue("criadora@patrocino.com");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/painel$/);
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-role", "creator");

  await page.goto("/auth?route=sign-in");
  await expect(page.getByLabel("Email ou CPF")).toHaveValue("fan@patrocino.com");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/topcreators/);
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-role", "fan");
  await page.goto("/feed");
  await expect(page.getByRole("heading", { name: "Seu feed" })).toBeVisible();
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-role", "fan");
  await expect(page.getByTestId("session-user")).toHaveAttribute("data-email", "fan@mimelux.com.br");
});

test("a referral code without a creator opens that affiliate default page", async ({ page }) => {
  await page.goto("/r/nara?sub=qa-home");
  await expect(page).toHaveURL(/\/r\/nara\/lunaferraz\?sub=qa-home/);
  await expect(page.getByRole("heading", { name: "Luna Ferraz" })).toBeVisible();
});
