// NO "use client" — RSC inline-script emitter (parallels AccentBootstrapScript).
// SEO-02 / D-11: schema.org Person rendered in root <head> on every route.
// CRITICAL XSS defense (Pitfall 6): JSON.stringify does NOT escape `<`. Without the
// < replacement, an attacker-controlled string could close the <script> tag
// early. PROFILE is dev-controlled today, but Phase 6 introduces backend-sourced
// bio/image fields — the discipline must ship now.
import { PROFILE } from "@/lib/portfolio-data";
import { buildPersonSchema } from "@/lib/json-ld";

// Same `||` pattern as app/layout.tsx siteUrl (logical OR, NOT ??).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function JsonLdPerson() {
  const schema = buildPersonSchema(PROFILE, siteUrl);
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
