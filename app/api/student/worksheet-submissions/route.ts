import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const result = await requireAnyRole(["student"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("template_id");

  const supabase = getServiceClient();
  let query = supabase
    .from("worksheet_submissions")
    .select("id, template_id, status, submitted_at, version_number, feedback, worksheet_templates(title)")
    .eq("student_user_id", user.userId)
    .order("updated_at", { ascending: false });

  if (templateId) query = query.eq("template_id", templateId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const result = await requireAnyRole(["student"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const { template_id, answers, status, assignment_id } = body;

  if (!template_id) {
    return NextResponse.json({ error: "template_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Check for existing submission
  const { data: existing } = await supabase
    .from("worksheet_submissions")
    .select("id, version_number, status")
    .eq("template_id", template_id)
    .eq("student_user_id", user.userId)
    .single();

  const isSubmitting = status === "submitted";

  if (existing) {
    const newVersion =
      existing.status === "revision_requested"
        ? (existing.version_number ?? 1) + 1
        : existing.version_number ?? 1;

    const updatePayload: Record<string, unknown> = {
      answers: answers ?? {},
      status: status ?? existing.status,
      version_number: newVersion,
      updated_at: new Date().toISOString(),
    };
    if (isSubmitting) {
      updatePayload.submitted_at = new Date().toISOString();
      updatePayload.ai_summary_json = null;
    }
    if (assignment_id) {
      updatePayload.assignment_id = assignment_id;
    }

    const { data, error } = await supabase
      .from("worksheet_submissions")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notification stub for submission
    if (isSubmitting) {
      await supabase.from("notifications").insert({
        user_id: user.userId,
        type: "worksheet_submitted",
        payload: { submission_id: existing.id, template_id },
      });
    }

    return NextResponse.json(data);
  }

  // Create new
  const { data, error } = await supabase
    .from("worksheet_submissions")
    .insert({
      template_id,
      student_user_id: user.userId,
      answers: answers ?? {},
      status: status ?? "in_progress",
      submitted_at: isSubmitting ? new Date().toISOString() : null,
      version_number: 1,
      assignment_id: assignment_id ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isSubmitting && data) {
    await supabase.from("notifications").insert({
      user_id: user.userId,
      type: "worksheet_submitted",
      payload: { submission_id: data.id, template_id },
    });
  }

  return NextResponse.json(data, { status: 201 });
}
