"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Globe, Code2, Play, Presentation, Brush, ExternalLink, CheckCircle, AlertCircle, Upload, Loader2, X } from "lucide-react";

export interface WorkLinkValues {
  liveProductUrl: string;
  demoVideoUrl: string;
  presentationSlideUrl: string;
  githubRepoUrl: string;
  figmaOrDesignUrl: string;
}

interface WorkLinksEditorProps {
  projectId: string;
  initialValues: WorkLinkValues;
  initialGallery: string[];
  onSaved?: () => void;
}

interface FieldDef {
  key: keyof WorkLinkValues;
  label: string;
  helperText: string;
  placeholder: string;
  icon: React.ReactNode;
}

const FIELDS: FieldDef[] = [
  {
    key: "liveProductUrl",
    label: "Live Product URL",
    helperText: "Where can people use it? Paste your deployed product link.",
    placeholder: "https://my-project.vercel.app",
    icon: <Globe size={15} />,
  },
  {
    key: "demoVideoUrl",
    label: "Demo Video URL",
    helperText: "YouTube, Loom, or any video link showing your product in action.",
    placeholder: "https://youtube.com/watch?v=...",
    icon: <Play size={15} />,
  },
  {
    key: "presentationSlideUrl",
    label: "Presentation Slides URL",
    helperText: "Google Slides, Canva, or any slide deck link.",
    placeholder: "https://docs.google.com/presentation/...",
    icon: <Presentation size={15} />,
  },
  {
    key: "githubRepoUrl",
    label: "GitHub Repo URL",
    helperText: "Paste your repository link — your code lives here.",
    placeholder: "https://github.com/username/repo",
    icon: <Code2 size={15} />,
  },
  {
    key: "figmaOrDesignUrl",
    label: "Figma / Design URL",
    helperText: "Share your design mockups or wireframes.",
    placeholder: "https://figma.com/file/...",
    icon: <Brush size={15} />,
  },
];

