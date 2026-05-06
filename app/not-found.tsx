// NO "use client" — RSC 404 (Next.js auto-returns HTTP 404 for this file)
// Pathname displayed via a tiny client child using usePathname() — see D-17
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { NotFoundPathname } from "@/app/components/not-found-pathname";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="prompt-line">
        <span className="prompt-dollar">$</span>
        <span className="prompt-cmd">
          ls -la <NotFoundPathname />
        </span>
      </div>

      <p className="not-found-error">
        ls: cannot access &apos;<NotFoundPathname />&apos;: No such file or directory
      </p>

      <p className="not-found-hint">Available files:</p>

      <ul className="not-found-routes">
        {ROUTES.map((r) => (
          <li key={r.pathname}>
            <Link href={r.pathname} className="not-found-link">
              {r.label}
            </Link>
            <span className="not-found-route-desc"> — {r.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
