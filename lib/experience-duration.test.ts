import { describe, test, expect } from "vitest";
import { computeDurationLabel } from "./experience-duration";

describe("computeDurationLabel", () => {
  test("year-only range with present uses today via injected now", () => {
    expect(computeDurationLabel("2023 - present", new Date("2025-06-15"))).toBe("2y 5mo");
  });

  test("year-only fixed range omits months when exact-year", () => {
    expect(computeDurationLabel("2019 - 2022")).toBe("3y");
  });

  test("year-only fixed range ignores now param", () => {
    expect(computeDurationLabel("2019 - 2022", new Date("2050-01-01"))).toBe("3y");
  });

  test("month + year range parses correctly", () => {
    expect(computeDurationLabel("Jan 2020 - Mar 2023")).toBe("3y 2mo");
  });

  test("month + year present uses now", () => {
    expect(computeDurationLabel("Jan 2020 - present", new Date("2023-03-15"))).toBe("3y 2mo");
  });

  test("less than a year drops 0y prefix", () => {
    expect(computeDurationLabel("2022 - present", new Date("2022-06-01"))).toBe("5mo");
  });

  test("eleven-month boundary", () => {
    expect(computeDurationLabel("2022 - present", new Date("2022-12-31"))).toBe("11mo");
  });

  test("exact year boundary drops 0mo", () => {
    expect(computeDurationLabel("2022 - present", new Date("2023-01-01"))).toBe("1y");
  });

  test("garbage input returns null", () => {
    expect(computeDurationLabel("garbage")).toBeNull();
  });

  test("empty input returns null", () => {
    expect(computeDurationLabel("")).toBeNull();
  });

  test("negative fixed range returns null", () => {
    expect(computeDurationLabel("2024 - 2020")).toBeNull();
  });

  test("now before start returns null", () => {
    expect(computeDurationLabel("2020 - present", new Date("2019-01-01"))).toBeNull();
  });

  test("PRESENT case-insensitive", () => {
    expect(computeDurationLabel("2023 - PRESENT", new Date("2025-06-15"))).toBe("2y 5mo");
  });

  test("Present capitalized", () => {
    expect(computeDurationLabel("2023 - Present", new Date("2025-06-15"))).toBe("2y 5mo");
  });

  test("extra whitespace tolerated", () => {
    expect(computeDurationLabel("2023  -  present", new Date("2025-06-15"))).toBe("2y 5mo");
  });
});
