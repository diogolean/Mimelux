"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Compass,
  House,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Sun,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Button, Logo } from "@mimelux/ui";
import { resetDemo } from "@/lib/demo-store";
import { creators } from "@/lib/gateway";

const items = [
  { href: "/feed", label: "Feed", icon: House },
  { href: "/topcreators?tab=top-creators", match: "/topcreators", label: "Em alta", icon: TrendingUp },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/busca", label: "Busca", icon: Search },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const currentCreator = creators[0]!;

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col border-r border-black/5 bg-background/92 p-6 backdrop-blur-xl lg:flex">
        <Logo compact />
        <nav className="mt-10 space-y-1.5">
          {items.map((item) => {
            const active = pathname.startsWith(item.match || item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-ink text-white shadow-lg dark:bg-primary dark:text-ink"
                    : "text-muted hover:bg-surface hover:text-foreground dark:hover:bg-white/8"
                }`}
              >
                <Icon className="size-[18px]" strokeWidth={active ? 2.5 : 1.8} />
                {item.label}
                {item.label === "Chat" && (
                  <span className="ml-auto grid size-5 place-items-center rounded-full bg-primary text-[9px] font-black text-ink">3</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-[24px] bg-gradient-to-br from-primary/25 to-accent/25 p-4">
          <div className="grid size-9 place-items-center rounded-xl bg-primary">
            <Compass className="size-4 text-ink" />
          </div>
          <p className="mt-4 text-sm font-extrabold">Crie no seu ritmo</p>
          <p className="mt-1 text-[10px] leading-5 text-muted">Publique experiências e construa sua comunidade.</p>
          <Link href="/painel" className="mt-3 inline-block text-[11px] font-bold text-primary-strong">Abrir painel →</Link>
        </div>

        <div className="mt-auto flex items-center gap-3 rounded-2xl p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentCreator.avatar} alt={currentCreator.name} className="size-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-extrabold">{currentCreator.name}</p>
            <p className="truncate text-[10px] text-muted">@{currentCreator.username}</p>
          </div>
          <button
            aria-label="Sair"
            onClick={() => {
              resetDemo();
              router.push("/auth?route=sign-in");
            }}
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-black/5"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <header className="glass fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between px-4 lg:left-[258px] lg:px-8">
        <div className="lg:hidden"><Logo compact /></div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted">Mimelux</p>
          <p className="text-xs font-extrabold">Seu espaço exclusivo</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Alternar tema"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
            <Bell className="size-[18px]" />
            <i className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-background bg-primary" />
          </Button>
          <Link href="/painel">
            <Button variant="ghost" size="icon" aria-label="Perfil">
              <UserRound className="size-[18px]" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" aria-label="Menu" className="lg:hidden">
            <Menu className="size-[18px]" />
          </Button>
        </div>
      </header>

      <main className="min-h-dvh pb-24 pt-16 lg:ml-[258px] lg:pb-8">{children}</main>

      <nav className="glass fixed inset-x-0 bottom-0 z-40 grid h-[72px] grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {items.map((item) => {
          const active = pathname.startsWith(item.match || item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition ${
                active ? "text-primary-strong" : "text-muted"
              }`}
            >
              {active && <i className="absolute top-0 h-0.5 w-7 rounded-full bg-primary" />}
              <Icon className="size-5" strokeWidth={active ? 2.5 : 1.8} />
              {item.label}
              {item.label === "Chat" && <i className="absolute right-[28%] top-3.5 size-2 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
