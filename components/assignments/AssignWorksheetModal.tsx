'use client';

import { useState, useEffect } from "react";
import { X, Calendar, Users, BookOpen } from "lucide-react";

interface Cohort {
  id: string;
  name: string;
}

interface AssignWorksheetModalProps {
  templateId: string;
  templateTitle: string;
  lessonNumber?: number | null;
  onClose: () => void;
  onSuccess?: (assignmentId: string) => void;
}

const QUICK_DATES = [
  { label: "End of today", getValue: () => endOfToday() },
  { label: "+1 hour", getValue: () => hoursFromNow(1) },
  { label: "+3 days", getValue: () => daysFromNow(3) },
  { label: "+1 week", getValue: () => daysFromNow(7) },
];

function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return toLocalInputValue(d);
}

function hoursFromNow(h: number): string {
  return toLocalInputValue(new Date(Date.now() + h * 60 * 60 * 1000));
}

function daysFromNow(d: number): string {
  return toLocalInputValue(new Date(Date.now() + d * 24 * 60 * 60 * 1000));
}

function toLocalInputValue(d: Date): string {
  // datetime-local input expects "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AssignWorksheetModal({
  templateId,
  templateTitle,
  lessonNumber,
  onClose,
  onSuccess,
}: AssignWorksheetModalProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(endOfToday());
  const [instructions, setInstructions] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCohorts, setLoadingCohorts] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/cohorts")
      .then((r) => r.json())
      .then((data) => {
        const list: Cohort[] = Array.isArray(data) ? data : [];
        setCohorts(list);
        if (list.length > 0) setSelectedCohortId(list[0].id);
      })
      .catch(() => setCohorts([]))
      .finally(() => setLoadingCohorts(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCohortId || !dueDate) {
      setError("Please select a cohort and due date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/teacher/worksheet-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          cohort_id: selectedCohortId,
          lesson_number: lessonNumber ?? null,
          due_date: new Date(dueDate).toISOString(),
          instructions_override: instructions.trim() || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to create assignment.");
        return;
      }

      const { id } = await res.json();
      onSuccess?.(id);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-deep-navy shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-electric-blue" />
            <h2 className="font-semibold text-soft-gray">Assign Worksheet</h2>
          </div>
          <button
            onClick={onClose}
            className="text-soft-gray/40 hover:text-soft-gray transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Worksheet name */}
          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
            <p className="text-xs text-soft-gray/40 mb-0.5">Worksheet</p>
            <p className="font-medium text-soft-gray">{templateTitle}</p>
            {lessonNumber && (
              <p className="text-xs text-soft-gray/40 mt-0.5">Lesson {lessonNumber}</p>
            )}
          </div>

          {/* Cohort */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-soft-gray/60">
              <Users size={12} />
              Assign to cohort
            </label>
            {loadingCohorts ? (
              <div className="h-9 rounded-lg bg-white/5 animate-pulse" />
            ) : cohorts.length === 0 ? (
              <p className="text-xs text-soft-gray/40">No cohorts found.</p>
            ) : (
              <select
                value={selectedCohortId}
                onChange={(e) => setSelectedCohortId(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-soft-gray focus:outline-none focus:border-electric-blue/50"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-deep-navy">
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-soft-gray/60">
              <Calendar size={12} />
              Due date
            </label>
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_DATES.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setDueDate(q.getValue())}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    dueDate === q.getValue()
                      ? "border-electric-blue bg-electric-blue/15 text-electric-blue"
                      : "border-white/10 text-soft-gray/60 hover:border-white/20 hover:text-soft-gray"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-soft-gray focus:outline-none focus:border-electric-blue/50"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-soft-gray/60">
              Instructions (optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Add a note for students about this assignment…"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-soft-gray placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-status-error">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-soft-gray/60 hover:text-soft-gray transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingCohorts || cohorts.length === 0}
              className="px-5 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Assigning…" : "Assign Worksheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
