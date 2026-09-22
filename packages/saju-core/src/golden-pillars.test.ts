import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GoldenTableError, parseGoldenPillarsMarkdown } from "./golden-pillars.js";
import { calculatePillars } from "./pillars.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDEN_MD = resolve(HERE, "../../../docs/golden/GOLDEN-PILLARS.md");

const HEADER = "| id | 생년월일 | 시각 | 달력 | 성별 | 연주 | 월주 | 일주 | 시주 | 출처 | 검증자 | 일자 | 범주 | 비고 |";
const SEPARATOR = "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";

function table(...rows: string[]): string {
  return ["# fixture", "", HEADER, SEPARATOR, ...rows, ""].join("\n");
}

const VALID_ROW =
  "| g-1990-01-01 | 1990-01-01 | 10:30 | solar | other | gi-sa | byeong-ja | byeong-in | gye-sa | https://example.org/manseryeok?d=1990-01-01 | tester | 2026-09-22 | 기본 | |";

describe("GOLDEN-PILLARS.md — the table is the source of truth", () => {
  const markdown = readFileSync(GOLDEN_MD, "utf8");
  const cases = parseGoldenPillarsMarkdown(markdown);

  it("parses the committed table (every row carries a real source)", () => {
    expect(Array.isArray(cases)).toBe(true);
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

  it("fails when no table with the required columns exists", () => {
    expect(() => parseGoldenPillarsMarkdown("# nothing\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n")).toThrow("No table with the columns");
  });
});
