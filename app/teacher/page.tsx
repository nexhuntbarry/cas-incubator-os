import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import OnboardingTour from "@/components/shared/OnboardingTour";
import Shell from "@/components/teacher/Shell";
import { Users, FileText, ClipboardList, AlertTriangle, ArrowRight } from "lucide-react";

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const t = await getTranslations("dashboard.teacher");
  const supabase = getServiceClient();

  const [{ data: assignments }, { data: userRow }] = await Promise.all([
    supabase
      .from("cohort_staff_assignments")
      .select("id, cohort_id, cohorts(id, name, is_active)")
      .eq("user_id", user.userId),
    supabase.from("users").select("onboarded_at").eq("id", user.userId).single(),
  ]);

  const showTour = !userRow?.onboarded_at;

  // Cohort scoping (super_admin sees all)
  type AssignmentRow = { id: string; cohort_id: string; cohorts: { id: string; name: string; is_active: boolean } | null };
  const myAssignments = (assignments ?? []) as unknown as AssignmentRow[];
  const cohortIds: string[] = user.role === "super_admin"
    ? []
    : myAssignments.map((a) => a.cohort_id).filter(Boolean);

  // Build student list scope
  let studentIds: string[] | null = null;
  if (user.role !== "super_admin") {
    if (cohortIds.length === 0) {
      studentIds = [];
    } else {
      const { data: enrollments } = await supabase
        .from("enrollment_records")
        .select("student_user_id")
        .in("cohort_id", cohortIds)
        .in("status", ["active", "completed"]);
      studentIds = (enrollments ?? []).map((e) => e.student_user_id);
    }
  }

  // Counts in parallel
  const [studentsCount, pendingSubsCount, openRiskCount, openAssignmentsCount] = await Promise.all([
    (async () => {
      if (user.role === "super_admin") {
        const { count } = await supabase
          .from("enrollment_records")
          .select("id", { count: "exact", head: true })
          .eq("status", "active");
        return count ?? 0;
      }
      return studentIds?.length ?? 0;
    })(),
    (async () => {
      let q = supabase
        .from("worksheet_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted");
      if (studentIds !== null) {
        if (studentIds.length === 0) return 0;
        q = q.in("student_user_id", studentIds);
      }
      const { count } = await q;
      return count ?? 0;
    })(),
    (async () => {
      const { count } = await supabase
        .from("risk_flags")
        .select("id", { count: "exact", head: true })
        .eq("assigned_to_user_id", user.userId)
        .not("status", "in", "(resolved,dismissed)");
      return count ?? 0;
    })(),
    (async () => {
      let q = supabase
        .from("worksheet_assignments")
        .select("id", { count: "exact", head: true })
        .eq("status", "open");
      if (user.role !== "super_admin") {
        q = q.eq("assigned_by", user.userId);
      }
      const { count } = await q;
      return count ?? 0;
    })(),
  ]);

  const activeCohorts = user.role === "super_admin"
    ? null
    : myAssignments.filter((a) => a.cohorts?.is_active !== false);

  const kpis = [
    {
      label: t("studentsToCheck"),
      value: studentsCount,
      href: "/teacher/students",
      icon: Users,
      color: "text-electric-blue",
      bg: "bg-electric-blue/10",
    },
    {
      label: t("worksheetsAwaiting"),
      value: pendingSubsCount,
      href: "/teacher/worksheets/review",
      icon: FileText,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Open assignments",
      value: openAssignmentsCount,
      href: "/teacher/assignments?status=open",
      icon: ClipboardList,
      color: "text-vivid-teal",
      bg: "bg-vivid-teal/10",
    },
    {
      label: "Open risk flags",
      value: openRiskCount,
      href: "/teacher/risks",
      icon: AlertTriangle,
      color: "text-status-warning",
      bg: "bg-status-warning/10",
    },
  ];

  return (
    <Shell title={t("welcome", { name: user.displayName })} introKey="teacher.overview">
      {showTour && <OnboardingTour role="teacher" displayName={user.displayName} />}

      <div className="max-w-5xl space-y-6">
        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <Link
                key={k.label}
                href={k.href}
                className="rounded-xl border border-white/8 bg-white/3 p-4 hover:bg-white/5 hover:border-white/15 transition-all flex flex-col gap-2"
              >
                <div className={`rounded-lg ${k.bg} p-2 w-fit`}>
                  <Icon size={16} className={k.color} />
                </div>
                <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
                <p className="text-[11px] text-soft-gray/50 leading-snug">{k.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Cohorts */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider">{t("yourCohorts")}</p>
            {user.role === "super_admin" && (
              <span className="text-[11px] text-soft-gray/50">All cohorts (admin view)</span>
            )}
          </div>
          {activeCohorts === null ? (
            <p className="text-sm text-soft-gray/50">Super admin — see admin console for cohorts.</p>
          ) : activeCohorts.length > 0 ? (
            activeCohorts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-soft-gray">{a.cohorts?.name ?? "—"}</span>
                <Link
                  href="/teacher/students"
                  className="text-xs text-electric-blue hover:underline flex items-center gap-1"
                >
                  Roster <ArrowRight size={11} />
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-soft-gray/50">{t("noCohorts")}</p>
          )}
        </div>
      </div>
    </Shell>
  );
}
