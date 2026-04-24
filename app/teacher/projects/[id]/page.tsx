import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import { ChevronLeft, MessageSquarePlus } from "lucide-react";
import StageProgressBar from "@/components/shared/StageProgressBar";

export default async function TeacherProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, title, description, problem_statement, target_user, value_proposition,
      mvp_definition, current_stage, stage_status, ai_classification_json,
      project_type_definitions(name, slug),
      users!projects_student_user_id_fkey(display_name, email, avatar_url),
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

  const stagesWithStatus = (stages ?? []).map((s) => {
    const p = progress?.find((pr) => pr.stage_number === s.stage_number);
    return { stageNumber: s.stage_number, name: s.name, status: p?.status ?? "not_started" };
  });

  const student = project.users as unknown as { display_name: string; email: string; avatar_url: string | null } | null;
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
            href="/teacher/projects"
            className="inline-flex items-center gap-1 text-sm text-soft-gray/50 hover:text-soft-gray transition-colors mb-4"
          >
            <ChevronLeft size={14} /> Projects
          </Link>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-soft-gray/50">
            <span>{student?.display_name}</span>
            {cohort && <><span>·</span><span>{cohort.name}</span></>}
          </div>
        </div>

        {/* Method progress */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <h2 className="text-sm font-semibold mb-3">Method Progress</h2>
          <StageProgressBar stages={stagesWithStatus} currentStage={project.current_stage} />
        </div>

        {/* Project info */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
          <h2 className="text-sm font-semibold">Project Details</h2>
          {[
            { label: "Problem Statement", value: project.problem_statement },
            { label: "Target User", value: project.target_user },
            { label: "Value Proposition", value: project.value_proposition },
            { label: "MVP Definition", value: project.mvp_definition },
          ].map(({ label, value }) =>
            value ? (
              <div key={label}>
                <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm text-soft-gray/80">{value}</p>
              </div>
            ) : null
          )}
        </div>

        {/* Submitted stages */}
        {progress && progress.filter((p) => p.student_notes).length > 0 && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
            <h2 className="text-sm font-semibold">Student Notes by Stage</h2>
            {progress
              .filter((p) => p.student_notes)
              .map((p) => (
                <div key={p.stage_number} className="border-t border-white/8 pt-3 first:border-0 first:pt-0">
                  <p className="text-xs text-soft-gray/40 mb-1">Stage {p.stage_number}</p>
                  <p className="text-sm text-soft-gray/70">{p.student_notes}</p>
                </div>
              ))}
          </div>
        )}

        {/* Leave Note placeholder */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquarePlus size={16} className="text-soft-gray/40" />
            <h2 className="text-sm font-semibold">Leave a Note</h2>
            <span className="px-2 py-0.5 rounded-full bg-white/8 text-xs text-soft-gray/40">Phase 3</span>
          </div>
          <p className="text-sm text-soft-gray/40">Full review and feedback flow coming in Phase 3.</p>
        </div>
      </main>
    </div>
  );
}
