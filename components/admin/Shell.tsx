'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard,
  BookOpen,
  Users2,
  KeyRound,
  UserCog,
  Settings,
  GitBranch,
  Layers,
  FolderKanban,
  FileText,
  Star,
  Flag,
  Library,
  StickyNote,
  MessageSquare,
  AlertTriangle,
  Presentation,
  BarChart2,
  Cpu,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/ai-usage", label: "AI Usage", icon: Cpu },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/cohorts", label: "Cohorts", icon: Users2 },
  { href: "/admin/class-codes", label: "Class Codes", icon: KeyRound },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/worksheets", label: "Worksheets", icon: FileText },
  { href: "/admin/rubrics", label: "Rubrics", icon: Star },
  { href: "/admin/checkpoints", label: "Checkpoints", icon: Flag },
  { href: "/admin/curriculum", label: "Curriculum", icon: Library },
  { href: "/admin/notes", label: "Notes Feed", icon: StickyNote },
  { href: "/admin/communications/queue", label: "Comms Queue", icon: MessageSquare },
  { href: "/admin/risks", label: "Risk Flags", icon: AlertTriangle },
  { href: "/admin/showcases", label: "Showcases", icon: Presentation },
  { href: "/admin/method-stages", label: "Method Stages", icon: GitBranch },
  { href: "/admin/project-types", label: "Project Types", icon: Layers },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface ShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function Shell({ children, title }: ShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const NavLinks = () => (
    <>
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[44px] ${
              active
                ? "bg-electric-blue/15 text-electric-blue"
                : "text-soft-gray/60 hover:text-soft-gray hover:bg-white/5"
            }`}
          >
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-deep-navy text-soft-gray">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-56 flex-shrink-0 flex flex-col border-r border-white/8 bg-deep-navy md:bg-white/2 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div>
              <p className="text-xs font-bold text-soft-gray leading-tight">CAS Incubator</p>
              <p className="text-[10px] text-electric-blue font-semibold tracking-widest uppercase">Admin</p>
            </div>
          </div>
          <button
            className="md:hidden text-soft-gray/50 hover:text-soft-gray min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-white/8">
          <UserButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="px-4 md:px-8 py-4 border-b border-white/8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg text-soft-gray/60 hover:text-soft-gray hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base md:text-lg font-semibold text-soft-gray truncate">{title ?? ""}</h1>
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 px-4 md:px-8 py-4 md:py-6">{children}</main>
      </div>
    </div>
  );
}
