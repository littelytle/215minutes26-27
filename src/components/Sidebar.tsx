"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, NotebookPen, Table2, UserPlus, Settings2 } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Summary", icon: LayoutDashboard },
  { href: "/log-session", label: "Log Session", icon: NotebookPen },
  { href: "/history", label: "Session History", icon: Table2 },
  { href: "/add-student", label: "Add Student", icon: UserPlus },
  { href: "/team", label: "Team Setup", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] flex flex-col h-screen sticky top-0">
      <div className="px-6 pt-7 pb-6">
        <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          IEP Minute Pro
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Track. Log. Grow.</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--accent-green-soft)] text-[var(--accent-green)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
              )}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="border-t border-[var(--card-border)] mx-3" />
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-green-soft)] text-[var(--accent-green)] flex items-center justify-center text-sm font-semibold">
            T
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">Team</p>
            <p className="text-xs text-[var(--text-muted)] leading-tight">Educator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
