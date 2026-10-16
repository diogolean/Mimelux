"use client";

import Link from "next/link";
import { BadgeCheck, Landmark, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { payoutScheduleConfirmed } from "@mimelux/core";
import { Button } from "@mimelux/ui";
import { creators } from "@/lib/gateway";

const links = {
  institutional: [
    ["about", "/legal/sobre"],
    ["privacy", "/legal/privacidade"],
    ["terms", "/legal/termos"],
  ],
  creators: [
    ["about", "/auth?route=sign-up&role=creator"],
    ["program", "/legal/criadoras"],
  ],
  affiliates: [
    ["program", "/auth?route=sign-up&role=affiliate"],
    ["privacy", "/legal/afiliados"],
  ],
  legal: [
    ["cookies", "/legal/cookies"],
    ["complaints", "/legal/reclamacoes"],
    ["terms", "/legal/termos"],
  ],
} as const;

export function MonetizeSection() {
  const t = useTranslations("monetize");
  const footer = useTranslations("footer");
  const featured = creators.slice(0, 4);

  return (
    <div data-testid="monetize-section">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary-strong">{t("featuredEyebrow")}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-.045em] sm:text-5xl">{t("featuredTitle")}</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">{t("featuredBody")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {featured.map((creator) => (
            <Link key={creator.id} href={`/creator/${creator.username}`} className="card-lift overflow-hidden rounded-[28px] border border-black/5 bg-white/75 dark:bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.cover} alt="" className="h-36 w-full object-cover" />
              <div className="flex items-center gap-3 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt="" className="size-11 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{creator.name}</p>
                  <p className="truncate text-[10px] text-muted">@{creator.username} · {t("demo")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface/70 px-5 py-16 dark:bg-white/5 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <h2 className="max-w-xl text-4xl font-extrabold tracking-[-.05em] sm:text-6xl">{t("title")}</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted">{t("body")}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth?route=sign-up&role=creator"><Button size="lg">{t("creatorCta")}</Button></Link>
              <Link href="/auth?route=sign-up&role=affiliate"><Button size="lg" variant="outline">{t("affiliateCta")}</Button></Link>
            </div>
          </div>
          <div className="rounded-[32px] bg-ink p-6 text-white shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">{t("payoutEyebrow")}</p>
            <h3 className="mt-3 text-2xl font-extrabold">{t("payoutTitle")}</h3>
            <p className="mt-3 text-xs leading-5 text-white/65">{t("payoutBody")}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="rounded-full bg-white/10 px-3 py-2">Pix</span>
              <span className="rounded-full bg-white/10 px-3 py-2">Stripe</span>
              <span className="rounded-full bg-white/10 px-3 py-2">Crypto</span>
            </div>
            <p className="mt-5 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-ink">
              {t("payoutFlag")}
              {payoutScheduleConfirmed ? "" : ""}
            </p>
          </div>
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, label: t("trustOne") },
            { icon: BadgeCheck, label: t("trustTwo") },
            { icon: Wallet, label: t("trustThree") },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-[24px] border border-black/5 bg-background p-5">
              <Icon className="size-5 text-primary-strong" />
              <p className="mt-4 text-sm font-bold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-ink px-5 py-12 text-white sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["institutional", links.institutional],
              ["creators", links.creators],
              ["affiliates", links.affiliates],
              ["legal", links.legal],
            ] as const
          ).map(([title, items]) => (
            <div key={title}>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/45">{footer(title)}</p>
              <div className="mt-4 space-y-2">
                {items.map(([label, href]) => (
                  <Link key={href} href={href} className="block text-sm text-white/80 hover:text-white">
                    {footer(label)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="flex items-center gap-2 text-lg font-black"><Sparkles className="size-4 text-primary" /> Mimelux</p>
          <Landmark className="size-4 text-white/40" />
        </div>
        <p className="mx-auto mt-4 max-w-6xl text-[10px] leading-5 text-white/45">{footer("note")}</p>
      </footer>
    </div>
  );
}
