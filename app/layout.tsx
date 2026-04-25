import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CAS Incubator OS",
    template: "%s | CAS Incubator OS",
  },
  description:
    "Build Ideas. Shape Projects. Launch Impact. — An AI-powered project-based learning platform for the next generation of builders.",
  keywords: [
    "CAS Incubator OS",
    "project-based learning",
    "AI education",
    "student projects",
    "incubator",
    "高中創業",
    "專案學習",
  ],
  openGraph: {
    title: "CAS Incubator OS",
    description: "Build Ideas. Shape Projects. Launch Impact.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const htmlLang = locale === "en" ? "en" : "zh-TW";

  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang={htmlLang} className={plusJakartaSans.variable}>
        <body className="font-sans antialiased bg-deep-navy text-soft-gray">
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
