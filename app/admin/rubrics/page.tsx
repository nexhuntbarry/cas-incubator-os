import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import RubricsTableClient from "./RubricsTableClient";

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

  return (
    <Shell title="Rubric Templates">
      <RubricsTableClient rows={(rubrics ?? []) as RubricRow[]} />
    </Shell>
  );
}
