import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import UsersTable from "./UsersTable";
import { getTranslations } from "next-intl/server";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const t = await getTranslations("admin");
  const supabase = getServiceClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <Shell title={t("users.title")} introKey="admin.users">
      <UsersTable users={users ?? []} />
    </Shell>
  );
}
