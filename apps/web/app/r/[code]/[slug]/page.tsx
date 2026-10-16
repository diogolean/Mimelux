"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Logo } from "@mimelux/ui";
import { demoAffiliate, recordClick } from "@/lib/affiliates";
import { brl, creators } from "@/lib/gateway";
import { readDemo, writeDemo } from "@/lib/demo-store";
import { LanguageSwitcher } from "@/components/language-switcher";
import { resolveLocale, writeLocaleCookie } from "@/i18n/locale";

function PromotionLanding() {
  const params = useParams<{ code: string; slug: string }>();
  const search = useSearchParams();
  const t = useTranslations("landing");
  const locale = useLocale();
  const creator = creators.find((item) => item.username === params.slug);
  const subId = search.get("sub") || "direct";
  const requestedLocale = resolveLocale(search.get("lang"));
  const tracked = useRef(false);

  useEffect(() => {
    if (!creator || params.code !== demoAffiliate.code || tracked.current) return;
    if (requestedLocale && requestedLocale !== locale) {
      writeLocaleCookie(requestedLocale);
      window.location.replace(window.location.href);
      return;
    }
    tracked.current = true;
    const state = readDemo();
    const suspicious = /bot|spam/i.test(subId);
    writeDemo(recordClick(state, {
      creatorId: creator.id,
      creatorSlug: creator.username,
      subId,
      locale: requestedLocale ?? locale,
      suspicious,
    }));
    void fetch("/api/affiliate/clicks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: params.code,
        slug: creator.username,
        creatorId: creator.id,
        subId,
        locale: requestedLocale ?? locale,
      }),
    });
  }, [creator, locale, params.code, requestedLocale, subId]);

  if (!creator || params.code !== demoAffiliate.code) {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <Logo compact />
          <h1 className="mt-6 text-2xl font-extrabold">{t("missing")}</h1>
          <Link href="/auth?route=sign-in" className="mt-5 inline-block text-sm font-bold text-primary-strong">{t("back")}</Link>
        </div>
      </main>
    );
  }

  const signup = `/auth?route=sign-up&role=fan&next=/creator/${creator.username}`;

  return (
    <main className="min-h-dvh bg-background">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-8">
        <Logo compact />
        <LanguageSwitcher
          compact
          onChange={(next) => {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", next);
            window.location.assign(url.toString());
          }}
        />
      </header>
      <section className="relative min-h-[92dvh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={creator.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
        <div className="relative z-10 flex min-h-[92dvh] items-end px-5 pb-24 pt-28 sm:px-10">
          <div className="w-full max-w-xl text-white">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">{t("presents")}</p>
            <h1 className="mt-3 text-5xl font-extrabold tracking-[-.06em] sm:text-7xl">{creator.name}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75">{creator.bio}</p>
            <p className="mt-3 text-[10px] font-semibold text-primary">{t("fictitious")}</p>
            <p className="mt-2 text-[10px] text-white/60">{t("promoted", { affiliate: demoAffiliate.name })} · {subId}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={signup}><Button size="lg">{t("cta")}</Button></Link>
              <Link href={`/creator/${creator.username}`}><Button size="lg" variant="outline" className="bg-white/10 text-white">{t("secondary")}</Button></Link>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 py-12 sm:grid-cols-3 sm:px-8">
        {[t("benefitOne"), t("benefitTwo"), t("benefitThree")].map((item) => (
          <article key={item} className="rounded-[24px] border border-black/5 bg-white/70 p-5 dark:bg-white/5">
            <ShieldCheck className="size-5 text-primary-strong" />
            <h2 className="mt-4 text-sm font-extrabold">{t("benefitsTitle")}</h2>
            <p className="mt-2 text-xs leading-5 text-muted">{item}</p>
          </article>
        ))}
      </section>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pb-28 sm:flex-row sm:items-center sm:px-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={creator.avatar} alt="" className="size-20 rounded-[24px] object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-extrabold"><BadgeCheck className="size-4 text-primary-strong" /> {t("socialProof")}</p>
          <p className="mt-2 text-2xl font-black">{creator.subscribers.toLocaleString("pt-BR")} {t("members")}</p>
          <p className="mt-2 text-xs leading-5 text-muted">{t("quote")}</p>
        </div>
        <p className="text-sm font-black">{creator.free ? t("secondary") : brl(creator.price)}</p>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-background/90 p-3 backdrop-blur lg:hidden">
        <Link href={signup} className="block"><Button size="lg" className="w-full"><Sparkles className="size-4" /> {t("cta")}</Button></Link>
      </div>
    </main>
  );
}

export default function PromotionPage() {
  return <Suspense fallback={<div className="min-h-dvh skeleton" />}><PromotionLanding /></Suspense>;
}
