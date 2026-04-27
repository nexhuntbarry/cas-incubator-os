import Link from "next/link";
import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";

const ROLE_DASHBOARD: Record<string, { href: string; key: string }> = {
  super_admin: { href: "/admin", key: "admin" },
  admin: { href: "/admin", key: "admin" },
  teacher: { href: "/teacher", key: "teacher" },
  mentor: { href: "/mentor", key: "mentor" },
  student: { href: "/student", key: "student" },
  parent: { href: "/parent", key: "parent" },
};

export default async function NotFound() {
  const user = await getCurrentUser();
  const dashboard = user?.role ? (ROLE_DASHBOARD[user.role] ?? null) : null;
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center mx-auto">
          <Construction size={28} className="text-electric-blue" />
        </div>

        <p className="text-5xl">🚧</p>

        <div>
          <h1 className="text-2xl font-bold text-soft-gray mb-2">
            {t("title")}
          </h1>
          <p className="text-soft-gray/60 text-sm leading-relaxed">
            {t("body")}
          </p>
        </div>

        <div className="space-y-3">
          {user && dashboard ? (
            <>
              <Link
                href={dashboard.href}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors min-h-[44px] w-full"
              >
                {t("goToDashboard", { label: t(`dashboards.${dashboard.key}`) })}
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-soft-gray/70 text-sm font-medium hover:bg-white/5 transition-colors min-h-[44px] w-full"
              >
                {t("backHome")}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors min-h-[44px] w-full"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-soft-gray/70 text-sm font-medium hover:bg-white/5 transition-colors min-h-[44px] w-full"
              >
                {t("backHome")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
