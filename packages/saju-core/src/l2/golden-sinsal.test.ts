import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars } from "../pillars.js";
import { sinsalOf } from "./sinsal.js";

/**
 * 신살 S3 — GOLDEN-SINSAL.md 50행 × 변형 13열. 오라클은 SINSAL.md 표 + GOLDEN-PILLARS.md
 * 기둥 글자만 읽는다(코드 표 미참조, 5·6단계 A5 패턴). 50행 전부 confirmed — 2026-10-26 LC 독립 재계산 650셀 일치.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(resolve(HERE, "../../../../docs", path), "utf8");

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

const words = (cell: string) => cell.split(/\s+/).filter(Boolean);
const KEYS = ["year", "month", "day", "time"] as const;
type Key = (typeof KEYS)[number];

// ── 오라클: SINSAL.md 표만 ──
const rules = read("rules/SINSAL.md");
const VARIANTS = section(rules, "표 1").map((cell) => ({ id: cell("variantId"), sinsal: cell("sinsalId"), basis: cell("기준"), scope: cell("대상") }));
const CHEONEUL: Record<string, Record<string, string[]>> = {};
for (const cell of section(rules, "표 2")) (CHEONEUL[cell("variantId")] ??= {})[cell("일간")] = words(cell("지지"));
const SAMHAP = section(rules, "표 3").map((cell) => ({ branches: words(cell("지지")), target: { dohwa: cell("dohwa"), yeokma: cell("yeokma"), hwagae: cell("hwagae") } as Record<string, string> }));
const YANGIN = Object.fromEntries(section(rules, "표 4").map((cell) => [cell("일간"), cell("지지")]));
const PAIRS = Object.fromEntries([...section(rules, "표 5"), ...section(rules, "표 6")].map((cell) => [cell("variantId"), words(cell("간지"))]));

/** 명식 `"연 월 일 [시]"` → variantId → 걸린 기둥 목록(`-` = 없음). `selfExclude: false`는 경계 실측용. */
function oracle(chart: string, selfExclude = true): Record<string, string> {
  const pairs = words(chart);
  const keys = KEYS.slice(0, pairs.length) as Key[];
  const at = (key: Key) => pairs[KEYS.indexOf(key)] as string;
  const stem = (key: Key) => at(key).split("-")[0] as string;
  const branch = (key: Key) => at(key).split("-")[1] as string;
  return Object.fromEntries(
    VARIANTS.map((variant) => {
      let hit: Key[];
      if (variant.basis === "day-stem") {
        const targets = variant.sinsal === "cheoneul" ? (CHEONEUL[variant.id]?.[stem("day")] ?? []) : [YANGIN[stem("day")]].filter(Boolean);
        hit = keys.filter((key) => targets.includes(branch(key)));
      } else if (variant.basis === "pillar") {
        hit = (variant.scope === "day" ? (["day"] as Key[]) : keys).filter((key) => (PAIRS[variant.id] ?? []).includes(at(key)));
      } else {
        const from: Key = variant.basis === "year-branch" ? "year" : "day";
        const target = SAMHAP.find((row) => row.branches.includes(branch(from)))?.target[variant.sinsal];
        hit = keys.filter((key) => (!selfExclude || key !== from) && branch(key) === target);
      }
      return [variant.id, hit.length ? hit.join(",") : "-"];
    })
  );
}

const goldenMd = read("golden/GOLDEN-SINSAL.md");
const rows = section(goldenMd, "표");
const pillarsRows = section(read("golden/GOLDEN-PILLARS.md"), "표");
const chartOf = (id: string) => {
  const row = pillarsRows.find((cell) => cell("id") === id);
  if (!row) throw new Error(`GOLDEN-PILLARS has no ${id}`);
  return ["연주", "월주", "일주", "시주"].map((name) => row(name)).filter((pair) => pair && pair !== "-").join(" ");
};
const cellsOf = (cell: (name: string) => string) => Object.fromEntries(VARIANTS.map((variant) => [variant.id, cell(variant.id)]));

const LC_RECALC = "life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md";

