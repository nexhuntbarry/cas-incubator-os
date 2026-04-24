import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const t = await getTranslations("dashboard.student");
  const supabase = getServiceClient();

  const { data: enrollment } = await supabase
    .from("enrollment_records")
    .select("*, cohorts(name)")
    .eq("student_user_id", user.userId)
    .eq("status", "active")
    .single();

  const cohortName = (enrollment?.cohorts as { name: string } | null)?.name;

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-2xl font-bold">
          {t("welcome", { name: user.displayName })}
        </h1>

        {cohortName ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-soft-gray/40 uppercase tracking-wider">
                {t("yourCohort")}
              </span>
            </div>
            <p className="text-vivid-teal font-semibold">{cohortName}</p>
            <p className="text-sm text-soft-gray/50">
              {t("currentStage")}: <span className="text-soft-gray">Stage 1 — Interest Discovery</span>
            </p>
            <p className="text-sm text-soft-gray/50">
              {t("nextTask")}: <span className="text-soft-gray">{t("nextTaskPlaceholder")}</span>
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5">
            <p className="text-soft-gray/50 text-sm">{t("noCohort")}</p>
          </div>
        )}

        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-sm font-semibold text-soft-gray/70 mb-3">{t("quickLinks")}</p>
          <Link
            href="#"
            className="block text-sm text-electric-blue hover:underline"
          >
            {t("projectsPlaceholder")} →
          </Link>
        </div>
      </main>
    </div>
  );
}
