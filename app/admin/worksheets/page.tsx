import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import WorksheetsTableClient from "./WorksheetsTableClient";

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

  return (
    <Shell title="Worksheet Templates" introKey="admin.worksheets">
      <WorksheetsTableClient rows={(worksheets ?? []) as WorksheetRow[]} />
    </Shell>
  );
}
