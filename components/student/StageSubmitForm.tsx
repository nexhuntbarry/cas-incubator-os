'use client';

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

interface StageSubmitFormProps {
  stageId: number;
  initialNotes: string;
  isSubmitted: boolean;
  labels: {
    submit: string;
    submitting: string;
    submitted: string;
    notes: string;
    evidenceLabel: string;
  };
}

export default function StageSubmitForm({
  stageId,
  initialNotes,
  isSubmitted,
  labels,
}: StageSubmitFormProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(isSubmitted);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/student/method/${stageId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Submission failed");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-vivid-teal/20 bg-vivid-teal/5 p-6 text-center space-y-2">
        <CheckCircle2 size={32} className="text-vivid-teal mx-auto" />
        <p className="font-semibold text-vivid-teal">{labels.submitted}</p>
        <p className="text-sm text-soft-gray/50">Your mentor or teacher will review your submission.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-soft-gray/60 mb-1">{labels.notes}</label>
        <textarea
          rows={5}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none"
          placeholder="Add notes about your progress, questions, or reflections for this stage..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vivid-teal text-deep-navy text-sm font-semibold hover:bg-vivid-teal/90 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? labels.submitting : labels.submit}
      </button>
    </div>
  );
}
