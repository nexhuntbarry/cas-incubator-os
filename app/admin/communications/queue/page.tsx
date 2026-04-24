import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import ApprovalQueueClient from "@/components/admin/ApprovalQueueClient";

export default async function CommunicationsQueuePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: updates } = await supabase
    .from("parent_updates")
    .select(
      "*, student:users!parent_updates_student_user_id_fkey(display_name, email), author:users!parent_updates_generated_by_user_id_fkey(display_name)"
    )
    .eq("sent_status", "pending_approval")
    .order("created_at", { ascending: false });

  return (
    <Shell title="Communications Queue">
      <ApprovalQueueClient initialUpdates={updates ?? []} />
    </Shell>
  );
}
