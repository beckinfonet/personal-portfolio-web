// NO "use client" — RSC route-group layout (SHELL-01 / SHELL-02)
// This layout persists across all routes: /, /projects, /stack, /experience, /writing, /contact, /shipped
// Client islands (TopBar, Sidebar, CommandPalette, Breadcrumb) are STUBS — full implementations in Plan 04/05.

import type { ReactNode } from "react";
import { TopBar } from "@/app/components/shell/top-bar";
import { Sidebar } from "@/app/components/shell/sidebar";
import { CommandPalette } from "@/app/components/shell/command-palette";
import { Breadcrumb } from "@/app/components/shell/breadcrumb";
import { PROFILE, CAREER_START_DATE } from "@/lib/portfolio-data";
import { formatUptime } from "@/lib/uptime";

export default function TerminalLayout({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();
  const uptime = formatUptime(CAREER_START_DATE, new Date());

  return (
    <>
      {/* Skip-link for keyboard/screen-reader users (A11Y-01) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* TopBar: traffic lights + path label + ⌘K + theme toggle + LiveClock + resume button */}
      <TopBar />

      {/* Shell body: sidebar + main content */}
      <div className="terminal-body">
        {/* Sidebar: file tree + recruiter card + STATUS block (A11Y-05 <nav>) */}
        <Sidebar uptime={uptime} />

        {/* Main content area (A11Y-05 <main>) */}
        <main id="main-content" tabIndex={-1} className="terminal-main">
          {/* Breadcrumb: ~/portfolio / <activeFile> + ⌘K hint */}
          <Breadcrumb />

          {/* Per-route content — shell never unmounts on navigation */}
          <div className="content-block">{children}</div>

          {/* Footer (SHELL-07) */}
          <footer className="shell-footer">
            <span>© {currentYear} {PROFILE.name}</span>
            <span aria-hidden="true">·</span>
            <span>built with React</span>
            <span aria-hidden="true">·</span>
            <span>v1.0.0</span>
          </footer>
        </main>
      </div>

      {/* CommandPalette: mounted once outside terminal-body so its z-index overlay covers everything */}
      <CommandPalette />
    </>
  );
}
