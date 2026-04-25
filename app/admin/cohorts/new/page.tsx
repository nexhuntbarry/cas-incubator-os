'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "@/components/admin/Shell";
import Input from "@/components/forms/Input";
import { useTranslations } from "next-intl";

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
    <Shell title={t("cohorts.new")}>
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
            <p className="text-xs text-soft-gray/40 mb-1">
              Find the program ID from the{" "}
              <a href="/admin/programs" className="text-electric-blue hover:underline">
                Programs page
              </a>{" "}
              (open the program and copy the UUID from the URL).
            </p>
            <Input
              label=""
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              required
            />
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
