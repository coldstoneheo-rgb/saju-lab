import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BRANCHES, STEMS, type Branch, type Stem } from "../cycle.js";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import type { BirthInput } from "../types.js";
import { hiddenStemList } from "./hidden-stems.data.js";
import { strengthFactorsOf, type StrengthFactors } from "./strength-factors.js";
import { tenGodOf } from "./ten-gods.js";
import { BIGYEOP_MONTH_TABLE, gyeokgukReadingsOf, type GyeokgukReading } from "./gyeokguk.js";

/**
 * 격국 K3 — 골든 50 + 보강. This file derives the expected 취격 from the 8a golden md cells and
 * pins the distribution; GOLDEN-GYEOKGUK.md (8a confirmed 2026-10-26 뒤 생성) is checked against the
 * core in golden-l2-derived.test.ts.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const FACTORS_GOLDEN_MD = resolve(HERE, "../../../../docs/golden/GOLDEN-STRENGTH-FACTORS.md");

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

const factorsOf = (input: BirthInput, school?: "yeonhae" | "japyeong"): StrengthFactors =>
  strengthFactorsOf(calculatePillars(input), resolveBirthKst(input), school ? { school } : {});
const chart = (id: string, school?: "yeonhae" | "japyeong") => factorsOf(goldenCase(id).input, school);
/** `ruleSetId suffix → "gyeok/role,…"` or the unavailable reason; `!` marks ambiguous. */
const summary = (readings: GyeokgukReading[]): Record<string, string> =>
  Object.fromEntries(
    readings.map((r) => [
      r.ruleSetId.replace("gyeokguk.", ""),
      (r.candidates.map((c) => `${c.gyeok}/${c.role}`).join(",") || (r.unavailable as string)) + (r.ambiguous ? "!" : "")
    ])
  );

