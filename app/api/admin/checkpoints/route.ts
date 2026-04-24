import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("program_id");

  const supabase = getServiceClient();
  let query = supabase
    .from("checkpoint_templates")
    .select("*")
    .order("checkpoint_number", { ascending: true });

  if (programId) query = query.eq("program_id", programId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const {
    program_id,
    checkpoint_name,
    checkpoint_number,
    description,
    required_artifacts_json,
    required_rubrics_json,
    approval_rules_json,
    linked_method_stage_ids_json,
  } = body;

  if (!program_id || !checkpoint_name || checkpoint_number === undefined) {
    return NextResponse.json(
      { error: "program_id, checkpoint_name, checkpoint_number required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("checkpoint_templates")
    .insert({
      program_id,
      checkpoint_name,
      checkpoint_number,
      description: description ?? null,
      required_artifacts_json: required_artifacts_json ?? [],
      required_rubrics_json: required_rubrics_json ?? [],
      approval_rules_json: approval_rules_json ?? {},
      linked_method_stage_ids_json: linked_method_stage_ids_json ?? [],
      active_status: true,
      created_by: user.userId,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
