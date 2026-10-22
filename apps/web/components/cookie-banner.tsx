"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@mimelux/ui";
import { readConsent, subscribeConsent, writeConsent, type ConsentChoice } from "@/lib/consent";
import { getServerSessionSnapshot, getSessionSnapshot, subscribeSession } from "@/lib/session";

function hasAgeCookie() {
  return document.cookie.split(";").some((part) => part.trim().startsWith("patrocino_age=yes"));
}

function subscribeMounted() {
  return () => undefined;
}

function syncScript(id: string, enabled: boolean) {
  const existing = document.getElementById(id);
  if (enabled && !existing) {
    const script = document.createElement("script");
    script.id = id;
    script.type = "text/plain";
    script.dataset.consent = id;
    document.head.appendChild(script);
    return;
  }
  if (!enabled && existing) existing.remove();
}

export function ConsentScripts() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  useEffect(() => {
    syncScript("patrocino-analytics", Boolean(consent?.analytics));
    syncScript("patrocino-marketing", Boolean(consent?.marketing));
  }, [consent]);
  return null;
}

export function CookieBanner() {
  const t = useTranslations("cookies");
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSessionSnapshot);
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  const [forced, setForced] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const open = () => {
      const current = readConsent();
      setAnalytics(Boolean(current?.analytics));
      setMarketing(Boolean(current?.marketing));
      setCustom(true);
      setForced(true);
    };
    window.addEventListener("patrocino:cookies", open);
    return () => window.removeEventListener("patrocino:cookies", open);
  }, []);

  useEffect(() => {
    if (!consent || session.status !== "ready" || !session.user) return;
    const syncKey = `patrocino-consent-synced:${consent.updatedAt}:${consent.analytics}:${consent.marketing}`;
    if (window.sessionStorage.getItem(syncKey)) return;
    window.sessionStorage.setItem(syncKey, "1");
    void fetch("/api/privacy/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        version: consent.version,
        analytics: consent.analytics,
        marketing: consent.marketing,
      }),
    }).catch(() => undefined);
  }, [consent, session.status, session.user]);

  if (!mounted) return null;
  const ageBlocking = !hasAgeCookie() && (session.status !== "ready" || !session.user);
  if ((consent && !forced) || (ageBlocking && !forced)) return null;

  async function save(next: Pick<ConsentChoice, "analytics" | "marketing">) {
    await writeConsent(next);
    setForced(false);
    setCustom(false);
  }

  return (
    <div
      data-testid="cookie-banner"
      role="region"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-[4.75rem] z-[60] mx-auto w-auto max-w-md rounded-[28px] border border-white/10 bg-ink p-4 text-white shadow-2xl sm:inset-x-auto sm:right-6 lg:bottom-6"
    >
      <p id="cookie-banner-title" className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
        {t("title")}
      </p>
      <p className="mt-2 text-xs leading-5 text-white/75">{t("body")}</p>
      <Link href="/privacidade" className="mt-2 inline-block text-xs font-semibold text-white underline-offset-2 hover:underline">
        {t("privacy")}
      </Link>
      {custom && (
        <fieldset className="mt-4 space-y-2">
          <label className="flex items-start gap-2 text-xs text-white/80">
            <input type="checkbox" checked disabled className="mt-0.5" />
            <span>{t("necessaryLock")}</span>
          </label>
          <label className="flex items-start gap-2 text-xs">
            <input
              data-testid="cookie-analytics"
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              <b className="font-semibold">{t("analytics")}</b>
              <span className="mt-0.5 block text-white/60">{t("analyticsHint")}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs">
            <input
              data-testid="cookie-marketing"
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              <b className="font-semibold">{t("marketing")}</b>
              <span className="mt-0.5 block text-white/60">{t("marketingHint")}</span>
            </span>
          </label>
        </fieldset>
      )}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button type="button" size="sm" onClick={() => void save({ analytics: true, marketing: true })}>
          {t("acceptAll")}
        </Button>
        <Button type="button" size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => void save({ analytics: false, marketing: false })}>
          {t("necessaryOnly")}
        </Button>
        {custom ? (
          <Button type="button" size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => void save({ analytics, marketing })}>
            {t("save")}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => {
              setAnalytics(Boolean(consent?.analytics));
              setMarketing(Boolean(consent?.marketing));
              setCustom(true);
            }}
          >
            {t("customize")}
          </Button>
        )}
      </div>
    </div>
  );
}
