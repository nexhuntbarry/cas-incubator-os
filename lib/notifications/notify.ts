import { getServiceClient } from "@/lib/supabase";
import { sendGenericEmail } from "@/lib/email/send";

export type NotificationType =
  | "parent_update_pending"
  | "parent_update_sent"
  | "parent_update_approved"
  | "parent_update_rejected"
  | "risk_flag_assigned"
  | "risk_flag_created"
  | "risk_flag_resolved"
  | "checkpoint_submitted"
  | "checkpoint_reviewed"
  | "showcase_published"
  | "student_work_submitted"
  | "worksheet_assigned"
  | "worksheet_submitted"
  | "worksheet_reminder";

export interface NotifyOptions {
  user_id: string;
  type: NotificationType;
  payload?: Record<string, unknown>;
  sendEmail?: boolean;
  emailOpts?: {
    to: string;
    subject: string;
    html: string;
    text: string;
  };
}

export async function notify(opts: NotifyOptions): Promise<void> {
  try {
    const supabase = getServiceClient();

    await supabase.from("notifications").insert({
      user_id: opts.user_id,
      type: opts.type,
      payload: opts.payload ?? {},
    });

    if (opts.sendEmail && opts.emailOpts) {
      // Non-blocking email — don't await the result chain inside notify
      sendGenericEmail(opts.emailOpts).catch((err) => {
        console.error("[notify] email send failed:", err);
      });
    }
  } catch (err) {
    // Notification failures should never block the main flow
    console.error("[notify] failed to create notification:", err);
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = getServiceClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

export async function markAllRead(userId: string): Promise<void> {
  const supabase = getServiceClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}
