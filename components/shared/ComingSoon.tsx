'use client';

import { Construction } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ComingSoonProps {
  title?: string;
  description?: string;
  role?: string;
}

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  teacher: "/teacher",
  mentor: "/mentor",
  student: "/student",
  parent: "/parent",
};

const ROLE_KEY: Record<string, string> = {
  super_admin: "admin",
  admin: "admin",
  teacher: "teacher",
  mentor: "mentor",
  student: "student",
  parent: "parent",
};

export function ComingSoon({ title, description, role }: ComingSoonProps) {
  const t = useTranslations("notFound");
  const tComing = useTranslations("comingSoon");
  const dashboardHref = role ? (ROLE_DASHBOARD[role] ?? "/") : "/";
  const dashboardKey = role ? (ROLE_KEY[role] ?? "admin") : "admin";

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center mb-6">
        <Construction size={28} className="text-electric-blue" />
      </div>

      <p className="text-4xl mb-3">🚧</p>

      <h2 className="text-xl font-bold text-soft-gray mb-2">
        {title ?? tComing("title")}
      </h2>

      <p className="text-sm text-soft-gray/50 max-w-sm leading-relaxed mb-8">
        {description ?? tComing("body")}
      </p>

      <Link
        href={dashboardHref}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors min-h-[44px]"
      >
        {t("goToDashboard", { label: t(`dashboards.${dashboardKey}`) })}
      </Link>
    </div>
  );
}
