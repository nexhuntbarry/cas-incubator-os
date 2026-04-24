import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import DataTable from "@/components/admin/DataTable";
import { Plus } from "lucide-react";

type RubricRow = {
  id: string;
  name: string;
  stage_number: number | null;
  is_active: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default async function AdminRubricsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "super_admin" && user.role !== "teacher")) redirect("/");

  const supabase = getServiceClient();
  const { data: rubrics } = await supabase
    .from("rubric_templates")
    .select("id, name, stage_number, is_active, created_at")
    .order("created_at", { ascending: false });

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
    <Shell title="Rubric Templates">
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
        data={(rubrics ?? []) as RubricRow[]}
        columns={columns}
        searchKeys={["name"]}
        emptyMessage="No rubric templates yet."
      />
    </Shell>
  );
}
