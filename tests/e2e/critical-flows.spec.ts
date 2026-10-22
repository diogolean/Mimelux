import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const artifactDir = "/opt/cursor/artifacts/screenshots";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth?route=sign-in");
  await page.evaluate(() => localStorage.clear());
});

test("root shows the creator showcase and demo fan login opens trending creators", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Os criadores mais recentes, primeiro." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cadastre-se" })).toBeVisible();
  const cards = page.getByTestId("showcase-card");
  await expect(cards.first()).toContainText("Albina Schneider");
  await expect(cards.nth(8)).toContainText("Taty Moreira");
  await expect(cards.nth(9)).toContainText("Luna Ferraz");
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\?route=sign-in/);
  await expect(page.getByRole("heading", { name: "Que bom ter você aqui." })).toBeVisible();

  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/topcreators/);
  await expect(page.getByRole("heading", { name: "Em alta", exact: true })).toBeVisible();
});

test("new account completes verification, onboarding, and discovery coach marks", async ({
  page,
}) => {
  await page.goto("/auth?route=sign-up");
  await page.getByLabel("Seu nome").fill("Pessoa Demo");
  await page.getByLabel("Email ou CPF").fill("pessoa.demo@mimelux.test");
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByTestId("accept-terms").check();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/verificacao/);
  const ageConfirmation = page.getByRole("checkbox");
  if (await ageConfirmation.isVisible()) await ageConfirmation.check();
  await page.getByRole("button", { name: "Verificar e continuar" }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  for (let step = 0; step < 3; step += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }
  await page.getByRole("button", { name: "Concluir" }).click();

  await expect(page).toHaveURL(/\/topcreators/);
  await page.goto("/topcreators?tab=top-creators");
  await expect(page.getByText("Quem tá em alta agora")).toBeVisible();
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page.getByText("Descubra de tudo um pouco")).toBeVisible();
  await page.getByRole("button", { name: "Entendi" }).click();
  await expect(page.getByRole("heading", { name: "Em alta", exact: true })).toBeVisible();
});

test("creator subscription unlocks subscriber posts while PPV stays separate", async ({ page }) => {
  await page.goto("/creator/lunaferraz");
  const posts = page.getByTestId("profile-post");
  await expect(posts).toHaveCount(13);
  await expect(page.locator('[data-testid="profile-post"][data-locked="false"]')).toHaveCount(4);
  await expect(page.locator('[data-testid="profile-post"][data-locked="true"]')).toHaveCount(9);
  await expect(page.getByText("Assine para desbloquear").first()).toBeVisible();

  await page.getByRole("link", { name: /1 mês/ }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await page.getByRole("button", { name: "Simular pagamento" }).click();
  await expect(page.getByText("Você faz parte!")).toBeVisible();
  await page.getByRole("button", { name: /Ver agora/ }).click();

  await expect(page).toHaveURL((url) => url.pathname === "/creator/lunaferraz");
  await expect(page.getByRole("button", { name: "Assinatura ativa", exact: true })).toBeVisible();
  await expect(page.locator('[data-testid="profile-post"][data-locked="true"]')).toHaveCount(1);
  await expect(page.getByText("Desbloquear conteúdo")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Assinatura ativa", exact: true })).toBeVisible();
  await expect(page.locator('[data-testid="profile-post"][data-locked="true"]')).toHaveCount(1);
});

test("search filters fixtures and chat message persists", async ({ page }) => {
  await page.goto("/busca");
  await page.getByPlaceholder("Busque por nome, @usuário ou tema").fill("Kiara");
  const searchResults = page.getByTestId("search-results");
  await expect(searchResults.getByText("Kiara Lopes")).toBeVisible();
  await expect(searchResults.getByText("Luna Ferraz")).not.toBeVisible();

  await page.goto("/chat/luna-ferraz");
  await page.getByPlaceholder("Escreva uma mensagem...").fill("Adorei o conteúdo demo!");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Adorei o conteúdo demo!")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Adorei o conteúdo demo!")).toBeVisible();
});

test("creator dashboard keeps uploads local and generated media loads", async ({
  page,
}) => {
  await page.goto("/auth?route=sign-in");
  await page.getByLabel("Email ou CPF").fill("criadora@mimelux.com.br");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/painel/);
  await expect(page.getByTestId("media-library")).toBeVisible();
  await page.getByTestId("demo-upload").setInputFiles(
    "apps/web/public/media/generated/creator-luna-ferraz-avatar.jpg",
  );
  await expect(page.getByText("creator-luna-ferraz-avatar.jpg")).toBeVisible();
  await expect(page.getByText("Prévia local · nenhum arquivo foi enviado")).toBeVisible();
  await page.getByRole("button", { name: "Publicar demo" }).click();
  await expect(page.getByText("Publicação simulada adicionada à fila.")).toBeVisible();

  await page.goto("/topcreators?tab=top-creators");
  await page.evaluate(async () => {
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const height = document.body.scrollHeight;
    for (let top = 0; top < height; top += 700) {
      window.scrollTo(0, top);
      await wait(40);
    }
  });
  await expect
    .poll(async () =>
      page.locator("img").evaluateAll((images) =>
        images.every((image) => {
          if (!(image instanceof HTMLImageElement)) return false;
          if (image.getAttribute("src")?.includes("/media/models/")) return true;
          return image.complete && image.naturalWidth > 0;
        }),
      ),
    )
    .toBe(true);
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
