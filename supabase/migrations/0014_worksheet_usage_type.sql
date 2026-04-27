-- ============================================================
-- CAS Incubator OS — Migration 0014
-- Lesson ↔ Worksheet linkage with usage_type semantics.
--
-- Adds a join table `lesson_worksheets` so the same worksheet
-- can appear in multiple lessons with different intent:
--   fill      = Students complete this worksheet for the first time.
--   review    = Students revisit / read what they previously wrote.
--   edit      = Students return and revise an earlier worksheet.
--   reference = Worksheet is shown as supporting context only.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- Safe to re-run; the seed block uses the unique key
-- (lesson_number, worksheet_template_id, usage_type).
-- ============================================================

CREATE TABLE IF NOT EXISTS lesson_worksheets (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_number         int NOT NULL,
  worksheet_template_id uuid NOT NULL REFERENCES worksheet_templates(id) ON DELETE CASCADE,
  usage_type            text NOT NULL DEFAULT 'fill'
                          CHECK (usage_type IN ('fill', 'review', 'edit', 'reference')),
  display_order         int DEFAULT 0,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_number, worksheet_template_id, usage_type)
);

CREATE INDEX IF NOT EXISTS idx_lesson_worksheets_lesson
  ON lesson_worksheets (lesson_number, display_order);
CREATE INDEX IF NOT EXISTS idx_lesson_worksheets_template
  ON lesson_worksheets (worksheet_template_id);

-- ── Seed: 20 lessons × 22 worksheets default mapping ──────────
-- Mapping rationale (matches checkpoints in migration 0013):
--   First appearance of a worksheet  → 'fill'
--   Subsequent appearance same stage → 'review'
--   Cross-stage callback to revise   → 'edit'
--
-- Worksheet-to-stage (from migration 0007):
--   W1=S1, W2=S2, W3=S1*, W4=S3, W5=S3, W6=S4, W7=S4, W8=S5,
--   W9=S6, W10=S7, W11=S7, W12=S7, W13=S8, W14=S8,
--   W15=S9, W16=S9, W17=S9, W18=S9, W19=S9*, W20=S10, W21=S10, W22=S10
-- (* = note migration 0013 places W3 under Stage 2 and W19 under Stage 10
--      semantically; we follow the rubric/checkpoint intent.)

DO $$
DECLARE
  ws_id uuid;
  -- (lesson, ws_number, usage_type, display_order)
  rows TEXT[][] := ARRAY[
    -- Lesson 1 — Interest Discovery kickoff
    ARRAY['1','1','fill','1'],
    -- Lesson 2 — narrow + bridge to problem framing
    ARRAY['2','1','review','1'],
    ARRAY['2','2','fill','2'],
    -- Lesson 3 — refine problem statement, open opportunity scan
    ARRAY['3','2','review','1'],
    ARRAY['3','3','fill','2'],
    -- Lesson 4 — opportunities → users (Checkpoint 2 due)
    ARRAY['4','3','review','1'],
    ARRAY['4','4','fill','2'],
    ARRAY['4','5','fill','3'],
    -- Lesson 5 — deep user empathy
    ARRAY['5','4','review','1'],
    ARRAY['5','5','review','2'],
    -- Lesson 6 — existing solutions + value prop + MVP scope (Checkpoint 3)
    ARRAY['6','6','fill','1'],
    ARRAY['6','7','fill','2'],
    ARRAY['6','8','fill','3'],
    ARRAY['6','9','fill','4'],
    -- Lesson 7 — competitive landscape deep-dive
    ARRAY['7','6','review','1'],
    ARRAY['7','7','review','2'],
    -- Lesson 8 — sharpen value proposition
    ARRAY['8','8','review','1'],
    -- Lesson 9 — MVP scoping + prompt builder
    ARRAY['9','9','review','1'],
    ARRAY['9','10','fill','2'],
    -- Lesson 10 — User flow / wireframes / sprint kickoff (Checkpoint 4)
    ARRAY['10','10','review','1'],
    ARRAY['10','11','fill','2'],
    ARRAY['10','12','fill','3'],
    ARRAY['10','13','fill','4'],
    ARRAY['10','14','fill','5'],
    -- Lesson 11 — flow refinement
    ARRAY['11','11','review','1'],
    ARRAY['11','12','review','2'],
    -- Lesson 12 — sprint check-in
    ARRAY['12','13','review','1'],
    ARRAY['12','14','review','2'],
    -- Lesson 13 — build sprint 2 (revise plan + tests)
    ARRAY['13','13','edit','1'],
    ARRAY['13','14','edit','2'],
    -- Lesson 14 — peer review prep (Checkpoint 5)
    ARRAY['14','15','fill','1'],
    -- Lesson 15 — synthesise feedback
    ARRAY['15','15','review','1'],
    ARRAY['15','16','fill','2'],
    -- Lesson 16 — change-log discipline
    ARRAY['16','17','fill','1'],
    -- Lesson 17 — apply revisions
    ARRAY['17','17','edit','1'],
    -- Lesson 18 — token efficiency reflection (Checkpoint 6)
    ARRAY['18','16','review','1'],
    ARRAY['18','17','review','2'],
    ARRAY['18','18','fill','3'],
    -- Lesson 19 — final build + presentation drafting
    ARRAY['19','19','fill','1'],
    ARRAY['19','20','fill','2'],
    -- Lesson 20 — rehearsal + showcase (Checkpoint 7)
    ARRAY['20','20','review','1'],
    ARRAY['20','21','fill','2'],
    ARRAY['20','22','fill','3']
  ];
  r TEXT[];
  v_lesson INT;
  v_ws_num INT;
  v_usage TEXT;
  v_order INT;
  v_title TEXT;
BEGIN
  FOREACH r SLICE 1 IN ARRAY rows LOOP
    v_lesson := r[1]::int;
    v_ws_num := r[2]::int;
    v_usage  := r[3];
    v_order  := r[4]::int;
    v_title  := 'Worksheet ' || v_ws_num || ':%';

    SELECT id INTO ws_id
    FROM worksheet_templates
    WHERE title ILIKE v_title
    LIMIT 1;

    IF ws_id IS NOT NULL THEN
      INSERT INTO lesson_worksheets (lesson_number, worksheet_template_id, usage_type, display_order)
      VALUES (v_lesson, ws_id, v_usage, v_order)
      ON CONFLICT (lesson_number, worksheet_template_id, usage_type) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ── Verification (commented for reference) ────────────────────
-- SELECT lesson_number,
--        COUNT(*) AS worksheets,
--        STRING_AGG(usage_type, ',' ORDER BY display_order) AS types
-- FROM lesson_worksheets
-- GROUP BY lesson_number ORDER BY lesson_number;
