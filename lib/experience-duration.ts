/**
 * Parse a period string into a "Ny Nmo" duration label.
 *
 * Accepted shapes (case-insensitive on "present", whitespace-tolerant):
 *   "2023 - present"        → start = Jan 1 of start year; end = now (or `now` param)
 *   "2019 - 2022"           → start = Jan 1 of start year; end = Jan 1 of end year (exclusive — "2019 - 2022" = 3y)
 *   "Jan 2020 - Mar 2023"   → month-precision range
 *   "Jan 2020 - present"    → month-start, end = now
 *
 * Returns null when:
 *   - The string does not match any accepted shape.
 *   - The end date is before the start date (negative range, including now < start).
 *   - The computed duration is zero (meaningless).
 *
 * Output formatting:
 *   - Exact years (months === 0): "Ny" (e.g. "3y")
 *   - Less than a year (years === 0): "Nmo" (e.g. "5mo")
 *   - Otherwise: "Ny Nmo" (e.g. "2y 5mo")
 *
 * Pure function: takes optional `now` for deterministic testing.
 * Used by app/components/views/experience-view.tsx (spec §3).
 */
const MONTH_NAMES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec"
];

function parseEndpoint(s: string): { year: number; month: number } | null {
  // Returns 0-indexed month (0 = Jan).
  const trimmed = s.trim().toLowerCase();
  // "Jan 2020" → month + year
  const monthYear = trimmed.match(/^([a-z]{3,9})\s+(\d{4})$/);
  if (monthYear) {
    const monthIdx = MONTH_NAMES.indexOf(monthYear[1].slice(0, 3));
    if (monthIdx === -1) return null;
    return { year: parseInt(monthYear[2], 10), month: monthIdx };
  }
  // "2020" → year only; default month is January.
  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) {
    return { year: parseInt(yearOnly[1], 10), month: 0 };
  }
  return null;
}

export function computeDurationLabel(period: string, now?: Date): string | null {
  if (!period || typeof period !== "string") return null;

  // Split on a hyphen surrounded by whitespace; collapse extra whitespace.
  const parts = period.split(/\s*-\s*/);
  if (parts.length !== 2) return null;
  const [startRaw, endRaw] = parts;

  const start = parseEndpoint(startRaw);
  if (!start) return null;

  let endYear: number;
  let endMonth: number;
  const isPresent = /^present$/i.test(endRaw.trim());

  if (isPresent) {
    const reference = now ?? new Date();
    // Use UTC methods so an ISO-string `now` (e.g. "2023-01-01") deterministically
    // resolves to Jan 2023 regardless of the runtime's local timezone.
    endYear = reference.getUTCFullYear();
    endMonth = reference.getUTCMonth();
  } else {
    const end = parseEndpoint(endRaw);
    if (!end) return null;
    // For year-only fixed end, treat end as Jan of that year (exclusive — "2019 - 2022" = 3y).
    endYear = end.year;
    endMonth = end.month;
  }

  const totalMonthsStart = start.year * 12 + start.month;
  const totalMonthsEnd = endYear * 12 + endMonth;
  const diff = totalMonthsEnd - totalMonthsStart;

  if (diff < 0) return null;

  const years = Math.floor(diff / 12);
  const months = diff % 12;

  if (years === 0 && months === 0) return null; // 0-duration is meaningless
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}mo`;
}
