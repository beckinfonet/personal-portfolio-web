/**
 * Formats the duration from a career start date to a given "now" date as "Yy DDDd".
 * Computed at build time in the RSC shell layout — no setInterval needed (daily drift acceptable).
 *
 * @example
 * formatUptime(new Date("2018-01-01"), new Date("2026-05-06")) // "8y 125d"
 */
export function formatUptime(startDate: Date, now: Date): string {
  const ms = now.getTime() - startDate.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const remainder = days % 365;
  return `${years}y ${String(remainder).padStart(3, "0")}d`;
}
