'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Input from "@/components/forms/Input";

type JoinRole = "student" | "parent";

export default function JoinForm({ code }: { code: string }) {
  const t = useTranslations("join");
  const router = useRouter();
  const [role, setRole] = useState<JoinRole | null>(null);

  // Student fields
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  // Parent fields
  const [childName, setChildName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    if (role === "student" && !consentGiven) {
      setError(t("consentRequired"));
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        role,
        consentGiven,
        studentProfile:
          role === "student" ? { grade, school, birthYear: birthYear ? Number(birthYear) : null } : undefined,
        parentProfile:
          role === "parent" ? { childName } : undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push(role === "student" ? "/student" : "/parent");
    } else {
      setError(data.error ?? t("submitError"));
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md">
      {/* Role selection */}
      {!role && (
        <div className="space-y-3">
          <p className="text-sm text-soft-gray/60 text-center mb-4">{t("selectRole")}</p>
          <button
            type="button"
            onClick={() => setRole("student")}
            className="w-full p-4 rounded-xl border border-white/10 bg-white/3 hover:border-electric-blue/50 hover:bg-electric-blue/5 transition-all text-left"
          >
            <p className="font-semibold text-soft-gray">{t("studentOption")}</p>
            <p className="text-xs text-soft-gray/40 mt-0.5">{t("studentDesc")}</p>
          </button>
          <button
            type="button"
            onClick={() => setRole("parent")}
            className="w-full p-4 rounded-xl border border-white/10 bg-white/3 hover:border-vivid-teal/50 hover:bg-vivid-teal/5 transition-all text-left"
          >
            <p className="font-semibold text-soft-gray">{t("parentOption")}</p>
            <p className="text-xs text-soft-gray/40 mt-0.5">{t("parentDesc")}</p>
          </button>
        </div>
      )}

      {/* Form after role chosen */}
      {role && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => setRole(null)}
            className="text-xs text-soft-gray/40 hover:text-soft-gray/70 mb-2"
          >
            ← {t("changeRole")}
          </button>

          {role === "student" && (
            <>
              <Input
                label={t("grade")}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade 10"
              />
              <Input
                label={t("school")}
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Taipei Municipal High School"
              />
              <Input
                label={t("birthYear")}
                type="number"
                min="2000"
                max="2015"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              />

              {/* Parental consent */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/3 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 accent-electric-blue"
                  required
                />
                <span className="text-xs text-soft-gray/70 leading-relaxed">
                  {t("consentLabel")}
                </span>
              </label>
            </>
          )}

          {role === "parent" && (
            <>
              <Input
                label={t("childName")}
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Student's name"
              />
              <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/3 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 accent-electric-blue"
                />
                <span className="text-xs text-soft-gray/70 leading-relaxed">
                  {t("parentConsentLabel")}
                </span>
              </label>
            </>
          )}

          {error && <p className="text-status-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-electric-blue text-white font-semibold text-sm hover:bg-electric-blue/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "…" : t("submit")}
          </button>
        </form>
      )}
    </div>
  );
}
