"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, Save, X, Eye } from "lucide-react";

interface Props {
  studentUserId: string;
  studentName: string;
  gradeLevel?: string | null;
  school?: string | null;
  projectTitle?: string | null;
  projectDescription?: string | null;
  currentMethodStage?: number | null;
  teacherName?: string;
  senderRole: string;
  backHref: string;
}

const UPDATE_TYPES = [
  { value: "intake_summary", label: "Intake Summary" },
  { value: "mid_program", label: "Mid-Program Progress" },
  { value: "milestone", label: "Milestone Achievement" },
  { value: "concern", label: "Progress Concern" },
  { value: "showcase", label: "Showcase Invitation" },
  { value: "final_summary", label: "Final Summary" },
];

export default function ParentUpdateComposer({
  studentUserId,
  studentName,
  gradeLevel,
  school,
  projectTitle,
  projectDescription,
  currentMethodStage,
  teacherName,
  senderRole,
  backHref,
}: Props) {
  const router = useRouter();
  const [updateType, setUpdateType] = useState("mid_program");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAiDraft() {
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/parent-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateType,
          studentName,
          gradeLevel,
          school,
          currentMethodStage,
          projectTitle,
          projectDescription,
          teacherName,
        }),
      });
      if (!res.ok) throw new Error("AI draft failed");
      const data = await res.json();
      if (data.subject) setSubject(data.subject);
      if (data.body) setBody(data.body);
    } catch {
      setError("AI draft unavailable — please write manually.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave(action: "draft" | "submit") {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/parent-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_user_id: studentUserId,
          update_type: updateType,
          subject,
          body,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSuccess(
        action === "submit"
          ? senderRole === "super_admin"
            ? "Update sent successfully."
            : "Update submitted for admin approval."
          : "Draft saved."
      );
      setTimeout(() => router.push(backHref), 1800);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Update type */}
      <div>
        <label className="block text-xs text-soft-gray/50 uppercase tracking-wider mb-2">
          Update Type
        </label>
        <select
          value={updateType}
          onChange={(e) => setUpdateType(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-soft-gray text-sm focus:outline-none focus:border-electric-blue/50"
        >
          {UPDATE_TYPES.map((t) => (
            <option key={t.value} value={t.value} className="bg-deep-navy">
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* AI Draft button */}
      <button
        onClick={handleAiDraft}
        disabled={aiLoading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet/20 text-violet border border-violet/30 text-sm font-medium hover:bg-violet/30 transition-colors disabled:opacity-50"
      >
        <Sparkles size={15} />
        {aiLoading ? "Generating draft…" : "AI Draft"}
      </button>

      {/* Subject */}
      <div>
        <label className="block text-xs text-soft-gray/50 uppercase tracking-wider mb-2">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Progress Update: Week 6"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs text-soft-gray/50 uppercase tracking-wider mb-2">
          Message Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder="Write your update here…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50 resize-y"
        />
      </div>

      {/* Errors / Success */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-vivid-teal text-sm bg-vivid-teal/10 border border-vivid-teal/20 rounded-lg px-4 py-3">
          {success}
        </p>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-deep-navy border border-white/10 rounded-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Preview</h2>
              <button onClick={() => setPreview(false)}>
                <X size={18} className="text-soft-gray/50" />
              </button>
            </div>
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Subject</p>
            <p className="text-soft-gray font-semibold mb-4">{subject || "(no subject)"}</p>
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Body</p>
            <div className="text-soft-gray/80 text-sm whitespace-pre-wrap leading-relaxed">
              {body || "(empty)"}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => setPreview(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-soft-gray/60 text-sm hover:text-soft-gray hover:border-white/20 transition-colors"
        >
          <Eye size={14} />
          Preview
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-soft-gray/60 text-sm hover:text-soft-gray hover:border-white/20 transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          Save Draft
        </button>
        <button
          onClick={() => handleSave("submit")}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors disabled:opacity-50 ml-auto"
        >
          <Send size={14} />
          {senderRole === "super_admin" ? "Send Email" : "Submit for Approval"}
        </button>
      </div>
    </div>
  );
}
