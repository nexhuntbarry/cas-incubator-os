# Running Supabase Migrations

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Linked to the correct project: `supabase link --project-ref <your-project-ref>`

## Run all pending migrations

```bash
supabase db push
```

This applies any migration files in `supabase/migrations/` that haven't been run yet.

## Migration history

| File | Description |
|------|-------------|
| `0001_init_schema.sql` | Phase 1 — initial schema |
| `0002_phase2_add_json_fields.sql` | Phase 2 — JSON field additions |
| `0003_phase3_polish.sql` | Phase 3 — polish |
| `0004_phase4_comms_risks_showcase.sql` | Phase 4 — comms, risks, showcase |
| `0005_fix_student_profiles_unique.sql` | Bugfix — student_profiles unique constraint |
| `0006_phase5_polish.sql` | Phase 5 — `onboarded_at`, performance indexes |

## After running migrations

1. Verify in Supabase Dashboard → Table Editor that new columns appear.
2. Run the smoke test: `BASE_URL=https://incubator.nexhunt.xyz npx tsx scripts/smoke-test.ts`

## Rollback

Supabase does not auto-rollback migrations. To undo:
1. Write a reverse migration file (e.g. `DROP COLUMN`, `DROP INDEX`)
2. Apply it with `supabase db push`
