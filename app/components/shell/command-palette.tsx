"use client";

import { Command } from "cmdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { usePalette, useAccent } from "@/app/components/shell/shell-state-provider";
import { Kbd } from "@/app/components/primitives/kbd";
import { buildPaletteVerbs } from "@/lib/palette-verbs";
import type { Profile } from "@/lib/types";

export function CommandPalette({ profile }: { profile: Profile }) {
  const { open, setOpen } = usePalette();
  const { setHue } = useAccent();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  /* Capture the element that had focus when the palette opened (PALETTE-04 / A11Y-08) */
  const triggerRef = useRef<HTMLElement | null>(null);

  /* Verbs derived from live profile (Plan 07-10 / DATA-04) — memoized per profile identity */
  const PALETTE_VERBS = useMemo(() => buildPaletteVerbs(profile), [profile]);

  /* Visible result count for aria-live announcement (PALETTE-03) */
  const [count, setCount] = useState(PALETTE_VERBS.length);

  /* Global ⌘K / Ctrl-K listener — toggles palette, captures trigger element */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) {
          /* Capture focus origin only when opening */
          triggerRef.current = document.activeElement as HTMLElement;
        }
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  /* Restore focus to trigger element when palette closes (PALETTE-04 / A11Y-08) */
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [open]);

  /* Reset count when palette opens */
  useEffect(() => {
    if (open) {
      setCount(PALETTE_VERBS.length);
    }
  }, [open, PALETTE_VERBS]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="palette-dialog"
    >
      {/* Visually-hidden accessible name — belt-and-suspenders for cmdk label prop */}
      <span className="visually-hidden">Command Palette</span>

      {/* Search input */}
      <Command.Input
        placeholder="Type a command or file..."
        className="palette-input"
        onValueChange={(value) => {
          /* Update result count as user types */
          if (!value) {
            setCount(PALETTE_VERBS.length);
          } else {
            const lower = value.toLowerCase();
            const matched = PALETTE_VERBS.filter((verb) => {
              if (verb.label.toLowerCase().includes(lower)) return true;
              return verb.keywords.some((kw) => kw.toLowerCase().includes(lower));
            });
            setCount(matched.length);
          }
        }}
      />

      {/* aria-live result count region (PALETTE-03 / A11Y) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {count} {count === 1 ? "result" : "results"}
      </div>

      {/* Verb list — flat, no group headings (D-02) */}
      <Command.List className="palette-list">
        <Command.Empty className="palette-empty">No matches.</Command.Empty>

        {PALETTE_VERBS.map((verb) => (
          <Command.Item
            key={verb.id}
            value={verb.label}
            keywords={verb.keywords as string[]}
            onSelect={() => {
              verb.action({
                router,
                setOpen,
                setTheme,
                resolvedTheme,
                setHue,
              });
            }}
            className="palette-item"
          >
            <span className="palette-item-icon" aria-hidden="true">
              {verb.icon}
            </span>
            <span className="palette-item-label">{verb.label}</span>
          </Command.Item>
        ))}
      </Command.List>

      {/* Footer keyboard hint */}
      <div className="palette-footer">
        <span><Kbd>↵</Kbd> select</span>
        <span><Kbd>↑↓</Kbd> navigate</span>
        <span><Kbd>esc</Kbd> close</span>
      </div>
    </Command.Dialog>
  );
}
