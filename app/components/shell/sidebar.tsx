"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { PROFILE } from "@/lib/portfolio-data";

interface SidebarProps {
  uptime: string; /* Pre-computed in RSC layout via formatUptime() */
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

export function Sidebar({ uptime }: SidebarProps) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  /* Active derivation: null segment === index route (about.md); "projects" === projects/ etc. */
  const isActive = (slug: string | null) => segment === slug;

  /* Timezone: computed once on client; no SSR mismatch since this is a client component */
  const tz = (() => {
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!resolved) return "GMT+5 (flex)";
      /* Convert IANA zone (e.g. "Asia/Almaty") to offset abbreviation */
      const offset = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT+5 (flex)";
      return `${offset} (flex)`;
    } catch {
      return "GMT+5 (flex)";
    }
  })();

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
          href={PROFILE.resumeUrl}
          download="Bakytbek_Tatibekov_Resume.pdf"
          aria-label="Download resume"
        >
          ↓ resume.pdf
        </a>
      </div>

      {/* Section E: STATUS block */}
      <div className="sb-section-header sb-status-header">STATUS</div>
      <div className="sb-status">
        <div className="sb-status-row">
          <span className="sb-status-dot" aria-hidden="true">●</span>
          <span>Available for hire</span>
        </div>
        <div className="sb-status-row">
          <span className="sb-status-key">uptime:</span>
          <span>{uptime}</span>
        </div>
        <div className="sb-status-row">
          <span className="sb-status-key">tz:</span>
          <span>{tz}</span>
        </div>
      </div>

    </nav>
  );
}
