import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const result = await requireRole("student");
  if (result instanceof NextResponse) return result;
  const user = result;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, screenshot_gallery_urls")
    .eq("student_user_id", user.userId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const uuid = crypto.randomUUID();
  const path = `projects/${project.id}/screenshots/${uuid}.${ext}`;

  const blob = await put(path, file, { access: "public" });

  const existingUrls: string[] = Array.isArray(project.screenshot_gallery_urls)
    ? project.screenshot_gallery_urls
    : [];

  const { error: updateErr } = await supabase
    .from("projects")
    .update({
      screenshot_gallery_urls: [...existingUrls, blob.url],
      updated_at: new Date().toISOString(),
    })
    .eq("id", project.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ url: blob.url });
}
