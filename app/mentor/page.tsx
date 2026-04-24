import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import OnboardingTour from "@/components/shared/OnboardingTour";

export default async function MentorDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "mentor" && user.role !== "super_admin") redirect("/");

  const t = await getTranslations("dashboard.mentor");
  const supabase = getServiceClient();

  const [{ data: notes }, { data: userRow }] = await Promise.all([
    supabase
      .from("mentor_notes")
      .select("id, content, session_date, projects(title)")
      .eq("mentor_user_id", user.userId)
      .order("session_date", { ascending: false })
      .limit(5),
    supabase.from("users").select("onboarded_at").eq("id", user.userId).single(),
  ]);

  const showTour = !userRow?.onboarded_at;

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      {showTour && <OnboardingTour role="mentor" displayName={user.displayName} />}
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
          <p className="text-xs text-soft-gray/40 uppercase tracking-wider">
            {t("projectsAwaiting")}
          </p>
          <p className="text-sm text-soft-gray/50">{t("placeholder")}</p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
          <p className="text-xs text-soft-gray/40 uppercase tracking-wider">{t("recentNotes")}</p>
          {notes && notes.length > 0 ? (
            notes.map((n) => (
              <div key={n.id} className="border-b border-white/5 pb-2 last:border-0">
                <p className="text-sm text-soft-gray">
                  {Array.isArray(n.projects)
                    ? (n.projects[0] as { title: string } | undefined)?.title ?? "—"
                    : (n.projects as { title: string } | null)?.title ?? "—"}
                </p>
                <p className="text-xs text-soft-gray/40 mt-0.5">
                  {n.session_date ?? "—"} · {n.content.slice(0, 60)}…
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-soft-gray/50">{t("noNotes")}</p>
          )}
        </div>
      </main>
    </div>
  );
}
