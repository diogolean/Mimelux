"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  Apple,
  Eye,
  EyeOff,
  Handshake,
  Heart,
  LoaderCircle,
  Music2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Logo } from "@mimelux/ui";
import { DEMO_ACCOUNTS, loginSchema, registerSchema, type AccountRole } from "@mimelux/core";
import { bindAttribution } from "@/lib/affiliates";
import { mockDelay, readDemo, writeDemo } from "@/lib/demo-store";
import { creators, posts } from "@/lib/gateway";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MonetizeSection } from "@/components/monetize-section";
import { toast } from "sonner";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("auth");
  const signUp = params.get("route") === "sign-up";
  const requestedRole = params.get("role");
  const [role, setRole] = useState<AccountRole | null>(
    requestedRole === "fan" || requestedRole === "creator" || requestedRole === "affiliate"
      ? requestedRole
      : null,
  );
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [social, setSocial] = useState("");
  const [error, setError] = useState("");
  const [cookie, setCookie] = useState(() => !readDemo().cookieAccepted);
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
    const nextRole: AccountRole = !signUp
      ? email === DEMO_ACCOUNTS.creator.email
        ? "creator"
        : email === DEMO_ACCOUNTS.affiliate.email
          ? "affiliate"
          : "fan"
      : role ?? "fan";
    const current = readDemo();
    writeDemo({
      signedIn: true,
      role: nextRole,
      verified: !signUp,
      onboarding: !signUp,
      ...(signUp ? bindAttribution(current, email) : {}),
    });
    const destination = signUp
      ? "/verificacao"
      : nextRole === "creator"
        ? "/painel"
        : nextRole === "affiliate"
          ? "/afiliados"
          : "/topcreators?tab=top-creators";
    router.push(destination);
  }

  async function socialLogin(name: string) {
    setSocial(name);
    await mockDelay(850);
    writeDemo({ signedIn: true, verified: true, onboarding: true });
    router.push("/topcreators?tab=top-creators");
  }

  return (
    <main className="bg-background">
      <div className="relative grid min-h-dvh overflow-hidden lg:grid-cols-[minmax(480px,0.9fr)_1.1fr]">
      <section className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-[440px] animate-enter">
          <div className="mb-10 flex items-center justify-between gap-3">
            <Logo />
            <LanguageSwitcher compact />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-primary-strong">
            {signUp ? t("signupEyebrow") : t("loginEyebrow")}
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">
            {signUp && !role ? t("roleQuestion") : signUp ? t("signupTitle") : t("loginTitle")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {signUp && !role ? t("roleBody") : signUp ? t("signupBody") : t("loginBody")}
          </p>

          {signUp && !role ? (
            <div className="mt-8 space-y-3">
              {([
                ["fan", Heart, t("fan"), t("fanBody")],
                ["creator", Sparkles, t("creator"), t("creatorBody")],
                ["affiliate", Handshake, t("affiliate"), t("affiliateBody")],
              ] as const).map(([value, Icon, title, body]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className="flex w-full items-center gap-4 rounded-[24px] border border-black/8 bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary dark:bg-white/5"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/20 text-primary-strong"><Icon className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-extrabold">{title}</span>
                    <span className="mt-1 block text-[11px] leading-5 text-muted">{body}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
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
            {signUp && (
              <button type="button" onClick={() => setRole(null)} className="text-xs font-bold text-muted">{t("back")}</button>
            )}
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
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {signUp ? t("continue") : t("enter")}
            </Button>
          </form>
          )}

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
            onClick={() => {
              writeDemo({ cookieAccepted: true });
              setCookie(false);
            }}
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

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh skeleton" />}>
      <AuthContent />
    </Suspense>
  );
}
