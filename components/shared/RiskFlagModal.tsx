"use client";

import { useState } from "react";
import { X, Sparkles, Flag } from "lucide-react";

const FLAG_TYPES = [
  { value: "no_progress", label: "No Progress" },
  { value: "scope_too_broad", label: "Scope Too Broad" },
  { value: "quality_concern", label: "Quality Concern" },
  { value: "attendance", label: "Attendance" },
  { value: "conflict", label: "Conflict" },
  { value: "other", label: "Other" },
];

const SEVERITIES = ["low", "medium", "high", "critical"];

interface StaffMember {
  id: string;
  display_name: string;
  role: string;
}

interface Props {
  studentUserId: string;
  studentName: string;
  projectId?: string;
  staffList?: StaffMember[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RiskFlagModal({
  studentUserId,
  studentName,
  projectId,
  staffList = [],
  onClose,
  onSuccess,
}: Props) {
  const [flagType, setFlagType] = useState("no_progress");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    suggestedSeverity: string;
    suggestedOwner: string;
    reasoning: string;
    recommendedActions: string[];
  } | null>(null);

  async function handleAiSuggest() {
    if (!description.trim()) {
      setError("Write a description first for AI suggestions.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/risk-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          rawDescription: description,
        }),
      });
      if (!res.ok) throw new Error("AI unavailable");
      const data = await res.json();
      setAiSuggestion(data);
      if (data.suggestedSeverity) setSeverity(data.suggestedSeverity);
    } catch {
      setError("AI suggestions unavailable — set manually.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/risk-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_user_id: studentUserId,
          project_id: projectId,
          flag_type: flagType,
          severity,
          description,
          assigned_to_user_id: assignTo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setError("An open flag of this type already exists for this student.");
          return;
        }
        throw new Error(data.error ?? "Failed");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-deep-navy border border-white/10 rounded-2xl max-w-lg w-full p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-yellow-400" />
            <h2 className="text-lg font-bold">Flag Risk — {studentName}</h2>
          </div>
          <button onClick={onClose}>
            <X size={18} className="text-soft-gray/50 hover:text-soft-gray" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Flag type */}
          <div>
            <label className="block text-xs text-soft-gray/40 uppercase tracking-wider mb-2">
              Flag Type
            </label>
            <select
              value={flagType}
              onChange={(e) => setFlagType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-soft-gray text-sm focus:outline-none focus:border-electric-blue/50"
            >
              {FLAG_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-deep-navy">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs text-soft-gray/40 uppercase tracking-wider mb-2">
              Severity
            </label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    severity === s
                      ? s === "critical"
                        ? "bg-red-500 text-white"
                        : s === "high"
                        ? "bg-orange-500 text-white"
                        : s === "medium"
                        ? "bg-yellow-500 text-deep-navy"
                        : "bg-green-500 text-deep-navy"
                      : "border border-white/10 text-soft-gray/60 hover:border-white/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-soft-gray/40 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the concern in detail…"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50 resize-none"
            />
          </div>

          {/* AI Suggest */}
          <button
            onClick={handleAiSuggest}
            disabled={aiLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet/15 text-violet border border-violet/30 text-xs font-medium hover:bg-violet/25 transition-colors disabled:opacity-50"
          >
            <Sparkles size={13} />
            {aiLoading ? "Analyzing…" : "AI Suggest Severity & Owner"}
          </button>

          {/* AI suggestion box */}
          {aiSuggestion && (
            <div className="bg-violet/8 border border-violet/20 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-violet">AI Recommendation</p>
              <p className="text-xs text-soft-gray/70">{aiSuggestion.reasoning}</p>
              {aiSuggestion.recommendedActions.length > 0 && (
                <ul className="text-xs text-soft-gray/60 list-disc list-inside space-y-0.5">
                  {aiSuggestion.recommendedActions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Assign to */}
          {staffList.length > 0 && (
            <div>
              <label className="block text-xs text-soft-gray/40 uppercase tracking-wider mb-2">
                Assign To
              </label>
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-soft-gray text-sm focus:outline-none focus:border-electric-blue/50"
              >
                <option value="" className="bg-deep-navy">
                  — Unassigned —
                </option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-deep-navy">
                    {s.display_name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-soft-gray/60 text-sm hover:text-soft-gray hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create Risk Flag"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
