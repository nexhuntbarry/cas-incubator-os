'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/admin/Shell";
import Input from "@/components/forms/Input";
import { useTranslations } from "next-intl";

export default function NewProgramPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || null,
        duration_weeks: durationWeeks ? Number(durationWeeks) : null,
      }),
    });
    if (res.ok) {
      router.push("/admin/programs");
    } else {
      const data = await res.json();
      setError(data.error ?? "Error creating program");
    }
    setLoading(false);
  }

  return (
    <Shell title={t("programs.new")}>
      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("programs.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft-gray/70">
              {t("programs.description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray placeholder-soft-gray/30 focus:outline-none focus:border-electric-blue/60 transition-colors text-sm resize-none"
            />
          </div>
          <Input
            label={t("programs.durationWeeks")}
            type="number"
            min="1"
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(e.target.value)}
          />
          {error && <p className="text-status-error text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "…" : t("create")}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2 border border-white/10 text-soft-gray/70 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
