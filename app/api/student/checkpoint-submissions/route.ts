import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const result = await requireAnyRole(["student"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const { searchParams } = new URL(req.url);
  const checkpointId = searchParams.get("checkpoint_id");

  const supabase = getServiceClient();
  let query = supabase
    .from("checkpoint_submissions")
    .select("id, checkpoint_id, status, submitted_at, feedback, checkpoints(title, stage_number)")
    .eq("student_user_id", user.userId)
    .order("updated_at", { ascending: false });

  if (checkpointId) query = query.eq("checkpoint_id", checkpointId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const result = await requireAnyRole(["student"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const { checkpoint_id, content, status } = body;

  if (!checkpoint_id) {
    return NextResponse.json({ error: "checkpoint_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: existing } = await supabase
    .from("checkpoint_submissions")
    .select("id")
    .eq("checkpoint_id", checkpoint_id)
    .eq("student_user_id", user.userId)
    .single();

  const isSubmitting = status === "submitted";

  if (existing) {
    const { data, error } = await supabase
      .from("checkpoint_submissions")
      .update({
        content: content ?? {},
        status: status ?? "in_progress",
        submitted_at: isSubmitting ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (isSubmitting) {
      await supabase.from("notifications").insert({
        user_id: user.userId,
        type: "checkpoint_submitted",
        payload: { checkpoint_submission_id: existing.id, checkpoint_id },
      });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("checkpoint_submissions")
    .insert({
      checkpoint_id,
      student_user_id: user.userId,
      content: content ?? {},
      status: status ?? "in_progress",
      submitted_at: isSubmitting ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isSubmitting && data) {
    await supabase.from("notifications").insert({
      user_id: user.userId,
      type: "checkpoint_submitted",
      payload: { checkpoint_submission_id: data.id, checkpoint_id },
    });
  }

  return NextResponse.json(data, { status: 201 });
}
