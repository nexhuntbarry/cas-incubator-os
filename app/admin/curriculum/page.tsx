'use client';

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Shell from "@/components/admin/Shell";
import { Upload, Trash2, Plus } from "lucide-react";

type Asset = {
  id: string;
  title: string;
  asset_type: string;
  url: string | null;
  lesson_number: number | null;
  visibility_scope: string[];
  sort_order: number;
  created_at: string;
};

const ASSET_TYPES = ["video", "pdf", "slide", "worksheet", "template", "link", "other"];

export default function AdminCurriculumPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [assetType, setAssetType] = useState("pdf");
  const [url, setUrl] = useState("");
  const [lessonNumber, setLessonNumber] = useState("");
  const [programId, setProgramId] = useState("");
  const [visibilityScope, setVisibilityScope] = useState<string[]>(["teacher", "mentor", "student"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/curriculum").then((r) => r.json()),
      fetch("/api/admin/programs").then((r) => r.json()),
    ]).then(([a, p]) => {
      setAssets(Array.isArray(a) ? a : []);
      setPrograms(Array.isArray(p) ? p : []);
    }).finally(() => setLoading(false));
  }, []);

  function toggleVisibility(role: string) {
    setVisibilityScope((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assetType) {
      setError("Title and type are required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        asset_type: assetType,
        url: url || null,
        lesson_number: lessonNumber ? Number(lessonNumber) : null,
        program_id: programId || null,
        visibility_scope: visibilityScope,
      }),
    });

    if (res.ok) {
      const updated = await fetch("/api/admin/curriculum").then((r) => r.json());
      setAssets(Array.isArray(updated) ? updated : []);
      setShowForm(false);
      setTitle("");
      setUrl("");
      setLessonNumber("");
    } else {
      const d = await res.json();
      setError(d.error ?? "Error saving");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this asset?")) return;
    await fetch(`/api/admin/curriculum/${id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <Shell title="Curriculum Assets">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell title="Curriculum Assets">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
        >
          <Plus size={14} />
          Add Asset
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/3 p-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-soft-gray/70">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-soft-gray/70">Type</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-deep-navy">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-soft-gray/70">URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-soft-gray/70">Lesson #</label>
                <input
                  type="number"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-soft-gray/70">Program</label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
              >
                <option value="" className="bg-deep-navy">— All programs —</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id} className="bg-deep-navy">{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-soft-gray/70">Visible to</p>
              <div className="flex gap-4">
                {["student", "teacher", "mentor"].map((role) => (
                  <label key={role} className="flex items-center gap-1.5 cursor-pointer text-sm text-soft-gray/70">
                    <input
                      type="checkbox"
                      checked={visibilityScope.includes(role)}
                      onChange={() => toggleVisibility(role)}
                      className="accent-electric-blue"
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-status-error">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Add Asset"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-soft-gray/50 hover:text-soft-gray hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">Lesson</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">Visible to</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-soft-gray/30 text-sm">
                  No assets yet.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-soft-gray/60 font-mono text-xs">
                    {asset.lesson_number ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-soft-gray/80">
                    {asset.url ? (
                      <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline">
                        {asset.title}
                      </a>
                    ) : (
                      asset.title
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/8 text-soft-gray/60">
                      {asset.asset_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-soft-gray/50 text-xs">
                    {(asset.visibility_scope ?? []).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1 rounded hover:bg-status-error/10 transition-colors"
                    >
                      <Trash2 size={14} className="text-status-error/60" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
