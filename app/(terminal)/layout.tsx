// NO "use client" — RSC route-group layout (SHELL-01 / SHELL-02)
// This layout persists across all routes: /, /projects, /stack, /experience, /writing, /contact, /shipped
// Plan 07-10 (DATA-04): async RSC; fetches profile once via getProfile() and prop-drills
// to every shell child that previously imported the static PROFILE. lib/api.ts is the
// chokepoint — Mongo edits flow site-wide on the next ISR window; static PROFILE in
// lib/portfolio-data.ts remains the silent fallback inside getJson<Profile>().

import type { ReactNode } from "react";
import { TopBar } from "@/app/components/shell/top-bar";
import { Sidebar } from "@/app/components/shell/sidebar";
import { CommandPalette } from "@/app/components/shell/command-palette";
import { ConsoleSignature } from "@/app/components/shell/console-signature";
import { ExplorerDrawer } from "@/app/components/shell/explorer-drawer";
import { Breadcrumb } from "@/app/components/shell/breadcrumb";
import { PrintFooter } from "@/app/components/print-footer";
import { CAREER_START_DATE } from "@/lib/portfolio-data";
import { getProfile } from "@/lib/api";
import { formatUptime } from "@/lib/uptime";

export default async function TerminalLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  const currentYear = new Date().getFullYear();
  const uptime = formatUptime(CAREER_START_DATE, new Date());

  return (
    <>
      {/* Skip-link for keyboard/screen-reader users (A11Y-01) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* TopBar: traffic lights + path label + ⌘K + theme toggle + LiveClock + resume button */}
      <TopBar profile={profile} />

      {/* Shell body: sidebar + main content */}
      <div className="terminal-body">
        {/* Sidebar: file tree + recruiter card + STATUS block (A11Y-05 <nav>) */}
        <Sidebar uptime={uptime} profile={profile} />

        {/* Main content area (A11Y-05 <main>) */}
        <main id="main-content" tabIndex={-1} className="terminal-main">
          {/* Breadcrumb: ~/portfolio / <activeFile> + ⌘K hint */}
          <Breadcrumb />

          {/* Per-route content — shell never unmounts on navigation */}
          <div className="content-block">{children}</div>

          {/* Footer (SHELL-07) */}
          <footer className="shell-footer">
            <span>© {currentYear} {profile.name}</span>
            <span aria-hidden="true">·</span>
            <span>built with React</span>
            <span aria-hidden="true">·</span>
            <span>v1.0.0</span>
          </footer>
        </main>
      </div>

      {/* ExplorerDrawer: 6th client island; visible only at <=960px via CSS */}
      <ExplorerDrawer profile={profile} />

      {/* CommandPalette: mounted once outside terminal-body so its z-index overlay covers everything */}
      <CommandPalette profile={profile} />

      {/* ConsoleSignature: 7th client island; fires console.log on first paint (DEV-01).
          MUST be in (terminal)/layout — NOT in app/layout (Pitfall 8 — would collapse RSC tree). */}
      <ConsoleSignature email={profile.email} />

      {/* PrintFooter: always in DOM; visible only via @media print (Plan 04-04 / A11Y-09) */}
      <PrintFooter
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}
        email={profile.email}
      />
    </>
  );
}
