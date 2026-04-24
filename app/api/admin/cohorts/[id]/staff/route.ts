import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const { id: cohortId } = await params;
  const body = await req.json();
  const { user_id, role } = body;

  if (!user_id || !role) {
    return NextResponse.json(
      { error: "user_id and role are required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("cohort_staff_assignments")
    .upsert(
      { cohort_id: cohortId, user_id, role },
      { onConflict: "cohort_id,user_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
