// app/opengraph-image.tsx
// NO "use client" — Next.js metadata file convention RSC.
// Per-route OG card: pure-text matrix-accent design (D-01, D-02). Dark bg only (D-03).
// Inline hex (Pitfall 1: next/og does NOT consume CSS variables).
// display: "flex" everywhere (Pitfall 2). JetBrains Mono via readFile (Pitfall 4).
// Root OG: substitutes `about.md` (homepage default; mirrors (terminal)/opengraph-image.tsx).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROUTE_LABEL = "about.md";
export const alt = "Bakytbek Tatibekov — Sr. Software Engineer (about.md)";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inlined from app/globals.css — keep in sync if palette changes.
const BG_DARK = "#0a0c0b";       // --bg dark
const TEXT_HI = "#ebe9e2";       // --text-hi dark
const MUTED = "#8a938f";         // --muted-hi dark
const ACCENT_MATRIX = "#22c55e"; // --accent dark sRGB (matrix only, D-02)

export default async function Image() {
  const fontBoldBuffer = await readFile(
    join(process.cwd(), "assets/JetBrainsMono-Bold.ttf")
  );
  const fontMediumBuffer = await readFile(
    join(process.cwd(), "assets/JetBrainsMono-Medium.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG_DARK,
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "JetBrains Mono"
        }}
      >
        {/* Top half — name + role */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center"
          }}
        >
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: TEXT_HI }}>
            Bakytbek Tatibekov
          </div>
          <div
            style={{ display: "flex", fontSize: 28, fontWeight: 500, color: MUTED, marginTop: 12 }}
          >
            // Sr. Software Engineer
          </div>
        </div>

        {/* Bottom — accent block + path */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 8, height: 24, background: ACCENT_MATRIX, display: "flex" }} />
          <div style={{ display: "flex", fontSize: 32, fontWeight: 500, color: ACCENT_MATRIX }}>
            ~/portfolio/{ROUTE_LABEL}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "JetBrains Mono", data: fontBoldBuffer, weight: 700, style: "normal" },
        { name: "JetBrains Mono", data: fontMediumBuffer, weight: 500, style: "normal" }
      ]
    }
  );
}
