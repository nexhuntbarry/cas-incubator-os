-- Phase 1 bugfix: student_profiles.user_id needs UNIQUE for upsert ON CONFLICT
-- Each user has exactly one student_profile row.

ALTER TABLE student_profiles
  ADD CONSTRAINT student_profiles_user_id_unique UNIQUE (user_id);