function isValidUrl(val: string): boolean {
  if (!val) return true; // empty is fine
  try {
    const u = new URL(val);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function WorkLinksEditor({
  projectId,
  initialValues,
  initialGallery,
  onSaved,
}: WorkLinksEditorProps) {
  const [values, setValues] = useState<WorkLinkValues>(initialValues);
  const [gallery, setGallery] = useState<string[]>(initialGallery);
  const [touched, setTouched] = useState<Partial<Record<keyof WorkLinkValues, boolean>>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track which URL keys were previously null (for notification logic)
  const previouslyNullRef = useRef<Set<string>>(
    new Set(
      Object.entries(initialValues)
        .filter(([, v]) => !v)
        .map(([k]) => k)
    )
  );

  const urlFieldErrors: Partial<Record<keyof WorkLinkValues, string>> = {};
  for (const key of Object.keys(values) as (keyof WorkLinkValues)[]) {
    if (touched[key] && !isValidUrl(values[key])) {
      urlFieldErrors[key] = "Must be a valid http/https URL";
    }
  }

  const hasErrors = Object.keys(urlFieldErrors).length > 0;

  const save = useCallback(
    async (vals: WorkLinkValues, gal: string[]) => {
      if (hasErrors) return;
      setSaveState("saving");
      setSaveError("");
      try {
        // Compute which URL types are newly set (was null, now has value)
        const newlySetFields: string[] = [];
        for (const [key, val] of Object.entries(vals)) {
          if (val && previouslyNullRef.current.has(key)) {
            newlySetFields.push(key);
            previouslyNullRef.current.delete(key);
          }
        }

        const res = await fetch("/api/student/project", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            liveProductUrl: vals.liveProductUrl || null,
            demoVideoUrl: vals.demoVideoUrl || null,
            presentationSlideUrl: vals.presentationSlideUrl || null,
            githubRepoUrl: vals.githubRepoUrl || null,
            figmaOrDesignUrl: vals.figmaOrDesignUrl || null,
            screenshotGalleryUrls: gal,
            _newlySetUrlFields: newlySetFields,
          }),
        });
        if (!res.ok) {
          const j = await res.json();
          setSaveError(j.error ?? "Save failed");
          setSaveState("error");
        } else {
          setSaveState("saved");
          onSaved?.();
          setTimeout(() => setSaveState("idle"), 2500);
        }
      } catch {
        setSaveError("Network error");
        setSaveState("error");
      }
    },
    [hasErrors, onSaved]
  );

  // Debounced auto-save
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (hasErrors) return;
    debounceRef.current = setTimeout(() => {
      save(values, gallery);
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, gallery]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/student/project/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json();
        setUploadError(j.error ?? "Upload failed");
      } else {
        const { url } = await res.json();
        setGallery((g) => [...g, url]);
      }
    } catch {
      setUploadError("Upload error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeFromGallery(url: string) {
    setGallery((g) => g.filter((u) => u !== url));
  }

  const allUrlsEmpty = Object.values(values).every((v) => !v) && gallery.length === 0;

  return (
    <div className="space-y-5" id="work-links-section">
      {/* CTA banner if any URL is empty */}
      {allUrlsEmpty && (
        <div className="rounded-xl border border-gold/30 bg-gold/8 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gold">Submit Your Work</p>
            <p className="text-xs text-soft-gray/60 mt-0.5">
              Add at least one link so your mentor and teacher can review your progress.
            </p>
          </div>
        </div>
      )}

      {/* URL fields */}
      <div className="space-y-4">
        {FIELDS.map((field) => {
          const val = values[field.key];
          const error = urlFieldErrors[field.key];
          const hasValue = Boolean(val) && !error;

          return (
            <div key={field.key}>
              <label className="flex items-center gap-1.5 text-xs text-soft-gray/60 mb-1">
                <span className="text-soft-gray/40">{field.icon}</span>
                {field.label}
              </label>
              <p className="text-[11px] text-soft-gray/40 mb-2">{field.helperText}</p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm text-soft-gray focus:outline-none transition-colors ${
                    error
                      ? "bg-red-500/10 border border-red-500/40 focus:border-red-500"
                      : hasValue
                      ? "bg-white/5 border border-vivid-teal/30 focus:border-electric-blue"
                      : "bg-white/5 border border-white/10 focus:border-electric-blue"
                  }`}
                  placeholder={field.placeholder}
                  value={val}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                    setTouched((prev) => ({ ...prev, [field.key]: true }));
                  }}
                />
                {hasValue && (
                  <a
                    href={val}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 rounded-lg bg-white/5 border border-white/10 text-electric-blue hover:bg-white/10 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {error && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Screenshot gallery */}
      <div>
        <label className="block text-xs text-soft-gray/60 mb-2">Screenshots &amp; Files</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {gallery.map((url) => (
            <div key={url} className="relative group">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt="screenshot"
                    className="w-20 h-20 object-cover rounded-lg border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <ExternalLink size={20} className="text-soft-gray/40" />
                  </div>
                )}
              </a>
              <button
                type="button"
                onClick={() => removeFromGallery(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white items-center justify-center hidden group-hover:flex"
                title="Remove"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-electric-blue/50 transition-colors text-soft-gray/40 hover:text-electric-blue"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-[10px]">{uploading ? "..." : "Upload"}</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
        <p className="text-xs text-soft-gray/30">PNG, JPG, WEBP, PDF — max 10MB</p>
        {uploadError && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={11} /> {uploadError}
          </p>
        )}
      </div>

      {/* Save status */}
      <div className="h-5 flex items-center gap-1.5">
        {saveState === "saving" && (
          <span className="text-xs text-soft-gray/40 flex items-center gap-1">
            <Loader2 size={11} className="animate-spin" /> Saving…
          </span>
        )}
        {saveState === "saved" && (
          <span className="text-xs text-vivid-teal flex items-center gap-1">
            <CheckCircle size={11} /> Saved
          </span>
        )}
        {saveState === "error" && (
          <span className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle size={11} /> {saveError}
          </span>
        )}
      </div>
    </div>
  );
}
