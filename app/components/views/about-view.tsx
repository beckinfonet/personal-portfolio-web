// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.about-role, .about-meta, .about-para, .about-cards, .about-card,
//   .about-card-value, .about-card-label, .about-cta-row, .btn, .btn-ghost) defined
//   in app/globals.css (appended in Plan 03-04).
// Note: H1 styling lives at `.terminal-main h1` (also in globals.css).

import type { Profile } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";

interface AboutViewProps {
  profile: Profile;
}

export function AboutView({ profile }: AboutViewProps) {
  return (
    <div className="content-block">
      <h1>{profile.name}</h1>
      <div className="about-role">// {profile.role}</div>
      <div className="about-meta">{profile.location}</div>

      {profile.bio.long.map((para, i) => (
        <p key={i} className="about-para">
          {para}
        </p>
      ))}

      <div className="about-cards">
        {profile.highlights.map((h, i) => (
          <div key={i} className="about-card">
            <div className="about-card-value">{h.value}</div>
            <div className="about-card-label">{h.label}</div>
          </div>
        ))}
      </div>

      <div className="about-cta-row">
        <a
          className="btn"
          href={profile.resumeUrl}
          download="Bakytbek_Tatibekov_Resume.pdf"
          aria-label="Download resume"
        >
          ↓ resume.pdf
        </a>
        {profile.socials.map((s) => (
          <ExternalLink
            key={s.kind}
            href={s.url}
            className="btn-ghost"
            aria-label={`Open ${s.label} (opens in new tab)`}
          >
            {s.label.toLowerCase()}/
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}
