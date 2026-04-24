import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("checkpoint_submissions")
    .select("*, checkpoints(title, description, stage_number), users!student_user_id(display_name, email)")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const { id } = await params;
  const body = await req.json();
  const { status, feedback } = body;

  const supabase = getServiceClient();

  const isApproved = status === "submitted" && body.approved === true;

  const { data, error } = await supabase
    .from("checkpoint_submissions")
    .update({
      status,
      feedback: feedback ?? null,
      reviewer_id: user.userId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, checkpoint_id, student_user_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If approved, advance student_method_progress for linked stages
  if (isApproved && data) {
    const { data: submission } = await supabase
      .from("checkpoint_submissions")
      .select("checkpoint_id, student_user_id")
      .eq("id", id)
      .single();

    if (submission) {
      const { data: checkpoint } = await supabase
        .from("checkpoints")
        .select("stage_number, project_id")
        .eq("id", submission.checkpoint_id)
        .single();

      if (checkpoint) {
        await supabase
          .from("student_method_progress")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("project_id", checkpoint.project_id)
          .eq("stage_number", checkpoint.stage_number);
      }
    }
  }

  return NextResponse.json(data);
}
