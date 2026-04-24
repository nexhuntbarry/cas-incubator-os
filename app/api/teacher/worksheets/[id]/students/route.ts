import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

/**
 * GET /api/teacher/worksheets/[id]/students
 *
 * Returns students who have reached the stage linked to this worksheet template,
 * along with their submission status for this worksheet.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const { id: templateId } = await params;
  const supabase = getServiceClient();

  // Get template to find linked stage
  const { data: template, error: tErr } = await supabase
    .from("worksheet_templates")
    .select("id, title, linked_method_stage_id, linked_lesson_number, method_stage_definitions(stage_number, name)")
    .eq("id", templateId)
    .single();

  if (tErr || !template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Get teacher's cohort student IDs
  let studentUserIds: string[] | null = null;

  if (user.role !== "super_admin") {
    const { data: assignments } = await supabase
      .from("cohort_staff_assignments")
      .select("cohort_id")
      .eq("user_id", user.userId);

    const cohortIds = assignments?.map((a) => a.cohort_id) ?? [];
    if (cohortIds.length === 0) {
      return NextResponse.json({ template, students: [] });
    }

    const { data: enrollments } = await supabase
      .from("enrollment_records")
      .select("student_user_id, cohort_id, cohorts(name, id)")
      .in("cohort_id", cohortIds)
      .in("status", ["active", "completed"]);

    studentUserIds = enrollments?.map((e) => e.student_user_id) ?? [];

    if (studentUserIds.length === 0) {
      return NextResponse.json({ template, students: [] });
    }
  }

  // Get submissions for this template from relevant students
  let subQuery = supabase
    .from("worksheet_submissions")
    .select("id, student_user_id, status, submitted_at, version_number, feedback, reviewed_at")
    .eq("template_id", templateId);

  if (studentUserIds !== null) {
    subQuery = subQuery.in("student_user_id", studentUserIds);
  }

  const { data: submissions } = await subQuery;

  const submissionByStudent = new Map(
    (submissions ?? []).map((s) => [s.student_user_id, s])
  );

  // Get student user info + cohort info for all relevant students
  const allStudentIds = studentUserIds ?? Array.from(submissionByStudent.keys());

  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, email")
    .in("id", allStudentIds);

  // Get enrollment records for cohort info
  let enrollQuery = supabase
    .from("enrollment_records")
    .select("student_user_id, cohort_id, cohorts(id, name)")
    .in("status", ["active", "completed"]);

  if (studentUserIds !== null) {
    enrollQuery = enrollQuery.in("student_user_id", studentUserIds);
  }

  const { data: enrollments } = await enrollQuery;

  const cohortByStudent = new Map<string, { id: string; name: string }>();
  for (const e of enrollments ?? []) {
    const cohort = Array.isArray(e.cohorts)
      ? (e.cohorts[0] as { id: string; name: string } | undefined)
      : (e.cohorts as { id: string; name: string } | null);
    if (cohort) cohortByStudent.set(e.student_user_id, cohort);
  }

  // Get stage progress for students if there is a linked stage
  const stageDef = Array.isArray(template.method_stage_definitions)
    ? template.method_stage_definitions[0]
    : template.method_stage_definitions;
  const stageNumber = stageDef?.stage_number ?? null;

  const stageProgressByStudent = new Map<string, string>();
  if (stageNumber && allStudentIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("student_method_progress")
      .select("student_user_id, status")
      .eq("stage_number", stageNumber)
      .in("student_user_id", allStudentIds);

    for (const p of progressRows ?? []) {
      stageProgressByStudent.set(p.student_user_id, p.status);
    }
  }

  const students = (users ?? []).map((u) => {
    const submission = submissionByStudent.get(u.id);
    const cohort = cohortByStudent.get(u.id);
    const stageStatus = stageProgressByStudent.get(u.id) ?? null;

    return {
      user_id: u.id,
      display_name: u.display_name,
      email: u.email,
      cohort,
      stage_status: stageStatus,
      submission: submission
        ? {
            id: submission.id,
            status: submission.status,
            submitted_at: submission.submitted_at,
            version_number: submission.version_number,
            feedback: submission.feedback,
            reviewed_at: submission.reviewed_at,
          }
        : null,
    };
  });

  // Sort: submitted first, then in_progress, then not_started
  const statusOrder: Record<string, number> = {
    submitted: 0,
    revision_requested: 1,
    reviewed: 2,
    approved: 3,
    in_progress: 4,
    not_started: 5,
  };

  students.sort((a, b) => {
    const aOrder = statusOrder[a.submission?.status ?? "not_started"] ?? 99;
    const bOrder = statusOrder[b.submission?.status ?? "not_started"] ?? 99;
    return aOrder - bOrder;
  });

  return NextResponse.json({ template, students, stage_number: stageNumber });
}
