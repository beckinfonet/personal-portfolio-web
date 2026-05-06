// NO "use client" — RSC-friendly primitive
// CSS class (.tech-chip) defined in app/globals.css (Phase 3 / Plan 03-04 appends).

import type { ReactNode } from "react";

interface TechChipProps {
  children: ReactNode;
}

export function TechChip({ children }: TechChipProps) {
  return <span className="tech-chip">{children}</span>;
}
