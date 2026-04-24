'use client';

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multi_select"
  | "radio"
  | "date"
  | "url"
  | "file_upload"
  | "file_gallery";

export interface SchemaField {
  type: FieldType;
  label: string;
  key: string;
  required: boolean;
  helpText?: string;
  options?: string[]; // for select/multi_select/radio
}

interface SchemaBuilderProps {
  fields: SchemaField[];
  onChange: (fields: SchemaField[]) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown (single)" },
  { value: "multi_select", label: "Checkboxes (multi)" },
  { value: "radio", label: "Radio (single choice)" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
  { value: "file_upload", label: "File Upload (single)" },
  { value: "file_gallery", label: "File Gallery (multiple)" },
];

function needsOptions(type: FieldType) {
  return type === "select" || type === "multi_select" || type === "radio";
}

function toKey(label: string) {
  return label
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export default function SchemaBuilder({ fields, onChange }: SchemaBuilderProps) {
  const [optionsInput, setOptionsInput] = useState<Record<number, string>>({});

  function addField() {
    const newField: SchemaField = {
      type: "text",
      label: `Field ${fields.length + 1}`,
      key: `field_${fields.length + 1}`,
      required: false,
    };
    onChange([...fields, newField]);
  }

  function removeField(idx: number) {
    onChange(fields.filter((_, i) => i !== idx));
  }

  function updateField(idx: number, patch: Partial<SchemaField>) {
    const updated = fields.map((f, i) => {
      if (i !== idx) return f;
      const next = { ...f, ...patch };
      // auto-generate key from label if label changed
      if (patch.label !== undefined) {
        next.key = toKey(patch.label) || `field_${idx}`;
      }
      return next;
    });
    onChange(updated);
  }

  function moveField(idx: number, direction: "up" | "down") {
    const next = [...fields];
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  }

  function handleOptionsBlur(idx: number, raw: string) {
    const opts = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    updateField(idx, { options: opts });
  }

  return (
    <div className="space-y-3">
      {fields.map((field, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3"
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-soft-gray/40 font-mono">#{idx + 1}</span>
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => moveField(idx, "up")}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-white/8 disabled:opacity-20 transition-colors"
              >
                <ChevronUp size={14} className="text-soft-gray/50" />
              </button>
              <button
                type="button"
                onClick={() => moveField(idx, "down")}
                disabled={idx === fields.length - 1}
                className="p-1 rounded hover:bg-white/8 disabled:opacity-20 transition-colors"
              >
                <ChevronDown size={14} className="text-soft-gray/50" />
              </button>
              <button
                type="button"
                onClick={() => removeField(idx)}
                className="p-1 rounded hover:bg-status-error/10 transition-colors"
              >
                <Trash2 size={14} className="text-status-error/70" />
              </button>
            </div>
          </div>

          {/* Type + Label */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-soft-gray/50">Field Type</label>
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(idx, { type: e.target.value as FieldType })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value} className="bg-deep-navy">
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-soft-gray/50">Label</label>
              <input
                value={field.label}
                onChange={(e) => updateField(idx, { label: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                placeholder="Question label"
              />
            </div>
          </div>

          {/* Key + Required */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-soft-gray/50">Key (auto)</label>
              <input
                value={field.key}
                onChange={(e) => updateField(idx, { key: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray/60 text-sm font-mono focus:outline-none focus:border-electric-blue/60"
                placeholder="field_key"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-soft-gray/50">Help Text</label>
              <input
                value={field.helpText ?? ""}
                onChange={(e) =>
                  updateField(idx, { helpText: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60"
                placeholder="Optional hint"
              />
            </div>
          </div>

          {/* Required toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(idx, { required: e.target.checked })}
              className="accent-electric-blue"
            />
            <span className="text-xs text-soft-gray/60">Required</span>
          </label>

          {/* Options (for select/radio/multi_select) */}
          {needsOptions(field.type) && (
            <div className="space-y-1">
              <label className="text-xs text-soft-gray/50">
                Options (one per line)
              </label>
              <textarea
                rows={3}
                defaultValue={(field.options ?? []).join("\n")}
                onChange={(e) =>
                  setOptionsInput({ ...optionsInput, [idx]: e.target.value })
                }
                onBlur={() =>
                  handleOptionsBlur(
                    idx,
                    optionsInput[idx] ?? (field.options ?? []).join("\n")
                  )
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 resize-none"
                placeholder={"Option A\nOption B\nOption C"}
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-sm text-soft-gray/50 hover:text-soft-gray hover:border-electric-blue/40 transition-colors"
      >
        <Plus size={14} />
        Add Field
      </button>
    </div>
  );
}
