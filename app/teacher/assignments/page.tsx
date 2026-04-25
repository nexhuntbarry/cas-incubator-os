import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import AssignmentProgressBar from "@/components/assignments/AssignmentProgressBar";
import { BookOpen, Clock, AlertCircle } from "lucide-react";

interface AssignmentRow {
  id: string;
  template_id: string;
  cohort_id: string | null;
  student_user_ids: string[];
  lesson_number: number | null;
  due_date: string;
  status: string;
  created_at: string;
  worksheet_templates: { id: string; title: string } | null;
  cohorts: { id: string; name: string } | null;
  submitted: number;
  total: number;
}

function dueDateLabel(dueDate: string): { label: string; cls: string } {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) return { label: "OVERDUE", cls: "text-status-error font-bold" };
  if (diffHours < 24) return { label: `in ${diffHours}h`, cls: "text-status-warning" };
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 3) return { label: `in ${diffDays}d`, cls: "text-status-warning" };
  return {
    label: `in ${diffDays}d`,
    cls: "text-soft-gray/50",
  };
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function TeacherAssignmentsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const activeTab = statusParam ?? "open";

  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();

  let query = supabase
    .from("worksheet_assignments")
    .select(
      `id, template_id, cohort_id, student_user_ids, lesson_number, due_date, status, created_at,
       worksheet_templates(id, title),
       cohorts(id, name)`
    )
    .order("due_date", { ascending: true });

  if (activeTab !== "all") {
    query = query.eq("status", activeTab);
  }

  if (user.role !== "super_admin") {
    query = query.eq("assigned_by", user.userId);
  }

  const { data: rawAssignments } = await query;

  // For each assignment, compute submitted/total counts
  const assignments: AssignmentRow[] = await Promise.all(
    (rawAssignments ?? []).map(async (a) => {
      const cohortId = a.cohort_id as string | null;
      const specificIds = (a.student_user_ids as string[]) ?? [];
      let total = 0;

      if (cohortId) {
        const { count } = await supabase
          .from("enrollment_records")
          .select("*", { count: "exact", head: true })
          .eq("cohort_id", cohortId)
          .in("status", ["active", "completed"]);
        total = count ?? 0;
      } else {
        total = specificIds.length;
      }

      const { count: submitted } = await supabase
        .from("worksheet_submissions")
        .select("*", { count: "exact", head: true })
        .eq("template_id", a.template_id as string)
        .in("status", ["submitted", "reviewed", "approved"]);

      return {
        id: a.id,
        template_id: a.template_id as string,
        cohort_id: a.cohort_id as string | null,
        student_user_ids: (a.student_user_ids as string[]) ?? [],
        lesson_number: a.lesson_number as number | null,
        due_date: a.due_date as string,
        status: a.status as string,
        created_at: a.created_at as string,
        worksheet_templates: (Array.isArray(a.worksheet_templates) ? a.worksheet_templates[0] : a.worksheet_templates) as { id: string; title: string } | null,
        cohorts: (Array.isArray(a.cohorts) ? a.cohorts[0] : a.cohorts) as { id: string; name: string } | null,
        submitted: submitted ?? 0,
        total,
      };
    })
  );

  const tabs = [
    { key: "open", label: "Active" },
    { key: "closed", label: "Closed" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <Shell title="Assignments">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/8">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/teacher/assignments?status=${tab.key}`}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-electric-blue text-electric-blue"
                  : "border-transparent text-soft-gray/50 hover:text-soft-gray"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/2 p-10 text-center space-y-2">
            <BookOpen size={24} className="mx-auto text-soft-gray/20" />
            <p className="text-soft-gray/40 text-sm">No {activeTab} assignments.</p>
            <p className="text-xs text-soft-gray/30">
              Assign worksheets from a lesson view to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[11px] text-soft-gray/40 uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5">Worksheet</th>
                  <th className="text-left px-4 py-2.5 hidden md:table-cell">Cohort</th>
                  <th className="text-left px-4 py-2.5 hidden sm:table-cell">Lesson</th>
                  <th className="text-left px-4 py-2.5">Due</th>
                  <th className="text-left px-4 py-2.5 hidden sm:table-cell">Progress</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const { label: dueLabel, cls: dueCls } = dueDateLabel(a.due_date);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-soft-gray leading-snug">
                          {a.worksheet_templates?.title ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-soft-gray/50 text-xs">
                        {a.cohorts?.name ?? "Specific students"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-soft-gray/50 tabular-nums text-xs">
                        {a.lesson_number ? `L${a.lesson_number}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 text-xs font-medium ${dueCls}`}>
                          {dueCls.includes("error") ? (
                            <AlertCircle size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {dueLabel}
                        </div>
                        <p className="text-[11px] text-soft-gray/30 mt-0.5">
                          {new Date(a.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <AssignmentProgressBar submitted={a.submitted} total={a.total} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/teacher/assignments/${a.id}`}
                          className="text-xs text-electric-blue hover:underline whitespace-nowrap"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
