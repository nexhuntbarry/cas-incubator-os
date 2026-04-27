import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";
import Shell from "@/components/teacher/Shell";
import { Star } from "lucide-react";

interface CriterionLevel {
  [key: string]: string;
}
interface RubricCriterion {
  key: string;
  label: string;
  weight: number;
  levels: CriterionLevel;
}
interface RatingScale {
  min: number;
  max: number;
  labels: Record<string, string>;
}
interface RubricRow {
  id: string;
  name: string;
  stage_number: number | null;
  is_active: boolean;
  created_at: string;
  criteria: RubricCriterion[] | null;
  max_score: number | null;
  guidance_notes: string | null;
  rating_scale_json: RatingScale | null;
  i18n: Record<string, { name?: string; guidance_notes?: string; criteria?: RubricCriterion[] }> | null;
}

export default async function TeacherRubricsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  const supabase = getServiceClient();
  const { data: rubricsRaw } = await supabase
    .from("rubric_templates")
    .select("id, name, stage_number, is_active, created_at, criteria, max_score, guidance_notes, rating_scale_json, i18n")
    .eq("is_active", true)
    .order("stage_number", { ascending: true });

  const rubrics = ((rubricsRaw ?? []) as RubricRow[]).map((r) => {
    const baseCriteria = (r.criteria ?? []) as RubricCriterion[];
    const overrideCriteria = r.i18n?.[locale]?.criteria ?? null;
    let mergedCriteria: RubricCriterion[] = baseCriteria;
    if (overrideCriteria && overrideCriteria.length > 0) {
      const oMap = new Map(overrideCriteria.map((c) => [c.key, c]));
      mergedCriteria = baseCriteria.map((c) => {
        const ov = oMap.get(c.key);
        return ov ? { ...c, ...ov, levels: { ...c.levels, ...(ov.levels ?? {}) } } : c;
      });
    }
    return {
      ...r,
      name: (localizedField(r, "name", locale) ?? r.name) as string,
      guidance_notes: (localizedField(r, "guidance_notes", locale) ?? r.guidance_notes) as string | null,
      criteria: mergedCriteria,
    };
  });

  return (
    <Shell title="Rubrics" introKey="teacher.rubrics">
      <div className="space-y-5">
        <p className="text-xs text-soft-gray/40">
          Rubric templates are managed by admins. Contact your admin to create or edit rubrics.
        </p>

        {rubrics.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/40 text-sm">No rubric templates yet.</p>
          </div>
        ) : (
          rubrics.map((r) => {
            const criteria = (r.criteria ?? []) as RubricCriterion[];
            const scale = r.rating_scale_json;
            const levelKeys = scale
              ? Array.from({ length: scale.max - scale.min + 1 }, (_, i) => String(scale.min + i))
              : criteria[0]
              ? Object.keys(criteria[0].levels).sort()
              : [];

            return (
              <details
                key={r.id}
                className="group rounded-xl border border-white/8 bg-white/3 overflow-hidden"
                open
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-gold/15 p-2 flex-shrink-0">
                      <Star size={16} className="text-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-soft-gray truncate">{r.name}</p>
                      <p className="text-[11px] text-soft-gray/50 mt-0.5">
                        {r.stage_number != null && <>Stage {r.stage_number} · </>}
                        {criteria.length} criteria · max {r.max_score ?? 100} pts
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-soft-gray/40 group-open:hidden">Expand</span>
                  <span className="text-[11px] text-soft-gray/40 hidden group-open:inline">Collapse</span>
                </summary>

                <div className="px-5 pb-5 space-y-4 border-t border-white/8 pt-4">
                  {r.guidance_notes && (
                    <p className="text-xs text-soft-gray/60 leading-relaxed">{r.guidance_notes}</p>
                  )}

                  {criteria.length === 0 ? (
                    <p className="text-soft-gray/40 text-xs">No criteria defined.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-white/8">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/8 bg-white/2 text-[10px] text-soft-gray/50 uppercase tracking-wider">
                            <th className="text-left px-3 py-2 min-w-[160px]">Criterion</th>
                            <th className="text-left px-3 py-2 w-[80px]">Weight</th>
                            {levelKeys.map((lk) => (
                              <th key={lk} className="text-left px-3 py-2 min-w-[180px]">
                                {lk}
                                {scale?.labels?.[lk] && (
                                  <span className="block text-[10px] text-electric-blue/70 normal-case font-normal mt-0.5">
                                    {scale.labels[lk]}
                                  </span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {criteria.map((c) => (
                            <tr key={c.key} className="border-b border-white/5 last:border-0 align-top">
                              <td className="px-3 py-2.5 font-semibold text-soft-gray">{c.label}</td>
                              <td className="px-3 py-2.5 text-soft-gray/60 font-mono">{c.weight}</td>
                              {levelKeys.map((lk) => (
                                <td key={lk} className="px-3 py-2.5 text-soft-gray/70 leading-snug">
                                  {c.levels?.[lk] ?? "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </details>
            );
          })
        )}
      </div>
    </Shell>
  );
}
