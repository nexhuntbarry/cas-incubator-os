'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageIntro from "@/components/shared/PageIntro";
import {
  LayoutDashboard,
  Mail,
  Users,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/parent", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/parent/updates", label: "Updates", icon: Mail },
];

interface ShellProps {
  children: React.ReactNode;
  title?: string;
  introKey?: string;
}

export default function Shell({ children, title, introKey }: ShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen bg-deep-navy text-soft-gray">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-56 flex-shrink-0 flex flex-col border-r border-white/8 bg-deep-navy md:bg-white/2 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div>
              <p className="text-xs font-bold text-soft-gray leading-tight">CAS Incubator</p>
              <p className="text-[10px] text-vivid-teal font-semibold tracking-widest uppercase">Parent</p>
            </div>
          </div>
          <button
            className="md:hidden text-soft-gray/50 hover:text-soft-gray min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[44px] ${
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

      </aside>

      <div className="flex-1 flex flex-col min-w-0">
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
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <NotificationBell />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-4 md:py-6">
          {introKey && <PageIntro tKey={introKey} />}
          {children}
        </main>
      </div>
    </div>
  );
}
