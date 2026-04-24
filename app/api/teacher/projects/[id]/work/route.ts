import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole("teacher");
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      live_product_url,
      demo_video_url,
      presentation_slide_url,
      github_repo_url,
      figma_or_design_url,
      screenshot_gallery_urls,
      github_url,
      figma_url,
      presentation_url,
      last_url_update_at,
      last_url_update_by,
      users!projects_last_url_update_by_fkey(display_name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatedByUser = data.users as unknown as { display_name: string } | null;

  return NextResponse.json({
    projectId: id,
    links: {
      live_product_url: data.live_product_url,
      demo_video_url: data.demo_video_url,
      presentation_slide_url: data.presentation_slide_url,
      github_repo_url: data.github_repo_url,
      figma_or_design_url: data.figma_or_design_url,
      screenshot_gallery_urls: data.screenshot_gallery_urls,
      // Legacy fallbacks
      github_url: data.github_url,
      figma_url: data.figma_url,
      presentation_url: data.presentation_url,
    },
    lastUpdatedAt: data.last_url_update_at,
    lastUpdatedBy: updatedByUser?.display_name ?? null,
  });
}
