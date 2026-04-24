'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/admin/Shell";
import Input from "@/components/forms/Input";
import SchemaBuilder from "@/components/forms/SchemaBuilder";
import type { SchemaField } from "@/components/forms/SchemaBuilder";

export default function EditWorksheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [templateType, setTemplateType] = useState("general");
  const [scoringType, setScoringType] = useState("none");
  const [requiredStatus, setRequiredStatus] = useState("optional");
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/worksheets/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setTitle(d.title ?? "");
        setDescription(d.description ?? "");
        setInstructions(d.instructions ?? "");
        setTemplateType(d.template_type ?? "general");
        setScoringType(d.scoring_type ?? "none");
        setRequiredStatus(d.required_status ?? "optional");
        setFields(Array.isArray(d.fields_schema) ? d.fields_schema : []);
      })
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/worksheets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        instructions: instructions || null,
        fields_schema: fields,
        template_type: templateType,
        scoring_type: scoringType,
        required_status: requiredStatus,
      }),
    });

    if (res.ok) {
      router.push("/admin/worksheets");
    } else {
      const d = await res.json();
      setError(d.error ?? "Error saving");
    }
    setLoading(false);
  }

  if (fetching) {
    return (
      <Shell title="Edit Worksheet">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell title="Edit Worksheet Template">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft-gray/70">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft-gray/70">Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-soft-gray/70">Type</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
              >
                <option value="general" className="bg-deep-navy">General</option>
                <option value="checkpoint" className="bg-deep-navy">Checkpoint</option>
                <option value="reflection" className="bg-deep-navy">Reflection</option>
                <option value="planning" className="bg-deep-navy">Planning</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-soft-gray/70">Scoring</label>
              <select
                value={scoringType}
                onChange={(e) => setScoringType(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
              >
                <option value="none" className="bg-deep-navy">None</option>
                <option value="rubric" className="bg-deep-navy">Rubric</option>
                <option value="manual" className="bg-deep-navy">Manual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-soft-gray/70">Required</label>
              <select
                value={requiredStatus}
                onChange={(e) => setRequiredStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
              >
                <option value="optional" className="bg-deep-navy">Optional</option>
                <option value="required" className="bg-deep-navy">Required</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-soft-gray/70">Form Fields</p>
            <SchemaBuilder fields={fields} onChange={setFields} />
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
