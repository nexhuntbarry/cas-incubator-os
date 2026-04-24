import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ stage_id: string }> }
) {
  const result = await requireRole("student");
  if (result instanceof NextResponse) return result;
  const user = result;

  const { stage_id } = await params;
  const stageNumber = parseInt(stage_id, 10);
  if (isNaN(stageNumber)) {
    return NextResponse.json({ error: "Invalid stage_id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { notes, evidenceUrls } = body;

  const supabase = getServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("student_user_id", user.userId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("student_method_progress")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      student_notes: notes ?? null,
      evidence_urls: evidenceUrls ?? [],
    })
    .eq("project_id", project.id)
    .eq("stage_number", stageNumber);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
