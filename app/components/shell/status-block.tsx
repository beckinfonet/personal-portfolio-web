// NO "use client" — RSC primitive (SHELL-02 / RSC-first)
// Shared by app/components/shell/sidebar.tsx (Phase 2 desktop home) and
// app/components/views/about-view.tsx (Phase 4 mobile rehome — D-14).
// CSS classes (.sb-section-header, .sb-status-header, .sb-status, .sb-status-row,
//   .sb-status-dot, .sb-status-key) are defined in app/globals.css since Phase 2.

import { StatusTz } from "@/app/components/shell/status-tz";

interface StatusBlockProps {
  /** Pre-computed by RSC layout via formatUptime(CAREER_START_DATE, new Date()) — e.g. "8y 125d" */
  uptime: string;
}

export function StatusBlock({ uptime }: StatusBlockProps) {
  return (
    <>
      <div className="sb-section-header sb-status-header">STATUS</div>
      <div className="sb-status">
        <div className="sb-status-row">
          <span className="sb-status-dot" aria-hidden="true">●</span>
          <span>Available for hire</span>
        </div>
        <div className="sb-status-row">
          <span className="sb-status-key">uptime:</span>
          <span>{uptime}</span>
        </div>
        <div className="sb-status-row">
          <span className="sb-status-key">tz:</span>
          <StatusTz />
        </div>
      </div>
    </>
  );
}
