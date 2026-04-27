import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Shell from "@/components/student/Shell";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted:          { label: "Submitted",         cls: "bg-status-success/15 text-status-success" },
    reviewed:           { label: "Reviewed",          cls: "bg-vivid-teal/15 text-vivid-teal" },
    approved:           { label: "Reviewed",          cls: "bg-vivid-teal/15 text-vivid-teal" },
    revision_requested: { label: "Revision Needed",   cls: "bg-status-warning/15 text-status-warning" },
    in_progress:        { label: "In Progress",       cls: "bg-electric-blue/15 text-electric-blue" },
    pending:            { label: "Pending",           cls: "bg-white/8 text-soft-gray/60" },
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

interface AssignedRow {
  assignment_id: string;
  template_id: string;
  title: string;
  description: string | null;
  linked_lesson_number: number | null;
  due_date: string;
  open_date: string;
  instructions_override: string | null;
  status: string; // pending | in_progress | submitted | reviewed | approved | revision_requested
  feedback: string | null;
}

function dueLabel(due: Date, now: Date): { label: string; urgent: "red" | "yellow" | "normal" } {
  const diffMs = due.getTime() - now.getTime();
  if (diffMs < 0) return { label: "Overdue", urgent: "red" };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return { label: hours < 1 ? "Due soon" : `Due in ${hours}h`, urgent: "red" };
  const days = Math.floor(hours / 24);
  if (days <= 3) return { label: `Due in ${days}d`, urgent: "yellow" };
  return {
    label: `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    urgent: "normal",
  };
}

export default async function StudentWorksheetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  // 1. Find student's active cohort(s)
  const { data: enrollments } = await supabase
    .from("enrollment_records")
    .select("cohort_id")
    .eq("student_user_id", user.userId)
    .in("status", ["active", "completed"]);

  const cohortIds = Array.from(
    new Set(((enrollments ?? []) as { cohort_id: string | null }[])
      .map((e) => e.cohort_id)
      .filter((c): c is string => !!c))
  );

  // 2. Fetch assignments targeting this student — by cohort OR by direct student_user_ids
  type AssignmentJoin = {
    id: string;
    template_id: string;
    cohort_id: string | null;
    student_user_ids: string[] | null;
    due_date: string;
    open_date: string;
    instructions_override: string | null;
    status: string;
    created_at: string;
    worksheet_templates: {
      id: string;
      title: string;
      description: string | null;
      linked_lesson_number: number | null;
    } | null;
  };

  const [cohortAssignments, specificAssignments] = await Promise.all([
    cohortIds.length > 0
      ? supabase
          .from("worksheet_assignments")
          .select(
            `id, template_id, cohort_id, student_user_ids, due_date, open_date,
             instructions_override, status, created_at,
             worksheet_templates(id, title, description, linked_lesson_number)`
          )
          .in("cohort_id", cohortIds)
          .eq("status", "open")
      : Promise.resolve({ data: [] as unknown[] }),
    supabase
      .from("worksheet_assignments")
      .select(
        `id, template_id, cohort_id, student_user_ids, due_date, open_date,
         instructions_override, status, created_at,
         worksheet_templates(id, title, description, linked_lesson_number)`
      )
      .is("cohort_id", null)
      .eq("status", "open")
      .contains("student_user_ids", JSON.stringify([user.userId])),
  ]);

  const merged: AssignmentJoin[] = [];
  const seen = new Set<string>();
  for (const a of [
    ...(((cohortAssignments as { data: unknown[] }).data ?? []) as AssignmentJoin[]),
    ...(((specificAssignments as { data: unknown[] }).data ?? []) as AssignmentJoin[]),
  ]) {
    if (!seen.has(a.id)) {
      seen.add(a.id);
      merged.push(a);
    }
  }

  // 3. Fetch this student's submissions for the assigned templates
  const templateIds = Array.from(new Set(merged.map((a) => a.template_id)));
  const submissionMap = new Map<string, { status: string; feedback: string | null }>();
  if (templateIds.length > 0) {
    const { data: subs } = await supabase
      .from("worksheet_submissions")
      .select("template_id, status, feedback")
      .eq("student_user_id", user.userId)
      .in("template_id", templateIds);
    for (const s of (subs ?? []) as { template_id: string; status: string; feedback: string | null }[]) {
      // Keep the latest submission for each template (subs may have multiple versions)
      submissionMap.set(s.template_id, { status: s.status, feedback: s.feedback });
    }
  }

  // 4. Compose rows
  const now = new Date();
  const rows: AssignedRow[] = merged
    .map((a) => {
      const tmplRaw = a.worksheet_templates;
      const tmpl = (Array.isArray(tmplRaw) ? tmplRaw[0] : tmplRaw) as
        | { id: string; title: string; description: string | null; linked_lesson_number: number | null }
        | null;
      const sub = submissionMap.get(a.template_id);
      const status = sub?.status ?? "pending";
      return {
        assignment_id: a.id,
        template_id: a.template_id,
        title: tmpl?.title ?? "Worksheet",
        description: tmpl?.description ?? null,
        linked_lesson_number: tmpl?.linked_lesson_number ?? null,
        due_date: a.due_date,
        open_date: a.open_date,
        instructions_override: a.instructions_override,
        status,
        feedback: sub?.feedback ?? null,
      };
    })
    .sort((a, b) => {
      // Sort: due date asc, then assignment open_date desc
      const da = new Date(a.due_date).getTime();
      const db = new Date(b.due_date).getTime();
      if (da !== db) return da - db;
      return new Date(b.open_date).getTime() - new Date(a.open_date).getTime();
    });

  return (
    <Shell title="Worksheets" introKey="student.worksheets">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm text-soft-gray/50">
          Worksheets your teacher has assigned to you. Sorted by due date.
        </p>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center space-y-2">
            <FileText size={24} className="mx-auto text-soft-gray/20" />
            <p className="text-soft-gray/50 text-sm">No worksheets assigned yet.</p>
            <p className="text-xs text-soft-gray/30">
              Your teacher will share assignments here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const due = new Date(r.due_date);
              const { label: dueText, urgent } = dueLabel(due, now);
              const dueCls =
                urgent === "red"
                  ? "text-status-error"
                  : urgent === "yellow"
                  ? "text-status-warning"
                  : "text-soft-gray/50";
              const isComplete = ["submitted", "reviewed", "approved"].includes(r.status);

              return (
                <Link
                  key={r.assignment_id}
                  href={`/student/worksheets/${r.template_id}?assignment=${r.assignment_id}`}
                  className={`block rounded-xl border p-5 transition-colors ${
                    urgent === "red" && !isComplete
                      ? "border-status-error/25 bg-status-error/5 hover:bg-status-error/10"
                      : urgent === "yellow" && !isComplete
                      ? "border-status-warning/25 bg-status-warning/5 hover:bg-status-warning/10"
                      : "border-white/8 bg-white/3 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusIcon status={r.status} />
                        <p className="font-semibold text-soft-gray truncate">{r.title}</p>
                        {r.linked_lesson_number && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-soft-gray/50 font-medium">
                            L{r.linked_lesson_number}
                          </span>
                        )}
                      </div>
                      {r.instructions_override && (
                        <p className="text-xs text-soft-gray/60 mt-1 line-clamp-2 italic">
                          {r.instructions_override}
                        </p>
                      )}
                      <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${dueCls}`}>
                        {urgent === "red" && !isComplete ? (
                          <AlertCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {dueText}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.feedback && (
                    <div className="mt-3 p-2 rounded-lg bg-vivid-teal/10 border border-vivid-teal/20">
                      <p className="text-xs text-vivid-teal font-medium">Feedback available</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
