import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import CreateClassCodeForm from "./CreateClassCodeForm";
import { getTranslations } from "next-intl/server";

export default async function ClassCodesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const t = await getTranslations("admin");
  const supabase = getServiceClient();

  const [{ data: codes }, { data: cohorts }] = await Promise.all([
    supabase
      .from("class_codes")
      .select("*, cohorts(name)")
      .order("created_at", { ascending: false }),
    supabase.from("cohorts").select("id, name").eq("is_active", true),
  ]);

  return (
    <Shell title={t("classCodes.title")} introKey="admin.classCodes">
      <div className="space-y-6">
        <CreateClassCodeForm cohorts={cohorts ?? []} />

        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                  {t("classCodes.code")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                  {t("cohorts.title")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                  {t("classCodes.uses")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                  {t("classCodes.expires")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {(codes ?? []).map((cc) => (
                <tr
                  key={cc.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="font-mono text-vivid-teal">{cc.code}</code>
                  </td>
                  <td className="px-4 py-3 text-soft-gray/70">
                    {(cc.cohorts as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-soft-gray/60">
                    {cc.use_count}/{cc.max_uses ?? "∞"}
                  </td>
                  <td className="px-4 py-3 text-soft-gray/60">
                    {cc.expires_at
                      ? new Date(cc.expires_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        cc.is_active
                          ? "bg-status-success/15 text-status-success"
                          : "bg-white/5 text-soft-gray/40"
                      }`}
                    >
                      {cc.is_active ? t("active") : t("paused")}
                    </span>
                  </td>
                </tr>
              ))}
              {(codes ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-soft-gray/30"
                  >
                    {t("classCodes.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
