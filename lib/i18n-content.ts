/**
 * Locale-aware content reader for DB rows that store bilingual overrides
 * in an `i18n` JSONB column (see migration 0015).
 *
 * Convention:
 *   row.i18n = { zh: { title: "...", description: "..." }, en: { ... } }
 *
 * Usage:
 *   const title = localizedField(row, "title", locale);
 *   const fields = localizedArrayByKey(row.fields_schema, row.i18n?.[locale]?.fields_schema, "key");
 */
import type { Locale } from "@/i18n/config";

type WithI18n<T> = T & { i18n?: Record<string, Partial<T>> | null };

/** Read a single field with locale fallback to the base column. */
export function localizedField<T extends Record<string, unknown>, K extends keyof T>(
  row: WithI18n<T>,
  field: K,
  locale: Locale,
): T[K] {
  const override = row.i18n?.[locale]?.[field];
  return (override ?? row[field]) as T[K];
}

/**
 * Merge an array of objects with a per-locale override array, matching by `keyField`.
 * Useful for `worksheet_templates.fields_schema`, `rubric_templates.criteria`, etc.
 */
export function localizedArrayByKey<T extends Record<string, unknown>>(
  base: T[] | null | undefined,
  override: T[] | null | undefined,
  keyField: keyof T,
): T[] {
  if (!base) return [];
  if (!override || override.length === 0) return base;
  const overrideMap = new Map<unknown, T>();
  for (const item of override) overrideMap.set(item[keyField], item);
  return base.map((item) => {
    const ov = overrideMap.get(item[keyField]);
    return ov ? { ...item, ...ov } : item;
  });
}

/** Convenience: pick a localized object payload from a row's i18n column. */
export function localizedPayload<T extends object>(
  i18n: Record<string, T> | null | undefined,
  locale: Locale,
): T | undefined {
  return i18n?.[locale];
}
