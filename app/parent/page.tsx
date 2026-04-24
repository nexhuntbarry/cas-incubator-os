import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";

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
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-2xl font-bold">
          {t("welcome", { name: user.displayName })}
        </h1>

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
          <p className="text-sm text-soft-gray/40">{t("recentUpdatesPlaceholder")}</p>
        </div>
      </main>
    </div>
  );
}
