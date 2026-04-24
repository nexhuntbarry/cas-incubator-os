"use client";

import { useState } from "react";
import { CheckCheck, Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  parent_update_pending: "Parent update pending approval",
  parent_update_sent: "Parent update sent",
  parent_update_approved: "Parent update approved",
  parent_update_rejected: "Parent update rejected",
  risk_flag_assigned: "Risk flag assigned to you",
  risk_flag_created: "New risk flag created",
  risk_flag_resolved: "Risk flag resolved",
  checkpoint_submitted: "Checkpoint submitted",
  checkpoint_reviewed: "Checkpoint reviewed",
  showcase_published: "Showcase published",
};

export default function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
    } catch {
      // fail silently
    } finally {
      setMarkingAll(false);
    }
  }

  async function markRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch {
      // fail silently
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
        <Bell size={32} className="mx-auto text-soft-gray/20 mb-3" />
        <p className="text-soft-gray/50">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-soft-gray/50">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs text-electric-blue hover:text-electric-blue/80 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        </div>
      )}

      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => !n.read_at && markRead(n.id)}
          className={`w-full text-left rounded-xl border p-4 transition-all ${
            n.read_at
              ? "border-white/6 bg-white/2 opacity-60"
              : "border-electric-blue/20 bg-electric-blue/5 hover:bg-electric-blue/8"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                n.read_at ? "bg-white/20" : "bg-electric-blue"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-soft-gray">
                {TYPE_LABELS[n.type] ?? n.type.replace(/_/g, " ")}
              </p>
              {n.payload && Object.keys(n.payload).length > 0 && (
                <p className="text-xs text-soft-gray/50 mt-0.5 truncate">
                  {(n.payload as Record<string, string>).student_name &&
                    `Student: ${(n.payload as Record<string, string>).student_name}`}
                  {(n.payload as Record<string, string>).subject &&
                    ` — ${(n.payload as Record<string, string>).subject}`}
                </p>
              )}
              <p className="text-[11px] text-soft-gray/30 mt-1">
                {new Date(n.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
