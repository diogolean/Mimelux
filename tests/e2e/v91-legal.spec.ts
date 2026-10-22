import { expect, test } from "@playwright/test";

const pages = [
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Política de Privacidade"],
  ["/diretrizes", "Diretrizes de conteúdo"],
  ["/reembolso", "Reembolso e cancelamento"],
] as const;

test("legal pages and the site footer are available", async ({ page }) => {
  for (const [path, heading] of pages) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    const footer = page.getByTestId("site-footer");
    await expect(footer.getByRole("link", { name: "Termos" })).toHaveAttribute("href", "/termos");
    await expect(footer.getByRole("link", { name: "Privacidade" })).toHaveAttribute("href", "/privacidade");
    await expect(footer.getByRole("link", { name: "Diretrizes" })).toHaveAttribute("href", "/diretrizes");
    await expect(footer.getByRole("link", { name: "Reembolso" })).toHaveAttribute("href", "/reembolso");
  }

  await page.goto("/termos");
  await expect(page.getByText("Equipe Patrocino").first()).toBeVisible();
  await expect(page.getByText(/WinApp|WinUp/i)).toHaveCount(0);
  await page.goto("/privacidade");
  await expect(page.getByText("Equipe Patrocino").first()).toBeVisible();
  await expect(page.getByText("contato@patrocino.com").first()).toBeVisible();
  await expect(page.getByText(/WinApp|WinUp|\[CNPJ\]|\[ENDEREÇO COMPLETO\]/)).toHaveCount(0);
  await expect(page.locator("[data-placeholder=company]")).toHaveCount(0);

  await page.goto("/diretrizes");
  await expect(page.getByText("denuncia@patrocino.com")).toBeVisible();
  await expect(page.getByText("18 anos").first()).toBeVisible();

  await page.goto("/reembolso");
  await expect(page.getByRole("heading", { name: "Renovação automática" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cancelar quando quiser" })).toBeVisible();

  await page.goto("/auth?route=sign-in");
  await expect(page.getByTestId("site-footer")).toBeVisible();
});

test("english shows the english legal text", async ({ page, context }) => {
  await context.addCookies([
    { name: "mimelux-locale", value: "en", domain: "127.0.0.1", path: "/" },
  ]);
  await page.goto("/termos");
  await expect(page.getByRole("heading", { name: "Terms of Use", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Creator terms" })).toBeVisible();
  await page.goto("/privacidade");
  await expect(page.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeVisible();
});

test("signup requires the age and terms checkbox", async ({ page }) => {
  await page.goto("/auth?route=sign-up");
  await page.getByLabel("Seu nome").fill("Legal Pessoa");
  await page.getByLabel("Email ou CPF").fill(`legal.${Date.now()}@mimelux.test`);
  await page.locator('input[name="password"]').fill("mimelux123");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/sign-up/);
  await expect(page.getByText("Tenho 18 anos ou mais e aceito os Termos de Uso e a Política de Privacidade")).toBeVisible();
  await expect(page.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/termos");
  await expect(page.locator("main").getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
  await page.getByRole("switch", { name: "Criador ou afiliado" }).click();
  await page.getByRole("button", { name: "Criador", exact: true }).click();
  await expect(page.getByTestId("accept-creator-terms")).toBeVisible();
  await expect(page.getByRole("link", { name: "termos do criador" })).toHaveAttribute("href", "/termos#criador");
});

test("the age gate stops anonymous visitors until they confirm", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/auth?route=sign-in");
  const gate = page.getByRole("dialog");
  await expect(gate.getByRole("heading", { name: "Este site contém conteúdo adulto. Você tem 18 anos ou mais?" })).toBeVisible();
  await gate.getByRole("button", { name: "Sim", exact: true }).click();
  await expect(gate).toBeHidden();
  const cookies = await context.cookies();
  expect(cookies.some((cookie) => cookie.name === "patrocino_age" && cookie.value === "yes")).toBe(true);
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("saying no on the age gate leaves the site", async ({ page, context }) => {
  await context.clearCookies();
  await page.route("https://www.google.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<p>left</p>" }),
  );
  await page.goto("/auth?route=sign-in");
  await page.getByRole("button", { name: "Não", exact: true }).click();
  await expect(page).toHaveURL(/https:\/\/www\.google\.com\/?/);
});
