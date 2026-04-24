import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { name, program_id, start_date, end_date, max_students } = body;

  if (!name || !program_id) {
    return NextResponse.json(
      { error: "name and program_id are required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("cohorts")
    .insert({
      name,
      program_id,
      start_date: start_date ?? null,
      end_date: end_date ?? null,
      max_students: max_students ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("cohorts")
    .select("*, programs(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
