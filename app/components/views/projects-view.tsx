// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.projects-subhead, .projects-list, .projects-row, .projects-row-index,
//   .projects-row-name, .projects-row-summary, .projects-row-chips, .projects-row-meta,
//   .projects-row-year, .projects-row-status, .projects-row-role, .empty-state) defined
//   in app/globals.css.

import type { Project } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";
import { TechChip } from "@/app/components/primitives/tech-chip";

interface ProjectsViewProps {
  projects: Project[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  if (projects.length === 0) {
    return (
      <div className="content-block">
        <div className="empty-state">total 0 · (no projects committed yet)</div>
      </div>
    );
  }

  const sorted = [...projects].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <div className="content-block">
      <div className="projects-subhead">
        total {sorted.length} · sorted by year desc
      </div>
      <ul className="projects-list">
        {sorted.map((p, i) => (
          <li key={p.name}>
            <ExternalLink
              href={p.link}
              showGlyph={false}
              className="projects-row"
              aria-label={`${p.name}: ${p.summary} (opens in new tab)`}
            >
              <span className="projects-row-index">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div>
                <div className="projects-row-name">{p.name}</div>
                <div className="projects-row-summary">{p.summary}</div>
                <div className="projects-row-chips">
                  {p.tech.map((t) => (
                    <TechChip key={t}>{t}</TechChip>
                  ))}
                </div>
              </div>
              <div className="projects-row-meta">
                <div className="projects-row-year">{p.year}</div>
                <div className="projects-row-status">{p.status}</div>
                <div className="projects-row-role">{p.role}</div>
              </div>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
