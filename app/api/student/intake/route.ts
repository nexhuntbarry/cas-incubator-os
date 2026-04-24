import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { generateIntakeSummary } from "@/lib/ai/intake";
import { classifyProject } from "@/lib/ai/classify-project";

export async function POST(req: Request) {
  const result = await requireRole("student");
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const {
    gradeLevel,
    school,
    location,
    interests,
    academicDirection,
    competitionGoals,
    portfolioGoals,
    aiExperienceLevel,
    aiToolsUsed,
    problemStatement,
    consentGiven,
  } = body;

  const supabase = getServiceClient();

  // Get or create student profile
  const { data: existingProfile } = await supabase
    .from("student_profiles")
    .select("id, intake_completed_at, intake_summary_json")
    .eq("user_id", user.userId)
    .single();

  // Check 24h cache
  const cachedSummary =
    existingProfile?.intake_summary_json &&
    existingProfile.intake_completed_at &&
    Date.now() - new Date(existingProfile.intake_completed_at).getTime() < 24 * 60 * 60 * 1000;

  let intakeSummary = cachedSummary ? existingProfile!.intake_summary_json : null;

  if (!intakeSummary) {
    intakeSummary = await generateIntakeSummary({
      gradeLevel,
      school,
      location,
      interests,
      academicDirection,
      competitionGoals,
      portfolioGoals,
      aiExperienceLevel,
      aiToolsUsed,
      problemStatement,
    });
  }

  // Upsert student profile with all intake fields
  const profilePayload = {
    user_id: user.userId,
    grade: gradeLevel ?? null,
    grade_level: gradeLevel ?? null,
    school_name: school ?? null,
    location: location ?? null,
    interests: interests ?? [],
    intended_major_or_direction: academicDirection ?? null,
    ai_experience_level: aiExperienceLevel ?? null,
    competition_goals: competitionGoals ?? null,
    portfolio_goals: portfolioGoals ?? null,
    bio: problemStatement ?? null,
    intake_summary_json: intakeSummary,
    intake_completed_at: new Date().toISOString(),
  };

  const { data: profile, error: profileErr } = await supabase
    .from("student_profiles")
    .upsert(profilePayload, { onConflict: "user_id" })
    .select("id")
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: profileErr?.message ?? "Profile save failed" }, { status: 500 });
  }

  // Get enrollment
  const { data: enrollment } = await supabase
    .from("enrollment_records")
    .select("id")
    .eq("student_user_id", user.userId)
    .eq("status", "active")
    .single();

  if (!enrollment) {
    return NextResponse.json({ error: "No active enrollment found" }, { status: 400 });
  }

  // Check if project already exists
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id")
    .eq("student_user_id", user.userId)
    .single();

  if (!existingProject) {
    // Classify project type
    let projectTypeId: string | null = null;
    let classificationJson: object | null = null;

    if (problemStatement) {
      const classification = await classifyProject(problemStatement);
      classificationJson = classification;

      const { data: projectType } = await supabase
        .from("project_type_definitions")
        .select("id")
        .eq("slug", classification.projectTypeSlug)
        .single();

      projectTypeId = projectType?.id ?? null;
    }

    // Create project
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .insert({
        enrollment_id: enrollment.id,
        student_user_id: user.userId,
        student_profile_id: profile.id,
        project_type_id: projectTypeId,
        title: "My Project",
        problem_statement: problemStatement ?? null,
        ai_classification_json: classificationJson,
        status: "active",
        current_stage: 1,
        stage_status: "in_progress",
      })
      .select("id")
      .single();

    if (projectErr || !project) {
      return NextResponse.json({ error: projectErr?.message ?? "Project creation failed" }, { status: 500 });
    }

    // Get all method stages
    const { data: stages } = await supabase
      .from("method_stage_definitions")
      .select("stage_number")
      .order("stage_number", { ascending: true });

    if (stages && stages.length > 0) {
      const progressRows = stages.map((s, idx) => ({
        project_id: project.id,
        student_user_id: user.userId,
        stage_number: s.stage_number,
        status: idx === 0 ? "in_progress" : "not_started",
        started_at: idx === 0 ? new Date().toISOString() : null,
      }));

      await supabase.from("student_method_progress").insert(progressRows);
    }
  }

  return NextResponse.json({ success: true, intakeSummary });
}
