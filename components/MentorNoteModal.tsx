'use client';

import { useState } from "react";
import { X } from "lucide-react";

interface MentorNoteModalProps {
  studentUserId: string;
  projectId: string;
  onClose: () => void;
  onSaved?: () => void;
}

const NOTE_TYPES = [
  { value: "check_in", label: "Check-in" },
  { value: "checkpoint_review", label: "Checkpoint Review" },
  { value: "risk_flag", label: "Risk Flag" },
  { value: "intervention", label: "Intervention" },
  { value: "summary", label: "Summary" },
];

export default function MentorNoteModal({
  studentUserId,
  projectId,
  onClose,
  onSaved,
}: MentorNoteModalProps) {
  const [noteType, setNoteType] = useState("check_in");
  const [noteBody, setNoteBody] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [escalation, setEscalation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!noteBody.trim()) {
      setError("Note body is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/mentor/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_user_id: studentUserId,
          project_id: projectId,
          note_type: noteType,
          note_body: noteBody,
          recommended_next_step: nextStep || null,
          escalation_flag: escalation,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save note.");
        return;
      }
      onSaved?.();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-deep-navy shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-soft-gray">Leave a Note</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-white/8 transition-colors"
          >
            <X size={16} className="text-soft-gray/50" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {/* Note type */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-soft-gray/60">
              Note Type
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
            >
              {NOTE_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-deep-navy">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note body */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-soft-gray/60">
              Note <span className="text-status-error">*</span>
            </label>
            <textarea
              rows={4}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
              placeholder="What was discussed / observed?"
            />
          </div>

          {/* Recommended next step */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-soft-gray/60">
              Recommended Next Step
            </label>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
              placeholder="Optional"
            />
          </div>

          {/* Escalation toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={escalation}
              onChange={(e) => setEscalation(e.target.checked)}
              className="accent-status-error"
            />
            <span className="text-sm text-soft-gray/70">
              Flag for escalation
            </span>
          </label>

          {error && <p className="text-sm text-status-error">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-soft-gray/50 hover:text-soft-gray hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
