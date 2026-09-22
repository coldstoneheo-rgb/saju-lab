import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase } from "../golden-pillars.load.js";
import { calculatePillars } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import { TEN_GODS, tenGodsOfChart, type PillarTenGods } from "./ten-gods.js";

const GOLDEN_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/golden/GOLDEN-TENGODS.md");
const HAND_WAVED = /commonly listed|widely listed|알려짐|알려져/i;

interface Row {
  id: string;
  dayMaster: string;
  status: "pending" | "confirmed";
  source: string;
  pillars: Record<"year" | "month" | "day" | "time", { stem: string; branchPrimary: string; branchAll: string } | undefined>;
}

function parseRows(markdown: string): Row[] {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("| id |"));
  if (headerIndex === -1) throw new Error("GOLDEN-TENGODS.md: header row not found");
  const columns = split(lines[headerIndex] as string);
  const rows: Row[] = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith("|")) break;
    const cells = split(line);
    const cell = (name: string): string => cells[columns.indexOf(name)] ?? "";
    const source = cell("출처");
    if (!source || HAND_WAVED.test(source)) throw new Error(`GOLDEN-TENGODS.md row ${cell("id")}: 출처 is required and must name a document or the core run.`);
    const status = cell("상태");
    if (status !== "pending" && status !== "confirmed") throw new Error(`GOLDEN-TENGODS.md row ${cell("id")}: 상태 must be pending or confirmed.`);
    const pillar = (stemCol: string, primaryCol: string, allCol: string) =>
      cell(primaryCol) === "-" ? undefined : { stem: cell(stemCol), branchPrimary: cell(primaryCol), branchAll: cell(allCol) };
    rows.push({
      id: cell("id"),
      dayMaster: cell("일간"),
      status,
      source,
      pillars: {
        year: pillar("연간", "연지정기", "연지장간"),
        month: pillar("월간", "월지정기", "월지장간"),
        day: pillar("일간십신", "일지정기", "일지장간"),
        time: pillar("시간", "시지정기", "시지장간")
      }
    });
  }
  return rows;
}

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function render(pillar: PillarTenGods | undefined): { stem: string; branchPrimary: string; branchAll: string } | undefined {
  return pillar
    ? { stem: pillar.stem ?? "-", branchPrimary: pillar.branchPrimary, branchAll: pillar.branchAll.map((entry) => `${entry.stem}=${entry.tenGod}`).join(" ") }
    : undefined;
}

describe("GOLDEN-TENGODS.md — core output for the golden charts, confirmed 2026-09-22", () => {
  const rows = parseRows(readFileSync(GOLDEN_MD, "utf8"));

  it("covers every golden chart with a valid status and source", () => {
    expect(rows.length).toBeGreaterThanOrEqual(11);
    for (const row of rows) {
      expect(["pending", "confirmed"]).toContain(row.status);
      for (const pillar of Object.values(row.pillars)) {
        if (!pillar) continue;
        expect(TEN_GODS as readonly string[]).toContain(pillar.branchPrimary);
      }
    }
  });

  it("is fully confirmed (LC 검산 2026-09-22) and every confirmed row cites the verification document", () => {
    const confirmed = rows.filter((row) => row.status === "confirmed");
    expect(confirmed.length).toBe(11);
    for (const row of confirmed) expect(row.source).toContain("VERIFY-2026-0922-golden-tengods.md");
  });

  it.each(rows.map((row) => [row.id, row] as const))("%s matches tenGodsOfChart under the default school (yeonhae)", (_id, row) => {
    const chart = tenGodsOfChart(calculatePillars(goldenCase(row.id).input));
    expect(chart.dayMaster).toBe(row.dayMaster);
    expect({ year: render(chart.year), month: render(chart.month), day: render(chart.day), time: render(chart.time) }).toEqual(row.pillars);
  });

  it("is school-specific: a japyeong run is NOT a core regression — it differs from the table in exactly the 20 measured 장간 cells", () => {
    // Guard against the parser ever being pointed at a non-default school: the table is fixed under yeonhae.
    let differing = 0;
    for (const row of rows) {
      const chart = tenGodsOfChart(calculatePillars(goldenCase(row.id).input), "japyeong");
      const rendered = { year: render(chart.year), month: render(chart.month), day: render(chart.day), time: render(chart.time) };
      for (const key of ["year", "month", "day", "time"] as const) {
        const expected = row.pillars[key];
        const actual = rendered[key];
        if (!expected || !actual) continue;
        // Only the 장간 list moves between schools; stem and 정기 ten gods are school-independent.
        expect(actual.stem).toBe(expected.stem);
        expect(actual.branchPrimary).toBe(expected.branchPrimary);
        if (actual.branchAll !== expected.branchAll) differing += 1;
      }
    }
    expect(differing).toBe(20);
  });
});

describe("saju-pillars-v1 — options.include", () => {
  const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "other" as const };

  it("returns hiddenStems and tenGods only when asked, with the requested school", () => {
    const plain = buildSajuPillarsV1Response(base);
    expect(plain.ok && "tenGods" in plain.data).toBe(false);
    expect(plain.ok && "hiddenStems" in plain.data).toBe(false);

    const both = buildSajuPillarsV1Response({ ...base, options: { include: ["hiddenStems", "tenGods"] } });
    expect(both.ok).toBe(true);
    if (!both.ok) return;
    expect(both.data.tenGods?.dayMaster).toBe("byeong");
    expect(both.data.tenGods?.year.stem).toBe("sanggwan");
    expect(both.data.hiddenStems?.school).toBe("yeonhae");
    expect(both.data.hiddenStems?.day).toEqual({ residual: { stem: "mu", days: 7 }, middle: { stem: "byeong", days: 7 }, primary: { stem: "gap", days: 16 } });
    // Existing fields are untouched.
    expect(both.data.pillars).toEqual(plain.ok ? plain.data.pillars : undefined);
    expect(both.data.fiveElements).toEqual(plain.ok ? plain.data.fiveElements : undefined);

    const japyeong = buildSajuPillarsV1Response({ ...base, options: { include: ["tenGods"], hiddenStemSchool: "japyeong" } });
    expect(japyeong.ok && japyeong.data.tenGods?.school).toBe("japyeong");
    expect(japyeong.ok && japyeong.data.tenGods?.month.branchAll.map((entry) => entry.stem)).toEqual(["gye"]); // 子 in 자평진전
    expect(japyeong.ok && "hiddenStems" in japyeong.data).toBe(false);
  });

  it("rejects an unknown include block or school", () => {
    const bad = buildSajuPillarsV1Response({ ...base, options: { include: ["sinsal"] } as never }); // 신살 is not a block (daeun became one in stage 6→7)
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.error.code).toBe("INVALID_OPTIONS");
    const badSchool = buildSajuPillarsV1Response({ ...base, options: { hiddenStemSchool: "sammyeong" } as never });
    expect(badSchool.ok).toBe(false);
  });
});
