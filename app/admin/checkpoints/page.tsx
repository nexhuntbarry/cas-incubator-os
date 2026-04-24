import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import DataTable from "@/components/admin/DataTable";
import { Plus } from "lucide-react";

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

  const columns = [
    {
      key: "checkpoint_number",
      header: "#",
      render: (row: CheckpointRow) => (
        <span className="font-mono text-soft-gray/60">#{row.checkpoint_number}</span>
      ),
    },
    { key: "checkpoint_name", header: "Name" },
    {
      key: "active_status",
      header: "Status",
      render: (row: CheckpointRow) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            row.active_status
              ? "bg-status-success/15 text-status-success"
              : "bg-white/5 text-soft-gray/40"
          }`}
        >
          {row.active_status ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (row: CheckpointRow) => (
        <Link
          href={`/admin/checkpoints/${row.id}`}
          className="text-electric-blue hover:underline text-xs"
        >
          Edit
        </Link>
      ),
    },
  ];

  return (
    <Shell title="Checkpoint Templates">
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/checkpoints/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
        >
          <Plus size={14} />
          New Checkpoint
        </Link>
      </div>
      <DataTable
        data={(checkpoints ?? []) as CheckpointRow[]}
        columns={columns}
        searchKeys={["checkpoint_name"]}
        emptyMessage="No checkpoint templates yet."
      />
    </Shell>
  );
}
