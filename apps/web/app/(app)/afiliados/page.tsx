"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Copy, Link2, ShieldAlert } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLocale, useTranslations } from "next-intl";
import { minimumPayoutCents, paymentProviders, payoutScheduleConfirmed } from "@mimelux/core";
import { Button, Pill } from "@mimelux/ui";
import { affiliateLink, affiliateSummary, demoAffiliate } from "@/lib/affiliates";
import { brl, compact, creatorLikeTotal, creators } from "@/lib/gateway";
import { readDemo, writeDemo } from "@/lib/demo-store";
import { paymentGateway } from "@/lib/payments";
import { useRoleGuard } from "@/lib/use-role-guard";
import { toast } from "sonner";

export default function AffiliateDashboardPage() {
  const allowed = useRoleGuard("affiliate");
  const t = useTranslations("affiliate");
  const locale = useLocale();
  const [state, setState] = useState(() => readDemo());
  const [creatorId, setCreatorId] = useState(creators[0]!.id);
  const [subId, setSubId] = useState("tiktok");
  const enabledCreators = creators.filter((item) => state.enabledCreatorIds.includes(item.id));
  const creator = enabledCreators.find((item) => item.id === creatorId) ?? enabledCreators[0];
  const link = creator ? affiliateLink(creator.username, subId || "canal", locale) : "";
  const origin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "",
  );
  const absoluteLink = `${origin}${link}`;
  const summary = useMemo(() => affiliateSummary(state), [state]);
  const grouped = useMemo(() => {
    const rows = new Map<string, { creator: string; subId: string; clicks: number; sales: number; commission: number; suspicious: boolean }>();
    for (const click of state.clicks) {
      const key = `${click.creatorId}:${click.subId}`;
      const current = rows.get(key) ?? {
        creator: creators.find((item) => item.id === click.creatorId)?.name ?? click.creatorSlug,
        subId: click.subId,
        clicks: 0,
        sales: 0,
        commission: 0,
        suspicious: false,
      };
      current.clicks += 1;
      current.suspicious = current.suspicious || click.suspicious;
      rows.set(key, current);
    }
    for (const commission of state.commissions) {
      const key = `${commission.creatorId}:${commission.subId}`;
      const current = rows.get(key);
      if (!current || commission.status === "rejected") continue;
      current.sales += 1;
      current.commission += commission.amountCents;
    }
    return Array.from(rows.values());
  }, [state]);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success(t("copied"));
  }

  async function withdraw() {
    await paymentGateway.requestPayout({
      provider: state.payoutSettings.method,
      amountCents: summary.approvedCents,
      destinationLabel: state.payoutSettings.destination,
    });
    toast.success(t("withdrawDemo"));
  }

  function toggleCreator(id: string) {
    const current = readDemo();
    const enabledCreatorIds = current.enabledCreatorIds.includes(id)
      ? current.enabledCreatorIds.filter((item) => item !== id)
      : [...current.enabledCreatorIds, id];
    setState(writeDemo({ enabledCreatorIds }));
    setCreatorId(id);
  }

  if (!allowed) return <div className="m-6 h-[70vh] rounded-[30px] skeleton" />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:py-9">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{t("eyebrow")}</Pill>
        <Pill>Demo · {demoAffiliate.name}</Pill>
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-.045em]">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">{t("body")}</p>

      <section data-testid="affiliate-mosaic" className="mt-8">
        <h2 className="text-2xl font-extrabold tracking-[-.04em]">{t("mosaicTitle")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{t("mosaicBody")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {creators.map((item) => {
            const enabled = state.enabledCreatorIds.includes(item.id);
            return (
              <article key={item.id} data-testid="affiliate-creator-card" className="overflow-hidden rounded-[28px] border border-border bg-elevated shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.cover} alt="" loading="lazy" decoding="async" className="h-52 w-full object-cover sm:h-64" />
                <div className="flex items-end gap-3 px-4 pb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.avatar} alt="" loading="lazy" decoding="async" className="-mt-8 size-16 rounded-full border-4 border-elevated object-cover shadow-lg" />
                  <div className="min-w-0 flex-1 pt-3">
                    <h3 className="truncate text-base font-extrabold">{item.name}</h3>
                    <p className="truncate text-xs text-muted">{item.city}</p>
                    <p className="mt-1 text-xs font-semibold">{compact(item.subscribers)} · {compact(creatorLikeTotal(item.id))} {t("likes")}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    data-testid={`enable-${item.username}`}
                    aria-pressed={enabled}
                    onClick={() => toggleCreator(item.id)}
                    className={`h-11 w-full rounded-full text-sm font-bold ${enabled ? "bg-ink text-white" : "bg-primary text-ink"}`}
                  >
                    {enabled ? t("enabled") : t("enable")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t("clicks"), String(summary.clicks)],
          [t("signups"), String(summary.signups)],
          [t("sales"), String(summary.sales)],
          [t("conversion"), `${Math.round(summary.conversionRate * 1000) / 10}%`],
          [t("epc"), brl(summary.earningsPerClickCents)],
          [t("pending"), brl(summary.pendingCents)],
          [t("approved"), brl(summary.approvedCents)],
          [t("paid"), brl(summary.paidCents)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[24px] border border-black/5 bg-white/70 p-4 dark:bg-white/5">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 dark:bg-white/5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold"><Link2 className="size-4" /> {t("links")}</h2>
          {enabledCreators.length === 0 || !creator ? (
            <p data-testid="affiliate-no-links" className="mt-4 rounded-2xl bg-surface/70 p-4 text-sm font-semibold">{t("noLinks")}</p>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <select aria-label={t("links")} value={creator.id} onChange={(event) => setCreatorId(event.target.value)} className="h-12 rounded-2xl border border-black/10 bg-background px-3 text-xs font-semibold">
                  {enabledCreators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input aria-label={t("subId")} value={subId} onChange={(event) => setSubId(event.target.value.slice(0, 40))} className="h-12 rounded-2xl border border-black/10 bg-background px-3 text-xs" />
              </div>
              <ul data-testid="affiliate-links" className="mt-4 space-y-2">
                {enabledCreators.map((item) => {
                  const href = `${origin}${affiliateLink(item.username, subId || "canal", locale)}`;
                  return (
                    <li key={item.id} data-testid="affiliate-link" className="rounded-2xl bg-surface/70 p-3 dark:bg-white/5">
                      <p className="text-sm font-extrabold">{item.name}</p>
                      <p className="mt-1 break-all text-[10px] font-semibold">{href}</p>
                    </li>
                  );
                })}
              </ul>
              <Button className="mt-4" onClick={() => copy(absoluteLink)}><Copy className="size-4" /> {t("copy")}</Button>
              <div className="mt-5 flex items-center gap-4">
                <div className="rounded-2xl bg-white p-3">
                  <QRCodeSVG value={absoluteLink || "https://patrocino.com"} size={112} includeMargin={false} />
                </div>
                <p className="text-[10px] leading-5 text-muted">{t("qr")}</p>
              </div>
            </>
          )}
        </div>
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 dark:bg-white/5">
          {creator ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.cover} alt="" className="h-36 w-full object-cover" />
            </>
          ) : null}
          <div className="p-5">
            <h2 className="text-sm font-extrabold">{t("kit")}</h2>
            <p className="mt-3 text-xs leading-5">{creator ? t("kitCopy", { name: creator.name }) : t("noLinks")}</p>
            {creator && <Button variant="outline" className="mt-4" onClick={() => copy(t("kitCopy", { name: creator.name }))}>{t("copyKit")}</Button>}
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[28px] border border-black/5 bg-white/70 dark:bg-white/5">
        <h2 className="px-5 pt-5 text-sm font-extrabold">{t("breakdown")}</h2>
        <div className="mt-3 divide-y divide-black/5">
          {grouped.map((row) => (
            <div key={`${row.creator}-${row.subId}`} data-testid="affiliate-row" className="grid grid-cols-2 gap-2 px-5 py-3 text-xs sm:grid-cols-5">
              <b className="truncate">{row.creator}</b>
              <span>{row.subId}</span>
              <span>{row.clicks}</span>
              <span>{row.sales}</span>
              <span className="flex items-center gap-1 font-bold">{brl(row.commission)} {row.suspicious && <ShieldAlert className="size-3 text-accent-strong" aria-label={t("suspicious")} />}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-black/5 bg-white/70 p-5 dark:bg-white/5">
        <h2 className="text-sm font-extrabold">{t("payouts")}</h2>
        <p className="mt-2 text-[10px] leading-5 text-muted">{t("schedule")} {t("hold")} {t("renewal")}</p>
        {!payoutScheduleConfirmed && <p className="mt-2 text-[10px] font-bold text-primary-strong">{t("schedule")}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {paymentProviders.map((method) => (
            <button key={method} type="button" onClick={() => {
              const next = { ...state.payoutSettings, method };
              setState(writeDemo({ payoutSettings: next }));
            }}>
              <Pill active={state.payoutSettings.method === method}>{method}</Pill>
            </button>
          ))}
        </div>
        <label className="mt-4 block text-[10px] font-bold text-muted">
          {t("destination")}
          <input value={state.payoutSettings.destination} onChange={(event) => {
            const next = { ...state.payoutSettings, destination: event.target.value };
            setState(writeDemo({ payoutSettings: next }));
          }} className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-background px-3 text-xs font-semibold text-foreground" />
        </label>
        <p className="mt-3 text-[10px] text-muted">{t("minimum")}</p>
        <Button className="mt-4" disabled={summary.approvedCents < minimumPayoutCents} onClick={withdraw}>{t("withdraw")}</Button>
      </section>
    </div>
  );
}
