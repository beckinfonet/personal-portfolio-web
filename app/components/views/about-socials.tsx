// NO "use client" — RSC view body (Pitfall 9 / SHELL-02).
// Phase 4 -> Phase 5 carry-forward (Plan 04-05 Gate 9): inline mini-contact card
// on /about so recruiters find email/github/linkedin without locating the hamburger.
// CSS classes (.about-socials-card, .contact-row, .contact-label, .contact-muted)
// defined in app/globals.css. Reuses the .contact-row pattern from contact-view.tsx
// for visual fidelity (D-33).

import type { Profile } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";

interface AboutSocialsProps {
  profile: Profile;
}

/**
 * D-34 invalid-url guard: if a social URL fails the /^https?:\/\// check, render
 * the row as muted plain text — no <a> tag — to avoid emitting a broken link.
 * The INFRA-05 prebuild grep blocks the production build until all URLs are real,
 * so this fallback is only ever hit during development.
 */
function isRealUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function AboutSocials({ profile }: AboutSocialsProps) {
  const github = profile.socials.find((s) => s.kind === "github");
  const linkedin = profile.socials.find((s) => s.kind === "linkedin");

  return (
    <div
      className="about-socials-card"
      role="group"
      aria-label="Quick contact"
    >
      {/* EMAIL row — native mailto: */}
      <div className="contact-row">
        <span className="contact-label">EMAIL</span>
        <a
          href={`mailto:${profile.email}`}
          aria-label={`Send email to ${profile.email}`}
        >
          {profile.email}
        </a>
        <span />
      </div>

      {/* GITHUB row — ExternalLink with invalid-url guard */}
      {github && (
        <div className="contact-row">
          <span className="contact-label">GITHUB</span>
          {isRealUrl(github.url) ? (
            <ExternalLink
              href={github.url}
              aria-label="Open GitHub (opens in new tab)"
            >
              {github.handle}
            </ExternalLink>
          ) : (
            <span className="contact-muted">{github.handle}</span>
          )}
          <span />
        </div>
      )}

      {/* LINKEDIN row — ExternalLink with invalid-url guard */}
      {linkedin && (
        <div className="contact-row">
          <span className="contact-label">LINKEDIN</span>
          {isRealUrl(linkedin.url) ? (
            <ExternalLink
              href={linkedin.url}
              aria-label="Open LinkedIn (opens in new tab)"
            >
              {linkedin.handle}
            </ExternalLink>
          ) : (
            <span className="contact-muted">{linkedin.handle}</span>
          )}
          <span />
        </div>
      )}
    </div>
  );
}
