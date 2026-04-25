import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import { Users, ChevronRight } from "lucide-react";

export default async function TeacherStudentsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();

  // Get all cohorts this teacher is assigned to
  const { data: assignments } = await supabase
    .from("cohort_staff_assignments")
    .select("cohort_id, cohorts(name)")
    .eq("user_id", user.role === "super_admin" ? user.userId : user.userId);

  const cohortIds = (assignments ?? []).map((a) => a.cohort_id);

  // Get all enrolled students across teacher's cohorts
  let enrollments: Array<{
    student_user_id: string;
    cohort_id: string;
    cohorts: { name: string } | null;
    users: { display_name: string; email: string } | null;
  }> = [];

  if (cohortIds.length > 0 || user.role === "super_admin") {
    const query = supabase
      .from("enrollment_records")
      .select(
        "student_user_id, cohort_id, cohorts(name), users!enrollment_records_student_user_id_fkey(display_name, email)"
      )
      .eq("status", "active")
      .order("cohort_id", { ascending: true });

    if (user.role !== "super_admin" && cohortIds.length > 0) {
      query.in("cohort_id", cohortIds);
    }

    const { data } = await query;
    enrollments = (data ?? []) as unknown as typeof enrollments;
  }

  // Group by cohort
  const byCohort = new Map<string, { cohortName: string; students: typeof enrollments }>();
  for (const e of enrollments) {
    const cohortName = (e.cohorts as { name: string } | null)?.name ?? "Unknown Cohort";
    if (!byCohort.has(e.cohort_id)) {
      byCohort.set(e.cohort_id, { cohortName, students: [] });
    }
    byCohort.get(e.cohort_id)!.students.push(e);
  }

  return (
    <Shell title="Students">
      <div className="max-w-4xl space-y-8">
        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
            <Users size={32} className="mx-auto text-soft-gray/20 mb-3" />
            <p className="text-soft-gray/50 text-sm">No students enrolled in your cohorts yet.</p>
          </div>
        ) : (
          Array.from(byCohort.entries()).map(([cohortId, { cohortName, students }]) => (
            <section key={cohortId}>
              <h2 className="text-sm font-semibold text-soft-gray/50 uppercase tracking-wider mb-3">
                {cohortName} — {students.length} student{students.length !== 1 ? "s" : ""}
              </h2>
              <div className="rounded-xl border border-white/8 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="text-left px-5 py-3 text-xs text-soft-gray/40 font-medium uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-5 py-3 text-xs text-soft-gray/40 font-medium uppercase tracking-wider hidden sm:table-cell">
                        Email
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const u = s.users as { display_name: string; email: string } | null;
                      return (
                        <tr
                          key={s.student_user_id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                        >
                          <td className="px-5 py-3 text-soft-gray font-medium">
                            {u?.display_name ?? "—"}
                          </td>
                          <td className="px-5 py-3 text-soft-gray/50 hidden sm:table-cell">
                            {u?.email ?? "—"}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              href={`/teacher/students/${s.student_user_id}`}
                              className="inline-flex items-center gap-1 text-xs text-electric-blue hover:text-electric-blue/80 transition-colors"
                            >
                              View <ChevronRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>
    </Shell>
  );
}
