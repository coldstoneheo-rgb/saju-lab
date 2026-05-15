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
  it.each(GOLDEN_FIXTURES)("generates a complete rules-only report for $id", (fixture) => {
    const report = generateReportV1({
      input: fixture.input,
      pillars: calculatePillars(fixture.input),
      generatedAt: "2026-05-14T00:00:00.000Z"
    });

    expect(report.overview.summary).not.toHaveLength(0);
    expect(report.overview.toneGuidelines.length).toBeGreaterThan(0);
    expect(report.overview.disclaimers[0]).toContain("금융");
    expect(report.overview.disclaimers[0]).toContain("의학");
    expect(report.overview.disclaimers[0]).toContain("법률");
    expect(report.personality.strengths.length).toBeGreaterThan(0);
    expect(report.personality.blindSpots.length).toBeGreaterThan(0);
    expect(report.career.trends.length).toBeGreaterThan(0);
    expect(report.career.risks.length).toBeGreaterThan(0);
    expect(report.career.actions.length).toBeGreaterThan(0);
    expect(report.finance.trends.length).toBeGreaterThan(0);
    expect(report.finance.risks.length).toBeGreaterThan(0);
    expect(report.finance.actions.length).toBeGreaterThan(0);
    expect(report.yearlyOutlook.highlights.length).toBeGreaterThan(0);
    expect(report.yearlyOutlook.cautions.length).toBeGreaterThan(0);
    expect(report.monthly.goodMonths.length).toBeGreaterThan(0);
    expect(report.monthly.cautionMonths.length).toBeGreaterThan(0);
    expect(report.actionSuggestions.habits.length).toBeGreaterThan(0);
    expect(report.actionSuggestions.planning.length).toBeGreaterThan(0);
    expect(report.actionSuggestions.riskManagement.length).toBeGreaterThan(0);
    expect(report.transparency.certain.length).toBeGreaterThan(0);
    expect(report.transparency.inferred.length).toBeGreaterThan(0);
  });

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

  it("keeps report shape and key copy stable for a representative fixture", () => {
    const fixture = GOLDEN_FIXTURES[4];

    if (fixture === undefined) {
      throw new Error("Expected representative golden fixture.");
    }

    const report = generateReportV1({
      input: fixture.input,
      pillars: calculatePillars(fixture.input),
      generatedAt: "2026-05-14T00:00:00.000Z"
    });

    expect({
      confidence: report.meta.confidence,
      summary: report.overview.summary,
      firstStrength: report.personality.strengths[0],
      firstCareerAction: report.career.actions[0],
      goodMonths: report.monthly.goodMonths,
      transparency: report.transparency.certain
    }).toMatchInlineSnapshot(`
      {
        "confidence": "medium",
        "firstCareerAction": "큰 결정을 하기 전 유지 비용과 회복 기간을 먼저 계산하세요.",
        "firstStrength": "복잡한 일을 구조화하고 책임 있게 버티는 데 강점이 있습니다.",
        "goodMonths": [
          "2월: 새로운 시도를 시작하기 쉽지만 속도 조절이 필요합니다.",
          "3월: 새로운 시도를 시작하기 쉽지만 속도 조절이 필요합니다.",
        ],
        "summary": "이 리포트는 무술 일주를 중심으로 사주 구조를 읽기 쉽게 정리한 설명형 요약입니다. 흔들리는 상황을 붙잡고 기준을 세우는 힘이 있습니다.",
        "transparency": [
          "입력된 생년월일: 2024-02-04",
          "타임존: Asia/Seoul",
          "계산된 일주: 무술",
        ],
      }
    `);
  });
});
