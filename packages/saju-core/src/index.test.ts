import { describe, expect, it } from "vitest";
import { calculatePillars, cyclePillar, generateReportV1, hourBranchIndex } from "./index.js";
import { GOLDEN_FIXTURES } from "./fixtures.js";
import type { BirthInput } from "./types.js";

describe("sexagenary cycle utilities", () => {
  it("wraps cycle indexes in both directions", () => {
    expect(cyclePillar(0)).toEqual({ stem: "gap", branch: "ja" });
    expect(cyclePillar(1)).toEqual({ stem: "eul", branch: "chuk" });
    expect(cyclePillar(59)).toEqual({ stem: "gye", branch: "hae" });
    expect(cyclePillar(60)).toEqual({ stem: "gap", branch: "ja" });
    expect(cyclePillar(-1)).toEqual({ stem: "gye", branch: "hae" });
  });

  it("maps local clock hours to traditional two-hour branches", () => {
    expect(hourBranchIndex(23)).toBe(0);
    expect(hourBranchIndex(0)).toBe(0);
    expect(hourBranchIndex(1)).toBe(1);
    expect(hourBranchIndex(10)).toBe(5);
  });
});

describe("calculatePillars", () => {
  it("returns all four pillars when birth time is known", () => {
    const input: BirthInput = {
      birthDate: "1990-01-01",
      birthTime: "10:30",
      timezone: "Asia/Seoul",
      sex: "other"
    };

    const result = calculatePillars(input);

    expect(result).toEqual({
      year: { stem: "gi", branch: "sa" },
      month: { stem: "byeong", branch: "ja" },
      day: { stem: "byeong", branch: "in" },
      time: { stem: "gye", branch: "sa" }
    });
  });

  it("omits time pillar when birth time is unknown", () => {
    const result = calculatePillars({
      birthDate: "1990-01-01",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(result.time).toBeUndefined();
  });

  it.each(GOLDEN_FIXTURES)("$id", (fixture) => {
    expect(calculatePillars(fixture.input)).toEqual(fixture.expected);
  });

  it("applies the previous year and month one minute before Ipchun", () => {
    expect(calculatePillars({
      birthDate: "2024-02-04",
      birthTime: "17:26",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toMatchObject({
      year: { stem: "gye", branch: "myo" },
      month: { stem: "eul", branch: "chuk" }
    });
  });

  it("applies the new year and month at the exact Ipchun minute", () => {
    expect(calculatePillars({
      birthDate: "2024-02-04",
      birthTime: "17:27",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toMatchObject({
      year: { stem: "gap", branch: "jin" },
      month: { stem: "byeong", branch: "in" }
    });
  });

  it("applies the new month at the exact Gyeongchip boundary", () => {
    expect(calculatePillars({
      birthDate: "2024-03-05",
      birthTime: "11:22",
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual({ stem: "jeong", branch: "myo" });
  });

  it("rejects date-only inputs on solar term boundary dates", () => {
    expect(() => calculatePillars({
      birthDate: "2024-02-04",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("birthTime is required");

    expect(() => calculatePillars({
      birthDate: "2024-03-05",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("birthTime is required");
  });

  it("rejects dates beyond the embedded solar month table range", () => {
    expect(() => calculatePillars({
      birthDate: "1990-03-01",
      birthTime: "12:00",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("No upper solar month boundary");

    expect(() => calculatePillars({
      birthDate: "2024-12-01",
      birthTime: "12:00",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("No upper solar month boundary");
  });

  it("rejects invalid dates, invalid times, and unsupported timezones", () => {
    expect(() => calculatePillars({
      birthDate: "2024-02-30",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("valid Gregorian date");

    expect(() => calculatePillars({
      birthDate: "2024-02-04",
      birthTime: "24:00",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("HH:mm");

    expect(() => calculatePillars({
      birthDate: "2024-02-04",
      timezone: "UTC",
      sex: "other"
    })).toThrow("Asia/Seoul");
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
