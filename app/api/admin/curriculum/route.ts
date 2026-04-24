import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor", "student"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("program_id");
  const lessonNumber = searchParams.get("lesson_number");

  const supabase = getServiceClient();
  let query = supabase
    .from("curriculum_assets")
    .select("id, title, asset_type, url, lesson_number, visibility_scope, sort_order, created_at, program_id")
    .order("lesson_number", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true });

  if (programId) query = query.eq("program_id", programId);
  if (lessonNumber) query = query.eq("lesson_number", Number(lessonNumber));

  // Role-based visibility filter
  if (user.role === "student") {
    query = query.contains("visibility_scope", ["student"]);
  } else if (user.role === "mentor") {
    query = query.contains("visibility_scope", ["mentor"]);
  } else if (user.role === "teacher") {
    query = query.contains("visibility_scope", ["teacher"]);
  }

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
    lesson_number,
    asset_type,
    title,
    url,
    blob_key,
    description,
    visibility_scope,
    version_number,
    sort_order,
  } = body;

  if (!title || !asset_type) {
    return NextResponse.json({ error: "title and asset_type required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("curriculum_assets")
    .insert({
      program_id: program_id ?? null,
      lesson_number: lesson_number ?? null,
      asset_type,
      title,
      url: url ?? null,
      blob_key: blob_key ?? null,
      description: description ?? null,
      visibility_scope: visibility_scope ?? ["teacher", "mentor", "student"],
      metadata: version_number ? { version_number } : {},
      sort_order: sort_order ?? 0,
      created_by: user.userId,
      uploaded_by_user_id: user.userId,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
