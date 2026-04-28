/**
 * Curated lesson → method-stage mapping for the 20-lesson / 10-stage incubator.
 * Used as a fallback when curriculum_assets has no explicit method_stage_number
 * column / linked_method_stage_id is unset.
 *
 * Source: curriculum-part1.docx phasing + migration 0017 restructure
 * (new L8 AI/CAS setup, old L8..L18 shifted +1, old L19+L20 merged into L20).
 */

const LESSON_TO_STAGE: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 4,
  8: 4,
  9: 5,
  10: 6,
  11: 6,
  12: 7,
  13: 7,
  14: 8,
  15: 8,
  16: 9,
  17: 9,
  18: 9,
  19: 9,
  20: 10,
};

export function lessonNumberToStage(lessonNumber: number | null | undefined): number | null {
  if (!lessonNumber) return null;
  return LESSON_TO_STAGE[lessonNumber] ?? null;
}

export function stageToLessonNumbers(stageNumber: number): number[] {
  return Object.entries(LESSON_TO_STAGE)
    .filter(([, s]) => s === stageNumber)
    .map(([l]) => Number(l))
    .sort((a, b) => a - b);
}
