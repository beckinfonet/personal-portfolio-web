// NO "use client" — RSC primitive. Renders an official store badge wrapped in <ExternalLink showGlyph={false}>.
//
// BRAND-ASSET LICENSE COMPLIANCE (Phase 3 / D-13):
//   - App Store badge artwork is © Apple Inc. Sourced from Apple Marketing Identity Guidelines:
//     https://developer.apple.com/app-store/marketing/guidelines/
//     Download portal: https://toolbox.marketingtools.apple.com/app-store/
//     Black "Download on the App Store" SVG, English, unmodified.
//   - Google Play badge artwork is © Google LLC. Sourced from Google Play Brand Guidelines:
//     https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/
//     "Get it on Google Play" SVG, English, unmodified.
//   - Both files committed at public/badges/ on 2026-05-06.
//   - DO NOT modify, recolor, resize below minimums (Apple: 40px height; Google Play: 135px width),
//     angle, or animate the badge artwork.
//
// CSS class .store-badge-link is appended to app/globals.css in Plan 03-04.

import { ExternalLink } from "@/app/components/primitives/external-link";

/** Apple Marketing Identity Guidelines: minimum onscreen height 40px; recommended 135–160px on desktop view bodies. */
const APP_STORE_BADGE_HEIGHT = 40;
/** Google Play Brand Guidelines: minimum width 135px. */
const GOOGLE_PLAY_BADGE_WIDTH = 135;

interface StoreBadgeProps {
  platform: "ios" | "android";
  href: string;
  /** App display name; used in the screen-reader label (e.g. "Open Soulful on App Store"). */
  appName: string;
}

export function StoreBadge({ platform, href, appName }: StoreBadgeProps) {
  const src =
    platform === "ios"
      ? "/badges/app-store-badge.svg"
      : "/badges/google-play-badge.svg";
  const storeName = platform === "ios" ? "App Store" : "Google Play";

  // Use <img> rather than inline-SVG-via-fs-read: keeps the RSC simple, lets browsers cache
  // the asset, and preserves byte-equivalence with the official artwork. The <img> alt is
  // empty because the wrapping <ExternalLink> already carries the SR label, avoiding the
  // double-announce SR pattern.
  const dimensions =
    platform === "ios"
      ? { height: APP_STORE_BADGE_HEIGHT }
      : { width: GOOGLE_PLAY_BADGE_WIDTH };

  return (
    <ExternalLink
      href={href}
      showGlyph={false}
      className="store-badge-link"
      aria-label={`Open ${appName} on ${storeName}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- intentional: badge artwork is byte-pinned, no Next/Image transform. */}
      <img src={src} alt="" {...dimensions} />
    </ExternalLink>
  );
}
