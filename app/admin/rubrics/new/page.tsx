'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/admin/Shell";
import Input from "@/components/forms/Input";
import RubricBuilder from "@/components/rubric/RubricBuilder";
import type { RubricCriterion, RatingScale } from "@/components/rubric/RubricBuilder";

const DEFAULT_SCALE: RatingScale = {
  min: 1,
  max: 5,
  labels: {
    "1": "Poor",
    "2": "Below Average",
    "3": "Average",
    "4": "Good",
    "5": "Excellent",
  },
};

export default function NewRubricPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [ratingScale, setRatingScale] = useState<RatingScale>(DEFAULT_SCALE);
  const [guidanceNotes, setGuidanceNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleBuilderChange(c: RubricCriterion[], scale: RatingScale, guidance?: string) {
    setCriteria(c);
    setRatingScale(scale);
    setGuidanceNotes(guidance ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/rubrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        criteria,
        rating_scale_json: ratingScale,
        guidance_notes: guidanceNotes || null,
      }),
    });

    if (res.ok) {
      router.push("/admin/rubrics");
    } else {
      const d = await res.json();
      setError(d.error ?? "Error saving rubric");
    }
    setLoading(false);
  }

  return (
    <Shell title="New Rubric Template">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Rubric Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <RubricBuilder
            criteria={criteria}
            ratingScale={ratingScale}
            guidanceNotes={guidanceNotes}
            onChange={handleBuilderChange}
          />

          {error && <p className="text-sm text-status-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving…" : "Save Rubric"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg text-sm text-soft-gray/50 hover:text-soft-gray hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
