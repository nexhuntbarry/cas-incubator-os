import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  not_started: "bg-white/10 text-soft-gray/50",
  in_progress: "bg-electric-blue/15 text-electric-blue",
  submitted: "bg-gold/15 text-gold",
  reviewed: "bg-vivid-teal/15 text-vivid-teal",
};

export default async function TeacherProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const t = await getTranslations("teacher.projects");
  const supabase = getServiceClient();

  const { data: assignments } = await supabase
    .from("cohort_staff_assignments")
    .select("cohort_id")
    .eq("user_id", user.userId);

  const cohortIds = assignments?.map((a) => a.cohort_id) ?? [];

  let projectsQuery = supabase
    .from("projects")
    .select(`
      id, title, current_stage, stage_status, created_at,
      users!projects_student_user_id_fkey(display_name, email),
      project_type_definitions(name),
      enrollment_records!projects_enrollment_id_fkey(cohort_id, cohorts(name))
    `)
    .order("updated_at", { ascending: false });

  if (user.role !== "super_admin" && cohortIds.length > 0) {
    const enrollmentIds = await supabase
      .from("enrollment_records")
      .select("id")
      .in("cohort_id", cohortIds);
    const eIds = enrollmentIds.data?.map((e) => e.id) ?? [];
    if (eIds.length > 0) {
      projectsQuery = projectsQuery.in("enrollment_id", eIds);
    }
  }

  const { data: projects } = await projectsQuery;

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <Link href="/teacher" className="text-sm text-soft-gray/60 hover:text-soft-gray">Dashboard</Link>
          <UserButton />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        {(!projects || projects.length === 0) ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/50">{t("empty")}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-soft-gray/50 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">{t("student")}</th>
                  <th className="text-left px-5 py-3">{t("project")}</th>
                  <th className="text-left px-5 py-3">{t("cohort")}</th>
                  <th className="text-left px-5 py-3">{t("stage")}</th>
                  <th className="text-left px-5 py-3">{t("status")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const student = p.users as unknown as { display_name: string; email: string } | null;
                  const cohort = (p.enrollment_records as unknown as { cohorts: { name: string } } | null)?.cohorts;
                  const stageStatus = p.stage_status ?? "not_started";
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium">{student?.display_name ?? "—"}</p>
                        <p className="text-xs text-soft-gray/40">{student?.email}</p>
                      </td>
                      <td className="px-5 py-3 max-w-[200px]">
                        <p className="truncate">{p.title}</p>
                      </td>
                      <td className="px-5 py-3 text-soft-gray/60">{cohort?.name ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className="text-soft-gray/70">Stage {p.current_stage}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[stageStatus] ?? "bg-white/10 text-soft-gray/50"}`}>
                          {stageStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/teacher/projects/${p.id}`}
                          className="flex items-center gap-1 text-electric-blue text-xs hover:underline"
                        >
                          {t("review")} <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
