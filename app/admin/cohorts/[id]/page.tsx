import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import StatCard from "@/components/admin/StatCard";
import { getTranslations } from "next-intl/server";

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const t = await getTranslations("admin");
  const supabase = getServiceClient();

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("*, programs(name)")
    .eq("id", id)
    .single();

  if (!cohort) notFound();

  const [
    { count: studentCount },
    { data: classCodes },
    { data: staffAssignments },
  ] = await Promise.all([
    supabase
      .from("enrollment_records")
      .select("*", { count: "exact", head: true })
      .eq("cohort_id", id),
    supabase.from("class_codes").select("*").eq("cohort_id", id),
    supabase
      .from("cohort_staff_assignments")
      .select("*, users(display_name, email, role)")
      .eq("cohort_id", id),
  ]);

  return (
    <Shell title={cohort.name} introKey="admin.cohortDetail">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label={t("stats.students")} value={studentCount ?? 0} color="teal" />
          <StatCard label={t("classCodes.title")} value={classCodes?.length ?? 0} color="violet" />
          <StatCard label="Staff" value={staffAssignments?.length ?? 0} color="gold" />
        </div>

        {/* Info */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-2 text-sm">
          <div className="flex gap-4 text-soft-gray/60">
            <span>
              {t("cohorts.startDate")}: {cohort.start_date ?? "—"}
            </span>
            <span>
              {t("cohorts.endDate")}: {cohort.end_date ?? "—"}
            </span>
            {cohort.max_students && (
              <span>
                {t("cohorts.maxStudents")}: {cohort.max_students}
              </span>
            )}
          </div>
          {cohort.programs && (
            <p className="text-soft-gray/40 text-xs">
              {t("programs.title")}: {(cohort.programs as { name: string }).name}
            </p>
          )}
        </div>

        {/* Class codes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-soft-gray/80 text-sm">
              {t("classCodes.title")}
            </h3>
            <Link
              href={`/admin/class-codes?cohort_id=${id}`}
              className="text-xs text-electric-blue hover:underline"
            >
              {t("classCodes.manage")}
            </Link>
          </div>
          {classCodes && classCodes.length > 0 ? (
            <div className="space-y-2">
              {classCodes.map((cc) => (
                <div
                  key={cc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/8 bg-white/2"
                >
                  <code className="text-sm font-mono text-vivid-teal">{cc.code}</code>
                  <div className="flex items-center gap-3 text-xs text-soft-gray/40">
                    <span>
                      {cc.use_count}/{cc.max_uses ?? "∞"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        cc.is_active
                          ? "bg-status-success/15 text-status-success"
                          : "bg-white/5 text-soft-gray/40"
                      }`}
                    >
                      {cc.is_active ? t("active") : t("paused")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-soft-gray/30">{t("classCodes.empty")}</p>
          )}
        </div>

        {/* Staff */}
        <div>
          <h3 className="font-semibold text-soft-gray/80 text-sm mb-3">Staff</h3>
          {staffAssignments && staffAssignments.length > 0 ? (
            <div className="space-y-2">
              {staffAssignments.map((sa) => (
                <div
                  key={sa.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/8 bg-white/2"
                >
                  <span className="text-sm text-soft-gray">
                    {(sa.users as { display_name: string } | null)?.display_name}
                  </span>
                  <span className="text-xs text-soft-gray/40 capitalize">{sa.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-soft-gray/30">No staff assigned.</p>
          )}
        </div>
      </div>
    </Shell>
  );
}
