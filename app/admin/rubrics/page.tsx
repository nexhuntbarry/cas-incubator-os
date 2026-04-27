import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";
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

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  const supabase = getServiceClient();
  const { data: rubrics } = await supabase
    .from("rubric_templates")
    .select("id, name, stage_number, is_active, created_at, i18n")
    .order("created_at", { ascending: false });

  type RubricWithI18n = RubricRow & { i18n?: Record<string, { name?: string }> | null };
  const localizedRows = ((rubrics ?? []) as RubricWithI18n[]).map((r) => ({
    ...r,
    name: (localizedField(r, "name", locale) ?? r.name) as string,
  }));

  return (
    <Shell title="Rubric Templates" introKey="admin.rubrics">
      <RubricsTableClient rows={localizedRows} />
    </Shell>
  );
}
