'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Shell from "@/components/mentor/Shell";
import RubricEvaluator from "@/components/rubric/RubricEvaluator";
import type { RubricCriterion, RatingScale } from "@/components/rubric/RubricBuilder";

const DEFAULT_SCALE: RatingScale = {
  min: 1,
  max: 5,
  labels: { "1": "Poor", "2": "Below Average", "3": "Average", "4": "Good", "5": "Excellent" },
};

interface RubricTemplate {
  id: string;
  name: string;
  criteria: RubricCriterion[];
  rating_scale_json: RatingScale;
  guidance_notes: string | null;
}

function EvaluateContent() {
  const searchParams = useSearchParams();
  const rubricId = searchParams.get("rubric_id");
  const studentId = searchParams.get("student_id");
  const projectId = searchParams.get("project_id");

  const [rubric, setRubric] = useState<RubricTemplate | null>(null);
  const [rubrics, setRubrics] = useState<{ id: string; name: string }[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState(rubricId ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/rubrics").then((r) => r.json()).then((d) => {
      setRubrics(Array.isArray(d) ? d : []);
    });
  }, []);

  useEffect(() => {
    if (!selectedRubricId) {
      setRubric(null);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/rubrics/${selectedRubricId}`)
      .then((r) => r.json())
      .then(setRubric)
      .finally(() => setLoading(false));
  }, [selectedRubricId]);

  async function handleSubmit(
    scores: Record<string, number>,
    comments: Record<string, string>,
    approved: boolean
  ) {
    if (!studentId) {
      setError("student_id is required in the URL.");
      return;
    }

    const res = await fetch("/api/mentor/rubric-evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rubric_id: selectedRubricId,
        student_user_id: studentId,
        project_id: projectId ?? null,
        scores_json: scores,
        comments_json: comments,
        approved_status: approved,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save evaluation.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <Shell title="Rubric Evaluation" introKey="mentor.rubricEvaluate">
        <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-8 text-center">
          <p className="text-status-success font-semibold">Evaluation saved!</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Rubric Evaluation" introKey="mentor.rubricEvaluate">
      <div className="max-w-2xl space-y-6">
        {!studentId && (
          <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4 text-sm text-status-warning">
            Navigate here from a student profile with ?student_id=X&rubric_id=Y
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-soft-gray/70">Select Rubric</label>
          <select
            value={selectedRubricId}
            onChange={(e) => setSelectedRubricId(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-vivid-teal/60"
          >
            <option value="" className="bg-deep-navy">— Select rubric —</option>
            {rubrics.map((r) => (
              <option key={r.id} value={r.id} className="bg-deep-navy">{r.name}</option>
            ))}
          </select>
        </div>

        {loading && <p className="text-soft-gray/40 text-sm">Loading rubric…</p>}

        {rubric && (
          <RubricEvaluator
            criteria={Array.isArray(rubric.criteria) ? rubric.criteria : []}
            ratingScale={rubric.rating_scale_json ?? DEFAULT_SCALE}
            guidanceNotes={rubric.guidance_notes ?? undefined}
            onSubmit={handleSubmit}
          />
        )}

        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>
    </Shell>
  );
}

export default function MentorRubricEvaluatePage() {
  return (
    <Suspense fallback={
      <Shell title="Rubric Evaluation" introKey="mentor.rubricEvaluate">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    }>
      <EvaluateContent />
    </Suspense>
  );
}
