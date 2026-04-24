import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("worksheet_templates")
    .select("id, title, description, is_active, created_at, template_type, scoring_type")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const {
    title,
    description,
    instructions,
    fields_schema,
    linked_lesson_number,
    linked_method_stage_id,
    linked_project_types,
    required_status,
    scoring_type,
    template_type,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("worksheet_templates")
    .insert({
      title,
      description: description ?? null,
      instructions: instructions ?? null,
      fields_schema: fields_schema ?? [],
      linked_lesson_number: linked_lesson_number ?? null,
      linked_method_stage_id: linked_method_stage_id ?? null,
      linked_project_types: linked_project_types ?? [],
      required_status: required_status ?? "optional",
      scoring_type: scoring_type ?? "none",
      template_type: template_type ?? "general",
      is_active: true,
      created_by: user.userId,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
