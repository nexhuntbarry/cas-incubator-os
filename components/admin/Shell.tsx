'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  BookOpen,
  Users2,
  KeyRound,
  UserCog,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/cohorts", label: "Cohorts", icon: Users2 },
  { href: "/admin/class-codes", label: "Class Codes", icon: KeyRound },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/8 bg-white/2">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <Logo size={28} />
          <div>
            <p className="text-xs font-bold text-soft-gray leading-tight">CAS Incubator</p>
            <p className="text-[10px] text-electric-blue font-semibold tracking-widest uppercase">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
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
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-white/8">
          <UserButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
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
