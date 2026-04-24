import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import OnboardingTour from "@/components/shared/OnboardingTour";

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const t = await getTranslations("dashboard.teacher");
  const supabase = getServiceClient();

  const [{ data: assignments }, { data: userRow }] = await Promise.all([
    supabase
      .from("cohort_staff_assignments")
      .select("*, cohorts(name, is_active)")
      .eq("user_id", user.userId),
    supabase.from("users").select("onboarded_at").eq("id", user.userId).single(),
  ]);

  const showTour = !userRow?.onboarded_at;

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      {showTour && <OnboardingTour role="teacher" displayName={user.displayName} />}
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

        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
          <p className="text-xs text-soft-gray/40 uppercase tracking-wider">{t("yourCohorts")}</p>
          {assignments && assignments.length > 0 ? (
            assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <span className="text-sm text-soft-gray">
                  {(a.cohorts as { name: string } | null)?.name ?? "—"}
                </span>
                <span className="text-xs text-vivid-teal">{t("active")}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-soft-gray/50">{t("noCohorts")}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-sm text-soft-gray/50">
            {t("studentsToCheck")}: <span className="text-soft-gray">{t("placeholder")}</span>
          </p>
          <p className="text-sm text-soft-gray/50 mt-2">
            {t("worksheetsAwaiting")}: <span className="text-soft-gray">0</span>
          </p>
        </div>
      </main>
    </div>
  );
}
