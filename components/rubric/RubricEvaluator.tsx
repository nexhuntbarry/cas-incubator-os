'use client';

import { useState } from "react";
import type { RubricCriterion, RatingScale } from "./RubricBuilder";

interface RubricEvaluatorProps {
  criteria: RubricCriterion[];
  ratingScale: RatingScale;
  guidanceNotes?: string;
  initialScores?: Record<string, number>;
  initialComments?: Record<string, string>;
  readOnly?: boolean;
  onSubmit?: (scores: Record<string, number>, comments: Record<string, string>, approved: boolean) => Promise<void>;
}

export default function RubricEvaluator({
  criteria,
  ratingScale,
  guidanceNotes,
  initialScores = {},
  initialComments = {},
  readOnly = false,
  onSubmit,
}: RubricEvaluatorProps) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [comments, setComments] = useState<Record<string, string>>(initialComments);
  const [approved, setApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scores_arr = Array.from(
    { length: ratingScale.max - ratingScale.min + 1 },
    (_, i) => ratingScale.min + i
  );

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const weightedScore =
    totalWeight > 0
      ? criteria.reduce((sum, c) => {
          const s = scores[c.key] ?? 0;
          return sum + (s * c.weight) / totalWeight;
        }, 0)
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSubmit) return;

    // Ensure all criteria have a score
    for (const c of criteria) {
      if (!scores[c.key]) {
        setError(`Please score "${c.label}".`);
        return;
      }
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(scores, comments, approved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {guidanceNotes && (
        <div className="rounded-xl border border-electric-blue/20 bg-electric-blue/5 p-4 text-sm text-soft-gray/70">
          {guidanceNotes}
        </div>
      )}

      {criteria.map((c) => (
        <div
          key={c.key}
          className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3"
        >
          <div>
            <p className="text-sm font-semibold text-soft-gray">{c.label}</p>
            {c.description && (
              <p className="text-xs text-soft-gray/50 mt-0.5">{c.description}</p>
            )}
            <p className="text-xs text-soft-gray/40 mt-0.5">Weight: {c.weight}</p>
          </div>

          {/* Score buttons */}
          <div className="flex gap-2 flex-wrap">
            {scores_arr.map((score) => {
              const isSelected = scores[c.key] === score;
              return (
                <button
                  key={score}
                  type="button"
                  disabled={readOnly}
                  onClick={() =>
                    !readOnly &&
                    setScores((prev) => ({ ...prev, [c.key]: score }))
                  }
                  className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs transition-colors min-w-[56px] ${
                    isSelected
                      ? "bg-electric-blue border-electric-blue text-white"
                      : "border-white/10 bg-white/3 text-soft-gray/60 hover:border-electric-blue/40"
                  } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className="font-bold text-sm">{score}</span>
                  <span className="text-[10px] leading-tight text-center">
                    {ratingScale.labels[String(score)] ?? ""}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-xs text-soft-gray/50">Comment (optional)</label>
            <textarea
              rows={2}
              value={comments[c.key] ?? ""}
              readOnly={readOnly}
              onChange={(e) =>
                setComments((prev) => ({ ...prev, [c.key]: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
              placeholder="Feedback for this criterion…"
            />
          </div>
        </div>
      ))}

      {/* Weighted summary */}
      {criteria.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
          <span className="text-sm text-soft-gray/50">Weighted Score</span>
          <span className="text-lg font-bold text-electric-blue">
            {weightedScore.toFixed(2)} / {ratingScale.max}
          </span>
        </div>
      )}

      {error && <p className="text-sm text-status-error">{error}</p>}

      {!readOnly && onSubmit && (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-soft-gray/70">
            <input
              type="checkbox"
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
              className="accent-vivid-teal"
            />
            Mark as Approved
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Saving…" : "Save Evaluation"}
          </button>
        </div>
      )}
    </form>
  );
}
