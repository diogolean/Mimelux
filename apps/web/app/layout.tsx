import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://patrocino.com"),
  title: {
    default: "Patrocino — perto de quem inspira",
    template: "%s · Patrocino",
  },
  description: "Monetize com a gente do seu jeito. Conteúdo exclusivo, assinaturas e apoio direto aos criadores.",
  applicationName: "Patrocino",
  openGraph: {
    title: "Patrocino — Monetize com a gente do seu jeito",
    description: "Monetize com a gente do seu jeito. Conteúdo exclusivo, assinaturas e apoio direto aos criadores.",
    siteName: "Patrocino",
    url: "https://patrocino.com",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-patrocino.png", width: 1200, height: 630, alt: "Patrocino — Monetize com a gente do seu jeito" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrocino — Monetize com a gente do seu jeito",
    description: "Monetize com a gente do seu jeito. Conteúdo exclusivo, assinaturas e apoio direto aos criadores.",
    images: ["/og-patrocino.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${poppins.variable} min-h-full antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
