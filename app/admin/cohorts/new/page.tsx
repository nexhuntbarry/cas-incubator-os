'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "@/components/admin/Shell";
import Input from "@/components/forms/Input";
import { useTranslations } from "next-intl";

interface Program {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

function NewCohortForm() {
  const t = useTranslations("admin");
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProgram = searchParams.get("program_id") ?? "";

  const [name, setName] = useState("");
  const [programId, setProgramId] = useState(defaultProgram);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/programs")
      .then((r) => r.json())
      .then((data: Program[]) => {
        setPrograms(Array.isArray(data) ? data : []);
      })
      .catch(() => setPrograms([]))
      .finally(() => setProgramsLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        program_id: programId,
        start_date: startDate || null,
        end_date: endDate || null,
        max_students: maxStudents ? Number(maxStudents) : null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/cohorts/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Error creating cohort");
    }
    setLoading(false);
  }

  return (
    <Shell title={t("cohorts.new")} introKey="admin.newCohort">
      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("cohorts.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="text-xs text-soft-gray/60 font-medium uppercase tracking-wider">
              {t("cohorts.programId")}
            </label>
            {programsLoading ? (
              <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ) : programs.length > 0 ? (
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-soft-gray text-sm focus:outline-none focus:border-electric-blue/50 focus:bg-white/8 transition-colors"
              >
                <option value="">Select a program…</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.start_date ? ` (${p.start_date.slice(0, 10)}` : ""}
                    {p.start_date && p.end_date ? ` – ${p.end_date.slice(0, 10)})` : p.start_date ? ")" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-soft-gray/40">
                  No programs found.{" "}
                  <a href="/admin/programs/new" className="text-electric-blue hover:underline">
                    Create a program first
                  </a>
                  , or enter the UUID manually:
                </p>
                <Input
                  label=""
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  required
                />
              </div>
            )}
          </div>
          <Input
            label={t("cohorts.startDate")}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t("cohorts.endDate")}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            label={t("cohorts.maxStudents")}
            type="number"
            min="1"
            value={maxStudents}
            onChange={(e) => setMaxStudents(e.target.value)}
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
              onClick={() => router.push("/admin/cohorts")}
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

export default function NewCohortPage() {
  return (
    <Suspense>
      <NewCohortForm />
    </Suspense>
  );
}
