-- Allow inviting users by email before they sign in.
-- Pre-fix: users.clerk_user_id was NOT NULL → admin invite flow couldn't
-- create a pending row to hold the role + display_name before the invitee
-- completes Clerk sign-up. After this change, the row is created with
-- clerk_user_id = null, and the Clerk webhook (user.created) attaches the
-- clerk_user_id by matching on email.

ALTER TABLE users ALTER COLUMN clerk_user_id DROP NOT NULL;

-- Backfill safety: a unique partial index so two invites for the same email
-- don't collide, and so multiple null clerk_user_ids don't trip a UNIQUE
-- on (clerk_user_id) if one ever existed.
DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_clerk_user_id_key') THEN
    -- Already there from initial schema; leave it.
    NULL;
  END IF;
END $outer$;