describe("골든 50 — 8a md 셀(일간·득령·투간·사령) + 골든 월지에서 유도한 취격 = 코어", () => {
  const golden = readFileSync(FACTORS_GOLDEN_MD, "utf8");
  const lines = golden.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("| id | 일간 |"));
  const columns = split(lines[headerIndex] as string);
  const rows = lines
    .slice(headerIndex + 2)
    .filter((line) => line.startsWith("| g-"))
    .map((line) => {
      const cells = split(line);
      const cell = (name: string): string => cells[columns.indexOf(name)] ?? "";
      // 투간 cell: `pillar.role:stem>in,in …`; only month entries matter, and the day stem is not a 투출 position.
      const monthExposed = cell("투간")
        .split(" ")
        .filter((token) => token.startsWith("month."))
        .map((token) => {
          const [, role, stem, targets] = /^month\.(\w+):(\w+)>(\S+)$/.exec(token) ?? [];
          return { role: role as string, stem: stem as Stem, in: (targets ?? "").split(",").filter((pillar) => pillar !== "day") };
        })
        .filter((entry) => entry.in.length > 0);
      const saryeong = /^(\w+) (\w+) \d+$/.exec(cell("사령"));
      return {
        id: cell("id"),
        dayMaster: cell("일간") as Stem,
        primaryTenGod: /\((\w+)\)/.exec(cell("득령"))?.[1] as string,
        monthExposed,
        saryeong: saryeong ? { stem: saryeong[1] as Stem, role: saryeong[2] as string } : undefined
      };
    });

  // Hand-written 록·양인·월겁 (설계 §2), not read from gyeokguk.ts.
  const TABLE: Record<string, string> = {
    "gap.in": "geonrok", "eul.myo": "geonrok", "byeong.sa": "geonrok", "jeong.o": "geonrok", "mu.sa": "geonrok",
    "gi.o": "geonrok", "gyeong.sin": "geonrok", "sin.yu": "geonrok", "im.hae": "geonrok", "gye.ja": "geonrok",
    "gap.myo": "yangin", "byeong.o": "yangin", "mu.o": "yangin", "gyeong.yu": "yangin", "im.ja": "yangin",
    "eul.in": "wolgeop", "jeong.sa": "wolgeop", "sin.sin": "wolgeop", "gye.hae": "wolgeop"
  };
  const BIGYEOP = ["bigyeon", "geopjae"];

  const expected = (row: (typeof rows)[number]): Record<string, string> => {
    const monthBranch = goldenCase(row.id).expected.month.branch;
    const table = TABLE[`${row.dayMaster}.${monthBranch}`];
    const primaryBigyeop = BIGYEOP.includes(row.primaryTenGod);
    const primaryExposed = row.monthExposed.some((entry) => entry.role === "primary");
    const others = ["middle", "residual"]
      .map((role) => row.monthExposed.find((entry) => entry.role === role))
      .filter((entry): entry is (typeof row.monthExposed)[number] => entry !== undefined && !BIGYEOP.includes(tenGodOf(row.dayMaster, entry.stem)))
      .map((entry) => `${tenGodOf(row.dayMaster, entry.stem)}/${entry.role}`);
    const primary = `${row.primaryTenGod}/primary`;
    const exposedFirst = table
      ? `${table}/primary`
      : primaryExposed && !primaryBigyeop
        ? primary
        : others.length === 1
          ? (others[0] as string)
          : others.length === 2
            ? `${others.join(",")}!`
            : primaryBigyeop
              ? "bigyeop-month"
              : primary;
    const primaryOnly = table ? `${table}/primary` : primaryBigyeop ? "bigyeop-month" : primary;
    const saryeongGod = row.saryeong ? tenGodOf(row.dayMaster, row.saryeong.stem) : undefined;
    const saryeong = !row.saryeong
      ? "unavailable"
      : table
        ? `${table}/primary`
        : BIGYEOP.includes(saryeongGod as string)
          ? "bigyeop-month"
          : `${saryeongGod}/${row.saryeong.role}`;
    return { "exposed-first": exposedFirst, "primary-only": primaryOnly, saryeong };
  };

  it("parses all 50 rows, every row has a 사령 (yeonhae)", () => {
    expect(rows).toHaveLength(50);
    expect(rows.every((row) => row.saryeong !== undefined)).toBe(true);
  });

  it("every row's three readings equal the md-derived expectation", () => {
    const mismatches = rows
      .filter((row) => JSON.stringify(summary(gyeokgukReadingsOf(chart(row.id)))) !== JSON.stringify(expected(row)))
      .map((row) => row.id);
    expect(mismatches).toEqual([]);
  });

  it("분포 고정(골든 50, yeonhae): 세트별 격 · ambiguous 1 · bigyeop-month 2/6 · 일치 29/50", () => {
    const tally = (index: number) => {
      const out: Record<string, number> = {};
      for (const row of rows) {
        const reading = gyeokgukReadingsOf(chart(row.id))[index] as GyeokgukReading;
        for (const key of reading.candidates.length ? reading.candidates.map((c) => c.gyeok) : [reading.unavailable as string]) out[key] = (out[key] ?? 0) + 1;
      }
      return out;
    };
    expect(tally(0)).toEqual({ geonrok: 7, jeonggwan: 6, jeongin: 5, jeongjae: 6, pyeongwan: 4, pyeonin: 6, sanggwan: 8, siksin: 5, yangin: 4 });
    expect(tally(1)).toEqual({ "bigyeop-month": 2, geonrok: 7, jeonggwan: 5, jeongin: 3, jeongjae: 8, pyeongwan: 4, pyeonin: 5, pyeonjae: 1, sanggwan: 7, siksin: 4, yangin: 4 });
    expect(tally(2)).toEqual({ "bigyeop-month": 6, geonrok: 7, jeonggwan: 3, jeongin: 9, jeongjae: 3, pyeongwan: 3, pyeonin: 1, pyeonjae: 4, sanggwan: 5, siksin: 5, yangin: 4 });
    const all = rows.map((row) => gyeokgukReadingsOf(chart(row.id)));
    expect(all.filter((readings) => readings[0]?.ambiguous).length).toBe(1);
    expect(all.filter((readings) => readings[0]?.agreesAcrossSets).length).toBe(29);
  });

  it("월지충 9행: monthBranchClashed는 복사만 하고 취격에 영향이 없다(충/비충 양쪽 있음)", () => {
    const flags = rows.map((row) => gyeokgukReadingsOf(chart(row.id))[0]?.monthBranchClashed);
    expect(flags.filter(Boolean)).toHaveLength(9);
    expect(gyeokgukReadingsOf(chart("g-1990-01-01-1030")).map((r) => r.monthBranchClashed)).toEqual([false, false, false]);
  });
});

