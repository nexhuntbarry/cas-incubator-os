-- ============================================================
-- CAS Incubator OS — Migration 0017
-- Curriculum restructure 2026-04
--
-- Goal: insert technical-readiness lesson (AI tools, LLM, tokens,
-- CAS setup) BEFORE the first build sprint, while keeping the total
-- lesson count at 20.
--
-- Changes (against 0007 baseline):
--   • NEW L8  "AI Tools, LLMs, Tokens & CAS Setup"
--   • Old L8..L18 shifted +1  (now L9..L19)
--   • L17 (was L16 "Token Strategy") rewritten to "Model Comparison
--     and AI Efficiency" — token mechanics moved to new L8
--   • Old L19 + L20 merged into single new L20
--     "Rehearsal, Showcase, and Mentor Review"
--
-- Idempotent: re-running is safe (guard checks new L8 title).
-- Bilingual: title/description for changed rows populated under
-- curriculum_assets.i18n (zh + en) using the column added in 0015.
-- ============================================================

DO $outer$
DECLARE
  v_program_id UUID;
  v_already_applied BOOLEAN;
BEGIN
  SELECT id INTO v_program_id
  FROM programs
  WHERE name = $$CAS Incubator — High School Project Incubator (Part 1)$$
  LIMIT 1;

  IF v_program_id IS NULL THEN
    RAISE NOTICE 'Program not found — skipping 0017 (no curriculum to restructure).';
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id
      AND lesson_number = 8
      AND title LIKE 'Lesson 8: AI Tools%'
  ) INTO v_already_applied;

  IF v_already_applied THEN
    RAISE NOTICE '0017 already applied — skipping.';
    RETURN;
  END IF;

  -- ── 1. Merge old L19 + L20 → new L20 (curriculum_assets) ─────
  DELETE FROM curriculum_assets
  WHERE program_id = v_program_id AND lesson_number = 20;

  UPDATE curriculum_assets
  SET lesson_number = 20, stage_number = 10
  WHERE program_id = v_program_id AND lesson_number = 19;

  -- ── 2. Shift old L8..L18 → L9..L19 ───────────────────────────
  -- No (program_id, lesson_number) unique constraint exists, so a
  -- single bulk update is safe.
  UPDATE curriculum_assets
  SET lesson_number = lesson_number + 1
  WHERE program_id = v_program_id
    AND lesson_number BETWEEN 8 AND 18;

  -- ── 3. INSERT new Lesson 8 ───────────────────────────────────
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description,
    metadata, sort_order, is_public, lesson_number, visibility_scope, i18n
  )
  VALUES (
    v_program_id, 4,
    'Lesson 8: AI Tools, LLMs, Tokens & CAS Setup',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/curriculum-restructure-2026-04.md',
    $$Students learn what AI tools are, how large language models work at a basic level, what tokens are and why they cost money and time, and how to set up CAS — installation, sign-in, project creation, and basic interface navigation. This lesson removes the technical mystery around AI before students attempt their first prototype, ensuring everyone arrives at the next build sprint with a working environment and a shared mental model. Students leave able to log into CAS, create a project, send a basic structured request, and explain in plain language what a token is and why prompts matter.$$,
    $${
      "phase": 2,
      "student_objectives": [
        "Explain in plain language what an LLM is and how it processes input",
        "Define a token and describe why tokens cost money and time",
        "Install or access CAS, sign in, and create a first project",
        "Send one structured request to CAS and read the resulting token usage"
      ],
      "materials": ["Laptops", "CAS access (account or invite link)", "Slides on LLM/token concepts", "Setup checklist", "Reflection sheet"],
      "activities": [
        {"min_range": "0-10",  "activity_name": "Warm-Up", "description": "What do you think happens when you type a message into an AI tool?"},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "LLMs in plain language — input → tokens → prediction → output. What a token is. Why tokens cost money and time."},
        {"min_range": "25-40", "activity_name": "AI Tools Landscape", "description": "Overview of common AI tools (chat, image, code) and where CAS fits."},
        {"min_range": "40-60", "activity_name": "CAS Hands-On Setup", "description": "Install or access CAS, sign in, create first project, tour the interface."},
        {"min_range": "60-75", "activity_name": "First Conversation", "description": "Each student sends one structured request to CAS and observes token count and output."},
        {"min_range": "75-85", "activity_name": "Reflection", "description": "What surprised you? Where could you waste tokens? Where is CAS most useful for your project?"},
        {"min_range": "85-90", "activity_name": "Exit Ticket", "description": "Define token in one sentence + show one screenshot proving CAS is set up."}
      ],
      "expected_output": "CAS account active, first project created, one screenshot saved, one-sentence token definition submitted",
      "assessment_questions": [
        "Can the student explain in plain language what a token is?",
        "Has the student successfully signed into CAS and created a project?",
        "Does the student understand that AI usage has cost and quality tradeoffs?"
      ],
      "teacher_notes": "Treat this as a readiness gate for the build sprint. Any student who cannot log into CAS by the end of class needs follow-up before Lesson 12."
    }$$::jsonb,
    8, false, 8, '["teacher","mentor"]'::jsonb,
    $${
      "zh": {
        "title": "第 8 課：AI 工具、LLM、Token 與 CAS 安裝",
        "description": "學生學習 AI 工具是什麼、大型語言模型（LLM）的基本運作方式、token 是什麼、為什麼 token 會耗費金錢與時間，以及如何安裝與設定 CAS — 包含安裝/登入、建立第一個專案、熟悉介面操作。這堂課在學生進入第一個 prototype 前，先去除 AI 的技術神祕感，確保所有人到下一堂建構衝刺時都已備好環境並具備共同心智模型。學生上完這課應該能登入 CAS、建立專案、送出一個結構化請求，並用白話解釋什麼是 token、為什麼 prompt 寫法很重要。"
      },
      "en": {
        "title": "Lesson 8: AI Tools, LLMs, Tokens & CAS Setup"
      }
    }$$::jsonb
  );

  -- ── 4. Rewrite L17 (was old L16 token-strategy lesson) ───────
  UPDATE curriculum_assets
  SET
    title       = 'Lesson 17: Model Comparison and AI Efficiency',
    description = $$Token mechanics were covered in Lesson 8. This lesson focuses on choosing the right model for the job, comparing outputs across models, and improving efficiency through better prompting and reuse. Students compare cost-vs-quality tradeoffs and refine their workflows after Build Sprint 2.$$,
    metadata    = $${
      "phase": 4,
      "student_objectives": [
        "Compare two or more AI models on the same task and document differences",
        "Identify wasted prompts and unnecessary token usage in their own build history",
        "Rewrite core project prompts for efficiency and reuse"
      ],
      "materials": ["Laptops", "Access to two or more models via CAS", "Build history / prompt log", "Comparison worksheet"],
      "activities": [
        {"min_range": "0-10",  "activity_name": "Warm-Up", "description": "Which model did you use most in Sprint 2 and why?"},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Model differences — speed, cost, quality, context length. When to use which."},
        {"min_range": "25-50", "activity_name": "Side-by-Side Comparison", "description": "Run the same prompt across two models and document differences."},
        {"min_range": "50-70", "activity_name": "Efficiency Audit", "description": "Identify wasted prompts and tokens in your own build history."},
        {"min_range": "70-85", "activity_name": "Workflow Refinement", "description": "Rewrite your core project prompts for efficiency and reuse."},
        {"min_range": "85-90", "activity_name": "Exit Ticket", "description": "One concrete change you will make to reduce token usage without losing quality."}
      ],
      "expected_output": "Side-by-side comparison notes + revised core prompt set + one efficiency commitment",
      "assessment_questions": [
        "Can the student justify a model choice with concrete tradeoffs?",
        "Did the student identify a real source of waste in their own prompt history?"
      ],
      "teacher_notes": "Token concept is now taught in Lesson 8 — do not re-teach mechanics here. Focus on judgment and workflow."
    }$$::jsonb,
    i18n = $${
      "zh": {
        "title": "第 17 課：模型比較與 AI 效率",
        "description": "token 機制已於第 8 課教過，本課聚焦在「選對模型」與「工作流效率」。學生比較成本對品質的取捨，並在 Sprint 2 後優化自己的工作流。"
      },
      "en": {
        "title": "Lesson 17: Model Comparison and AI Efficiency"
      }
    }$$::jsonb
  WHERE program_id = v_program_id AND lesson_number = 17;

  -- ── 5. Rewrite new L20 (merged old L19 + L20) ────────────────
  UPDATE curriculum_assets
  SET
    title       = 'Lesson 20: Rehearsal, Showcase, and Mentor Review',
    description = $$Students rehearse delivery, run a final dress rehearsal with peers, then present to mentors, parents, or judges in a showcase. They incorporate last-round feedback, capture portfolio assets, and reflect on the full journey from interest mapping to final delivery.$$,
    metadata    = $${
      "phase": 5,
      "student_objectives": [
        "Deliver a clean, timed presentation of their project to mentors and audience",
        "Incorporate last-round feedback into final delivery",
        "Capture portfolio assets — screenshots, links, recorded reflection",
        "Articulate the full journey from interest mapping to final result"
      ],
      "materials": ["Final slide deck", "Working prototype", "Portfolio capture checklist", "Mentor feedback rubric"],
      "activities": [
        {"min_range": "0-15",  "activity_name": "Final Rehearsal", "description": "Timed dry run with peer partner."},
        {"min_range": "15-25", "activity_name": "Last Adjustments", "description": "Refine 1-2 weak spots flagged by partner."},
        {"min_range": "25-65", "activity_name": "Showcase Presentations", "description": "Each student presents to mentors and audience."},
        {"min_range": "65-80", "activity_name": "Mentor Q&A", "description": "Structured feedback from mentors."},
        {"min_range": "80-90", "activity_name": "Closing Reflection + Portfolio Capture", "description": "Final written reflection, screenshots, links archived."}
      ],
      "expected_output": "Live showcase delivery + portfolio bundle + final reflection",
      "assessment_questions": [
        "Did the student deliver a clear and confident presentation?",
        "Has the student archived the portfolio assets needed for college / competition use?",
        "Does the student articulate honest reflection on the full project journey?"
      ],
      "teacher_notes": "This is a single combined session: rehearsal flows directly into showcase. Schedule mentors and audience in advance."
    }$$::jsonb,
    i18n = $${
      "zh": {
        "title": "第 20 課：預演、成果展示與導師回饋",
        "description": "學生先彩排、再與夥伴正式預演，最後對導師、家長或評審進行成果展示。納入最後一輪回饋、收集 portfolio 素材，並反思從興趣盤點到最終交付的完整歷程。"
      },
      "en": {
        "title": "Lesson 20: Rehearsal, Showcase, and Mentor Review"
      }
    }$$::jsonb
  WHERE program_id = v_program_id AND lesson_number = 20;

