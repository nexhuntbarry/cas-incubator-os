import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import { ChevronLeft, MessageSquarePlus } from "lucide-react";
import StageProgressBar from "@/components/shared/StageProgressBar";
import FlagRiskButton from "@/components/shared/FlagRiskButton";
import WorkLinksGrid from "@/components/project/WorkLinksGrid";

export default async function MentorProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "mentor" && user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, title, description, problem_statement, target_user, value_proposition,
      mvp_definition, current_stage, stage_status, student_user_id,
      live_product_url, demo_video_url, presentation_slide_url,
      github_repo_url, figma_or_design_url, screenshot_gallery_urls,
      github_url, figma_url, presentation_url,
      last_url_update_at, last_url_update_by,
      project_type_definitions(name, slug),
      users!projects_student_user_id_fkey(display_name, email),
      enrollment_records!projects_enrollment_id_fkey(cohorts(name))
    `)
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: stages } = await supabase
    .from("method_stage_definitions")
    .select("stage_number, name")
    .order("stage_number", { ascending: true });

  const { data: progress } = await supabase
    .from("student_method_progress")
    .select("stage_number, status, submitted_at, student_notes")
    .eq("project_id", id);

  // Resolve last_url_update_by display name
  let lastUpdatedByName: string | null = null;
  if (project.last_url_update_by) {
    const { data: updaterUser } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", project.last_url_update_by)
      .single();
    lastUpdatedByName = updaterUser?.display_name ?? null;
  }

  const stagesWithStatus = (stages ?? []).map((s) => {
    const p = progress?.find((pr) => pr.stage_number === s.stage_number);
    return { stageNumber: s.stage_number, name: s.name, status: p?.status ?? "not_started" };
  });

  const student = project.users as unknown as { display_name: string; email: string } | null;
  const cohort = (project.enrollment_records as unknown as { cohorts: { name: string } } | null)?.cohorts;

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <UserButton />
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div>
          <Link
            href="/mentor/projects"
            className="inline-flex items-center gap-1 text-sm text-soft-gray/50 hover:text-soft-gray transition-colors mb-4"
          >
            <ChevronLeft size={14} /> Projects
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            {student && project.student_user_id && (
              <FlagRiskButton
                studentUserId={project.student_user_id}
                studentName={student.display_name}
                projectId={project.id}
              />
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-soft-gray/50">
            <span>{student?.display_name}</span>
            {cohort && <><span>·</span><span>{cohort.name}</span></>}
          </div>
        </div>

        {/* Student's Submitted Work */}
        <WorkLinksGrid
          links={{
            live_product_url: project.live_product_url,
            demo_video_url: project.demo_video_url,
            presentation_slide_url: project.presentation_slide_url,
            github_repo_url: project.github_repo_url,
            figma_or_design_url: project.figma_or_design_url,
            screenshot_gallery_urls: Array.isArray(project.screenshot_gallery_urls)
              ? project.screenshot_gallery_urls as string[]
              : [],
            github_url: project.github_url,
            figma_url: project.figma_url,
            presentation_url: project.presentation_url,
          }}
          lastUpdatedAt={project.last_url_update_at}
          lastUpdatedBy={lastUpdatedByName}
        />

        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <h2 className="text-sm font-semibold mb-3">Method Progress</h2>
          <StageProgressBar stages={stagesWithStatus} currentStage={project.current_stage} />
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
          <h2 className="text-sm font-semibold">Project Details</h2>
          {[
            { label: "Problem Statement", value: project.problem_statement },
            { label: "Target User", value: project.target_user },
            { label: "Value Proposition", value: project.value_proposition },
          ].map(({ label, value }) =>
            value ? (
              <div key={label}>
                <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm text-soft-gray/80">{value}</p>
              </div>
            ) : null
          )}
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquarePlus size={16} className="text-soft-gray/40" />
            <h2 className="text-sm font-semibold">Session Notes</h2>
          </div>
          <p className="text-sm text-soft-gray/50">
            Visit{" "}
            <a href="/mentor/notes" className="text-vivid-teal hover:underline">
              My Notes
            </a>{" "}
            to leave session notes for this student.
          </p>
        </div>
      </main>
    </div>
  );
}
