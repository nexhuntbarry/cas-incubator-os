"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";

type ProgramRow = {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number | null;
  is_active: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default function ProgramsTableClient({ rows }: { rows: ProgramRow[] }) {
  const t = useTranslations("admin");

  const columns = [
    { key: "name", header: t("programs.name") },
    {
      key: "duration_weeks",
      header: t("programs.duration"),
      render: (row: ProgramRow) =>
        row.duration_weeks ? `${row.duration_weeks}w` : "—",
    },
    {
      key: "is_active",
      header: t("programs.status"),
      render: (row: ProgramRow) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            row.is_active
              ? "bg-status-success/15 text-status-success"
              : "bg-white/5 text-soft-gray/40"
          }`}
        >
          {row.is_active ? t("active") : t("archived")}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (row: ProgramRow) => (
        <Link
          href={`/admin/programs/${row.id}`}
          className="text-electric-blue hover:underline text-xs"
        >
          {t("view")}
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/programs/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
        >
          <Plus size={14} />
          {t("create")}
        </Link>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        searchKeys={["name"]}
        emptyMessage={t("programs.empty")}
      />
    </>
  );
}
