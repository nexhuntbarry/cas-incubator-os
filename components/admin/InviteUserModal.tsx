'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const ROLES = ["super_admin", "teacher", "mentor", "student", "parent"] as const;

interface Props {
  onClose: () => void;
}

export default function InviteUserModal({ onClose }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("student");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setToast({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, displayName: displayName.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ type: "error", message: data.error ?? "Something went wrong." });
        setLoading(false);
        return;
      }

      if (data.alreadyExists) {
        setToast({ type: "info", message: `User already exists — role updated to ${role}.` });
      } else {
        setToast({ type: "success", message: "Invitation sent!" });
      }

      router.refresh();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-deep-navy border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h2 className="text-base font-semibold text-soft-gray">Invite User</h2>
          <button
            onClick={onClose}
            className="text-soft-gray/40 hover:text-soft-gray transition-colors p-1 rounded-lg hover:bg-white/5 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-soft-gray/50 uppercase tracking-wider mb-1.5">
              Email address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-soft-gray placeholder-soft-gray/30 focus:outline-none focus:border-electric-blue/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft-gray/50 uppercase tracking-wider mb-1.5">
              Display name <span className="text-soft-gray/30 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-soft-gray placeholder-soft-gray/30 focus:outline-none focus:border-electric-blue/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft-gray/50 uppercase tracking-wider mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-soft-gray focus:outline-none focus:border-electric-blue/50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-deep-navy">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {toast && (
            <div
              className={`text-sm px-4 py-3 rounded-lg ${
                toast.type === "success"
                  ? "bg-vivid-teal/10 text-vivid-teal border border-vivid-teal/20"
                  : toast.type === "info"
                  ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {toast.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-soft-gray/60 bg-white/5 border border-white/10 rounded-lg hover:bg-white/8 hover:text-soft-gray transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-electric-blue rounded-lg hover:bg-electric-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
