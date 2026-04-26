import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import StageSubmitForm from "@/components/student/StageSubmitForm";
import Shell from "@/components/student/Shell";

export default async function StudentStagePage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const { stage } = await params;
  const stageNumber = parseInt(stage, 10);
  if (isNaN(stageNumber)) notFound();

  const supabase = getServiceClient();

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("intake_completed_at")
    .eq("user_id", user.userId)
    .single();

  if (!profile?.intake_completed_at) redirect("/student/intake");

  const { data: stageDef } = await supabase
    .from("method_stage_definitions")
    .select("*")
    .eq("stage_number", stageNumber)
    .single();

  if (!stageDef) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id, current_stage")
    .eq("student_user_id", user.userId)
    .single();

  if (!project) redirect("/student/intake");

  const { data: stageProgress } = await supabase
    .from("student_method_progress")
    .select("status, student_notes, evidence_urls")
    .eq("project_id", project.id)
    .eq("stage_number", stageNumber)
    .single();

  const t = await getTranslations("student.method");

  const guidingQuestions: string[] = Array.isArray(stageDef.guiding_questions)
    ? stageDef.guiding_questions
    : [];
  const expectedOutputs: string[] = Array.isArray(stageDef.expected_outputs_json)
    ? stageDef.expected_outputs_json
    : [];

  const isLocked = stageNumber > project.current_stage + 1;
  const currentStatus = stageProgress?.status ?? "not_started";
  const isSubmitted = currentStatus === "submitted" || currentStatus === "reviewed";

  return (
    <Shell title={stageDef.name} introKey="student.methodStage">
      <div className="max-w-2xl space-y-8">
        <div>
          <Link
            href="/student/method"
            className="inline-flex items-center gap-1 text-sm text-soft-gray/50 hover:text-soft-gray transition-colors mb-4"
          >
            <ChevronLeft size={14} /> {t("backToMethod")}
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-electric-blue/15 text-electric-blue text-xs font-semibold">
              Stage {stageNumber}
            </span>
            {isSubmitted && (
              <span className="px-2.5 py-1 rounded-full bg-vivid-teal/15 text-vivid-teal text-xs font-semibold">
                {t("submitted")}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-2">{stageDef.name}</h1>
          {stageDef.description && (
            <p className="text-soft-gray/60 text-sm mt-2">{stageDef.description}</p>
          )}
        </div>

        {expectedOutputs.length > 0 && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-soft-gray/70 uppercase tracking-wider">{t("expectedOutputs")}</h2>
            <ul className="space-y-1.5">
              {expectedOutputs.map((output, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-soft-gray/70">
                  <span className="text-vivid-teal mt-0.5">✓</span>
                  {output}
                </li>
              ))}
            </ul>
          </div>
        )}

        {guidingQuestions.length > 0 && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-soft-gray/70 uppercase tracking-wider">{t("guidingQuestions")}</h2>
            <ol className="space-y-2">
              {guidingQuestions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-soft-gray/70">
                  <span className="text-electric-blue font-semibold flex-shrink-0">{idx + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        )}

        {isLocked ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center">
            <p className="text-soft-gray/50 text-sm">This stage is locked. Complete previous stages first.</p>
          </div>
        ) : (
          <StageSubmitForm
            stageId={stageNumber}
            initialNotes={stageProgress?.student_notes ?? ""}
            isSubmitted={isSubmitted}
            labels={{
              submit: t("submit"),
              submitting: t("submitting"),
              submitted: t("submitted"),
              notes: t("notes"),
              evidenceLabel: t("evidenceLabel"),
            }}
          />
        )}
      </div>
    </Shell>
  );
}
