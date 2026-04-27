import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";
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

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  const supabase = getServiceClient();
  const { data: worksheets } = await supabase
    .from("worksheet_templates")
    .select("id, title, description, template_type, scoring_type, is_active, created_at, i18n")
    .order("created_at", { ascending: false });

  type WorksheetWithI18n = WorksheetRow & { i18n?: Record<string, { title?: string; description?: string }> | null };
  const localizedRows = ((worksheets ?? []) as WorksheetWithI18n[]).map((w) => ({
    ...w,
    title: (localizedField(w, "title", locale) ?? w.title) as string,
    description: (localizedField(w, "description", locale) ?? w.description) as string | null,
  }));

  return (
    <Shell title="Worksheet Templates" introKey="admin.worksheets">
      <WorksheetsTableClient rows={localizedRows} />
    </Shell>
  );
}
