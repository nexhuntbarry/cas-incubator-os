import { Construction } from "lucide-react";
import Link from "next/link";

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

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Admin",
  admin: "Admin",
  teacher: "Teacher",
  mentor: "Mentor",
  student: "Student",
  parent: "Parent",
};

export function ComingSoon({ title, description, role }: ComingSoonProps) {
  const dashboardHref = role ? (ROLE_DASHBOARD[role] ?? "/") : "/";
  const dashboardLabel = role ? (ROLE_LABEL[role] ?? "Dashboard") : "Dashboard";

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center mb-6">
        <Construction size={28} className="text-electric-blue" />
      </div>

      <p className="text-4xl mb-3">🚧</p>

      <h2 className="text-xl font-bold text-soft-gray mb-2">
        {title ?? "此功能尚未建置"}
      </h2>

      <p className="text-sm text-soft-gray/50 max-w-sm leading-relaxed mb-8">
        {description ??
          "We're working on this. Check back soon or return to your dashboard."}
      </p>

      <Link
        href={dashboardHref}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors min-h-[44px]"
      >
        Go to {dashboardLabel}
      </Link>
    </div>
  );
}
