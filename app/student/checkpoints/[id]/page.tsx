'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import CheckpointStatusBadge from "@/components/checkpoint/CheckpointStatusBadge";
import Shell from "@/components/student/Shell";
import { formatDate } from "@/lib/dates";

interface Checkpoint {
  id: string;
  title: string;
  description: string | null;
  stage_number: number;
  status: string;
}

interface Submission {
  id: string;
  status: string;
  submitted_at: string | null;
  feedback: string | null;
}

export default function StudentCheckpointDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch checkpoint info via student API
    Promise.all([
      fetch(`/api/student/checkpoint-submissions?checkpoint_id=${id}`).then((r) => r.json()),
    ]).then(([subs]) => {
      if (Array.isArray(subs) && subs.length > 0) {
        setSubmission(subs[0]);
        const cp = (subs[0] as Record<string, unknown>).checkpoints as Checkpoint | null;
        if (cp) setCheckpoint(cp);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/student/checkpoint-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkpoint_id: id,
          status: "submitted",
          content: {},
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to submit.");
        return;
      }

      router.push("/student/checkpoints");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </div>
    );
  }

  const status = submission?.status ?? checkpoint?.status ?? "not_started";
  const isSubmitted = status === "submitted" || status === "reviewed";

  return (
    <Shell title={checkpoint?.title ?? "Checkpoint"}>
      <div className="max-w-2xl space-y-6">
        <button
          onClick={() => router.push("/student/checkpoints")}
          className="text-xs text-soft-gray/40 hover:text-soft-gray flex items-center gap-1"
        >
          ← Back to Checkpoints
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{checkpoint?.title ?? "Checkpoint"}</h1>
            {checkpoint?.description && (
              <p className="text-sm text-soft-gray/60 mt-2">{checkpoint.description}</p>
            )}
            <p className="text-xs text-soft-gray/30 mt-1">Stage {checkpoint?.stage_number}</p>
          </div>
          <CheckpointStatusBadge status={status} />
        </div>

        {submission?.feedback && (
          <div className="rounded-xl border border-vivid-teal/30 bg-vivid-teal/10 p-4 space-y-1">
            <p className="text-xs font-semibold text-vivid-teal uppercase tracking-wider">Feedback</p>
            <p className="text-sm text-soft-gray/80">{submission.feedback}</p>
          </div>
        )}

        {error && <p className="text-sm text-status-error">{error}</p>}

        {!isSubmitted && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
            <p className="text-sm text-soft-gray/70">
              Complete all required worksheets for this checkpoint and then submit when ready.
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting…" : "Submit Checkpoint"}
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-5 text-center">
            <p className="text-status-success font-semibold text-sm">
              Checkpoint submitted — awaiting mentor review.
            </p>
            {submission?.submitted_at && (
              <p className="text-xs text-soft-gray/40 mt-1">
                Submitted {formatDate(submission.submitted_at)}
              </p>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
