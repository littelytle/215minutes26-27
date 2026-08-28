"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Plus } from "lucide-react";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/log-session": "Log Session",
  "/history": "Session History",
  "/add-student": "Add Student",
  "/team": "Team Setup",
};

export default function Topbar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "IEP Minute Pro";

  return (
    <header className="border-b border-[var(--card-border)] px-8 py-5 flex items-center justify-between gap-6">
      <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-black/20 border border-[var(--card-border)] rounded-full px-4 py-2 w-64">
          <Search size={15} className="text-[var(--text-faint)]" />
          <input
            type="text"
            placeholder="Search students…"
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none w-full"
          />
        </div>
        <button className="relative text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <Bell size={19} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-green)]" />
        </button>
        <Link
          href="/log-session"
          className="pill-btn flex items-center gap-1.5 bg-[var(--accent-periwinkle)] text-[#12160d] px-4 py-2 text-sm hover:brightness-110"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Entry
        </Link>
      </div>
    </header>
  );
}
