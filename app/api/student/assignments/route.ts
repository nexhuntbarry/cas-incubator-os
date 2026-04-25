import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

// GET /api/student/assignments — student's active assignments
export async function GET(_req: Request) {
  const result = await requireAnyRole(["student"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const supabase = getServiceClient();

  // Find student's cohort
  const { data: enrollment } = await supabase
    .from("enrollment_records")
    .select("cohort_id")
    .eq("student_user_id", user.userId)
    .eq("status", "active")
    .single();

  const cohortId = enrollment?.cohort_id ?? null;

  // Get open assignments for this student (cohort-based OR individually targeted)
  // Supabase doesn't support OR across two columns easily, so we fetch both and merge
  const [cohortAssignments, specificAssignments] = await Promise.all([
    cohortId
      ? supabase
          .from("worksheet_assignments")
          .select(
            `id, template_id, cohort_id, student_user_ids, lesson_number, due_date, open_date,
             instructions_override, status, created_at, assigned_by,
             worksheet_templates(id, title, description, template_type, linked_lesson_number),
             users!worksheet_assignments_assigned_by_fkey(display_name)`
          )
          .eq("cohort_id", cohortId)
          .eq("status", "open")
          .order("due_date", { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase
      .from("worksheet_assignments")
      .select(
        `id, template_id, cohort_id, student_user_ids, lesson_number, due_date, open_date,
         instructions_override, status, created_at, assigned_by,
         worksheet_templates(id, title, description, template_type, linked_lesson_number),
         users!worksheet_assignments_assigned_by_fkey(display_name)`
      )
      .is("cohort_id", null)
      .eq("status", "open")
      .contains("student_user_ids", JSON.stringify([user.userId]))
      .order("due_date", { ascending: true }),
  ]);

  // Merge and deduplicate
  const allAssignments = [
    ...((cohortAssignments as { data: unknown[] }).data ?? []),
    ...((specificAssignments as { data: unknown[] }).data ?? []),
  ];
  const seen = new Set<string>();
  const assignments = allAssignments.filter((a) => {
    const row = a as { id: string };
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });

  // Sort by due_date
  assignments.sort((a, b) => {
    const da = (a as { due_date: string }).due_date;
    const db = (b as { due_date: string }).due_date;
    return da.localeCompare(db);
  });

  // Get this student's submissions for these template_ids
  const templateIds = assignments.map((a) => (a as { template_id: string }).template_id);
  let submissionMap = new Map<string, { status: string; submitted_at: string | null }>();

  if (templateIds.length > 0) {
    const { data: submissions } = await supabase
      .from("worksheet_submissions")
      .select("template_id, status, submitted_at")
      .eq("student_user_id", user.userId)
      .in("template_id", templateIds);

    submissionMap = new Map(
      (submissions ?? []).map((s) => [s.template_id, { status: s.status, submitted_at: s.submitted_at }])
    );
  }

  // Attach submission info and filter out already-submitted
  const pending = assignments
    .map((a) => {
      const row = a as Record<string, unknown>;
      const sub = submissionMap.get(row.template_id as string);
      return { ...row, submission: sub ?? null };
    })
    .filter((a) => {
      const sub = a.submission as { status: string } | null;
      if (!sub) return true;
      return !["submitted", "reviewed", "approved"].includes(sub.status);
    });

  return NextResponse.json(pending);
}
