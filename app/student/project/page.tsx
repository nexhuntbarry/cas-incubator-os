import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import StageProgressBar from "@/components/shared/StageProgressBar";
import ProjectEditor from "@/components/student/ProjectEditor";

export default async function StudentProjectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  // Intake gate
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("id, intake_completed_at")
    .eq("user_id", user.userId)
    .single();

  if (!profile?.intake_completed_at) {
    redirect("/student/intake");
  }

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, title, description, problem_statement, target_user, value_proposition,
      mvp_definition, github_url, figma_url, demo_video_url, presentation_url,
      screenshot_gallery_urls, current_stage, stage_status, ai_classification_json,
      project_type_definitions(name, slug)
    `)
    .eq("student_user_id", user.userId)
    .single();

  const { data: stages } = await supabase
    .from("method_stage_definitions")
    .select("stage_number, name")
    .order("stage_number", { ascending: true });

  const { data: progress } = await supabase
    .from("student_method_progress")
    .select("stage_number, status")
    .eq("student_user_id", user.userId);

  const t = await getTranslations("student.project");

  const stagesWithStatus = (stages ?? []).map((s) => {
    const p = progress?.find((pr) => pr.stage_number === s.stage_number);
    return { stageNumber: s.stage_number, name: s.name, status: p?.status ?? "not_started" };
  });

  const currentStage = project?.current_stage ?? 1;
  const totalStages = stagesWithStatus.length || 10;
  const completedCount = stagesWithStatus.filter((s) => s.status === "reviewed" || s.status === "submitted").length;

  const projectType = project?.project_type_definitions as unknown as { name: string; slug: string } | null;
  const classification = project?.ai_classification_json as unknown as { manualReviewNeeded?: boolean } | null;

  const labels: Record<string, string> = {
    title: t("fields.title"),
    summary: t("fields.summary"),
    problem: t("fields.problem"),
    targetUser: t("fields.targetUser"),
    value: t("fields.value"),
    mvp: t("fields.mvp"),
    screenshots: t("fields.screenshots"),
    save: t("save"),
  };

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <Link href="/student/method" className="text-sm text-soft-gray/60 hover:text-soft-gray transition-colors">
            Method Pipeline
          </Link>
          <UserButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>

          {/* Stage progress */}
          <div className="mt-6 rounded-xl border border-white/8 bg-white/3 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-soft-gray/50 uppercase tracking-wider">{t("currentStage")}</span>
              <span className="text-xs text-soft-gray/50">{completedCount}/{totalStages} {t("progress")}</span>
            </div>
            <p className="text-sm font-semibold text-electric-blue mb-3">
              Stage {currentStage} — {stagesWithStatus.find(s => s.stageNumber === currentStage)?.name ?? ""}
            </p>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-electric-blue h-1.5 rounded-full transition-all"
                style={{ width: `${(completedCount / totalStages) * 100}%` }}
              />
            </div>
            <StageProgressBar stages={stagesWithStatus} currentStage={currentStage} />
          </div>
        </div>

        {/* Project type badge */}
        {projectType && (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium">
              {projectType.name}
            </span>
            {classification?.manualReviewNeeded && (
              <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-medium">
                Manual review needed
              </span>
            )}
          </div>
        )}

        {/* Editor */}
        {project ? (
          <ProjectEditor
            project={{
              id: project.id,
              title: project.title,
              description: project.description,
              problemStatement: project.problem_statement,
              targetUser: project.target_user,
              valueProposition: project.value_proposition,
              mvpDefinition: project.mvp_definition,
              githubUrl: project.github_url,
              figmaUrl: project.figma_url,
              demoVideoUrl: project.demo_video_url,
              presentationUrl: project.presentation_url,
              screenshotGalleryUrls: Array.isArray(project.screenshot_gallery_urls) ? project.screenshot_gallery_urls : [],
            }}
            labels={labels}
          />
        ) : (
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center">
            <p className="text-soft-gray/50 text-sm">No project found. Please complete intake first.</p>
            <Link href="/student/intake" className="mt-3 inline-block text-sm text-electric-blue hover:underline">
              Complete Intake →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
