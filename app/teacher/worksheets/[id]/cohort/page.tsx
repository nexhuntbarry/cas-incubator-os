'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/teacher/Shell";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock, FileText, Users } from "lucide-react";
import { formatDate } from "@/lib/dates";

interface StudentRow {
  user_id: string;
  display_name: string;
  email: string;
  cohort: { id: string; name: string } | null;
  stage_status: string | null;
  submission: {
    id: string;
    status: string;
    submitted_at: string | null;
    version_number: number;
    feedback: string | null;
    reviewed_at: string | null;
  } | null;
}

interface TemplateInfo {
  id: string;
  title: string;
  linked_lesson_number: number | null;
  method_stage_definitions: { stage_number: number; name: string } | { stage_number: number; name: string }[] | null;
}

interface PageData {
  template: TemplateInfo;
  students: StudentRow[];
  stage_number: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  submitted:          { label: "Submitted",       cls: "bg-gold/15 text-gold",                   icon: <Clock size={12} /> },
  reviewed:           { label: "Reviewed",        cls: "bg-vivid-teal/15 text-vivid-teal",       icon: <CheckCircle size={12} /> },
  approved:           { label: "Approved",        cls: "bg-vivid-teal/15 text-vivid-teal",       icon: <CheckCircle size={12} /> },
  revision_requested: { label: "Revision Needed", cls: "bg-status-warning/15 text-status-warning", icon: <AlertCircle size={12} /> },
  in_progress:        { label: "In Progress",     cls: "bg-electric-blue/15 text-electric-blue", icon: <Clock size={12} /> },
  not_started:        { label: "Not Started",     cls: "bg-white/5 text-soft-gray/40",           icon: <FileText size={12} /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function TeacherWorksheetCohortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: templateId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/teacher/worksheets/${templateId}/students`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [templateId]);

  const students = data?.students ?? [];

  const filtered = statusFilter === "all"
    ? students
    : students.filter((s) => (s.submission?.status ?? "not_started") === statusFilter);

  function toggleSelect(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleAll() {
    const submittedIds = filtered
      .filter((s) => s.submission?.status === "submitted")
      .map((s) => s.submission!.id);
    if (selected.size === submittedIds.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.filter((s) => s.submission?.status === "submitted").map((s) => s.submission!.id)));
    }
  }

  async function bulkAction(status: "reviewed" | "revision_requested") {
    if (selected.size === 0) return;
    setBulkSaving(true);
    setError(null);
    try {
      await Promise.all(
        Array.from(selected).map((submissionId) =>
          fetch(`/api/teacher/worksheet-submissions/${submissionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      // Refetch
      const res = await fetch(`/api/teacher/worksheets/${templateId}/students`);
      const d = await res.json();
      setData(d);
      setSelected(new Set());
    } catch {
      setError("Bulk action failed. Please try again.");
    } finally {
      setBulkSaving(false);
    }
  }

  const template = data?.template;
  const stageDef = template
    ? Array.isArray(template.method_stage_definitions)
      ? template.method_stage_definitions[0]
      : template.method_stage_definitions
    : null;

  const submittedSelected = filtered.filter(
    (s) => s.submission && selected.has(s.submission.id)
  ).length;

