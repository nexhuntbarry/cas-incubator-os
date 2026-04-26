'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/admin/Shell";
import Input from "@/components/forms/Input";

export default function EditCheckpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [checkpointName, setCheckpointName] = useState("");
  const [checkpointNumber, setCheckpointNumber] = useState("");
  const [description, setDescription] = useState("");
  const [activeStatus, setActiveStatus] = useState(true);
  const [worksheets, setWorksheets] = useState<{ id: string; title: string }[]>([]);
  const [rubrics, setRubrics] = useState<{ id: string; name: string }[]>([]);
  const [selectedWorksheets, setSelectedWorksheets] = useState<string[]>([]);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/checkpoints/${id}`).then((r) => r.json()),
      fetch("/api/admin/worksheets").then((r) => r.json()),
      fetch("/api/admin/rubrics").then((r) => r.json()),
    ]).then(([c, w, r]) => {
      setCheckpointName(c.checkpoint_name ?? "");
      setCheckpointNumber(String(c.checkpoint_number ?? ""));
      setDescription(c.description ?? "");
      setActiveStatus(c.active_status ?? true);
      setSelectedWorksheets(Array.isArray(c.required_artifacts_json) ? c.required_artifacts_json : []);
      setSelectedRubrics(Array.isArray(c.required_rubrics_json) ? c.required_rubrics_json : []);
      setWorksheets(Array.isArray(w) ? w : []);
      setRubrics(Array.isArray(r) ? r : []);
    }).finally(() => setFetching(false));
  }, [id]);

  function toggleItem(itemId: string, list: string[], setList: (l: string[]) => void) {
    setList(list.includes(itemId) ? list.filter((x) => x !== itemId) : [...list, itemId]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/checkpoints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkpoint_name: checkpointName,
        checkpoint_number: Number(checkpointNumber),
        description: description || null,
        active_status: activeStatus,
        required_artifacts_json: selectedWorksheets,
        required_rubrics_json: selectedRubrics,
      }),
    });

    if (res.ok) {
      router.push("/admin/checkpoints");
    } else {
      const d = await res.json();
      setError(d.error ?? "Error saving");
    }
    setLoading(false);
  }

  if (fetching) {
    return (
      <Shell title="Edit Checkpoint">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell title="Edit Checkpoint Template" introKey="admin.editCheckpoint">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Checkpoint Name"
              value={checkpointName}
              onChange={(e) => setCheckpointName(e.target.value)}
              required
            />
            <Input
              label="Number"
              type="number"
              value={checkpointNumber}
              onChange={(e) => setCheckpointNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft-gray/70">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeStatus}
              onChange={(e) => setActiveStatus(e.target.checked)}
              className="accent-electric-blue"
            />
            <span className="text-sm text-soft-gray/70">Active</span>
          </label>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-soft-gray/70">Required Worksheets</p>
            <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg border border-white/10 p-3">
              {worksheets.map((w) => (
                <label key={w.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWorksheets.includes(w.id)}
                    onChange={() => toggleItem(w.id, selectedWorksheets, setSelectedWorksheets)}
                    className="accent-electric-blue"
                  />
                  <span className="text-sm text-soft-gray/80">{w.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-soft-gray/70">Required Rubrics</p>
            <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg border border-white/10 p-3">
              {rubrics.map((r) => (
                <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRubrics.includes(r.id)}
                    onChange={() => toggleItem(r.id, selectedRubrics, setSelectedRubrics)}
                    className="accent-electric-blue"
                  />
                  <span className="text-sm text-soft-gray/80">{r.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-status-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg text-sm text-soft-gray/50 hover:text-soft-gray hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
