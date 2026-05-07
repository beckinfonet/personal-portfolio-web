"use client";

/* Tiny client leaf — computes the runtime tz string via Intl.DateTimeFormat.
   Kept separate from StatusBlock so the parent can stay RSC and be consumed
   from the about-view RSC without forcing the whole STATUS block client-side. */

export function StatusTz() {
  const tz = (() => {
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!resolved) return "GMT+5 (flex)";
      const offset = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT+5 (flex)";
      return `${offset} (flex)`;
    } catch {
      return "GMT+5 (flex)";
    }
  })();

  return <span>{tz}</span>;
}
