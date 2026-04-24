'use client';

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import SchemaForm from "@/components/forms/SchemaForm";
import type { SchemaField } from "@/components/forms/SchemaBuilder";

interface Template {
  id: string;
  title: string;
  instructions: string | null;
  fields_schema: SchemaField[];
}

interface Submission {
  id: string;
  status: string;
  answers: Record<string, unknown>;
  feedback: string | null;
  version_number: number;
}

export default function StudentWorksheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch template
    fetch(`/api/admin/worksheets/${id}`)
      .then((r) => r.json())
      .then(setTemplate);

    // Fetch existing submission
    fetch(`/api/student/worksheet-submissions?template_id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSubmission(data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAutoSave = useCallback(
    async (data: Record<string, unknown>) => {
      if (submission?.status === "submitted" || submission?.status === "reviewed") return;
      await fetch("/api/student/worksheet-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: id,
          answers: data,
          status: "in_progress",
        }),
      });
    },
    [id, submission?.status]
  );

  async function handleSubmit(data: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/student/worksheet-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: id,
          answers: data,
          status: "submitted",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Submission failed.");
        return;
      }

      setSubmitDone(true);
      setTimeout(() => router.push("/student/worksheets"), 1500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <p className="text-soft-gray/40 text-sm">Worksheet not found.</p>
      </div>
    );
  }

  const isReadOnly =
    submission?.status === "submitted" || submission?.status === "reviewed";
  const isRevision = submission?.status === "revision_requested";

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <button
            onClick={() => router.push("/student/worksheets")}
            className="text-xs text-soft-gray/40 hover:text-soft-gray mb-3 flex items-center gap-1"
          >
            ← Back to Worksheets
          </button>
          <h1 className="text-2xl font-bold">{template.title}</h1>
          {template.instructions && (
            <p className="text-sm text-soft-gray/60 mt-2 leading-relaxed">{template.instructions}</p>
          )}
        </div>

        {/* Feedback */}
        {submission?.feedback && (
          <div className="rounded-xl border border-vivid-teal/30 bg-vivid-teal/10 p-4 space-y-1">
            <p className="text-xs font-semibold text-vivid-teal uppercase tracking-wider">Mentor Feedback</p>
            <p className="text-sm text-soft-gray/80">{submission.feedback}</p>
          </div>
        )}

        {/* Revision notice */}
        {isRevision && (
          <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4">
            <p className="text-sm text-status-warning font-medium">
              Revision requested — please update your answers and resubmit.
            </p>
          </div>
        )}

        {submitDone ? (
          <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-6 text-center">
            <p className="text-status-success font-semibold">Submitted successfully!</p>
          </div>
        ) : (
          <SchemaForm
            fields={template.fields_schema ?? []}
            initialValues={(submission?.answers as Record<string, unknown>) ?? {}}
            readOnly={isReadOnly}
            onAutoSave={!isReadOnly ? handleAutoSave : undefined}
            onSubmit={!isReadOnly ? handleSubmit : undefined}
            submitLabel={isRevision ? "Resubmit" : "Submit"}
          />
        )}

        {error && <p className="text-sm text-status-error">{error}</p>}

        {isReadOnly && (
          <p className="text-xs text-soft-gray/40 text-center">
            This submission has been {submission?.status} and is read-only.
          </p>
        )}
      </main>
    </div>
  );
}
