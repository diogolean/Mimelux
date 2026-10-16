import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const artifactDir = "/opt/cursor/artifacts/screenshots";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth?route=sign-in");
  await page.evaluate(() => localStorage.clear());
});

test("root redirects to login and demo login opens discovery", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/auth\?route=sign-in/);
  await expect(page.getByRole("heading", { name: "Que bom ter você aqui." })).toBeVisible();

  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/topcreators/);
  await expect(page.getByRole("heading", { name: "Em alta" })).toBeVisible();
});

test("creator subscription unlocks locked posts and persists", async ({ page }) => {
  await page.goto("/creator/lunaferraz");
  const posts = page.getByTestId("profile-post");
  await expect(posts).toHaveCount(5);
  await expect(page.locator('[data-testid="profile-post"][data-locked="false"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="profile-post"][data-locked="true"]')).toHaveCount(4);
  await expect(page.getByText("Assine para desbloquear").first()).toBeVisible();

  await page.getByRole("button", { name: "Escolher" }).first().click();
  await expect(page).toHaveURL(/\/checkout/);
  await page.getByRole("button", { name: "Simular pagamento" }).click();
  await expect(page.getByText("Você faz parte!")).toBeVisible();
  await page.getByRole("button", { name: /Ver agora/ }).click();

  await expect(page.getByText("Assinatura ativa")).toBeVisible();
  await expect(page.locator('[data-testid="profile-post"][data-locked="true"]')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Assinatura ativa")).toBeVisible();
  await expect(page.locator('[data-testid="profile-post"][data-locked="true"]')).toHaveCount(0);
});

test("search filters fixtures and chat message persists", async ({ page }) => {
  await page.goto("/busca");
  await page.getByPlaceholder("Busque por nome, @usuário ou tema").fill("Kiara");
  await expect(page.getByText("Kiara Lopes")).toBeVisible();
  await expect(page.getByText("Luna Ferraz")).not.toBeVisible();

  await page.goto("/chat/luna-ferraz");
  await page.getByPlaceholder("Escreva uma mensagem...").fill("Adorei o conteúdo demo!");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Adorei o conteúdo demo!")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Adorei o conteúdo demo!")).toBeVisible();
});

test("responsive pages do not overflow and key screenshots render", async ({ page }) => {
  await mkdir(artifactDir, { recursive: true });
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 1024, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/topcreators?tab=top-creators");
    await page.evaluate(() => {
      const current = JSON.parse(localStorage.getItem("mimelux-demo") || "{}");
      localStorage.setItem(
        "mimelux-demo",
        JSON.stringify({ ...current, coachSeen: true }),
      );
    });
    await page.reload();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${viewport.width}px`).toBe(false);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/creator/lunaferraz");
  await page.screenshot({
    path: `${artifactDir}/mimelux-profile-mobile-390.png`,
    fullPage: true,
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/topcreators?tab=top-creators");
  await page.screenshot({
    path: `${artifactDir}/mimelux-em-alta-desktop-1440.png`,
    fullPage: true,
  });
});

test("unknown URL renders the Next.js 404 response", async ({ page }) => {
  const response = await page.goto("/rota-inexistente");
  expect(response?.status()).toBe(404);
});
