import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";
import { sendParentUpdate } from "@/lib/email/send";
import { renderParentUpdateHtml, renderParentUpdateText } from "@/lib/email/templates/parent-update";

// POST — create or save draft parent update
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "teacher", "mentor"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { student_user_id, update_type, subject, body: emailBody, action } = body;

  if (!student_user_id || !update_type || !subject || !emailBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Get student profile
  const { data: student } = await supabase
    .from("users")
    .select("id, display_name, email")
    .eq("id", student_user_id)
    .single();

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Determine sent_status based on action and role
  let sentStatus = "draft";
  if (action === "submit") {
    sentStatus = user.role === "super_admin" ? "sent" : "pending_approval";
  }

  const { data: update, error } = await supabase
    .from("parent_updates")
    .insert({
      student_user_id,
      generated_by_user_id: user.userId,
      update_type,
      subject,
      body: emailBody,
      sent_status: sentStatus,
      // legacy required columns — use student as fallback
      project_id: body.project_id ?? null,
      parent_user_id: body.parent_user_id ?? null,
      sent_by: user.userId,
      channel: "email",
    })
    .select()
    .single();

  if (error || !update) {
    console.error("[parent-updates] insert error:", error);
    return NextResponse.json({ error: "Failed to save update" }, { status: 500 });
  }

  // If pending_approval — notify super admins
  if (sentStatus === "pending_approval") {
    const { data: admins } = await supabase
      .from("users")
      .select("id")
      .eq("role", "super_admin");

    for (const admin of admins ?? []) {
      await notify({
        user_id: admin.id,
        type: "parent_update_pending",
        payload: { update_id: update.id, student_name: student.display_name, subject },
      });
    }
  }

  // If super_admin submits directly — send email immediately
  if (sentStatus === "sent" && body.parent_email) {
    const emailResult = await sendParentUpdate(body.parent_email, {
      parentName: body.parent_name ?? "Parent/Guardian",
      studentName: student.display_name,
      updateType: update_type,
      subject,
      body: emailBody,
    });
    if (!emailResult.success) {
      // Mark as failed but don't block
      await supabase
        .from("parent_updates")
        .update({ sent_status: "failed" })
        .eq("id", update.id);
    }
  }

  return NextResponse.json({ update });
}
