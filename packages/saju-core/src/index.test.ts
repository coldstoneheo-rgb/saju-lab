import { describe, expect, it } from "vitest";
import { calculatePillars, cyclePillar, generatePaidReportV1, generateReportV1, getPillarTerms, getSajuTerm, hourBranchIndex } from "./index.js";
import { goldenCase, loadGoldenPillarCases } from "./golden-pillars.load.js";
import { IPCHUN_BY_YEAR, SOLAR_MONTH_BOUNDARIES } from "./solar-terms.js";
import type { BirthInput, Pillar } from "./types.js";

const GOLDEN_CASES = loadGoldenPillarCases();

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

  it.each(GOLDEN_CASES)("$id", (fixture) => {
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
      birthTime: "11:22",
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual({ stem: "byeong", branch: "in" });
  });

  it("applies the new month at the exact Gyeongchip boundary", () => {
    expect(calculatePillars({
      birthDate: "2024-03-05",
      birthTime: "11:23",
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual({ stem: "jeong", branch: "myo" });
  });

  it("keeps the new month one minute after the Gyeongchip boundary", () => {
    expect(calculatePillars({
      birthDate: "2024-03-05",
      birthTime: "11:24",
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual({ stem: "jeong", branch: "myo" });
  });

  const solarMonthBoundaryCases: Array<{
    term: string;
    before: { birthDate: string; birthTime: string; expected: Pillar };
    exact: { birthDate: string; birthTime: string; expected: Pillar };
    after: { birthDate: string; birthTime: string; expected: Pillar };
  }> = [
    {
      term: "Cheongmyeong",
      before: { birthDate: "2024-04-04", birthTime: "16:01", expected: { stem: "jeong", branch: "myo" } },
      exact: { birthDate: "2024-04-04", birthTime: "16:02", expected: { stem: "mu", branch: "jin" } },
      after: { birthDate: "2024-04-04", birthTime: "16:03", expected: { stem: "mu", branch: "jin" } }
    },
    {
      term: "Ipha",
      before: { birthDate: "2024-05-05", birthTime: "09:09", expected: { stem: "mu", branch: "jin" } },
      exact: { birthDate: "2024-05-05", birthTime: "09:10", expected: { stem: "gi", branch: "sa" } },
      after: { birthDate: "2024-05-05", birthTime: "09:11", expected: { stem: "gi", branch: "sa" } }
    },
    {
      term: "Mangjong",
      before: { birthDate: "2024-06-05", birthTime: "13:09", expected: { stem: "gi", branch: "sa" } },
      exact: { birthDate: "2024-06-05", birthTime: "13:10", expected: { stem: "gyeong", branch: "o" } },
      after: { birthDate: "2024-06-05", birthTime: "13:11", expected: { stem: "gyeong", branch: "o" } }
    },
    {
      term: "Soseo",
      before: { birthDate: "2024-07-06", birthTime: "23:19", expected: { stem: "gyeong", branch: "o" } },
      exact: { birthDate: "2024-07-06", birthTime: "23:20", expected: { stem: "sin", branch: "mi" } },
      after: { birthDate: "2024-07-06", birthTime: "23:21", expected: { stem: "sin", branch: "mi" } }
    },
    {
      term: "Ipchu",
      before: { birthDate: "2024-08-07", birthTime: "09:08", expected: { stem: "sin", branch: "mi" } },
      exact: { birthDate: "2024-08-07", birthTime: "09:09", expected: { stem: "im", branch: "sin" } },
      after: { birthDate: "2024-08-07", birthTime: "09:10", expected: { stem: "im", branch: "sin" } }
    },
    {
      term: "Baengno",
      before: { birthDate: "2024-09-07", birthTime: "12:10", expected: { stem: "im", branch: "sin" } },
      exact: { birthDate: "2024-09-07", birthTime: "12:11", expected: { stem: "gye", branch: "yu" } },
      after: { birthDate: "2024-09-07", birthTime: "12:12", expected: { stem: "gye", branch: "yu" } }
    },
    {
      term: "Hallo",
      before: { birthDate: "2024-10-08", birthTime: "03:59", expected: { stem: "gye", branch: "yu" } },
      exact: { birthDate: "2024-10-08", birthTime: "04:00", expected: { stem: "gap", branch: "sul" } },
      after: { birthDate: "2024-10-08", birthTime: "04:01", expected: { stem: "gap", branch: "sul" } }
    },
    {
      term: "Ipdong",
      before: { birthDate: "2024-11-07", birthTime: "07:19", expected: { stem: "gap", branch: "sul" } },
      exact: { birthDate: "2024-11-07", birthTime: "07:20", expected: { stem: "eul", branch: "hae" } },
      after: { birthDate: "2024-11-07", birthTime: "07:21", expected: { stem: "eul", branch: "hae" } }
    },
    {
      term: "Daeseol",
      before: { birthDate: "2024-12-07", birthTime: "00:16", expected: { stem: "eul", branch: "hae" } },
      exact: { birthDate: "2024-12-07", birthTime: "00:17", expected: { stem: "byeong", branch: "ja" } },
      after: { birthDate: "2024-12-07", birthTime: "00:18", expected: { stem: "byeong", branch: "ja" } }
    },
    {
      term: "Sohan",
      before: { birthDate: "2025-01-05", birthTime: "11:32", expected: { stem: "byeong", branch: "ja" } },
      exact: { birthDate: "2025-01-05", birthTime: "11:33", expected: { stem: "jeong", branch: "chuk" } },
      after: { birthDate: "2025-01-05", birthTime: "11:34", expected: { stem: "jeong", branch: "chuk" } }
    }
  ];

  it.each(solarMonthBoundaryCases)("applies the previous month one minute before $term", ({ before }) => {
    expect(calculatePillars({
      birthDate: before.birthDate,
      birthTime: before.birthTime,
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual(before.expected);
  });

  it.each(solarMonthBoundaryCases)("applies the new month at the exact $term boundary", ({ exact }) => {
    expect(calculatePillars({
      birthDate: exact.birthDate,
      birthTime: exact.birthTime,
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual(exact.expected);
  });

  it.each(solarMonthBoundaryCases)("keeps the new month one minute after $term", ({ after }) => {
    expect(calculatePillars({
      birthDate: after.birthDate,
      birthTime: after.birthTime,
      timezone: "Asia/Seoul",
      sex: "other"
    }).month).toEqual(after.expected);
  });

  it.each([
    "2024-04-04",
    "2024-05-05",
    "2024-06-05",
    "2024-07-06",
    "2024-08-07",
    "2024-09-07",
    "2024-10-08",
    "2024-11-07",
    "2024-12-07",
    "2025-01-05"
  ])("rejects date-only inputs on the %s solar month boundary date", (birthDate) => {
    expect(() => calculatePillars({
      birthDate,
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("birthTime is required");
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
    // The KASI table opens with 1920-01-06 소한; 1919 has no 입춘 row at all.
    expect(() => calculatePillars({
      birthDate: "1919-12-31",
      birthTime: "12:00",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("No Ipchun boundary");

    // Past 2100-12-07 대설 there is no next boundary; the table ends with 2100.
    expect(() => calculatePillars({
      birthDate: "2100-12-20",
      birthTime: "12:00",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("No upper solar month boundary");

    expect(() => calculatePillars({
      birthDate: "2101-03-01",
      birthTime: "12:00",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("No Ipchun boundary");
  });

  it("computes the first and last supported minutes of the KASI table", () => {
    // 1920-01-06 23:41 소한 opens the table: solar year 1919 (기미), 소한 month 정축.
    const first = calculatePillars({
      birthDate: "1920-01-06",
      birthTime: "23:41",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    expect(first.year).toEqual({ stem: "gi", branch: "mi" });
    expect(first.month).toEqual({ stem: "jeong", branch: "chuk" });

    // One minute earlier falls before the first row, so no month boundary applies.
    expect(() => calculatePillars({
      birthDate: "1920-01-06",
      birthTime: "23:40",
      timezone: "Asia/Seoul",
      sex: "other"
    })).toThrow("No solar month boundary");

    // 2100-12-07 10:41 is the last minute before the final 대설 row.
    const last = calculatePillars({
      birthDate: "2100-12-07",
      birthTime: "10:41",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    expect(last.year).toEqual({ stem: "gyeong", branch: "sin" });
    expect(last.month).toEqual({ stem: "jeong", branch: "hae" });
  });

  it("applies the 1955 입춘 minute from the KASI table (23:18 KST) to the +08:30 civil clock", () => {
    // 1955-02-04 23:18 KST is the year boundary 갑오 → 을미. Korea's civil clock
    // was UTC+8:30 that day, so the boundary showed as 22:48 on birth records;
    // normalizeToKstWallClock adds the 30 minutes before the comparison.
    const before = calculatePillars({
      birthDate: "1955-02-04",
      birthTime: "22:47",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    const at = calculatePillars({
      birthDate: "1955-02-04",
      birthTime: "22:48",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(before.year).toEqual({ stem: "gap", branch: "o" });
    expect(before.month).toEqual({ stem: "jeong", branch: "chuk" });
    expect(at.year).toEqual({ stem: "eul", branch: "mi" });
    expect(at.month).toEqual({ stem: "mu", branch: "in" });
  });

  it("uses the KASI 03:35 입동 minute for 2011-11-08, not the earlier 09:26 API row", () => {
    // The data.go.kr fixture carried 2011-11-08T09:26 for 입동; the KASI 24기
    // table says 03:35. Births between 03:35 and 09:25 belong to 기해월, not 무술월.
    const before = calculatePillars({
      birthDate: "2011-11-08",
      birthTime: "03:34",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    const at = calculatePillars({
      birthDate: "2011-11-08",
      birthTime: "03:35",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    const insideFormerGap = calculatePillars({
      birthDate: "2011-11-08",
      birthTime: "09:25",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(before.month).toEqual({ stem: "mu", branch: "sul" });
    expect(at.month).toEqual({ stem: "gi", branch: "hae" });
    expect(insideFormerGap.month).toEqual({ stem: "gi", branch: "hae" });
  });

  it("computes pillars for present-day births the app actually receives", () => {
    // Regression: before the KASI 2000-2028 table these threw, and consumers
    // silently fell back to an ungrounded path. See WORKLOG 2026-08-21.
    const recent = calculatePillars({
      birthDate: "2026-06-06",
      birthTime: "12:00",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(recent.year.stem).not.toHaveLength(0);
    expect(recent.month.stem).not.toHaveLength(0);
    expect(recent.day.stem).not.toHaveLength(0);
    expect(recent.time?.branch).toBe("o");

    expect(() => calculatePillars({
      birthDate: "2023-11-20",
      birthTime: "03:30",
      timezone: "Asia/Seoul",
      sex: "other"
    })).not.toThrow();
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

describe("solar-term source audit", () => {
  const documented2024Boundaries = [
    { term: "sohan", startsAt: "2024-01-06T05:49", solarYear: 2023, monthOrdinal: 11 },
    { term: "ipchun", startsAt: "2024-02-04T17:27", solarYear: 2024, monthOrdinal: 0 },
    { term: "gyeongchip", startsAt: "2024-03-05T11:23", solarYear: 2024, monthOrdinal: 1 },
    { term: "cheongmyeong", startsAt: "2024-04-04T16:02", solarYear: 2024, monthOrdinal: 2 },
    { term: "ipha", startsAt: "2024-05-05T09:10", solarYear: 2024, monthOrdinal: 3 },
    { term: "mangjong", startsAt: "2024-06-05T13:10", solarYear: 2024, monthOrdinal: 4 },
    { term: "soseo", startsAt: "2024-07-06T23:20", solarYear: 2024, monthOrdinal: 5 },
    { term: "ipchu", startsAt: "2024-08-07T09:09", solarYear: 2024, monthOrdinal: 6 },
    { term: "baengno", startsAt: "2024-09-07T12:11", solarYear: 2024, monthOrdinal: 7 },
    { term: "hallo", startsAt: "2024-10-08T04:00", solarYear: 2024, monthOrdinal: 8 },
    { term: "ipdong", startsAt: "2024-11-07T07:20", solarYear: 2024, monthOrdinal: 9 },
    { term: "daeseol", startsAt: "2024-12-07T00:17", solarYear: 2024, monthOrdinal: 10 },
    { term: "sohan", startsAt: "2025-01-05T11:33", solarYear: 2024, monthOrdinal: 11 },
    { term: "ipchun", startsAt: "2025-02-03T23:10", solarYear: 2025, monthOrdinal: 0 }
  ];

  it("keeps the embedded 2024 boundary inventory aligned with the source audit document", () => {
    const actual = SOLAR_MONTH_BOUNDARIES
      .filter((boundary) => boundary.startsAt >= "2024-01-01T00:00" && boundary.startsAt <= "2025-02-03T23:10")
      .map(({ term, startsAt, solarYear, monthOrdinal }) => ({ term, startsAt, solarYear, monthOrdinal }));

    expect(actual).toEqual(documented2024Boundaries);
  });

  it("carries all twelve month boundaries for every KASI-sourced solar year", () => {
    for (let solarYear = 1919; solarYear <= 2100; solarYear += 1) {
      const ordinals = SOLAR_MONTH_BOUNDARIES
        .filter((boundary) => boundary.solarYear === solarYear)
        .map((boundary) => boundary.monthOrdinal);

      // The table opens with the 1920-01 소한 (solar year 1919, ordinal 11) and
      // stops at the 2100-12 대설 because the source ends with calendar year 2100.
      const expected = solarYear === 1919
        ? [11]
        : solarYear === 2100
          ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      expect({ solarYear, ordinals }).toEqual({ solarYear, ordinals: expected });
    }

    expect(SOLAR_MONTH_BOUNDARIES).toHaveLength(12 * 181);
    expect(Object.keys(IPCHUN_BY_YEAR)).toHaveLength(181);
  });

  it("keeps the boundary table sorted so the active-boundary scan can stop early", () => {
    const startsAt = SOLAR_MONTH_BOUNDARIES.map((boundary) => boundary.startsAt);

    expect(startsAt).toEqual([...startsAt].sort());
    expect(new Set(startsAt).size).toBe(startsAt.length);
  });
});

describe("generateReportV1", () => {
  it.each(GOLDEN_CASES)("generates a complete rules-only report for $id", (fixture) => {
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
    const fixture = goldenCase("g-2024-02-04-1727");

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

  it.each(GOLDEN_CASES)("keeps free report copy away from deterministic finance claims for $id", (fixture) => {
    const report = generateReportV1({
      input: fixture.input,
      pillars: calculatePillars(fixture.input),
      generatedAt: "2026-05-14T00:00:00.000Z"
    });
    const copy = collectStrings(report).join("\n");

    expect(copy).not.toContain("확정 수익");
    expect(copy).not.toContain("무조건 성공");
    expect(copy).not.toContain("반드시 성공");
    expect(copy).not.toContain("특정 결과를 보장");
  });
});

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

describe("generatePaidReportV1", () => {
  it("generates a paid detailed report with PDF-ready requirements", () => {
    const fixture = goldenCase("g-2024-02-04-1727");

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
    const fixture = goldenCase("g-2024-02-04-1727");

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
