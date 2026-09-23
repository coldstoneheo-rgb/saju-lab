import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { renderStrengthFactors } from "./golden-strength-factors.render.js";
import { SARYEONG_NEAR_THRESHOLD_DAYS, SEASON_OF_BRANCH, STRENGTH_DEFINITIONS, SUPPORT_TEN_GODS, strengthFactorsOf } from "./strength-factors.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_MD = resolve(HERE, "../../../../docs/rules/STRENGTH.md");
const GOLDEN_MD = resolve(HERE, "../../../../docs/golden/GOLDEN-STRENGTH-FACTORS.md");
const markdown = readFileSync(RULES_MD, "utf8");

/** Rows of the first table under a `## ` heading that starts with `title`; columns matched by header name. */
function section(title: string): Array<(name: string) => string> {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(`## ${title}`));
  if (start === -1) throw new Error(`STRENGTH.md: section ${title} not found`);
  const split = (line: string): string[] => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  const rows: Array<(name: string) => string> = [];
  let columns: string[] | undefined;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    if (!line.trim().startsWith("|")) {
      if (columns) break;
      continue;
    }
    const cells = split(line);
    if (!columns) {
      columns = cells;
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) continue;
    const header = columns;
    rows.push((name: string) => cells[header.indexOf(name)] ?? "");
  }
  return rows;
}

const chart = (id: string, school?: "yeonhae" | "japyeong") => {
  const input = goldenCase(id).input;
  return strengthFactorsOf(calculatePillars(input), resolveBirthKst(input), school ? { school } : {});
};

describe("docs/rules/STRENGTH.md ↔ strength-factors.ts", () => {
  it("표 1: the adopted definition ids are exactly STRENGTH_DEFINITIONS; every alternative row is recorded but not adopted", () => {
    const table = section("표 1");
    const adopted = table.filter((cell) => cell("채택") === "yes").map((cell) => cell("definitionId")).sort();
    expect(adopted).toEqual(Object.values(STRENGTH_DEFINITIONS).sort());
    expect(table.every((cell) => ["yes", "no"].includes(cell("채택")))).toBe(true);
    expect(table.map((cell) => cell("definitionId"))).toContain("deukse.surface-majority-gt");
  });

  it("표 2 · 표 3 · 표 4 match the code constants", () => {
    expect(section("표 2").map((cell) => cell("십신"))).toEqual([...SUPPORT_TEN_GODS]);
    expect(Object.fromEntries(section("표 3").map((cell) => [cell("월지"), cell("계절")]))).toEqual(SEASON_OF_BRANCH);
    const table4 = Object.fromEntries(section("표 4").map((cell) => [cell("항목"), cell("값")]));
    expect(Number(table4["경계 근접 폭(일)"])).toBe(SARYEONG_NEAR_THRESHOLD_DAYS);
    expect(table4["시각 미상 대체 시각"]).toBe("12:00");
  });

  it("학파 선택 항목: the documented japyeong diff row counts match the core over the golden 50 (C4)", () => {
    const documented = Object.fromEntries(tableAfterHeader("| 필드 | 바뀌는 행 |"));
    const cellsFor = (school: "yeonhae" | "japyeong") => loadGoldenPillarCases().map((golden) => renderStrengthFactors(chart(golden.id, school)));
    const yeonhae = cellsFor("yeonhae");
    const japyeong = cellsFor("japyeong");
    const changed = (column: keyof (typeof yeonhae)[number]): number => yeonhae.filter((cells, index) => cells[column] !== japyeong[index]?.[column]).length;
    expect({
      "tenGodCounts.withHidden": changed("장간십신"),
      exposed: changed("투간"),
      roots: changed("통근"),
      deukji: changed("득지"),
      saryeong: changed("사령")
    }).toEqual(Object.fromEntries(Object.entries(documented).map(([key, value]) => [key, Number(value)])));
  });
});

function tableAfterHeader(header: string): Array<[string, string]> {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(header));
  if (start === -1) throw new Error(`STRENGTH.md: ${header} not found`);
  const pairs: Array<[string, string]> = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.trim().startsWith("|")) break;
    const [field, count] = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    pairs.push([field as string, count as string]);
  }
  return pairs;
}

describe("strengthFactorsOf — behaviour", () => {
  it("carries facts only: no verdict, score or 化 judgement field anywhere in the result", () => {
    const keys = JSON.stringify(chart("g-1990-01-01-1030"));
    expect(keys).not.toMatch(/"(strong|weak|verdict|score|grade|transformed|yongsin)/i);
  });

  it("japyeong has no day counts → saryeong null with a reason; yeonhae carries boundaries from HIDDEN-STEMS 표 1", () => {
    const japyeong = chart("g-1990-01-01-1030", "japyeong");
    expect(japyeong.saryeong).toBeNull();
    expect(japyeong.saryeongUnavailable).toBe("no-day-counts");
    const yeonhae = chart("g-1990-01-01-1030");
    expect(yeonhae.saryeong?.boundaries).toEqual([10]); // 子: 壬10 → 癸
    expect(yeonhae.saryeong?.term.code).toBe("daeseol");
  });

  it("an unknown birth time reads 12:00, drops the time pillar and says so", () => {
    const unknown = loadGoldenPillarCases().find((golden) => golden.input.birthTime === undefined || golden.input.birthTime === "");
    expect(unknown).toBeDefined();
    const factors = chart((unknown as { id: string }).id);
    expect(factors.precision).toBe("time-unknown");
    expect(factors.layers.branchPrimary.map((entry) => entry.pillar)).toEqual(["year", "month", "day"]);
    expect(factors.layers.stems.map((entry) => entry.pillar)).toEqual(["year", "month"]);
    expect(Object.values(factors.tenGodCounts.surface).reduce((sum, n) => sum + n, 0)).toBe(5);
  });

  it("化 materials exclude the pair's own stems from the 투출 check", () => {
    // g-2000-02-04-1200: 丁壬 (month+day) → 木; the other stems 己(year)·丙(time) are not wood.
    const materials = chart("g-2000-02-04-1200").transformationMaterials;
    expect(materials).toEqual([{ ganhapId: "jeong-im", pillars: ["month", "day"], potentialElement: "wood", monthElementMatches: false, potentialElementExposed: false }]);
  });

  it("returns fresh arrays each call (a consumer cannot mutate shared state)", () => {
    const first = chart("g-1990-01-01-1030");
    first.layers.hiddenStems.length = 0;
    expect(chart("g-1990-01-01-1030").layers.hiddenStems.length).toBeGreaterThan(0);
  });
});

describe("어휘 가드 — STRENGTH.md 본문 규칙·골든·코드에 금지어 0 (C5)", () => {
  const FORBIDDEN = /추천|권장|최적|좋은 오행|나쁜 오행|채워야/;
  it("the golden table, the factor code and the rules body (outside the 「쓰지 않는 말」 list) carry none", () => {
    const rulesBody = markdown.split("## 쓰지 않는 말")[0] as string;
    expect(rulesBody).not.toMatch(FORBIDDEN);
    expect(readFileSync(GOLDEN_MD, "utf8")).not.toMatch(FORBIDDEN);
    expect(readFileSync(resolve(HERE, "strength-factors.ts"), "utf8")).not.toMatch(FORBIDDEN);
  });
});
