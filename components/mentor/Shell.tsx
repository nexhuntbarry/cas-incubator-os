'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Star,
  Flag,
  BookOpen,
  StickyNote,
} from "lucide-react";

const NAV = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/mentor/projects", label: "Projects", icon: FolderKanban },
  { href: "/mentor/worksheets/review", label: "Worksheet Queue", icon: FileText },
  { href: "/mentor/rubrics/evaluate", label: "Rubric Evaluate", icon: Star },
  { href: "/mentor/checkpoints/queue", label: "Checkpoints", icon: Flag },
  { href: "/mentor/resources", label: "Resources", icon: BookOpen },
  { href: "/mentor/notes", label: "My Notes", icon: StickyNote },
];

interface ShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function Shell({ children, title }: ShellProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen bg-deep-navy text-soft-gray">
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/8 bg-white/2">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <Logo size={28} />
          <div>
            <p className="text-xs font-bold text-soft-gray leading-tight">CAS Incubator</p>
            <p className="text-[10px] text-vivid-teal font-semibold tracking-widest uppercase">Mentor</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-vivid-teal/15 text-vivid-teal"
                    : "text-soft-gray/60 hover:text-soft-gray hover:bg-white/5"
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/8">
          <UserButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {title && (
          <header className="px-8 py-5 border-b border-white/8 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-soft-gray">{title}</h1>
          </header>
        )}
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
