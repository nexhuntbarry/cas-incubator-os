'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Cohort {
  id: string;
  name: string;
}

export default function CreateClassCodeForm({ cohorts }: { cohorts: Cohort[] }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? "");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/admin/class-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cohort_id: cohortId,
        max_uses: maxUses ? Number(maxUses) : null,
        expires_at: expiresAt || null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data.code);
      router.refresh();
    } else {
      setError(data.error ?? "Failed to create code");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5">
      <h3 className="text-sm font-semibold text-soft-gray/80 mb-4">
        {t("classCodes.generate")}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="block text-xs text-soft-gray/50">{t("cohorts.title")}</label>
          <select
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
            required
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id} className="bg-deep-navy">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-soft-gray/50">{t("classCodes.maxUses")}</label>
          <input
            type="number"
            min="1"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="∞"
            className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-soft-gray/50">{t("classCodes.expires")}</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
          />
        </div>
        <button
          type="submit"
          disabled={loading || cohorts.length === 0}
          className="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "…" : t("classCodes.generate")}
        </button>
      </form>
      {result && (
        <p className="mt-3 text-sm text-status-success">
          Generated: <code className="font-mono text-vivid-teal">{result}</code>
        </p>
      )}
      {error && <p className="mt-3 text-sm text-status-error">{error}</p>}
    </div>
  );
}
