// app/(terminal)/writing/opengraph-image.tsx
// NO "use client" — Next.js metadata file convention RSC.
// Per-route OG card for /writing (D-01, D-02, D-03 + D-04 route.label substitution).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROUTE_LABEL = "writing/";
export const alt = "Bakytbek Tatibekov — Sr. Software Engineer (writing/)";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG_DARK = "#0a0c0b";
const TEXT_HI = "#ebe9e2";
const MUTED = "#8a938f";
const ACCENT_MATRIX = "#22c55e";

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
