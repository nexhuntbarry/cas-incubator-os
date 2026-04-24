import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import DataTable from "@/components/admin/DataTable";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";

export default async function AdminProgramsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const t = await getTranslations("admin");
  const supabase = getServiceClient();

  const { data: programs } = await supabase
    .from("programs")
    .select("id, name, description, duration_weeks, is_active, created_at")
    .order("created_at", { ascending: false });

  type ProgramRow = {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number | null;
    is_active: boolean;
    created_at: string;
    [key: string]: unknown;
  };

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
    <Shell title={t("programs.title")}>
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
        data={(programs ?? []) as ProgramRow[]}
        columns={columns}
        searchKeys={["name"]}
        emptyMessage={t("programs.empty")}
      />
    </Shell>
  );
}
