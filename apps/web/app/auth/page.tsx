"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState, useSyncExternalStore } from "react";
import {
  Apple,
  Eye,
  EyeOff,
  LoaderCircle,
  Music2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Logo } from "@mimelux/ui";
import { DEMO_ACCOUNTS, isDemoCreatorEmail, loginSchema, registerSchema, type AccountRole } from "@mimelux/core";
import { bindAttribution } from "@/lib/affiliates";
import { mockDelay, readDemo, writeDemo } from "@/lib/demo-store";
import { creators, posts } from "@/lib/gateway";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MonetizeSection } from "@/components/monetize-section";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { roleHome } from "@/lib/use-role-guard";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("auth");
  const signUp = params.get("route") === "sign-up";
  const requestedRole = params.get("role");
  const preset = requestedRole === "creator" || requestedRole === "affiliate" ? requestedRole : "fan";
  const [role, setRole] = useState<AccountRole>(preset);
  const [professional, setProfessional] = useState(preset !== "fan");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [social, setSocial] = useState("");
  const [error, setError] = useState("");
  const cookie = useSyncExternalStore(subscribeDemo, cookieOpen, () => true);
  const featuredCreator = creators[0]!;
  const featuredPost = posts[0]!;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const email = String(form.get("email") || "");
    const result = signUp
      ? registerSchema.safeParse({
          name: form.get("name"),
          email,
          password,
          role: role ?? "fan",
        })
      : loginSchema.safeParse({ identifier: email, password });

    if (!result.success) {
      setError(signUp ? "Confira nome, e-mail e uma senha com 6 caracteres." : "Preencha e-mail/CPF e senha.");
      return;
    }
    setLoading(true);
    await mockDelay();
    if (!signUp && password !== DEMO_ACCOUNTS.fan.password) {
      setLoading(false);
      setError("No demo, use a senha mimelux123.");
      return;
    }
    const chosen: AccountRole = professional ? (role === "affiliate" ? "affiliate" : "creator") : "fan";
    const nextRole: AccountRole = !signUp
      ? professional
        ? chosen
        : isDemoCreatorEmail(email)
          ? "creator"
          : email.trim().toLowerCase() === DEMO_ACCOUNTS.affiliate.email
            ? "affiliate"
            : "fan"
      : chosen;
    const current = readDemo();
    writeDemo({
      signedIn: true,
      role: nextRole,
      verified: !signUp,
      onboarding: !signUp,
      ...(signUp ? bindAttribution(current, email) : { coachSeen: true }),
    });
    const destination = signUp ? "/verificacao" : roleHome(nextRole);
    router.push(destination);
  }

  async function socialLogin(name: string) {
    setSocial(name);
    await mockDelay(850);
    const nextRole: AccountRole = professional ? (role === "affiliate" ? "affiliate" : "creator") : "fan";
    writeDemo({
      signedIn: true,
      role: nextRole,
      verified: true,
      onboarding: !signUp,
      ...(signUp ? {} : { coachSeen: true }),
    });
    router.push(signUp ? "/onboarding" : roleHome(nextRole));
  }

  return (
    <main className="bg-background">
      <div className="relative grid min-h-dvh w-full grid-cols-1 overflow-x-hidden lg:grid-cols-[minmax(480px,0.9fr)_1.1fr]">
      <section className="relative z-10 flex min-h-dvh w-full min-w-0 items-center justify-center px-4 py-8 sm:px-10 sm:py-10 lg:px-14">
        <div className="w-full min-w-0 max-w-[440px] animate-enter">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <Logo />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher compact />
            </div>
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-primary-strong">
            {signUp ? t("signupEyebrow") : t("loginEyebrow")}
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">
            {signUp ? t("signupTitle") : t("loginTitle")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {signUp ? t("signupBody") : t("loginBody")}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-3">
            {signUp && (
              <input
                name="name"
                aria-label="Seu nome"
                placeholder="Seu nome"
                autoComplete="name"
                className="h-13 w-full rounded-full border border-black/8 bg-white/70 px-5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:bg-white/5"
              />
            )}
            <input
              name="email"
              aria-label="Email ou CPF"
              defaultValue={signUp ? "" : DEMO_ACCOUNTS.fan.email}
              placeholder={signUp ? "E-mail" : "E-mail ou CPF"}
              autoComplete="email"
              className="h-13 w-full rounded-full border border-black/8 bg-white/70 px-5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:bg-white/5"
            />
            <div className="relative">
              <input
                name="password"
                aria-label="Senha"
                defaultValue={signUp ? "" : DEMO_ACCOUNTS.fan.password}
                type={visible ? "text" : "password"}
                placeholder="Senha"
                autoComplete={signUp ? "new-password" : "current-password"}
                className="h-13 w-full rounded-full border border-black/8 bg-white/70 px-5 pr-13 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:bg-white/5"
              />
              <button
                type="button"
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setVisible((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {!signUp && (
              <div className="flex justify-end">
                <button type="button" onClick={() => toast.info(t("forgotDemo"))} className="text-xs font-semibold text-muted hover:text-foreground">
                  {t("forgot")}
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className="rounded-2xl bg-accent/25 px-4 py-3 text-xs font-medium">
                {error}
              </p>
            )}
            <RoleSwitch
              professional={professional}
              role={role}
              label={t("roleSwitch")}
              hint={t("roleSwitchHint")}
              creatorLabel={t("creator")}
              affiliateLabel={t("affiliate")}
              onProfessional={(next) => {
                setProfessional(next);
                setRole(next ? (role === "affiliate" ? "affiliate" : "creator") : "fan");
              }}
              onRole={setRole}
            />
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {signUp ? t("continue") : t("enter")}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[11px] text-muted before:h-px before:flex-1 before:bg-black/10 after:h-px after:flex-1 after:bg-black/10">
            ou entre com
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Google", icon: <span className="text-base font-black">G</span> },
              { label: "X", icon: <span className="text-base font-black">𝕏</span> },
              { label: "Apple", icon: <Apple className="size-4" /> },
              { label: "TikTok", icon: <Music2 className="size-4" /> },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                aria-label={`Entrar com ${item.label}`}
                onClick={() => socialLogin(item.label)}
                className="grid h-12 place-items-center rounded-full border border-black/8 bg-white/60 transition hover:-translate-y-0.5 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
              >
                {social === item.label ? <LoaderCircle className="size-4 animate-spin" /> : item.icon}
              </button>
            ))}
          </div>

          <p className="mt-7 text-center text-xs text-muted">
            {signUp ? t("hasAccount") : t("noAccount")}{" "}
            <Link
              href={signUp ? "/auth?route=sign-in" : "/auth?route=sign-up"}
              className="font-bold text-primary-strong hover:underline"
            >
              {signUp ? t("signIn") : t("signUp")}
            </Link>
          </p>
        </div>
      </section>

      <aside className="relative m-3 hidden min-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[36px] bg-surface lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(233,176,167,.8),transparent_24rem),radial-gradient(circle_at_20%_90%,rgba(233,161,94,.42),transparent_25rem)]" />
        <div className="absolute left-12 top-12 flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold backdrop-blur">
          <ShieldCheck className="size-4 text-primary-strong" />
          {t("panelBadge")}
        </div>
        <div className="absolute inset-x-0 top-[16%] flex justify-center">
          <div className="relative h-[480px] w-[310px] [animation:float_6s_ease-in-out_infinite]">
            <div className="absolute inset-0 rotate-[-6deg] rounded-[44px] bg-ink/10" />
            <div className="absolute inset-0 overflow-hidden rounded-[44px] border-[7px] border-white bg-white shadow-[0_30px_80px_rgba(32,32,39,.18)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredPost.image} alt={`Conteúdo demo de ${featuredCreator.name}`} className="h-[68%] w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredCreator.avatar} alt="" className="size-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-extrabold text-ink">{featuredCreator.name}</p>
                    <p className="text-[10px] text-black/50">@{featuredCreator.username}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-surface" />
                <div className="mt-2 h-2 w-3/5 rounded-full bg-surface" />
              </div>
            </div>
            <span className="absolute -right-8 top-20 grid size-16 place-items-center rounded-3xl bg-primary shadow-xl">
              <Sparkles className="size-7 text-ink" />
            </span>
          </div>
        </div>
        <div className="absolute inset-x-12 bottom-12">
          <h2 className="max-w-lg text-4xl font-extrabold leading-[1.1] tracking-[-.045em] text-ink">
            {t("panelTitle")}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-black/55">
            {t("panelBody")}
          </p>
        </div>
      </aside>
      </div>
      {!signUp && <MonetizeSection />}

      {cookie && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-3xl border border-white/10 bg-ink p-4 text-white shadow-2xl sm:flex-row sm:items-center sm:px-5">
          <p className="flex-1 text-[11px] leading-5 text-white/70">
            Usamos cookies essenciais para manter sua experiência segura. No demo, preferências ficam somente neste navegador.
          </p>
          <Button
            size="sm"
            onClick={() => writeDemo({ cookieAccepted: true })}
          >
            Entendi
          </Button>
        </div>
      )}

      {social && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-background/90 backdrop-blur-md">
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary">
              <LoaderCircle className="size-7 animate-spin text-ink" />
            </div>
            <p className="mt-5 text-lg font-extrabold">Entrando...</p>
            <p className="mt-1 text-xs text-muted">Conectando com {social}</p>
          </div>
        </div>
      )}
    </main>
  );
}

