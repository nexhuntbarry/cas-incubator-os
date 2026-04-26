'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/teacher/Shell";
import SchemaForm from "@/components/forms/SchemaForm";
import type { SchemaField } from "@/components/forms/SchemaBuilder";
import { ChevronLeft } from "lucide-react";

interface Template {
  id: string;
  title: string;
  instructions: string | null;
  fields_schema: SchemaField[];
}

export default function TeacherWorksheetPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/worksheets/${id}`)
      .then((r) => r.json())
      .then(setTemplate)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Shell title="Worksheet Preview" introKey="teacher.worksheetPreview">
        <p className="text-soft-gray/40 text-sm">Loading…</p>
      </Shell>
    );
  }

  if (!template) {
    return (
      <Shell title="Worksheet Preview" introKey="teacher.worksheetPreview">
        <p className="text-sm text-status-error">Worksheet not found.</p>
      </Shell>
    );
  }

  return (
    <Shell title="Worksheet Preview">
      <div className="max-w-2xl space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs text-soft-gray/40 hover:text-soft-gray mb-3 flex items-center gap-1"
          >
            <ChevronLeft size={12} />
            Back
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] text-soft-gray/40 uppercase tracking-wider mb-1">Preview (read-only)</p>
              <h1 className="text-xl font-bold">{template.title}</h1>
            </div>
          </div>
          {template.instructions && (
            <p className="text-sm text-soft-gray/60 mt-2 leading-relaxed border-l-2 border-electric-blue/30 pl-3">
              {template.instructions}
            </p>
          )}
        </div>

        {Array.isArray(template.fields_schema) && template.fields_schema.length > 0 ? (
          <SchemaForm
            fields={template.fields_schema}
            readOnly={true}
          />
        ) : (
          <div className="rounded-xl border border-white/8 bg-white/2 p-6 text-center">
            <p className="text-sm text-soft-gray/40">No fields configured for this worksheet yet.</p>
          </div>
        )}

        <p className="text-xs text-soft-gray/30 text-center">
          This is a read-only preview. Students see an interactive version of this form.
        </p>
      </div>
    </Shell>
  );
}
