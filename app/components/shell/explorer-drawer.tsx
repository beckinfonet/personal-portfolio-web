"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useDrawer } from "@/app/components/shell/shell-state-provider";
import { ROUTES } from "@/lib/routes";
import type { Profile } from "@/lib/types";

/* Route label → icon (mirrors sidebar.tsx ROUTE_ICONS verbatim) */
const ROUTE_ICONS: Record<string, string> = {
  "about.md":       "◆",
  "projects/":      "▸",
  "stack.json":     "{}",
  "experience.log": "≡",
  "writing/":       "▸",
  "contact.sh":     "$",
  "shipped.app":    "▸"
};

export function ExplorerDrawer({ profile }: { profile: Profile }) {
  const { open, setOpen } = useDrawer();
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const isActive = (slug: string | null) => segment === slug;

  /* Lock page scroll while the mobile drawer is open; the sheet remains scrollable. */
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;

    root.setAttribute("data-scroll-lock", "drawer");
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      root.removeAttribute("data-scroll-lock");
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  /* Esc dismisses (A11Y-08) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  /* Focus trap + initial focus on open (PALETTE-04 parity) */
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const focusable = sheet.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onTab);
    return () => window.removeEventListener("keydown", onTab);
  }, [open]);

  /* On close, restore focus to the hamburger trigger by id */
  useEffect(() => {
    if (!open) {
      const trigger = document.getElementById("topbar-hamburger-btn");
      trigger?.focus();
    }
  }, [open]);

  return (
    <>
      <div
        className="drawer-backdrop"
        data-state={open ? "open" : "closed"}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      <div
        ref={sheetRef}
        id="explorer-drawer-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="drawer-sheet"
        data-state={open ? "open" : "closed"}
      >
        <h2 id="drawer-title" className="sr-only">File explorer</h2>

        {/* Section A: EXPLORER header */}
        <div className="sb-section-header" style={{ padding: "0 16px 8px" }}>EXPLORER</div>

        {/* Section B: Tree root (decorative) */}
        <div className="sb-tree-root" style={{ padding: "0 16px 8px" }}>
          <span className="sb-tree-caret" aria-hidden="true">▾</span>
          <span>portfolio/</span>
        </div>

        {/* Section C: 7 file rows from ROUTES — auto-close on navigation (D-06) */}
        {ROUTES.map((route) => (
          <button
            key={route.pathname}
            className={`sb-item drawer-file-row${isActive(route.slug) ? " sb-item--active" : ""}`}
            aria-label={route.ariaLabel}
            aria-current={isActive(route.slug) ? "page" : undefined}
            onClick={() => {
              setOpen(false);
              router.push(route.pathname);
            }}
          >
            <span className="sb-icon" aria-hidden="true">
              {ROUTE_ICONS[route.label] ?? "▸"}
            </span>
            <span className="sb-label">{route.label}</span>
          </button>
        ))}

        {/* Section D: Recruiter resume card (D-07) */}
        <div className="sb-download" style={{ margin: "20px 16px 0" }}>
          <div className="sb-download-header">For recruiters</div>
          <a
            className="sb-download-btn"
            href={profile.resumeUrl}
            download="Bakytbek_Tatibekov_Resume.pdf"
            aria-label="Download resume"
          >
            ↓ resume.pdf
          </a>
        </div>
      </div>
    </>
  );
}
