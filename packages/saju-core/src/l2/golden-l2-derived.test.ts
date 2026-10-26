import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import type { BirthInput } from "../types.js";
import { gyeokgukReadingsOf, type GyeokgukReading } from "./gyeokguk.js";
import { strengthFactorsOf } from "./strength-factors.js";
import { strengthReadingsOf } from "./strength-readings.js";
import { yongsinCandidatesOf } from "./yongsin-candidates.js";

/**
 * 파생 골든 3장(8b-1 READINGS · 8b-2 YONGSIN · 격국) — 8a confirmed(2026-10-26 LC 재계산) 위에서
 * 실행 축 confirmed. 셀 = 코어 산출이고, 코어 = 8a md 셀 유도는 각 «골든 50» 테스트가 강제한다.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(resolve(HERE, "../../../../docs/golden", name), "utf8");
const MAX_PENDING_RATIO = 0.2;

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

/** Rows of the first table under a `## ` heading that starts with `title`; columns matched by header name. */
function section(source: string, title: string): Array<(name: string) => string> {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(`## ${title}`));
  if (start === -1) throw new Error(`section ${title} not found`);
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

const factorsStatus = new Map(section(read("GOLDEN-STRENGTH-FACTORS.md"), "표").map((cell) => [cell("id"), cell("상태")]));
const goldenIds = loadGoldenPillarCases().map((golden) => golden.id);
const factorsOf = (input: BirthInput) => strengthFactorsOf(calculatePillars(input), resolveBirthKst(input));
const chartText = (input: BirthInput) => {
  const p = calculatePillars(input);
  return [p.year, p.month, p.day, p.time].filter(Boolean).map((pillar) => `${pillar!.stem}-${pillar!.branch}`).join(" ");
};

/** Shared axis checks: 실행 confirmed only on a confirmed 8a row, 학설 always unreviewed, pending ≤ 20%, source present. */
function axes(rows: Array<(name: string) => string>) {
  for (const cell of rows) {
    expect(["confirmed", "pending"]).toContain(cell("실행"));
    if (cell("실행") === "confirmed") expect(factorsStatus.get(cell("id")), cell("id")).toBe("confirmed");
    expect(cell("학설")).toBe("unreviewed");
    expect(cell("출처")).not.toBe("");
  }
  expect(rows.filter((cell) => cell("실행") === "pending").length).toBeLessThanOrEqual(Math.floor(rows.length * MAX_PENDING_RATIO));
}

describe("GOLDEN-STRENGTH-READINGS.md (8b-1)", () => {
  const rows = section(read("GOLDEN-STRENGTH-READINGS.md"), "표");

  it("50행 = GOLDEN-PILLARS 순서 · 전부 실행 confirmed · 학설 unreviewed", () => {
    expect(rows.map((cell) => cell("id"))).toEqual(goldenIds);
    axes(rows);
    expect(rows.every((cell) => cell("실행") === "confirmed")).toBe(true);
  });

  it.each(goldenIds)("%s = strengthReadingsOf", (id) => {
    const cell = rows.find((row) => row("id") === id)!;
    const input = goldenCase(id).input;
    const readings = strengthReadingsOf(factorsOf(input));
    expect(cell("명식")).toBe(chartText(input));
    for (const reading of readings) expect(cell(reading.ruleSetId)).toBe(`${reading.verdict}(${reading.firedConditions[0]})`);
    expect(cell("세트일치")).toBe(readings[0]!.agreesAcrossSets ? "Y" : "N");
  });
});

describe("GOLDEN-YONGSIN-CANDIDATES.md (8b-2)", () => {
  const rows = section(read("GOLDEN-YONGSIN-CANDIDATES.md"), "표");

  it("50행 · 전부 실행 confirmed · 후보 합계 267(억부 240 · 조후 27)", () => {
    expect(rows.map((cell) => cell("id"))).toEqual(goldenIds);
    axes(rows);
    expect(rows.every((cell) => cell("실행") === "confirmed")).toBe(true);
    const all = rows.flatMap((cell) => (cell("후보") === "-" ? [] : cell("후보").split(" ")));
    expect(all).toHaveLength(267);
    expect(all.filter((id) => id.startsWith("eokbu."))).toHaveLength(240);
    expect(rows.reduce((sum, cell) => sum + Number(cell("후보수")), 0)).toBe(267);
  });

  it.each(goldenIds)("%s = yongsinCandidatesOf", (id) => {
    const cell = rows.find((row) => row("id") === id)!;
    const factors = factorsOf(goldenCase(id).input);
    const candidates = yongsinCandidatesOf(factors, strengthReadingsOf(factors));
    expect(cell("후보")).toBe(candidates.map((candidate) => candidate.candidateId).join(" ") || "-");
    expect(Number(cell("후보수"))).toBe(candidates.length);
  });
});

describe("GOLDEN-GYEOKGUK.md (격국 50 + 보강 6)", () => {
  const rows = section(read("GOLDEN-GYEOKGUK.md"), "표");
  const summary = (reading: GyeokgukReading) =>
    (reading.candidates.map((c) => `${c.gyeok}/${c.role}`).join(",") || (reading.unavailable as string)) + (reading.ambiguous ? "!" : "");
  const inputOf = (cell: (name: string) => string): BirthInput => {
    if (cell("입력") === "-") return goldenCase(cell("id")).input;
    const [birthDate, birthTime] = cell("입력").split(" ");
    return { birthDate: birthDate!, birthTime: birthTime!, timezone: "Asia/Seoul", calendar: "solar", sex: "other" };
  };

  it("56행 = 골든 50(순서) + 보강 6 · 골든 50 실행 confirmed · 보강 6 pending", () => {
    expect(rows.slice(0, 50).map((cell) => cell("id"))).toEqual(goldenIds);
    expect(rows.slice(50).map((cell) => cell("id"))).toEqual([
      "k-1980-02-12-1030", "k-1980-11-16-1030", "k-1980-10-23-1030", "k-1980-01-26-1030", "k-1981-07-09-1030", "k-1980-04-09-1030"
    ]);
    axes(rows);
    expect(rows.slice(0, 50).every((cell) => cell("실행") === "confirmed" && cell("입력") === "-")).toBe(true);
    expect(rows.slice(50).every((cell) => cell("실행") === "pending")).toBe(true);
  });

  it.each(Array.from({ length: 56 }, (_, index) => index))("행 %i = gyeokgukReadingsOf", (index) => {
    const cell = rows[index]!;
    const input = inputOf(cell);
    const readings = gyeokgukReadingsOf(factorsOf(input));
    expect(cell("명식")).toBe(chartText(input));
    for (const reading of readings) expect(cell(reading.ruleSetId), `${cell("id")} ${reading.ruleSetId}`).toBe(summary(reading));
    expect(cell("세트일치")).toBe(readings[0]!.agreesAcrossSets ? "Y" : "N");
  });
});
