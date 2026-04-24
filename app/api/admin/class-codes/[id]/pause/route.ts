import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: current } = await supabase
    .from("class_codes")
    .select("is_active")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("class_codes")
    .update({ is_active: !current?.is_active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
