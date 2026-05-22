// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.projects-subhead, .projects-list, .projects-row, .projects-row-index,
//   .projects-row-name, .projects-row-summary, .projects-row-chips, .projects-row-stats,
//   .gh-token, .projects-row-trigger, .projects-row-meta, .projects-row-year,
//   .projects-row-status, .projects-row-role, .projects-tech-panel,
//   .projects-commit-stat, .empty-state) defined in app/globals.css.

import type { Project } from "@/lib/types";
import type { StripModel, PanelModel } from "@/lib/project-stats";
import { ProjectRow } from "@/app/components/project-row";

interface ProjectRowModel {
  project: Project;
  strip: StripModel | null;
  panel: PanelModel | null;
}

interface ProjectsViewProps {
  rows: ProjectRowModel[];
}

export function ProjectsView({ rows }: ProjectsViewProps) {
  if (rows.length === 0) {
    return (
      <div className="content-block">
        <div className="empty-state">total 0 · (no projects committed yet)</div>
      </div>
    );
  }

  const sorted = [...rows].sort(
    (a, b) => Number(b.project.year) - Number(a.project.year)
  );

  return (
    <div className="content-block">
      <div className="projects-subhead">
        total {sorted.length} · sorted by year desc
      </div>
      <ul className="projects-list">
        {sorted.map(({ project, strip, panel }) => (
          <ProjectRow
            key={project.name}
            name={project.name}
            summary={project.summary}
            year={project.year}
            status={project.status}
            role={project.role}
            tech={project.tech}
            link={project.link}
            repoUrl={project.repoUrls?.[0] ?? null}
            strip={strip}
            panel={panel}
          />
        ))}
      </ul>
    </div>
  );
}
