'use client';

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export interface RubricCriterion {
  key: string;
  label: string;
  description: string;
  weight: number;
}

export interface RatingScale {
  min: number;
  max: number;
  labels: Record<string, string>;
}

interface RubricBuilderProps {
  criteria: RubricCriterion[];
  ratingScale: RatingScale;
  guidanceNotes?: string;
  onChange: (criteria: RubricCriterion[], scale: RatingScale, guidance?: string) => void;
}

const DEFAULT_LABELS: Record<string, string> = {
  "1": "Poor",
  "2": "Below Average",
  "3": "Average",
  "4": "Good",
  "5": "Excellent",
};

export default function RubricBuilder({
  criteria,
  ratingScale,
  guidanceNotes = "",
  onChange,
}: RubricBuilderProps) {
  const [guidance, setGuidance] = useState(guidanceNotes);

  function addCriterion() {
    const c: RubricCriterion = {
      key: `criterion_${criteria.length + 1}`,
      label: `Criterion ${criteria.length + 1}`,
      description: "",
      weight: 1,
    };
    onChange([...criteria, c], ratingScale, guidance);
  }

  function removeCriterion(idx: number) {
    onChange(criteria.filter((_, i) => i !== idx), ratingScale, guidance);
  }

  function updateCriterion(idx: number, patch: Partial<RubricCriterion>) {
    const updated = criteria.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange(updated, ratingScale, guidance);
  }

  function updateScaleLabel(score: number, label: string) {
    const next: RatingScale = {
      ...ratingScale,
      labels: { ...ratingScale.labels, [String(score)]: label },
    };
    onChange(criteria, next, guidance);
  }

  function handleGuidanceBlur(val: string) {
    setGuidance(val);
    onChange(criteria, ratingScale, val);
  }

  const scores = Array.from(
    { length: ratingScale.max - ratingScale.min + 1 },
    (_, i) => ratingScale.min + i
  );

  return (
    <div className="space-y-6">
      {/* Rating scale config */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
        <p className="text-sm font-semibold text-soft-gray/70">Rating Scale Labels</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {scores.map((score) => (
            <div key={score} className="space-y-1">
              <label className="text-xs text-soft-gray/50">Score {score}</label>
              <input
                value={ratingScale.labels[String(score)] ?? ""}
                onChange={(e) => updateScaleLabel(score, e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-soft-gray/70">Criteria</p>
        {criteria.map((c, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-soft-gray/40 font-mono">#{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeCriterion(idx)}
                className="p-1 rounded hover:bg-status-error/10 transition-colors"
              >
                <Trash2 size={14} className="text-status-error/70" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-soft-gray/50">Label</label>
                <input
                  value={c.label}
                  onChange={(e) => updateCriterion(idx, { label: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-soft-gray/50">Weight</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={c.weight}
                  onChange={(e) =>
                    updateCriterion(idx, { weight: Number(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-soft-gray/50">Description</label>
              <textarea
                rows={2}
                value={c.description}
                onChange={(e) =>
                  updateCriterion(idx, { description: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
                placeholder="What are you evaluating?"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCriterion}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-sm text-soft-gray/50 hover:text-soft-gray hover:border-electric-blue/40 transition-colors"
        >
          <Plus size={14} />
          Add Criterion
        </button>
      </div>

      {/* Guidance notes */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-soft-gray/70">
          Guidance Notes (optional)
        </label>
        <textarea
          rows={3}
          defaultValue={guidance}
          onBlur={(e) => handleGuidanceBlur(e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
          placeholder="Instructions for evaluators…"
        />
      </div>
    </div>
  );
}
