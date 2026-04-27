/**
 * Lesson ↔ checkpoint helpers used across Teaching Mode UI.
 *
 * Mirrors the seed in supabase/migrations/0013_rubrics_checkpoints.sql so
 * we don't need to hit the DB just to know which lesson a checkpoint is due
 * after. The DB remains the source of truth for content (description,
 * required artifacts, score thresholds); these maps only encode the
 * lesson scheduling.
 */

export const CHECKPOINT_DUE_LESSONS = [2, 4, 6, 10, 14, 18, 20] as const;

export interface CheckpointMeta {
  number: number;
  name: string;
  dueAfterLesson: number;
  linkedStages: number[];
}

const CHECKPOINTS: CheckpointMeta[] = [
  { number: 1, name: "Topic Selected",      dueAfterLesson: 2,  linkedStages: [1, 2] },
  { number: 2, name: "Problem Validated",   dueAfterLesson: 4,  linkedStages: [2, 3] },
  { number: 3, name: "MVP Defined",         dueAfterLesson: 6,  linkedStages: [4, 5, 6] },
  { number: 4, name: "Prototype v1 Built",  dueAfterLesson: 10, linkedStages: [7] },
  { number: 5, name: "User-Tested",         dueAfterLesson: 14, linkedStages: [8] },
  { number: 6, name: "Polished v2",         dueAfterLesson: 18, linkedStages: [9] },
  { number: 7, name: "Showcase-Ready",      dueAfterLesson: 20, linkedStages: [10] },
];

/** The next checkpoint due at OR after the given lesson. */
export function checkpointForLesson(lessonNumber: number): CheckpointMeta | null {
  if (!Number.isFinite(lessonNumber)) return null;
  for (const cp of CHECKPOINTS) {
    if (cp.dueAfterLesson >= lessonNumber) return cp;
  }
  return null;
}

/** The checkpoint that is due exactly AT this lesson (or null). */
export function checkpointDueAtLesson(lessonNumber: number): CheckpointMeta | null {
  return CHECKPOINTS.find((cp) => cp.dueAfterLesson === lessonNumber) ?? null;
}

export function allCheckpointsMeta(): CheckpointMeta[] {
  return CHECKPOINTS;
}

/** Color classes per stage 1-10 for badges + timeline zones. Tailwind-safe. */
export const STAGE_COLORS: Record<number, { bg: string; border: string; text: string; dot: string }> = {
  1:  { bg: "bg-electric-blue/15", border: "border-electric-blue/30", text: "text-electric-blue",   dot: "bg-electric-blue" },
  2:  { bg: "bg-vivid-teal/15",    border: "border-vivid-teal/30",    text: "text-vivid-teal",      dot: "bg-vivid-teal" },
  3:  { bg: "bg-gold/15",          border: "border-gold/30",          text: "text-gold",            dot: "bg-gold" },
  4:  { bg: "bg-purple-400/15",    border: "border-purple-400/30",    text: "text-purple-400",      dot: "bg-purple-400" },
  5:  { bg: "bg-pink-400/15",      border: "border-pink-400/30",      text: "text-pink-400",        dot: "bg-pink-400" },
  6:  { bg: "bg-orange-400/15",    border: "border-orange-400/30",    text: "text-orange-400",      dot: "bg-orange-400" },
  7:  { bg: "bg-cyan-400/15",      border: "border-cyan-400/30",      text: "text-cyan-400",        dot: "bg-cyan-400" },
  8:  { bg: "bg-emerald-400/15",   border: "border-emerald-400/30",   text: "text-emerald-400",     dot: "bg-emerald-400" },
  9:  { bg: "bg-rose-400/15",      border: "border-rose-400/30",      text: "text-rose-400",        dot: "bg-rose-400" },
  10: { bg: "bg-amber-400/15",     border: "border-amber-400/30",     text: "text-amber-400",       dot: "bg-amber-400" },
};

export function stageColors(stage: number | null | undefined) {
  if (!stage) return STAGE_COLORS[1];
  return STAGE_COLORS[stage] ?? STAGE_COLORS[1];
}
