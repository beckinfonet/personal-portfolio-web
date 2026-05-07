// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.experience-list, .experience-row, .experience-row-header, .experience-hash,
//   .experience-role, .experience-company, .experience-period, .experience-summary,
//   .empty-state) defined in app/globals.css.

import type { Experience } from "@/lib/types";

interface ExperienceViewProps {
  experience: Experience[];
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
        {experience.map((e, i) => (
          <li key={`${e.company}-${e.role}-${e.period}`} className="experience-row">
            <div className="experience-row-header">
              <span className="experience-hash">
                {(i + 1).toString(16).padStart(7, "0")}
              </span>
              <span className="experience-role">{e.role}</span>
              <span className="experience-company">@ {e.company}</span>
              <span className="experience-period">({e.period})</span>
            </div>
            <div className="experience-summary">{e.summary}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
