import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Logo } from "@mimelux/ui";

const pages = ["sobre", "privacidade", "termos", "cookies", "reclamacoes", "criadores", "criadoras", "afiliados"] as const;

export default async function LegalPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  if (!pages.includes(slug as (typeof pages)[number])) notFound();
  const t = await getTranslations("legal");
  const footer = await getTranslations("footer");
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-5 py-10">
      <Logo compact />
      <h1 className="mt-10 text-3xl font-extrabold capitalize">{slug.replace("-", " ")}</h1>
      <p className="mt-4 text-sm leading-7 text-muted">{t("demo")} {footer("note")}</p>
      <Link href="/auth?route=sign-in" className="mt-8 inline-block text-sm font-bold text-primary-strong">{footer("about")}</Link>
    </main>
  );
}
