import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import OnboardingTour from "@/components/shared/OnboardingTour";
import StudentTodoSection from "@/components/assignments/StudentTodoSection";
import Shell from "@/components/student/Shell";

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const t = await getTranslations("dashboard.student");
  const supabase = getServiceClient();

  // Redirect to intake if not completed
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("intake_completed_at")
    .eq("user_id", user.userId)
    .single();

  if (!profile?.intake_completed_at) {
    redirect("/student/intake");
  }

  const [{ data: enrollment }, { data: userRow }, { data: progress }] = await Promise.all([
    supabase
      .from("enrollment_records")
      .select("*, cohorts(name)")
      .eq("student_user_id", user.userId)
      .eq("status", "active")
      .single(),
    supabase
      .from("users")
      .select("onboarded_at")
      .eq("id", user.userId)
      .single(),
    supabase
      .from("student_method_progress")
      .select("stage_number, status")
      .eq("student_user_id", user.userId),
  ]);

  const cohortName = (enrollment?.cohorts as { name: string } | null)?.name;
  const showTour = !userRow?.onboarded_at;

  // Determine current in-progress stage
  const inProgressRow = (progress ?? []).find((p) => p.status === "in_progress");
  const currentStageNumber = inProgressRow?.stage_number ?? 1;

  // Fetch stage name for current stage
  const { data: stageDef } = await supabase
    .from("method_stage_definitions")
    .select("name")
    .eq("stage_number", currentStageNumber)
    .single();

  const currentStageName = stageDef?.name ?? "Interest Discovery";

  // Next worksheet: first not_started or in_progress worksheet for this stage
  const { data: stageDefWithId } = await supabase
    .from("method_stage_definitions")
    .select("id")
    .eq("stage_number", currentStageNumber)
    .single();

  let nextTaskLabel = "—";
  if (stageDefWithId?.id) {
    const { data: templates } = await supabase
      .from("worksheet_templates")
      .select("id, title, linked_method_stage_id")
      .eq("linked_method_stage_id", stageDefWithId.id)
      .eq("is_active", true)
      .order("linked_lesson_number", { ascending: true })
      .limit(5);

    if (templates && templates.length > 0) {
      const { data: submissions } = await supabase
        .from("worksheet_submissions")
        .select("template_id, status")
        .eq("student_user_id", user.userId)
        .in("template_id", templates.map((t) => t.id));

      const submittedIds = new Set((submissions ?? []).map((s) => s.template_id));
      const firstPending = templates.find((t) => !submittedIds.has(t.id));
      if (firstPending) nextTaskLabel = firstPending.title;
    }
  }

  return (
    <Shell title={t("welcome", { name: user.displayName })}>
      {showTour && (
        <OnboardingTour role="student" displayName={user.displayName} />
      )}

      <div className="max-w-3xl space-y-6">
        {/* To-Do section — always at top */}
        <StudentTodoSection />

        {cohortName ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-soft-gray/40 uppercase tracking-wider">
                {t("yourCohort")}
              </span>
            </div>
            <p className="text-vivid-teal font-semibold">{cohortName}</p>
            <p className="text-sm text-soft-gray/50">
              {t("currentStage")}:{" "}
              <span className="text-soft-gray">
                Stage {currentStageNumber} — {currentStageName}
              </span>
            </p>
            <p className="text-sm text-soft-gray/50">
              {t("nextTask")}: <span className="text-soft-gray">{nextTaskLabel}</span>
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
            href="/student/project"
            className="block text-sm text-electric-blue hover:underline"
          >
            {t("myProject")} →
          </Link>
          <Link
            href="/student/method"
            className="block text-sm text-electric-blue hover:underline mt-2"
          >
            {t("methodPipeline")} →
          </Link>
        </div>
      </div>
    </Shell>
  );
}
