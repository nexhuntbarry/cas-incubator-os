-- ============================================================
-- CAS Incubator OS — Migration 0019
-- Post-restructure cleanup (follow-up to 0017 + 0018):
--   • Add migration_applied tracking table for future idempotency
--   • Drop the lesson_worksheets sentinel row (lesson_number=99999)
--     introduced by 0017 and replace its function with the new table
--   • Shift due_after_lesson values inside checkpoint_templates.approval_rules_json
--     so each checkpoint stays attached to the same content lesson after
--     0017's lesson renumbering: 10→11, 14→15, 18→19; 2/4/6/20 unchanged.
--
-- Idempotent.
-- ============================================================

-- ── 1. migration_applied tracking table ──────────────────────
CREATE TABLE IF NOT EXISTS migration_applied (
  migration_name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

INSERT INTO migration_applied (migration_name, notes)
VALUES
  ('0017_curriculum_restructure_2026_04', 'Inserted L8, shifted L8..L18 → L9..L19, merged L19+L20 → L20'),
  ('0018_curriculum_restructure_fix_titles', 'Rewrote stale "Lesson N:" prefixes in titles'),
  ('0019_post_restructure_cleanup',          'Tracking table + sentinel cleanup + checkpoint due_after_lesson shift')
ON CONFLICT (migration_name) DO NOTHING;

-- ── 2. Remove sentinel row from lesson_worksheets ────────────
DELETE FROM lesson_worksheets WHERE lesson_number = 99999;

-- ── 3. Shift checkpoint_templates.approval_rules_json.due_after_lesson ─
-- Only run if the new L8 is in place AND the shift hasn't already been
-- applied (detect via tracking row).
DO $cp$
DECLARE
  v_new_l8_exists BOOLEAN;
  v_already_shifted BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE lesson_number = 8 AND title LIKE 'Lesson 8: AI Tools%'
  ) INTO v_new_l8_exists;

  IF NOT v_new_l8_exists THEN
    RAISE NOTICE 'New L8 not found — checkpoint shift skipped (run 0017 first).';
    RETURN;
  END IF;

  -- Heuristic: if any checkpoint already references the post-shift values
  -- (11, 15, or 19) treat as already shifted.
  SELECT EXISTS (
    SELECT 1 FROM checkpoint_templates
    WHERE (approval_rules_json->>'due_after_lesson')::int IN (11, 15, 19)
  ) INTO v_already_shifted;

  IF v_already_shifted THEN
    RAISE NOTICE 'Checkpoint due_after_lesson already shifted — skipping.';
    RETURN;
  END IF;

  UPDATE checkpoint_templates
  SET approval_rules_json = jsonb_set(
        approval_rules_json,
        '{due_after_lesson}',
        to_jsonb(CASE (approval_rules_json->>'due_after_lesson')::int
                   WHEN 10 THEN 11
                   WHEN 14 THEN 15
                   WHEN 18 THEN 19
                   ELSE (approval_rules_json->>'due_after_lesson')::int
                 END),
        false
      )
  WHERE (approval_rules_json->>'due_after_lesson')::int IN (10, 14, 18);
END $cp$;
