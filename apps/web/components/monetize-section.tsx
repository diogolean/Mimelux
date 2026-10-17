"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Landmark,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
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

  return (
    <div data-testid="monetize-section" className="relative z-10 bg-background">
      <section className="mx-auto grid min-h-[720px] w-full max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-24">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-primary-strong">
            {t("featuredEyebrow")}
          </p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-.055em] sm:text-6xl">
            Criadoras em destaque
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            {t("featuredTitle")} {t("featuredBody")}
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs font-bold text-muted">
            <span className="size-2 rounded-full bg-accent" />
            Atualizações automáticas · deslize para explorar
          </div>
        </div>
        <FeaturedCarousel demoLabel={t("demo")} />
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

function FeaturedCarousel({ demoLabel }: { demoLabel: string }) {
  const featured = creators.slice(0, 6);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % featured.length),
      4_500,
    );
    return () => window.clearInterval(timer);
  }, [featured.length, paused]);

  function move(direction: number) {
    setActive((current) => (current + direction + featured.length) % featured.length);
  }

  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientX;
        if (touchStart.current !== null && end !== undefined) {
          const delta = end - touchStart.current;
          if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1);
        }
        touchStart.current = null;
        setPaused(false);
      }}
    >
      <div className="overflow-hidden rounded-[36px] border border-border bg-elevated shadow-[0_32px_90px_rgba(24,23,37,.18)]">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {featured.map((creator) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.username}`}
              className="relative block min-w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creator.cover}
                alt={`Destaque de ${creator.name}`}
                className="h-[500px] w-full object-cover sm:h-[580px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-6 text-white sm:p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={creator.avatar}
                  alt=""
                  className="size-20 rounded-[26px] border-4 border-white/25 object-cover shadow-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-extrabold">{creator.name}</p>
                  <p className="mt-1 text-xs text-white/70">
                    @{creator.username} · {creator.category} · {demoLabel}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-2">
          {featured.map((creator, index) => (
            <button
              key={creator.id}
              type="button"
              aria-label={`Mostrar ${creator.name}`}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all ${
                index === active ? "w-8 bg-primary-strong" : "w-2 bg-muted/30"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Anterior" onClick={() => move(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Próxima" onClick={() => move(1)}>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
