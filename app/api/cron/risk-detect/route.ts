import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

// Manual trigger for auto risk detection
// Scheduled via Vercel Cron in vercel.json (Vercel sends GET; we also accept POST for manual triggers)
async function handle(req: Request) {
  // Allow super_admin trigger or internal cron secret.
  // Vercel Cron auto-injects Authorization: Bearer ${CRON_SECRET} when CRON_SECRET env is set.
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isCronCall = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCronCall) {
    const user = await getCurrentUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const supabase = getServiceClient();
  const now = new Date();
  const day14ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const day7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all active student_profiles with their projects
  const { data: students } = await supabase
    .from("student_profiles")
    .select(
      "id, user_id, users!student_profiles_user_id_fkey(id, display_name, metadata)"
    );

  const results = { checked: 0, flagged: 0, skipped: 0 };

  for (const student of students ?? []) {
    results.checked++;
    const studentUserId = student.user_id;
    const studentProfileId = student.id;

    // Get active projects
    const { data: projects } = await supabase
      .from("projects")
      .select("id, current_stage, status")
      .eq("student_user_id", studentUserId)
      .eq("status", "active");

    for (const project of projects ?? []) {
      // Check no_progress: no worksheet_submissions in last 14 days AND stage > 1
      if (project.current_stage > 1) {
        const { count: recentSubs } = await supabase
          .from("worksheet_submissions")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .gte("updated_at", day14ago);

        if ((recentSubs ?? 0) === 0) {
          await createFlagIfNotExists(supabase, {
            studentUserId,
            studentProfileId,
            projectId: project.id,
            flagType: "no_progress",
            severity: "medium",
            description:
              `Auto-detected: No worksheet submissions in the last 14 days. Student is at stage ${project.current_stage}.`,
          });
          results.flagged++;
        }
      }

      // Check stale_checkpoint: submitted but no review in > 7 days
      const { data: staleCheckpoints } = await supabase
        .from("checkpoint_submissions")
        .select("id")
        .eq("status", "submitted")
        .lte("submitted_at", day7ago);

      if (staleCheckpoints && staleCheckpoints.length > 0) {
        await createFlagIfNotExists(supabase, {
          studentUserId,
          studentProfileId,
          projectId: project.id,
          flagType: "other",
          severity: "low",
          description:
            `Auto-detected: Checkpoint submitted more than 7 days ago with no review.`,
        });
        results.flagged++;
      }
    }

    // Check low_engagement: no logins in 14+ days (via Clerk metadata)
    const userMeta = (student.users as { metadata?: Record<string, unknown> } | null)?.metadata;
    const lastActive = userMeta?.last_active_at as string | undefined;
    if (lastActive && new Date(lastActive) < new Date(day14ago)) {
      await createFlagIfNotExists(supabase, {
        studentUserId,
        studentProfileId,
        projectId: null,
        flagType: "attendance",
        severity: "medium",
        description:
          `Auto-detected: No platform login recorded in the last 14 days.`,
      });
      results.flagged++;
    }
  }

  return NextResponse.json({ ok: true, results });
}

export const GET = handle;
export const POST = handle;

async function createFlagIfNotExists(
  supabase: ReturnType<typeof getServiceClient>,
  opts: {
    studentUserId: string;
    studentProfileId: string;
    projectId: string | null;
    flagType: string;
    severity: string;
    description: string;
  }
) {
  // Check for existing open flag of same type
  const { data: existing } = await supabase
    .from("risk_flags")
    .select("id")
    .eq("student_user_id", opts.studentUserId)
    .eq("flag_type", opts.flagType)
    .eq("status", "open")
    .maybeSingle();

  if (existing) return; // Skip duplicate

  await supabase.from("risk_flags").insert({
    student_user_id: opts.studentUserId,
    student_profile_id: opts.studentProfileId,
    project_id: opts.projectId,
    flag_type: opts.flagType,
    severity: opts.severity,
    description: opts.description,
    raised_by_user_id: null, // system-generated
    status: "open",
    // legacy columns
    risk_level: opts.severity,
    reason: opts.description,
  });
}
