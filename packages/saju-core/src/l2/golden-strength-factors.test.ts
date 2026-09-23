import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { renderStrengthFactors, STRENGTH_GOLDEN_COLUMNS, type StrengthGoldenCells } from "./golden-strength-factors.render.js";
import { strengthFactorsOf } from "./strength-factors.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDEN_MD = resolve(HERE, "../../../../docs/golden/GOLDEN-STRENGTH-FACTORS.md");
const TENGODS_MD = resolve(HERE, "../../../../docs/golden/GOLDEN-TENGODS.md");
const HAND_WAVED = /commonly listed|widely listed|알려짐|알려져/i;
const MAX_PENDING_RATIO = 0.2;
/**
 * The 검산 round now open: all 50 rows start pending until LC's independent recalculation, whose
 * confirmed PR deletes this constant (#81 REPORT §6 운영 규칙, same pattern as #83 → #85).
 */
const OPEN_REVIEW_ROUND = { tag: "HO-2026-0923-saju-L2-stage8a-01", rows: 50 } as const;
const SUPPORT = new Set(["bigyeon", "geopjae", "pyeonin", "jeongin"]);

interface Row {
  id: string;
  dayMaster: string;
  status: "pending" | "confirmed";
  source: string;
  cells: StrengthGoldenCells;
}

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function tableAfter(markdown: string, header: string): Array<(name: string) => string> {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith(header));
  if (headerIndex === -1) throw new Error(`header ${header} not found`);
  const columns = split(lines[headerIndex] as string);
  const rows: Array<(name: string) => string> = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith("|")) break;
    const cells = split(line);
    rows.push((name: string) => {
      const index = columns.indexOf(name);
      if (index === -1) throw new Error(`column ${name} missing`);
      return cells[index] ?? "";
    });
  }
  return rows;
}

function parseRows(markdown: string): Row[] {
  return tableAfter(markdown, "| id |").map((cell) => {
    const source = cell("출처");
    if (!source || HAND_WAVED.test(source)) throw new Error(`GOLDEN-STRENGTH-FACTORS.md row ${cell("id")}: 출처 is required.`);
    const status = cell("상태");
    if (status !== "pending" && status !== "confirmed") throw new Error(`GOLDEN-STRENGTH-FACTORS.md row ${cell("id")}: 상태 must be pending or confirmed.`);
    return {
      id: cell("id"),
      dayMaster: cell("일간"),
      status,
      source,
      cells: Object.fromEntries(STRENGTH_GOLDEN_COLUMNS.map((name) => [name, cell(name)])) as StrengthGoldenCells
    };
  });
}

const rows = parseRows(readFileSync(GOLDEN_MD, "utf8"));
const factorsOf = (id: string) => {
  const input = goldenCase(id).input;
  return strengthFactorsOf(calculatePillars(input), resolveBirthKst(input));
};

describe("GOLDEN-STRENGTH-FACTORS.md — 8a factors for the golden charts", () => {
  it("covers every golden chart with a valid status and source, unique ids, and pending only inside the open round", () => {
    expect(rows.map((row) => row.id).sort()).toEqual(loadGoldenPillarCases().map((golden) => golden.id).sort());
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    const inOpenRound = (row: Row): boolean => row.status === "pending" && row.source.includes(OPEN_REVIEW_ROUND.tag);
    expect(rows.filter(inOpenRound).length).toBeLessThanOrEqual(OPEN_REVIEW_ROUND.rows);
    expect(rows.filter((row) => row.status === "pending" && !inOpenRound(row)).length).toBeLessThanOrEqual(Math.floor(rows.length * MAX_PENDING_RATIO));
  });

  it.each(rows.map((row) => [row.id, row] as const))("%s matches strengthFactorsOf (yeonhae)", (id, row) => {
    const factors = factorsOf(id);
    expect(factors.dayMaster).toBe(row.dayMaster);
    expect(renderStrengthFactors(factors)).toEqual(row.cells);
  });
});

describe("8a oracle — 득령·득지·득세 and the surface count re-derived from the confirmed GOLDEN-TENGODS.md, not from code", () => {
  const tenGodRows = tableAfter(readFileSync(TENGODS_MD, "utf8"), "| id |");

  it.each(tenGodRows.map((cell) => [cell("id"), cell] as const))("%s", (id, cell) => {
    expect(cell("상태")).toBe("confirmed");
    const hiddenGods = (column: string): string[] => cell(column).split(" ").filter((token) => token.includes("=")).map((token) => token.split("=")[1] as string);
    const present = (value: string): boolean => value !== "-" && value !== "";
    const outsideMonth = ["연간", "월간", "시간", "연지정기", "일지정기", "시지정기"].map(cell).filter(present);
    const surface = ["연간", "월간", "시간", "연지정기", "월지정기", "일지정기", "시지정기"].map(cell).filter(present);
    const support = outsideMonth.filter((god) => SUPPORT.has(god)).length;

    const factors = factorsOf(id);
    expect(factors.deukryeong.value).toBe(SUPPORT.has(cell("월지정기")));
    expect(factors.deukji.value).toBe(hiddenGods("일지장간").some((god) => SUPPORT.has(god)));
    expect(factors.deukse.value).toBe(support >= outsideMonth.length - support);
    expect([factors.deukse.support, factors.deukse.other]).toEqual([support, outsideMonth.length - support]);
    const surfaceTotal = Object.values(factors.tenGodCounts.surface).reduce((sum, n) => sum + n, 0);
    expect(surfaceTotal).toBe(surface.length);
    for (const god of new Set(surface)) expect(factors.tenGodCounts.surface[god as keyof typeof factors.tenGodCounts.surface]).toBe(surface.filter((entry) => entry === god).length);
  });
});

describe("8a coverage facts (REPORT 필수 절 — LC 개선 2·3)", () => {
  const combo = (id: string): string => {
    const factors = factorsOf(id);
    return [factors.deukryeong.value, factors.deukji.value, factors.deukse.value].map((value) => (value ? "Y" : "N")).join("");
  };

  it("득령·득지·득세 8조합 × 골든 50: 7 combinations present, YNY absent (보강 후보 = REPORT)", () => {
    const distribution: Record<string, number> = {};
    for (const row of rows) distribution[combo(row.id)] = (distribution[combo(row.id)] ?? 0) + 1;
    expect(distribution).toEqual({ YYY: 9, YYN: 8, YNN: 4, NYY: 12, NYN: 11, NNY: 2, NNN: 4 });
  });

  it("사령 nearThreshold: 4 golden rows, one a minute short of the 午 중기 end (19일)", () => {
    const near = rows.filter((row) => row.cells["사령경계"] === "Y").map((row) => row.id);
    expect(near).toEqual(["g-1983-06-25-1525", "g-1946-05-19-2359", "g-1960-11-20-2235", "g-1996-07-19-1145"].sort((a, b) => rows.findIndex((row) => row.id === a) - rows.findIndex((row) => row.id === b)));
    const edge = factorsOf("g-1983-06-25-1525").saryeong;
    expect(edge?.elapsedMinutes).toBe(19 * 1440 - 1);
    expect(edge?.role).toBe("middle");
  });

  it("득세 ties are counted as 득세 (≥, LC 개선 1) — at least one golden row is a tie", () => {
    const ties = rows.filter((row) => /^[YN] (\d+):\1$/.test(row.cells["득세"]));
    expect(ties.length).toBeGreaterThan(0);
    for (const row of ties) expect(row.cells["득세"].startsWith("Y")).toBe(true);
  });
});
