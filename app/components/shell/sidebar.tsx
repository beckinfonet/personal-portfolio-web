"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { Profile } from "@/lib/types";
import { StatusBlock } from "@/app/components/shell/status-block";

interface SidebarProps {
  uptime: string; /* Pre-computed in RSC layout via formatUptime() */
  profile: Profile; /* Live profile from getProfile() (Plan 07-10) — static fallback via lib/api.ts */
}

/* Route label → icon (from 02-PATTERNS.md) */
const ROUTE_ICONS: Record<string, string> = {
  "about.md":       "◆",
  "projects/":      "▸",
  "stack.json":     "{}",
  "experience.log": "≡",
  "writing/":       "▸",
  "contact.sh":     "$",
  "shipped.app":    "▸"
};

export function Sidebar({ uptime, profile }: SidebarProps) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  /* Active derivation: null segment === index route (about.md); "projects" === projects/ etc. */
  const isActive = (slug: string | null) => segment === slug;

  return (
    <nav className="sidebar" aria-label="File explorer">

      {/* Section A: EXPLORER header */}
      <div className="sb-section-header">EXPLORER</div>

      {/* Section B: Tree root */}
      <div className="sb-tree-root">
        <span className="sb-tree-caret" aria-hidden="true">▾</span>
        <span>portfolio/</span>
      </div>

      {/* Section C: 7 file rows from ROUTES */}
      {ROUTES.map((route) => (
        <button
          key={route.pathname}
          className={`sb-item${isActive(route.slug) ? " sb-item--active" : ""}`}
          aria-label={route.ariaLabel}
          aria-current={isActive(route.slug) ? "page" : undefined}
          onClick={() => router.push(route.pathname)}
        >
          <span className="sb-icon" aria-hidden="true">
            {ROUTE_ICONS[route.label] ?? "▸"}
          </span>
          <span className="sb-label">{route.label}</span>
        </button>
      ))}

      {/* Section D: Recruiter resume card */}
      <div className="sb-download">
        <div className="sb-download-header">For recruiters</div>
        <a
          className="sb-download-btn"
          href={profile.resumeUrl}
          download="Bakytbek_Tatibekov_Resume.pdf"
          aria-label="Download resume"
        >
          ↓ resume.pdf
        </a>
      </div>

      {/* Section E: STATUS block — extracted as shared primitive (D-14) */}
      <StatusBlock uptime={uptime} />

    </nav>
  );
}
