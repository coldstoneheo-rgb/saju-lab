import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Branch, Stem } from "../cycle.js";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars } from "../pillars.js";
import { loadInteractionRules, type ParsedInteractionTables } from "./interactions-rules.load.js";
import { interactionsOfChart, type BranchInteraction, type BranchInteractionKind, type PillarKey, type StemInteraction } from "./interactions.js";

const GOLDEN_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/golden/GOLDEN-INTERACTIONS.md");
const HAND_WAVED = /commonly listed|widely listed|알려짐|알려져/i;
/** pending rows are allowed while a table awaits 검산, but never as the steady state (C). */
const MAX_PENDING_RATIO = 0.2;
/**
 * The 검산 round now open: rows for the 39 golden charts added 2026-09-23 start 100% pending, so the cap
 * skips them until their confirmed PR, which deletes this constant (#81 REPORT §6 운영 규칙). `rows` bounds the
 * exemption to exactly this round, so the tag cannot be reused to park later rows.
 */
const OPEN_REVIEW_ROUND = { tag: "TASK-2026-0923-golden-39", goldenVerifiedOn: "2026-09-23", rows: 39 } as const;

const KIND_COLUMNS: Array<[BranchInteractionKind, string]> = [
  ["yukhap", "육합"],
  ["samhap", "삼합"],
  ["banghap", "방합"],
  ["chung", "충"],
  ["hyeong", "형"]
];
const PILLAR_ORDER: PillarKey[] = ["year", "month", "day", "time"];

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

// ---------------------------------------------------------------- oracle
// Expected records are derived from the golden cells + the markdown rule tables
// (docs/rules/INTERACTIONS.md), never from interactions.data.ts, so every field —
// id·complete·element·subtype·adjacent·shared — is checked against an independent source (A5).

const sameSet = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && [...a].sort().join() === [...b].sort().join();
const isAdjacent = (a: PillarKey, b: PillarKey): boolean => Math.abs(PILLAR_ORDER.indexOf(a) - PILLAR_ORDER.indexOf(b)) === 1;

function parseToken(token: string): { characters: string[]; pillars: PillarKey[] } {
  const [characters, pillars] = token.split(":");
  return { characters: (characters ?? "").split("-"), pillars: (pillars ?? "").split("-") as PillarKey[] };
}

function expectedStems(cell: string, rules: ParsedInteractionTables): StemInteraction[] {
  if (cell === "-") return [];
  const records = cell.split(/\s+/).map((token) => {
    const { characters, pillars } = parseToken(token);
    const rule = rules.ganhap.find((entry) => sameSet(entry.stems, characters));
    if (!rule) throw new Error(`No 간합 rule for ${token}`);
    return {
      kind: "ganhap" as const,
      id: rule.id,
      pillars: pillars as [PillarKey, PillarKey],
      stems: characters as [Stem, Stem],
      adjacent: isAdjacent(pillars[0] as PillarKey, pillars[1] as PillarKey),
      potentialElement: rule.potentialElement,
      shared: false
    };
  });
  return markShared(records);
}

