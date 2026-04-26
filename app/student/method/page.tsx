import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CheckCircle2, Circle, Clock, ChevronRight, Lock } from "lucide-react";
import Shell from "@/components/student/Shell";

const STATUS_ICON: Record<string, React.FC<{ className?: string }>> = {
  not_started: ({ className }) => <Circle className={className} size={18} />,
  in_progress: ({ className }) => <Clock className={className} size={18} />,
  submitted: ({ className }) => <Clock className={className} size={18} />,
  reviewed: ({ className }) => <CheckCircle2 className={className} size={18} />,
};

const STATUS_COLOR: Record<string, string> = {
  not_started: "text-soft-gray/30",
  in_progress: "text-electric-blue",
  submitted: "text-gold",
  reviewed: "text-vivid-teal",
};

export default async function StudentMethodPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("intake_completed_at")
    .eq("user_id", user.userId)
    .single();

  if (!profile?.intake_completed_at) redirect("/student/intake");

  const { data: project } = await supabase
    .from("projects")
    .select("id, current_stage")
    .eq("student_user_id", user.userId)
    .single();

  const { data: stages } = await supabase
    .from("method_stage_definitions")
    .select("id, stage_number, name, description")
    .order("stage_number", { ascending: true });

  const { data: progress } = await supabase
    .from("student_method_progress")
    .select("stage_number, status")
    .eq("student_user_id", user.userId);

  const t = await getTranslations("student.method");
  const currentStage = project?.current_stage ?? 1;

  const stagesWithStatus = (stages ?? []).map((s) => {
    const p = progress?.find((pr) => pr.stage_number === s.stage_number);
    return { ...s, stageNumber: s.stage_number, status: p?.status ?? "not_started" };
  });

  return (
    <Shell title={t("title")} introKey="student.method">
      <div className="max-w-2xl space-y-6">
        <p className="text-soft-gray/50 text-sm">{t("subtitle")}</p>

        <div className="space-y-3">
          {stagesWithStatus.map((stage, idx) => {
            const isCompleted = stage.status === "reviewed";
            const isActive = stage.stageNumber === currentStage;
            const isLocked = stage.stageNumber > currentStage + 1;
            const StatusIcon = STATUS_ICON[stage.status] ?? Circle;
            const color = STATUS_COLOR[stage.status] ?? "text-soft-gray/30";

            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Connector line */}
                {idx < stagesWithStatus.length - 1 && (
                  <div className="absolute left-[11px] top-8 w-px h-full bg-white/10 -z-10" />
                )}

                <div className={`mt-0.5 flex-shrink-0 ${color}`}>
                  {isLocked ? <Lock size={18} className="text-soft-gray/20" /> : <StatusIcon />}
                </div>

                <div className={`flex-1 rounded-xl border p-4 transition-colors ${
                  isActive
                    ? "border-electric-blue/30 bg-electric-blue/5"
                    : isCompleted
                    ? "border-vivid-teal/20 bg-vivid-teal/5"
                    : "border-white/8 bg-white/2"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-soft-gray/40 uppercase tracking-wider">Stage {stage.stage_number}</span>
                      <h3 className={`text-sm font-semibold mt-0.5 ${isActive ? "text-electric-blue" : isCompleted ? "text-vivid-teal" : "text-soft-gray"}`}>
                        {stage.name}
                      </h3>
                      {stage.description && (
                        <p className="text-xs text-soft-gray/50 mt-1 line-clamp-2">{stage.description}</p>
                      )}
                    </div>
                    {!isLocked && (
                      <Link
                        href={`/student/method/${stage.stage_number}`}
                        className="flex items-center gap-1 text-xs text-soft-gray/50 hover:text-soft-gray transition-colors ml-4 flex-shrink-0"
                      >
                        {t("view")} <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>

                  {isActive && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-electric-blue/15 text-electric-blue text-xs font-medium">
                        <Clock size={11} /> {t("inProgress")}
                      </span>
                    </div>
                  )}
                  {stage.status === "submitted" && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 text-gold text-xs font-medium">
                        {t("submitted")}
                      </span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vivid-teal/15 text-vivid-teal text-xs font-medium">
                        <CheckCircle2 size={11} /> {t("completed")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
