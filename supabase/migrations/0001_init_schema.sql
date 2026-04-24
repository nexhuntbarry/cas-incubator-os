-- ============================================================
-- CAS Incubator OS — Initial Schema
-- Phase 1 Foundation
-- RLS will be enabled in Phase 2
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'super_admin', 'teacher', 'mentor', 'student', 'parent'
);

CREATE TYPE enrollment_status AS ENUM (
  'pending', 'active', 'completed', 'withdrawn', 'suspended'
);

CREATE TYPE project_status AS ENUM (
  'draft', 'active', 'paused', 'completed', 'archived'
);

CREATE TYPE submission_status AS ENUM (
  'not_started', 'in_progress', 'submitted', 'reviewed', 'revision_requested'
);

CREATE TYPE checkpoint_status AS ENUM (
  'locked', 'unlocked', 'submitted', 'approved', 'rejected'
);

CREATE TYPE risk_level AS ENUM (
  'low', 'medium', 'high', 'critical'
);

CREATE TYPE asset_type AS ENUM (
  'video', 'pdf', 'slide', 'worksheet', 'template', 'link', 'other'
);

CREATE TYPE showcase_visibility AS ENUM (
  'private', 'cohort', 'school', 'public'
);

-- ── Utility ──────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. users ─────────────────────────────────────────────────

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  clerk_user_id   TEXT UNIQUE NOT NULL,
  email           TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'student',
  avatar_url      TEXT,
  timezone        TEXT NOT NULL DEFAULT 'Asia/Taipei',
  locale          TEXT NOT NULL DEFAULT 'zh',
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. student_profiles ──────────────────────────────────────

CREATE TABLE student_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade           TEXT,
  school_name     TEXT,
  birth_year      INT,
  interests       JSONB NOT NULL DEFAULT '[]',
  bio             TEXT,
  goals           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. parent_student_links ───────────────────────────────────

CREATE TABLE parent_student_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  parent_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_given   BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_user_id, student_user_id)
);

-- ── 4. staff_profiles ────────────────────────────────────────

CREATE TABLE staff_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT,
  bio             TEXT,
  expertise_tags  JSONB NOT NULL DEFAULT '[]',
  linkedin_url    TEXT,
  available       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. programs ───────────────────────────────────────────────

CREATE TABLE programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  name            TEXT NOT NULL,
  description     TEXT,
  duration_weeks  INT,
  settings        JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. cohorts ────────────────────────────────────────────────

CREATE TABLE cohorts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  start_date      DATE,
  end_date        DATE,
  max_students    INT,
  settings        JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. cohort_staff_assignments ───────────────────────────────

CREATE TABLE cohort_staff_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  cohort_id       UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            user_role NOT NULL,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cohort_id, user_id)
);

-- ── 8. class_codes ────────────────────────────────────────────

CREATE TABLE class_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  cohort_id       UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  code            TEXT UNIQUE NOT NULL,
  max_uses        INT,
  use_count       INT NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. enrollment_records ─────────────────────────────────────

CREATE TABLE enrollment_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  cohort_id       UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_code_id   UUID REFERENCES class_codes(id) ON DELETE SET NULL,
  status          enrollment_status NOT NULL DEFAULT 'pending',
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  UNIQUE (cohort_id, student_user_id)
);

-- ── 10. curriculum_assets ─────────────────────────────────────

CREATE TABLE curriculum_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  program_id      UUID REFERENCES programs(id) ON DELETE SET NULL,
  stage_number    INT,
  title           TEXT NOT NULL,
  asset_type      asset_type NOT NULL DEFAULT 'other',
  url             TEXT,
  blob_key        TEXT,
  description     TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  sort_order      INT NOT NULL DEFAULT 0,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 11. method_stage_definitions ─────────────────────────────

CREATE TABLE method_stage_definitions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_number          INT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  expected_outputs_json JSONB NOT NULL DEFAULT '[]',
  guiding_questions     JSONB NOT NULL DEFAULT '[]',
  sort_order            INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. project_type_definitions ─────────────────────────────

CREATE TABLE project_type_definitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  examples        JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 13. worksheet_templates ───────────────────────────────────

CREATE TABLE worksheet_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  stage_number    INT REFERENCES method_stage_definitions(stage_number) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  fields_schema   JSONB NOT NULL DEFAULT '[]',
  version         INT NOT NULL DEFAULT 1,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 14. worksheet_submissions ─────────────────────────────────

