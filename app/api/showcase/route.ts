import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    project_id,
    title,
    description,
    presentation_link,
    demo_link,
    repo_link,
    video_link,
    screenshots_json,
    public_share_enabled,
  } = body;

  if (!project_id || !title) {
    return NextResponse.json({ error: "project_id and title are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Verify the student owns this project (or is staff)
  if (user.role === "student") {
    const { data: project } = await supabase
      .from("projects")
      .select("student_user_id")
      .eq("id", project_id)
      .single();
    if (!project || project.student_user_id !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Check if showcase record already exists for this project
  const { data: existing } = await supabase
    .from("showcase_records")
    .select("id, public_share_token")
    .eq("project_id", project_id)
    .maybeSingle();

  const publicToken =
    public_share_enabled
      ? (existing?.public_share_token ?? randomUUID())
      : (existing?.public_share_token ?? null);

  const payload = {
    project_id,
    student_user_id: user.userId,
    title,
    description: description ?? null,
    presentation_link: presentation_link ?? null,
    demo_url: demo_link ?? null,
    repo_link: repo_link ?? null,
    video_url: video_link ?? null,
    slides_url: presentation_link ?? null,
    screenshots_json: screenshots_json ?? [],
    public_share_token: publicToken,
    public_share_enabled: public_share_enabled ?? false,
    updated_at: new Date().toISOString(),
  };

  let data, error;

  if (existing) {
    ({ data, error } = await supabase
      .from("showcase_records")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from("showcase_records")
      .insert(payload)
      .select()
      .single());
  }

  if (error || !data) {
    console.error("[showcase] upsert error:", error);
    return NextResponse.json({ error: "Failed to save showcase" }, { status: 500 });
  }

  return NextResponse.json({ showcase: data });
}
