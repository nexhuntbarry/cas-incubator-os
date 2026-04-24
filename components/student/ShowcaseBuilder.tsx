"use client";

import { useState } from "react";
import { Sparkles, Save, Globe, GlobeLock, ExternalLink } from "lucide-react";

interface InitialData {
  title: string;
  description: string;
  presentationLink: string;
  demoLink: string;
  repoLink: string;
  videoLink: string;
  screenshotsJson: string[];
  publicShareEnabled: boolean;
  publicShareToken: string | null;
}

interface ProjectContext {
  projectTitle: string;
  projectDescription?: string | null;
  problemStatement?: string | null;
  targetUser?: string | null;
  valueProposition?: string | null;
  currentMethodStage?: number | null;
}

interface Props {
  projectId: string;
  studentName: string;
  initialData: InitialData;
  projectContext: ProjectContext;
}

export default function ShowcaseBuilder({ projectId, studentName, initialData, projectContext }: Props) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [presentationLink, setPresentationLink] = useState(initialData.presentationLink);
  const [demoLink, setDemoLink] = useState(initialData.demoLink);
  const [repoLink, setRepoLink] = useState(initialData.repoLink);
  const [videoLink, setVideoLink] = useState(initialData.videoLink);
  const [publicShareEnabled, setPublicShareEnabled] = useState(initialData.publicShareEnabled);
  const [shareToken, setShareToken] = useState(initialData.publicShareToken);

  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiAssessment, setAiAssessment] = useState<{
    readinessScore: number;
    readinessLevel: string;
    strengths: string[];
    improvements: string[];
    suggestedDescription: string;
  } | null>(null);

  const publicUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : "https://incubator.nexhunt.xyz"}/showcase/${shareToken}`
    : null;

  async function handleAiSummary() {
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/showcase-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          projectTitle: projectContext.projectTitle,
          projectDescription: projectContext.projectDescription,
          problemStatement: projectContext.problemStatement,
          targetUser: projectContext.targetUser,
          valueProposition: projectContext.valueProposition,
          currentMethodStage: projectContext.currentMethodStage,
          showcaseDescription: description,
          demoLink: demoLink || undefined,
          repoLink: repoLink || undefined,
          videoLink: videoLink || undefined,
          presentationLink: presentationLink || undefined,
        }),
      });
      if (!res.ok) throw new Error("AI unavailable");
      const data = await res.json();
      setAiAssessment(data);
      if (data.suggestedDescription && !description) {
        setDescription(data.suggestedDescription);
      }
    } catch {
      setError("AI assessment unavailable — please write your showcase manually.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title,
          description,
          presentation_link: presentationLink || undefined,
          demo_link: demoLink || undefined,
          repo_link: repoLink || undefined,
          video_link: videoLink || undefined,
          public_share_enabled: publicShareEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      if (data.showcase?.public_share_token) {
        setShareToken(data.showcase.public_share_token);
      }
      setSuccess("Showcase saved successfully.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  const readinessColor: Record<string, string> = {
    not_ready: "text-red-400",
    developing: "text-yellow-400",
    almost_ready: "text-orange-400",
    showcase_ready: "text-vivid-teal",
  };

  return (
    <div className="space-y-6">
      {/* AI Assessment */}
      <button
        onClick={handleAiSummary}
        disabled={aiLoading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet/20 text-violet border border-violet/30 text-sm font-medium hover:bg-violet/30 transition-colors disabled:opacity-50"
      >
        <Sparkles size={15} />
        {aiLoading ? "Assessing readiness…" : "Generate Showcase Summary with AI"}
      </button>

      {aiAssessment && (
        <div className="rounded-xl border border-violet/20 bg-violet/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-soft-gray">Readiness Assessment</p>
            <span className={`text-lg font-bold ${readinessColor[aiAssessment.readinessLevel] ?? "text-soft-gray"}`}>
              {aiAssessment.readinessScore}/10
            </span>
            <span className={`text-xs capitalize ${readinessColor[aiAssessment.readinessLevel] ?? "text-soft-gray/60"}`}>
              {aiAssessment.readinessLevel?.replace(/_/g, " ")}
            </span>
          </div>
          {aiAssessment.strengths.length > 0 && (
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Strengths</p>
              <ul className="text-sm text-soft-gray/70 list-disc list-inside space-y-0.5">
                {aiAssessment.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {aiAssessment.improvements.length > 0 && (
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Improvements Needed</p>
              <ul className="text-sm text-soft-gray/70 list-disc list-inside space-y-0.5">
                {aiAssessment.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {aiAssessment.suggestedDescription && (
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Suggested Description</p>
              <p className="text-sm text-soft-gray/70 leading-relaxed">{aiAssessment.suggestedDescription}</p>
              <button
                onClick={() => setDescription(aiAssessment.suggestedDescription)}
                className="mt-2 text-xs text-electric-blue hover:underline"
              >
                Use this description
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form fields */}
      <div>
        <label className="block text-xs text-soft-gray/50 uppercase tracking-wider mb-2">Project Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50"
        />
      </div>

      <div>
        <label className="block text-xs text-soft-gray/50 uppercase tracking-wider mb-2">Description / Story</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Tell the story of your project — the problem, the solution, what you built…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50 resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Demo / Product Link", value: demoLink, set: setDemoLink, placeholder: "https://your-demo.com" },
          { label: "Presentation Slides URL", value: presentationLink, set: setPresentationLink, placeholder: "https://slides.google.com/…" },
          { label: "Repository URL", value: repoLink, set: setRepoLink, placeholder: "https://github.com/…" },
          { label: "Demo Video URL", value: videoLink, set: setVideoLink, placeholder: "https://youtube.com/…" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="block text-xs text-soft-gray/50 uppercase tracking-wider mb-2">{label}</label>
            <input
              type="url"
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-soft-gray text-sm placeholder:text-soft-gray/30 focus:outline-none focus:border-electric-blue/50"
            />
          </div>
        ))}
      </div>

      {/* Public share toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3">
        <div className="flex items-center gap-3">
          {publicShareEnabled ? (
            <Globe size={18} className="text-vivid-teal" />
          ) : (
            <GlobeLock size={18} className="text-soft-gray/40" />
          )}
          <div>
            <p className="text-sm font-medium">Public Sharing</p>
            <p className="text-xs text-soft-gray/50">
              {publicShareEnabled
                ? "Anyone with the link can view your showcase"
                : "Only you and program staff can see this"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setPublicShareEnabled(!publicShareEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            publicShareEnabled ? "bg-vivid-teal" : "bg-white/15"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              publicShareEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Public URL display */}
      {publicShareEnabled && publicUrl && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-vivid-teal/20 bg-vivid-teal/5">
          <p className="text-xs text-vivid-teal flex-1 font-mono truncate">{publicUrl}</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-vivid-teal hover:text-vivid-teal/80 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-vivid-teal text-sm bg-vivid-teal/10 border border-vivid-teal/20 rounded-lg px-4 py-3">
          {success}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors disabled:opacity-50"
      >
        <Save size={15} />
        {saving ? "Saving…" : "Save Showcase"}
      </button>
    </div>
  );
}
