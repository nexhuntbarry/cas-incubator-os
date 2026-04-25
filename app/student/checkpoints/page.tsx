import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import CheckpointStatusBadge from "@/components/checkpoint/CheckpointStatusBadge";
import Shell from "@/components/student/Shell";

export default async function StudentCheckpointsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  // Get active project
  const { data: project } = await supabase
    .from("projects")
    .select("id, current_stage, title")
    .eq("student_user_id", user.userId)
    .single();

  // Get checkpoints for this project
  const { data: checkpoints } = project
    ? await supabase
        .from("checkpoints")
        .select("id, title, description, stage_number, status")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true })
    : { data: [] };

  // Get submissions
  const checkpointIds = (checkpoints ?? []).map((c) => c.id);
  const { data: submissions } = checkpointIds.length > 0
    ? await supabase
        .from("checkpoint_submissions")
        .select("id, checkpoint_id, status, submitted_at")
        .eq("student_user_id", user.userId)
        .in("checkpoint_id", checkpointIds)
    : { data: [] };

  const submissionMap = new Map(
    (submissions ?? []).map((s) => [s.checkpoint_id, s])
  );

  return (
    <Shell title="Checkpoints">
      <div className="max-w-3xl space-y-6">
        {project && (
          <p className="text-sm text-soft-gray/50">{project.title}</p>
        )}

        {!checkpoints || checkpoints.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center text-soft-gray/40 text-sm">
            No checkpoints defined yet.
          </div>
        ) : (
          <div className="space-y-3">
            {checkpoints.map((checkpoint) => {
              const submission = submissionMap.get(checkpoint.id);
              const status = submission?.status ?? checkpoint.status ?? "not_started";

              return (
                <Link
                  key={checkpoint.id}
                  href={`/student/checkpoints/${checkpoint.id}`}
                  className="block rounded-xl border border-white/8 bg-white/3 p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-soft-gray">{checkpoint.title}</p>
                      {checkpoint.description && (
                        <p className="text-sm text-soft-gray/50 mt-1">{checkpoint.description}</p>
                      )}
                      <p className="text-xs text-soft-gray/30 mt-1">Stage {checkpoint.stage_number}</p>
                    </div>
                    <CheckpointStatusBadge status={status} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
