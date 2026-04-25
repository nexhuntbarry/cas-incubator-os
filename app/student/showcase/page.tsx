import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import ShowcaseBuilder from "@/components/student/ShowcaseBuilder";
import Shell from "@/components/student/Shell";

export default async function StudentShowcasePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student" && user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, title, description, problem_statement, target_user, value_proposition,
      current_stage, demo_url, metadata,
      live_product_url, demo_video_url, presentation_slide_url,
      github_repo_url, figma_or_design_url,
      github_url, figma_url, presentation_url
    `)
    .eq("student_user_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: showcase } = project
    ? await supabase
        .from("showcase_records")
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle()
    : { data: null };

  // Auto-pull: use project URL fields as fallbacks when showcase fields are empty
  const resolvedDemoLink =
    showcase?.demo_url ||
    project?.live_product_url ||
    (project?.demo_url as string | undefined) ||
    "";

  const resolvedVideoLink =
    showcase?.video_url ||
    project?.demo_video_url ||
    "";

  const resolvedPresentationLink =
    showcase?.presentation_link ||
    project?.presentation_slide_url ||
    project?.presentation_url ||
    "";

  const resolvedRepoLink =
    showcase?.repo_link ||
    project?.github_repo_url ||
    project?.github_url ||
    "";

  return (
    <Shell title="My Showcase">
      <div className="max-w-3xl">
        <p className="text-soft-gray/50 text-sm mb-8">
          Build your public project page to share your work with the world.
        </p>

        {!project ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
            <p className="text-soft-gray/50">No project found. Complete your intake first.</p>
          </div>
        ) : (
          <ShowcaseBuilder
            projectId={project.id}
            studentName={user.displayName}
            initialData={{
              title: showcase?.title ?? project.title,
              description: showcase?.description ?? project.description ?? "",
              presentationLink: resolvedPresentationLink,
              demoLink: resolvedDemoLink,
              repoLink: resolvedRepoLink,
              videoLink: resolvedVideoLink,
              screenshotsJson: (showcase?.screenshots_json as string[]) ?? [],
              publicShareEnabled: showcase?.public_share_enabled ?? false,
              publicShareToken: showcase?.public_share_token ?? null,
            }}
            projectContext={{
              projectTitle: project.title,
              projectDescription: project.description,
              problemStatement: project.problem_statement,
              targetUser: project.target_user,
              valueProposition: project.value_proposition,
              currentMethodStage: project.current_stage,
            }}
          />
        )}
      </div>
    </Shell>
  );
}