CREATE TABLE worksheet_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  template_id     UUID NOT NULL REFERENCES worksheet_templates(id) ON DELETE CASCADE,
  project_id      UUID, -- FK added after projects table
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL DEFAULT '{}',
  status          submission_status NOT NULL DEFAULT 'not_started',
  submitted_at    TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  feedback        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 15. rubric_templates ──────────────────────────────────────

CREATE TABLE rubric_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  stage_number    INT REFERENCES method_stage_definitions(stage_number) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  criteria        JSONB NOT NULL DEFAULT '[]',
  max_score       INT NOT NULL DEFAULT 100,
  version         INT NOT NULL DEFAULT 1,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 16. rubric_evaluations ────────────────────────────────────

CREATE TABLE rubric_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  rubric_id       UUID NOT NULL REFERENCES rubric_templates(id) ON DELETE CASCADE,
  project_id      UUID, -- FK added after projects table
  evaluator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scores          JSONB NOT NULL DEFAULT '{}',
  total_score     INT,
  feedback        TEXT,
  evaluated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 17. projects ──────────────────────────────────────────────

CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  enrollment_id   UUID NOT NULL REFERENCES enrollment_records(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_type_id UUID REFERENCES project_type_definitions(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  tagline         TEXT,
  description     TEXT,
  problem_statement TEXT,
  target_user     TEXT,
  value_proposition TEXT,
  status          project_status NOT NULL DEFAULT 'draft',
  current_stage   INT NOT NULL DEFAULT 1,
  cover_image_url TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add deferred FKs now that projects exists
ALTER TABLE worksheet_submissions
  ADD CONSTRAINT fk_ws_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE rubric_evaluations
  ADD CONSTRAINT fk_re_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- ── 18. student_method_progress ───────────────────────────────

CREATE TABLE student_method_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_number    INT NOT NULL REFERENCES method_stage_definitions(stage_number),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  UNIQUE (project_id, stage_number)
);

-- ── 19. checkpoints ───────────────────────────────────────────

CREATE TABLE checkpoints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_number    INT NOT NULL REFERENCES method_stage_definitions(stage_number),
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        TIMESTAMPTZ,
  status          checkpoint_status NOT NULL DEFAULT 'locked',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 20. checkpoint_submissions ────────────────────────────────

CREATE TABLE checkpoint_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  checkpoint_id   UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         JSONB NOT NULL DEFAULT '{}',
  status          submission_status NOT NULL DEFAULT 'not_started',
  submitted_at    TIMESTAMPTZ,
  reviewer_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  feedback        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 21. mentor_notes ──────────────────────────────────────────

CREATE TABLE mentor_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mentor_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_private      BOOLEAN NOT NULL DEFAULT FALSE,
  session_date    DATE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 22. parent_updates ────────────────────────────────────────

CREATE TABLE parent_updates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  channel         TEXT NOT NULL DEFAULT 'email',
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at         TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}'
);

-- ── 23. risk_flags ────────────────────────────────────────────

CREATE TABLE risk_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flagged_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  risk_level      risk_level NOT NULL DEFAULT 'low',
  reason          TEXT NOT NULL,
  resolved        BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 24. showcase_records ──────────────────────────────────────

CREATE TABLE showcase_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  tagline         TEXT,
  description     TEXT,
  demo_url        TEXT,
  video_url       TEXT,
  cover_image_url TEXT,
  slides_url      TEXT,
  visibility      showcase_visibility NOT NULL DEFAULT 'private',
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  views_count     INT NOT NULL DEFAULT 0,
  likes_count     INT NOT NULL DEFAULT 0,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_enrollment_records_student ON enrollment_records(student_user_id);
CREATE INDEX idx_enrollment_records_cohort ON enrollment_records(cohort_id);
CREATE INDEX idx_projects_student ON projects(student_user_id);
CREATE INDEX idx_projects_enrollment ON projects(enrollment_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_current_stage ON projects(current_stage);
CREATE INDEX idx_student_method_progress_project ON student_method_progress(project_id);
CREATE INDEX idx_checkpoints_project ON checkpoints(project_id);
CREATE INDEX idx_mentor_notes_project ON mentor_notes(project_id);
CREATE INDEX idx_risk_flags_project ON risk_flags(project_id);
CREATE INDEX idx_risk_flags_resolved ON risk_flags(resolved);
CREATE INDEX idx_showcase_records_project ON showcase_records(project_id);
CREATE INDEX idx_showcase_records_visibility ON showcase_records(visibility);
