import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { name, description, duration_weeks } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("programs")
    .insert({
      name,
      description: description ?? null,
      duration_weeks: duration_weeks ?? null,
      created_by: auth.userId,
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
    .from("programs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
