'use client';

import { useState, useCallback, useRef } from "react";
import type { SchemaField } from "./SchemaBuilder";

interface SchemaFormProps {
  fields: SchemaField[];
  initialValues?: Record<string, unknown>;
  readOnly?: boolean;
  onAutoSave?: (data: Record<string, unknown>) => void;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
}

export default function SchemaForm({
  fields,
  initialValues = {},
  readOnly = false,
  onAutoSave,
  onSubmit,
  submitLabel = "Submit",
}: SchemaFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (onAutoSave) {
          if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
          autoSaveTimer.current = setTimeout(() => onAutoSave(next), 1000);
        }
        return next;
      });
    },
    [onAutoSave]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSubmit) return;

    // Validate required fields
    for (const field of fields) {
      if (field.required) {
        const val = values[field.key];
        if (val === undefined || val === null || val === "") {
          setError(`"${field.label}" is required.`);
          return;
        }
      }
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={values[field.key]}
          readOnly={readOnly}
          onChange={(v) => handleChange(field.key, v)}
        />
      ))}

      {error && (
        <p className="text-sm text-status-error">{error}</p>
      )}

      {!readOnly && onSubmit && (
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting…" : submitLabel}
        </button>
      )}
    </form>
  );
}

interface FieldRendererProps {
  field: SchemaField;
  value: unknown;
  readOnly: boolean;
  onChange: (v: unknown) => void;
}

function FieldRenderer({ field, value, readOnly, onChange }: FieldRendererProps) {
  const baseInput =
    "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-sm focus:outline-none focus:border-electric-blue/60 transition-colors placeholder-soft-gray/30";
  const readOnlyClass = "opacity-60 cursor-not-allowed";

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-soft-gray/80">
        {field.label}
        {field.required && <span className="text-status-error ml-1">*</span>}
      </label>
      {field.helpText && (
        <p className="text-xs text-soft-gray/40">{field.helpText}</p>
      )}

      {field.type === "text" && (
        <input
          type="text"
          value={String(value ?? "")}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${readOnly ? readOnlyClass : ""}`}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          rows={4}
          value={String(value ?? "")}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} resize-y ${readOnly ? readOnlyClass : ""}`}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          value={value !== undefined && value !== null ? String(value) : ""}
          readOnly={readOnly}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          className={`${baseInput} ${readOnly ? readOnlyClass : ""}`}
        />
      )}

      {field.type === "date" && (
        <input
          type="date"
          value={String(value ?? "")}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${readOnly ? readOnlyClass : ""}`}
        />
      )}

      {field.type === "url" && (
        <input
          type="url"
          value={String(value ?? "")}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${readOnly ? readOnlyClass : ""}`}
          placeholder="https://"
        />
      )}

      {field.type === "select" && (
        <select
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${readOnly ? readOnlyClass : ""}`}
        >
          <option value="" className="bg-deep-navy">
            — select —
          </option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt} className="bg-deep-navy">
              {opt}
            </option>
          ))}
        </select>
      )}

      {(field.type === "multi_select" || field.type === "radio") && (
        <div className="space-y-1.5">
          {(field.options ?? []).map((opt) => {
            const isMulti = field.type === "multi_select";
            const selected = isMulti
              ? Array.isArray(value) && (value as string[]).includes(opt)
              : value === opt;

            function handleOption() {
              if (isMulti) {
                const arr = Array.isArray(value) ? [...(value as string[])] : [];
                if (arr.includes(opt)) {
                  onChange(arr.filter((v) => v !== opt));
                } else {
                  onChange([...arr, opt]);
                }
              } else {
                onChange(opt);
              }
            }

            return (
              <label
                key={opt}
                className="flex items-center gap-2 cursor-pointer text-sm text-soft-gray/80"
              >
                <input
                  type={isMulti ? "checkbox" : "radio"}
                  checked={selected}
                  disabled={readOnly}
                  onChange={handleOption}
                  className="accent-electric-blue"
                />
                {opt}
              </label>
            );
          })}
        </div>
      )}

      {(field.type === "file_upload" || field.type === "file_gallery") && (
        <FileField
          field={field}
          value={value}
          readOnly={readOnly}
          onChange={onChange}
        />
      )}
    </div>
  );
}

interface FileFieldProps {
  field: SchemaField;
  value: unknown;
  readOnly: boolean;
  onChange: (v: unknown) => void;
}

function FileField({ field, value, readOnly, onChange }: FileFieldProps) {
  const [uploading, setUploading] = useState(false);
  const isGallery = field.type === "file_gallery";

  const existingUrls: string[] = isGallery
    ? Array.isArray(value)
      ? (value as string[])
      : []
    : value
    ? [String(value)]
    : [];

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          urls.push(data.url as string);
        }
      }
      if (isGallery) {
        onChange([...existingUrls, ...urls]);
      } else {
        onChange(urls[0] ?? null);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeUrl(url: string) {
    if (isGallery) {
      onChange(existingUrls.filter((u) => u !== url));
    } else {
      onChange(null);
    }
  }

  return (
    <div className="space-y-2">
      {existingUrls.length > 0 && (
        <div className="space-y-1">
          {existingUrls.map((url) => (
            <div
              key={url}
              className="flex items-center gap-2 text-xs text-soft-gray/60"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-electric-blue hover:underline max-w-xs"
              >
                {url.split("/").pop()}
              </a>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="text-status-error/70 hover:text-status-error text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-sm text-soft-gray/50 hover:border-electric-blue/40 hover:text-soft-gray cursor-pointer transition-colors w-fit">
          <input
            type="file"
            className="hidden"
            multiple={isGallery}
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? "Uploading…" : isGallery ? "Add files" : "Choose file"}
        </label>
      )}
    </div>
  );
}
