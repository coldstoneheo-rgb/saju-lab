import { describe, expect, it } from "vitest";
import { calculatePillars, generateReportV1 } from "./index.js";
import type { BirthInput } from "./types.js";

describe("calculatePillars", () => {
  it("returns all four pillars when birth time is known", () => {
    const input: BirthInput = {
      birthDate: "1990-01-01",
      birthTime: "10:30",
      timezone: "Asia/Seoul",
      sex: "other"
    };

    const result = calculatePillars(input);

    expect(result.year).toEqual({ stem: "gyeong", branch: "o" });
    expect(result.month).toBeDefined();
    expect(result.day).toBeDefined();
    expect(result.time).toBeDefined();
  });

  it("omits time pillar when birth time is unknown", () => {
    const result = calculatePillars({
      birthDate: "1990-01-01",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(result.time).toBeUndefined();
  });
});

describe("generateReportV1", () => {
  it("includes transparency notes and disclaimer", () => {
    const input: BirthInput = {
      birthDate: "1990-01-01",
      timezone: "Asia/Seoul",
      sex: "other"
    };
    const pillars = calculatePillars(input);

    const report = generateReportV1({
      input,
      pillars,
      generatedAt: "2026-05-14T00:00:00.000Z"
    });

    expect(report.meta.version).toBe("1.0");
    expect(report.meta.confidence).toBe("low");
    expect(report.overview.disclaimers[0]).toContain("금융");
    expect(report.transparency.missingDataNotes).toHaveLength(1);
  });
});
