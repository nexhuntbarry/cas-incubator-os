import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const result = await requireRole("super_admin");
  if (result instanceof NextResponse) return result;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("method_stage_definitions")
    .select("*")
    .order("stage_number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const result = await requireRole("super_admin");
  if (result instanceof NextResponse) return result;

  const body = await req.json();
  const { stageNumber, name, description, expectedOutputsJson, guidingQuestions } = body;

  if (!stageNumber || !name) {
    return NextResponse.json({ error: "stageNumber and name are required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("method_stage_definitions")
    .insert({
      stage_number: stageNumber,
      name,
      description: description ?? null,
      expected_outputs_json: expectedOutputsJson ?? [],
      guiding_questions: guidingQuestions ?? [],
      sort_order: stageNumber,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const result = await requireRole("super_admin");
  if (result instanceof NextResponse) return result;

  const body = await req.json();
  const { id, name, description, expectedOutputsJson, guidingQuestions } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("method_stage_definitions")
    .update({
      name: name ?? undefined,
      description: description ?? undefined,
      expected_outputs_json: expectedOutputsJson ?? undefined,
      guiding_questions: guidingQuestions ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const result = await requireRole("super_admin");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("method_stage_definitions")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
