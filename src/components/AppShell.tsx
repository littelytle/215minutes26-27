"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 min-w-0 px-4 py-5 sm:px-8 sm:py-7">{children}</main>
      </div>
    </>
  );
}
