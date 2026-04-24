import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import ProjectTypesAdmin from "@/components/admin/ProjectTypesAdmin";

export default async function AdminProjectTypesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();
  const { data: types } = await supabase
    .from("project_type_definitions")
    .select("*")
    .order("name", { ascending: true });

  return (
    <Shell title="Project Types">
      <ProjectTypesAdmin initialTypes={types ?? []} />
    </Shell>
  );
}
