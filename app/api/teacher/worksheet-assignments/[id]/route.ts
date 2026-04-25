import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";
import { sendWorksheetReminder } from "@/lib/email/send";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

// GET /api/teacher/worksheet-assignments/[id]
export async function GET(_req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const result = await requireAnyRole(["teacher", "super_admin"]);
  if (result instanceof NextResponse) return result;

  const supabase = getServiceClient();

  const { data: assignment, error } = await supabase
    .from("worksheet_assignments")
    .select(
      `id, template_id, cohort_id, student_user_ids, lesson_number, due_date, open_date,
       instructions_override, status, created_at, assigned_by,
       worksheet_templates(id, title, template_type, fields_schema),
       cohorts(id, name)`
    )
    .eq("id", id)
    .single();

  if (error || !assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Collect student IDs
  let studentIds: string[] = [];
  const cohortId = assignment.cohort_id as string | null;
  const specificIds = (assignment.student_user_ids as string[]) ?? [];

  if (cohortId) {
    const { data: enrollments } = await supabase
      .from("enrollment_records")
      .select("student_user_id")
      .eq("cohort_id", cohortId)
      .in("status", ["active", "completed"]);
    studentIds = (enrollments ?? []).map((e) => e.student_user_id);
  } else {
    studentIds = specificIds;
  }

  // Fetch student details + submissions for this assignment
  const [{ data: students }, { data: submissions }] = await Promise.all([
    studentIds.length > 0
      ? supabase
          .from("users")
          .select("id, display_name, email, metadata")
          .in("id", studentIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("worksheet_submissions")
      .select("id, student_user_id, status, submitted_at, feedback")
      .eq("template_id", assignment.template_id as string)
      .in("student_user_id", studentIds.length > 0 ? studentIds : ["none"]),
  ]);

  const submissionMap = new Map(
    (submissions ?? []).map((s) => [s.student_user_id, s])
  );

  const now = new Date();
  const dueDate = new Date(assignment.due_date as string);
  const isOverdue = dueDate < now;

  const studentRows = (students ?? []).map((s) => {
    const sub = submissionMap.get(s.id);
    let studentStatus = "not_started";
    if (sub) studentStatus = sub.status;
    if (!sub && isOverdue) studentStatus = "overdue";
    return {
      user_id: s.id,
      display_name: s.display_name,
      email: s.email,
      status: studentStatus,
      submission_id: sub?.id ?? null,
      submitted_at: sub?.submitted_at ?? null,
      feedback: sub?.feedback ?? null,
    };
  });

  const counts = {
    total: studentRows.length,
    not_started: studentRows.filter((s) => s.status === "not_started").length,
    in_progress: studentRows.filter((s) => s.status === "in_progress").length,
    submitted: studentRows.filter((s) => s.status === "submitted").length,
    reviewed: studentRows.filter((s) => s.status === "reviewed").length,
    approved: studentRows.filter((s) => s.status === "approved").length,
    overdue: studentRows.filter((s) => s.status === "overdue").length,
    revision_requested: studentRows.filter((s) => s.status === "revision_requested").length,
  };

  return NextResponse.json({ assignment, students: studentRows, counts });
}

// PATCH /api/teacher/worksheet-assignments/[id]
export async function PATCH(req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const result = await requireAnyRole(["teacher", "super_admin"]);
  if (result instanceof NextResponse) return result;

  const body = await req.json();
  const { due_date, status } = body;

  const supabase = getServiceClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (due_date !== undefined) updates.due_date = due_date;
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabase
    .from("worksheet_assignments")
    .update(updates)
    .eq("id", id)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/teacher/worksheet-assignments/[id]/remind is in a sub-route file
// but we expose a remind action here via action param for simplicity
