import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { daeunOf, isDaeunUnavailable, type DaeunDirection, type DaeunReading } from "./daeun.js";

const GOLDEN_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/golden/GOLDEN-DAEUN.md");
const HAND_WAVED = /commonly listed|widely listed|알려짐|알려져/i;
/** pending rows are allowed while a table awaits 검산, but never as the steady state (C). */
const MAX_PENDING_RATIO = 0.2;

interface Row {
  id: string;
  sex: string;
  direction: DaeunDirection;
  status: "pending" | "confirmed";
  source: string;
  cells: Record<string, string>;
}

const VALUE_COLUMNS = ["기준 절", "D(분)", "startAgeExact", "시작일", "첫 대운", "10주"] as const;

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function parseRows(markdown: string): Row[] {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("| id |"));
  if (headerIndex === -1) throw new Error("GOLDEN-DAEUN.md: header row not found");
  const columns = split(lines[headerIndex] as string);
  const rows: Row[] = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith("|")) break;
    const cells = split(line);
    const cell = (name: string): string => cells[columns.indexOf(name)] ?? "";
    const source = cell("출처");
    if (!source || HAND_WAVED.test(source)) throw new Error(`GOLDEN-DAEUN.md row ${cell("id")}: 출처 is required and must name a document or the core run.`);
    const status = cell("상태");
    if (status !== "pending" && status !== "confirmed") throw new Error(`GOLDEN-DAEUN.md row ${cell("id")}: 상태 must be pending or confirmed.`);
    const direction = cell("순역");
    if (direction !== "forward" && direction !== "backward") throw new Error(`GOLDEN-DAEUN.md row ${cell("id")}: 순역 must be forward or backward.`);
    const values: Record<string, string> = {};
    for (const column of VALUE_COLUMNS) values[column] = cell(column);
    rows.push({ id: cell("id"), sex: cell("성별"), direction, status, source, cells: values });
  }
  return rows;
}

function render(reading: DaeunReading): Record<string, string> {
  return {
    "기준 절": `${reading.referenceTerm.term} ${reading.referenceTerm.at}`,
    "D(분)": String(reading.distanceMinutes),
    startAgeExact: reading.startAgeExact.toFixed(4),
    시작일: reading.startsAt,
    "첫 대운": `${reading.periods[0]?.stem}-${reading.periods[0]?.branch}`,
    "10주": reading.periods.map((period) => `${period.stem}-${period.branch}`).join(" ")
  };
}

describe("GOLDEN-DAEUN.md — core output for the golden charts, confirmed 2026-09-22", () => {
  const rows = parseRows(readFileSync(GOLDEN_MD, "utf8"));

  it("is fully confirmed (LC 독립 재계산 16행 09-22 · 43행 09-23) and cites the review documents; pending below the cap", () => {
    expect(rows.every((row) => row.status === "confirmed")).toBe(true);
    expect(rows.filter((row) => row.source.includes("CODE-REVIEW-2026-0922-saju-pr80-daeun.md"))).toHaveLength(16);
    expect(rows.filter((row) => row.source.includes("VERIFY-2026-0923-golden-l2-39.md"))).toHaveLength(43);
    expect(rows.filter((row) => row.status === "pending").length).toBeLessThanOrEqual(Math.floor(rows.length * MAX_PENDING_RATIO));
  });

  it("covers every golden chart: other → two rows, male/female → one", () => {
    const golden = loadGoldenPillarCases();
    expect(rows).toHaveLength(golden.reduce((sum, goldenRow) => sum + (goldenRow.input.sex === "other" ? 2 : 1), 0));
    expect(new Set(rows.map((row) => `${row.id}/${row.direction}`)).size).toBe(rows.length);
    const ids = new Set(rows.map((row) => row.id));
    expect([...ids].sort()).toEqual(golden.map((goldenRow) => goldenRow.id).sort());
    for (const id of ids) {
      const forId = rows.filter((row) => row.id === id);
      const sex = goldenCase(id).input.sex;
      expect(forId.every((row) => row.sex === sex)).toBe(true);
      expect(forId.map((row) => row.direction).sort()).toEqual(sex === "other" ? ["backward", "forward"] : [forId[0]?.direction]);
    }
  });

  it.each(rows.map((row) => [`${row.id} ${row.direction}`, row] as const))("%s matches daeunOf", (_label, row) => {
    const birth = goldenCase(row.id).input;
    const result = daeunOf(calculatePillars(birth), resolveBirthKst(birth), birth.sex, { referenceDate: "2026-09-22" });
    if (isDaeunUnavailable(result)) throw new Error(`${row.id}: daeun unavailable`);
    const reading = result[row.direction];
    expect(reading).toBeDefined();
    expect(render(reading as DaeunReading)).toEqual(row.cells);
  });

  it("documents the C2 anchors: g-2024 forward ≈ 30일 / backward 0, both 1955 rows sit on 입춘 23:18 KST", () => {
    const g2024 = rows.filter((row) => row.id === "g-2024-02-04-1727");
    expect(g2024.find((row) => row.direction === "forward")?.cells["D(분)"]).toBe("42836");
    expect(g2024.find((row) => row.direction === "backward")?.cells["D(분)"]).toBe("0");
    expect(rows.find((row) => row.id === "g-1955-02-04-2247")?.cells["D(분)"]).toBe("1");
    expect(rows.find((row) => row.id === "g-1955-02-04-2248")?.cells["D(분)"]).toBe("0");
  });
});
