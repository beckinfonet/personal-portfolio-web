"use client";

import { useEffect, useRef, useState } from "react";

interface CopyButtonProps {
  /** The string written to clipboard on click. */
  value: string;
  /** Visible label in idle state. Default: "⧉ copy". */
  idleLabel?: string;
  /** Visible label after a successful copy. Default: "copied ✓". */
  copiedLabel?: string;
  /** REQUIRED — plain-noun label for screen readers (e.g. "Copy stack JSON"). */
  ariaLabel: string;
  /** Optional className for view-specific composition (.stack-copy, .contact-copy, .copy-button--icon, etc.). */
  className?: string;
}

/**
 * Phase 3's ONLY client island (per Pitfall 9 / SHELL-02).
 * Used by stack-view (copy JSON), contact-view (copy email), shipped-view (copy store URL).
 */
export function CopyButton({
  value,
  idleLabel = "⧉ copy",
  copiedLabel = "copied ✓",
  ariaLabel,
  className
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard write can fail (permissions, insecure context). Swallow silently —
      // the user-visible UI does not flip to "copied" so failure is implicit.
      return;
    }
    setCopied(true);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setCopied(false);
      timerRef.current = null;
    }, 1500);
  }

  const cls = ["copy-button", copied ? "copy-button--confirmed" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <span aria-hidden="true">{copied ? copiedLabel : idleLabel}</span>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
