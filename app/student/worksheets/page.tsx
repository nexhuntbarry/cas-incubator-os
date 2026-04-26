import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { FileText, Clock, CheckCircle, AlertCircle, Lock } from "lucide-react";
import StudentTodoSection from "@/components/assignments/StudentTodoSection";
import Shell from "@/components/student/Shell";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted:          { label: "Submitted",         cls: "bg-status-success/15 text-status-success" },
    reviewed:           { label: "Reviewed",          cls: "bg-vivid-teal/15 text-vivid-teal" },
    approved:           { label: "Approved",          cls: "bg-vivid-teal/15 text-vivid-teal" },
    revision_requested: { label: "Revision Needed",   cls: "bg-status-warning/15 text-status-warning" },
    in_progress:        { label: "In Progress",       cls: "bg-electric-blue/15 text-electric-blue" },
    not_started:        { label: "Not Started",       cls: "bg-white/5 text-soft-gray/40" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-white/5 text-soft-gray/40" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "submitted" || status === "reviewed" || status === "approved")
    return <CheckCircle size={14} className="text-status-success flex-shrink-0" />;
  if (status === "revision_requested")
    return <AlertCircle size={14} className="text-status-warning flex-shrink-0" />;
  if (status === "in_progress")
    return <Clock size={14} className="text-electric-blue flex-shrink-0" />;
  return <FileText size={14} className="text-soft-gray/30 flex-shrink-0" />;
}

interface WorksheetTemplate {
  id: string;
  title: string;
  description: string | null;
  required_status: string;
  template_type: string;
  linked_lesson_number: number | null;
  linked_method_stage_id: string | null;
}

interface Submission {
  id: string;
  template_id: string;
  status: string;
  submitted_at: string | null;
  version_number: number;
  feedback: string | null;
}

interface SectionProps {
  title: string;
  subtitle?: string;
  templates: WorksheetTemplate[];
  submissionMap: Map<string, Submission>;
  locked?: boolean;
}

