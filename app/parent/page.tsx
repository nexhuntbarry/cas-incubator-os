import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Shell from "@/components/parent/Shell";
import Link from "next/link";

export default async function ParentDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "parent") redirect("/");

  const t = await getTranslations("dashboard.parent");
  const supabase = getServiceClient();

  const { data: links } = await supabase
    .from("parent_student_links")
    .select("*, users!student_user_id(display_name)")
    .eq("parent_user_id", user.userId);

  return (
    <Shell title={t("welcome", { name: user.displayName })}>
      <div className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
          <p className="text-xs text-soft-gray/40 uppercase tracking-wider">{t("yourStudents")}</p>
          {links && links.length > 0 ? (
            links.map((link) => (
              <div key={link.id} className="flex items-center justify-between">
                <span className="text-sm text-soft-gray">
                  {(link.users as { display_name: string } | null)?.display_name ?? "—"}
                </span>
                <span className="text-xs text-soft-gray/30">{t("progressPlaceholder")}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-soft-gray/50">{t("noStudents")}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-sm text-soft-gray/40 mb-3">{t("recentUpdatesPlaceholder")}</p>
          <Link
            href="/parent/updates"
            className="text-sm text-electric-blue hover:underline"
          >
            View all updates →
          </Link>
        </div>
      </div>
    </Shell>
  );
}
