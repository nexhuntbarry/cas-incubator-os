import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("rubric_templates")
    .select("id, name, stage_number, is_active, created_at, criteria, rating_scale_json")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const { name, stage_number, criteria, rating_scale_json, guidance_notes, linked_project_types } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("rubric_templates")
    .insert({
      name,
      stage_number: stage_number ?? null,
      criteria: criteria ?? [],
      rating_scale_json: rating_scale_json ?? {
        min: 1,
        max: 5,
        labels: { "1": "Poor", "2": "Below Average", "3": "Average", "4": "Good", "5": "Excellent" },
      },
      guidance_notes: guidance_notes ?? null,
      linked_project_types: linked_project_types ?? [],
      is_active: true,
      created_by: user.userId,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
