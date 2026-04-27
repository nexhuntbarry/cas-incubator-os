/**
 * Curated lesson → method-stage mapping for the 20-lesson / 10-stage incubator.
 * Used as a fallback when curriculum_assets has no explicit method_stage_number
 * column / linked_method_stage_id is unset.
 *
 * Source: Migration 0013 (rubric + checkpoint seed) + curriculum-part1.docx phasing.
 */

const LESSON_TO_STAGE: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 4,
  8: 5,
  9: 6,
  10: 6,
  11: 7,
  12: 7,
  13: 8,
  14: 8,
  15: 9,
  16: 9,
  17: 9,
  18: 9,
  19: 10,
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
