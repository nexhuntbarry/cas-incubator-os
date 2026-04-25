'use client';

import { useEffect, useState } from "react";
import AssignmentCard from "./AssignmentCard";
import { ClipboardList } from "lucide-react";

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

export default function StudentTodoSection() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/assignments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAssignments(data);
      })
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-electric-blue" />
          <h2 className="text-base font-semibold text-soft-gray">Your To-Do</h2>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList size={16} className="text-electric-blue" />
          <h2 className="text-base font-semibold text-soft-gray">Your To-Do</h2>
        </div>
        <p className="text-sm text-soft-gray/40">No pending assignments. You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-electric-blue/20 bg-electric-blue/5 p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-electric-blue" />
          <h2 className="text-base font-semibold text-soft-gray">Your To-Do</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-electric-blue text-white">
          {assignments.length}
        </span>
      </div>
      <div className="space-y-2">
        {assignments.map((a) => (
          <AssignmentCard key={a.id} assignment={a} />
        ))}
      </div>
    </div>
  );
}
