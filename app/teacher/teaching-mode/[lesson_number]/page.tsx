import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import LessonMarkdown from "@/components/teacher/LessonMarkdown";
import PushToClassButton from "@/components/teacher/PushToClassButton";
import { lessonNumberToStage } from "@/lib/curriculum/lesson-to-stage";
import { ChevronLeft, ChevronRight, FileText, Star, Flag, BookOpenCheck, ExternalLink } from "lucide-react";

interface CriterionLevel {
  [key: string]: string;
}
interface RubricCriterion {
  key: string;
  label: string;
  weight: number;
  levels: CriterionLevel;
}

export default async function TeachingModeLessonPage({
  params,
}: {
  params: Promise<{ lesson_number: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const { lesson_number: lessonNumberStr } = await params;
  const lessonNumber = Number(lessonNumberStr);
  if (!Number.isFinite(lessonNumber) || lessonNumber < 1 || lessonNumber > 20) {
    notFound();
  }

  const supabase = getServiceClient();

  // 1. Lesson asset (richest content_md preferred)
  const { data: lessonRows } = await supabase
    .from("curriculum_assets")
    .select("id, title, lesson_number, content_md, url, linked_method_stage_id")
    .eq("lesson_number", lessonNumber);

  const lesson = (lessonRows ?? [])
    .sort((a, b) => (b.content_md?.length ?? 0) - (a.content_md?.length ?? 0))[0];
  if (!lesson) notFound();

  // 2. Stage — prefer DB linked_method_stage_id, else curated map
  let stageNumber: number | null = null;
  let stageName: string | null = null;
  if (lesson.linked_method_stage_id) {
    const { data: stageRow } = await supabase
      .from("method_stage_definitions")
      .select("stage_number, name")
      .eq("id", lesson.linked_method_stage_id)
      .single();
    if (stageRow) {
      stageNumber = stageRow.stage_number;
      stageName = stageRow.name;
    }
  }
  if (stageNumber == null) {
    stageNumber = lessonNumberToStage(lessonNumber);
    if (stageNumber) {
      const { data: stageRow } = await supabase
        .from("method_stage_definitions")
        .select("name")
        .eq("stage_number", stageNumber)
        .single();
      stageName = stageRow?.name ?? null;
    }
  }

  // 3. Worksheets — prefer those linked to this lesson; fall back to stage match
  const [{ data: byLessonWs }, { data: byStageWs }] = await Promise.all([
    supabase
      .from("worksheet_templates")
      .select(
        "id, title, description, fields_schema, template_type, linked_lesson_number, linked_method_stage_id, method_stage_definitions(stage_number, name)"
      )
      .eq("is_active", true)
      .eq("linked_lesson_number", lessonNumber),
    stageNumber
      ? supabase
          .from("worksheet_templates")
          .select(
            "id, title, description, fields_schema, template_type, linked_lesson_number, linked_method_stage_id, method_stage_definitions!inner(stage_number, name)"
          )
          .eq("is_active", true)
          .eq("method_stage_definitions.stage_number", stageNumber)
      : Promise.resolve({ data: [] as unknown[] }),
  ]);

  type WorksheetRow = {
    id: string;
    title: string;
    description: string | null;
    fields_schema: unknown;
    template_type: string;
    linked_lesson_number: number | null;
  };
  const worksheetMap = new Map<string, WorksheetRow>();
  for (const w of (byLessonWs ?? []) as WorksheetRow[]) {
    worksheetMap.set(w.id, w);
  }
  for (const w of (byStageWs ?? []) as WorksheetRow[]) {
    if (!worksheetMap.has(w.id)) worksheetMap.set(w.id, w);
  }
  const worksheets = Array.from(worksheetMap.values()).sort((a, b) => {
    const an = a.linked_lesson_number ?? 999;
    const bn = b.linked_lesson_number ?? 999;
    if (an !== bn) return an - bn;
    return a.title.localeCompare(b.title);
  });

  // 4. Rubric for this stage
  let rubric: {
    id: string;
    name: string;
    stage_number: number;
    criteria: RubricCriterion[];
    max_score: number;
    guidance_notes: string | null;
  } | null = null;
  if (stageNumber) {
    const { data: rubricRow } = await supabase
      .from("rubric_templates")
      .select("id, name, stage_number, criteria, max_score, guidance_notes")
      .eq("stage_number", stageNumber)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (rubricRow) {
      rubric = {
        id: rubricRow.id,
        name: rubricRow.name,
        stage_number: rubricRow.stage_number,
        criteria: (rubricRow.criteria ?? []) as RubricCriterion[],
        max_score: rubricRow.max_score,
        guidance_notes: rubricRow.guidance_notes ?? null,
      };
    }
  }

  // 5. Checkpoints due near this lesson (within ±3 lessons of this one OR linked to this stage)
  const { data: allCheckpoints } = await supabase
    .from("checkpoint_templates")
    .select(
      "id, checkpoint_name, checkpoint_number, description, required_artifacts_json, required_rubrics_json, approval_rules_json, linked_method_stage_ids_json"
    )
    .eq("active_status", true)
    .order("checkpoint_number", { ascending: true });

  type CheckpointRow = {
    id: string;
    checkpoint_name: string;
    checkpoint_number: number;
    description: string | null;
    required_artifacts_json: Array<{ artifact_type: string; label: string }> | null;
    required_rubrics_json: Array<{ stage_number: number; min_score: number }> | null;
    approval_rules_json: Record<string, unknown> | null;
    linked_method_stage_ids_json: number[] | null;
  };
  const relevantCheckpoints = ((allCheckpoints ?? []) as CheckpointRow[]).filter((cp) => {
    const dueAfter = (cp.approval_rules_json?.due_after_lesson as number | undefined) ?? null;
    const stages = cp.linked_method_stage_ids_json ?? [];
    const stageMatch = stageNumber != null && stages.includes(stageNumber);
    const lessonNear = dueAfter != null && Math.abs(dueAfter - lessonNumber) <= 3;
    return stageMatch || lessonNear;
  });

  // 6. Teacher's cohorts for the Push-to-Class button
  let cohorts: { id: string; name: string }[] = [];
  if (user.role === "super_admin") {
    const { data: allCohorts } = await supabase
      .from("cohorts")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });
    cohorts = allCohorts ?? [];
  } else {
    const { data: assignments } = await supabase
      .from("cohort_staff_assignments")
      .select("cohorts(id, name, is_active)")
      .eq("user_id", user.userId);
    cohorts = (assignments ?? [])
      .map((a) => a.cohorts as unknown as { id: string; name: string; is_active: boolean } | null)
      .filter((c): c is { id: string; name: string; is_active: boolean } => !!c && c.is_active)
      .map((c) => ({ id: c.id, name: c.name }));
  }

  // Field count helper
  function countFields(schema: unknown): number {
    if (!schema || typeof schema !== "object") return 0;
    const s = schema as { fields?: unknown[] };
    return Array.isArray(s.fields) ? s.fields.length : 0;
  }

  const titleNoPrefix = lesson.title.replace(/^Lesson\s+\d+:\s*/i, "");
  const prevLesson = lessonNumber > 1 ? lessonNumber - 1 : null;
  const nextLesson = lessonNumber < 20 ? lessonNumber + 1 : null;

  return (
    <Shell
      title={`Lesson ${lessonNumber} · ${titleNoPrefix}`}
      introKey="teacher.teachingModeLesson"
    >
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/teacher/teaching-mode"
              className="text-xs text-soft-gray/60 hover:text-soft-gray flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              All lessons
            </Link>
            {stageNumber && (
              <span className="text-[11px] text-electric-blue/80 bg-electric-blue/10 border border-electric-blue/20 px-2 py-1 rounded font-semibold uppercase tracking-wider">
                Stage {stageNumber}{stageName ? ` · ${stageName}` : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {prevLesson && (
              <Link
                href={`/teacher/teaching-mode/${prevLesson}`}
                className="text-xs text-soft-gray/60 hover:text-soft-gray border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <ChevronLeft size={12} />
                Lesson {prevLesson}
              </Link>
            )}
            {nextLesson && (
              <Link
                href={`/teacher/teaching-mode/${nextLesson}`}
                className="text-xs text-soft-gray/60 hover:text-soft-gray border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                Lesson {nextLesson}
                <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Section A: Lesson Plan */}
        <section className="rounded-xl border border-white/8 bg-white/3 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpenCheck size={16} className="text-electric-blue" />
            <h2 className="text-sm font-bold text-electric-blue uppercase tracking-wider">A. Lesson Plan</h2>
          </div>
          {lesson.content_md ? (
            <LessonMarkdown content={lesson.content_md} />
          ) : (
            <p className="text-soft-gray/40 text-sm">
              No lesson plan content seeded.
              {lesson.url && (
                <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="text-electric-blue underline ml-1">
                  Open original
                </a>
              )}
            </p>
          )}
        </section>

        {/* Section B: Worksheets */}
        <section className="rounded-xl border border-white/8 bg-white/3 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-vivid-teal" />
            <h2 className="text-sm font-bold text-vivid-teal uppercase tracking-wider">B. Worksheets to use</h2>
          </div>
          {worksheets.length === 0 ? (
            <p className="text-soft-gray/40 text-sm">No worksheets linked to this lesson or stage.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {worksheets.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-white/8 bg-deep-navy/50 p-4 flex flex-col"
                >
                  <p className="text-sm font-semibold text-soft-gray leading-snug">{w.title}</p>
                  {w.description && (
                    <p className="text-xs text-soft-gray/60 mt-1.5 leading-relaxed line-clamp-2">{w.description}</p>
                  )}
                  <p className="text-[11px] text-soft-gray/40 mt-2">
                    {countFields(w.fields_schema)} fields · {w.template_type}
                    {w.linked_lesson_number && w.linked_lesson_number !== lessonNumber && (
                      <> · Lesson {w.linked_lesson_number}</>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <Link
                      href={`/admin/worksheets/${w.id}`}
                      className="text-[11px] text-soft-gray/60 hover:text-soft-gray border border-white/10 px-2.5 py-1 rounded-lg inline-flex items-center gap-1"
                    >
                      <ExternalLink size={10} /> Preview
                    </Link>
                    <PushToClassButton
                      templateId={w.id}
                      templateTitle={w.title}
                      cohorts={cohorts}
                      lessonNumber={lessonNumber}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section C: Rubric */}
        <section className="rounded-xl border border-white/8 bg-white/3 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-gold" />
            <h2 className="text-sm font-bold text-gold uppercase tracking-wider">C. Rubric</h2>
          </div>
          {!rubric ? (
            <p className="text-soft-gray/40 text-sm">No rubric exists for stage {stageNumber ?? "—"} yet.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-soft-gray">{rubric.name}</p>
                {rubric.guidance_notes && (
                  <p className="text-xs text-soft-gray/60 mt-1 leading-relaxed">{rubric.guidance_notes}</p>
                )}
                <p className="text-[11px] text-soft-gray/40 mt-1">Max score: {rubric.max_score} · {rubric.criteria.length} criteria</p>
              </div>
              <div className="space-y-3">
                {rubric.criteria.map((c) => (
                  <div key={c.key} className="rounded-lg border border-white/8 bg-deep-navy/40 p-4">
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-soft-gray">{c.label}</p>
                      <span className="text-[11px] text-soft-gray/50 font-mono">weight {c.weight}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(c.levels).map(([level, desc]) => (
                        <div key={level} className="rounded-md border border-white/8 bg-white/3 p-2">
                          <p className="text-[10px] font-semibold text-electric-blue/80 uppercase tracking-wider mb-1">Level {level}</p>
                          <p className="text-soft-gray/70 leading-snug">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section D: Checkpoints */}
        <section className="rounded-xl border border-white/8 bg-white/3 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flag size={16} className="text-status-warning" />
            <h2 className="text-sm font-bold text-status-warning uppercase tracking-wider">D. Checkpoints due near this lesson</h2>
          </div>
          {relevantCheckpoints.length === 0 ? (
            <p className="text-soft-gray/40 text-sm">No checkpoints due within 3 lessons of this one.</p>
          ) : (
            <div className="space-y-3">
              {relevantCheckpoints.map((cp) => {
                const dueAfter = cp.approval_rules_json?.due_after_lesson as number | undefined;
                const approver = cp.approval_rules_json?.approver_role as string | undefined;
                const offset = dueAfter != null ? dueAfter - lessonNumber : null;
                const offsetLabel =
                  offset === null
                    ? null
                    : offset === 0
                    ? "Due this lesson"
                    : offset > 0
                    ? `Due after Lesson ${dueAfter} (in ${offset} lesson${offset === 1 ? "" : "s"})`
                    : `Was due after Lesson ${dueAfter} (${Math.abs(offset)} lesson${Math.abs(offset) === 1 ? "" : "s"} ago)`;

                return (
                  <div key={cp.id} className="rounded-xl border border-white/8 bg-deep-navy/40 p-4">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <p className="text-sm font-semibold text-soft-gray">
                        Checkpoint {cp.checkpoint_number} · {cp.checkpoint_name}
                      </p>
                      {offsetLabel && (
                        <span className={`text-[11px] font-semibold ${offset === 0 || (offset && offset > 0 && offset <= 1) ? "text-status-warning" : "text-soft-gray/50"}`}>
                          {offsetLabel}
                        </span>
                      )}
                    </div>
                    {cp.description && (
                      <p className="text-xs text-soft-gray/70 leading-relaxed mt-1">{cp.description}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {cp.required_artifacts_json && cp.required_artifacts_json.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-soft-gray/40 uppercase tracking-wider mb-1.5">Required artifacts</p>
                          <ul className="space-y-1 text-xs text-soft-gray/70 list-disc list-inside">
                            {cp.required_artifacts_json.map((a, i) => (
                              <li key={i}>{a.label}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {cp.required_rubrics_json && cp.required_rubrics_json.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-soft-gray/40 uppercase tracking-wider mb-1.5">Score thresholds</p>
                          <ul className="space-y-1 text-xs text-soft-gray/70 list-disc list-inside">
                            {cp.required_rubrics_json.map((r, i) => (
                              <li key={i}>Stage {r.stage_number} ≥ {r.min_score}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {approver && (
                      <p className="text-[11px] text-soft-gray/40 mt-3">Approver: {approver}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
