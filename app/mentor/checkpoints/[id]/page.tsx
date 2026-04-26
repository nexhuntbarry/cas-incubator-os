'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/mentor/Shell";
import MentorNoteModal from "@/components/MentorNoteModal";
import { StickyNote } from "lucide-react";
import { formatDate } from "@/lib/dates";

interface CheckpointSubmission {
  id: string;
  status: string;
  feedback: string | null;
  submitted_at: string | null;
  student_user_id: string;
  checkpoints: { title: string; description: string | null; stage_number: number; project_id: string };
  users: { display_name: string; email: string };
  content: Record<string, unknown>;
}

export default function MentorCheckpointReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submission, setSubmission] = useState<CheckpointSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/mentor/checkpoint-submissions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSubmission(d);
        setFeedback(d.feedback ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAction(action: "approve" | "revision" | "escalate") {
    setSaving(true);
    setError(null);

    const statusMap = {
      approve: "submitted",
      revision: "revision_requested",
      escalate: "submitted",
    };

    try {
      const res = await fetch(`/api/mentor/checkpoint-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusMap[action],
          feedback,
          approved: action === "approve",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed.");
        return;
      }

      router.push("/mentor/checkpoints/queue");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Shell title="Checkpoint Review" introKey="mentor.checkpointDetail">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    );
  }

  if (!submission) {
    return (
      <Shell title="Checkpoint Review" introKey="mentor.checkpointDetail">
        <p className="text-soft-gray/40 text-sm">Not found.</p>
      </Shell>
    );
  }

  const checkpoint = Array.isArray(submission.checkpoints)
    ? (submission.checkpoints[0] as CheckpointSubmission["checkpoints"] | undefined)
    : (submission.checkpoints as CheckpointSubmission["checkpoints"] | null);
  const student = Array.isArray(submission.users)
    ? (submission.users[0] as { display_name: string } | undefined)
    : (submission.users as { display_name: string } | null);

  return (
    <Shell title={`Checkpoint: ${checkpoint?.title ?? "Review"}`} introKey="mentor.checkpointDetail">
      <div className="max-w-2xl space-y-6">
        {/* Student / checkpoint info */}
        <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-soft-gray">{student?.display_name ?? "—"}</p>
            <p className="text-xs text-soft-gray/40 mt-0.5">
              {checkpoint?.title} · Stage {checkpoint?.stage_number} · {formatDate(submission.submitted_at)}
            </p>
          </div>
          <button
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/8 text-soft-gray/60 hover:bg-white/12 transition-colors"
          >
            <StickyNote size={12} />
            Leave Note
          </button>
        </div>

        {/* Checkpoint description */}
        {checkpoint?.description && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="text-xs font-medium text-soft-gray/50 mb-1">Checkpoint Description</p>
            <p className="text-sm text-soft-gray/80">{checkpoint.description}</p>
          </div>
        )}

        {/* Submitted content */}
        {submission.content && Object.keys(submission.content).length > 0 && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
            <p className="text-xs font-medium text-soft-gray/50">Submitted Content</p>
            <pre className="text-xs text-soft-gray/60 overflow-auto max-h-48 whitespace-pre-wrap">
              {JSON.stringify(submission.content, null, 2)}
            </pre>
          </div>
        )}

        {/* Feedback */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-soft-gray/70">Feedback</label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-vivid-teal/60 resize-y"
            placeholder="Write feedback or approval notes…"
          />
        </div>

        {error && <p className="text-sm text-status-error">{error}</p>}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleAction("approve")}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-status-success/80 text-white text-sm font-medium hover:bg-status-success disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Approve"}
          </button>
          <button
            onClick={() => handleAction("revision")}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-status-warning/20 text-status-warning text-sm font-medium hover:bg-status-warning/30 disabled:opacity-50 transition-colors"
          >
            Request Revision
          </button>
          <button
            onClick={() => handleAction("escalate")}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-status-error/15 text-status-error text-sm font-medium hover:bg-status-error/25 disabled:opacity-50 transition-colors"
          >
            Escalate
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm text-soft-gray/50 hover:text-soft-gray hover:bg-white/5 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {showNoteModal && (
        <MentorNoteModal
          studentUserId={submission.student_user_id}
          projectId={checkpoint?.project_id ?? ""}
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </Shell>
  );
}
