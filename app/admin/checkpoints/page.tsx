import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import CheckpointsTableClient from "./CheckpointsTableClient";

type CheckpointRow = {
  id: string;
  checkpoint_name: string;
  checkpoint_number: number;
  program_id: string | null;
  active_status: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default async function AdminCheckpointsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "super_admin" && user.role !== "teacher")) redirect("/");

  const supabase = getServiceClient();
  const { data: checkpoints } = await supabase
    .from("checkpoint_templates")
    .select("id, checkpoint_name, checkpoint_number, program_id, active_status, created_at")
    .order("checkpoint_number", { ascending: true });

  return (
    <Shell title="Checkpoint Templates">
      <CheckpointsTableClient rows={(checkpoints ?? []) as CheckpointRow[]} />
    </Shell>
  );
}
