import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BRANCHES, STEMS, type Branch, type Stem } from "../cycle.js";
import type { PillarsResult } from "../types.js";
import { calculatePillars } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import { INTERACTION_TABLES } from "./interactions.data.js";
import { branchPairRules, branchTripleRule, interactionsOfChart, isAdjacent, stemPairRule } from "./interactions.js";

const RULES_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/rules/INTERACTIONS.md");

/** Parse "## 표 N — `kind` …" sections into the same shape as interactions.data.ts; columns matched by header name. */
function parseInteractionTables(markdown: string): Record<string, unknown[]> {
  const tables: Record<string, unknown[]> = {};
  const lines = markdown.split(/\r?\n/);
  let kind: string | undefined;
  let columns: string[] | undefined;

  const words = (value: string): string[] => value.split(/\s+/).filter(Boolean);
  const checkStems = (list: string[]): Stem[] => list.map((stem) => {
    if (!(STEMS as readonly string[]).includes(stem)) throw new Error(`Unknown stem ${stem} in INTERACTIONS.md`);
    return stem as Stem;
  });
  const checkBranches = (list: string[]): Branch[] => list.map((branch) => {
    if (!(BRANCHES as readonly string[]).includes(branch)) throw new Error(`Unknown branch ${branch} in INTERACTIONS.md`);
    return branch as Branch;
  });

  for (const line of lines) {
    const heading = /^## 표 \d+ — `(\w+)`/.exec(line);
    if (heading) {
      kind = heading[1];
      columns = undefined;
      tables[kind as string] = [];
      continue;
    }
    if (/^## /.test(line)) {
      kind = undefined;
      continue;
    }
    if (!kind || !line.trim().startsWith("|")) continue;
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    if (!columns) {
      columns = cells;
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) continue;
    const cell = (name: string): string => cells[columns?.indexOf(name) ?? -1] ?? "";
    const rows = tables[kind] as unknown[];
    switch (kind) {
      case "ganhap":
        rows.push({ id: cell("조"), stems: checkStems(words(cell("천간"))), potentialElement: cell("화기") });
        break;
      case "yukhap":
      case "chung":
        rows.push({ id: cell("조"), branches: checkBranches(words(cell("지지"))) });
        break;
      case "samhap":
        rows.push({ id: cell("국"), branches: checkBranches(words(cell("지지"))), pivot: checkBranches([cell("왕지")])[0], element: cell("오행") });
        break;
      case "banghap":
        rows.push({ id: cell("국"), branches: checkBranches(words(cell("지지"))), direction: cell("방위"), element: cell("오행") });
        break;
      case "hyeong":
        rows.push({ id: cell("종"), subtype: cell("유형"), branches: checkBranches(words(cell("지지"))) });
        break;
      default:
        throw new Error(`INTERACTIONS.md has a table kind the code does not know: ${kind}`);
    }
  }
  return tables;
}

describe("INTERACTIONS.md ↔ interactions.data.ts (C1)", () => {
  const parsed = parseInteractionTables(readFileSync(RULES_MD, "utf8"));

  it.each(Object.keys(INTERACTION_TABLES) as Array<keyof typeof INTERACTION_TABLES>)("table %s matches the markdown exactly", (kind) => {
    expect(parsed[kind]).toEqual(INTERACTION_TABLES[kind]);
  });

  it("has no table in the markdown that the code does not know, and none missing", () => {
    expect(Object.keys(parsed).sort()).toEqual(Object.keys(INTERACTION_TABLES).sort());
  });

  it("carries the fixed rule counts: 간합 5 · 육합 6 · 삼합 4 · 방합 4 · 충 6 · 형 4", () => {
    expect(INTERACTION_TABLES.ganhap).toHaveLength(5);
    expect(INTERACTION_TABLES.yukhap).toHaveLength(6);
    expect(INTERACTION_TABLES.samhap).toHaveLength(4);
    expect(INTERACTION_TABLES.banghap).toHaveLength(4);
    expect(INTERACTION_TABLES.chung).toHaveLength(6);
    expect(INTERACTION_TABLES.hyeong).toHaveLength(4);
    // Every branch belongs to exactly one 삼합 국 and one 방합 국.
    for (const branch of BRANCHES) {
      expect(INTERACTION_TABLES.samhap.filter((rule) => rule.branches.includes(branch))).toHaveLength(1);
      expect(INTERACTION_TABLES.banghap.filter((rule) => rule.branches.includes(branch))).toHaveLength(1);
    }
  });
});

