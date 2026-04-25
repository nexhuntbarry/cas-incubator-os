'use client';

import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, FileText, Send } from "lucide-react";

interface StudentRow {
  user_id: string;
  display_name: string;
  email: string;
  status: string;
  submission_id: string | null;
  submitted_at: string | null;
  feedback: string | null;
}

interface StudentSubmissionTableProps {
  students: StudentRow[];
  assignmentId: string;
  onRemind?: (userId: string) => Promise<void>;
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  not_started: {
    label: "Not Started",
    cls: "bg-white/5 text-soft-gray/40",
    icon: <FileText size={12} />,
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-electric-blue/15 text-electric-blue",
    icon: <Clock size={12} />,
  },
  submitted: {
    label: "Submitted",
    cls: "bg-status-success/15 text-status-success",
    icon: <CheckCircle size={12} />,
  },
  reviewed: {
    label: "Reviewed",
    cls: "bg-vivid-teal/15 text-vivid-teal",
    icon: <CheckCircle size={12} />,
  },
  approved: {
    label: "Approved",
    cls: "bg-vivid-teal/15 text-vivid-teal",
    icon: <CheckCircle size={12} />,
  },
  revision_requested: {
    label: "Revision",
    cls: "bg-status-warning/15 text-status-warning",
    icon: <AlertCircle size={12} />,
  },
  overdue: {
    label: "Overdue",
    cls: "bg-status-error/15 text-status-error",
    icon: <AlertCircle size={12} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.not_started;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function StudentSubmissionTable({
  students,
  assignmentId,
  onRemind,
}: StudentSubmissionTableProps) {
  const [reminding, setReminding] = useState<Set<string>>(new Set());
  const [reminded, setReminded] = useState<Set<string>>(new Set());

  async function handleRemind(userId: string) {
    if (!onRemind) return;
    setReminding((prev) => new Set(prev).add(userId));
    try {
      await onRemind(userId);
      setReminded((prev) => new Set(prev).add(userId));
    } finally {
      setReminding((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/2 p-8 text-center text-soft-gray/40 text-sm">
        No students in this assignment.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-[11px] text-soft-gray/40 uppercase tracking-wider">
            <th className="text-left px-4 py-2.5">Student</th>
            <th className="text-left px-4 py-2.5">Status</th>
            <th className="text-left px-4 py-2.5 hidden sm:table-cell">Submitted</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const canRemind = ["not_started", "in_progress", "overdue"].includes(student.status);
            const isReminding = reminding.has(student.user_id);
            const hasReminded = reminded.has(student.user_id);

            return (
              <tr
                key={student.user_id}
                className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-soft-gray">{student.display_name}</p>
                  <p className="text-[11px] text-soft-gray/40">{student.email}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-soft-gray/50 text-xs tabular-nums">
                  {student.submitted_at
                    ? new Date(student.submitted_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {student.submission_id && (
                      <a
                        href={`/teacher/worksheets/${student.submission_id}`}
                        className="text-xs text-electric-blue hover:underline whitespace-nowrap"
                      >
                        View
                      </a>
                    )}
                    {canRemind && onRemind && (
                      <button
                        onClick={() => handleRemind(student.user_id)}
                        disabled={isReminding || hasReminded}
                        className="inline-flex items-center gap-1 text-xs text-soft-gray/60 hover:text-soft-gray disabled:opacity-40 transition-colors whitespace-nowrap"
                      >
                        <Send size={11} />
                        {isReminding ? "Sending…" : hasReminded ? "Sent" : "Remind"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
