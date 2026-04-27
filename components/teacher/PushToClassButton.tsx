'use client';

import { useState } from "react";
import { Send, Loader2, Check, AlertTriangle } from "lucide-react";

interface Cohort {
  id: string;
  name: string;
}

interface Props {
  templateId: string;
  templateTitle: string;
  cohorts: Cohort[];
  lessonNumber: number;
}

function defaultDueDate(): string {
  // 7 days from today, set to end-of-day local
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 0, 0);
  // YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PushToClassButton({ templateId, templateTitle, cohorts, lessonNumber }: Props) {
  const [open, setOpen] = useState(false);
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? "");
  const [dueLocal, setDueLocal] = useState<string>(defaultDueDate());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (cohorts.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-soft-gray/40 italic">
        <AlertTriangle size={11} /> No cohort assigned
      </span>
    );
  }

  async function handleSubmit() {
    if (!cohortId || !dueLocal) return;
    setSubmitting(true);
    setResult(null);
    try {
      const due = new Date(dueLocal);
      const res = await fetch("/api/teacher/worksheet-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          cohort_id: cohortId,
          lesson_number: lessonNumber,
          due_date: due.toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult({ ok: false, msg: json?.error ?? "Failed to assign" });
      } else {
        setResult({ ok: true, msg: "Assigned to class." });
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 1400);
      }
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-electric-blue text-white text-xs font-semibold px-3 py-1.5 hover:bg-electric-blue/90 transition-colors"
      >
        <Send size={12} />
        Push to Class
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-deep-navy p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider">Assign Worksheet</p>
              <p className="text-base font-semibold text-soft-gray mt-0.5">{templateTitle}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-soft-gray/60 mb-1.5 font-medium">Cohort</label>
                <select
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-soft-gray"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-deep-navy">{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-soft-gray/60 mb-1.5 font-medium">Due date</label>
                <input
                  type="datetime-local"
                  value={dueLocal}
                  onChange={(e) => setDueLocal(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-soft-gray"
                />
              </div>
            </div>

            {result && (
              <div
                className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                  result.ok ? "bg-vivid-teal/15 text-vivid-teal" : "bg-status-warning/15 text-status-warning"
                }`}
              >
                {result.ok ? <Check size={12} /> : <AlertTriangle size={12} />}
                {result.msg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setOpen(false)}
                className="text-xs text-soft-gray/60 hover:text-soft-gray px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !cohortId || !dueLocal}
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-electric-blue text-white text-xs font-semibold px-4 py-2 hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {submitting ? "Assigning…" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
