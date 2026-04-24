-- ============================================================
-- CAS Incubator OS — Migration 0009
-- Track project work URLs (live product, renamed URL fields, update timestamps)
-- ============================================================

-- Add live_product_url (new concept — actual deployed product link)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS live_product_url TEXT;

-- Add canonical URL field names (schema alignment with Phase 1 spec)
-- The Phase 2 migration added github_url, figma_url, presentation_url
-- We add the canonical names and keep the old ones for backward compat
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
  ADD COLUMN IF NOT EXISTS figma_or_design_url TEXT,
  ADD COLUMN IF NOT EXISTS presentation_slide_url TEXT;

-- Track when URLs were last updated and by whom
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS last_url_update_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_url_update_by UUID REFERENCES users(id);

-- Index for admin "has live product" filter
CREATE INDEX IF NOT EXISTS idx_projects_has_live_product
  ON projects((live_product_url IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_projects_last_url_update
  ON projects(last_url_update_at DESC)
  WHERE last_url_update_at IS NOT NULL;
