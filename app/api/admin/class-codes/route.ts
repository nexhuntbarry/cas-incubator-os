import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { createClassCode } from "@/lib/class-codes";

export async function POST(req: Request) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { cohort_id, expires_at, max_uses } = body;

  if (!cohort_id) {
    return NextResponse.json({ error: "cohort_id is required" }, { status: 400 });
  }

  const code = await createClassCode({
    cohortId: cohort_id,
    expiresAt: expires_at ?? null,
    maxUses: max_uses ?? null,
    createdBy: auth.userId,
  });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("class_codes")
    .select("*")
    .eq("code", code)
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
    .from("class_codes")
    .select("*, cohorts(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
