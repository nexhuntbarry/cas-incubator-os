'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, UserPlus } from "lucide-react";
import InviteUserModal from "@/components/admin/InviteUserModal";

interface User {
  id: string;
  display_name: string;
  email: string;
  role: string | null;
  created_at: string;
}

const ROLES = ["super_admin", "teacher", "mentor", "student", "parent"];

export default function UsersTable({ users }: { users: User[] }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const filtered = query
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          u.display_name.toLowerCase().includes(query.toLowerCase()) ||
          (u.role ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : users;

  async function handleRoleChange(userId: string, role: string) {
    setUpdating(userId);
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setUpdating(null);
    router.refresh();
  }

  return (
    <>
      {showInvite && <InviteUserModal onClose={() => setShowInvite(false)} />}
      <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-gray/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email, name, or role…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-soft-gray placeholder-soft-gray/30 focus:outline-none focus:border-electric-blue/50"
          />
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-electric-blue rounded-lg hover:bg-electric-blue/90 transition-colors whitespace-nowrap"
        >
          <UserPlus size={14} />
          Invite User
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                {t("users.name")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                {t("users.email")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                {t("users.role")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider">
                {t("users.joined")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="px-4 py-3 text-soft-gray">{u.display_name}</td>
                <td className="px-4 py-3 text-soft-gray/60">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role ?? ""}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={updating === u.id}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-soft-gray text-xs focus:outline-none focus:border-electric-blue/60 disabled:opacity-50"
                  >
                    <option value="" className="bg-deep-navy">
                      — unassigned —
                    </option>
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-deep-navy">
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-soft-gray/40 text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-soft-gray/30"
                >
                  {t("users.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
