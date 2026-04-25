import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/mentor/Shell";
import { Mail } from "lucide-react";

export default async function MentorParentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "mentor" && user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  // Get students assigned to this mentor via cohort_staff_assignments
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

  const { data: links } = studentIds.length
    ? await supabase
        .from("parent_student_links")
        .select(
          "student_user_id, parent_user_id, student:users!parent_student_links_student_user_id_fkey(id, display_name, email), parent:users!parent_student_links_parent_user_id_fkey(id, display_name, email)"
        )
        .in("student_user_id", studentIds)
    : { data: [] };

  return (
    <Shell title="Parent Communications">
      {!links || links.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
          <p className="text-soft-gray/50">No parent links found for your students.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const student = link.student as unknown as { id: string; display_name: string; email: string } | null;
            const parent = link.parent as unknown as { id: string; display_name: string; email: string } | null;
            if (!student || !parent) return null;
            return (
              <div
                key={`${link.student_user_id}-${link.parent_user_id}`}
                className="rounded-xl border border-white/8 bg-white/3 p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">{student.display_name}</p>
                  <p className="text-xs text-soft-gray/50 mt-0.5">
                    Parent: {parent.display_name} &middot; {parent.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/mentor/parents/${student.id}/compose`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue/15 text-electric-blue text-sm font-medium hover:bg-electric-blue/25 transition-colors"
                  >
                    <Mail size={14} />
                    Compose
                  </Link>
                  <Link
                    href={`/mentor/parents/${student.id}/history`}
                    className="px-4 py-2 rounded-lg border border-white/10 text-soft-gray/60 text-sm hover:text-soft-gray hover:border-white/20 transition-colors"
                  >
                    History
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