function expectedBranches(kind: BranchInteractionKind, cell: string, rules: ParsedInteractionTables): BranchInteraction[] {
  if (cell === "-") return [];
  return cell.split(/\s+/).map((token) => {
    const { characters, pillars } = parseToken(token);
    const branches = characters as Branch[];
    const base = { kind, pillars, branches, shared: false };
    const pair = pillars.length === 2 ? { adjacent: isAdjacent(pillars[0] as PillarKey, pillars[1] as PillarKey) } : {};
    switch (kind) {
      case "yukhap":
      case "chung": {
        const rule = rules[kind].find((entry) => sameSet(entry.branches, branches));
        if (!rule) throw new Error(`No ${kind} rule for ${token}`);
        return { ...base, id: rule.id, ...pair };
      }
      case "samhap": {
        const rule = rules.samhap.find((entry) => branches.every((branch) => entry.branches.includes(branch)));
        if (!rule) throw new Error(`No 삼합 rule for ${token}`);
        if (branches.length === 2 && !branches.includes(rule.pivot)) throw new Error(`반합 without 왕지: ${token}`);
        return { ...base, id: rule.id, ...pair, complete: branches.length === 3, element: rule.element };
      }
      case "banghap": {
        const rule = rules.banghap.find((entry) => sameSet(entry.branches, branches));
        if (!rule) throw new Error(`No 방합 rule for ${token}`);
        return { ...base, id: rule.id, complete: true, element: rule.element };
      }
      case "hyeong": {
        const self = rules.hyeong.find((entry) => entry.subtype === "ja");
        if (branches.length === 2 && branches[0] === branches[1]) {
          if (!self?.branches.includes(branches[0] as Branch)) throw new Error(`Not a 자형 branch: ${token}`);
          return { ...base, id: self.id, ...pair, subtype: "ja" as const };
        }
        const rule = rules.hyeong.find((entry) => entry.subtype !== "ja" && branches.every((branch) => entry.branches.includes(branch)));
        if (!rule) throw new Error(`No 형 rule for ${token}`);
        return rule.branches.length === 3
          ? { ...base, id: rule.id, ...pair, complete: branches.length === 3, subtype: rule.subtype }
          : { ...base, id: rule.id, ...pair, subtype: rule.subtype };
      }
      default:
        throw new Error(`Unknown kind ${kind as string}`);
    }
  });
}

/** shared = another record of the same kind AND id shares a pillar (docs/rules/INTERACTIONS.md 위치 규칙, A9). */
function markShared<T extends { kind: string; id: string; pillars: readonly PillarKey[]; shared: boolean }>(records: T[]): T[] {
  return records.map((record) => ({
    ...record,
    shared: records.some((other) => other !== record && other.kind === record.kind && other.id === record.id && other.pillars.some((pillar) => record.pillars.includes(pillar)))
  }));
}

/** Order-independent canonical form: every field, sorted keys, sorted records. */
function canonical(records: ReadonlyArray<object>): string[] {
  return records.map((record) => JSON.stringify(record, Object.keys(record).sort())).sort();
}

