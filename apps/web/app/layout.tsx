import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
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
  description:
    "Assine experiências exclusivas e apoie seus criadores favoritos.",
  applicationName: "Patrocino",
  openGraph: {
    title: "Patrocino — perto de quem inspira",
    description: "Assine experiências exclusivas e apoie seus criadores favoritos.",
    siteName: "Patrocino",
    url: "https://patrocino.com",
    locale: "pt_BR",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${poppins.variable} min-h-full antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
