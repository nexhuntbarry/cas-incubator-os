import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import StageProgressBar from "@/components/shared/StageProgressBar";
import ProjectEditor from "@/components/student/ProjectEditor";
import WorkLinksEditor from "@/components/project/WorkLinksEditor";
import Shell from "@/components/student/Shell";

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
      live_product_url, github_repo_url, figma_or_design_url, presentation_slide_url,
      screenshot_gallery_urls, current_stage, stage_status, ai_classification_json,
      last_url_update_at,
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

  // Determine if any URL is missing (for the CTA banner)
  const urlFieldsEmpty = project && (
    !project.live_product_url &&
    !project.demo_video_url &&
    !project.github_repo_url &&
    !project.figma_or_design_url &&
    !project.presentation_slide_url &&
    !(Array.isArray(project.screenshot_gallery_urls) && project.screenshot_gallery_urls.length > 0)
  );

  return (
    <Shell title={t("title")}>
      {/* Submit Your Work CTA banner — shown when no URL submitted yet */}
      {project && urlFieldsEmpty && (
        <div className="bg-gold/10 border border-gold/20 rounded-xl px-5 py-3 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gold font-medium">
            Submit Your Work — add your live product, demo video, or GitHub link so your mentor can review it.
          </p>
          <a
            href="#work-links-section"
            className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-gold text-deep-navy text-xs font-semibold hover:bg-gold/90 transition-colors"
          >
            Add Links
          </a>
        </div>
      )}

      <div className="max-w-3xl space-y-8">
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

        {project ? (
          <>
            {/* Section 1: Project Info */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-soft-gray/80 uppercase tracking-wider">Project Info</h2>
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
                infoOnlyMode
              />
            </div>

            {/* Section 2: Your Work / Live Links */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-soft-gray/80 uppercase tracking-wider">Your Work &amp; Live Links</h2>
                {project.last_url_update_at && (
                  <span className="text-xs text-soft-gray/40">
                    Last updated {new Date(project.last_url_update_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-soft-gray/40">
                Add links to your work so your mentor and teacher can follow your progress.
              </p>
              <WorkLinksEditor
                projectId={project.id}
                initialValues={{
                  liveProductUrl: project.live_product_url ?? "",
                  demoVideoUrl: project.demo_video_url ?? "",
                  presentationSlideUrl: project.presentation_slide_url ?? project.presentation_url ?? "",
                  githubRepoUrl: project.github_repo_url ?? project.github_url ?? "",
                  figmaOrDesignUrl: project.figma_or_design_url ?? project.figma_url ?? "",
                }}
                initialGallery={Array.isArray(project.screenshot_gallery_urls) ? project.screenshot_gallery_urls as string[] : []}
              />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center">
            <p className="text-soft-gray/50 text-sm">No project found. Please complete intake first.</p>
            <Link href="/student/intake" className="mt-3 inline-block text-sm text-electric-blue hover:underline">
              Complete Intake →
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
