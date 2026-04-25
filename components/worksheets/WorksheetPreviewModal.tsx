'use client';

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import SchemaForm from "@/components/forms/SchemaForm";
import type { SchemaField } from "@/components/forms/SchemaBuilder";

interface WorksheetPreviewModalProps {
  templateId: string;
  onClose: () => void;
}

interface Template {
  title: string;
  instructions: string | null;
  fields_schema: SchemaField[];
}

export default function WorksheetPreviewModal({ templateId, onClose }: WorksheetPreviewModalProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/worksheets/${templateId}`)
      .then((r) => r.json())
      .then(setTemplate)
      .finally(() => setLoading(false));
  }, [templateId]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-deep-navy shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8">
          <div>
            <p className="text-[11px] text-soft-gray/40 uppercase tracking-wider mb-0.5">Worksheet Preview</p>
            <h2 className="text-base font-semibold text-soft-gray leading-tight">
              {loading ? "Loading…" : (template?.title ?? "Not found")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/8 text-soft-gray/40 hover:text-soft-gray transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading && (
            <p className="text-sm text-soft-gray/40">Loading worksheet…</p>
          )}

          {!loading && !template && (
            <p className="text-sm text-status-error">Worksheet not found.</p>
          )}

          {!loading && template && (
            <div className="space-y-5">
              {template.instructions && (
                <p className="text-sm text-soft-gray/60 leading-relaxed border-l-2 border-electric-blue/30 pl-3">
                  {template.instructions}
                </p>
              )}

              {Array.isArray(template.fields_schema) && template.fields_schema.length > 0 ? (
                <SchemaForm
                  fields={template.fields_schema}
                  readOnly={true}
                />
              ) : (
                <p className="text-sm text-soft-gray/40 italic">
                  No fields configured for this worksheet yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-soft-gray/50 hover:text-soft-gray hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
