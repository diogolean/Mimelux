export const locales = ["pt-BR", "en", "de", "fr"] as const;
export type AppLocale = (typeof locales)[number];

export function writeLocaleCookie(locale: AppLocale) {
  document.cookie = `mimelux-locale=${locale};path=/;max-age=31536000;samesite=lax`;
}

export function resolveLocale(value: string | null | undefined): AppLocale | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.startsWith("pt")) return "pt-BR";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("en")) return "en";
  return locales.find((locale) => locale.toLowerCase() === normalized) ?? null;
}