describe("보강 6 — 골든 50에 없는 칸 (설계 §4 ③④⑥ + 잡기 ambiguous · 고지 무투출)", () => {
  const input = (birthDate: string, birthTime?: string): BirthInput => ({
    birthDate,
    ...(birthTime ? { birthTime } : {}),
    timezone: "Asia/Seoul",
    calendar: "solar",
    sex: "other"
  });
  const pillarsOf = (birthDate: string, birthTime?: string) => {
    const p = calculatePillars(input(birthDate, birthTime));
    return [p.year, p.month, p.day, p.time].map((pillar) => (pillar ? `${pillar.stem}-${pillar.branch}` : "-")).join(" ");
  };
  const of = (birthDate: string, birthTime?: string) => summary(gyeokgukReadingsOf(factorsOf(input(birthDate, birthTime))));

  it("월겁 乙 寅월: 1980-02-12 10:30 (庚申 戊寅 乙卯 辛巳)", () => {
    expect(pillarsOf("1980-02-12", "10:30")).toBe("gyeong-sin mu-in eul-myo sin-sa");
    expect(of("1980-02-12", "10:30")).toEqual({ "exposed-first": "wolgeop/primary", "primary-only": "wolgeop/primary", saryeong: "wolgeop/primary" });
  });

  it("월겁 癸 亥월: 1980-11-16 10:30 (庚申 丁亥 癸巳 丁巳)", () => {
    expect(pillarsOf("1980-11-16", "10:30")).toBe("gyeong-sin jeong-hae gye-sa jeong-sa");
    expect(of("1980-11-16", "10:30")).toEqual({ "exposed-first": "wolgeop/primary", "primary-only": "wolgeop/primary", saryeong: "wolgeop/primary" });
  });

  it("고지 무투출 己 戌월: 1980-10-23 10:30 (庚申 丙戌 己巳 己巳) → 세 세트 bigyeop-month", () => {
    expect(pillarsOf("1980-10-23", "10:30")).toBe("gyeong-sin byeong-sul gi-sa gi-sa");
    expect(of("1980-10-23", "10:30")).toEqual({ "exposed-first": "bigyeop-month", "primary-only": "bigyeop-month", saryeong: "bigyeop-month" });
  });

  it("고지 무투출 戊 丑월: 1980-01-26 10:30 (己未 丁丑 戊戌 丁巳) → 세 세트 bigyeop-month (丑 중기 辛·여기 癸 미투출)", () => {
    expect(pillarsOf("1980-01-26", "10:30")).toBe("gi-mi jeong-chuk mu-sul jeong-sa");
    expect(of("1980-01-26", "10:30")).toEqual({ "exposed-first": "bigyeop-month", "primary-only": "bigyeop-month", saryeong: "bigyeop-month" });
  });

  it("잡기 ambiguous 戊 未월: 1981-07-09 10:30 (辛酉 乙未 戊子 丁巳) — 중기 乙(월간)·여기 丁(시간) 투출", () => {
    expect(pillarsOf("1981-07-09", "10:30")).toBe("sin-yu eul-mi mu-ja jeong-sa");
    expect(of("1981-07-09", "10:30")).toEqual({ "exposed-first": "jeonggwan/middle,jeongin/residual!", "primary-only": "bigyeop-month", saryeong: "jeongin/residual" });
  });

  it("시각 미상이면 격이 바뀐다 壬 辰월: 1980-04-09 10:30 (庚申 庚辰 壬子 乙巳) 시간 乙 = 辰 여기 투출 → 상관 / 시각 미상 → 편관(정기 戊)", () => {
    expect(pillarsOf("1980-04-09", "10:30")).toBe("gyeong-sin gyeong-jin im-ja eul-sa");
    expect(of("1980-04-09", "10:30")["exposed-first"]).toBe("sanggwan/residual");
    expect(of("1980-04-09")["exposed-first"]).toBe("pyeongwan/primary");
    expect(gyeokgukReadingsOf(factorsOf(input("1980-04-09"))).every((r) => r.precision === "time-unknown")).toBe(true);
  });
});

