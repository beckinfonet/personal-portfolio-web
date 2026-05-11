// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.about-role, .about-meta, .about-para, .about-cards, .about-card,
//   .about-card-value, .about-card-label, .about-cta-row, .btn, .btn-ghost) defined
//   in app/globals.css (appended in Plan 03-04).
// Note: H1 styling lives at `.terminal-main h1` (also in globals.css).

import type { Profile } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";
import { StatusBlock } from "@/app/components/shell/status-block";
import { AboutSocials } from "./about-socials";

interface AboutViewProps {
  profile: Profile;
  uptime: string;
}

export function AboutView({ profile, uptime }: AboutViewProps) {
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

      <AboutSocials profile={profile} />

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
        {profile.resumeDocxUrl ? (
          <a
            className="btn-ghost"
            href={profile.resumeDocxUrl}
            download="Bakytbek_Tatibekov_Resume.docx"
            aria-label="Download resume as Word document"
          >
            resume.docx
          </a>
        ) : null}
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

      {/* Mobile STATUS rehome — visibility CSS-driven by Plan 04-01 globals.css
          (display: none at >=961px; display: block at <=960px). D-12, D-13. */}
      <div className="about-status-mobile">
        <StatusBlock uptime={uptime} />
      </div>
    </div>
  );
}
