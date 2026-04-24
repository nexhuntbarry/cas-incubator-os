import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();
  const { name, description, duration_weeks } = body;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("programs")
    .update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(duration_weeks !== undefined && { duration_weeks }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("programs")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ archived: true });
}
