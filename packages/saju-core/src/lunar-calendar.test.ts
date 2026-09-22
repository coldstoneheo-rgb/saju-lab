import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LUNAR_MAX_YEAR, LUNAR_MIN_YEAR, LUNAR_TABLE_SHA256, LUNAR_YEAR_DATA } from "./lunar-calendar.data.js";
import { daysInLunarMonth, leapMonth, lunarToSolar, lunarYearDays } from "./lunar-calendar.js";
import { calculatePillarsWithResolution } from "./pillars.js";
import { buildSajuPillarsV1Response } from "./saju-pillars-v1.js";

const iso = (date: { year: number; month: number; day: number } | null): string | null =>
  date ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}` : null;

describe("lunar table", () => {
  it("is the 151-year KARI slice with the shared canonical SHA-256", () => {
    expect(LUNAR_YEAR_DATA).toHaveLength(LUNAR_MAX_YEAR - LUNAR_MIN_YEAR + 1);
    const canonical = LUNAR_YEAR_DATA.map((value) => `0x${value.toString(16).toUpperCase().padStart(7, "0")}`).join("\n") + "\n";
    expect(createHash("sha256").update(canonical, "utf8").digest("hex")).toBe(LUNAR_TABLE_SHA256);
    expect(LUNAR_TABLE_SHA256).toBe("3507414e2d89d13e85ec02979772fc7f0a333fb6d97a575ccb953bda0d205107");
  });

  it("is internally consistent: month lengths sum to the year length and 1/1 follows the previous 그믐", () => {
    let previousEnd: number | undefined;
    for (let year = LUNAR_MIN_YEAR; year <= LUNAR_MAX_YEAR; year += 1) {
      const leap = leapMonth(year);
      let sum = 0;
      for (let month = 1; month <= 12; month += 1) {
        sum += daysInLunarMonth(year, month) as number;
        if (leap === month) sum += daysInLunarMonth(year, month, true) as number;
      }
      expect({ year, sum }).toEqual({ year, sum: lunarYearDays(year) });

      const first = lunarToSolar(year, 1, 1) as { year: number; month: number; day: number };
      const lastMonthLeap = leap === 12;
      const lastDay = daysInLunarMonth(year, 12, lastMonthLeap) as number;
      const last = lunarToSolar(year, 12, lastDay, lastMonthLeap) as { year: number; month: number; day: number };
      const epoch = (d: { year: number; month: number; day: number }): number => Date.UTC(d.year, d.month - 1, d.day) / 86_400_000;
      if (previousEnd !== undefined) {
        expect({ year, gap: epoch(first) - previousEnd }).toEqual({ year, gap: 1 });
      }
      expect({ year, span: epoch(last) - epoch(first) + 1 }).toEqual({ year, span: sum });
      previousEnd = epoch(last);
    }
  });
});

describe("lunarToSolar — goldens transcribed from baby-naming-ai KoreanLunarCalendarUnitTest.kt", () => {
  it("anchor and the three pre-existing goldens", () => {
    expect(iso(lunarToSolar(1900, 1, 1))).toBe("1900-01-31");
    expect(iso(lunarToSolar(1957, 3, 13))).toBe("1957-04-12");
    expect(iso(lunarToSolar(1990, 1, 1))).toBe("1990-01-27");
    expect(iso(lunarToSolar(1990, 12, 30))).toBe("1991-02-14");
  });

  it.each([
    [[1950, 1, 1], "1950-02-17"], [[1950, 8, 15], "1950-09-26"], [[1960, 1, 1], "1960-01-28"], [[1970, 8, 15], "1970-09-15"],
    [[1980, 1, 1], "1980-02-16"], [[1997, 1, 1], "1997-02-08"], [[2000, 1, 1], "2000-02-05"], [[2012, 1, 1], "2012-01-23"],
    [[2017, 8, 15], "2017-10-04"], [[2024, 1, 1], "2024-02-10"], [[2026, 1, 1], "2026-02-17"], [[2026, 8, 15], "2026-09-25"],
    [[2028, 1, 1], "2028-01-27"]
  ] as const)("설날·추석 %j → %s (public holiday records)", (lunar, solar) => {
    expect(iso(lunarToSolar(lunar[0], lunar[1], lunar[2]))).toBe(solar);
  });

  it("puts leap months where the Korean almanac puts them", () => {
    expect([2012, 2017, 2020, 2023, 2025, 2026, 2028].map(leapMonth)).toEqual([3, 5, 4, 2, 6, 0, 5]);
    expect(iso(lunarToSolar(2012, 3, 1, true))).toBe("2012-04-21");
    expect(iso(lunarToSolar(2012, 4, 1))).toBe("2012-05-21"); // 평4월 comes after 윤3월
    expect(iso(lunarToSolar(2017, 5, 1, true))).toBe("2017-06-24");
    expect(iso(lunarToSolar(2017, 6, 1))).toBe("2017-07-23");
    expect(iso(lunarToSolar(2020, 4, 1, true))).toBe("2020-05-23");
    expect(iso(lunarToSolar(2023, 2, 1, true))).toBe("2023-03-22");
    expect(lunarToSolar(2026, 9, 1, true)).toBeNull();
  });

  it("2025 윤6월 and 2028 윤5월 (HO stage 4 cases)", () => {
    expect(iso(lunarToSolar(2025, 6, 1, true))).toBe("2025-07-25");
    expect(iso(lunarToSolar(2025, 6, 15, true))).toBe("2025-08-08");
    expect(iso(lunarToSolar(2025, 6, 15))).toBe("2025-07-09");
    expect(daysInLunarMonth(2025, 6, true)).toBe(29); // 윤6월 07-25 .. 08-22
    expect(iso(lunarToSolar(2028, 5, 1, true))).toBe("2028-06-23");
  });

  it("returns null for dates that do not exist and years outside the table (null contract)", () => {
    expect(lunarToSolar(1899, 12, 1)).toBeNull();
    expect(lunarToSolar(2051, 1, 1)).toBeNull();
    expect(lunarToSolar(2026, 13, 1)).toBeNull();
    expect(lunarToSolar(2026, 1, 0)).toBeNull();
    expect(daysInLunarMonth(1973, 12)).toBe(29);
    expect(lunarToSolar(1973, 12, 30)).toBeNull();
    expect(lunarToSolar(2025, 7, 1, true)).toBeNull(); // 2025's leap month is 6, not 7
  });

  it("passes every case of the shared lunar-golden.json (copied from baby-naming-ai db13f2e)", () => {
    const shared = resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/golden/lunar-golden.json");
    expect(existsSync(shared)).toBe(true);
    const cases = JSON.parse(readFileSync(shared, "utf8")) as Array<{ lunar: { year: number; month: number; day: number; isLeapMonth: boolean }; solar: string | null }>;
    expect(cases.length).toBeGreaterThanOrEqual(39);
    expect(cases.filter((goldenCase) => goldenCase.solar === null).length).toBeGreaterThanOrEqual(4);
    expect(cases.filter((goldenCase) => goldenCase.lunar.isLeapMonth).length).toBeGreaterThanOrEqual(2);
    // The shared table fingerprint file must name the same SHA-256 as our data module.
    const shaFile = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/golden/lunar-table.sha256"), "utf8");
    expect(shaFile.split(/\s+/)[0]).toBe(LUNAR_TABLE_SHA256);
    for (const goldenCase of cases) {
      const { year, month, day, isLeapMonth } = goldenCase.lunar;
      expect({ lunar: goldenCase.lunar, solar: iso(lunarToSolar(year, month, day, isLeapMonth)) }).toEqual({ lunar: goldenCase.lunar, solar: goldenCase.solar });
    }
  });
});

describe("lunar input through the pillars pipeline and the v1 contract", () => {
  it("converts before calculating and reports the solar date in resolution.calendar", () => {
    const lunar = calculatePillarsWithResolution({ birthDate: "2025-06-15", calendar: "lunar", isLeapMonth: true, birthTime: "10:00", timezone: "Asia/Seoul", sex: "female" });
    const solar = calculatePillarsWithResolution({ birthDate: "2025-08-08", birthTime: "10:00", timezone: "Asia/Seoul", sex: "female" });
    expect(lunar.pillars).toEqual(solar.pillars);
    expect(lunar.resolution.calendar).toEqual({ input: "lunar", isLeapMonth: true, solarDate: "2025-08-08" });
    expect(solar.resolution.calendar).toEqual({ input: "solar", solarDate: "2025-08-08" });

    const regular = calculatePillarsWithResolution({ birthDate: "2025-06-15", calendar: "lunar", birthTime: "10:00", timezone: "Asia/Seoul", sex: "female" });
    expect(regular.resolution.calendar).toEqual({ input: "lunar", isLeapMonth: false, solarDate: "2025-07-09" });
    expect(regular.pillars.month).not.toEqual(lunar.pillars.month);
  });

  it("maps a non-existent lunar date to INVALID_LUNAR_DATE and an out-of-table year to OUT_OF_SUPPORTED_RANGE", () => {
    const base = { calendar: "lunar" as const, birthTime: "10:00", sex: "male" as const };
    const codes = (request: Parameters<typeof buildSajuPillarsV1Response>[0]): string => {
      const result = buildSajuPillarsV1Response(request);
      return result.ok ? "200" : result.error.error.code;
    };
    expect(codes({ ...base, birthDate: "2025-13-01" })).toBe("INVALID_LUNAR_DATE");
    expect(codes({ ...base, birthDate: "2025-07-01", isLeapMonth: true })).toBe("INVALID_LUNAR_DATE");
    expect(codes({ ...base, birthDate: "1973-12-30" })).toBe("INVALID_LUNAR_DATE");
    expect(codes({ ...base, birthDate: "1899-12-01" })).toBe("OUT_OF_SUPPORTED_RANGE");
    expect(codes({ ...base, birthDate: "1900-01-01" })).toBe("OUT_OF_SUPPORTED_RANGE"); // solar 1900-01-31 precedes the KASI table
    expect(codes({ ...base, birthDate: "2050-12-01" })).toBe("200"); // solar 2051-01
    expect(codes({ calendar: "solar", birthDate: "2025-08-08", birthTime: "10:00", sex: "male", isLeapMonth: true })).toBe("INVALID_LUNAR_DATE");
  });

  it("serves the B3 live cases", () => {
    const leap = buildSajuPillarsV1Response({ birthDate: "2025-06-15", calendar: "lunar", isLeapMonth: true, birthTime: "10:00", sex: "female" });
    const plain = buildSajuPillarsV1Response({ birthDate: "2025-06-15", calendar: "lunar", isLeapMonth: false, birthTime: "10:00", sex: "female" });
    expect(leap.ok && leap.data.resolution.calendar.solarDate).toBe("2025-08-08");
    expect(plain.ok && plain.data.resolution.calendar.solarDate).toBe("2025-07-09");
  });
});
