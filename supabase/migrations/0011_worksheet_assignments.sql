-- Migration 0011: Worksheet Assignment Infrastructure
-- Idempotent: uses CREATE TABLE IF NOT EXISTS and IF NOT EXISTS column guards

CREATE TABLE IF NOT EXISTS worksheet_assignments (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references worksheet_templates(id) on delete cascade,
  cohort_id uuid references cohorts(id) on delete cascade,
  -- Either cohort_id (whole class) OR student_user_ids (specific students)
  student_user_ids jsonb default '[]',  -- array of user_ids when targeting specific students
  lesson_number integer,  -- linked lesson if assigned from lesson view
  assigned_by uuid not null references users(id) on delete cascade,
  due_date timestamptz not null,
  open_date timestamptz default now(),
  instructions_override text,  -- teacher can add note for this assignment
  status text default 'open' check (status in ('open','closed','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_worksheet_assignments_cohort ON worksheet_assignments(cohort_id, status);
CREATE INDEX IF NOT EXISTS idx_worksheet_assignments_template ON worksheet_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_assignments_due ON worksheet_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_worksheet_assignments_assigned_by ON worksheet_assignments(assigned_by);

ALTER TABLE worksheet_submissions ADD COLUMN IF NOT EXISTS assignment_id uuid references worksheet_assignments(id) on delete set null;
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_assignment ON worksheet_submissions(assignment_id);
