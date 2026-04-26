"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";

type RubricRow = {
  id: string;
  name: string;
  stage_number: number | null;
  is_active: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default function RubricsTableClient({ rows }: { rows: RubricRow[] }) {
  const columns = [
    { key: "name", header: "Name" },
    {
      key: "stage_number",
      header: "Stage",
      render: (row: RubricRow) => (row.stage_number ? `Stage ${row.stage_number}` : "—"),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: RubricRow) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            row.is_active
              ? "bg-status-success/15 text-status-success"
              : "bg-white/5 text-soft-gray/40"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (row: RubricRow) => (
        <Link
          href={`/admin/rubrics/${row.id}`}
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
          href="/admin/rubrics/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
        >
          <Plus size={14} />
          New Rubric
        </Link>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        searchKeys={["name"]}
        emptyMessage="No rubric templates yet."
      />
    </>
  );
}
