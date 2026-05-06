// NO "use client" — RSC-friendly primitive (SEO-05)
// Visual: inherits `a { color: var(--accent) }` from app/globals.css line 95.
// Optional className composes with view-specific styles (.btn, .btn-ghost, etc.)

import type { ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  /** Default true. Pass false for store-badge (the badge graphic itself signals external) and the contact-view github CTA (which has a literal "↗" in its text per handoff). */
  showGlyph?: boolean;
  /** Forwarded to underlying <a>. Required for accessibility on row-as-link patterns (projects-row, writing-row, store-badge). */
  "aria-label"?: string;
}

export function ExternalLink({
  href,
  className,
  children,
  showGlyph = true,
  "aria-label": ariaLabel
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
      {showGlyph && <span aria-hidden="true"> ↗</span>}
    </a>
  );
}
