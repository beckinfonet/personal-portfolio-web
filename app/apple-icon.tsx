// app/apple-icon.tsx
// NO "use client" — Next.js metadata file convention RSC.
// 180x180 rasterization of the same `>_` glyph as app/icon.tsx (D-13: one source of truth).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const PANEL = "#0d100f";
const ACCENT_MATRIX = "#22c55e";

export default async function AppleIcon() {
  const fontBuffer = await readFile(
    join(process.cwd(), "assets/JetBrainsMono-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PANEL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACCENT_MATRIX,
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "JetBrains Mono",
          letterSpacing: "-0.05em"
        }}
      >
        {">_"}
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "JetBrains Mono",
          data: fontBuffer,
          weight: 700,
          style: "normal"
        }
      ]
    }
  );
}
