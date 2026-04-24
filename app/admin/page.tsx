import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import StatCard from "@/components/admin/StatCard";
import { getTranslations } from "next-intl/server";

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const t = await getTranslations("admin");
  const supabase = getServiceClient();

  const [
    { count: totalUsers },
    { count: students },
    { count: teachers },
    { count: mentors },
    { count: programs },
    { count: activeCohorts },
    { count: activeCodes },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "mentor"),
    supabase.from("programs").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("cohorts").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("class_codes").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return (
    <Shell title={t("overview")}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label={t("stats.totalUsers")} value={totalUsers ?? 0} color="blue" />
        <StatCard label={t("stats.students")} value={students ?? 0} color="teal" />
        <StatCard label={t("stats.teachers")} value={teachers ?? 0} color="violet" />
        <StatCard label={t("stats.mentors")} value={mentors ?? 0} color="gold" />
        <StatCard label={t("stats.programs")} value={programs ?? 0} color="blue" />
        <StatCard label={t("stats.activeCohorts")} value={activeCohorts ?? 0} color="teal" />
        <StatCard label={t("stats.activeCodes")} value={activeCodes ?? 0} color="violet" />
      </div>
    </Shell>
  );
}
