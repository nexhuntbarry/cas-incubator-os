import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";
import { sendWorksheetAssigned } from "@/lib/email/send";

// POST /api/teacher/worksheet-assignments — create assignment, fire notifications
export async function POST(req: Request) {
  const result = await requireAnyRole(["teacher", "super_admin"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const {
    template_id,
    cohort_id,
    student_user_ids,
    lesson_number,
    due_date,
    open_date,
    instructions_override,
  } = body;

  if (!template_id || !due_date) {
    return NextResponse.json({ error: "template_id and due_date are required" }, { status: 400 });
  }
  if (!cohort_id && (!student_user_ids || student_user_ids.length === 0)) {
    return NextResponse.json(
      { error: "Either cohort_id or student_user_ids must be provided" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // Fetch template for notifications
  const { data: template } = await supabase
    .from("worksheet_templates")
    .select("id, title")
    .eq("id", template_id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Create assignment
  const { data: assignment, error } = await supabase
    .from("worksheet_assignments")
    .insert({
      template_id,
      cohort_id: cohort_id ?? null,
      student_user_ids: student_user_ids ?? [],
      lesson_number: lesson_number ?? null,
      assigned_by: user.userId,
      due_date,
      open_date: open_date ?? new Date().toISOString(),
      instructions_override: instructions_override ?? null,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Collect student IDs to notify
  let targetStudentIds: string[] = [];
  let targetStudents: { id: string; display_name: string; email: string }[] = [];

  if (cohort_id) {
    const { data: enrollments } = await supabase
      .from("enrollment_records")
      .select("student_user_id")
      .eq("cohort_id", cohort_id)
      .in("status", ["active", "completed"]);
    targetStudentIds = (enrollments ?? []).map((e) => e.student_user_id);
  } else if (student_user_ids?.length > 0) {
    targetStudentIds = student_user_ids;
  }

  if (targetStudentIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, display_name, email")
      .in("id", targetStudentIds);
    targetStudents = users ?? [];
  }

  const dueDateFormatted = new Date(due_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fire notifications + emails (non-blocking)
  for (const student of targetStudents) {
    notify({
      user_id: student.id,
      type: "worksheet_assigned",
      payload: {
        assignment_id: assignment.id,
        worksheet_title: template.title,
        due_date,
      },
    }).catch((err) => console.error("[assignments] notify error:", err));

    sendWorksheetAssigned(student.email, {
      studentName: student.display_name,
      teacherName: user.displayName,
      worksheetTitle: template.title,
      dueDate: dueDateFormatted,
      assignmentId: assignment.id,
      templateId: template.id,
      instructionsOverride: instructions_override ?? null,
    }).catch((err) => console.error("[assignments] email error:", err));
  }

  return NextResponse.json({ id: assignment.id }, { status: 201 });
}

// GET /api/teacher/worksheet-assignments — list teacher's assignments
export async function GET(req: Request) {
  const result = await requireAnyRole(["teacher", "super_admin"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "open";

  const supabase = getServiceClient();

  let query = supabase
    .from("worksheet_assignments")
    .select(
      `id, template_id, cohort_id, student_user_ids, lesson_number, due_date, open_date,
       instructions_override, status, created_at,
       worksheet_templates(id, title, template_type),
       cohorts(id, name)`
    )
    .order("due_date", { ascending: true });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  // Non-super_admin: scope to teacher's assignments
  if (user.role !== "super_admin") {
    query = query.eq("assigned_by", user.userId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
