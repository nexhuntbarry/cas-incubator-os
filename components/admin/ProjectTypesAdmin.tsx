'use client';

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";

interface ProjectType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  examples: string[];
}

interface ProjectTypesAdminProps {
  initialTypes: ProjectType[];
}

export default function ProjectTypesAdmin({ initialTypes }: ProjectTypesAdminProps) {
  const [types, setTypes] = useState(initialTypes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProjectType>>({});
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ slug: "", name: "", description: "", examples: "[]" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      let examples: string[] = [];
      try { examples = JSON.parse(newForm.examples); } catch { /* ignore */ }
      const res = await fetch("/api/admin/project-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newForm.slug, name: newForm.name, description: newForm.description, examples }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Create failed");
        return;
      }
      const created = await res.json();
      setTypes((prev) => [...prev, created]);
      setCreating(false);
      setNewForm({ slug: "", name: "", description: "", examples: "[]" });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/project-types", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: editForm.name, description: editForm.description, examples: editForm.examples }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Save failed");
        return;
      }
      const updated = await res.json();
      setTypes((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      setEditingId(null);
      setEditForm({});
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteType(id: string) {
    if (!confirm("Delete this project type?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/project-types?id=${id}`, { method: "DELETE" });
      if (res.ok) setTypes((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-soft-gray focus:outline-none focus:border-electric-blue";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-soft-gray/50">{types.length} project types</p>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-electric-blue text-white text-xs font-semibold hover:bg-electric-blue/90"
        >
          <Plus size={14} /> Add Type
        </button>
      </div>

      {creating && (
        <div className="rounded-xl border border-electric-blue/30 bg-electric-blue/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold">New Project Type</h3>
          <input className={inputClass} placeholder="Slug (e.g. productivity_tool)" value={newForm.slug} onChange={(e) => setNewForm((f) => ({ ...f, slug: e.target.value }))} />
          <input className={inputClass} placeholder="Name" value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
          <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Description" value={newForm.description} onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))} />
          <textarea rows={2} className={`${inputClass} resize-none font-mono`} placeholder='["Example 1", ...]' value={newForm.examples} onChange={(e) => setNewForm((f) => ({ ...f, examples: e.target.value }))} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-electric-blue text-white text-xs font-semibold disabled:opacity-50">
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Create
            </button>
            <button onClick={() => { setCreating(false); setError(""); }} className="px-4 py-2 rounded-lg bg-white/8 text-soft-gray/60 text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {types.map((type) => (
          <div key={type.id} className="rounded-xl border border-white/8 bg-white/2 p-4">
            {editingId === type.id ? (
              <div className="space-y-3">
                <input className={inputClass} value={editForm.name ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" />
                <textarea rows={2} className={`${inputClass} resize-none`} value={editForm.description ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" />
                <textarea rows={2} className={`${inputClass} resize-none font-mono`} value={JSON.stringify(editForm.examples ?? [], null, 2)} onChange={(e) => { try { setEditForm((f) => ({ ...f, examples: JSON.parse(e.target.value) })); } catch { /* ignore */ } }} />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-electric-blue text-white text-xs font-semibold disabled:opacity-50">
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                  </button>
                  <button onClick={() => { setEditingId(null); setError(""); }} className="px-4 py-2 rounded-lg bg-white/8 text-soft-gray/60 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs px-1.5 py-0.5 rounded bg-white/8 text-soft-gray/60">{type.slug}</code>
                    <span className="text-sm font-semibold">{type.name}</span>
                  </div>
                  {type.description && <p className="text-xs text-soft-gray/50 mt-1">{type.description}</p>}
                  {type.examples?.length > 0 && (
                    <p className="text-xs text-soft-gray/30 mt-1">{type.examples.length} examples</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setEditingId(type.id); setEditForm({ ...type }); }} className="p-2 rounded-lg hover:bg-white/8 text-soft-gray/50 hover:text-soft-gray">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteType(type.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-soft-gray/30 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
