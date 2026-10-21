import { expect, test } from "@playwright/test";

test("a fan can subscribe in demo mode and cancel at period end", async ({ page }) => {
  const email = `assinante.${Date.now()}@mimelux.test`;
  const registered = await page.request.post("/api/session/register", {
    data: { name: "Assinante Novo", email, password: "mimelux123", role: "fan" },
  });
  expect(registered.ok()).toBeTruthy();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/auth?route=sign-in");
  await page.getByLabel("Email ou CPF").fill(email);
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/topcreators/);

  await page.goto("/creator/lunaferraz");
  const cookie = page.getByRole("button", { name: "Entendi" });
  if (await cookie.isVisible()) await cookie.click();
  await page.getByTestId("subscribe-card").click();
  await expect(page).toHaveURL(/\/assinaturas/);
  await expect(page.getByRole("heading", { name: "Minhas assinaturas" })).toBeVisible();
  await expect(page.getByTestId("subscription-card").filter({ hasText: "Luna Ferraz" })).toBeVisible();
  await page.getByTestId("subscription-cancel").click();
  await expect(page.getByText("cancela ao fim do período")).toBeVisible();
});

test("an admin edits the revenue split without an ownership control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/auth?route=sign-in");
  await page.getByLabel("Email ou CPF").fill("admin@patrocino.com");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByTestId("admin-creator-share")).toHaveValue("80");
  await expect(page.getByTestId("admin-affiliate-share")).toHaveValue("20");
  await expect(page.getByTestId("admin-ownership")).toHaveCount(0);
  await expect(page.getByText(/WinApp|independente|da casa/i)).toHaveCount(0);

  await page.getByTestId("admin-creator-search").fill("luna");
  await page.getByTestId("admin-creator").filter({ hasText: "Luna Ferraz" }).click();
  await page.getByTestId("admin-creator-override").fill("75");
  await page.getByTestId("admin-creator-save").click();
  await expect(page.getByText("Criador atualizado.")).toBeVisible();
  await expect(page.getByTestId("admin-creator-override")).toHaveValue("75");

  await page.getByTestId("admin-creator-override").fill("");
  await page.getByTestId("admin-creator-save").click();
  await expect(page.getByTestId("admin-creator-override")).toHaveValue("");
});