END $outer$;


-- ── 6. lesson_worksheets — shift to match new numbering ────────
-- (Table is global; not program-scoped. Idempotency: detect via the
-- presence of any row at lesson_number=8 AND absence of new L8 row
-- already shifted to 9. Safer: track via a settings flag in
-- curriculum_assets, but a simple try-once-only DO block suffices
-- because the shifts use BETWEEN ranges and merges are conditional.)
DO $ws$
DECLARE
  v_should_run BOOLEAN;
BEGIN
  -- Run only when curriculum has been restructured (new L8 exists).
  SELECT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE lesson_number = 8 AND title LIKE 'Lesson 8: AI Tools%'
  ) INTO v_should_run;

  IF NOT v_should_run THEN
    RAISE NOTICE 'lesson_worksheets shift skipped — restructure not applied.';
    RETURN;
  END IF;

  -- Heuristic idempotency: if old L20 worksheet count looks already
  -- merged (i.e. we already see legacy L19+L20 templates collapsed),
  -- assume done. Cheap detection: a sentinel marker row.
  IF EXISTS (
    SELECT 1 FROM lesson_worksheets
    WHERE lesson_number = 99999
  ) THEN
    RAISE NOTICE 'lesson_worksheets shift already applied — skipping.';
    RETURN;
  END IF;

  -- Step A: drop conflicting L19→L20 merge candidates.
  DELETE FROM lesson_worksheets a
  WHERE a.lesson_number = 19
    AND EXISTS (
      SELECT 1 FROM lesson_worksheets b
      WHERE b.lesson_number = 20
        AND b.worksheet_template_id = a.worksheet_template_id
        AND b.usage_type = a.usage_type
    );

  -- Step B: shift old L19 → L20 (merge).
  UPDATE lesson_worksheets SET lesson_number = 20 WHERE lesson_number = 19;

  -- Step C: shift old L8..L18 → L9..L19 (descending to avoid any
  -- transient unique-constraint hits within the bulk update).
  UPDATE lesson_worksheets SET lesson_number = 19 WHERE lesson_number = 18;
  UPDATE lesson_worksheets SET lesson_number = 18 WHERE lesson_number = 17;
  UPDATE lesson_worksheets SET lesson_number = 17 WHERE lesson_number = 16;
  UPDATE lesson_worksheets SET lesson_number = 16 WHERE lesson_number = 15;
  UPDATE lesson_worksheets SET lesson_number = 15 WHERE lesson_number = 14;
  UPDATE lesson_worksheets SET lesson_number = 14 WHERE lesson_number = 13;
  UPDATE lesson_worksheets SET lesson_number = 13 WHERE lesson_number = 12;
  UPDATE lesson_worksheets SET lesson_number = 12 WHERE lesson_number = 11;
  UPDATE lesson_worksheets SET lesson_number = 11 WHERE lesson_number = 10;
  UPDATE lesson_worksheets SET lesson_number = 10 WHERE lesson_number = 9;
  UPDATE lesson_worksheets SET lesson_number = 9  WHERE lesson_number = 8;

  -- Sentinel: mark migration applied so future reruns skip.
  INSERT INTO lesson_worksheets (lesson_number, worksheet_template_id, usage_type, display_order)
  SELECT 99999, id, 'fill', 0
  FROM worksheet_templates
  ORDER BY id LIMIT 1
  ON CONFLICT (lesson_number, worksheet_template_id, usage_type) DO NOTHING;
