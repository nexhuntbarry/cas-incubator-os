-- ============================================================
-- CAS Incubator OS — Migration 0018
-- Follow-up to 0017: fix stale "Lesson N:" prefix in titles.
--
-- 0017 shifted lesson_number for old L8..L18 → L9..L19 but did
-- not update the "Lesson N:" text embedded in each row's title
-- string. This migration rewrites the title prefix to match the
-- new lesson_number.
--
-- Idempotent: each UPDATE is by primary content match.
-- ============================================================

DO $outer$
DECLARE
  v_program_id UUID;
BEGIN
  SELECT id INTO v_program_id
  FROM programs
  WHERE name = $$CAS Incubator — High School Project Incubator (Part 1)$$
  LIMIT 1;

  IF v_program_id IS NULL THEN
    RAISE NOTICE 'Program not found — skipping 0018.';
    RETURN;
  END IF;

  UPDATE curriculum_assets SET title = 'Lesson 9: Prompting for Serious Project Work'
  WHERE program_id = v_program_id AND lesson_number = 9
    AND title LIKE 'Lesson 8: Prompting%';

  UPDATE curriculum_assets SET title = 'Lesson 10: User Flow and System Logic'
  WHERE program_id = v_program_id AND lesson_number = 10
    AND title LIKE 'Lesson 9: User Flow%';

  UPDATE curriculum_assets SET title = 'Lesson 11: Wireframe / Architecture Planning'
  WHERE program_id = v_program_id AND lesson_number = 11
    AND title LIKE 'Lesson 10: Wireframe%';

  UPDATE curriculum_assets SET title = 'Lesson 12: CAS Build Sprint 1'
  WHERE program_id = v_program_id AND lesson_number = 12
    AND title LIKE 'Lesson 11: CAS Build Sprint 1%';

  UPDATE curriculum_assets SET title = 'Lesson 13: Self-Test, Debug, and Diagnose'
  WHERE program_id = v_program_id AND lesson_number = 13
    AND title LIKE 'Lesson 12: Self-Test%';

  UPDATE curriculum_assets SET title = 'Lesson 14: Structured Peer Review'
  WHERE program_id = v_program_id AND lesson_number = 14
    AND title LIKE 'Lesson 13: Structured Peer Review%';

  UPDATE curriculum_assets SET title = 'Lesson 15: Turn Feedback into Revision Goals'
  WHERE program_id = v_program_id AND lesson_number = 15
    AND title LIKE 'Lesson 14: Turn Feedback%';

  UPDATE curriculum_assets SET title = 'Lesson 16: CAS Build Sprint 2'
  WHERE program_id = v_program_id AND lesson_number = 16
    AND title LIKE 'Lesson 15: CAS Build Sprint 2%';

  UPDATE curriculum_assets SET title = 'Lesson 18: Strengthen Clarity, Feature Priorities, and UX'
  WHERE program_id = v_program_id AND lesson_number = 18
    AND title LIKE 'Lesson 17: Strengthen Clarity%';

  UPDATE curriculum_assets SET title = 'Lesson 19: Build the Project Story'
  WHERE program_id = v_program_id AND lesson_number = 19
    AND title LIKE 'Lesson 18: Build the Project Story%';
END $outer$;
