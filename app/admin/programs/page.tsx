import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Shell from "@/components/admin/Shell";
import ProgramsTableClient from "./ProgramsTableClient";

type ProgramRow = {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number | null;
  is_active: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default async function AdminProgramsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const t = await getTranslations("admin");
  const supabase = getServiceClient();

  const { data: programs } = await supabase
    .from("programs")
    .select("id, name, description, duration_weeks, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <Shell title={t("programs.title")}>
      <ProgramsTableClient rows={(programs ?? []) as ProgramRow[]} />
    </Shell>
  );
}
