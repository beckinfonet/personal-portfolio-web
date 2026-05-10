"use client";

// Phase 5 DEV-01: tiny client island that logs an ASCII signature on first paint.
// Mounted in app/(terminal)/layout.tsx — NEVER in app/layout.tsx (Pitfall 8: would
// collapse the entire RSC tree to client). Sibling to <CommandPalette />.
// Does NOT respect prefers-reduced-motion (D-26 — text-only, no animation).

import { useEffect } from "react";
import { PROFILE } from "@/lib/portfolio-data";

/**
 * "BT" initials in JetBrains-style box-drawing ASCII (6 rows, ~17 cols).
 * Chosen over full "BAKYTBEK" art (which wraps in narrow terminals) for
 * cross-environment legibility. Refine on first run if user prefers full name.
 */
const ASCII_ART = `
██████╗ ████████╗
██╔══██╗╚══██╔══╝
██████╔╝   ██║
██╔══██╗   ██║
██████╔╝   ██║
╚═════╝    ╚═╝
`;

// Matrix-accent sRGB hex — same value as --accent-dim in light theme (also valid in dark).
const ART_STYLE = "color: #16a34a; font-family: monospace;";
const TEXT_STYLE = "color: inherit; font-family: monospace;";

export function ConsoleSignature() {
  useEffect(() => {
    // Single console.log with %c styling — works in Chrome, Firefox, Safari.
    console.log(
      `%c${ASCII_ART}%c\nLike the site? Source at github.com/beckinfonet\nAvailable for hire — ${PROFILE.email}`,
      ART_STYLE,
      TEXT_STYLE
    );
  }, []);
  return null;
}
