import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { resolveLocale } from "./locale";

export { locales, resolveLocale } from "./locale";
export type { AppLocale } from "./locale";

export default getRequestConfig(async () => {
  const jar = await cookies();
  const header = await headers();
  const locale =
    resolveLocale(jar.get("mimelux-locale")?.value) ??
    resolveLocale(header.get("accept-language")) ??
    "pt-BR";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
