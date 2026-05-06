// NO "use client" — RSC-friendly primitive
// CSS class (.kbd) defined in app/globals.css (Phase 3 / Plan 03-04 appends).
// Note: existing Phase 2 styles `.breadcrumb-hint kbd` and `.palette-footer kbd` remain valid;
// this primitive emits the same <kbd> element so those scoped rules continue to apply.

import type { ReactNode } from "react";

interface KbdProps {
  children: ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return <kbd className="kbd">{children}</kbd>;
}
