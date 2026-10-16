"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import {
  Apple,
  Eye,
  EyeOff,
  LoaderCircle,
  Music2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button, Logo } from "@mimelux/ui";
import { DEMO_ACCOUNTS, loginSchema, registerSchema } from "@mimelux/core";
import { mockDelay, readDemo, writeDemo } from "@/lib/demo-store";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const signUp = params.get("route") === "sign-up";
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [social, setSocial] = useState("");
  const [error, setError] = useState("");
  const [cookie, setCookie] = useState(false);

  useEffect(() => {
    setCookie(!readDemo().cookieAccepted);
  }, []);

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
          role: form.get("role"),
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
    writeDemo({
      signedIn: true,
      role: String(form.get("role") || "fan") as "fan" | "creator",
      verified: !signUp,
      onboarding: !signUp,
    });
    router.push(signUp ? "/verificacao" : "/topcreators?tab=top-creators");
  }

  async function socialLogin(name: string) {
    setSocial(name);
    await mockDelay(850);
    writeDemo({ signedIn: true, verified: true, onboarding: true });
    router.push("/topcreators?tab=top-creators");
  }

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-background lg:grid-cols-[minmax(480px,0.9fr)_1.1fr]">
      <section className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-[440px] animate-enter">
          <Logo className="mb-10" />
          <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-[#B16E35]">
            {signUp ? "Sua comunidade começa aqui" : "Perto de quem inspira"}
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">
            {signUp ? "Crie sua conta" : "Que bom ter você aqui."}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {signUp
              ? "Entre para uma comunidade feita de conexões reais e conteúdo único."
              : "Entre para descobrir conteúdos e experiências que não estão em nenhum outro lugar."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-3">
            {signUp && (
              <input
                name="name"
                aria-label="Seu nome"
                placeholder="Seu nome"
                autoComplete="name"
                className="h-13 w-full rounded-full border border-black/8 bg-white/70 px-5 text-sm outline-none transition focus:border-[#E9A15E] focus:ring-4 focus:ring-[#E9A15E]/15 dark:bg-white/5"
              />
            )}
            <input
              name="email"
              aria-label="Email ou CPF"
              defaultValue={signUp ? "" : DEMO_ACCOUNTS.fan.email}
              placeholder={signUp ? "E-mail" : "E-mail ou CPF"}
              autoComplete="email"
              className="h-13 w-full rounded-full border border-black/8 bg-white/70 px-5 text-sm outline-none transition focus:border-[#E9A15E] focus:ring-4 focus:ring-[#E9A15E]/15 dark:bg-white/5"
            />
            <div className="relative">
              <input
                name="password"
                aria-label="Senha"
                defaultValue={signUp ? "" : DEMO_ACCOUNTS.fan.password}
                type={visible ? "text" : "password"}
                placeholder="Senha"
                autoComplete={signUp ? "new-password" : "current-password"}
                className="h-13 w-full rounded-full border border-black/8 bg-white/70 px-5 pr-13 text-sm outline-none transition focus:border-[#E9A15E] focus:ring-4 focus:ring-[#E9A15E]/15 dark:bg-white/5"
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
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="cursor-pointer">
                  <input className="peer sr-only" type="radio" name="role" value="fan" defaultChecked />
                  <span className="flex h-12 items-center justify-center rounded-full border border-black/8 bg-white/50 text-xs font-bold peer-checked:border-[#E9A15E] peer-checked:bg-[#E9A15E]/15 dark:bg-white/5">
                    Quero acompanhar
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" type="radio" name="role" value="creator" />
                  <span className="flex h-12 items-center justify-center rounded-full border border-black/8 bg-white/50 text-xs font-bold peer-checked:border-[#E9A15E] peer-checked:bg-[#E9A15E]/15 dark:bg-white/5">
                    Sou criador(a)
                  </span>
                </label>
              </div>
            )}
            {!signUp && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-semibold text-muted hover:text-foreground">
                  Esqueceu sua senha?
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className="rounded-2xl bg-[#E9B0A7]/25 px-4 py-3 text-xs font-medium">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {signUp ? "Continuar" : "Entrar"}
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
            {signUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <Link
              href={signUp ? "/auth?route=sign-in" : "/auth?route=sign-up"}
              className="font-bold text-[#B16E35] hover:underline"
            >
              {signUp ? "Entrar" : "Cadastre-se"}
            </Link>
          </p>
        </div>
      </section>

      <aside className="relative m-3 hidden min-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[36px] bg-[#F0E8DE] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(233,176,167,.8),transparent_24rem),radial-gradient(circle_at_20%_90%,rgba(233,161,94,.42),transparent_25rem)]" />
        <div className="absolute left-12 top-12 flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-2 text-xs font-semibold backdrop-blur">
          <ShieldCheck className="size-4 text-[#B16E35]" />
          Conteúdo no seu ritmo
        </div>
        <div className="absolute inset-x-0 top-[16%] flex justify-center">
          <div className="relative h-[480px] w-[310px] [animation:float_6s_ease-in-out_infinite]">
            <div className="absolute inset-0 rotate-[-6deg] rounded-[44px] bg-[#202027]/10" />
            <div className="absolute inset-0 overflow-hidden rounded-[44px] border-[7px] border-white bg-white shadow-[0_30px_80px_rgba(32,32,39,.18)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/posts/marina-1.jpg" alt="Viagem com Marina Luz" className="h-[68%] w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/media/avatars/marina.jpg" alt="" className="size-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-extrabold text-[#202027]">Marina Luz</p>
                    <p className="text-[10px] text-black/50">@marinaluz</p>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-[#F0E8DE]" />
                <div className="mt-2 h-2 w-3/5 rounded-full bg-[#F0E8DE]" />
              </div>
            </div>
            <span className="absolute -right-8 top-20 grid size-16 place-items-center rounded-3xl bg-[#E9A15E] shadow-xl">
              <Sparkles className="size-7 text-[#202027]" />
            </span>
          </div>
        </div>
        <div className="absolute inset-x-12 bottom-12">
          <h2 className="max-w-lg text-4xl font-extrabold leading-[1.1] tracking-[-.045em] text-[#202027]">
            Exclusivo para você.
            <br />
            Valioso para quem cria.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-black/55">
            Uma experiência premium para apoiar talentos e chegar mais perto de tudo o que inspira você.
          </p>
        </div>
      </aside>

      {cookie && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-3xl border border-white/10 bg-[#202027] p-4 text-white shadow-2xl sm:flex-row sm:items-center sm:px-5">
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
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#FAF8F5]/90 backdrop-blur-md dark:bg-[#151519]/90">
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#E9A15E]">
              <LoaderCircle className="size-7 animate-spin text-[#202027]" />
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
