import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";

export async function PATCH(req: Request) {
  const result = await requireRole("student");
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const {
    title,
    description,
    problemStatement,
    targetUser,
    valueProposition,
    mvpDefinition,
    // Legacy field names (Phase 2)
    githubUrl,
    figmaUrl,
    demoVideoUrl,
    presentationUrl,
    // New canonical field names (Phase 9)
    liveProductUrl,
    githubRepoUrl,
    figmaOrDesignUrl,
    presentationSlideUrl,
    screenshotGalleryUrls,
    // Notification helper — list of URL keys that just went from null → set
    _newlySetUrlFields,
  } = body;

  const supabase = getServiceClient();

  // Determine if any URL field is being updated
  const urlFields: Record<string, string | null | undefined> = {};

  if (liveProductUrl !== undefined) urlFields.live_product_url = liveProductUrl;
  if (githubRepoUrl !== undefined) urlFields.github_repo_url = githubRepoUrl;
  if (figmaOrDesignUrl !== undefined) urlFields.figma_or_design_url = figmaOrDesignUrl;
  if (presentationSlideUrl !== undefined) urlFields.presentation_slide_url = presentationSlideUrl;
  // Legacy: keep syncing both column sets
  if (demoVideoUrl !== undefined) urlFields.demo_video_url = demoVideoUrl;
  if (githubUrl !== undefined) urlFields.github_url = githubUrl;
  if (figmaUrl !== undefined) urlFields.figma_url = figmaUrl;
  if (presentationUrl !== undefined) urlFields.presentation_url = presentationUrl;

  const hasUrlUpdate = Object.keys(urlFields).length > 0 || screenshotGalleryUrls !== undefined;

  const updatePayload: Record<string, unknown> = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(problemStatement !== undefined && { problem_statement: problemStatement }),
    ...(targetUser !== undefined && { target_user: targetUser }),
    ...(valueProposition !== undefined && { value_proposition: valueProposition }),
    ...(mvpDefinition !== undefined && { mvp_definition: mvpDefinition }),
    ...(screenshotGalleryUrls !== undefined && { screenshot_gallery_urls: screenshotGalleryUrls }),
    ...urlFields,
    updated_at: new Date().toISOString(),
  };

  if (hasUrlUpdate) {
    updatePayload.last_url_update_at = new Date().toISOString();
    updatePayload.last_url_update_by = user.userId;
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("student_user_id", user.userId)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire notifications for newly-set URL fields (first-time submission per URL type)
  const newlySet: string[] = Array.isArray(_newlySetUrlFields) ? _newlySetUrlFields : [];
  if (newlySet.length > 0 && project?.id) {
    // Find assigned mentors and teachers for this student's project
    try {
      const { data: enrollmentData } = await supabase
        .from("projects")
        .select(`
          enrollment_records!projects_enrollment_id_fkey(
            cohort_id,
            cohort_staff_assignments(user_id, role)
          )
        `)
        .eq("id", project.id)
        .single();

      const enrollment = enrollmentData?.enrollment_records as unknown as {
        cohort_id: string;
        cohort_staff_assignments: { user_id: string; role: string }[];
      } | null;

      const staffAssignments = enrollment?.cohort_staff_assignments ?? [];
      const staffToNotify = staffAssignments.filter(
        (a) => a.role === "mentor" || a.role === "teacher"
      );

      for (const urlType of newlySet) {
        for (const staff of staffToNotify) {
          await notify({
            user_id: staff.user_id,
            type: "student_work_submitted",
            payload: {
              project_id: project.id,
              student_user_id: user.userId,
              url_type: urlType,
            },
          });
        }
      }
    } catch (notifyErr) {
      // Notification failures never block the main response
      console.error("[project PATCH] notification error:", notifyErr);
    }
  }

  return NextResponse.json({ success: true, projectId: project?.id });
}
