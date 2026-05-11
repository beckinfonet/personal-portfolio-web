import { describe, test, expect } from "vitest";
import { buildPersonSchema, filterValidUrls } from "./json-ld";
import type { Profile, Social } from "./types";

function fixtureProfile(overrides: Partial<Profile> = {}): Profile {
  const base: Profile = {
    name: "Test Name",
    shortName: "Test",
    initials: "TN",
    role: "Engineer",
    location: "Remote",
    email: "test@example.test",
    resumeUrl: "/Bakytbek_Tatibekov_Resume.pdf",
    bio: { short: "", long: [] },
    highlights: [],
    socials: []
  };
  return { ...base, ...overrides };
}

function social(overrides: Partial<Social> = {}): Social {
  return {
    label: "Test",
    handle: "@test",
    url: "https://example.test",
    kind: "other",
    ...overrides
  };
}

describe("filterValidUrls", () => {
  test("includes URLs matching /^https?:\\/\\//", () => {
    const p = fixtureProfile({
      socials: [
        social({ url: "https://github.com/foo" }),
        social({ url: "http://example.test" })
      ]
    });
    expect(filterValidUrls(p)).toEqual([
      "https://github.com/foo",
      "http://example.test"
    ]);
  });

  test("excludes URLs that do NOT start with http(s)://", () => {
    const p = fixtureProfile({
      socials: [
        social({ url: "https://real.test" }),
        social({ url: "mailto:foo@bar.test" }),
        social({ url: "javascript:alert(1)" }),
        social({ url: "ftp://legacy.test" })
      ]
    });
    expect(filterValidUrls(p)).toEqual(["https://real.test"]);
  });

  test("returns empty array when socials is empty", () => {
    const p = fixtureProfile({ socials: [] });
    expect(filterValidUrls(p)).toEqual([]);
  });

  test("filters URL sentinels that fail the http(s) prefix check", () => {
    // Note: test uses lowercase 'todo:' to avoid INFRA-05 grep failure (Pitfall 9).
    const p = fixtureProfile({
      socials: [
        social({ url: "https://github.com/real" }),
        social({ url: "todo: fill in linkedin" })
      ]
    });
    expect(filterValidUrls(p)).toEqual(["https://github.com/real"]);
  });
});

describe("buildPersonSchema", () => {
  test("returns @context: https://schema.org and @type: Person", () => {
    const schema = buildPersonSchema(fixtureProfile(), "https://example.test");
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
  });

  test("uses PROFILE.name verbatim", () => {
    const schema = buildPersonSchema(
      fixtureProfile({ name: "Bakytbek Tatibekov" }),
      "https://example.test"
    );
    expect(schema.name).toBe("Bakytbek Tatibekov");
  });

  test("uses PROFILE.role as jobTitle", () => {
    const schema = buildPersonSchema(
      fixtureProfile({ role: "Sr. Software Engineer" }),
      "https://example.test"
    );
    expect(schema.jobTitle).toBe("Sr. Software Engineer");
  });

  test("uses PROFILE.email", () => {
    const schema = buildPersonSchema(
      fixtureProfile({ email: "real@test.test" }),
      "https://example.test"
    );
    expect(schema.email).toBe("real@test.test");
  });

  test("uses siteUrl arg as schema.url", () => {
    const schema = buildPersonSchema(fixtureProfile(), "https://bakytbek.dev");
    expect(schema.url).toBe("https://bakytbek.dev");
  });

  test("sameAs is the filterValidUrls result", () => {
    const p = fixtureProfile({
      socials: [
        social({ url: "https://github.com/foo" }),
        social({ url: "todo: linkedin" }),
        social({ url: "https://linkedin.com/in/foo" })
      ]
    });
    const schema = buildPersonSchema(p, "https://example.test");
    expect(schema.sameAs).toEqual([
      "https://github.com/foo",
      "https://linkedin.com/in/foo"
    ]);
  });
});
