import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Shell from "@/components/admin/Shell";
import { getTranslations } from "next-intl/server";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const t = await getTranslations("admin");

  return (
    <Shell title={t("settings.title")} introKey="admin.settings">
      <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-soft-gray/50 text-sm">
        {t("settings.placeholder")}
      </div>
    </Shell>
  );
}
