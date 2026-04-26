import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/mentor/Shell";
import { formatDate } from "@/lib/dates";

export default async function MentorCheckpointQueuePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "mentor" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();
  const { data: submissions } = await supabase
    .from("checkpoint_submissions")
    .select("id, status, submitted_at, student_user_id, users!student_user_id(display_name), checkpoints(title, stage_number)")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });

  return (
    <Shell title="Checkpoint Review Queue" introKey="mentor.checkpoints">
      <div className="space-y-3">
        {!submissions || submissions.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center text-soft-gray/40 text-sm">
            No checkpoint submissions awaiting review.
          </div>
        ) : (
          submissions.map((sub) => {
            const studentName =
              Array.isArray(sub.users)
                ? (sub.users[0] as { display_name: string } | undefined)?.display_name ?? "—"
                : (sub.users as { display_name: string } | null)?.display_name ?? "—";
            const checkpointTitle =
              Array.isArray(sub.checkpoints)
                ? (sub.checkpoints[0] as { title: string; stage_number: number } | undefined)?.title ?? "—"
                : (sub.checkpoints as { title: string; stage_number: number } | null)?.title ?? "—";

            return (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-soft-gray">{checkpointTitle}</p>
                  <p className="text-xs text-soft-gray/50">
                    {studentName} · {formatDate(sub.submitted_at)}
                  </p>
                </div>
                <Link
                  href={`/mentor/checkpoints/${sub.id}`}
                  className="px-4 py-1.5 rounded-lg bg-vivid-teal/10 text-vivid-teal text-sm font-medium hover:bg-vivid-teal/20 transition-colors"
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
