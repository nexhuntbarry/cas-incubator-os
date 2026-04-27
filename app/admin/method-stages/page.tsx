import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";
import Shell from "@/components/admin/Shell";
import MethodStagesAdmin from "@/components/admin/MethodStagesAdmin";

type StageRow = {
  id: string;
  stage_number: number;
  name: string;
  description: string | null;
  expected_outputs_json: string[];
  guiding_questions: string[];
  i18n?: Record<string, { name?: string; description?: string }> | null;
};

export default async function AdminMethodStagesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  const supabase = getServiceClient();
  const { data: stages } = await supabase
    .from("method_stage_definitions")
    .select("*")
    .order("stage_number", { ascending: true });

  const localizedStages = ((stages ?? []) as StageRow[]).map((s) => ({
    ...s,
    name: (localizedField(s, "name", locale) ?? s.name) as string,
    description: (localizedField(s, "description", locale) ?? s.description) as string | null,
  }));

  return (
    <Shell title="Method Stages" introKey="admin.methodStages">
      <MethodStagesAdmin initialStages={localizedStages} />
    </Shell>
  );
}
