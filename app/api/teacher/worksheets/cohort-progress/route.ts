import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

/**
 * GET /api/teacher/worksheets/cohort-progress
 *
 * Returns worksheet templates with submission counts per teacher's cohorts.
 * For super_admin, returns counts across all cohorts.
 */
export async function GET() {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const supabase = getServiceClient();

  // Get cohort student user IDs for this teacher
  let studentUserIds: string[] | null = null;

  if (user.role !== "super_admin") {
    const { data: assignments } = await supabase
      .from("cohort_staff_assignments")
      .select("cohort_id")
      .eq("user_id", user.userId);

    const cohortIds = assignments?.map((a) => a.cohort_id) ?? [];

    if (cohortIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: enrollments } = await supabase
      .from("enrollment_records")
      .select("student_user_id")
      .in("cohort_id", cohortIds)
      .in("status", ["active", "completed"]);

    studentUserIds = enrollments?.map((e) => e.student_user_id) ?? [];

    if (studentUserIds.length === 0) {
      return NextResponse.json([]);
    }
  }

  // Get all active worksheet templates with stage info
  const { data: templates, error: tErr } = await supabase
    .from("worksheet_templates")
    .select("id, title, template_type, linked_lesson_number, linked_method_stage_id, required_status, method_stage_definitions(stage_number, name)")
    .eq("is_active", true)
    .order("linked_lesson_number", { ascending: true });

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  if (!templates || templates.length === 0) return NextResponse.json([]);

  const templateIds = templates.map((t) => t.id);

  // Get submission counts per template per status
  let subQuery = supabase
    .from("worksheet_submissions")
    .select("template_id, status, student_user_id")
    .in("template_id", templateIds);

  if (studentUserIds !== null) {
    subQuery = subQuery.in("student_user_id", studentUserIds);
  }

  const { data: submissions, error: sErr } = await subQuery;
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // Build counts per template
  const countsByTemplate = new Map<
    string,
    { submitted: number; approved: number; reviewed: number; revision_requested: number; total: number }
  >();

  for (const sub of submissions ?? []) {
    if (!countsByTemplate.has(sub.template_id)) {
      countsByTemplate.set(sub.template_id, {
        submitted: 0,
        approved: 0,
        reviewed: 0,
        revision_requested: 0,
        total: 0,
      });
    }
    const c = countsByTemplate.get(sub.template_id)!;
    c.total++;
    if (sub.status === "submitted") c.submitted++;
    if (sub.status === "approved") c.approved++;
    if (sub.status === "reviewed") c.reviewed++;
    if (sub.status === "revision_requested") c.revision_requested++;
  }

  const totalStudents = studentUserIds?.length ?? null;

  const result2 = templates.map((t) => {
    const counts = countsByTemplate.get(t.id) ?? {
      submitted: 0,
      approved: 0,
      reviewed: 0,
      revision_requested: 0,
      total: 0,
    };
    const stageDef = Array.isArray(t.method_stage_definitions)
      ? t.method_stage_definitions[0]
      : t.method_stage_definitions;

    return {
      id: t.id,
      title: t.title,
      template_type: t.template_type,
      linked_lesson_number: t.linked_lesson_number,
      linked_method_stage_id: t.linked_method_stage_id,
      required_status: t.required_status,
      stage_number: stageDef?.stage_number ?? null,
      stage_name: stageDef?.name ?? null,
      counts,
      total_students: totalStudents,
    };
  });

  return NextResponse.json(result2);
}
