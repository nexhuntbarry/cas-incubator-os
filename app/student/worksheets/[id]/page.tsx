'use client';

import { useState, useEffect, use, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import SchemaForm from "@/components/forms/SchemaForm";
import type { SchemaField } from "@/components/forms/SchemaBuilder";
import { CalendarClock, User } from "lucide-react";

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

interface AssignmentContext {
  id: string;
  due_date: string;
  instructions_override: string | null;
  assigned_by_name: string | null;
}

function formatDueDate(due: string): string {
  return new Date(due).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(due: string): boolean {
  return new Date(due) < new Date();
}

export default function StudentWorksheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignment");

  const [template, setTemplate] = useState<Template | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignmentCtx, setAssignmentCtx] = useState<AssignmentContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetches: Promise<void>[] = [
      fetch(`/api/admin/worksheets/${id}`)
        .then((r) => r.json())
        .then(setTemplate),
      fetch(`/api/student/worksheet-submissions?template_id=${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSubmission(data[0]);
          }
        }),
    ];

    if (assignmentId) {
      fetches.push(
        fetch(`/api/student/assignments`)
          .then((r) => r.json())
          .then((data: unknown[]) => {
            const match = Array.isArray(data)
              ? data.find((a: unknown) => (a as { id: string }).id === assignmentId)
              : null;
            if (match) {
              const a = match as {
                id: string;
                due_date: string;
                instructions_override?: string | null;
                users?: { display_name: string } | null;
              };
              setAssignmentCtx({
                id: a.id,
                due_date: a.due_date,
                instructions_override: a.instructions_override ?? null,
                assigned_by_name: a.users?.display_name ?? null,
              });
            }
          })
          .catch(() => undefined)
      );
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, [id, assignmentId]);

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
          assignment_id: assignmentId ?? null,
        }),
      });
    },
    [id, submission?.status, assignmentId]
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
          assignment_id: assignmentId ?? null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Submission failed.");
        return;
      }

      setSubmitDone(true);
      // Redirect to student dashboard with a brief delay
      setTimeout(() => router.push("/student"), 1500);
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

        {/* Assignment context banner */}
        {assignmentCtx && (
          <div
            className={`rounded-xl border p-4 space-y-2 ${
              isOverdue(assignmentCtx.due_date)
                ? "border-status-error/30 bg-status-error/5"
                : "border-electric-blue/20 bg-electric-blue/5"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {assignmentCtx.assigned_by_name && (
                <span className="flex items-center gap-1 text-soft-gray/60">
                  <User size={11} />
                  Assigned by <span className="font-medium text-soft-gray">{assignmentCtx.assigned_by_name}</span>
                </span>
              )}
              <span
                className={`flex items-center gap-1 font-medium ${
                  isOverdue(assignmentCtx.due_date) ? "text-status-error" : "text-electric-blue"
                }`}
              >
                <CalendarClock size={11} />
                {isOverdue(assignmentCtx.due_date) ? "Overdue · " : "Due "}
                {formatDueDate(assignmentCtx.due_date)}
              </span>
            </div>
            {assignmentCtx.instructions_override && (
              <p className="text-sm text-soft-gray/70 leading-relaxed border-t border-white/5 pt-2">
                {assignmentCtx.instructions_override}
              </p>
            )}
          </div>
        )}

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
          <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-6 text-center space-y-1">
            <p className="text-status-success font-semibold">Submitted successfully!</p>
            <p className="text-xs text-soft-gray/40">Redirecting to dashboard…</p>
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
