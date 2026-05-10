// app/icon.tsx
// NO "use client" — Next.js metadata file convention RSC.
// Renders the `>_` terminal-prompt glyph as a 32x32 PNG via next/og.
// CSS variables are NOT consumed by next/og runtime — inline hex (Pitfall 1).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Inlined from app/globals.css — keep both in sync if palette changes.
const PANEL = "#0d100f";
const ACCENT_MATRIX = "#22c55e";

export default async function Icon() {
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
          fontSize: 18,
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
