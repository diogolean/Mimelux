import type { CSSProperties } from "react";
import { Logo, Mark } from "@mimelux/ui";

const lightVars = {
  "--background": "#F7F7FB",
  "--surface": "#ECECF5",
  "--elevated": "#FFFFFF",
  "--primary": "#A996FF",
  "--primary-strong": "#5437D1",
  "--accent": "#62D4C8",
  "--foreground": "#181725",
  "--ink": "#181725",
  "--muted": "#625F73",
  "--border": "rgba(24, 23, 37, 0.11)",
} as CSSProperties;

const darkVars = {
  "--background": "#0C0D14",
  "--surface": "#171925",
  "--elevated": "#202331",
  "--primary": "#A996FF",
  "--primary-strong": "#C0B5FF",
  "--accent": "#62D4C8",
  "--foreground": "#F6F4FF",
  "--ink": "#181725",
  "--muted": "#AAA7B8",
  "--border": "rgba(246, 244, 255, 0.13)",
} as CSSProperties;

function Board({
  id,
  vars,
  label,
}: {
  id: string;
  vars: CSSProperties;
  label: string;
}) {
  return (
    <section
      data-testid={id}
      style={vars}
      className="rounded-[28px] bg-background px-6 py-8 text-foreground sm:px-10"
    >
      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-muted">{label}</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div data-testid={`${id}-heart`}>
          <p className="text-xs font-semibold text-primary-strong">Apoio · padrão</p>
          <div className="mt-4 flex items-end gap-6">
            <span className="grid size-16 place-items-center rounded-[18px] bg-foreground text-background">
              <Mark variant="heart" className="size-11" />
            </span>
            <Mark variant="heart" title="Apoio" className="size-16" />
            <Mark variant="heart" className="size-4" />
          </div>
          <div className="mt-6">
            <Logo />
          </div>
        </div>
        <div data-testid={`${id}-spark`}>
          <p className="text-xs font-semibold text-muted">Centelha · alternativa</p>
          <div className="mt-4 flex items-end gap-6">
            <span className="grid size-16 place-items-center rounded-[18px] bg-foreground text-background">
              <Mark variant="spark" className="size-11" />
            </span>
            <Mark variant="spark" title="Centelha" className="size-16" />
            <Mark variant="spark" className="size-4" />
          </div>
          <div className="mt-6">
            <Logo mark="spark" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BrandPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-10 sm:px-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[.28em] text-primary-strong">Identidade</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-.04em]">Patrocino</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Duas marcas originais. Apoio, o P com um coração, é o padrão. Centelha troca o coração por uma faísca.
        </p>
      </header>
      <Board id="logo-board-light" vars={lightVars} label="Fundo claro" />
      <Board id="logo-board-dark" vars={darkVars} label="Fundo escuro" />
    </main>
  );
}
