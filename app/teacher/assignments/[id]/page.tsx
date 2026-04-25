import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import StudentSubmissionTable from "@/components/assignments/StudentSubmissionTable";
import AssignmentProgressBar from "@/components/assignments/AssignmentProgressBar";
import AssignmentDetailActions from "@/components/assignments/AssignmentDetailActions";
import { ChevronLeft, Clock, Users, BookOpen, Calendar } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherAssignmentDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();

  const { data: assignment, error } = await supabase
    .from("worksheet_assignments")
    .select(
      `id, template_id, cohort_id, student_user_ids, lesson_number, due_date, open_date,
       instructions_override, status, created_at, assigned_by,
       worksheet_templates(id, title, template_type),
       cohorts(id, name)`
    )
    .eq("id", id)
    .single();

  if (error || !assignment) notFound();

  const tmplRaw = assignment.worksheet_templates;
  const template = (Array.isArray(tmplRaw) ? tmplRaw[0] : tmplRaw) as { id: string; title: string; template_type: string } | null;
  const cohortRaw = assignment.cohorts;
  const cohort = (Array.isArray(cohortRaw) ? cohortRaw[0] : cohortRaw) as { id: string; name: string } | null;

  // Collect student IDs
  let studentIds: string[] = [];
  const cohortId = assignment.cohort_id as string | null;
  const specificIds = (assignment.student_user_ids as string[]) ?? [];

  if (cohortId) {
    const { data: enrollments } = await supabase
      .from("enrollment_records")
      .select("student_user_id")
      .eq("cohort_id", cohortId)
      .in("status", ["active", "completed"]);
    studentIds = (enrollments ?? []).map((e) => e.student_user_id);
  } else {
    studentIds = specificIds;
  }

  // Fetch students + submissions
  const [{ data: students }, { data: submissions }] = await Promise.all([
    studentIds.length > 0
      ? supabase
          .from("users")
          .select("id, display_name, email")
          .in("id", studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length > 0
      ? supabase
          .from("worksheet_submissions")
          .select("id, student_user_id, status, submitted_at, feedback")
          .eq("template_id", assignment.template_id as string)
          .in("student_user_id", studentIds)
      : Promise.resolve({ data: [] }),
  ]);

  const submissionMap = new Map(
    (submissions ?? []).map((s) => [s.student_user_id, s])
  );

  const now = new Date();
  const dueDate = new Date(assignment.due_date as string);
  const isOverdue = dueDate < now;

  const studentRows = (students ?? []).map((s) => {
    const sub = submissionMap.get(s.id);
    let status = "not_started";
    if (sub) status = sub.status;
    if (!sub && isOverdue) status = "overdue";
    return {
      user_id: s.id,
      display_name: s.display_name,
      email: s.email,
      status,
      submission_id: sub?.id ?? null,
      submitted_at: sub?.submitted_at ?? null,
      feedback: sub?.feedback ?? null,
    };
  });

  const counts = {
    total: studentRows.length,
    submitted: studentRows.filter((s) => ["submitted", "reviewed", "approved"].includes(s.status)).length,
    pending: studentRows.filter((s) => ["not_started", "in_progress", "overdue"].includes(s.status)).length,
    overdue: studentRows.filter((s) => s.status === "overdue").length,
    approved: studentRows.filter((s) => s.status === "approved").length,
  };

  const dueDateFormatted = dueDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const createdFormatted = new Date(assignment.created_at as string).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Shell title={template?.title ?? "Assignment"}>
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/teacher/assignments"
          className="inline-flex items-center gap-1.5 text-sm text-soft-gray/50 hover:text-soft-gray transition-colors"
        >
          <ChevronLeft size={16} />
          Assignments
        </Link>

        {/* Header */}
        <div className="rounded-xl border border-white/8 bg-white/2 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <BookOpen size={16} className="text-electric-blue" />
                <h2 className="font-bold text-soft-gray text-lg">{template?.title ?? "—"}</h2>
                {(assignment.lesson_number as number | null) && (
                  <span className="text-xs px-2 py-0.5 rounded bg-white/8 text-soft-gray/50">
                    Lesson {assignment.lesson_number as number}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-soft-gray/50">
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {cohort?.name ?? "Specific students"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  Due {dueDateFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  Assigned {createdFormatted}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  assignment.status === "open"
                    ? "bg-status-success/15 text-status-success"
                    : assignment.status === "closed"
                    ? "bg-white/8 text-soft-gray/50"
                    : "bg-white/5 text-soft-gray/30"
                }`}
              >
                {assignment.status as string}
              </span>
            </div>
          </div>

          {(assignment.instructions_override as string | null) && (
            <div className="rounded-lg border border-electric-blue/20 bg-electric-blue/5 px-4 py-3">
              <p className="text-xs text-electric-blue/70 font-medium mb-1">Teacher&apos;s Note</p>
              <p className="text-sm text-soft-gray/80">{assignment.instructions_override as string}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
            <div className="space-y-0.5">
              <p className="text-[11px] text-soft-gray/40 uppercase tracking-wider">Assigned</p>
              <p className="text-xl font-bold text-soft-gray">{counts.total}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-soft-gray/40 uppercase tracking-wider">Submitted</p>
              <p className="text-xl font-bold text-status-success">{counts.submitted}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-soft-gray/40 uppercase tracking-wider">Pending</p>
              <p className="text-xl font-bold text-status-warning">{counts.pending}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-soft-gray/40 uppercase tracking-wider">Overdue</p>
              <p className="text-xl font-bold text-status-error">{counts.overdue}</p>
            </div>
          </div>

          <AssignmentProgressBar submitted={counts.submitted} total={counts.total} />
        </div>

        {/* Actions */}
        <AssignmentDetailActions
          assignmentId={id}
          currentStatus={assignment.status as string}
          pendingCount={counts.pending}
        />

        {/* Student table */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-soft-gray/60">Students</h3>
          <StudentSubmissionTable
            students={studentRows}
            assignmentId={id}
          />
        </div>
      </div>
    </Shell>
  );
}
