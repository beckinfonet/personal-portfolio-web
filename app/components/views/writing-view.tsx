// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.writing-list, .writing-post, .writing-post-meta, .writing-post-title,
//   .writing-post-excerpt, .empty-state) defined in app/globals.css.

import type { Writing } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";

interface WritingViewProps {
  writing: Writing[];
}

export function WritingView({ writing }: WritingViewProps) {
  if (writing.length === 0) {
    return (
      <div className="content-block">
        <div className="empty-state">
          // no posts yet — follow github.com/beckinfonet for code-as-content.
        </div>
      </div>
    );
  }

  // Defensive sort: date desc, but if any Date.parse returns NaN, fall back to array order.
  const parsed = writing.map((w) => ({ w, t: Date.parse(w.date) }));
  const allParsed = parsed.every((p) => !Number.isNaN(p.t));
  const sorted = allParsed
    ? [...parsed].sort((a, b) => b.t - a.t).map((p) => p.w)
    : writing;

  return (
    <div className="content-block">
      <ul className="writing-list">
        {sorted.map((w) => (
          <li key={w.slug || w.title}>
            <ExternalLink
              href={w.link}
              className="writing-post"
              aria-label={`Read ${w.title} (opens in new tab)`}
            >
              <div className="writing-post-meta">
                {w.date.toUpperCase()} · {w.readTime}
              </div>
              <div className="writing-post-title">› {w.title}</div>
              <div className="writing-post-excerpt">{w.excerpt}</div>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
