"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";

type CheckpointRow = {
  id: string;
  checkpoint_name: string;
  checkpoint_number: number;
  program_id: string | null;
  active_status: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default function CheckpointsTableClient({ rows }: { rows: CheckpointRow[] }) {
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
    <>
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
        data={rows}
        columns={columns}
        searchKeys={["checkpoint_name"]}
        emptyMessage="No checkpoint templates yet."
      />
    </>
  );
}
