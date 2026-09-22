import { describe, expect, it } from "vitest";
import { GoldenTableError, parseGoldenPillarsMarkdown } from "./golden-pillars.js";
import { loadGoldenPillarCases } from "./golden-pillars.load.js";
import { calculatePillars } from "./pillars.js";

const HEADER = "| id | 생년월일 | 시각 | 달력 | 성별 | 연주 | 월주 | 일주 | 시주 | 출처 | 검증자 | 일자 | 범주 | 비고 |";
const SEPARATOR = "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";

function table(...rows: string[]): string {
  return ["# fixture", "", HEADER, SEPARATOR, ...rows, ""].join("\n");
}

const VALID_ROW =
  "| g-1990-01-01 | 1990-01-01 | 10:30 | solar | other | gi-sa | byeong-ja | byeong-in | gye-sa | https://example.org/manseryeok?d=1990-01-01 | tester | 2026-09-22 | 기본 | |";

describe("GOLDEN-PILLARS.md — the table is the source of truth", () => {
  const cases = loadGoldenPillarCases();

  it("parses the committed table (every row carries a real source)", () => {
    expect(cases.length).toBeGreaterThanOrEqual(5);
    for (const goldenCase of cases) {
      expect(goldenCase.source).not.toBe("");
      expect(goldenCase.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it.each(cases.map((goldenCase) => [goldenCase.id, goldenCase] as const))(
    "%s matches calculatePillars",
    (_id, goldenCase) => {
      expect(calculatePillars(goldenCase.input)).toEqual(goldenCase.expected);
    }
  );
});

describe("GOLDEN-PILLARS.md parser rules", () => {
  it("maps columns by header name, in any order", () => {
    const shuffled = [
      "# fixture",
      "",
      "| 출처 | id | 시주 | 일주 | 월주 | 연주 | 성별 | 달력 | 시각 | 생년월일 | 비고 | 범주 | 일자 | 검증자 |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      "| https://example.org/x | shuffled | gye-sa | byeong-in | byeong-ja | gi-sa | other | solar | 10:30 | 1990-01-01 | note | 기본·절기경계 | 2026-09-22 | tester |",
      ""
    ].join("\n");

    const [parsed] = parseGoldenPillarsMarkdown(shuffled);
    expect(parsed?.id).toBe("shuffled");
    expect(parsed?.input).toEqual({ birthDate: "1990-01-01", birthTime: "10:30", timezone: "Asia/Seoul", sex: "other" });
    expect(parsed?.expected.time).toEqual({ stem: "gye", branch: "sa" });
    expect(parsed?.categories).toEqual(["기본", "절기경계"]);
  });

  it("accepts a valid row and a time-less row", () => {
    const parsed = parseGoldenPillarsMarkdown(table(
      VALID_ROW,
      "| g-no-time | 1990-01-01 | - | solar | female | gi-sa | byeong-ja | byeong-in | - | https://example.org/y | tester | 2026-09-22 | 시간미상 | |"
    ));
    expect(parsed).toHaveLength(2);
    expect(parsed[1]?.input.birthTime).toBeUndefined();
    expect(parsed[1]?.expected.time).toBeUndefined();
  });

  it("fails when 출처 is blank", () => {
    const blank = VALID_ROW.replace("https://example.org/manseryeok?d=1990-01-01", "");
    expect(() => parseGoldenPillarsMarkdown(table(blank))).toThrow(GoldenTableError);
    expect(() => parseGoldenPillarsMarkdown(table(blank))).toThrow("출처 is required");
  });

  it("fails when 출처 only says the value is commonly listed", () => {
    const vague = VALID_ROW.replace("https://example.org/manseryeok?d=1990-01-01", "commonly listed as Bing Yin day");
    expect(() => parseGoldenPillarsMarkdown(table(vague))).toThrow("names no document");
  });

  it("fails on a malformed pillar label or a missing verifier", () => {
    expect(() => parseGoldenPillarsMarkdown(table(VALID_ROW.replace("byeong-in", "丙寅")))).toThrow("일주");
    expect(() => parseGoldenPillarsMarkdown(table(VALID_ROW.replace("| tester |", "|  |")))).toThrow("검증자 is required");
  });

  it("fails when 시주 and 시각 disagree about whether the time is known", () => {
    expect(() => parseGoldenPillarsMarkdown(table(VALID_ROW.replace("| gye-sa |", "| - |")))).toThrow("시주 must be given exactly when 시각 is given");
  });

  it("A12: accepts lunar and lunar(윤달) in the 달력 column and passes them to the input", () => {
    const rows = parseGoldenPillarsMarkdown(table(
      "| g-lunar | 2025-06-15 | 10:00 | lunar | female | eul-sa | gye-mi | gap-ja | sin-mi | https://example.org/l | tester | 2026-09-22 | 기본 | |",
      "| g-leap | 2025-06-15 | 10:00 | lunar(윤달) | female | eul-sa | gap-sin | gye-yu | jeong-sa | https://example.org/l | tester | 2026-09-22 | 윤달 | |"
    ));
    expect(rows[0]?.input).toEqual({ birthDate: "2025-06-15", birthTime: "10:00", timezone: "Asia/Seoul", sex: "female", calendar: "lunar", isLeapMonth: false });
    expect(rows[1]?.input).toEqual({ birthDate: "2025-06-15", birthTime: "10:00", timezone: "Asia/Seoul", sex: "female", calendar: "lunar", isLeapMonth: true });
    expect(() => parseGoldenPillarsMarkdown(table(VALID_ROW.replace("| solar |", "| solar(윤달) |")))).toThrow("윤달 applies to lunar only");
    expect(() => parseGoldenPillarsMarkdown(table(VALID_ROW.replace("| solar |", "| julian |")))).toThrow("달력");
  });

  it("P2: optional 출생지·옵션 columns feed birthPlace and options; absent or empty = default (existing rows unchanged)", () => {
    const header = "| id | 생년월일 | 시각 | 달력 | 성별 | 출생지 | 옵션 | 연주 | 월주 | 일주 | 시주 | 출처 | 검증자 | 일자 | 범주 | 비고 |";
    const separator = "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";
    const md = ["# fixture", "", header, separator,
      "| g-place | 1990-06-15 | 00:20 | solar | male | jeonnam | trueSolarTime dayBoundary=trueSolar | gyeong-o | im-o | gyeong-sul | byeong-ja | https://example.org/p | tester | 2026-09-22 | 진태양시경계 | |",
      "| g-early | 1990-06-15 | 23:20 | solar | male |  | jaHourPolicy=early | gyeong-o | im-o | im-ja | gyeong-ja | https://example.org/p | tester | 2026-09-22 | 23시대 | |",
      "| g-plain | 1990-06-15 | 10:20 | solar | male | - | - | gyeong-o | im-o | sin-hae | gye-sa | https://example.org/p | tester | 2026-09-22 | 기본 | |",
      ""].join("\n");
    const rows = parseGoldenPillarsMarkdown(md);
    expect(rows[0]?.input.birthPlace).toBe("jeonnam");
    expect(rows[0]?.input.options).toEqual({ trueSolarTime: true, dayBoundary: "trueSolar" });
    expect(rows[1]?.input.birthPlace).toBeUndefined();
    expect(rows[1]?.input.options).toEqual({ jaHourPolicy: "early" });
    expect(rows[2]?.input).toEqual({ birthDate: "1990-06-15", birthTime: "10:20", timezone: "Asia/Seoul", sex: "male" });
    // The expected pillars are what the core produces WITH the options applied (진태양시 경계 = 보정 명식이 기대값).
    for (const row of rows) expect(calculatePillars(row.input)).toEqual(row.expected);
    expect(() => parseGoldenPillarsMarkdown(md.replace("| jeonnam |", "| atlantis |"))).toThrow("출생지");
    expect(() => parseGoldenPillarsMarkdown(md.replace("jaHourPolicy=early", "jaHourPolicy=noon"))).toThrow("옵션 token");
  });

  it("fails when no table with the required columns exists", () => {
    expect(() => parseGoldenPillarsMarkdown("# nothing\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n")).toThrow("No table with the columns");
  });
});
