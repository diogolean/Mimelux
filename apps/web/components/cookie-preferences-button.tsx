"use client";

import { openConsentPreferences } from "@/lib/consent";

export function CookiePreferencesButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      data-testid="cookie-preferences"
      className="text-white/80 hover:text-white"
      onClick={() => openConsentPreferences()}
    >
      {label}
    </button>
  );
}
