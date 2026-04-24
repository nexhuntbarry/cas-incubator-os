-- ============================================================
-- Seed: Phase 1 admin test data
-- One program, one cohort, one pre-generated class code
-- ============================================================

-- Insert test program
INSERT INTO programs (id, name, description, duration_weeks, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'CAS Incubator Pilot',
  'First pilot program for CAS Incubator OS — 10-stage project-based learning.',
  4,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Insert test cohort
INSERT INTO cohorts (id, program_id, name, start_date, end_date, max_students, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '2026 TW Pilot Cohort',
  '2026-08-01',
  '2026-08-31',
  10,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Insert pre-generated class code
INSERT INTO class_codes (id, cohort_id, code, max_uses, use_count, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'CAS-INC-TEST-0001',
  50,
  0,
  TRUE
)
ON CONFLICT (id) DO NOTHING;
