'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const INTEREST_OPTIONS = [
  "AI / Machine Learning", "Web Development", "Mobile Apps", "Data Science",
  "Sustainability", "Health & Wellness", "Education", "Social Impact",
  "Finance / Fintech", "Gaming", "Design / UX", "Research", "Arts & Media",
  "Robotics / Hardware", "Biotech", "Community",
];

const AI_EXPERIENCE_OPTIONS = [
  { value: "none", label: "None — I've never used AI tools" },
  { value: "light", label: "Light — I've tried ChatGPT a few times" },
  { value: "moderate", label: "Moderate — I use AI tools regularly" },
  { value: "heavy", label: "Heavy — I build with AI or use it daily" },
];

interface IntakeFormProps {
  labels: {
    title: string;
    step1: string; step2: string; step3: string; step4: string; step5: string;
    submit: string; next: string; back: string; success: string; processing: string;
  };
}

export default function IntakeForm({ labels }: IntakeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    gradeLevel: "",
    school: "",
    location: "",
    interests: [] as string[],
    academicDirection: "",
    competitionGoals: "",
    portfolioGoals: "",
    aiExperienceLevel: "",
    aiToolsUsed: "",
    problemStatement: "",
    consentGiven: false,
  });

  function toggle(interest: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  }

  async function handleSubmit() {
    if (!form.consentGiven) {
      setError("You must agree to program norms to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/student/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/student/project"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 size={48} className="text-vivid-teal" />
        <p className="text-xl font-semibold">{labels.success}</p>
        <p className="text-soft-gray/50 text-sm">{labels.processing}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step
                  ? "bg-vivid-teal text-deep-navy"
                  : s === step
                  ? "bg-electric-blue text-white"
                  : "bg-white/10 text-soft-gray/40"
              }`}
            >
              {s < step ? <CheckCircle2 size={14} /> : s}
            </div>
            {s < 5 && <div className={`flex-1 h-px w-8 ${s < step ? "bg-vivid-teal" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Step 1 — Personal */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{labels.step1}</h2>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">Grade Level</label>
              <input
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue"
                placeholder="e.g. 10th grade / Year 11"
                value={form.gradeLevel}
                onChange={(e) => setForm((f) => ({ ...f, gradeLevel: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">School</label>
              <input
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue"
                placeholder="Your school name"
                value={form.school}
                onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">City / Country</label>
              <input
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue"
                placeholder="e.g. Taipei, Taiwan"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-2">Interests (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.interests.includes(opt)
                        ? "bg-electric-blue/20 border-electric-blue text-electric-blue"
                        : "bg-white/5 border-white/10 text-soft-gray/60 hover:border-white/30"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{labels.step2}</h2>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">Academic / College Direction</label>
              <textarea
                rows={3}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none"
                placeholder="e.g. Interested in CS at NTU, want to explore entrepreneurship..."
                value={form.academicDirection}
                onChange={(e) => setForm((f) => ({ ...f, academicDirection: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">Competition Goals</label>
              <textarea
                rows={2}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none"
                placeholder="e.g. ISEF, YEP, local science fair..."
                value={form.competitionGoals}
                onChange={(e) => setForm((f) => ({ ...f, competitionGoals: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">Portfolio Goals</label>
              <textarea
                rows={2}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none"
                placeholder="e.g. Build a portfolio project to show colleges..."
                value={form.portfolioGoals}
                onChange={(e) => setForm((f) => ({ ...f, portfolioGoals: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Step 3 — AI Experience */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{labels.step3}</h2>
            <div className="space-y-2">
              {AI_EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, aiExperienceLevel: opt.value }))}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    form.aiExperienceLevel === opt.value
                      ? "bg-electric-blue/15 border-electric-blue text-soft-gray"
                      : "bg-white/5 border-white/10 text-soft-gray/60 hover:border-white/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">Which AI tools have you used? (optional)</label>
              <input
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue"
                placeholder="e.g. ChatGPT, Claude, Midjourney, GitHub Copilot..."
                value={form.aiToolsUsed}
                onChange={(e) => setForm((f) => ({ ...f, aiToolsUsed: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Step 4 — Project Direction */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{labels.step4}</h2>
            <div>
              <label className="block text-xs text-soft-gray/60 mb-1">What problem are you trying to solve?</label>
              <textarea
                rows={6}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-soft-gray focus:outline-none focus:border-electric-blue resize-none"
                placeholder="Describe the problem you're passionate about solving. Be as specific as possible — our AI will help classify the type of project that fits best."
                value={form.problemStatement}
                onChange={(e) => setForm((f) => ({ ...f, problemStatement: e.target.value }))}
              />
              <p className="text-xs text-soft-gray/40 mt-1">Our AI will classify your project type based on this description.</p>
            </div>
          </div>
        )}

        {/* Step 5 — Consent */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{labels.step5}</h2>
            <div className="rounded-lg border border-white/10 bg-white/3 p-4 text-sm text-soft-gray/70 space-y-2">
              <p>By joining this program, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Engage respectfully with mentors, teachers, and fellow students</li>
                <li>Submit original work and cite all sources and AI assistance used</li>
                <li>Attend scheduled sessions and meet deadlines to the best of your ability</li>
                <li>Allow program staff to review your project for educational purposes</li>
              </ul>
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-electric-blue"
                checked={form.consentGiven}
                onChange={(e) => setForm((f) => ({ ...f, consentGiven: e.target.checked }))}
              />
              <span className="text-sm text-soft-gray/70 group-hover:text-soft-gray transition-colors">
                I (and my parent/guardian if under 18) acknowledge the program norms above and agree to participate.
              </span>
            </label>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 text-sm text-soft-gray/60 hover:text-soft-gray transition-colors"
            >
              <ChevronLeft size={16} /> {labels.back}
            </button>
          ) : (
            <span />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors"
            >
              {labels.next} <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vivid-teal text-deep-navy text-sm font-semibold hover:bg-vivid-teal/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {labels.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
