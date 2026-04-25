import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import { getTranslations } from "next-intl/server";
import { formatDateShort } from "@/lib/dates";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const t = await getTranslations("admin");
  const supabase = getServiceClient();

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (!program) notFound();

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, name, start_date, end_date, max_students, is_active")
    .eq("program_id", id)
    .order("created_at", { ascending: false });

  return (
    <Shell title={program.name}>
      <div className="space-y-6">
        {/* Program info */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-soft-gray">{program.name}</h2>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                program.is_active
                  ? "bg-status-success/15 text-status-success"
                  : "bg-white/5 text-soft-gray/40"
              }`}
            >
              {program.is_active ? t("active") : t("archived")}
            </span>
          </div>
          {program.description && (
            <p className="text-sm text-soft-gray/60">{program.description}</p>
          )}
          {program.duration_weeks && (
            <p className="text-xs text-soft-gray/40">
              {t("programs.duration")}: {program.duration_weeks} weeks
            </p>
          )}
        </div>

        {/* Cohorts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-soft-gray/80 text-sm">
              {t("cohorts.title")}
            </h3>
            <Link
              href={`/admin/cohorts/new?program_id=${id}`}
              className="text-xs text-electric-blue hover:underline"
            >
              + {t("cohorts.new")}
            </Link>
          </div>
          {cohorts && cohorts.length > 0 ? (
            <div className="space-y-2">
              {cohorts.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/cohorts/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/8 bg-white/2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm text-soft-gray">{c.name}</span>
                  <span className="text-xs text-soft-gray/40">
                    {c.start_date ? formatDateShort(c.start_date) : "—"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-soft-gray/30">{t("cohorts.empty")}</p>
          )}
        </div>
      </div>
    </Shell>
  );
}
