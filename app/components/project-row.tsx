"use client";
// Thin client island — the expand/collapse disclosure for a single /projects row.
//
// CSS classes used (defined in app/globals.css, inside the existing .projects-* block):
//   .projects-row .projects-row-index .projects-row-trigger .projects-row-name
//   .projects-row-summary .projects-row-chips .projects-row-stats .gh-token
//   .projects-row-meta .projects-row-year .projects-row-status .projects-row-role
//   .projects-tech-panel .projects-commit-stat .projects-panel-heading
//   .projects-panel-breakdown .projects-panel-line .projects-panel-cta-row
//
// Boundary integrity (T-10-03): this island NEVER imports lib/github.ts — that
// module reads GITHUB_TOKEN / node:fs and would leak into the client bundle.
// It receives only plain serializable props (StripModel / PanelModel / strings)
// and imports only the pure @/lib/project-stats types and primitive components.

import { useId, useState } from "react";
import type { StripModel, PanelModel } from "@/lib/project-stats";
import { ExternalLink } from "@/app/components/primitives/external-link";
import { TechChip } from "@/app/components/primitives/tech-chip";

interface ProjectRowProps {
  index: number;
  name: string;
  summary: string;
  year: string;
  status: string;
  role: string;
  tech: string[];
  link: string;
  /** The original repoUrls[0] for the CTA — null when absent. */
  repoUrl: string | null;
  strip: StripModel | null;
  panel: PanelModel | null;
}

export function ProjectRow({
  index,
  name,
  summary,
  year,
  status,
  role,
  tech,
  link,
  repoUrl,
  strip,
  panel
}: ProjectRowProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li>
      <div className="projects-row">
        <span className="projects-row-index" aria-hidden="true">
          {open ? "[-]" : "[+]"}
        </span>
        <button
          type="button"
          className="projects-row-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${name}: ${summary}`}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="projects-row-name">{name}</div>
          <div className="projects-row-summary">{summary}</div>
          <div className="projects-row-chips">
            {tech.map((t) => (
              <TechChip key={t}>{t}</TechChip>
            ))}
          </div>
          {strip && (
            <div className="projects-row-stats">
              <span className="gh-token">gh:</span>
              <span>{strip.commitCount} commits</span>
              <span aria-hidden="true">·</span>
              <span>{strip.languages.join(" / ")}</span>
              <span aria-hidden="true">·</span>
              <span>{strip.duration}</span>
            </div>
          )}
        </button>
        <div className="projects-row-meta">
          <div className="projects-row-year">{year}</div>
          <div className="projects-row-status">{status}</div>
          <div className="projects-row-role">{role}</div>
        </div>
      </div>
      <div id={panelId} className="projects-tech-panel" hidden={!open}>
        {panel && (
          <>
            <h3 className="projects-panel-heading">Tech highlights</h3>
            <ul className="projects-panel-breakdown">
              {panel.breakdown.map((b) => (
                <li key={b.name}>
                  {b.name} {b.pct}%
                </li>
              ))}
              {panel.otherPct > 0 && <li>other {panel.otherPct}%</li>}
            </ul>
            <div className="projects-panel-line">{panel.durationLine}</div>
            <div className="projects-panel-line">{panel.lastActive}</div>
            <span className="projects-commit-stat">
              {panel.commitCount} commits
            </span>
          </>
        )}
        <div className="projects-panel-cta-row">
          {repoUrl && (
            <ExternalLink href={repoUrl} showGlyph={false}>
              View on GitHub →
            </ExternalLink>
          )}
          <ExternalLink href={link} showGlyph={false}>
            Visit project →
          </ExternalLink>
        </div>
      </div>
    </li>
  );
}
