import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import OnboardingTour from "@/components/shared/OnboardingTour";
import Shell from "@/components/teacher/Shell";

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
    <Shell title={t("welcome", { name: user.displayName })}>
      {showTour && <OnboardingTour role="teacher" displayName={user.displayName} />}

      <div className="max-w-3xl space-y-6">
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
            {t("studentsToCheck")}: <span className="text-soft-gray">—</span>
          </p>
          <p className="text-sm text-soft-gray/50 mt-2">
            {t("worksheetsAwaiting")}: <span className="text-soft-gray">0</span>
          </p>
        </div>
      </div>
    </Shell>
  );
}