describe("불변식 · japyeong · 발화 조건 (critic #114 관찰 ②③⑤)", () => {
  it("표 밖 정기 비겁 = 戊·己 일간의 辰戌丑未뿐이다 (두 학파, 일간 10 × 월지 12 전수)", () => {
    for (const school of ["yeonhae", "japyeong"] as const) {
      const outside: string[] = [];
      for (const day of STEMS) {
        for (const branch of BRANCHES as readonly Branch[]) {
          const primary = (hiddenStemList(branch, school).at(-1) as { stem: Stem }).stem;
          const inTable = BIGYEOP_MONTH_TABLE.some((row) => row.dayMaster === day && row.monthBranch === branch);
          if (!inTable && ["bigyeon", "geopjae"].includes(tenGodOf(day, primary))) outside.push(`${day}.${branch}`);
        }
      }
      expect(outside.sort()).toEqual(["gi.chuk", "gi.jin", "gi.mi", "gi.sul", "mu.chuk", "mu.jin", "mu.mi", "mu.sul"]);
    }
  });

  it("japyeong: 투출 우선·정기 고정도 계산하고 school을 복사한다 — g-1927-08-20-0915 申(戊·壬·庚 동일) ambiguous 유지, 골든 50 투출 우선 차분 0", () => {
    expect(summary(gyeokgukReadingsOf(chart("g-1927-08-20-0915", "japyeong")))).toEqual({
      "exposed-first": "pyeongwan/middle,siksin/residual!",
      "primary-only": "pyeonjae/primary",
      saryeong: "no-day-counts"
    });
    expect(gyeokgukReadingsOf(chart("g-1927-08-20-0915", "japyeong")).every((r) => r.school === "japyeong")).toBe(true);
    const changed = loadGoldenPillarCases().filter((golden) => {
      const pick = (school?: "japyeong") => gyeokgukReadingsOf(chart(golden.id, school)).slice(0, 2).map((r) => r.candidates.map((c) => c.gyeok).join("|"));
      return JSON.stringify(pick()) !== JSON.stringify(pick("japyeong"));
    });
    expect(changed.map((golden) => golden.id)).toEqual([]);
  });

  it("firedConditions = 첫 일치 조건 id", () => {
    expect(gyeokgukReadingsOf(chart("g-1927-08-20-0915")).map((r) => r.firedConditions)).toEqual([
      ["exposed-first.two-others-exposed"], ["primary-only.otherwise"], ["saryeong.otherwise"]
    ]);
    expect(gyeokgukReadingsOf(chart("g-1953-04-27-1610")).map((r) => r.firedConditions)).toEqual([
      ["exposed-first.one-other-exposed"], ["primary-only.bigyeop-month"], ["saryeong.bigyeop"]
    ]);
    expect(gyeokgukReadingsOf(chart("g-1943-03-18-1320", "japyeong")).map((r) => r.firedConditions)).toEqual([
      ["exposed-first.bigyeop-table"], ["primary-only.bigyeop-table"], ["saryeong.unavailable"]
    ]);
  });
});
