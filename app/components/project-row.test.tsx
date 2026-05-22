// Component branch tests for the ProjectRow disclosure island (Plan 10-02 Task 1).
// Mirrors app/(terminal)/projects/page.test.tsx — relies on vitest globals
// (describe / test / expect), no explicit vitest import.
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectRow } from "./project-row";
import type { StripModel, PanelModel } from "@/lib/project-stats";

const baseProps = {
  name: "Terminal Portfolio",
  summary: "A terminal-themed personal portfolio.",
  year: "2026",
  status: "active",
  role: "Solo build",
  tech: ["Next.js", "TypeScript"],
  link: "https://example.com/project"
};

const strip: StripModel = {
  commitCount: 247,
  languages: ["TS", "CSS", "Shell"],
  duration: "4mo"
};

const panel: PanelModel = {
  commitCount: 247,
  breakdown: [
    { name: "TypeScript", pct: 68 },
    { name: "CSS", pct: 22 }
  ],
  otherPct: 10,
  durationLine: "In development since Jan 2026 — 4mo",
  lastActive: "Last active 3 days ago"
};

describe("ProjectRow — strip branch (LIST-01/02/05/07)", () => {
  test("renders the gh: token and formatted strip text when strip prop is present", () => {
    const { container } = render(
      <ProjectRow {...baseProps} repoUrl="https://github.com/u/r" strip={strip} panel={panel} />
    );
    const stripEl = container.querySelector(".projects-row-stats");
    expect(stripEl).not.toBeNull();
    expect(stripEl?.querySelector(".gh-token")?.textContent).toBe("gh:");
    expect(stripEl?.textContent).toContain("247 commits");
    expect(stripEl?.textContent).toContain("4mo");
  });

  test("renders no .projects-row-stats element when strip prop is null", () => {
    const { container } = render(
      <ProjectRow {...baseProps} repoUrl="https://github.com/u/r" strip={null} panel={panel} />
    );
    expect(container.querySelector(".projects-row-stats")).toBeNull();
  });

  test("renders all selected languages in the wrap-enabled strip container (LIST-06/09 per D-13)", () => {
    const { container } = render(
      <ProjectRow {...baseProps} repoUrl="https://github.com/u/r" strip={strip} panel={panel} />
    );
    const stripEl = container.querySelector(".projects-row-stats");
    expect(stripEl).not.toBeNull();
    for (const lang of strip.languages) {
      expect(stripEl?.textContent).toContain(lang);
    }
  });
});

describe("ProjectRow — disclosure branch (DETAIL-01)", () => {
  test("panel starts hidden; clicking the trigger flips aria-expanded and reveals the panel", () => {
    render(
      <ProjectRow {...baseProps} repoUrl="https://github.com/u/r" strip={strip} panel={panel} />
    );
    const trigger = screen.getByRole("button", {
      name: `${baseProps.name}: ${baseProps.summary}`
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    const panelId = trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Tech highlights")).toBeVisible();
  });
});

describe("ProjectRow — panel branch (DETAIL-02/05/06/07)", () => {
  test("with panel present, expanded panel shows Tech highlights, commit stat, and a View on GitHub CTA at repoUrl", () => {
    const { container } = render(
      <ProjectRow
        {...baseProps}
        repoUrl="https://github.com/u/r"
        strip={strip}
        panel={panel}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: `${baseProps.name}: ${baseProps.summary}` })
    );
    expect(screen.getByText("Tech highlights")).toBeInTheDocument();
    const commitStat = container.querySelector(".projects-commit-stat");
    expect(commitStat?.textContent).toBe("247 commits");
    const ghCta = screen.getByRole("link", { name: /View on GitHub/i });
    expect(ghCta).toHaveAttribute("href", "https://github.com/u/r");
  });

  test("with panel null, expanded panel renders no Tech highlights heading but keeps the Visit project CTA", () => {
    render(
      <ProjectRow {...baseProps} repoUrl={null} strip={null} panel={null} />
    );
    fireEvent.click(
      screen.getByRole("button", { name: `${baseProps.name}: ${baseProps.summary}` })
    );
    expect(screen.queryByText("Tech highlights")).toBeNull();
    const visitCta = screen.getByRole("link", { name: /Visit project/i });
    expect(visitCta).toHaveAttribute("href", baseProps.link);
  });
});
