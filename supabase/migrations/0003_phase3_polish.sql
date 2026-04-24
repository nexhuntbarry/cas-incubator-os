-- ============================================================
-- CAS Incubator OS — Phase 3 Migration
-- Worksheet/rubric polish, notifications stub, indexes
-- ============================================================

-- ── Add missing columns to worksheet_submissions ─────────────

ALTER TABLE worksheet_submissions
  ADD COLUMN IF NOT EXISTS version_number      INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ai_summary_json     JSONB,
  ADD COLUMN IF NOT EXISTS feedback_summary    TEXT;

-- ── Add rating_scale + guidance to rubric_templates ──────────

ALTER TABLE rubric_templates
  ADD COLUMN IF NOT EXISTS rating_scale_json   JSONB NOT NULL DEFAULT '{"min":1,"max":5,"labels":{"1":"Poor","2":"Below Average","3":"Average","4":"Good","5":"Excellent"}}',
  ADD COLUMN IF NOT EXISTS guidance_notes      TEXT,
  ADD COLUMN IF NOT EXISTS linked_project_types JSONB NOT NULL DEFAULT '[]';

-- Add scores_json and comments_json aliases for rubric_evaluations
ALTER TABLE rubric_evaluations
  ADD COLUMN IF NOT EXISTS scores_json         JSONB,
  ADD COLUMN IF NOT EXISTS comments_json       JSONB,
  ADD COLUMN IF NOT EXISTS approved_status     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS evaluator_staff_id  UUID REFERENCES users(id) ON DELETE SET NULL;

-- ── Add lesson_number and visibility_scope to curriculum_assets ─

ALTER TABLE curriculum_assets
  ADD COLUMN IF NOT EXISTS lesson_number       INT,
  ADD COLUMN IF NOT EXISTS visibility_scope    JSONB NOT NULL DEFAULT '["teacher","mentor","student"]',
  ADD COLUMN IF NOT EXISTS uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- ── Expand mentor_notes for Phase 3 ──────────────────────────

ALTER TABLE mentor_notes
  ADD COLUMN IF NOT EXISTS note_type            TEXT NOT NULL DEFAULT 'check_in',
  ADD COLUMN IF NOT EXISTS note_body            TEXT,
  ADD COLUMN IF NOT EXISTS recommended_next_step TEXT,
  ADD COLUMN IF NOT EXISTS escalation_flag      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS student_profile_id   UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS staff_profile_id     UUID REFERENCES staff_profiles(id) ON DELETE SET NULL;

-- ── Add checkpoint_template support ──────────────────────────
-- checkpoints in schema are per-project; we need program-level templates

CREATE TABLE IF NOT EXISTS checkpoint_templates (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                     UUID,
  program_id                 UUID REFERENCES programs(id) ON DELETE CASCADE,
  checkpoint_name            TEXT NOT NULL,
  checkpoint_number          INT NOT NULL,
  description                TEXT,
  required_artifacts_json    JSONB NOT NULL DEFAULT '[]',
  required_rubrics_json      JSONB NOT NULL DEFAULT '[]',
  approval_rules_json        JSONB NOT NULL DEFAULT '{}',
  linked_method_stage_ids_json JSONB NOT NULL DEFAULT '[]',
  active_status              BOOLEAN NOT NULL DEFAULT TRUE,
  created_by                 UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Extend worksheet_templates with phase 3 fields ───────────

ALTER TABLE worksheet_templates
  ADD COLUMN IF NOT EXISTS instructions            TEXT,
  ADD COLUMN IF NOT EXISTS linked_lesson_number    INT,
  ADD COLUMN IF NOT EXISTS linked_method_stage_id  UUID REFERENCES method_stage_definitions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS linked_project_types    JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS required_status         TEXT NOT NULL DEFAULT 'optional',
  ADD COLUMN IF NOT EXISTS scoring_type            TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS template_type           TEXT NOT NULL DEFAULT 'general';

-- ── Notifications stub ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}',
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_student
  ON worksheet_submissions(student_user_id);

CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_status
  ON worksheet_submissions(status);

CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_template
  ON worksheet_submissions(template_id);

CREATE INDEX IF NOT EXISTS idx_checkpoint_submissions_status
  ON checkpoint_submissions(status);

CREATE INDEX IF NOT EXISTS idx_mentor_notes_student
  ON mentor_notes(student_user_id);

CREATE INDEX IF NOT EXISTS idx_mentor_notes_escalation
  ON mentor_notes(escalation_flag) WHERE escalation_flag = TRUE;

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
  ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_curriculum_assets_lesson
  ON curriculum_assets(lesson_number);

CREATE INDEX IF NOT EXISTS idx_rubric_evaluations_student
  ON rubric_evaluations(student_user_id);

CREATE INDEX IF NOT EXISTS idx_checkpoint_templates_program
  ON checkpoint_templates(program_id);