  const statusCounts = students.reduce<Record<string, number>>((acc, s) => {
    const st = s.submission?.status ?? "not_started";
    acc[st] = (acc[st] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <Shell title="Worksheet Detail">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    );
  }

  if (!data || !template) {
    return (
      <Shell title="Worksheet Detail">
        <p className="text-soft-gray/40 text-sm">Template not found.</p>
      </Shell>
    );
  }

  return (
    <Shell title={template.title}>
      <div className="space-y-6">
        {/* Back + header */}
        <div className="space-y-1">
          <button
            onClick={() => router.push("/teacher/worksheets")}
            className="flex items-center gap-1 text-xs text-soft-gray/40 hover:text-soft-gray transition-colors"
          >
            <ChevronLeft size={12} /> Back to Worksheets
          </button>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {template.linked_lesson_number && (
              <span className="text-xs px-2 py-0.5 rounded bg-white/8 text-soft-gray/50 font-medium">
                Lesson {template.linked_lesson_number}
              </span>
            )}
            {stageDef && (
              <span className="text-xs px-2 py-0.5 rounded bg-electric-blue/10 text-electric-blue font-medium">
                Stage {stageDef.stage_number} — {stageDef.name}
              </span>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Students", value: students.length, cls: "text-soft-gray" },
            { label: "Submitted", value: (statusCounts["submitted"] ?? 0) + (statusCounts["reviewed"] ?? 0) + (statusCounts["approved"] ?? 0), cls: "text-vivid-teal" },
            { label: "Awaiting Review", value: statusCounts["submitted"] ?? 0, cls: "text-gold" },
            { label: "Revision Needed", value: statusCounts["revision_requested"] ?? 0, cls: "text-status-warning" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <p className={`text-xl font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-soft-gray/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters + bulk actions */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "submitted", "approved", "revision_requested", "in_progress", "not_started"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-electric-blue text-white"
                    : "bg-white/5 text-soft-gray/50 hover:text-soft-gray hover:bg-white/8"
                }`}
              >
                {s === "all" ? `All (${students.length})` : `${s.replace(/_/g, " ")} (${statusCounts[s] ?? 0})`}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-soft-gray/50">{submittedSelected} selected</span>
              <button
                onClick={() => bulkAction("reviewed")}
                disabled={bulkSaving}
                className="px-3 py-1.5 rounded-lg bg-status-success/80 text-white text-xs font-medium hover:bg-status-success disabled:opacity-50 transition-colors"
              >
                Approve All
              </button>
              <button
                onClick={() => bulkAction("revision_requested")}
                disabled={bulkSaving}
                className="px-3 py-1.5 rounded-lg bg-status-warning/20 text-status-warning text-xs font-medium hover:bg-status-warning/30 disabled:opacity-50 transition-colors"
              >
                Request Revision All
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-status-error">{error}</p>}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <Users size={24} className="mx-auto text-soft-gray/20 mb-2" />
            <p className="text-soft-gray/40 text-sm">No students match this filter.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[11px] text-soft-gray/40 uppercase tracking-wider">
                  <th className="px-4 py-2.5 w-8">
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-white/5 accent-electric-blue"
                      checked={selected.size > 0 && selected.size === filtered.filter((s) => s.submission?.status === "submitted").length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="text-left px-4 py-2.5">Student</th>
                  <th className="text-left px-4 py-2.5 hidden sm:table-cell">Cohort</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5 hidden md:table-cell">Submitted</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => {
                  const submission = student.submission;
                  const status = submission?.status ?? "not_started";
                  const isSelectable = status === "submitted";
                  const isSelected = submission ? selected.has(submission.id) : false;

                  return (
                    <tr
                      key={student.user_id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {isSelectable && submission && (
                          <input
                            type="checkbox"
                            className="rounded border-white/20 bg-white/5 accent-electric-blue"
                            checked={isSelected}
                            onChange={() => toggleSelect(submission.id)}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-soft-gray">{student.display_name}</p>
                        <p className="text-xs text-soft-gray/40">{student.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-soft-gray/50 text-xs">
                        {student.cohort?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} />
                          {(submission?.version_number ?? 1) > 1 && (
                            <span className="text-[10px] text-gold font-medium">v{submission!.version_number}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-soft-gray/40 text-xs tabular-nums">
                        {formatDate(submission?.submitted_at ?? null)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {submission ? (
                          <Link
                            href={`/teacher/worksheets/review/${submission.id}`}
                            className="flex items-center justify-end gap-1 text-electric-blue text-xs hover:underline"
                          >
                            Review <ChevronRight size={12} />
                          </Link>
                        ) : (
                          <Link
                            href={`/teacher/students/${student.user_id}`}
                            className="text-soft-gray/30 text-xs hover:text-soft-gray/60"
                          >
                            View Student
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
