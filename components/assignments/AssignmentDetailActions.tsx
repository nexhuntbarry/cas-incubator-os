'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X, RefreshCw } from "lucide-react";

interface AssignmentDetailActionsProps {
  assignmentId: string;
  currentStatus: string;
  pendingCount: number;
}

export default function AssignmentDetailActions({
  assignmentId,
  currentStatus,
  pendingCount,
}: AssignmentDetailActionsProps) {
  const router = useRouter();
  const [reminding, setReminding] = useState(false);
  const [reminded, setReminded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [extending, setExtending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemindAll() {
    setReminding(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/worksheet-assignments/${assignmentId}/remind`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to send reminders.");
        return;
      }
      setReminded(true);
    } finally {
      setReminding(false);
    }
  }

  async function handleClose() {
    setClosing(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/worksheet-assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to close assignment.");
        return;
      }
      router.refresh();
    } finally {
      setClosing(false);
    }
  }

  async function handleExtend(e: React.FormEvent) {
    e.preventDefault();
    if (!newDueDate) return;
    setExtending(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/worksheet-assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ due_date: new Date(newDueDate).toISOString() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to extend deadline.");
        return;
      }
      setExtendOpen(false);
      router.refresh();
    } finally {
      setExtending(false);
    }
  }

  if (currentStatus !== "open") return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pendingCount > 0 && (
        <button
          onClick={handleRemindAll}
          disabled={reminding || reminded}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-soft-gray/70 hover:text-soft-gray hover:border-white/20 disabled:opacity-40 transition-colors"
        >
          <Send size={12} />
          {reminding ? "Sending…" : reminded ? `Sent to ${pendingCount}` : `Remind all pending (${pendingCount})`}
        </button>
      )}

      <button
        onClick={() => setExtendOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-soft-gray/70 hover:text-soft-gray hover:border-white/20 transition-colors"
      >
        <RefreshCw size={12} />
        Extend deadline
      </button>

      <button
        onClick={handleClose}
        disabled={closing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-status-error/20 text-xs text-status-error/70 hover:text-status-error hover:border-status-error/40 disabled:opacity-40 transition-colors"
      >
        <X size={12} />
        {closing ? "Closing…" : "Close assignment"}
      </button>

      {extendOpen && (
        <form onSubmit={handleExtend} className="flex items-center gap-2 w-full mt-1">
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-soft-gray focus:outline-none focus:border-electric-blue/50"
          />
          <button
            type="submit"
            disabled={extending}
            className="px-3 py-1.5 rounded-lg bg-electric-blue/15 text-electric-blue text-xs font-medium hover:bg-electric-blue/25 disabled:opacity-50 transition-colors"
          >
            {extending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setExtendOpen(false)}
            className="text-xs text-soft-gray/40 hover:text-soft-gray transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {error && <p className="text-xs text-status-error w-full">{error}</p>}
    </div>
  );
}
