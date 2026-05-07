// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.shipped-subhead, .shipped-list, .shipped-row, .shipped-row-index,
//   .shipped-row-name, .shipped-row-summary, .shipped-row-affordances, .shipped-row-meta,
//   .shipped-row-year, .shipped-row-status, .shipped-row-role, .copy-button,
//   .copy-button--icon, .empty-state) defined in app/globals.css.

import type { ShippedApp } from "@/lib/types";
import { StoreBadge } from "@/app/components/primitives/store-badge";
import { CopyButton } from "@/app/components/primitives/copy-button";

interface ShippedViewProps {
  shipped: ShippedApp[];
}

export function ShippedView({ shipped }: ShippedViewProps) {
  if (shipped.length === 0) {
    return (
      <div className="content-block">
        <div className="empty-state">total 0 · (no apps shipped to stores yet)</div>
      </div>
    );
  }

  const sorted = [...shipped].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <div className="content-block">
      <div className="shipped-subhead">
        total {sorted.length} · sorted by year desc
      </div>
      <ul className="shipped-list">
        {sorted.map((app, i) => {
          const showIos = app.platforms.includes("ios") && !!app.appStoreUrl;
          const showAndroid =
            app.platforms.includes("android") && !!app.googlePlayUrl;
          const copyUrl = app.appStoreUrl ?? app.googlePlayUrl;
          return (
            <li key={app.name} className="shipped-row">
              <span className="shipped-row-index">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div>
                <div className="shipped-row-name">{app.name}</div>
                {app.summary && (
                  <div className="shipped-row-summary">{app.summary}</div>
                )}
                <div className="shipped-row-affordances">
                  {showIos && app.appStoreUrl && (
                    <StoreBadge
                      platform="ios"
                      href={app.appStoreUrl}
                      appName={app.name}
                    />
                  )}
                  {showAndroid && app.googlePlayUrl && (
                    <StoreBadge
                      platform="android"
                      href={app.googlePlayUrl}
                      appName={app.name}
                    />
                  )}
                  {copyUrl && (
                    <CopyButton
                      value={copyUrl}
                      ariaLabel={`Copy ${app.name} store link`}
                      className="copy-button--icon"
                      idleLabel="⧉"
                      copiedLabel="✓"
                    />
                  )}
                </div>
              </div>
              <div className="shipped-row-meta">
                <div className="shipped-row-year">{app.year}</div>
                <div className="shipped-row-status">shipped</div>
                <div className="shipped-row-role">{app.role}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
