// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.experience-list, .experience-row, .experience-rail-marker, .experience-card,
//   .experience-card-header, .experience-monogram, .experience-title-block, .experience-role,
//   .experience-current-badge, .experience-current-dot, .experience-subline,
//   .experience-period-block, .experience-period, .experience-duration, .experience-lead,
//   .experience-bullets, .experience-bullet, .experience-bullet-marker, .experience-bullet-text,
//   .experience-stack-row, .experience-stack-label, .empty-state) defined in app/globals.css.
//
// Spec: .planning/specs/2026-05-14-experience-redesign.md

import type { Experience } from "@/lib/types";
import { TechChip } from "@/app/components/primitives/tech-chip";
import { computeDurationLabel } from "@/lib/experience-duration";

interface ExperienceViewProps {
  experience: Experience[];
}

const STOPWORDS = new Set(["the", "and", "&"]);

/**
 * Derive a 1-2 character monogram from a company name (spec §3).
 * Unicode-safe via Array.from. Drops stopwords. Falls back to first 2 chars when only 1 token survives.
 */
function monogramFromCompany(company: string): string {
  const tokens = company
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !STOPWORDS.has(t.toLowerCase()));
  const initials = tokens
    .map((t) => Array.from(t)[0]?.toUpperCase() ?? "")
    .join("");
  if (initials.length >= 2) return initials.slice(0, 2);
  // Single-token / single-initial company — use first 2 chars of the original company string.
  return Array.from(company.replace(/\s+/g, "")).slice(0, 2).join("").toUpperCase();
}

export function ExperienceView({ experience }: ExperienceViewProps) {
  if (experience.length === 0) {
    return (
      <div className="content-block">
        <div className="empty-state">(no commits to experience.log yet)</div>
      </div>
    );
  }

  return (
    <div className="content-block">
      <ul className="experience-list">
        {experience.map((e) => {
          const current = /\bpresent\b/i.test(e.period);
          const initials = monogramFromCompany(e.company);
          const duration = computeDurationLabel(e.period);
          const bullets = e.bullets ?? []; // defensive (spec §2 + §9)
          const tech = e.tech ?? []; // defensive

          const subParts: string[] = [`@ ${e.company}`];
          if (e.location) subParts.push(e.location);
          if (e.employmentType) subParts.push(e.employmentType);

          return (
            <li
              key={`${e.company}-${e.role}-${e.period}`}
              className={`experience-row${current ? " is-current" : ""}`}
            >
              <span
                className={`experience-rail-marker${current ? " is-current" : ""}`}
                aria-hidden="true"
              />
              <article
                className={`experience-card${current ? " is-current" : ""}`}
                aria-label={`Experience at ${e.company} as ${e.role}, ${e.period}`}
              >
                <header className="experience-card-header">
                  <span className="experience-monogram" aria-hidden="true">
                    {initials}
                  </span>
                  <div className="experience-title-block">
                    <h2 className="experience-role">
                      {e.role}
                      {current && (
                        <span className="experience-current-badge">
                          <span
                            className="experience-current-dot"
                            aria-label="Current role"
                          />
                          CURRENT
                        </span>
                      )}
                    </h2>
                    <p className="experience-subline">{subParts.join(" · ")}</p>
                  </div>
                  <div className="experience-period-block">
                    <span className="experience-period">{e.period}</span>
                    {duration && (
                      <span className="experience-duration">{duration}</span>
                    )}
                  </div>
                </header>
                <p className="experience-lead">{e.summary}</p>
                {bullets.length > 0 && (
                  <ul className="experience-bullets">
                    {bullets.map((b, i) => (
                      <li key={i} className="experience-bullet">
                        <span className="experience-bullet-marker" aria-hidden="true">
                          +
                        </span>
                        <span className="experience-bullet-text">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {tech.length > 0 && (
                  <div className="experience-stack-row">
                    <span className="experience-stack-label">STACK</span>
                    {tech.map((t) => (
                      <TechChip key={t}>{t}</TechChip>
                    ))}
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
