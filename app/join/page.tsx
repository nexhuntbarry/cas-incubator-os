import { getTranslations } from "next-intl/server";
import Logo from "@/components/Logo";
import Link from "next/link";

export default async function JoinPage() {
  const t = await getTranslations("join");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-deep-navy">
      <Logo size={56} className="mb-6" />
      <h1 className="text-2xl font-bold text-soft-gray mb-2">{t("title")}</h1>
      <p className="text-soft-gray/50 text-sm mb-8 text-center max-w-sm">
        {t("subtitle")}
      </p>
      <Link
        href="/sign-in"
        className="px-6 py-3 rounded-xl bg-electric-blue text-white font-semibold text-sm hover:bg-electric-blue/90 transition-colors"
      >
        {t("signInToJoin")}
      </Link>
    </main>
  );
}
