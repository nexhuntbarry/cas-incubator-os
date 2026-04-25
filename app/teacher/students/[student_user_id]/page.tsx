import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle, FileText, Lock } from "lucide-react";
import WorkLinksGrid from "@/components/project/WorkLinksGrid";
import { formatDate } from "@/lib/dates";

interface StageProgress {
  stage_number: number;
  status: string;
  submitted_at: string | null;
}

interface Submission {
  id: string;
  template_id: string;
  status: string;
  submitted_at: string | null;
  version_number: number;
  feedback: string | null;
}

interface WorksheetTemplate {
  id: string;
  title: string;
  linked_lesson_number: number | null;
  linked_method_stage_id: string | null;
  stage_number: number | null;
  stage_name: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted:          { label: "Submitted",       cls: "bg-gold/15 text-gold" },
    reviewed:           { label: "Reviewed",        cls: "bg-vivid-teal/15 text-vivid-teal" },
    approved:           { label: "Approved",        cls: "bg-vivid-teal/15 text-vivid-teal" },
    revision_requested: { label: "Revision Needed", cls: "bg-status-warning/15 text-status-warning" },
    in_progress:        { label: "In Progress",     cls: "bg-electric-blue/15 text-electric-blue" },
    not_started:        { label: "Not Started",     cls: "bg-white/5 text-soft-gray/40" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-white/5 text-soft-gray/40" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

const STAGE_PIPELINE_STATUS: Record<string, { cls: string; label: string }> = {
  approved:           { cls: "bg-vivid-teal border-vivid-teal",       label: "Approved" },
  reviewed:           { cls: "bg-vivid-teal/60 border-vivid-teal/60", label: "Reviewed" },
  submitted:          { cls: "bg-gold border-gold",                    label: "Submitted" },
  in_progress:        { cls: "bg-electric-blue border-electric-blue",  label: "In Progress" },
  revision_requested: { cls: "bg-status-warning border-status-warning", label: "Revision" },
  not_started:        { cls: "bg-white/10 border-white/20",            label: "Not Started" },
};

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ student_user_id: string }>;
}) {
  const { student_user_id: studentUserId } = await params;

  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();

  // RBAC: verify teacher has access to this student's cohort
  if (user.role !== "super_admin") {
    const { data: assignments } = await supabase
      .from("cohort_staff_assignments")
      .select("cohort_id")
      .eq("user_id", user.userId);

    const cohortIds = assignments?.map((a) => a.cohort_id) ?? [];

    if (cohortIds.length > 0) {
      const { data: enrollment } = await supabase
        .from("enrollment_records")
        .select("id")
        .eq("student_user_id", studentUserId)
        .in("cohort_id", cohortIds)
        .limit(1)
        .single();

      if (!enrollment) redirect("/teacher");
    } else {
      redirect("/teacher");
    }
  }

  // Student info
  const { data: studentUser } = await supabase
    .from("users")
    .select("id, display_name, email")
    .eq("id", studentUserId)
    .single();

  if (!studentUser) redirect("/teacher");

  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("grade, school_name")
    .eq("user_id", studentUserId)
    .single();

  // Enrollment + cohort
  const { data: enrollment } = await supabase
    .from("enrollment_records")
    .select("cohort_id, cohorts(name)")
    .eq("student_user_id", studentUserId)
    .in("status", ["active", "completed"])
    .order("enrolled_at", { ascending: false })
    .limit(1)
    .single();

  const cohortName = enrollment
    ? (Array.isArray(enrollment.cohorts)
        ? (enrollment.cohorts[0] as { name: string } | undefined)?.name
        : (enrollment.cohorts as { name: string } | null)?.name) ?? "—"
    : "—";

  // Active project (include URL fields for WorkLinksGrid)
  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, title, current_stage,
      live_product_url, demo_video_url, presentation_slide_url,
      github_repo_url, figma_or_design_url, screenshot_gallery_urls,
      github_url, figma_url, presentation_url,
      last_url_update_at, last_url_update_by
    `)
    .eq("student_user_id", studentUserId)
    .in("status", ["active", "draft"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Method progress
  const { data: progressRows } = project
    ? await supabase
        .from("student_method_progress")
        .select("stage_number, status, submitted_at")
        .eq("project_id", project.id)
        .order("stage_number", { ascending: true })
    : { data: null };

  const progressMap = new Map<number, StageProgress>(
    (progressRows ?? []).map((r) => [r.stage_number, r])
  );

  // All method stages
  const { data: stageDefs } = await supabase
    .from("method_stage_definitions")
    .select("id, stage_number, name")
    .order("stage_number", { ascending: true });

  // All active worksheet templates with stage info
  const { data: templates } = await supabase
    .from("worksheet_templates")
    .select("id, title, linked_lesson_number, linked_method_stage_id, method_stage_definitions(stage_number, name)")
    .eq("is_active", true)
    .order("linked_lesson_number", { ascending: true });

  const stageIdToNumber = new Map<string, number>(
    (stageDefs ?? []).map((s) => [s.id, s.stage_number])
  );
  const stageIdToName = new Map<string, string>(
    (stageDefs ?? []).map((s) => [s.id, s.name])
  );

  const flatTemplates: WorksheetTemplate[] = (templates ?? []).map((t) => {
    const stageDef = Array.isArray(t.method_stage_definitions)
      ? (t.method_stage_definitions[0] as { stage_number: number; name: string } | undefined)
      : (t.method_stage_definitions as { stage_number: number; name: string } | null);
    return {
      id: t.id,
      title: t.title,
      linked_lesson_number: t.linked_lesson_number,
      linked_method_stage_id: t.linked_method_stage_id,
      stage_number: stageDef?.stage_number ?? (t.linked_method_stage_id ? stageIdToNumber.get(t.linked_method_stage_id) ?? null : null),
      stage_name: stageDef?.name ?? (t.linked_method_stage_id ? stageIdToName.get(t.linked_method_stage_id) ?? null : null),
    };
  });

  // Student's submissions
  const { data: submissions } = await supabase
    .from("worksheet_submissions")
    .select("id, template_id, status, submitted_at, version_number, feedback")
    .eq("student_user_id", studentUserId);

  const submissionMap = new Map<string, Submission>(
    (submissions ?? []).map((s) => [s.template_id, s])
  );

  // Group templates by stage
  const byStage = new Map<number | null, WorksheetTemplate[]>();
  for (const t of flatTemplates) {
    const key = t.stage_number ?? null;
    if (!byStage.has(key)) byStage.set(key, []);
    byStage.get(key)!.push(t);
  }

  const sortedStageKeys = Array.from(byStage.keys()).sort((a, b) => (a ?? 99) - (b ?? 99));

  // Current stage for header
  const inProgressStages = (progressRows ?? []).filter((r) => r.status === "in_progress");
  const currentStageNum = inProgressStages.length > 0
    ? Math.max(...inProgressStages.map((r) => r.stage_number))
    : (project?.current_stage ?? null);

  return (
    <Shell title={studentUser.display_name}>
      <div className="space-y-8 max-w-4xl">
        {/* Back */}
        <Link
          href="/teacher/projects"
          className="flex items-center gap-1 text-xs text-soft-gray/40 hover:text-soft-gray transition-colors w-fit"
        >
          <ChevronLeft size={12} /> Back to Projects
        </Link>

        {/* Student header */}
        <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-soft-gray">{studentUser.display_name}</h2>
            <p className="text-sm text-soft-gray/50">{studentUser.email}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-soft-gray/50">
              {studentProfile?.grade && <span>Grade {studentProfile.grade}</span>}
              {studentProfile?.school_name && <span>{studentProfile.school_name}</span>}
              <span>Cohort: {cohortName}</span>
              {currentStageNum && (
                <span className="text-electric-blue font-medium">Stage {currentStageNum} — In Progress</span>
              )}
            </div>
          </div>
          {project && (
            <div className="text-right">
              <p className="text-xs text-soft-gray/40">Active Project</p>
              <p className="text-sm font-medium text-soft-gray mt-0.5">{project.title}</p>
            </div>
          )}
        </div>

        {/* Student's Submitted Work */}
        {project && (
          <WorkLinksGrid
            links={{
              live_product_url: project.live_product_url,
              demo_video_url: project.demo_video_url,
              presentation_slide_url: project.presentation_slide_url,
              github_repo_url: project.github_repo_url,
              figma_or_design_url: project.figma_or_design_url,
              screenshot_gallery_urls: Array.isArray(project.screenshot_gallery_urls)
                ? project.screenshot_gallery_urls as string[]
                : [],
              github_url: project.github_url,
              figma_url: project.figma_url,
              presentation_url: project.presentation_url,
            }}
            lastUpdatedAt={project.last_url_update_at}
          />
        )}

        {/* Method Progress Pipeline */}
        {(stageDefs ?? []).length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-soft-gray/60 uppercase tracking-wider">Method Progress</h3>
            <div className="flex flex-wrap gap-2">
              {(stageDefs ?? []).map((stage) => {
                const progress = progressMap.get(stage.stage_number);
                const status = progress?.status ?? "not_started";
                const cfg = STAGE_PIPELINE_STATUS[status] ?? STAGE_PIPELINE_STATUS.not_started;
                const isCurrent = stage.stage_number === currentStageNum;
                return (
                  <div
                    key={stage.stage_number}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${cfg.cls} ${
                      isCurrent ? "ring-2 ring-white/20 ring-offset-1 ring-offset-deep-navy" : ""
                    }`}
                    title={`Stage ${stage.stage_number}: ${stage.name} — ${status.replace(/_/g, " ")}`}
                  >
                    <span className="text-white/80 tabular-nums">{stage.stage_number}</span>
                    <span className="text-white/60 hidden sm:inline truncate max-w-[80px]">{stage.name}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* All Worksheets by Stage */}
        <section className="space-y-6">
          <h3 className="text-sm font-semibold text-soft-gray/60 uppercase tracking-wider">All Worksheets</h3>

          {sortedStageKeys.map((stageNum) => {
            const stageTemplates = byStage.get(stageNum) ?? [];
            const stageName = stageNum
              ? ((stageDefs ?? []).find((s) => s.stage_number === stageNum)?.name ?? `Stage ${stageNum}`)
              : "General";

            return (
              <div key={stageNum ?? "general"} className="space-y-2">
                <p className="text-xs font-semibold text-soft-gray/40 uppercase tracking-wider px-1">
                  {stageNum ? `Stage ${stageNum} — ${stageName}` : "General"}
                </p>
                <div className="rounded-xl border border-white/8 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {stageTemplates.map((template) => {
                        const submission = submissionMap.get(template.id);
                        const status = submission?.status ?? "not_started";

                        return (
                          <tr
                            key={template.id}
                            className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-soft-gray">{template.title}</p>
                              {template.linked_lesson_number && (
                                <p className="text-xs text-soft-gray/40 mt-0.5">Lesson {template.linked_lesson_number}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <StatusBadge status={status} />
                              {(submission?.version_number ?? 1) > 1 && (
                                <span className="ml-1.5 text-[10px] text-gold font-medium">v{submission!.version_number}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell text-soft-gray/40 text-xs tabular-nums text-right">
                              {formatDate(submission?.submitted_at ?? null)}
                            </td>
                            <td className="px-4 py-3 text-right w-24">
                              {submission ? (
                                <Link
                                  href={`/teacher/worksheets/review/${submission.id}`}
                                  className="flex items-center justify-end gap-1 text-electric-blue text-xs hover:underline"
                                >
                                  Review <ChevronRight size={12} />
                                </Link>
                              ) : (
                                <span className="text-soft-gray/20 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {sortedStageKeys.length === 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center text-soft-gray/40 text-sm">
              No worksheets found.
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
