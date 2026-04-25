'use client';

import Link from "next/link";
import { Clock, AlertCircle, FileText } from "lucide-react";

interface Assignment {
  id: string;
  template_id: string;
  due_date: string;
  instructions_override?: string | null;
  worksheet_templates: {
    id: string;
    title: string;
    linked_lesson_number?: number | null;
  } | null;
  users?: { display_name: string } | null;
}

function formatCountdown(due: Date): { label: string; urgent: "red" | "yellow" | "normal" } {
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) {
    return { label: "Overdue", urgent: "red" };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return {
      label: diffHours < 1 ? "Due soon" : `Due in ${diffHours}h`,
      urgent: "red",
    };
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 3) {
    return { label: `Due in ${diffDays}d`, urgent: "yellow" };
  }

  return {
    label: `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    urgent: "normal",
  };
}

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const template = assignment.worksheet_templates;
  const dueDate = new Date(assignment.due_date);
  const { label, urgent } = formatCountdown(dueDate);

  const urgentCls =
    urgent === "red"
      ? "text-status-error"
      : urgent === "yellow"
      ? "text-status-warning"
      : "text-soft-gray/50";

  const borderCls =
    urgent === "red"
      ? "border-status-error/20 bg-status-error/5"
      : urgent === "yellow"
      ? "border-status-warning/20 bg-status-warning/5"
      : "border-white/8 bg-white/3";

  return (
    <Link
      href={`/student/worksheets/${assignment.template_id}?assignment=${assignment.id}`}
      className={`block rounded-xl border p-4 hover:bg-white/5 transition-colors ${borderCls}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText size={14} className="text-electric-blue flex-shrink-0" />
            <p className="font-semibold text-soft-gray truncate">{template?.title ?? "Worksheet"}</p>
            {template?.linked_lesson_number && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-soft-gray/50 font-medium">
                L{template.linked_lesson_number}
              </span>
            )}
          </div>
          {assignment.instructions_override && (
            <p className="text-xs text-soft-gray/50 mt-1 line-clamp-1">
              {assignment.instructions_override}
            </p>
          )}
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${urgentCls}`}>
          {urgent === "red" ? (
            <AlertCircle size={12} className="flex-shrink-0" />
          ) : (
            <Clock size={12} className="flex-shrink-0" />
          )}
          {label}
        </div>
      </div>
    </Link>
  );
}
