import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const result = await requireRole("super_admin");
  if (result instanceof NextResponse) return result;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("project_type_definitions")
    .select("*")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const result = await requireRole("super_admin");
  if (result instanceof NextResponse) return result;

  const body = await req.json();
  const { slug, name, description, examples } = body;

  if (!slug || !name) {
    return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("project_type_definitions")
    .insert({ slug, name, description: description ?? null, examples: examples ?? [] })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const result = await requireRole("super_admin");
  if (result instanceof NextResponse) return result;

  const body = await req.json();
  const { id, name, description, examples } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("project_type_definitions")
    .update({
      name: name ?? undefined,
      description: description ?? undefined,
      examples: examples ?? undefined,
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
    .from("project_type_definitions")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