describe("GOLDEN-SINSAL.md — 50행 · 변형 13열 · confirmed", () => {
  it("행 = GOLDEN-PILLARS 50행(같은 순서) · 명식 열 = GOLDEN-PILLARS 기둥 · 열 = SINSAL.md 표 1 변형 · 상태 confirmed · 출처 = LC 재계산 파일", () => {
    expect(rows.map((cell) => cell("id"))).toEqual(loadGoldenPillarCases().map((golden) => golden.id));
    expect(rows).toHaveLength(50);
    for (const cell of rows) {
      expect(cell("명식")).toBe(chartOf(cell("id")));
      expect(cell("상태")).toBe("confirmed");
      expect(cell("출처")).toContain(LC_RECALC);
      for (const variant of VARIANTS) expect(cell(variant.id), `${cell("id")} ${variant.id}`).toMatch(/^(-|(year|month|day|time)(,(month|day|time))*)$/);
    }
  });

  it("오라클(SINSAL.md 표 + 명식 글자) = 골든 셀", () => {
    for (const cell of rows) expect(cellsOf(cell), cell("id")).toEqual(oracle(cell("명식")));
  });

  it("코어 sinsalOf(calculatePillars(입력)) = 골든 셀(변형별 at 합집합)", () => {
    for (const cell of rows) {
      const core: Record<string, string> = Object.fromEntries(VARIANTS.map((variant) => [variant.id, "-"]));
      const hits = sinsalOf(calculatePillars(goldenCase(cell("id")).input));
      for (const variant of VARIANTS) {
        const at = KEYS.filter((key) => hits.some((hit) => hit.variantId === variant.id && hit.at.includes(key)));
        if (at.length) core[variant.id] = at.join(",");
      }
      expect(core, cell("id")).toEqual(cellsOf(cell));
    }
  });

  it("적중 분포 고정 + 변형별 보강 기준 실측: 적중 0 칸 0 · A/B 양방향 갈림 · 戊戌 단독 · 네 기둥 단독 · 자기 제외 효력 · 시각 미상", () => {
    const count = (id: string) => rows.filter((cell) => cell(id) !== "-").length;
    expect(Object.fromEntries(VARIANTS.map((variant) => [variant.id, count(variant.id)]))).toEqual({
      "cheoneul.a": 20, "cheoneul.b": 20,
      "dohwa.year-basis": 9, "dohwa.day-basis": 10,
      "yeokma.year-basis": 13, "yeokma.day-basis": 5,
      "hwagae.year-basis": 11, "hwagae.day-basis": 7,
      "yangin.yang-only": 8,
      "goegang.day-four": 5, "goegang.day-mu-sul": 6, "goegang.four-pillars": 11,
      baekho: 17
    });
    expect(rows.some((cell) => cell("cheoneul.a") !== "-" && cell("cheoneul.b") === "-")).toBe(true);
    expect(rows.some((cell) => cell("cheoneul.a") === "-" && cell("cheoneul.b") !== "-")).toBe(true);
    expect(rows.some((cell) => cell("goegang.day-four") === "-" && cell("goegang.day-mu-sul") !== "-")).toBe(true);
    expect(rows.some((cell) => cell("goegang.day-four") === "-" && cell("goegang.day-mu-sul") === "-" && cell("goegang.four-pillars") !== "-")).toBe(true);
    const selfEffective = rows.filter((cell) => {
      const loose = oracle(cell("명식"), false);
      return loose["hwagae.year-basis"] !== cell("hwagae.year-basis") || loose["hwagae.day-basis"] !== cell("hwagae.day-basis");
    });
    expect(selfEffective.length).toBeGreaterThan(0);
    // LC 재계산 «화개 자기 제외가 결과를 바꾼 셀» 23과 같은 수.
    const selfCells = rows.flatMap((cell) => {
      const loose = oracle(cell("명식"), false);
      return ["hwagae.year-basis", "hwagae.day-basis"].filter((id) => loose[id] !== cell(id));
    });
    expect(selfCells).toHaveLength(23);
    const timeless = rows.filter((cell) => words(cell("명식")).length === 3);
    expect(timeless).toHaveLength(3);
    for (const cell of timeless) expect(Object.values(cellsOf(cell)).some((value) => value.includes("time"))).toBe(false);
  });
});
