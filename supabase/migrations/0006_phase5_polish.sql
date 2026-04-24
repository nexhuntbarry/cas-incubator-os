-- Phase 5: Polish — onboarded_at for first-run tour, perf indexes

-- Add onboarded_at to users table (tracks when user completed the first-run welcome tour)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ DEFAULT NULL;

-- Performance indexes for commonly queried columns

-- notifications: user_id + read_at (used for unread count and listing)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

-- risk_flags: status queries
CREATE INDEX IF NOT EXISTS idx_risk_flags_status
  ON risk_flags (status)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_risk_flags_student_user
  ON risk_flags (student_user_id, status);

-- ai_usage_log: date range queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_created
  ON ai_usage_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_route
  ON ai_usage_log (user_id, route);

-- enrollment_records: active student lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_records_student_status
  ON enrollment_records (student_user_id, status);

-- worksheet_submissions: project + date range
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_project_updated
  ON worksheet_submissions (project_id, updated_at DESC);
