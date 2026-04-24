import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const { rubric_id, student_user_id, project_id, scores_json, comments_json, approved_status } = body;

  if (!rubric_id || !student_user_id) {
    return NextResponse.json({ error: "rubric_id and student_user_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Compute total score (simple average of scores)
  const scoreValues = Object.values(scores_json ?? {}) as number[];
  const total_score =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : null;

  const { data, error } = await supabase
    .from("rubric_evaluations")
    .insert({
      rubric_id,
      student_user_id,
      project_id: project_id ?? null,
      evaluator_id: user.userId,
      evaluator_staff_id: user.userId,
      scores: scores_json ?? {},
      scores_json: scores_json ?? {},
      comments_json: comments_json ?? {},
      total_score,
      approved_status: approved_status ?? false,
      evaluated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_user_id");
  const rubricId = searchParams.get("rubric_id");

  const supabase = getServiceClient();
  let query = supabase
    .from("rubric_evaluations")
    .select("*, rubric_templates(name, criteria, rating_scale_json)")
    .order("evaluated_at", { ascending: false });

  if (studentId) query = query.eq("student_user_id", studentId);
  if (rubricId) query = query.eq("rubric_id", rubricId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
