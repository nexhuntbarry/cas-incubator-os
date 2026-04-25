/**
 * Timezone-aware date formatters.
 * Uses the browser's Intl.DateTimeFormat so dates display in the user's local timezone.
 * Falls back gracefully on invalid inputs.
 */

/**
 * Format an ISO date string to a human-readable date in the user's local timezone.
 * e.g. "2026-01-15T08:00:00Z" → "Jan 15, 2026"
 */
export function formatDate(iso: string | null | undefined, locale?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format an ISO date string to a relative time string.
 * e.g. "2 days ago", "just now"
 * Falls back to formatDate for older dates.
 */
export function formatRelative(iso: string | null | undefined, locale?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(iso, locale);
}

/**
 * Format an ISO date string to a short date (YYYY-MM-DD) in local time.
 * Replaces the .slice(0, 10) anti-pattern.
 */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
