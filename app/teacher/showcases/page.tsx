import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";

export default async function TeacherShowcasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: assignments } = await supabase
    .from("cohort_staff_assignments")
    .select("cohort_id")
    .eq("user_id", user.userId);

  const cohortIds = (assignments ?? []).map((a) => a.cohort_id);

  const { data: enrollments } = cohortIds.length
    ? await supabase
        .from("enrollment_records")
        .select("student_user_id")
        .in("cohort_id", cohortIds)
        .eq("status", "active")
    : { data: [] };

  const studentIds = [...new Set((enrollments ?? []).map((e) => e.student_user_id))];

  const { data: showcases } = studentIds.length
    ? await supabase
        .from("showcase_records")
        .select(
          "*, student:users!showcase_records_student_user_id_fkey(display_name)"
        )
        .in("student_user_id", studentIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <Shell title="Student Showcases">
      {!showcases || showcases.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-soft-gray/50">No showcases submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {showcases.map((s) => {
            const student = s.student as { display_name: string } | null;
            const feedback = Array.isArray(s.feedback_received_json) ? s.feedback_received_json : [];
            return (
              <Link
                key={s.id}
                href={`/teacher/showcases/${s.id}`}
                className="block rounded-xl border border-white/8 bg-white/3 p-5 hover:border-electric-blue/30 hover:bg-white/4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-soft-gray">{s.title}</p>
                    <p className="text-xs text-soft-gray/50 mt-1">
                      {student?.display_name ?? "Unknown"} &middot;{" "}
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {s.public_share_enabled && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-vivid-teal/15 text-vivid-teal font-medium">
                        Public
                      </span>
                    )}
                    {feedback.length > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-electric-blue/10 text-electric-blue font-medium">
                        {feedback.length} feedback
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
