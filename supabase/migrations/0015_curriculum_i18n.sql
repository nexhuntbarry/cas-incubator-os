-- ============================================================
-- CAS Incubator OS — Migration 0015
-- Bilingual content (zh + en) for curriculum, worksheets,
-- rubrics, checkpoints, and method stage definitions.
--
-- Strategy: each translatable table gets an `i18n JSONB` column
-- holding `{ "<locale>": { ...field-by-field overrides... } }`.
-- Application reads `i18n[locale]?.<field> ?? row.<field>` so
-- existing data keeps rendering when no translation is present.
--
-- All ALTERs are idempotent via IF NOT EXISTS.
-- ============================================================

-- ── 1. curriculum_assets ──────────────────────────────────────
-- Translatable fields: title, description, content_md, metadata
ALTER TABLE curriculum_assets
  ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_curriculum_assets_i18n
  ON curriculum_assets USING GIN (i18n);

COMMENT ON COLUMN curriculum_assets.i18n IS
  'Per-locale overrides. Shape: { "zh": { "title": "...", "description": "...", "content_md": "...", "metadata": { ... } }, "en": { ... } }. Reader falls back to top-level columns when an override is missing.';

-- ── 2. worksheet_templates ────────────────────────────────────
-- Translatable fields: title, description, fields_schema (per-field label/helpText/options)
ALTER TABLE worksheet_templates
  ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_worksheet_templates_i18n
  ON worksheet_templates USING GIN (i18n);

COMMENT ON COLUMN worksheet_templates.i18n IS
  'Per-locale overrides. Shape: { "zh": { "title": "...", "description": "...", "fields_schema": [ { "key": "...", "label": "...", "helpText": "...", "options": [...] }, ... ] }, "en": { ... } }. Field merging is by `key`.';

-- ── 3. rubric_templates ───────────────────────────────────────
-- Translatable fields: name, guidance_notes, criteria (label + levels.1-4)
ALTER TABLE rubric_templates
  ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_rubric_templates_i18n
  ON rubric_templates USING GIN (i18n);

COMMENT ON COLUMN rubric_templates.i18n IS
  'Per-locale overrides. Shape: { "zh": { "name": "...", "guidance_notes": "...", "criteria": [ { "key": "...", "label": "...", "levels": { "1": "...", "2": "...", "3": "...", "4": "..." } }, ... ] }, "en": { ... } }. Criterion merging is by `key`.';

-- ── 4. checkpoint_templates ───────────────────────────────────
-- Translatable fields: checkpoint_name, description, requirements, etc.
ALTER TABLE checkpoint_templates
  ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_checkpoint_templates_i18n
  ON checkpoint_templates USING GIN (i18n);

COMMENT ON COLUMN checkpoint_templates.i18n IS
  'Per-locale overrides. Shape: { "zh": { "checkpoint_name": "...", "description": "...", "requirements": [ ... ] }, "en": { ... } }.';

-- ── 5. method_stage_definitions ───────────────────────────────
-- Translatable fields: name, description, key_questions, deliverables, etc.
ALTER TABLE method_stage_definitions
  ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_method_stage_definitions_i18n
  ON method_stage_definitions USING GIN (i18n);

COMMENT ON COLUMN method_stage_definitions.i18n IS
  'Per-locale overrides. Shape: { "zh": { "name": "...", "description": "...", "key_questions": [ ... ], "deliverables": [ ... ] }, "en": { ... } }.';

-- ── 6. Helper view (optional convenience) ─────────────────────
-- Application code is expected to handle locale fallback in TypeScript.
-- See lib/i18n-content.ts for the `localized()` helper.
