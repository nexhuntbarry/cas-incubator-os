'use client';

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";

interface Stage {
  id: string;
  stage_number: number;
  name: string;
  description: string | null;
  expected_outputs_json: string[];
  guiding_questions: string[];
}

interface MethodStagesAdminProps {
  initialStages: Stage[];
}

export default function MethodStagesAdmin({ initialStages }: MethodStagesAdminProps) {
  const [stages, setStages] = useState(initialStages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Stage>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function startEdit(stage: Stage) {
    setEditingId(stage.id);
    setEditForm({ ...stage });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
    setError("");
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/method-stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name,
          description: editForm.description,
          expectedOutputsJson: editForm.expected_outputs_json,
          guidingQuestions: editForm.guiding_questions,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Save failed");
        return;
      }
      const updated = await res.json();
      setStages((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      cancelEdit();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteStage(id: string) {
    if (!confirm("Delete this stage? This may affect existing student progress.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/method-stages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setStages((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-soft-gray/50">{stages.length} stages defined</p>
      </div>

      <div className="space-y-3">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="rounded-xl border border-white/8 bg-white/2 p-5 space-y-3"
          >
            {editingId === stage.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-electric-blue">Stage {stage.stage_number}</span>
                </div>
                <input
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-soft-gray focus:outline-none focus:border-electric-blue"
                  value={editForm.name ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Stage name"
                />
                <textarea
                  rows={2}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none"
                  value={editForm.description ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                />
                <textarea
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none font-mono"
                  value={JSON.stringify(editForm.expected_outputs_json ?? [], null, 2)}
                  onChange={(e) => {
                    try { setEditForm((f) => ({ ...f, expected_outputs_json: JSON.parse(e.target.value) })); } catch { /* ignore */ }
                  }}
                  placeholder='["Expected output 1", ...]'
                />
                <textarea
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none font-mono"
                  value={JSON.stringify(editForm.guiding_questions ?? [], null, 2)}
                  onChange={(e) => {
                    try { setEditForm((f) => ({ ...f, guiding_questions: JSON.parse(e.target.value) })); } catch { /* ignore */ }
                  }}
                  placeholder='["Guiding question 1?", ...]'
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-electric-blue text-white text-xs font-semibold hover:bg-electric-blue/90 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/8 text-soft-gray/60 text-xs hover:bg-white/12"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-electric-blue">Stage {stage.stage_number}</span>
                    </div>
                    <h3 className="text-sm font-semibold">{stage.name}</h3>
                    {stage.description && (
                      <p className="text-xs text-soft-gray/50 mt-1">{stage.description}</p>
                    )}
                    <div className="mt-2 flex gap-4 text-xs text-soft-gray/40">
                      <span>{(stage.expected_outputs_json ?? []).length} expected outputs</span>
                      <span>{(stage.guiding_questions ?? []).length} guiding questions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(stage)}
                      className="p-2 rounded-lg hover:bg-white/8 text-soft-gray/50 hover:text-soft-gray transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteStage(stage.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-soft-gray/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
