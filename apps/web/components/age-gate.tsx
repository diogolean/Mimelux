"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@mimelux/ui";
import { getSessionSnapshot, subscribeSession } from "@/lib/session";

const COOKIE = "patrocino_age=yes";

function hasAgeCookie() {
  return document.cookie.split(";").some((part) => part.trim().startsWith("patrocino_age=yes"));
}

export function AgeGate() {
  const t = useTranslations("ageGate");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const session = getSessionSnapshot();
      if (hasAgeCookie() || session.status !== "ready" || session.user) {
        setOpen(false);
        return;
      }
      setOpen(true);
    };
    sync();
    const unsubscribe = subscribeSession(sync);
    return () => {
      unsubscribe();
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-ink/70 p-4 sm:place-items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        className="w-full max-w-md rounded-[28px] bg-background p-6 shadow-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary-strong">18+</p>
        <h2 id="age-gate-title" className="mt-2 text-2xl font-extrabold tracking-[-.04em]">{t("title")}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{t("body")}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.assign("https://www.google.com/");
            }}
          >
            {t("no")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              document.cookie = `${COOKIE}; path=/; max-age=31536000; samesite=lax`;
              setOpen(false);
            }}
          >
            {t("yes")}
          </Button>
        </div>
      </div>
    </div>
  );
}
