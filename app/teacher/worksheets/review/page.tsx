import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";

export default async function TeacherWorksheetReviewQueuePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();
  const { data: submissions } = await supabase
    .from("worksheet_submissions")
    .select("id, status, submitted_at, version_number, student_user_id, users!student_user_id(display_name, email), worksheet_templates(title)")
    .in("status", ["submitted"])
    .order("submitted_at", { ascending: true });

  return (
    <Shell title="Worksheet Review Queue">
      <div className="space-y-3">
        {!submissions || submissions.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center text-soft-gray/40 text-sm">
            No submissions awaiting review.
          </div>
        ) : (
          submissions.map((sub) => {
            const studentName =
              Array.isArray(sub.users)
                ? (sub.users[0] as { display_name: string } | undefined)?.display_name ?? "—"
                : (sub.users as { display_name: string } | null)?.display_name ?? "—";
            const worksheetTitle =
              Array.isArray(sub.worksheet_templates)
                ? (sub.worksheet_templates[0] as { title: string } | undefined)?.title ?? "—"
                : (sub.worksheet_templates as { title: string } | null)?.title ?? "—";

            return (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-soft-gray">{worksheetTitle}</p>
                  <p className="text-xs text-soft-gray/50">
                    {studentName} · Submitted {sub.submitted_at?.slice(0, 10) ?? "—"}
                    {(sub.version_number ?? 1) > 1 && (
                      <span className="ml-2 text-gold font-medium">v{sub.version_number}</span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/teacher/worksheets/review/${sub.id}`}
                  className="px-4 py-1.5 rounded-lg bg-electric-blue/10 text-electric-blue text-sm font-medium hover:bg-electric-blue/20 transition-colors"
                >
                  Review
                </Link>
              </div>
            );
          })
        )}
      </div>
    </Shell>
  );
}
