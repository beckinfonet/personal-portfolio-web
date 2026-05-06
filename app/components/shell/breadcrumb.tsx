"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";

export function Breadcrumb() {
  const pathname = usePathname();
  const [bootDone, setBootDone] = useState(false);

  /* Boot animation: fade-in hint at 350ms (app.jsx line 77: setTimeout 350ms) */
  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 350);
    return () => clearTimeout(t);
  }, []);

  /* Derive active route label from pathname */
  const activeRoute = ROUTES.find((r) => r.pathname === pathname) ?? ROUTES[0];

  return (
    <div className="breadcrumb">
      <span className="breadcrumb-path" aria-hidden="true">~/portfolio</span>
      <span className="breadcrumb-sep" aria-hidden="true">/</span>
      <span className="breadcrumb-active">{activeRoute.label}</span>
      <span
        className={`breadcrumb-hint${bootDone ? " breadcrumb-hint--visible" : ""}`}
        aria-hidden="true"
      >
        press <kbd>⌘K</kbd> for commands
      </span>
    </div>
  );
}
