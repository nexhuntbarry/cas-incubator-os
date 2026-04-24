import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "teacher", "mentor"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, resolution_notes, assigned_to_user_id } = body;

  const supabase = getServiceClient();
  const updates: Record<string, unknown> = {};

  if (status) updates.status = status;
  if (resolution_notes) updates.resolution_notes = resolution_notes;
  if (assigned_to_user_id !== undefined) updates.assigned_to_user_id = assigned_to_user_id;

  if (status === "resolved") {
    updates.resolved_at = new Date().toISOString();
    updates.resolved = true;
    updates.resolved_by = user.userId;
  }

  const { data, error } = await supabase
    .from("risk_flags")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ flag: data });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("risk_flags")
    .select(
      "*, student:users!risk_flags_student_user_id_fkey(display_name, email), raised_by:users!risk_flags_raised_by_user_id_fkey(display_name), assigned_to:users!risk_flags_assigned_to_user_id_fkey(display_name)"
    )
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ flag: data });
}