describe("rule level — exhaustive (C2)", () => {
  it("천간 10×10: exactly the 5 합 pairs are positive, symmetric, never a stem with itself", () => {
    const positive: string[] = [];
    for (const a of STEMS) {
      for (const b of STEMS) {
        const rule = stemPairRule(a, b);
        expect(rule).toEqual(stemPairRule(b, a));
        if (a === b) expect(rule).toBeUndefined();
        if (rule && STEMS.indexOf(a) < STEMS.indexOf(b)) positive.push(rule.id);
      }
    }
    expect(positive.sort()).toEqual(["byeong-sin", "eul-gyeong", "gap-gi", "jeong-im", "mu-gye"]);
    expect(stemPairRule("gap", "gi")?.potentialElement).toBe("earth");
  });

  it("지지 12×12 pairs: 육합 6 · 충 6 · 상형 1 · 자형 4 · 삼형 2자 6 · 삼합 반합 8", () => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < BRANCHES.length; i += 1) {
      for (let j = i; j < BRANCHES.length; j += 1) {
        const a = BRANCHES[i] as Branch;
        const b = BRANCHES[j] as Branch;
        const rules = branchPairRules(a, b);
        expect(rules).toEqual(branchPairRules(b, a));
        for (const rule of rules) {
          const key = rule.kind === "hyeong" ? `hyeong:${rule.subtype}` : rule.kind;
          counts[key] = (counts[key] ?? 0) + 1;
        }
      }
    }
    expect(counts).toEqual({
      yukhap: 6,
      chung: 6,
      "hyeong:murye": 1,
      "hyeong:ja": 4,
      "hyeong:mueun": 3,
      "hyeong:jise": 3,
      samhap: 8
    });
    // 寅申 = 충 + 부분 삼형, both listed; 申辰 (왕지 없는 2자) is nothing in v1.
    expect(branchPairRules("in", "sin").map((rule) => rule.kind).sort()).toEqual(["chung", "hyeong"]);
    expect(branchPairRules("sin", "jin")).toEqual([]);
    expect(branchPairRules("sin", "ja")).toEqual([{ kind: "samhap", id: "sin-ja-jin", complete: false, element: "water" }]);
    expect(branchPairRules("jin", "jin")).toEqual([{ kind: "hyeong", id: "ja-hyeong", subtype: "ja" }]);
    expect(branchPairRules("ja", "ja")).toEqual([]);
  });

  it("지지 3자 조합 220: 삼합 4 · 방합 4 · 삼형 2 positive, nothing else", () => {
    const positive: string[] = [];
    let total = 0;
    for (let i = 0; i < 12; i += 1) {
      for (let j = i + 1; j < 12; j += 1) {
        for (let k = j + 1; k < 12; k += 1) {
          total += 1;
          const rule = branchTripleRule(BRANCHES[i] as Branch, BRANCHES[j] as Branch, BRANCHES[k] as Branch);
          if (rule) positive.push(`${rule.kind}:${rule.id}`);
        }
      }
    }
    expect(total).toBe(220);
    expect(positive.sort()).toEqual([
      "banghap:hae-ja-chuk", "banghap:in-myo-jin", "banghap:sa-o-mi", "banghap:sin-yu-sul",
      "hyeong:chuk-sul-mi", "hyeong:in-sa-sin",
      "samhap:hae-myo-mi", "samhap:in-o-sul", "samhap:sa-yu-chuk", "samhap:sin-ja-jin"
    ]);
    expect(branchTripleRule("jin", "ja", "sin")).toEqual({ kind: "samhap", id: "sin-ja-jin", complete: true, element: "water" });
    expect(branchTripleRule("jin", "jin", "jin")).toBeUndefined();
  });

  it("adjacency is 연-월 · 월-일 · 일-시 only", () => {
    expect(isAdjacent("year", "month")).toBe(true);
    expect(isAdjacent("month", "day")).toBe(true);
    expect(isAdjacent("day", "time")).toBe(true);
    expect(isAdjacent("year", "day")).toBe(false);
    expect(isAdjacent("year", "time")).toBe(false);
    expect(isAdjacent("month", "time")).toBe(false);
  });
});