function subscribeDemo(callback: () => void) {
  window.addEventListener("mimelux:state", callback);
  return () => window.removeEventListener("mimelux:state", callback);
}

function cookieOpen() {
  return !readDemo().cookieAccepted;
}

function RoleSwitch({
  professional,
  role,
  label,
  hint,
  creatorLabel,
  affiliateLabel,
  onProfessional,
  onRole,
}: {
  professional: boolean;
  role: AccountRole;
  label: string;
  hint: string;
  creatorLabel: string;
  affiliateLabel: string;
  onProfessional: (next: boolean) => void;
  onRole: (role: AccountRole) => void;
}) {
  return (
    <div data-testid="role-switch" className="pt-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={professional}
          aria-label={label}
          onClick={() => onProfessional(!professional)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${professional ? "bg-primary-strong" : "bg-muted/30"}`}
        >
          <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${professional ? "left-6" : "left-1"}`} />
        </button>
      </div>
      {professional && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {([
            ["creator", creatorLabel],
            ["affiliate", affiliateLabel],
          ] as const).map(([value, text]) => (
            <button
              key={value}
              type="button"
              aria-pressed={role === value}
              onClick={() => onRole(value)}
              className={`h-11 rounded-full text-sm font-semibold transition ${
                role === value ? "bg-ink text-white dark:bg-primary dark:text-ink" : "border border-border bg-elevated text-foreground"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh skeleton" />}>
      <AuthContent />
    </Suspense>
  );
}