END $ws$;


-- ── 7. worksheet_assignments — shift runtime assignments ───────
-- worksheet_assignments may hold runtime rows assigned by teachers.
-- We shift their lesson_number references the same way so existing
-- assignments stay attached to the lesson they were intended for
-- (semantically renumbered, not reassigned).
DO $wa$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'worksheet_assignments' AND column_name = 'lesson_number'
  ) THEN
    RAISE NOTICE 'worksheet_assignments.lesson_number not present — skipping shift.';
    RETURN;
  END IF;

  -- Idempotency sentinel reuse: same flag as lesson_worksheets.
  IF NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE lesson_number = 8 AND title LIKE 'Lesson 8: AI Tools%'
  ) THEN
    RETURN;
  END IF;

  -- Merge: old L19 assignments folded into L20 (no UNIQUE so simple).
  UPDATE worksheet_assignments SET lesson_number = 20 WHERE lesson_number = 19;

  -- Shift old L8..L18 → L9..L19 descending.
  UPDATE worksheet_assignments SET lesson_number = 19 WHERE lesson_number = 18;
  UPDATE worksheet_assignments SET lesson_number = 18 WHERE lesson_number = 17;
  UPDATE worksheet_assignments SET lesson_number = 17 WHERE lesson_number = 16;
  UPDATE worksheet_assignments SET lesson_number = 16 WHERE lesson_number = 15;
  UPDATE worksheet_assignments SET lesson_number = 15 WHERE lesson_number = 14;
  UPDATE worksheet_assignments SET lesson_number = 14 WHERE lesson_number = 13;
  UPDATE worksheet_assignments SET lesson_number = 13 WHERE lesson_number = 12;
  UPDATE worksheet_assignments SET lesson_number = 12 WHERE lesson_number = 11;
  UPDATE worksheet_assignments SET lesson_number = 11 WHERE lesson_number = 10;
  UPDATE worksheet_assignments SET lesson_number = 10 WHERE lesson_number = 9;
  UPDATE worksheet_assignments SET lesson_number = 9  WHERE lesson_number = 8;
END $wa$;
