import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase } from "../golden-pillars.load.js";
import { calculatePillars } from "../pillars.js";
import { interactionsOfChart, type BranchInteractionKind, type ChartInteractions } from "./interactions.js";

const GOLDEN_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/golden/GOLDEN-INTERACTIONS.md");
const HAND_WAVED = /commonly listed|widely listed|알려짐|알려져/i;

const KIND_COLUMNS: Array<[BranchInteractionKind, string]> = [
  ["yukhap", "육합"],
  ["samhap", "삼합"],
  ["banghap", "방합"],
  ["chung", "충"],
  ["hyeong", "형"]
];

interface Row {
  id: string;
  chart: string;
  status: "pending" | "confirmed";
  source: string;
  cells: Record<string, string>;
}

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function parseRows(markdown: string): Row[] {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("| id |"));
  if (headerIndex === -1) throw new Error("GOLDEN-INTERACTIONS.md: header row not found");
  const columns = split(lines[headerIndex] as string);
  const rows: Row[] = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith("|")) break;
    const cells = split(line);
    const cell = (name: string): string => cells[columns.indexOf(name)] ?? "";
    const source = cell("출처");
    if (!source || HAND_WAVED.test(source)) throw new Error(`GOLDEN-INTERACTIONS.md row ${cell("id")}: 출처 is required and must name a document or the core run.`);
    const status = cell("상태");
    if (status !== "pending" && status !== "confirmed") throw new Error(`GOLDEN-INTERACTIONS.md row ${cell("id")}: 상태 must be pending or confirmed.`);
    const relation: Record<string, string> = { 간합: cell("간합") };
    for (const [, column] of KIND_COLUMNS) relation[column] = cell(column);
    rows.push({ id: cell("id"), chart: cell("명식"), status, source, cells: relation });
  }
  return rows;
}

/** Render the core output in the table's cell format: `글자-글자:기둥-기둥` per relation, `-` when none. */
function render(result: ChartInteractions): Record<string, string> {
  const join = (items: string[]): string => (items.length ? items.join(" ") : "-");
  const cells: Record<string, string> = {
    간합: join(result.stems.map((entry) => `${entry.stems.join("-")}:${entry.pillars.join("-")}`))
  };
  for (const [kind, column] of KIND_COLUMNS) {
    cells[column] = join(result.branches.filter((entry) => entry.kind === kind).map((entry) => `${entry.branches.join("-")}:${entry.pillars.join("-")}`));
  }
  return cells;
}

describe("GOLDEN-INTERACTIONS.md — core output for the golden charts, confirmed 2026-09-22", () => {
  const rows = parseRows(readFileSync(GOLDEN_MD, "utf8"));

  it("covers every golden chart with a valid status and source", () => {
    expect(rows.length).toBeGreaterThanOrEqual(11);
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    for (const row of rows) expect(["pending", "confirmed"]).toContain(row.status);
  });

  it("is fully confirmed (LC 검산 2026-09-22) and every confirmed row cites the verification document", () => {
    const confirmed = rows.filter((row) => row.status === "confirmed");
    expect(confirmed.length).toBe(11);
    for (const row of confirmed) expect(row.source).toContain("VERIFY-2026-0922-golden-interactions.md");
  });

  it.each(rows.map((row) => [row.id, row] as const))("%s matches interactionsOfChart", (_id, row) => {
    const pillars = calculatePillars(goldenCase(row.id).input);
    const chart = [pillars.year, pillars.month, pillars.day, pillars.time]
      .filter((pillar): pillar is NonNullable<typeof pillar> => Boolean(pillar))
      .map((pillar) => `${pillar.stem}-${pillar.branch}`)
      .join(" ");
    expect(chart).toBe(row.chart);
    expect(render(interactionsOfChart(pillars))).toEqual(row.cells);
  });

  it("documents the C3 minimum cases: g-2011-11-08-0334 has 卯戌 육합 twice (연·월, 월·일) and no golden chart is relation-free", () => {
    const sample = rows.find((row) => row.id === "g-2011-11-08-0334");
    expect(sample?.cells["육합"]).toBe("myo-sul:year-month sul-myo:month-day");
    const relationFree = rows.filter((row) => Object.values(row.cells).every((cell) => cell === "-"));
    expect(relationFree).toEqual([]);
  });
});
