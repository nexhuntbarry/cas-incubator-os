-- ============================================================
-- CAS Incubator OS — Migration 0008
-- Worksheet Flow: composite indexes for cohort progress queries
-- reviewed_by / reviewed_at / feedback already exist in 0001
-- ============================================================

-- Composite index for cohort progress query (template → submissions by status)
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_template_status
  ON worksheet_submissions (template_id, status);

-- Composite index for student page (student → submissions by status)
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_student_status
  ON worksheet_submissions (student_user_id, status);

-- Index on linked_method_stage_id for stage-based worksheet lookups
CREATE INDEX IF NOT EXISTS idx_worksheet_templates_linked_stage
  ON worksheet_templates (linked_method_stage_id)
  WHERE linked_method_stage_id IS NOT NULL;
