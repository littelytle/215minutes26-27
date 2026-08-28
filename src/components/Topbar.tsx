"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Plus, Menu } from "lucide-react";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/log-session": "Log Session",
  "/history": "Session History",
  "/add-student": "Add Student",
  "/team": "Team Setup",
};

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "IEP Minute Pro";

  return (
    <header className="border-b border-[var(--card-border)] px-4 py-4 sm:px-8 sm:py-5 flex items-center justify-between gap-3 sm:gap-6">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 -ml-1 shrink-0">
          <Menu size={22} />
        </button>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden md:flex items-center gap-2 bg-black/20 border border-[var(--card-border)] rounded-full px-4 py-2 w-64">
          <Search size={15} className="text-[var(--text-faint)]" />
          <input
            type="text"
            placeholder="Search students…"
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none w-full"
          />
        </div>
        <button className="hidden sm:block relative text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <Bell size={19} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-green)]" />
        </button>
        <Link
          href="/log-session"
          className="pill-btn flex items-center gap-1.5 bg-[var(--accent-periwinkle)] text-[#12160d] px-3 py-2 sm:px-4 text-sm hover:brightness-110 whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Entry</span>
        </Link>
      </div>
    </header>
  );
}
