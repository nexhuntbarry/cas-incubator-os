import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";
import { sendWorksheetReminder } from "@/lib/email/send";

function formatDueIn(dueDate: Date): string {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "less than 1 hour";
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServiceClient();
  const now = new Date();

  // Find assignments due within the next 24 hours that are still open
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const { data: assignments } = await supabase
    .from("worksheet_assignments")
    .select(
      `id, template_id, cohort_id, student_user_ids, due_date,
       worksheet_templates(id, title)`
    )
    .eq("status", "open")
    .gte("due_date", now.toISOString())
    .lte("due_date", in24h);

  const results = { checked: 0, reminded: 0 };

  for (const assignment of assignments ?? []) {
    results.checked++;
    const templateRaw = assignment.worksheet_templates;
    const template = (Array.isArray(templateRaw) ? templateRaw[0] : templateRaw) as { id: string; title: string } | null;
    if (!template) continue;

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

    if (studentIds.length === 0) continue;

    // Find who hasn't submitted yet
    const { data: submissions } = await supabase
      .from("worksheet_submissions")
      .select("student_user_id")
      .eq("template_id", assignment.template_id as string)
      .in("student_user_id", studentIds)
      .in("status", ["submitted", "reviewed", "approved"]);

    const submittedIds = new Set((submissions ?? []).map((s) => s.student_user_id));
    const pendingIds = studentIds.filter((id) => !submittedIds.has(id));

    if (pendingIds.length === 0) continue;

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
          assignment_id: assignment.id,
          worksheet_title: template.title,
          due_date: assignment.due_date,
        },
      }).catch((err) => console.error("[cron:reminders] notify error:", err));

      sendWorksheetReminder(student.email, {
        studentName: student.display_name,
        worksheetTitle: template.title,
        dueDate: dueDateFormatted,
        dueIn,
        assignmentId: assignment.id,
        templateId: template.id,
      }).catch((err) => console.error("[cron:reminders] email error:", err));

      results.reminded++;
    }
  }

  return NextResponse.json(results);
}
