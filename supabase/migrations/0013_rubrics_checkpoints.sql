-- ============================================================
-- CAS Incubator OS — Migration 0013
-- Seed rubric_templates (10) + checkpoint_templates (7)
-- aligned to the 10-stage incubation method, 20-lesson curriculum,
-- and 22 worksheets defined in migrations 0007/0010/0012.
-- Generated: 2026-04-25
-- Idempotent: guarded by WHERE NOT EXISTS on (name) / (checkpoint_number).
-- Safe to re-run; will skip rows already present.
-- ============================================================

-- ── 1. RUBRICS — one per method stage (10 stages) ─────────────
-- Schema reference (migrations 0001 + 0003):
--   rubric_templates(name, stage_number, criteria JSONB,
--                    max_score, version, is_active,
--                    rating_scale_json, guidance_notes,
--                    linked_project_types JSONB)
--
-- Convention used in `criteria`:
--   [{ "key": "...", "label": "...", "weight": <int 1-30>,
--      "levels": { "1": "Emerging — ...", "2": "Developing — ...",
--                  "3": "Proficient — ...", "4": "Exemplary — ..." } }, ...]
-- Weights sum to 100 → max_score normalises to 0-100.
-- rating_scale_json is overridden to a 1-4 scale per criterion request.

DO $$
DECLARE
  v_scale JSONB := '{"min":1,"max":4,"labels":{"1":"Emerging","2":"Developing","3":"Proficient","4":"Exemplary"}}'::jsonb;
BEGIN

