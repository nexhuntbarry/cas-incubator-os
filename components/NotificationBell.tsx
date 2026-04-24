'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

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

function getRedirectUrl(n: Notification): string {
  if (n.type === "risk_flag_assigned" || n.type === "risk_flag_created") {
    const flagId = n.payload?.flag_id as string | undefined;
    if (flagId) return `/admin/risks/${flagId}`;
    return "/admin/risks";
  }
  if (n.type === "checkpoint_submitted") return "/mentor/checkpoints/queue";
  if (n.type === "checkpoint_reviewed") return "/student/checkpoints";
  if (n.type === "parent_update_pending") return "/admin/communications/queue";
  if (n.type === "showcase_published") return "/admin/showcases";
  return "/notifications";
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function toggleOpen() {
    if (!open) {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications((data.notifications ?? []).slice(0, 10));
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    setOpen((prev) => !prev);
  }

  async function markRead(id: string, redirectUrl: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch {
      // silent
    }
    window.location.href = redirectUrl;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-lg text-soft-gray/60 hover:text-soft-gray hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-electric-blue text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-deep-navy border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
            <p className="text-sm font-semibold text-soft-gray">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-xs text-electric-blue">{unreadCount} unread</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-soft-gray/40">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-soft-gray/40">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id, getRedirectUrl(n))}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3 ${
                    n.read_at ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      n.read_at ? "bg-white/20" : "bg-electric-blue"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-soft-gray truncate">
                      {TYPE_LABELS[n.type] ?? n.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-soft-gray/30 mt-0.5">
                      {new Date(n.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/8">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-electric-blue hover:text-electric-blue/80 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
