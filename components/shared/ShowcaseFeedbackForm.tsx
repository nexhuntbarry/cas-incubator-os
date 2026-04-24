"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

interface Props {
  showcaseId: string;
  backHref?: string;
}

export default function ShowcaseFeedbackForm({ showcaseId }: Props) {
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!feedback.trim()) {
      setError("Please write feedback before submitting.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/showcase/${showcaseId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error("Failed to save feedback");
      setSuccess(true);
      setFeedback("");
    } catch {
      setError("Failed to save feedback — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare size={15} className="text-electric-blue" />
        <h3 className="font-semibold text-sm">Leave Feedback</h3>
      </div>

      {success ? (
        <p className="text-vivid-teal text-sm bg-vivid-teal/10 border border-vivid-teal/20 rounded-lg px-4 py-3">
          Feedback saved successfully.
        </p>
      ) : (
        <>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Write your feedback on this showcase…"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50 resize-none"
          />
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors disabled:opacity-50"
          >
            <MessageSquare size={14} />
            {saving ? "Saving…" : "Submit Feedback"}
          </button>
        </>
      )}
    </div>
  );
}
