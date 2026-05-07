// RSC primitive — no client directive (SHELL-02 / RSC-first; static content only)
// CSS class .print-footer is defined in app/globals.css (Phase 4 Plan 04-01):
//   default: display: none
//   @media print: display: block !important; with margin/border/page-break-inside: avoid
// Visible ONLY when the user prints; never on screen.

interface PrintFooterProps {
  /** Site URL — typically process.env.NEXT_PUBLIC_SITE_URL with localhost fallback. */
  siteUrl: string;
  /** Contact email — typically PROFILE.email from lib/portfolio-data.ts. */
  email: string;
}

export function PrintFooter({ siteUrl, email }: PrintFooterProps) {
  return (
    <aside className="print-footer" aria-hidden="true">
      {siteUrl} · {email}
    </aside>
  );
}
