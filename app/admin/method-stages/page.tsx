import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import MethodStagesAdmin from "@/components/admin/MethodStagesAdmin";

export default async function AdminMethodStagesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();
  const { data: stages } = await supabase
    .from("method_stage_definitions")
    .select("*")
    .order("stage_number", { ascending: true });

  return (
    <Shell title="Method Stages">
      <MethodStagesAdmin initialStages={stages ?? []} />
    </Shell>
  );
}
