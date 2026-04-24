'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/teacher/Shell";
import SchemaForm from "@/components/forms/SchemaForm";
import type { SchemaField } from "@/components/forms/SchemaBuilder";
import { Sparkles } from "lucide-react";

interface SubmissionData {
  id: string;
  status: string;
  answers: Record<string, unknown>;
  feedback: string | null;
  feedback_summary: string | null;
  ai_summary_json: unknown;
  version_number: number;
  worksheet_templates: {
    title: string;
    fields_schema: SchemaField[];
    instructions: string | null;
  };
  users: { display_name: string; email: string };
}

export default function TeacherReviewSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState<Record<string, unknown> | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<Record<string, unknown> | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/teacher/worksheet-submissions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSubmission(d);
        setFeedback(d.feedback ?? "");
        if (d.ai_summary_json) setAiSummary(d.ai_summary_json as Record<string, unknown>);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAction(status: "reviewed" | "revision_requested") {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/worksheet-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save.");
        return;
      }
      router.push("/teacher/worksheets/review");
    } finally {
      setSaving(false);
    }
  }

  async function generateAiSummary() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/worksheet-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: id }),
      });
      const d = await res.json();
      if (d.summary) setAiSummary(d.summary as Record<string, unknown>);
    } finally {
      setAiLoading(false);
    }
  }

  async function generateAiFeedback() {
    setAiFeedbackLoading(true);
    try {
      const res = await fetch("/api/ai/worksheet-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: id }),
      });
      const d = await res.json();
      if (d.feedback) {
        const fb = d.feedback as Record<string, unknown>;
        setAiFeedback(fb);
        // Pre-fill feedback textarea
        const parts: string[] = [];
        if (fb.positive_observation) parts.push(`+ ${fb.positive_observation}`);
        if (Array.isArray(fb.improvement_points)) {
          (fb.improvement_points as string[]).forEach((p) => parts.push(`• ${p}`));
        }
        if (fb.next_action) parts.push(`\nNext step: ${fb.next_action}`);
        if (fb.scope_reduction_suggestion) parts.push(`\nScope: ${fb.scope_reduction_suggestion}`);
        setFeedback(parts.join("\n"));
      }
    } finally {
      setAiFeedbackLoading(false);
    }
  }

  if (loading) {
    return (
      <Shell title="Review Submission">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    );
  }

  if (!submission) {
    return (
      <Shell title="Review Submission">
        <p className="text-soft-gray/40 text-sm">Submission not found.</p>
      </Shell>
    );
  }

  const template = submission.worksheet_templates;
  const student = Array.isArray(submission.users)
    ? (submission.users[0] as { display_name: string } | undefined)
    : (submission.users as { display_name: string } | null);

  return (
    <Shell title={`Review: ${template?.title ?? "Worksheet"}`}>
      <div className="max-w-2xl space-y-6">
        {/* Student info */}
        <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-soft-gray">{student?.display_name ?? "—"}</p>
            <p className="text-xs text-soft-gray/40">v{submission.version_number} · {submission.status}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateAiSummary}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet/15 text-violet hover:bg-violet/25 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={12} />
              {aiLoading ? "…" : "AI Summary"}
            </button>
            <button
              onClick={generateAiFeedback}
              disabled={aiFeedbackLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gold/15 text-gold hover:bg-gold/25 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={12} />
              {aiFeedbackLoading ? "…" : "Draft Feedback"}
            </button>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="rounded-xl border border-violet/20 bg-violet/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-violet uppercase tracking-wider">AI Summary</p>
            <p className="text-sm text-soft-gray/80">{String(aiSummary.summary ?? "")}</p>
            {Array.isArray(aiSummary.reviewer_focus) && (aiSummary.reviewer_focus as string[]).length > 0 && (
              <div>
                <p className="text-xs text-soft-gray/50 font-medium mb-1">Focus on:</p>
                <ul className="space-y-0.5">
                  {(aiSummary.reviewer_focus as string[]).map((item, i) => (
                    <li key={i} className="text-xs text-soft-gray/70 flex gap-1.5">
                      <span className="text-violet">→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Submission form (read-only) */}
        {template?.instructions && (
          <p className="text-sm text-soft-gray/60">{template.instructions}</p>
        )}
        <SchemaForm
          fields={template?.fields_schema ?? []}
          initialValues={(submission.answers as Record<string, unknown>) ?? {}}
          readOnly
        />

        {/* Feedback area */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-soft-gray/70">Your Feedback</label>
          <textarea
            rows={5}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-y"
            placeholder="Write feedback for the student…"
          />
        </div>

        {error && <p className="text-sm text-status-error">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => handleAction("reviewed")}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-status-success/80 text-white text-sm font-medium hover:bg-status-success disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Mark Reviewed"}
          </button>
          <button
            onClick={() => handleAction("revision_requested")}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-status-warning/20 text-status-warning text-sm font-medium hover:bg-status-warning/30 disabled:opacity-50 transition-colors"
          >
            Request Revision
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm text-soft-gray/50 hover:text-soft-gray hover:bg-white/5 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </Shell>
  );
}
