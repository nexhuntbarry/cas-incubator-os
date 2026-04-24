"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Eye, X } from "lucide-react";

interface Update {
  id: string;
  subject: string;
  body: string;
  update_type: string;
  sent_status: string;
  created_at: string;
  student: { display_name: string; email: string } | null;
  author: { display_name: string } | null;
}

export default function ApprovalQueueClient({ initialUpdates }: { initialUpdates: Update[] }) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [preview, setPreview] = useState<Update | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject") {
    setBusy(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/parent-updates/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      setUpdates((prev) => prev.filter((u) => u.id !== id));
      setMsg(action === "approve" ? "Update approved and sent." : "Update rejected.");
    } catch {
      setMsg("Action failed — please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {msg && (
        <p className="text-sm px-4 py-3 rounded-lg bg-vivid-teal/10 border border-vivid-teal/20 text-vivid-teal">
          {msg}
        </p>
      )}

      {updates.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-soft-gray/50">No updates pending approval.</p>
        </div>
      ) : (
        updates.map((u) => (
          <div key={u.id} className="rounded-xl border border-white/8 bg-white/3 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-soft-gray truncate">{u.subject}</p>
                <p className="text-xs text-soft-gray/50 mt-1">
                  Student: {u.student?.display_name ?? "—"} &middot; By:{" "}
                  {u.author?.display_name ?? "—"} &middot;{" "}
                  {new Date(u.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-soft-gray/60 mt-2 line-clamp-2">{u.body}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setPreview(u)}
                  className="p-2 rounded-lg border border-white/10 text-soft-gray/50 hover:text-soft-gray hover:border-white/20 transition-colors"
                  title="Preview"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => handleAction(u.id, "approve")}
                  disabled={busy === u.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-vivid-teal/15 text-vivid-teal text-sm font-medium hover:bg-vivid-teal/25 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  onClick={() => handleAction(u.id, "reject")}
                  disabled={busy === u.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-deep-navy border border-white/10 rounded-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Update Preview</h2>
              <button onClick={() => setPreview(null)}>
                <X size={18} className="text-soft-gray/50 hover:text-soft-gray" />
              </button>
            </div>
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">To</p>
            <p className="text-soft-gray mb-4">
              {preview.student?.display_name} &middot; {preview.student?.email}
            </p>
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Subject</p>
            <p className="font-semibold text-soft-gray mb-4">{preview.subject}</p>
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Body</p>
            <div className="text-soft-gray/80 text-sm whitespace-pre-wrap leading-relaxed">
              {preview.body}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { handleAction(preview.id, "approve"); setPreview(null); }}
                className="flex-1 py-2.5 rounded-lg bg-vivid-teal/15 text-vivid-teal text-sm font-semibold hover:bg-vivid-teal/25 transition-colors"
              >
                Approve & Send
              </button>
              <button
                onClick={() => { handleAction(preview.id, "reject"); setPreview(null); }}
                className="flex-1 py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
