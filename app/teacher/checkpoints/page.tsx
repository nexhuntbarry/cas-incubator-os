import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import { stageColors } from "@/lib/curriculum/checkpoint-helpers";
import { Flag, Star, FileText, ShieldCheck } from "lucide-react";

interface RequiredArtifact {
  artifact_type: string;
  label: string;
  worksheet_template_ids?: string[] | null;
}
interface RequiredRubric {
  stage_number: number;
  min_score: number;
}
interface ApprovalRules {
  auto_advance?: boolean;
  approver_role?: string;
  due_after_lesson?: number;
}
interface CheckpointRow {
  id: string;
  checkpoint_name: string;
  checkpoint_number: number;
  description: string | null;
  required_artifacts_json: RequiredArtifact[] | null;
  required_rubrics_json: RequiredRubric[] | null;
  approval_rules_json: ApprovalRules | null;
  linked_method_stage_ids_json: number[] | null;
}

export default async function TeacherCheckpointsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();

  const { data: checkpointsRaw } = await supabase
    .from("checkpoint_templates")
    .select(
      "id, checkpoint_name, checkpoint_number, description, required_artifacts_json, required_rubrics_json, approval_rules_json, linked_method_stage_ids_json"
    )
    .eq("active_status", true)
    .order("checkpoint_number", { ascending: true });

  const checkpoints = (checkpointsRaw ?? []) as CheckpointRow[];

  return (
    <Shell title="Checkpoints" introKey="teacher.checkpoints">
      <div className="space-y-4">
        {checkpoints.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/40 text-sm">No checkpoints defined yet.</p>
          </div>
        ) : (
          checkpoints.map((cp) => {
            const dueAfter = cp.approval_rules_json?.due_after_lesson;
            const approver = cp.approval_rules_json?.approver_role;
            const autoAdvance = cp.approval_rules_json?.auto_advance;
            const stages = cp.linked_method_stage_ids_json ?? [];
            const artifacts = cp.required_artifacts_json ?? [];
            const rubrics = cp.required_rubrics_json ?? [];

            return (
              <section
                key={cp.id}
                className="rounded-xl border border-white/8 bg-white/3 p-5"
              >
                <header className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="rounded-lg bg-status-warning/15 p-2 flex-shrink-0">
                      <Flag size={16} className="text-status-warning" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-soft-gray">
                        Checkpoint {cp.checkpoint_number} · {cp.checkpoint_name}
                      </p>
                      {cp.description && (
                        <p className="text-xs text-soft-gray/60 leading-relaxed mt-1">
                          {cp.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {dueAfter != null && (
                      <Link
                        href={`/teacher/teaching-mode/${dueAfter}`}
                        className="text-[11px] px-2 py-1 rounded-md bg-electric-blue/10 text-electric-blue font-medium hover:bg-electric-blue/20 transition-colors"
                      >
                        Due after Lesson {dueAfter}
                      </Link>
                    )}
                    {stages.map((s) => {
                      const sc = stageColors(s);
                      return (
                        <span
                          key={s}
                          className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider border ${sc.bg} ${sc.border} ${sc.text}`}
                        >
                          Stage {s}
                        </span>
                      );
                    })}
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Required artifacts */}
                  <div>
                    <p className="text-[10px] font-semibold text-soft-gray/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText size={11} /> Required artifacts
                    </p>
                    {artifacts.length === 0 ? (
                      <p className="text-xs text-soft-gray/40">None</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {artifacts.map((a, i) => (
                          <li
                            key={i}
                            className="text-xs text-soft-gray/80 flex items-start gap-2"
                          >
                            <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 text-[10px] uppercase tracking-wider text-soft-gray/50 flex-shrink-0">
                              {a.artifact_type}
                            </span>
                            <span className="leading-snug">{a.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Required rubric scores */}
                  <div>
                    <p className="text-[10px] font-semibold text-soft-gray/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Star size={11} /> Required rubric scores
                    </p>
                    {rubrics.length === 0 ? (
                      <p className="text-xs text-soft-gray/40">None</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {rubrics.map((r, i) => {
                          const sc = stageColors(r.stage_number);
                          return (
                            <li
                              key={i}
                              className="text-xs text-soft-gray/80 flex items-center gap-2"
                            >
                              <Link
                                href="/teacher/rubrics"
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${sc.bg} ${sc.border} ${sc.text} hover:brightness-125 transition`}
                              >
                                <Star size={10} />
                                Stage {r.stage_number}
                              </Link>
                              <span>≥ {r.min_score} pts</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {(approver || autoAdvance != null) && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3 text-[11px] text-soft-gray/50 flex-wrap">
                    {approver && (
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={11} className="text-electric-blue/70" />
                        Approver: <span className="text-soft-gray/80 font-medium">{approver}</span>
                      </span>
                    )}
                    {autoAdvance != null && (
                      <span>
                        Auto-advance:{" "}
                        <span className={autoAdvance ? "text-vivid-teal" : "text-soft-gray/70"}>
                          {autoAdvance ? "yes" : "no"}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </Shell>
  );
}
