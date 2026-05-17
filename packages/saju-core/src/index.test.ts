import { describe, expect, it } from "vitest";
import { calculatePillars, cyclePillar, generatePaidReportV1, generateReportV1, getPillarTerms, getSajuTerm, hourBranchIndex } from "./index.js";
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

  it("keeps the new year and month one minute after Ipchun", () => {
    expect(calculatePillars({
      birthDate: "2024-02-04",
      birthTime: "17:28",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toMatchObject({
      year: { stem: "gap", branch: "jin" },
      month: { stem: "byeong", branch: "in" }
    });
  });

  it("keeps the previous month one minute before the Gyeongchip boundary", () => {
    expect(calculatePillars({
      birthDate: "2024-03-05",
      birthTime: "11:21",
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual({ stem: "byeong", branch: "in" });
  });

  it("applies the new month at the exact Gyeongchip boundary", () => {
    expect(calculatePillars({
      birthDate: "2024-03-05",
      birthTime: "11:22",
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual({ stem: "jeong", branch: "myo" });
  });

  it("keeps the new month one minute after the Gyeongchip boundary", () => {
    expect(calculatePillars({
      birthDate: "2024-03-05",
      birthTime: "11:23",
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual({ stem: "jeong", branch: "myo" });
  });

  it("does not roll 23:00 Ja hour over to the next civil date in the current MVP", () => {
    const beforeJaHour = calculatePillars({
      birthDate: "2010-06-21",
      birthTime: "22:59",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    const jaHour = calculatePillars({
      birthDate: "2010-06-21",
      birthTime: "23:00",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    const nextCivilDate = calculatePillars({
      birthDate: "2010-06-22",
      birthTime: "00:00",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(jaHour.day).toEqual(beforeJaHour.day);
    expect(jaHour.day).not.toEqual(nextCivilDate.day);
    expect(jaHour.time?.branch).toBe("ja");
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

describe("generatePaidReportV1", () => {
  it("generates a paid detailed report with PDF-ready requirements", () => {
    const fixture = GOLDEN_FIXTURES[4];

    if (fixture === undefined) {
      throw new Error("Expected representative golden fixture.");
    }

    const paidReport = generatePaidReportV1({
      input: fixture.input,
      pillars: calculatePillars(fixture.input),
      generatedAt: "2026-05-15T00:00:00.000Z"
    });

    expect(paidReport.meta.product).toBe("one-time-detailed-report");
    expect(paidReport.meta.exportFormat).toBe("pdf-ready-html");
    expect(paidReport.cover.title).toContain("유료 상세 리포트");
    expect(paidReport.executiveSummary.items.length).toBeGreaterThan(0);
    expect(paidReport.careerDeepDive.roleFit.items.length).toBeGreaterThan(0);
    expect(paidReport.financeDeepDive.riskChecklist.items.length).toBeGreaterThanOrEqual(4);
    expect(paidReport.yearlyMonthlyExpansion.monthlyThemes.length).toBeGreaterThan(0);
    expect(paidReport.yearlyMonthlyExpansion.monthlyThemes[0]).toEqual(expect.objectContaining({
      action: expect.any(String),
      caution: expect.any(String),
      month: expect.any(String),
      theme: expect.any(String)
    }));
    expect(paidReport.pdf.filename).toBe("saju-lab-paid-report-20260515.html");
    expect(paidReport.pdf.requiredNotices).toContain("신뢰도");
    expect(paidReport.transparencyAppendix.disclaimers.join(" ")).toContain("투자 추천");
  });

  it("meets minimum paid content quality thresholds", () => {
    const fixture = GOLDEN_FIXTURES[4];

    if (fixture === undefined) {
      throw new Error("Expected representative golden fixture.");
    }

    const paidReport = generatePaidReportV1({
      input: fixture.input,
      pillars: calculatePillars(fixture.input),
      generatedAt: "2026-05-15T00:00:00.000Z"
    });
    const sections = [
      paidReport.executiveSummary,
      paidReport.personalityDeepDive,
      paidReport.careerDeepDive.roleFit,
      paidReport.careerDeepDive.workStyle,
      paidReport.careerDeepDive.riskPatterns,
      paidReport.careerDeepDive.actionPlan,
      paidReport.financeDeepDive.rhythm,
      paidReport.financeDeepDive.planningPrompts,
      paidReport.yearlyMonthlyExpansion.yearlyTheme
    ];

    for (const section of sections) {
      expect(section.summary.length).toBeGreaterThan(10);
      expect(section.items.length).toBeGreaterThanOrEqual(3);
    }

    expect(paidReport.financeDeepDive.riskChecklist.items.length).toBeGreaterThanOrEqual(4);
    expect(paidReport.actionPlan.items.length).toBeGreaterThanOrEqual(4);
    expect(paidReport.careerDeepDive.riskPatterns.items.join(" ")).toContain("회복");
    expect(paidReport.financeDeepDive.rhythm.items.join(" ")).toContain("고정비");
  });

  it("keeps missing birth time visible in paid reports", () => {
    const input: BirthInput = {
      birthDate: "1990-01-01",
      timezone: "Asia/Seoul",
      sex: "other"
    };
    const paidReport = generatePaidReportV1({
      input,
      pillars: calculatePillars(input),
      generatedAt: "2026-05-15T00:00:00.000Z"
    });

    expect(paidReport.meta.confidence).toBe("low");
    expect(paidReport.executiveSummary.items.join(" ")).toContain("출생시간이 없어");
    expect(paidReport.yearlyMonthlyExpansion.monthlyThemes[0]?.caution).toContain("출생시간 미상");
    expect(paidReport.transparencyAppendix.missingDataNotes).toHaveLength(1);
    expect(paidReport.pdf.requiredNotices).toContain("출생시간 미상 영향");
  });
});

describe("terminology", () => {
  it("provides short Korean explanations for core MVP Saju terms", () => {
    expect(getPillarTerms()).toEqual([
      expect.objectContaining({ key: "yearPillar", label: "연주", short: "큰 흐름" }),
      expect.objectContaining({ key: "monthPillar", label: "월주", short: "환경과 리듬" }),
      expect.objectContaining({ key: "dayPillar", label: "일주", short: "나의 중심" }),
      expect.objectContaining({ key: "timePillar", label: "시주", short: "세부 흐름" })
    ]);

    for (const term of getPillarTerms()) {
      expect(term.description.length).toBeGreaterThan(10);
      expect(term.description).toContain("기둥");
    }
  });

  it("keeps calculation transparency terms understandable", () => {
    expect(getSajuTerm("heavenlyStem").description).toContain("겉으로 드러나는");
    expect(getSajuTerm("earthlyBranch").description).toContain("바탕");
    expect(getSajuTerm("solarTerm").description).toContain("연주와 월주");
  });
});
