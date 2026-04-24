"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";

interface StaffMember {
  id: string;
  display_name: string;
  role: string;
}

interface Props {
  flagId: string;
  currentStatus: string;
  staffList: StaffMember[];
}

export default function RiskFlagActions({ flagId, currentStatus, staffList }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleUpdate(newStatus?: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/risk-flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus ?? status,
          resolution_notes: notes || undefined,
          assigned_to_user_id: assignTo || undefined,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      if (newStatus) setStatus(newStatus);
      setMsg("Risk flag updated.");
      router.refresh();
    } catch {
      setMsg("Update failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const isResolved = status === "resolved" || status === "dismissed";

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-4">
      <h3 className="font-semibold text-soft-gray">Actions</h3>

      {/* Reassign */}
      <div>
        <label className="block text-xs text-soft-gray/40 uppercase tracking-wider mb-2">
          Reassign To
        </label>
        <select
          value={assignTo}
          onChange={(e) => setAssignTo(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-soft-gray text-sm focus:outline-none focus:border-electric-blue/50"
        >
          <option value="" className="bg-deep-navy">
            — Keep current —
          </option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id} className="bg-deep-navy">
              {s.display_name} ({s.role})
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-soft-gray/40 uppercase tracking-wider mb-2">
          Resolution Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add notes on action taken…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50 resize-none"
        />
      </div>

      {msg && (
        <p className="text-sm text-vivid-teal bg-vivid-teal/10 border border-vivid-teal/20 rounded-lg px-4 py-2.5">
          {msg}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleUpdate("in_progress")}
          disabled={busy || isResolved}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/15 text-yellow-400 text-sm font-medium hover:bg-yellow-500/25 transition-colors disabled:opacity-40"
        >
          <RotateCcw size={14} />
          Mark In Progress
        </button>
        <button
          onClick={() => handleUpdate("resolved")}
          disabled={busy || isResolved}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vivid-teal/15 text-vivid-teal text-sm font-medium hover:bg-vivid-teal/25 transition-colors disabled:opacity-40"
        >
          <CheckCircle size={14} />
          Mark Resolved
        </button>
        <button
          onClick={() => handleUpdate("dismissed")}
          disabled={busy || isResolved}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-soft-gray/60 text-sm hover:text-soft-gray hover:border-white/20 transition-colors disabled:opacity-40"
        >
          <XCircle size={14} />
          Dismiss
        </button>
        {(assignTo || notes) && (
          <button
            onClick={() => handleUpdate()}
            disabled={busy}
            className="px-4 py-2.5 rounded-lg bg-electric-blue/15 text-electric-blue text-sm font-medium hover:bg-electric-blue/25 transition-colors disabled:opacity-40 ml-auto"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
