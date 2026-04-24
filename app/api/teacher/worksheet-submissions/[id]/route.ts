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
    .from("worksheet_submissions")
    .select("*, worksheet_templates(title, fields_schema, instructions), users!student_user_id(display_name, email)")
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
  const { status, feedback, feedback_summary } = body;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("worksheet_submissions")
    .update({
      status,
      feedback: feedback ?? null,
      feedback_summary: feedback_summary ?? null,
      reviewed_by: user.userId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
