import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import { lessonNumberToStage } from "@/lib/curriculum/lesson-to-stage";
import {
  checkpointDueAtLesson,
  CHECKPOINT_DUE_LESSONS,
  stageColors,
} from "@/lib/curriculum/checkpoint-helpers";
import { Play, ArrowRight, Flag } from "lucide-react";

interface LessonRow {
  id: string;
  title: string;
  lesson_number: number | null;
  linked_method_stage_id: string | null;
}

const PHASE: Record<number, { num: number; label: string }> = {
  1:  { num: 1, label: "Phase 1 — Discover & Define" },
  2:  { num: 1, label: "Phase 1 — Discover & Define" },
  3:  { num: 1, label: "Phase 1 — Discover & Define" },
  4:  { num: 1, label: "Phase 1 — Discover & Define" },
  5:  { num: 2, label: "Phase 2 — Research & Scope" },
  6:  { num: 2, label: "Phase 2 — Research & Scope" },
  7:  { num: 2, label: "Phase 2 — Research & Scope" },
  8:  { num: 2, label: "Phase 2 — Research & Scope" },
  9:  { num: 3, label: "Phase 3 — Plan & Prototype" },
  10: { num: 3, label: "Phase 3 — Plan & Prototype" },
  11: { num: 3, label: "Phase 3 — Plan & Prototype" },
  12: { num: 3, label: "Phase 3 — Plan & Prototype" },
  13: { num: 4, label: "Phase 4 — Improve & Strengthen" },
  14: { num: 4, label: "Phase 4 — Improve & Strengthen" },
  15: { num: 4, label: "Phase 4 — Improve & Strengthen" },
  16: { num: 4, label: "Phase 4 — Improve & Strengthen" },
  17: { num: 5, label: "Phase 5 — Finalize & Present" },
  18: { num: 5, label: "Phase 5 — Finalize & Present" },
  19: { num: 5, label: "Phase 5 — Finalize & Present" },
  20: { num: 5, label: "Phase 5 — Finalize & Present" },
};

export default async function TeachingModePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: lessons } = await supabase
    .from("curriculum_assets")
    .select("id, title, lesson_number, linked_method_stage_id")
    .not("lesson_number", "is", null)
    .order("lesson_number", { ascending: true });

  const filtered = ((lessons ?? []) as LessonRow[])
    .filter((l) => l.lesson_number !== null && l.lesson_number >= 1 && l.lesson_number <= 20);

  // Dedup by lesson_number (curriculum_assets may have duplicate rows per lesson)
  const seen = new Set<number>();
  const uniqueLessons: LessonRow[] = [];
  for (const l of filtered) {
    if (l.lesson_number && !seen.has(l.lesson_number)) {
      seen.add(l.lesson_number);
      uniqueLessons.push(l);
    }
  }

  // Group by phase
  const phases = new Map<number, { label: string; items: LessonRow[] }>();
  for (const l of uniqueLessons) {
    const p = PHASE[l.lesson_number ?? 0];
    if (!p) continue;
    if (!phases.has(p.num)) phases.set(p.num, { label: p.label, items: [] });
    phases.get(p.num)!.items.push(l);
  }
  const sortedPhases = Array.from(phases.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <Shell title="Teaching Mode" introKey="teacher.teachingMode">
      <div className="space-y-8">
        <div className="rounded-xl border border-electric-blue/20 bg-electric-blue/5 p-5 flex items-start gap-4">
          <div className="rounded-lg bg-electric-blue/15 p-3 flex-shrink-0">
            <Play size={20} className="text-electric-blue" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-soft-gray">Pick today&apos;s lesson and teach with the same standard every time.</p>
            <p className="text-xs text-soft-gray/60 leading-relaxed">
              Each lesson opens a teaching page bundling its plan, the worksheets to push to your class, the rubric for grading, and any checkpoints due near it.
            </p>
            <p className="text-xs text-soft-gray/50 leading-relaxed mt-2 flex items-center gap-1.5">
              <Flag size={11} className="text-status-warning" />
              <span>
                Lessons marked with a flag have a checkpoint due. There are{" "}
                <span className="text-status-warning font-semibold">{CHECKPOINT_DUE_LESSONS.length}</span> across the 20-lesson course.
              </span>
            </p>
          </div>
        </div>

        {uniqueLessons.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/40 text-sm">No lessons have been seeded yet.</p>
          </div>
        ) : (
          sortedPhases.map(([phaseNum, { label, items }]) => (
            <section key={phaseNum} className="space-y-3">
              <h2 className="text-xs font-semibold text-soft-gray/50 uppercase tracking-wider px-1">
                {label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((lesson) => {
                  const stage = lessonNumberToStage(lesson.lesson_number);
                  const sc = stageColors(stage);
                  const titleNoPrefix = lesson.title.replace(/^Lesson\s+\d+:\s*/i, "");
                  const dueCp = lesson.lesson_number ? checkpointDueAtLesson(lesson.lesson_number) : null;
                  return (
                    <Link
                      key={lesson.id}
                      href={`/teacher/teaching-mode/${lesson.lesson_number}`}
                      className={`group relative flex flex-col rounded-xl border bg-white/3 hover:bg-white/5 transition-all p-4 min-h-[140px] ${
                        dueCp ? "border-status-warning/40 hover:border-status-warning/60" : "border-white/8 hover:border-electric-blue/40"
                      }`}
                    >
                      {/* Stage color bar at top */}
                      <span aria-hidden className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl ${sc.dot}`} />

                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-soft-gray/40 bg-white/5 px-2 py-0.5 rounded">
                          Lesson {lesson.lesson_number}
                        </span>
                        {stage && (
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${sc.bg} ${sc.border} ${sc.text}`}>
                            Stage {stage}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-soft-gray leading-snug flex-1">
                        {titleNoPrefix}
                      </p>
                      {dueCp && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-status-warning font-semibold">
                          <Flag size={11} />
                          <span>Checkpoint {dueCp.number}: {dueCp.name}</span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-end text-xs text-electric-blue/70 group-hover:text-electric-blue gap-1">
                        Teach
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </Shell>
  );
}
