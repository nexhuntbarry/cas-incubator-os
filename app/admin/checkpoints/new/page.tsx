'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/admin/Shell";
import Input from "@/components/forms/Input";

export default function NewCheckpointPage() {
  const router = useRouter();
  const [checkpointName, setCheckpointName] = useState("");
  const [checkpointNumber, setCheckpointNumber] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState("");
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [worksheets, setWorksheets] = useState<{ id: string; title: string }[]>([]);
  const [rubrics, setRubrics] = useState<{ id: string; name: string }[]>([]);
  const [selectedWorksheets, setSelectedWorksheets] = useState<string[]>([]);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/programs").then((r) => r.json()),
      fetch("/api/admin/worksheets").then((r) => r.json()),
      fetch("/api/admin/rubrics").then((r) => r.json()),
    ]).then(([p, w, r]) => {
      setPrograms(Array.isArray(p) ? p : []);
      setWorksheets(Array.isArray(w) ? w : []);
      setRubrics(Array.isArray(r) ? r : []);
    });
  }, []);

  function toggleItem(id: string, list: string[], setList: (l: string[]) => void) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkpointName.trim() || !checkpointNumber) {
      setError("Name and number are required.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/checkpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        program_id: programId || null,
        checkpoint_name: checkpointName,
        checkpoint_number: Number(checkpointNumber),
        description: description || null,
        required_artifacts_json: selectedWorksheets,
        required_rubrics_json: selectedRubrics,
      }),
    });

    if (res.ok) {
      router.push("/admin/checkpoints");
    } else {
      const d = await res.json();
      setError(d.error ?? "Error saving checkpoint");
    }
    setLoading(false);
  }

  return (
    <Shell title="New Checkpoint Template" introKey="admin.newCheckpoint">
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
            <label className="block text-sm font-medium text-soft-gray/70">Program</label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
            >
              <option value="" className="bg-deep-navy">— No program —</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="bg-deep-navy">{p.name}</option>
              ))}
            </select>
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

          {/* Required worksheets */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-soft-gray/70">Required Worksheets</p>
            <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg border border-white/10 p-3">
              {worksheets.length === 0 && (
                <p className="text-xs text-soft-gray/40">No worksheets available</p>
              )}
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

          {/* Required rubrics */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-soft-gray/70">Required Rubrics</p>
            <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg border border-white/10 p-3">
              {rubrics.length === 0 && (
                <p className="text-xs text-soft-gray/40">No rubrics available</p>
              )}
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
              {loading ? "Saving…" : "Save Checkpoint"}
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
