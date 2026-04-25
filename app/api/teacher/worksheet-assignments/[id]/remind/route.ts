import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";
import { sendWorksheetReminder } from "@/lib/email/send";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function formatDueIn(dueDate: Date): string {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "less than 1 hour";
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

// POST /api/teacher/worksheet-assignments/[id]/remind
export async function POST(_req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const result = await requireAnyRole(["teacher", "super_admin"]);
  if (result instanceof NextResponse) return result;

  const supabase = getServiceClient();

  const { data: assignment, error } = await supabase
    .from("worksheet_assignments")
    .select("id, template_id, cohort_id, student_user_ids, due_date, status, worksheet_templates(id, title)")
    .eq("id", id)
    .single();

  if (error || !assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }
  if (assignment.status !== "open") {
    return NextResponse.json({ error: "Assignment is not open" }, { status: 400 });
  }

  const templateRaw = assignment.worksheet_templates;
  const template = (Array.isArray(templateRaw) ? templateRaw[0] : templateRaw) as { id: string; title: string } | null;
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
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

  if (studentIds.length === 0) {
    return NextResponse.json({ reminded: 0 });
  }

  // Find who hasn't submitted yet
  const { data: submissions } = await supabase
    .from("worksheet_submissions")
    .select("student_user_id, status")
    .eq("template_id", assignment.template_id as string)
    .in("student_user_id", studentIds)
    .in("status", ["submitted", "reviewed", "approved"]);

  const submittedIds = new Set((submissions ?? []).map((s) => s.student_user_id));
  const pendingIds = studentIds.filter((id) => !submittedIds.has(id));

  if (pendingIds.length === 0) {
    return NextResponse.json({ reminded: 0 });
  }

  const { data: students } = await supabase
    .from("users")
    .select("id, display_name, email")
    .in("id", pendingIds);

  const dueDate = new Date(assignment.due_date as string);
  const dueDateFormatted = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dueIn = formatDueIn(dueDate);

  for (const student of students ?? []) {
    notify({
      user_id: student.id,
      type: "worksheet_reminder",
      payload: {
        assignment_id: id,
        worksheet_title: template.title,
        due_date: assignment.due_date,
      },
    }).catch((err) => console.error("[remind] notify error:", err));

    sendWorksheetReminder(student.email, {
      studentName: student.display_name,
      worksheetTitle: template.title,
      dueDate: dueDateFormatted,
      dueIn,
      assignmentId: id,
      templateId: template.id,
    }).catch((err) => console.error("[remind] email error:", err));
  }

  return NextResponse.json({ reminded: students?.length ?? 0 });
}
