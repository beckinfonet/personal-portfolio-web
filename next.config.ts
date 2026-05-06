import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

const engineerHeaders = [
  // x-portfolio-source deferred to Phase 7 per D-13 (revised) — set when public deploy URL finalized.
  { key: "x-built-with", value: "nextjs-15-react-19" }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, ...engineerHeaders]
      }
    ];
  }
};

export default nextConfig;
