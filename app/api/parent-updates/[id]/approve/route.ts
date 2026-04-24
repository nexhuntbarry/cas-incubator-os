import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";
import { sendParentUpdate } from "@/lib/email/send";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body; // "approve" | "reject"

  const supabase = getServiceClient();

  const { data: update } = await supabase
    .from("parent_updates")
    .select("*, users!parent_updates_student_user_id_fkey(display_name, email)")
    .eq("id", id)
    .single();

  if (!update) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "reject") {
    await supabase
      .from("parent_updates")
      .update({ sent_status: "rejected", approved_by_user_id: user.userId })
      .eq("id", id);

    // Notify the original author
    if (update.generated_by_user_id) {
      await notify({
        user_id: update.generated_by_user_id,
        type: "parent_update_rejected",
        payload: { update_id: id, subject: update.subject },
      });
    }

    return NextResponse.json({ ok: true, status: "rejected" });
  }

  // Approve — send the email
  // Get linked parents
  const { data: links } = await supabase
    .from("parent_student_links")
    .select("parent_user_id, users!parent_student_links_parent_user_id_fkey(email, display_name)")
    .eq("student_user_id", update.student_user_id);

  let emailSent = false;
  for (const link of links ?? []) {
    const parent = link.users as unknown as { email: string; display_name: string } | null;
    if (!parent?.email) continue;

    const result = await sendParentUpdate(parent.email, {
      parentName: parent.display_name,
      studentName:
        (update.users as { display_name: string } | null)?.display_name ?? "your student",
      updateType: update.update_type ?? "general",
      subject: update.subject,
      body: update.body,
    });

    if (result.success) emailSent = true;
  }

  await supabase
    .from("parent_updates")
    .update({
      sent_status: emailSent ? "sent" : "approved_not_sent",
      approved_by_user_id: user.userId,
      sent_at_ts: new Date().toISOString(),
    })
    .eq("id", id);

  if (update.generated_by_user_id) {
    await notify({
      user_id: update.generated_by_user_id,
      type: "parent_update_sent",
      payload: { update_id: id, subject: update.subject },
    });
  }

  return NextResponse.json({ ok: true, status: "sent" });
}
