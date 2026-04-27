import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";
import Shell from "@/components/teacher/Shell";

interface TemplateStat {
  id: string;
  title: string;
  template_type: string;
  linked_lesson_number: number | null;
  linked_method_stage_id: string | null;
  required_status: string;
  stage_number: number | null;
  stage_name: string | null;
  counts: {
    submitted: number;
    approved: number;
    reviewed: number;
    revision_requested: number;
    total: number;
  };
  total_students: number | null;
}

function StatusPill({ label, count, colorCls }: { label: string; count: number; colorCls: string }) {
  if (count === 0) return null;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorCls}`}>
      {count} {label}
    </span>
  );
}

function ProgressBar({ submitted, total }: { submitted: number; total: number }) {
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/8">
        <div
          className="h-1.5 rounded-full bg-electric-blue transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-soft-gray/50 tabular-nums whitespace-nowrap">
        {submitted}/{total}
      </span>
    </div>
  );
}

// Phase grouping: stages 1-2 → Phase 1, 3-4 → Phase 2, 5-6 → Phase 3, 7-8 → Phase 4, 9-10 → Phase 5
function phaseLabel(stageNumber: number | null): string {
  if (!stageNumber) return "General";
  if (stageNumber <= 2) return "Phase 1 — Discover & Define";
  if (stageNumber <= 4) return "Phase 2 — Research & Scope";
  if (stageNumber <= 6) return "Phase 3 — Plan & Prototype";
  if (stageNumber <= 8) return "Phase 4 — Improve & Strengthen";
  return "Phase 5 — Finalize & Present";
}

function phaseOrder(stageNumber: number | null): number {
  if (!stageNumber) return 99;
  if (stageNumber <= 2) return 1;
  if (stageNumber <= 4) return 2;
  if (stageNumber <= 6) return 3;
  if (stageNumber <= 8) return 4;
  return 5;
}

export default async function TeacherWorksheetsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();

  // Pending review count (scoped to teacher's cohorts for non-super_admin)
  let pendingQuery = supabase
    .from("worksheet_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  if (user.role !== "super_admin") {
    const { data: assignments } = await supabase
      .from("cohort_staff_assignments")
      .select("cohort_id")
      .eq("user_id", user.userId);
    const cohortIds = assignments?.map((a) => a.cohort_id) ?? [];
    if (cohortIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("enrollment_records")
        .select("student_user_id")
        .in("cohort_id", cohortIds)
        .in("status", ["active", "completed"]);
      const studentIds = enrollments?.map((e) => e.student_user_id) ?? [];
      if (studentIds.length > 0) {
        pendingQuery = pendingQuery.in("student_user_id", studentIds);
      }
    }
  }

  const { count: pendingCount } = await pendingQuery;

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  // Get templates with stage info
  const { data: templates } = await supabase
    .from("worksheet_templates")
    .select("id, title, template_type, linked_lesson_number, linked_method_stage_id, required_status, i18n, method_stage_definitions!worksheet_templates_linked_method_stage_id_fkey(stage_number, name)")
    .eq("is_active", true)
    .order("linked_lesson_number", { ascending: true });

  // Get submission counts
  let studentUserIds: string[] | null = null;
  if (user.role !== "super_admin") {
    const { data: assignments } = await supabase
      .from("cohort_staff_assignments")
      .select("cohort_id")
      .eq("user_id", user.userId);
    const cohortIds = assignments?.map((a) => a.cohort_id) ?? [];
    if (cohortIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("enrollment_records")
        .select("student_user_id")
        .in("cohort_id", cohortIds)
        .in("status", ["active", "completed"]);
      studentUserIds = enrollments?.map((e) => e.student_user_id) ?? [];
    } else {
      studentUserIds = [];
    }
  }

  const totalStudents = studentUserIds?.length ?? null;
  const templateIds = (templates ?? []).map((t) => t.id);

  let submissions: { template_id: string; status: string }[] = [];
  if (templateIds.length > 0) {
    let subQuery = supabase
      .from("worksheet_submissions")
      .select("template_id, status")
      .in("template_id", templateIds);
    if (studentUserIds !== null && studentUserIds.length > 0) {
      subQuery = subQuery.in("student_user_id", studentUserIds);
    } else if (studentUserIds !== null && studentUserIds.length === 0) {
      submissions = [];
    }
    if (!(studentUserIds !== null && studentUserIds.length === 0)) {
      const { data: subs } = await subQuery;
      submissions = subs ?? [];
    }
  }

  const countsByTemplate = new Map<string, { submitted: number; approved: number; reviewed: number; revision_requested: number; total: number }>();
  for (const sub of submissions) {
    if (!countsByTemplate.has(sub.template_id)) {
      countsByTemplate.set(sub.template_id, { submitted: 0, approved: 0, reviewed: 0, revision_requested: 0, total: 0 });
    }
    const c = countsByTemplate.get(sub.template_id)!;
    c.total++;
    if (sub.status === "submitted") c.submitted++;
    if (sub.status === "approved") c.approved++;
    if (sub.status === "reviewed") c.reviewed++;
    if (sub.status === "revision_requested") c.revision_requested++;
  }

  const stats: TemplateStat[] = (templates ?? []).map((t) => {
    const stageDef = Array.isArray(t.method_stage_definitions)
      ? (t.method_stage_definitions[0] as { stage_number: number; name: string } | undefined)
      : (t.method_stage_definitions as { stage_number: number; name: string } | null);
    const tWithI18n = t as typeof t & { i18n?: Record<string, { title?: string }> | null };
    return {
      id: t.id,
      title: (localizedField(tWithI18n, "title", locale) ?? t.title) as string,
      template_type: t.template_type,
      linked_lesson_number: t.linked_lesson_number,
      linked_method_stage_id: t.linked_method_stage_id,
      required_status: t.required_status,
      stage_number: stageDef?.stage_number ?? null,
      stage_name: stageDef?.name ?? null,
      counts: countsByTemplate.get(t.id) ?? { submitted: 0, approved: 0, reviewed: 0, revision_requested: 0, total: 0 },
      total_students: totalStudents,
    };
  });

  // Group by phase
  const phases = new Map<string, { order: number; items: TemplateStat[] }>();
  for (const stat of stats) {
    const label = phaseLabel(stat.stage_number);
    const order = phaseOrder(stat.stage_number);
    if (!phases.has(label)) phases.set(label, { order, items: [] });
    phases.get(label)!.items.push(stat);
  }
  const sortedPhases = Array.from(phases.entries()).sort((a, b) => a[1].order - b[1].order);

  return (
    <Shell title="Worksheets" introKey="teacher.worksheets">
      <div className="space-y-6">
        {/* Review queue callout */}
        {(pendingCount ?? 0) > 0 && (
          <div className="rounded-xl border border-electric-blue/30 bg-electric-blue/10 p-4 flex items-center justify-between">
            <p className="text-sm text-soft-gray">
              <span className="font-bold text-electric-blue">{pendingCount}</span> submission{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
            <Link
              href="/teacher/worksheets/review"
              className="px-4 py-1.5 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
            >
              Review Queue
            </Link>
          </div>
        )}

        {!stats || stats.length === 0 ? (
          <p className="text-soft-gray/40 text-sm">No worksheet templates yet.</p>
        ) : (
          <div className="space-y-8">
            {sortedPhases.map(([phaseLabel, { items }]) => (
              <section key={phaseLabel} className="space-y-2">
                <h2 className="text-xs font-semibold text-soft-gray/50 uppercase tracking-wider px-1">
                  {phaseLabel}
                </h2>
                <div className="rounded-xl border border-white/8 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-[11px] text-soft-gray/40 uppercase tracking-wider">
                        <th className="text-left px-4 py-2.5">Worksheet</th>
                        <th className="text-left px-4 py-2.5 hidden sm:table-cell">Lesson</th>
                        <th className="text-left px-4 py-2.5 hidden md:table-cell">Stage</th>
                        <th className="text-left px-4 py-2.5">Progress</th>
                        <th className="text-left px-4 py-2.5 hidden sm:table-cell">Stats</th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((stat) => {
                        const submitted = stat.counts.submitted + stat.counts.reviewed + stat.counts.approved;
                        const total = totalStudents ?? stat.counts.total;
                        return (
                          <tr
                            key={stat.id}
                            className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-soft-gray leading-snug">{stat.title}</p>
                              <p className="text-[11px] text-soft-gray/40 mt-0.5 capitalize">{stat.template_type}</p>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell text-soft-gray/50 tabular-nums">
                              {stat.linked_lesson_number ? `L${stat.linked_lesson_number}` : "—"}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-soft-gray/50 text-xs">
                              {stat.stage_name ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <ProgressBar submitted={submitted} total={total} />
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <div className="flex flex-wrap gap-1">
                                <StatusPill label="awaiting" count={stat.counts.submitted} colorCls="bg-gold/15 text-gold" />
                                <StatusPill label="approved" count={stat.counts.approved} colorCls="bg-vivid-teal/15 text-vivid-teal" />
                                <StatusPill label="revision" count={stat.counts.revision_requested} colorCls="bg-status-warning/15 text-status-warning" />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/teacher/worksheets/${stat.id}/cohort`}
                                className="text-xs text-electric-blue hover:underline whitespace-nowrap"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
