-- ============================================================
-- CAS Incubator OS — Phase 2 Migration
-- Add JSONB fields for AI intake summary + project classification
-- ============================================================

-- Add intake summary to student_profiles
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS intake_summary_json    JSONB,
  ADD COLUMN IF NOT EXISTS intake_completed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grade_level            TEXT,
  ADD COLUMN IF NOT EXISTS location               TEXT,
  ADD COLUMN IF NOT EXISTS intended_major_or_direction TEXT,
  ADD COLUMN IF NOT EXISTS ai_experience_level    TEXT,
  ADD COLUMN IF NOT EXISTS competition_goals      TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_goals        TEXT;

-- Add AI classification + extended fields to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS ai_classification_json JSONB,
  ADD COLUMN IF NOT EXISTS mvp_definition         TEXT,
  ADD COLUMN IF NOT EXISTS github_url             TEXT,
  ADD COLUMN IF NOT EXISTS figma_url              TEXT,
  ADD COLUMN IF NOT EXISTS demo_video_url         TEXT,
  ADD COLUMN IF NOT EXISTS presentation_url       TEXT,
  ADD COLUMN IF NOT EXISTS screenshot_gallery_urls JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS project_direction_category TEXT,
  ADD COLUMN IF NOT EXISTS student_profile_id     UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stage_status           TEXT NOT NULL DEFAULT 'not_started';

-- Add status to student_method_progress
ALTER TABLE student_method_progress
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS evidence_urls JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS student_notes TEXT;

-- Index for intake lookup
CREATE INDEX IF NOT EXISTS idx_student_profiles_intake ON student_profiles(user_id) WHERE intake_completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_student_profile ON projects(student_profile_id);
