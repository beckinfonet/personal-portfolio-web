// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.contact-lead, .contact-card, .contact-row, .contact-label,
//   .contact-cta-row, .copy-button, .copy-button--icon, .btn, .btn-ghost) defined
//   in app/globals.css.

import type { Profile } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";
import { CopyButton } from "@/app/components/primitives/copy-button";

interface ContactViewProps {
  profile: Profile;
}

/**
 * Lead paragraph LOCKED verbatim from design_handoff_terminal_portfolio/app.jsx line 448.
 * Hardcoded in this file (not lifted to lib/portfolio-data.ts) per CONTEXT §V6 decision —
 * role-specific recruiter copy lives with the view template.
 */
const LEAD_PARAGRAPH =
  "Open to senior + staff full-stack and AI engineering roles. Remote-first, occasional travel ok.";

export function ContactView({ profile }: ContactViewProps) {
  // GitHub social is the first entry by convention (lib/portfolio-data.ts D-08); use kind for safety.
  const github = profile.socials.find((s) => s.kind === "github");

  return (
    <div className="content-block">
      <p className="contact-lead">{LEAD_PARAGRAPH}</p>

      <div
        className="contact-card"
        role="group"
        aria-label="Contact methods"
      >
        {/* Email row — special: mailto + CopyButton */}
        <div className="contact-row">
          <span className="contact-label">EMAIL</span>
          <a
            href={`mailto:${profile.email}`}
            aria-label={`Send email to ${profile.email}`}
          >
            {profile.email}
          </a>
          <CopyButton
            value={profile.email}
            ariaLabel={`Copy email ${profile.email}`}
            className="copy-button--icon"
            idleLabel="⧉"
            copiedLabel="✓"
          />
        </div>

        {/* All other social rows — ExternalLink with handle text */}
        {profile.socials.map((s) => (
          <div key={s.kind} className="contact-row">
            <span className="contact-label">{s.label.toUpperCase()}</span>
            <ExternalLink
              href={s.url}
              aria-label={`Open ${s.label} (opens in new tab)`}
            >
              {s.handle}
            </ExternalLink>
            <span />
          </div>
        ))}
      </div>

      <div className="contact-cta-row">
        <a
          className="btn"
          href={profile.resumeUrl}
          download="Bakytbek_Tatibekov_Resume.pdf"
          aria-label="Download resume"
        >
          ↓ download resume.pdf
        </a>
        {github && (
          <ExternalLink
            href={github.url}
            className="btn-ghost"
            showGlyph={false}
            aria-label="Open GitHub (opens in new tab)"
          >
            github ↗
          </ExternalLink>
        )}
      </div>
    </div>
  );
}