-- Stage 1 — Interest Discovery (Lessons 1-2)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 1 — Interest Discovery Rubric',
  1,
  $criteria$[
    {"key":"breadth","label":"Breadth of interests explored","weight":25,"levels":{"1":"Emerging — Lists fewer than 3 interest areas with little variety.","2":"Developing — Lists 3-4 areas, mostly clustered around one theme.","3":"Proficient — Explores 5+ distinct domains across academic, civic, and personal interests.","4":"Exemplary — Wide-ranging exploration with clear cross-domain connections and curiosity."}},
    {"key":"depth_reflection","label":"Depth of self-reflection","weight":25,"levels":{"1":"Emerging — Surface-level statements with no personal motivation explained.","2":"Developing — Some reasoning given but motivation feels generic.","3":"Proficient — Clear personal stake, evidence from lived experience.","4":"Exemplary — Deep reflection that links values, history, and future aspiration."}},
    {"key":"realworld_link","label":"Connection to real-world problems","weight":25,"levels":{"1":"Emerging — Interests are abstract; no real-world anchor.","2":"Developing — Mentions real-world topics without concrete examples.","3":"Proficient — Each interest area paired with an observable real-world issue.","4":"Exemplary — Identifies stakeholders, locations, and current events tied to interests."}},
    {"key":"iteration","label":"Willingness to iterate","weight":25,"levels":{"1":"Emerging — Locks in a topic on the first attempt; resists revisiting.","2":"Developing — Open to feedback but rarely revises in writing.","3":"Proficient — Revises Worksheet 1 entries after peer/mentor input.","4":"Exemplary — Documents multiple iteration cycles with reasoning for each pivot."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheet 1 (Personal Interests & Goals Reflection). Encourage students to revisit at end of Lesson 2.',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 1 — Interest Discovery Rubric');

-- Stage 2 — Problem Definition (Lessons 3-4)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 2 — Problem Definition Rubric',
  2,
  $criteria$[
    {"key":"specificity","label":"Specificity of problem statement","weight":25,"levels":{"1":"Emerging — Problem stated as a vague topic (e.g. 'climate change').","2":"Developing — Problem named but lacks scope or affected parties.","3":"Proficient — Problem statement includes who, what, where, and frequency.","4":"Exemplary — Statement passes the 'so what / says who' test with measurable scope."}},
    {"key":"evidence","label":"Evidence supporting the problem","weight":25,"levels":{"1":"Emerging — No supporting evidence cited.","2":"Developing — Anecdotal evidence only.","3":"Proficient — At least 2 sources or interviews referenced.","4":"Exemplary — Quantitative + qualitative evidence triangulated from 3+ sources."}},
    {"key":"scope_realism","label":"Scope realism for 20-week build","weight":25,"levels":{"1":"Emerging — Scope is global / civilisational and unrealistic.","2":"Developing — Scope narrowed to a country or sector but still too broad.","3":"Proficient — Scope tractable for a student team within 20 weeks.","4":"Exemplary — Scope clearly bounded with explicit out-of-scope statements."}},
    {"key":"clarity","label":"Clarity and language","weight":25,"levels":{"1":"Emerging — Statement is jargon-heavy or contradictory.","2":"Developing — Mostly clear; some ambiguous terms.","3":"Proficient — Concise, jargon-free, single-sentence problem statement.","4":"Exemplary — Compelling and memorable; understood by a non-expert in 10 seconds."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 2 (Problem Statement) and 3 (Opportunity Areas Map).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 2 — Problem Definition Rubric');

-- Stage 3 — Target User (Lessons 5-6)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 3 — Target User Rubric',
  3,
  $criteria$[
    {"key":"persona_specificity","label":"Persona specificity","weight":25,"levels":{"1":"Emerging — Persona described as 'everyone' or a generic demographic.","2":"Developing — Demographics listed but no behaviours or context.","3":"Proficient — Persona includes age, context, behaviours, and motivations.","4":"Exemplary — Multiple personas with primary/secondary distinction and tensions named."}},
    {"key":"empathy_evidence","label":"Empathy evidence (interviews / observations)","weight":25,"levels":{"1":"Emerging — No interviews conducted; persona is imagined.","2":"Developing — 1 interview / informal conversation.","3":"Proficient — 3+ interviews with direct quotes captured.","4":"Exemplary — 5+ interviews + field observations; insights synthesised."}},
    {"key":"stakeholder_map","label":"Stakeholder + context mapping","weight":25,"levels":{"1":"Emerging — Only the end user identified.","2":"Developing — End user + one supporting stakeholder.","3":"Proficient — Influencers, decision-makers, blockers all mapped.","4":"Exemplary — Full ecosystem map with relationship strengths and conflicts."}},
    {"key":"need_articulation","label":"Articulation of unmet needs","weight":25,"levels":{"1":"Emerging — Needs restated as solutions.","2":"Developing — Needs listed but mixed with assumptions.","3":"Proficient — Needs framed as job-to-be-done statements.","4":"Exemplary — Needs prioritised by frequency and emotional intensity."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 4 (User Persona) and 5 (Stakeholder & Context Map).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 3 — Target User Rubric');

-- Stage 4 — Existing Solutions (Lesson 7)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 4 — Existing Solutions Rubric',
  4,
  $criteria$[
    {"key":"comprehensiveness","label":"Comprehensiveness of landscape scan","weight":25,"levels":{"1":"Emerging — Lists 1-2 existing solutions.","2":"Developing — 3-4 solutions; same category only.","3":"Proficient — 5+ solutions across direct, indirect, and adjacent categories.","4":"Exemplary — Includes failed past attempts and global comparables."}},
    {"key":"comparison_rigor","label":"Comparison rigor","weight":25,"levels":{"1":"Emerging — Listed without comparison.","2":"Developing — Pros/cons noted casually.","3":"Proficient — Side-by-side matrix with consistent dimensions.","4":"Exemplary — Quantified comparison with data points (price, users, outcomes)."}},
    {"key":"gap_insight","label":"Gap & insight quality","weight":25,"levels":{"1":"Emerging — No gap identified.","2":"Developing — Gap stated as 'better UX' or 'cheaper'.","3":"Proficient — Specific unmet need named with evidence.","4":"Exemplary — Defensible insight others have missed; tied to user pain."}},
    {"key":"sources","label":"Source quality + citation","weight":25,"levels":{"1":"Emerging — No sources cited.","2":"Developing — Wikipedia / blog posts only.","3":"Proficient — Mix of news, product sites, and reviews.","4":"Exemplary — Primary sources, interviews with users of competitors."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 6 (Existing Solutions Comparison) and 7 (Gap & Insight Notes).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 4 — Existing Solutions Rubric');

-- Stage 5 — Value Proposition (Lesson 8)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 5 — Value Proposition Rubric',
  5,
  $criteria$[
    {"key":"clarity","label":"Clarity of value statement","weight":25,"levels":{"1":"Emerging — Statement is a feature list.","2":"Developing — Mentions benefit but not for whom.","3":"Proficient — 'For [user], we provide [benefit] unlike [alt]'.","4":"Exemplary — One memorable sentence; passes the elevator pitch test."}},
    {"key":"differentiation","label":"Differentiation from alternatives","weight":25,"levels":{"1":"Emerging — Indistinguishable from existing solutions.","2":"Developing — Differentiation is incremental (faster, cheaper).","3":"Proficient — Identifies a unique angle backed by user need.","4":"Exemplary — Differentiation is structural and hard to copy."}},
    {"key":"evidence","label":"Evidence-based positioning","weight":25,"levels":{"1":"Emerging — Pure assertion.","2":"Developing — Cites general trend.","3":"Proficient — Tied to specific user quotes / data.","4":"Exemplary — Triangulated quantitative + qualitative evidence."}},
    {"key":"appeal","label":"Appeal to target user","weight":25,"levels":{"1":"Emerging — User would not understand or care.","2":"Developing — User sees relevance but not urgency.","3":"Proficient — Tested with users; positive resonance.","4":"Exemplary — Users actively asked when/how they can use it."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheet 8 (Value Proposition Template). Pair with peer test in class.',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 5 — Value Proposition Rubric');

-- Stage 6 — MVP Scoping (Lessons 9-10)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 6 — MVP Scoping Rubric',
  6,
  $criteria$[
    {"key":"scope_discipline","label":"Scope discipline (must vs nice-to-have)","weight":25,"levels":{"1":"Emerging — All features marked as must-have.","2":"Developing — Some prioritisation but feature list is bloated.","3":"Proficient — Clear must/should/could/won't with rationale.","4":"Exemplary — MVP fits a 2-week build sprint with explicit cuts documented."}},
    {"key":"user_value","label":"User value of MVP slice","weight":25,"levels":{"1":"Emerging — MVP delivers no usable value.","2":"Developing — MVP has value but skips core user job.","3":"Proficient — MVP completes the primary job-to-be-done.","4":"Exemplary — MVP delights and is testable end-to-end."}},
    {"key":"feasibility","label":"Technical feasibility","weight":25,"levels":{"1":"Emerging — Requires capabilities the team does not have.","2":"Developing — Feasible but high risk on key components.","3":"Proficient — Builds on tools / libraries the team has used.","4":"Exemplary — Plan includes fallbacks for risky components."}},
    {"key":"prompt_quality","label":"Prompt / spec quality for AI build","weight":25,"levels":{"1":"Emerging — Prompts are vague single sentences.","2":"Developing — Prompts have context but no acceptance criteria.","3":"Proficient — Prompts include role, goal, constraints, examples.","4":"Exemplary — Prompts versioned with rationale; reusable across the project."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 9 (Feature Dump & MVP Matrix) and 10 (Prompt Builder).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 6 — MVP Scoping Rubric');

-- Stage 7 — Build Plan (Lessons 11-12)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 7 — Build Plan Rubric',
  7,
  $criteria$[
    {"key":"flow_clarity","label":"User flow clarity","weight":25,"levels":{"1":"Emerging — No flow drawn.","2":"Developing — Single happy path only.","3":"Proficient — Happy path + 1-2 alternative paths.","4":"Exemplary — Includes error states, edge cases, and empty states."}},
    {"key":"architecture","label":"Architecture / data model","weight":25,"levels":{"1":"Emerging — No data model.","2":"Developing — Implicit data model in screens only.","3":"Proficient — Explicit entities, fields, relationships.","4":"Exemplary — Architecture diagram with services, storage, and trust boundaries."}},
    {"key":"sequencing","label":"Sequencing + milestones","weight":25,"levels":{"1":"Emerging — No order specified.","2":"Developing — Linear list of tasks.","3":"Proficient — Tasks grouped into milestones with acceptance criteria.","4":"Exemplary — Critical path identified; risks mapped to milestones."}},
    {"key":"team_roles","label":"Team roles + accountability","weight":25,"levels":{"1":"Emerging — No owner per task.","2":"Developing — Owners listed but overlap.","3":"Proficient — One owner per milestone; reviewer named.","4":"Exemplary — RACI-style roles; backup owner for critical milestones."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 11 (User Flow) and 12 (Wireframe / Architecture).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 7 — Build Plan Rubric');

-- Stage 8 — Prototype Development (Lessons 13-14)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 8 — Prototype Development Rubric',
  8,
  $criteria$[
    {"key":"functional_completeness","label":"Functional completeness vs MVP scope","weight":25,"levels":{"1":"Emerging — <40% of MVP features built.","2":"Developing — 40-70% built; key flow broken.","3":"Proficient — Core flow end-to-end works.","4":"Exemplary — All MVP features + polish on the primary flow."}},
    {"key":"build_log","label":"Build log / sprint hygiene","weight":25,"levels":{"1":"Emerging — No build log.","2":"Developing — Log exists but inconsistent.","3":"Proficient — Daily log with what was built / blocked.","4":"Exemplary — Linked commits, screenshots, and decision records."}},
    {"key":"self_test","label":"Self-test rigor","weight":25,"levels":{"1":"Emerging — Did not self-test.","2":"Developing — Tested happy path only.","3":"Proficient — Test cases cover happy + error paths.","4":"Exemplary — Issue log triaged with severity and owner."}},
    {"key":"ai_collaboration","label":"AI collaboration quality","weight":25,"levels":{"1":"Emerging — Pasted AI output without review.","2":"Developing — Edited AI output but no critique.","3":"Proficient — Iterates prompts; explains why output was rejected.","4":"Exemplary — Tracks token efficiency; reuses good prompts as templates."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 13 (Build Sprint 1 Checklist) and 14 (Self-Test & Issue Log).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 8 — Prototype Development Rubric');

-- Stage 9 — Testing & Revision (Lessons 15-18)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 9 — Testing & Revision Rubric',
  9,
  $criteria$[
    {"key":"test_design","label":"User test design","weight":25,"levels":{"1":"Emerging — Showed prototype with no questions prepared.","2":"Developing — Asked general feedback questions.","3":"Proficient — Designed task-based tests; observed without coaching.","4":"Exemplary — Used think-aloud + measured task completion."}},
    {"key":"feedback_synthesis","label":"Feedback synthesis","weight":25,"levels":{"1":"Emerging — Listed feedback verbatim.","2":"Developing — Grouped feedback by theme.","3":"Proficient — Themes ranked by frequency + severity.","4":"Exemplary — Insights linked back to original problem statement and persona."}},
    {"key":"revision_decisions","label":"Revision decisions + rationale","weight":25,"levels":{"1":"Emerging — Changed everything OR nothing.","2":"Developing — Changes made without documented rationale.","3":"Proficient — Decision log: change / keep / defer with reason.","4":"Exemplary — Trade-offs explicit; tested revisions with users again."}},
    {"key":"changelog","label":"Change log discipline","weight":25,"levels":{"1":"Emerging — No change log.","2":"Developing — Notes major changes only.","3":"Proficient — Versioned change log with date + author.","4":"Exemplary — Change log links to commits / artefacts and references feedback source."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 15 (Peer Review), 16 (Revision Planning), 17 (Change Log), 18 (Token & AI Efficiency Reflection).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 9 — Testing & Revision Rubric');

-- Stage 10 — Project Story (Lessons 19-20)
INSERT INTO rubric_templates (name, stage_number, criteria, max_score, rating_scale_json, guidance_notes, is_active)
SELECT
  'Stage 10 — Project Story Rubric',
  10,
  $criteria$[
    {"key":"narrative","label":"Narrative arc (problem → insight → build → impact)","weight":25,"levels":{"1":"Emerging — Random list of activities.","2":"Developing — Mostly chronological with weak through-line.","3":"Proficient — Clear arc with tension and resolution.","4":"Exemplary — Memorable story with hook, conflict, and call-to-action."}},
    {"key":"evidence_artifacts","label":"Evidence + artifacts","weight":25,"levels":{"1":"Emerging — No artifacts shown.","2":"Developing — Screenshots only.","3":"Proficient — Demo + user quotes + metrics.","4":"Exemplary — Live demo + before/after data + endorsements."}},
    {"key":"reflection","label":"Reflection on learning + iteration","weight":25,"levels":{"1":"Emerging — No reflection.","2":"Developing — Surface-level 'I learned a lot'.","3":"Proficient — Specific lessons named with examples.","4":"Exemplary — Honest about failures; ties learning to future plans."}},
    {"key":"delivery","label":"Delivery + Q&A handling","weight":25,"levels":{"1":"Emerging — Reads from slides; cannot answer questions.","2":"Developing — Talks through slides; basic Q&A.","3":"Proficient — Confident delivery; handles most questions.","4":"Exemplary — Engages audience; turns hard questions into deeper insight."}}
  ]$criteria$::jsonb,
  100, v_scale,
  'Use after Worksheets 19 (Final Build Checklist), 20 (Project Story Presentation), 21 (Rehearsal Feedback), 22 (Final Reflection).',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM rubric_templates WHERE name = 'Stage 10 — Project Story Rubric');

END $$;

-- ── 2. CHECKPOINTS — 7 milestones across the 20-lesson arc ────
-- Schema reference (migration 0003):
--   checkpoint_templates(checkpoint_name, checkpoint_number,
--                        description, required_artifacts_json,
--                        required_rubrics_json,
--                        approval_rules_json,
--                        linked_method_stage_ids_json,
--                        active_status)
--
-- required_artifacts_json shape:
--   [{ "artifact_type": "worksheet|url|file",
--      "label": "...",
--      "worksheet_template_ids": [<uuid>, ...] }]
-- required_rubrics_json:
--   [{ "stage_number": <int>, "min_score": <0-100> }]
-- linked_method_stage_ids_json:
--   [<stage_number>, ...]   (we use stage_number; no FK to ids needed)

-- Helper: resolve worksheet UUIDs by title pattern at insert time.
-- We embed a SELECT inside the JSONB so the migration is portable
-- across environments where worksheet UUIDs differ.

DO $$
DECLARE
  ws_ids JSONB;
  ws1 UUID; ws2 UUID; ws3 UUID; ws4 UUID; ws5 UUID; ws6 UUID; ws7 UUID;
  ws8 UUID; ws9 UUID; ws10 UUID; ws11 UUID; ws12 UUID; ws13 UUID; ws14 UUID;
  ws15 UUID; ws16 UUID; ws17 UUID; ws18 UUID; ws19 UUID; ws20 UUID;
  ws21 UUID; ws22 UUID;
BEGIN
  SELECT id INTO ws1  FROM worksheet_templates WHERE title ILIKE 'Worksheet 1:%'  LIMIT 1;
  SELECT id INTO ws2  FROM worksheet_templates WHERE title ILIKE 'Worksheet 2:%'  LIMIT 1;
  SELECT id INTO ws3  FROM worksheet_templates WHERE title ILIKE 'Worksheet 3:%'  LIMIT 1;
  SELECT id INTO ws4  FROM worksheet_templates WHERE title ILIKE 'Worksheet 4:%'  LIMIT 1;
  SELECT id INTO ws5  FROM worksheet_templates WHERE title ILIKE 'Worksheet 5:%'  LIMIT 1;
  SELECT id INTO ws6  FROM worksheet_templates WHERE title ILIKE 'Worksheet 6:%'  LIMIT 1;
  SELECT id INTO ws7  FROM worksheet_templates WHERE title ILIKE 'Worksheet 7:%'  LIMIT 1;
  SELECT id INTO ws8  FROM worksheet_templates WHERE title ILIKE 'Worksheet 8:%'  LIMIT 1;
  SELECT id INTO ws9  FROM worksheet_templates WHERE title ILIKE 'Worksheet 9:%'  LIMIT 1;
  SELECT id INTO ws10 FROM worksheet_templates WHERE title ILIKE 'Worksheet 10:%' LIMIT 1;
  SELECT id INTO ws11 FROM worksheet_templates WHERE title ILIKE 'Worksheet 11:%' LIMIT 1;
  SELECT id INTO ws12 FROM worksheet_templates WHERE title ILIKE 'Worksheet 12:%' LIMIT 1;
  SELECT id INTO ws13 FROM worksheet_templates WHERE title ILIKE 'Worksheet 13:%' LIMIT 1;
  SELECT id INTO ws14 FROM worksheet_templates WHERE title ILIKE 'Worksheet 14:%' LIMIT 1;
  SELECT id INTO ws15 FROM worksheet_templates WHERE title ILIKE 'Worksheet 15:%' LIMIT 1;
  SELECT id INTO ws16 FROM worksheet_templates WHERE title ILIKE 'Worksheet 16:%' LIMIT 1;
  SELECT id INTO ws17 FROM worksheet_templates WHERE title ILIKE 'Worksheet 17:%' LIMIT 1;
  SELECT id INTO ws18 FROM worksheet_templates WHERE title ILIKE 'Worksheet 18:%' LIMIT 1;
  SELECT id INTO ws19 FROM worksheet_templates WHERE title ILIKE 'Worksheet 19:%' LIMIT 1;
  SELECT id INTO ws20 FROM worksheet_templates WHERE title ILIKE 'Worksheet 20:%' LIMIT 1;
  SELECT id INTO ws21 FROM worksheet_templates WHERE title ILIKE 'Worksheet 21:%' LIMIT 1;
  SELECT id INTO ws22 FROM worksheet_templates WHERE title ILIKE 'Worksheet 22:%' LIMIT 1;

  -- Checkpoint 1 — Topic Selected (after Lesson 2)
  INSERT INTO checkpoint_templates (
    checkpoint_name, checkpoint_number, description,
    required_artifacts_json, required_rubrics_json,
    approval_rules_json, linked_method_stage_ids_json, active_status
  )
  SELECT
    'Topic Selected', 1,
    'Student has explored their interests, surfaced 3+ candidate topics, and committed to one problem area to explore further. Due after Lesson 2.',
    jsonb_build_array(
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 1: Personal Interests & Goals Reflection','worksheet_template_ids', jsonb_build_array(ws1)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 2: Problem Statement Sheet','worksheet_template_ids', jsonb_build_array(ws2))
    ),
    '[{"stage_number":1,"min_score":60}]'::jsonb,
    '{"approver_role":"teacher","auto_advance":false,"due_after_lesson":2}'::jsonb,
    '[1,2]'::jsonb,
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM checkpoint_templates WHERE checkpoint_number = 1);

  -- Checkpoint 2 — Problem Validated (after Lesson 4)
  INSERT INTO checkpoint_templates (
    checkpoint_name, checkpoint_number, description,
    required_artifacts_json, required_rubrics_json,
    approval_rules_json, linked_method_stage_ids_json, active_status
  )
  SELECT
    'Problem Validated', 2,
    'Student has interviewed at least 3 people in the target user group and demonstrated the problem exists with evidence. Due after Lesson 4.',
    jsonb_build_array(
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 3: Opportunity Areas Map','worksheet_template_ids', jsonb_build_array(ws3)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 4: User Persona Template','worksheet_template_ids', jsonb_build_array(ws4)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 5: Stakeholder & Context Map','worksheet_template_ids', jsonb_build_array(ws5))
    ),
    '[{"stage_number":2,"min_score":65},{"stage_number":3,"min_score":60}]'::jsonb,
    '{"approver_role":"teacher","auto_advance":false,"due_after_lesson":4}'::jsonb,
    '[2,3]'::jsonb,
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM checkpoint_templates WHERE checkpoint_number = 2);

  -- Checkpoint 3 — MVP Defined (after Lesson 6)
  INSERT INTO checkpoint_templates (
    checkpoint_name, checkpoint_number, description,
    required_artifacts_json, required_rubrics_json,
    approval_rules_json, linked_method_stage_ids_json, active_status
  )
  SELECT
    'MVP Defined', 3,
    'Student has surveyed existing solutions, articulated a value proposition, and scoped a buildable MVP for the next sprint. Due after Lesson 6.',
    jsonb_build_array(
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 6: Existing Solutions Comparison','worksheet_template_ids', jsonb_build_array(ws6)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 7: Gap & Insight Notes','worksheet_template_ids', jsonb_build_array(ws7)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 8: Value Proposition Template','worksheet_template_ids', jsonb_build_array(ws8)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 9: Feature Dump & MVP Matrix','worksheet_template_ids', jsonb_build_array(ws9))
    ),
    '[{"stage_number":4,"min_score":60},{"stage_number":5,"min_score":65},{"stage_number":6,"min_score":65}]'::jsonb,
    '{"approver_role":"teacher","auto_advance":false,"due_after_lesson":6}'::jsonb,
    '[4,5,6]'::jsonb,
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM checkpoint_templates WHERE checkpoint_number = 3);

  -- Checkpoint 4 — Prototype v1 Built (after Lesson 10)
  INSERT INTO checkpoint_templates (
    checkpoint_name, checkpoint_number, description,
    required_artifacts_json, required_rubrics_json,
    approval_rules_json, linked_method_stage_ids_json, active_status
  )
  SELECT
    'Prototype v1 Built', 4,
    'Student has a working first version with the primary user flow end-to-end. Build log + self-test issue log submitted. Due after Lesson 10.',
    jsonb_build_array(
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 10: Prompt Builder for Project Work','worksheet_template_ids', jsonb_build_array(ws10)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 11: User Flow Diagram','worksheet_template_ids', jsonb_build_array(ws11)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 12: Wireframe / Architecture Plan','worksheet_template_ids', jsonb_build_array(ws12)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 13: Build Sprint 1 Checklist','worksheet_template_ids', jsonb_build_array(ws13)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 14: Self-Test & Issue Log','worksheet_template_ids', jsonb_build_array(ws14)),
      jsonb_build_object('artifact_type','url','label','Live demo URL or repository link','worksheet_template_ids', '[]'::jsonb)
    ),
    '[{"stage_number":7,"min_score":60},{"stage_number":8,"min_score":60}]'::jsonb,
    '{"approver_role":"teacher","auto_advance":false,"due_after_lesson":10,"requires_demo":true}'::jsonb,
    '[7,8]'::jsonb,
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM checkpoint_templates WHERE checkpoint_number = 4);

  -- Checkpoint 5 — User Tested (after Lesson 14)
  INSERT INTO checkpoint_templates (
    checkpoint_name, checkpoint_number, description,
    required_artifacts_json, required_rubrics_json,
    approval_rules_json, linked_method_stage_ids_json, active_status
  )
  SELECT
    'User Tested', 5,
    'Student has run structured tests with at least 3 real users from the target group, captured feedback, and triaged it into themes. Due after Lesson 14.',
    jsonb_build_array(
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 15: Peer Review Form','worksheet_template_ids', jsonb_build_array(ws15)),
      jsonb_build_object('artifact_type','file','label','User test session notes / recordings','worksheet_template_ids', '[]'::jsonb)
    ),
    '[{"stage_number":9,"min_score":55}]'::jsonb,
    '{"approver_role":"mentor","auto_advance":false,"due_after_lesson":14,"min_user_count":3}'::jsonb,
    '[9]'::jsonb,
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM checkpoint_templates WHERE checkpoint_number = 5);

  -- Checkpoint 6 — Iterated v2 (after Lesson 18)
  INSERT INTO checkpoint_templates (
    checkpoint_name, checkpoint_number, description,
    required_artifacts_json, required_rubrics_json,
    approval_rules_json, linked_method_stage_ids_json, active_status
  )
  SELECT
    'Iterated v2', 6,
    'Student has produced a revised prototype with documented changes traced to user feedback. Token / AI efficiency reflection submitted. Due after Lesson 18.',
    jsonb_build_array(
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 16: Revision Planning Sheet','worksheet_template_ids', jsonb_build_array(ws16)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 17: Change Log','worksheet_template_ids', jsonb_build_array(ws17)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 18: Token & AI Efficiency Reflection','worksheet_template_ids', jsonb_build_array(ws18)),
      jsonb_build_object('artifact_type','url','label','Updated demo URL / v2 build link','worksheet_template_ids', '[]'::jsonb)
    ),
    '[{"stage_number":9,"min_score":70}]'::jsonb,
    '{"approver_role":"teacher","auto_advance":false,"due_after_lesson":18,"requires_demo":true}'::jsonb,
    '[8,9]'::jsonb,
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM checkpoint_templates WHERE checkpoint_number = 6);

  -- Checkpoint 7 — Showcase Ready (after Lesson 20)
  INSERT INTO checkpoint_templates (
    checkpoint_name, checkpoint_number, description,
    required_artifacts_json, required_rubrics_json,
    approval_rules_json, linked_method_stage_ids_json, active_status
  )
  SELECT
    'Showcase Ready', 7,
    'Final pitch, demo, and project story complete. Reflection on learning + portfolio framing submitted. Due after Lesson 20.',
    jsonb_build_array(
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 19: Final Build Checklist','worksheet_template_ids', jsonb_build_array(ws19)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 20: Project Story Presentation','worksheet_template_ids', jsonb_build_array(ws20)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 21: Rehearsal Feedback Sheet','worksheet_template_ids', jsonb_build_array(ws21)),
      jsonb_build_object('artifact_type','worksheet','label','Worksheet 22: Final Reflection & Portfolio Framing','worksheet_template_ids', jsonb_build_array(ws22)),
      jsonb_build_object('artifact_type','file','label','Pitch deck / final presentation','worksheet_template_ids', '[]'::jsonb),
      jsonb_build_object('artifact_type','url','label','Final live demo URL','worksheet_template_ids', '[]'::jsonb)
    ),
    '[{"stage_number":10,"min_score":70}]'::jsonb,
    '{"approver_role":"teacher","auto_advance":false,"due_after_lesson":20,"showcase_eligible":true}'::jsonb,
    '[10]'::jsonb,
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM checkpoint_templates WHERE checkpoint_number = 7);

END $$;

-- ── 3. Verification queries (commented for reference) ─────────
-- SELECT stage_number, name FROM rubric_templates ORDER BY stage_number;
-- SELECT checkpoint_number, checkpoint_name FROM checkpoint_templates ORDER BY checkpoint_number;
