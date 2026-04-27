import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";
import Shell from "@/components/admin/Shell";
import CheckpointsTableClient from "./CheckpointsTableClient";

type CheckpointRow = {
  id: string;
  checkpoint_name: string;
  checkpoint_number: number;
  program_id: string | null;
  active_status: boolean;
  created_at: string;
  [key: string]: unknown;
};

export default async function AdminCheckpointsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "super_admin" && user.role !== "teacher")) redirect("/");

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  const supabase = getServiceClient();
  const { data: checkpoints } = await supabase
    .from("checkpoint_templates")
    .select("id, checkpoint_name, checkpoint_number, program_id, active_status, created_at, i18n")
    .order("checkpoint_number", { ascending: true });

  type CheckpointWithI18n = CheckpointRow & { i18n?: Record<string, { checkpoint_name?: string }> | null };
  const localizedRows = ((checkpoints ?? []) as CheckpointWithI18n[]).map((c) => ({
    ...c,
    checkpoint_name: (localizedField(c, "checkpoint_name", locale) ?? c.checkpoint_name) as string,
  }));

  return (
    <Shell title="Checkpoint Templates" introKey="admin.checkpoints">
      <CheckpointsTableClient rows={localizedRows} />
    </Shell>
  );
}
