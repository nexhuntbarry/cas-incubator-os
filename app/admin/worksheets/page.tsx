import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import DataTable from "@/components/admin/DataTable";
import { Plus } from "lucide-react";

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

export default async function AdminWorksheetsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "super_admin" && user.role !== "teacher")) redirect("/");

  const supabase = getServiceClient();
  const { data: worksheets } = await supabase
    .from("worksheet_templates")
    .select("id, title, description, template_type, scoring_type, is_active, created_at")
    .order("created_at", { ascending: false });

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
    <Shell title="Worksheet Templates">
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
        data={(worksheets ?? []) as WorksheetRow[]}
        columns={columns}
        searchKeys={["title"]}
        emptyMessage="No worksheet templates yet."
      />
    </Shell>
  );
}
