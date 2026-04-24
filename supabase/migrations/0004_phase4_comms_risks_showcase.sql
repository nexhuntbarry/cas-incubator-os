-- ============================================================
-- CAS Incubator OS — Phase 4 Migration
-- Parent Comms, Risk Flags, Showcase, AI Usage Log
-- ============================================================

-- ── Extend parent_updates to match Phase 4 schema ────────────

-- Add new columns if not present
ALTER TABLE parent_updates
  ADD COLUMN IF NOT EXISTS student_profile_id    UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS generated_by_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS update_type           TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS sent_status           TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sent_at_ts            TIMESTAMPTZ;

-- ── Extend risk_flags to match Phase 4 schema ────────────────

ALTER TABLE risk_flags
  ADD COLUMN IF NOT EXISTS flag_type             TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS severity              TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS description           TEXT,
  ADD COLUMN IF NOT EXISTS raised_by_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status                TEXT NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS assigned_to_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolution_notes      TEXT,
  ADD COLUMN IF NOT EXISTS student_profile_id    UUID REFERENCES student_profiles(id) ON DELETE SET NULL;

-- ── Extend showcase_records to match Phase 4 schema ──────────

ALTER TABLE showcase_records
  ADD COLUMN IF NOT EXISTS presentation_link     TEXT,
  ADD COLUMN IF NOT EXISTS repo_link             TEXT,
  ADD COLUMN IF NOT EXISTS screenshots_json      JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS public_share_token    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS public_share_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS feedback_received_json JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS student_profile_id    UUID REFERENCES student_profiles(id) ON DELETE SET NULL;

-- ── AI Usage Log ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  route          TEXT NOT NULL,
  tokens_input   INT NOT NULL DEFAULT 0,
  tokens_output  INT NOT NULL DEFAULT 0,
  model          TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_risk_flags_status_severity
  ON risk_flags(status, severity);

CREATE INDEX IF NOT EXISTS idx_parent_updates_student_sent
  ON parent_updates(student_user_id, sent_status);

CREATE INDEX IF NOT EXISTS idx_showcase_records_token
  ON showcase_records(public_share_token) WHERE public_share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user
  ON ai_usage_log(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_created
  ON ai_usage_log(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_route
  ON ai_usage_log(route);