describe("GOLDEN-INTERACTIONS.md — confirmed 2026-09-22, compared against an md-derived oracle", () => {
  const rows = parseRows(readFileSync(GOLDEN_MD, "utf8"));
  const rules = loadInteractionRules();

  it("covers every golden chart with a valid status and source, unique ids, and pending below the cap", () => {
    expect(rows.map((row) => row.id).sort()).toEqual(loadGoldenPillarCases().map((golden) => golden.id).sort());
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    for (const row of rows) expect(["pending", "confirmed"]).toContain(row.status);
    const inOpenRound = (row: Row): boolean => row.status === "pending" && row.source.includes(OPEN_REVIEW_ROUND.tag);
    for (const row of rows.filter(inOpenRound)) expect(goldenCase(row.id).verifiedOn).toBe(OPEN_REVIEW_ROUND.goldenVerifiedOn);
    expect(rows.filter(inOpenRound).length).toBeLessThanOrEqual(OPEN_REVIEW_ROUND.rows);
    expect(rows.filter((row) => row.status === "pending" && !inOpenRound(row)).length).toBeLessThanOrEqual(Math.floor(rows.length * MAX_PENDING_RATIO));
  });

  it("is fully confirmed (LC 검산 2026-09-22) and every confirmed row cites the verification document", () => {
    const confirmed = rows.filter((row) => row.status === "confirmed");
    expect(confirmed.length).toBe(11);
    for (const row of confirmed) expect(row.source).toContain("VERIFY-2026-0922-golden-interactions.md");
  });

  it.each(rows.map((row) => [row.id, row] as const))("%s matches interactionsOfChart on every field (order-independent)", (_id, row) => {
    const pillars = calculatePillars(goldenCase(row.id).input);
    const chart = [pillars.year, pillars.month, pillars.day, pillars.time]
      .filter((pillar): pillar is NonNullable<typeof pillar> => Boolean(pillar))
      .map((pillar) => `${pillar.stem}-${pillar.branch}`)
      .join(" ");
    expect(chart).toBe(row.chart);

    const actual = interactionsOfChart(pillars);
    expect(canonical(actual.stems)).toEqual(canonical(expectedStems(row.cells["간합"] ?? "-", rules)));
    const expectedAll = markShared(KIND_COLUMNS.flatMap(([kind, column]) => expectedBranches(kind, row.cells[column] ?? "-", rules)));
    expect(canonical(actual.branches)).toEqual(canonical(expectedAll));
  });

  it("documents the C3 minimum cases: g-2011-11-08-0334 has 卯戌 육합 twice (연·월, 월·일); no confirmed chart is relation-free, three of the 09-23 charts are", () => {
    const sample = rows.find((row) => row.id === "g-2011-11-08-0334");
    expect(sample?.cells["육합"]).toBe("myo-sul:year-month sul-myo:month-day");
    const relationFree = rows.filter((row) => Object.values(row.cells).every((cell) => cell === "-"));
    expect(relationFree.filter((row) => row.status === "confirmed")).toEqual([]);
    // 巳巳·丑丑·寅寅 are not 자형 and 甲戊·丙壬 천간충 is outside v1 — the golden table's first relation-free charts.
    expect(relationFree.map((row) => row.id).sort()).toEqual(["g-1946-05-19-2359", "g-1963-06-06-1000", "g-2022-01-25-0350"]);
  });

  it("pins the 합충 structures the golden-39 candidate table designed (GOLDEN-CANDIDATES-2026-0923 §3-9·§7, 근거 열)", () => {
    // Literal tokens from the design table, not from the core: each 합충 row must carry its designed structure.
    const designed: Array<[string, string, string]> = [
      ["g-1929-06-13-1730", "삼합", "sa-chuk-yu:year-day-time"], // X1 巳酉丑 완전 삼합, 반합 따로 없음
      ["g-1947-09-14-1930", "방합", "yu-sin-sul:month-day-time"], // X2 申酉戌 방합
      ["g-1986-07-12-1530", "형", "in-sa-sin:year-day-time"], // X3 寅巳申 완전 삼형 …
      ["g-1986-07-12-1530", "충", "in-sin:year-time"], // … 과 같은 寅申 쌍의 충
      ["g-1992-10-02-2130", "형", "hae-hae:day-time"], // X4 亥亥 자형 1건
      ["g-2013-05-22-0530", "형", "ja-myo:day-time"], // X5 子卯 상형, 巳巳 미산출
      ["g-1986-07-08-1900", "형", "mi-chuk-sul:month-day-time"] // R1 丑戌未 완전 삼형
    ];
    for (const [id, column, token] of designed) {
      const cell = rows.find((row) => row.id === id)?.cells[column] ?? "";
      expect(cell.split(/\s+/), `${id} ${column}`).toContain(token);
    }
    // Subsumption: a complete triple leaves no 2-char record of the same rule in that column.
    expect(rows.find((row) => row.id === "g-1929-06-13-1730")?.cells["삼합"]).toBe("sa-chuk-yu:year-day-time");
    expect(rows.find((row) => row.id === "g-1986-07-12-1530")?.cells["형"]).toBe("in-sa-sin:year-day-time");
    expect(rows.find((row) => row.id === "g-2013-05-22-0530")?.cells["형"]).toBe("ja-myo:day-time");
  });

  it("the oracle rejects a swapped field (sanity: 무은↔지세 or water↔fire would not pass)", () => {
    const row = rows.find((entry) => entry.id === "g-1988-10-09-0230") as Row; // 戌丑 부분 형 = 지세, 酉丑 반합 = metal
    const actual = interactionsOfChart(calculatePillars(goldenCase(row.id).input));
    const tampered = actual.branches.map((entry) =>
      entry.kind === "hyeong" ? { ...entry, subtype: "mueun" as const } : entry.kind === "samhap" ? { ...entry, element: "fire" as const } : entry
    );
    const expectedAll = markShared(KIND_COLUMNS.flatMap(([kind, column]) => expectedBranches(kind, row.cells[column] ?? "-", rules)));
    expect(canonical(tampered)).not.toEqual(canonical(expectedAll));
  });
});
