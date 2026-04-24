'use client';

import { useState, useRef } from "react";
import { Save, Upload, Loader2, X, ExternalLink } from "lucide-react";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  problemStatement: string | null;
  targetUser: string | null;
  valueProposition: string | null;
  mvpDefinition: string | null;
  githubUrl: string | null;
  figmaUrl: string | null;
  demoVideoUrl: string | null;
  presentationUrl: string | null;
  screenshotGalleryUrls: string[];
}

interface ProjectEditorProps {
  project: ProjectData;
  labels: Record<string, string>;
  /** When true, hides URL fields and screenshot section (they live in WorkLinksEditor) */
  infoOnlyMode?: boolean;
}

export default function ProjectEditor({ project, labels, infoOnlyMode = false }: ProjectEditorProps) {
  const [form, setForm] = useState({
    title: project.title ?? "",
    description: project.description ?? "",
    problemStatement: project.problemStatement ?? "",
    targetUser: project.targetUser ?? "",
    valueProposition: project.valueProposition ?? "",
    mvpDefinition: project.mvpDefinition ?? "",
    githubUrl: project.githubUrl ?? "",
    figmaUrl: project.figmaUrl ?? "",
    demoVideoUrl: project.demoVideoUrl ?? "",
    presentationUrl: project.presentationUrl ?? "",
  });
  const [gallery, setGallery] = useState<string[]>(project.screenshotGalleryUrls ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/student/project", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          problemStatement: form.problemStatement,
          targetUser: form.targetUser,
          valueProposition: form.valueProposition,
          mvpDefinition: form.mvpDefinition,
          githubUrl: form.githubUrl,
          figmaUrl: form.figmaUrl,
          demoVideoUrl: form.demoVideoUrl,
          presentationUrl: form.presentationUrl,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Save failed");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/student/project/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Upload failed");
      } else {
        const { url } = await res.json();
        setGallery((g) => [...g, url]);
      }
    } catch {
      setError("Upload error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const field = (
    key: keyof typeof form,
    label: string,
    placeholder: string,
    multiline = false
  ) => (
    <div key={key}>
      <label className="block text-xs text-soft-gray/60 mb-1">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none"
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ) : (
        <input
          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue"
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {field("title", labels.title ?? "Project Title", "My awesome project")}
      {field("description", labels.summary ?? "Summary", "What is your project about?", true)}
      {field("problemStatement", labels.problem ?? "Problem Statement", "What problem are you solving?", true)}
      {field("targetUser", labels.targetUser ?? "Target User", "Who is this for?", true)}
      {field("valueProposition", labels.value ?? "Value Proposition", "Why is this better than existing solutions?", true)}
      {field("mvpDefinition", labels.mvp ?? "MVP Definition", "What is the simplest version of your product?", true)}

      {!infoOnlyMode && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("githubUrl", "GitHub URL", "https://github.com/...")}
            {field("figmaUrl", "Figma URL", "https://figma.com/...")}
            {field("demoVideoUrl", "Demo Video URL", "https://youtube.com/...")}
            {field("presentationUrl", "Presentation URL", "https://slides.com/...")}
          </div>

          {/* Screenshot gallery */}
          <div>
            <label className="block text-xs text-soft-gray/60 mb-2">{labels.screenshots ?? "Screenshots / Files"}</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {gallery.map((url) => (
                <div key={url} className="relative group">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="screenshot" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <ExternalLink size={20} className="text-soft-gray/40" />
                      </div>
                    )}
                  </a>
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
          </div>
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2">
          <X size={14} /> {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saved ? "Saved!" : (labels.save ?? "Save Project")}
      </button>
    </div>
  );
}
