"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";

type WorksheetRow = {
  id: string;
  title: string;
  description: string | null;
  template_type: string;
  scoring_type: string;
  is_active: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default function WorksheetsTableClient({ rows }: { rows: WorksheetRow[] }) {
  const columns = [
    { key: "title", header: "Title" },
    { key: "template_type", header: "Type" },
    { key: "scoring_type", header: "Scoring" },
    {
      key: "is_active",
      header: "Status",
      render: (row: WorksheetRow) => (
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
      render: (row: WorksheetRow) => (
        <Link
          href={`/admin/worksheets/${row.id}`}
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
          href="/admin/worksheets/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
        >
          <Plus size={14} />
          New Worksheet
        </Link>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        searchKeys={["title"]}
        emptyMessage="No worksheet templates yet."
      />
    </>
  );
}
