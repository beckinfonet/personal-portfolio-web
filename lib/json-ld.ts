// lib/json-ld.ts
// Phase 5 SEO-02: schema.org Person builder + sameAs filter.
// Pure helpers — no side effects, no environment access (siteUrl passed as arg).
// The XSS escape (Pitfall 6) is applied at the JSX call site in
// app/components/shell/json-ld-person.tsx, NOT here. Separation of concerns:
// builder produces a typed object; emitter handles HTML-escaping for inline-script
// safety.
import type { Profile } from "@/lib/types";

interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  jobTitle: string;
  url: string;
  email: string;
  sameAs: string[];
}

/**
 * D-09 sameAs auto-filter: include any social URL that matches /^https?:\/\//.
 * Excludes invalid-URL sentinels and any non-http(s) protocol (mailto:, javascript:, etc).
 * When Phase 6 fills the LinkedIn URL or 3rd-social pick, those entries auto-join
 * sameAs with no code edit here.
 */
export function filterValidUrls(profile: Profile): string[] {
  return profile.socials
    .map((s) => s.url)
    .filter((url) => /^https?:\/\//.test(url));
}

/**
 * D-08 Person schema builder. Fields shipped Phase 5: @context, @type, name,
 * jobTitle, url, email, sameAs. Phase 6 enriches with description, image, address
 * once content lands — never stubbed (Google caches what we ship).
 */
export function buildPersonSchema(profile: Profile, siteUrl: string): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: siteUrl,
    email: profile.email,
    sameAs: filterValidUrls(profile)
  };
}