function chart(year: string, month: string, day: string, time?: string): PillarsResult {
  const pillar = (text: string) => {
    const [stem, branch] = text.split(" ");
    return { stem: stem as string, branch: branch as string };
  };
  return { year: pillar(year), month: pillar(month), day: pillar(day), ...(time ? { time: pillar(time) } : {}) } as PillarsResult;
}

describe("chart level — positions, duplicates, shared, subsumption", () => {
  it("lists every pillar pair with adjacency and never suppresses a non-adjacent pair", () => {
    // 甲(연) … 己(일): non-adjacent 간합 still listed, adjacent:false.
    const result = interactionsOfChart(chart("gap ja", "byeong o", "gi chuk", "im mi"));
    expect(result.stems).toEqual([
      { kind: "ganhap", id: "gap-gi", pillars: ["year", "day"], stems: ["gap", "gi"], adjacent: false, potentialElement: "earth", shared: false }
    ]);
    // 子午 충(연·월) · 子丑 육합(연·일) · 午未 육합(월·시) · 丑未 충 + 부분 삼형(일·시, both listed)
    expect(result.branches.map((entry) => `${entry.kind}:${entry.pillars.join("-")}:${entry.adjacent}`).sort()).toEqual([
      "chung:day-time:true",
      "chung:year-month:true",
      "hyeong:day-time:true",
      "yukhap:month-time:false",
      "yukhap:year-day:false"
    ]);
    // 子 is in 충(연·월) and 육합(연·일), 丑未 in 충 and 형 — different kinds, so nothing is shared.
    expect(result.branches.every((entry) => entry.shared === false)).toBe(true);
  });

  it("marks 쟁합·투합: 甲 twice with one 己 → both listed, shared:true", () => {
    const result = interactionsOfChart(chart("gap in", "gi sa", "gap sin", "gyeong sul"));
    expect(result.stems.map((entry) => [entry.pillars.join("-"), entry.shared])).toEqual([["year-month", true], ["month-day", true]]);
    // 寅巳申 complete 삼형(연·월·일); the partial 형 pairs inside it are subsumed, but 寅申 충 and 巳申 육합 (other kinds) stay.
    expect(result.branches).toEqual([
      { kind: "hyeong", id: "in-sa-sin", pillars: ["year", "month", "day"], branches: ["in", "sa", "sin"], complete: true, subtype: "mueun", shared: false },
      { kind: "chung", id: "in-sin", pillars: ["year", "day"], branches: ["in", "sin"], adjacent: false, shared: false },
      { kind: "yukhap", id: "sa-sin", pillars: ["month", "day"], branches: ["sa", "sin"], adjacent: true, shared: false }
    ]);
  });

  it("삼합: complete triple subsumes its own 반합 pairs; a second 왕지 outside the triple keeps its 반합 and shares", () => {
    const result = interactionsOfChart(chart("gyeong sin", "mu ja", "gap jin", "im ja"));
    const samhap = result.branches.filter((entry) => entry.kind === "samhap");
    expect(samhap.map((entry) => `${entry.pillars.join("-")}:${entry.complete}:${entry.shared}`).sort()).toEqual([
      // two complete 국 through each 子, both shared; no leftover 반합 (every 왕지 pair sits inside a complete triple)
      "year-day-time:true:true",
      "year-month-day:true:true"
    ]);
    expect(samhap.every((entry) => entry.element === "water")).toBe(true);
  });

  it("삼합 반합 needs the 왕지; 申辰 alone (공협) yields nothing", () => {
    const with왕지 = interactionsOfChart(chart("gyeong sin", "mu ja", "gap myo"));
    expect(with왕지.branches.filter((entry) => entry.kind === "samhap")).toEqual([
      { kind: "samhap", id: "sin-ja-jin", pillars: ["year", "month"], branches: ["sin", "ja"], adjacent: true, complete: false, element: "water", shared: false }
    ]);
    const without = interactionsOfChart(chart("gyeong sin", "mu jin", "gap myo"));
    expect(without.branches.filter((entry) => entry.kind === "samhap")).toEqual([]);
  });

  it("방합 is complete-only; 2 of 3 yields nothing", () => {
    expect(interactionsOfChart(chart("gap in", "eul myo", "byeong jin")).branches).toEqual([
      { kind: "banghap", id: "in-myo-jin", pillars: ["year", "month", "day"], branches: ["in", "myo", "jin"], complete: true, element: "wood", shared: false }
    ]);
    expect(interactionsOfChart(chart("gap in", "eul myo", "byeong sa")).branches.filter((entry) => entry.kind === "banghap")).toEqual([]);
  });

  it("자형: one record per pillar pair; three 辰 → three pairs, all shared", () => {
    const result = interactionsOfChart(chart("gap jin", "mu jin", "im jin", "byeong in"));
    const self = result.branches.filter((entry) => entry.subtype === "ja");
    expect(self.map((entry) => entry.pillars.join("-"))).toEqual(["year-month", "year-day", "month-day"]);
    expect(self.every((entry) => entry.shared === true && entry.complete === undefined)).toBe(true);
    // 寅 with 辰 is neither 합 nor 충 (寅卯辰 needs 卯); the chart has nothing else.
    expect(result.branches).toHaveLength(3);
  });

  it("returns empty arrays with keys kept when the chart has no relation, and drops the time pillar when unknown", () => {
    expect(interactionsOfChart(chart("gap ja", "byeong in", "mu sul"))).toEqual({ stems: [], branches: [] });
    const three = interactionsOfChart(chart("gap ja", "gi o", "mu hae"));
    expect(three.stems).toEqual([
      { kind: "ganhap", id: "gap-gi", pillars: ["year", "month"], stems: ["gap", "gi"], adjacent: true, potentialElement: "earth", shared: false }
    ]);
    expect(three.branches).toEqual([
      { kind: "chung", id: "ja-o", pillars: ["year", "month"], branches: ["ja", "o"], adjacent: true, shared: false }
    ]);
    expect(JSON.stringify(three)).not.toContain("time");
  });

  it("is a pure function of the characters: same pillars from the calculator give the same relations", () => {
    const pillars = calculatePillars({ birthDate: "1990-01-01", birthTime: "10:30", timezone: "Asia/Seoul", sex: "other" });
    expect(interactionsOfChart(pillars)).toEqual(interactionsOfChart(chart(
      `${pillars.year.stem} ${pillars.year.branch}`,
      `${pillars.month.stem} ${pillars.month.branch}`,
      `${pillars.day.stem} ${pillars.day.branch}`,
      pillars.time ? `${pillars.time.stem} ${pillars.time.branch}` : undefined
    )));
  });
});

describe("saju-pillars-v1 — options.include interactions (C4 shape)", () => {
  const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "other" as const };

  it("returns the block only when asked and leaves every other field byte-identical", () => {
    const plain = buildSajuPillarsV1Response(base);
    const withBlock = buildSajuPillarsV1Response({ ...base, options: { include: ["interactions"] } });
    expect(plain.ok && withBlock.ok).toBe(true);
    if (!plain.ok || !withBlock.ok) return;
    expect("interactions" in plain.data).toBe(false);
    expect(withBlock.data.interactions).toEqual(interactionsOfChart(withBlock.data.pillars));
    const { interactions: _omit, ...rest } = withBlock.data;
    expect(JSON.stringify(rest)).toBe(JSON.stringify(plain.data));
  });

  it("stacks with the stage-5 blocks and still rejects unknown blocks", () => {
    const all = buildSajuPillarsV1Response({ ...base, options: { include: ["hiddenStems", "tenGods", "interactions"] } });
    expect(all.ok && Object.keys(all.data)).toContain("interactions");
    const bad = buildSajuPillarsV1Response({ ...base, options: { include: ["interactions", "pahae"] } as never });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.error.code).toBe("INVALID_OPTIONS");
  });
});
