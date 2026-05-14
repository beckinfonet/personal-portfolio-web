"use client";

import { useTheme } from "next-themes";
import { track } from "@vercel/analytics";
import { usePalette, useDrawer } from "@/app/components/shell/shell-state-provider";
import { LiveClock } from "@/app/components/shell/live-clock";
import type { Profile } from "@/lib/types";

export function TopBar({ profile }: { profile: Profile }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { toggle } = usePalette();
  const { open: drawerOpen, toggle: toggleDrawer } = useDrawer();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="topbar">
      {/* Hamburger trigger — visible only at <=960px via CSS (display: none at desktop) */}
      <button
        id="topbar-hamburger-btn"
        className="topbar-hamburger"
        aria-label="Open file explorer"
        aria-expanded={drawerOpen}
        aria-controls="explorer-drawer-sheet"
        onClick={toggleDrawer}
      >
        ☰
      </button>

      {/* Traffic lights — decorative (A11Y-05 <header>) */}
      <span className="traffic-dot traffic-dot--red" aria-hidden="true" />
      <span className="traffic-dot traffic-dot--yellow" aria-hidden="true" />
      <span className="traffic-dot traffic-dot--green" aria-hidden="true" />

      {/* Path label — hidden below ~600px */}
      <span className="topbar-path">~/portfolio — bakytbek@dev — zsh</span>

      {/* Spacer pushes right zone to the right */}
      <span className="topbar-spacer" aria-hidden="true" />

      {/* Right zone: always visible at every viewport */}
      <button
        className="topbar-btn"
        onClick={toggle}
        aria-label="Open command palette"
      >
        <span className="topbar-cmd-key" aria-hidden="true">⌘</span>K
      </button>

      <button
        className="topbar-btn"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle color theme"
      >
        {isDark ? "☼ light" : "☾ dark"}
      </button>

      {/* LiveClock — aria-hidden on the clock component itself; hidden below ~480px */}
      <LiveClock />

      {/* Persistent resume download — NEVER hidden at any viewport (SHELL-03 / Risk 3) */}
      <a
        className="topbar-btn topbar-resume"
        href={profile.resumeUrl}
        download="Bakytbek_Tatibekov_Resume.pdf"
        aria-label="Download resume"
        onClick={() => track("resume_download")}
      >
        ↓ resume.pdf
      </a>
    </header>
  );
}
