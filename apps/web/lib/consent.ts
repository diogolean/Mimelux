import { consentCookieName, consentVersion } from "@mimelux/core";
import { readDemo, writeDemo } from "@/lib/demo-store";

export type ConsentChoice = {
  version: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const storageKey = "patrocino-consent";

let cachedKey = "";
let cachedChoice: ConsentChoice | null = null;

function parseChoice(raw: string): ConsentChoice | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    if (parsed.version !== consentVersion || parsed.necessary !== true) return null;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") return null;
    return {
      version: consentVersion,
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

function readCookie() {
  const prefix = `${consentCookieName}=`;
  const part = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(prefix));
  if (!part) return "";
  try {
    return decodeURIComponent(part.slice(prefix.length));
  } catch {
    return "";
  }
}

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(storageKey) || readCookie();
  const legacy = readDemo().cookieAccepted ? "legacy" : "";
  const key = `${stored}|${legacy}`;
  if (key === cachedKey) return cachedChoice;
  cachedKey = key;
  const parsed = stored ? parseChoice(stored) : null;
  if (parsed) {
    cachedChoice = parsed;
    return cachedChoice;
  }
  if (!stored && legacy) {
    cachedChoice = {
      version: consentVersion,
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: "",
    };
    return cachedChoice;
  }
  cachedChoice = null;
  return null;
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener("patrocino:consent", callback);
  return () => window.removeEventListener("patrocino:consent", callback);
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event("patrocino:cookies"));
}

export function writeConsent(choice: { analytics: boolean; marketing: boolean }) {
  const record: ConsentChoice = {
    version: consentVersion,
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    updatedAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(record);
  window.localStorage.setItem(storageKey, raw);
  document.cookie = `${consentCookieName}=${encodeURIComponent(raw)}; path=/; max-age=31536000; samesite=lax`;
  writeDemo({ cookieAccepted: true });
  cachedKey = "";
  window.dispatchEvent(new Event("patrocino:consent"));
}
