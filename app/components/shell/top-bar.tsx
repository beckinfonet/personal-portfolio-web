"use client";

import { useTheme } from "next-themes";
import { usePalette } from "@/app/components/shell/shell-state-provider";
import { LiveClock } from "@/app/components/shell/live-clock";
import { PROFILE } from "@/lib/portfolio-data";

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { toggle } = usePalette();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="topbar">
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
        href={PROFILE.resumeUrl}
        download="Bakytbek_Tatibekov_Resume.pdf"
        aria-label="Download resume"
      >
        ↓ resume.pdf
      </a>
    </header>
  );
}