function WorksheetSection({ title, subtitle, templates, submissionMap, locked }: SectionProps) {
  if (templates.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-soft-gray">{title}</h2>
        {subtitle && <p className="text-xs text-soft-gray/40 mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-2">
        {templates.map((template) => {
          const submission = submissionMap.get(template.id);
          const status = submission?.status ?? "not_started";

          if (locked) {
            return (
              <div
                key={template.id}
                className="block rounded-xl border border-white/5 bg-white/2 p-5 opacity-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-soft-gray/30 flex-shrink-0" />
                      <p className="font-semibold text-soft-gray/60 truncate">{template.title}</p>
                      {template.linked_lesson_number && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-soft-gray/40 font-medium">
                          L{template.linked_lesson_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-soft-gray/30">Locked</span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={template.id}
              href={`/student/worksheets/${template.id}`}
              className="block rounded-xl border border-white/8 bg-white/3 p-5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={status} />
                    <p className="font-semibold text-soft-gray truncate">{template.title}</p>
                    {template.linked_lesson_number && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-soft-gray/50 font-medium">
                        L{template.linked_lesson_number}
                      </span>
                    )}
                    {template.required_status === "required" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-status-error/15 text-status-error font-medium uppercase">
                        Required
                      </span>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-soft-gray/50 mt-1 truncate">{template.description}</p>
                  )}
                </div>
                <StatusBadge status={status} />
              </div>
              {submission?.feedback && (
                <div className="mt-3 p-2 rounded-lg bg-vivid-teal/10 border border-vivid-teal/20">
                  <p className="text-xs text-vivid-teal font-medium">Feedback available</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default async function StudentWorksheetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  // Get student's active project + method progress
  const { data: project } = await supabase
    .from("projects")
    .select("id, current_stage")
    .eq("student_user_id", user.userId)
    .in("status", ["active", "draft"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Get method progress rows for this student
  const { data: progressRows } = project
    ? await supabase
        .from("student_method_progress")
        .select("stage_number, status")
        .eq("project_id", project.id)
        .order("stage_number", { ascending: true })
    : { data: null };

  // Determine current stage
  let currentStageNumber: number | null = null;
  let nextStageNumber: number | null = null;

  if (progressRows && progressRows.length > 0) {
    // Find highest stage_number that is in_progress
    const inProgressRows = progressRows.filter((r) => r.status === "in_progress");
    if (inProgressRows.length > 0) {
      currentStageNumber = Math.max(...inProgressRows.map((r) => r.stage_number));
    } else {
      // Fallback: most recent submitted
      const submittedRows = progressRows.filter((r) => r.status === "submitted");
      if (submittedRows.length > 0) {
        currentStageNumber = Math.max(...submittedRows.map((r) => r.stage_number));
      }
    }

    if (currentStageNumber) {
      // Next stage = currentStageNumber + 1
      nextStageNumber = currentStageNumber + 1;
    }
  }

  // Get method stage IDs for current and next
  const stageNumbers = [currentStageNumber, nextStageNumber].filter(Boolean) as number[];
  let currentStageId: string | null = null;
  let nextStageId: string | null = null;

  if (stageNumbers.length > 0) {
    const { data: stageDefs } = await supabase
      .from("method_stage_definitions")
      .select("id, stage_number, name")
      .in("stage_number", stageNumbers);

    const stageMap = new Map(stageDefs?.map((s) => [s.stage_number, s]) ?? []);
    if (currentStageNumber) currentStageId = stageMap.get(currentStageNumber)?.id ?? null;
    if (nextStageNumber) nextStageId = stageMap.get(nextStageNumber)?.id ?? null;
  }

  // Get all active worksheet templates
  const { data: allTemplates } = await supabase
    .from("worksheet_templates")
    .select("id, title, description, required_status, template_type, linked_lesson_number, linked_method_stage_id")
    .eq("is_active", true)
    .order("linked_lesson_number", { ascending: true });

  // Get student's submissions
  const { data: submissions } = await supabase
    .from("worksheet_submissions")
    .select("id, template_id, status, submitted_at, version_number, feedback")
    .eq("student_user_id", user.userId);

  const submissionMap = new Map(
    (submissions ?? []).map((s) => [s.template_id, s])
  );

  const templates = allTemplates ?? [];

  // Partition templates
  const currentTemplates = currentStageId
    ? templates.filter((t) => t.linked_method_stage_id === currentStageId)
    : [];

  // Determine if next stage is locked (current stage not yet approved)
  const currentProgress = progressRows?.find((r) => r.stage_number === currentStageNumber);
  const currentStageApproved = currentProgress?.status === "approved";
  const nextLocked = !currentStageApproved;

  const nextTemplates = nextStageId
    ? templates.filter((t) => t.linked_method_stage_id === nextStageId)
    : [];

  // Past submissions: templates where student has submitted/reviewed/approved, not in current/next
  const currentAndNextIds = new Set([
    ...currentTemplates.map((t) => t.id),
    ...nextTemplates.map((t) => t.id),
  ]);

  const pastTemplates = templates.filter((t) => {
    if (currentAndNextIds.has(t.id)) return false;
    const sub = submissionMap.get(t.id);
    return sub && ["submitted", "reviewed", "approved", "revision_requested"].includes(sub.status);
  });

  // Sort past by submitted_at desc
  const pastSorted = pastTemplates
    .map((t) => ({ template: t, submission: submissionMap.get(t.id) }))
    .sort((a, b) => {
      const aDate = a.submission?.submitted_at ?? "";
      const bDate = b.submission?.submitted_at ?? "";
      return bDate.localeCompare(aDate);
    })
    .map((x) => x.template);

  const noProject = !project;

  return (
    <Shell title="Worksheets" introKey="student.worksheets">
      <div className="max-w-3xl space-y-8">
        <p className="text-sm text-soft-gray/50">Track your progress through each stage.</p>

        {/* Assigned to you — explicit push from teacher */}
        <StudentTodoSection />

        {noProject ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center space-y-2">
            <FileText size={24} className="mx-auto text-soft-gray/20" />
            <p className="text-soft-gray/50 text-sm">Complete your intake to start seeing worksheets.</p>
            <Link
              href="/student/intake"
              className="inline-block mt-2 px-4 py-2 rounded-lg bg-electric-blue/15 text-electric-blue text-sm font-medium hover:bg-electric-blue/25 transition-colors"
            >
              Start Intake
            </Link>
          </div>
        ) : currentStageId === null && nextStageId === null ? (
          <>
            {/* No stage started yet — show all templates ungrouped as before */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-1">
              <p className="text-sm text-soft-gray/60">
                Your teacher will move you to a stage to unlock worksheets.
              </p>
            </div>
            <WorksheetSection
              title="All Worksheets"
              templates={templates}
              submissionMap={submissionMap}
            />
          </>
        ) : (
          <>
            {currentTemplates.length > 0 && (
              <WorksheetSection
                title="Current Stage Worksheets"
                subtitle={`Stage ${currentStageNumber} — complete these to progress`}
                templates={currentTemplates}
                submissionMap={submissionMap}
              />
            )}

            {nextTemplates.length > 0 && (
              <WorksheetSection
                title="Up Next"
                subtitle={
                  nextLocked
                    ? `Stage ${nextStageNumber} — unlocks when current stage is approved`
                    : `Stage ${nextStageNumber} — available now`
                }
                templates={nextTemplates}
                submissionMap={submissionMap}
                locked={nextLocked}
              />
            )}

            {pastSorted.length > 0 && (
              <WorksheetSection
                title="Past Submissions"
                subtitle="Earlier stages"
                templates={pastSorted}
                submissionMap={submissionMap}
              />
            )}

            {currentTemplates.length === 0 && nextTemplates.length === 0 && pastSorted.length === 0 && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center text-soft-gray/40 text-sm">
                No worksheets found for your current stage.
              </div>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
