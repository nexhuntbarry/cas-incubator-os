import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function PATCH(req: Request) {
  const result = await requireRole("student");
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const {
    title,
    description,
    problemStatement,
    targetUser,
    valueProposition,
    mvpDefinition,
    githubUrl,
    figmaUrl,
    demoVideoUrl,
    presentationUrl,
  } = body;

  const supabase = getServiceClient();

  const { data: project, error } = await supabase
    .from("projects")
    .update({
      title: title ?? undefined,
      description: description ?? undefined,
      problem_statement: problemStatement ?? undefined,
      target_user: targetUser ?? undefined,
      value_proposition: valueProposition ?? undefined,
      mvp_definition: mvpDefinition ?? undefined,
      github_url: githubUrl ?? undefined,
      figma_url: figmaUrl ?? undefined,
      demo_video_url: demoVideoUrl ?? undefined,
      presentation_url: presentationUrl ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("student_user_id", user.userId)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, projectId: project?.id });
}
