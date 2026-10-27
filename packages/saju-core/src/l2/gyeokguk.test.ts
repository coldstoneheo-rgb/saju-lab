import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BRANCHES, type Branch, type Stem } from "../cycle.js";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import { hiddenStemList } from "./hidden-stems.data.js";
import type { PillarKey } from "./interactions.js";
import { strengthFactorsOf, type StrengthFactors } from "./strength-factors.js";
import { BIGYEOP_MONTH_TABLE, GYEOKGUK_RULE_SETS, gyeokgukReadingsOf, type GyeokgukReading } from "./gyeokguk.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_MD = resolve(HERE, "../../../../docs/rules/GEOKGUK.md");
const markdown = readFileSync(RULES_MD, "utf8");

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

const chart = (id: string, school?: "yeonhae" | "japyeong") => {
  const input = goldenCase(id).input;
  return strengthFactorsOf(calculatePillars(input), resolveBirthKst(input), school ? { school } : {});
};
/** `ruleSetId suffix → "gyeok/role,…"` or the unavailable reason; `!` marks ambiguous. */
const summary = (readings: GyeokgukReading[]): Record<string, string> =>
  Object.fromEntries(
    readings.map((r) => [
      r.ruleSetId.replace("gyeokguk.", ""),
      (r.candidates.map((c) => `${c.gyeok}/${c.role}`).join(",") || (r.unavailable as string)) + (r.ambiguous ? "!" : "")
    ])
  );
const of = (factors: StrengthFactors) => summary(gyeokgukReadingsOf(factors));

/**
 * Factors carrying only what 취격 reads: day master, month hidden stems (yeonhae), the
 * non-day stems and the 사령. Everything else comes from a real chart and is ignored.
 */
function synthetic(
  dayMaster: Stem,
  monthBranch: Branch,
  stems: Partial<Record<Exclude<PillarKey, "day">, Stem>>,
  saryeongRole: "residual" | "middle" | "primary" | null = "primary"
): StrengthFactors {
  const base = chart("g-1990-01-01-1030");
  const month = hiddenStemList(monthBranch, "yeonhae");
  const holder = month.find((entry) => entry.role === saryeongRole);
  const { saryeongUnavailable: _ignored, ...rest } = base;
  return {
    ...rest,
    dayMaster,
    monthBranch,
    layers: {
      ...base.layers,
      stems: (Object.entries(stems) as Array<[PillarKey, Stem]>).map(([pillar, stem]) => ({ pillar, stem })),
      hiddenStems: [
        ...base.layers.hiddenStems.filter((entry) => entry.pillar !== "month"),
        ...month.map((entry) => ({ pillar: "month" as const, role: entry.role, stem: entry.stem, days: entry.days }))
      ]
    },
    ...(holder && base.saryeong
      ? { saryeong: { ...base.saryeong, stem: holder.stem, role: holder.role } }
      : { saryeong: null, saryeongUnavailable: "month-term-mismatch" as const })
  };
}

describe("docs/rules/GEOKGUK.md ↔ gyeokguk.ts", () => {
  it("표 1: 월지 비겁 표 = BIGYEOP_MONTH_TABLE (행·순서)", () => {
    const fromMd = section(markdown, "표 1").map((cell) => ({ gyeok: cell("격"), dayMaster: cell("일간"), monthBranch: cell("월지") }));
    expect(fromMd).toEqual(BIGYEOP_MONTH_TABLE.map((row) => ({ ...row })));
  });

  it("표 4: every rule set, order, condition id, token and outcome equals GYEOKGUK_RULE_SETS", () => {
    const fromMd = section(markdown, "표 4").map((cell) => ({
      ruleSetId: cell("ruleSetId"),
      order: Number(cell("순서")),
      conditionId: cell("conditionId"),
      when: cell("조건"),
      then: cell("결과")
    }));
    const fromCode = Object.entries(GYEOKGUK_RULE_SETS).flatMap(([ruleSetId, rules]) =>
      rules.map((rule, index) => ({ ruleSetId, order: index + 1, conditionId: rule.conditionId, when: rule.when, then: rule.then }))
    );
    expect(fromMd).toEqual(fromCode);
  });

  it("표 2·3 list exactly the condition and outcome tokens the code uses; 표 5 names every set as unreviewed; every set ends in else", () => {
    const rules = Object.values(GYEOKGUK_RULE_SETS).flat();
    expect(new Set(section(markdown, "표 2").map((cell) => cell("토큰")))).toEqual(new Set(rules.map((rule) => rule.when as string)));
    expect(new Set(section(markdown, "표 3").map((cell) => cell("토큰")))).toEqual(new Set(rules.map((rule) => rule.then as string)));
    const sources = section(markdown, "표 5");
    expect(sources.map((cell) => cell("ruleSetId"))).toEqual(Object.keys(GYEOKGUK_RULE_SETS));
    expect(sources.every((cell) => cell("doctrine") === "unreviewed")).toBe(true);
    for (const set of Object.values(GYEOKGUK_RULE_SETS)) expect(set[set.length - 1]?.when).toBe("else");
  });

  it("월지 되찾기: 12지의 장간 목록은 학파마다 서로 다르다(되찾기가 유일하다)", () => {
    for (const school of ["yeonhae", "japyeong"] as const) {
      const keys = BRANCHES.map((branch) => hiddenStemList(branch, school).map((entry) => `${entry.role}:${entry.stem}`).join(","));
      expect(new Set(keys).size).toBe(12);
    }
  });

  it("표 1 = 손으로 쓴 록·양인·월겁(설계 §2): 록 10 · 양인 양간 5 · 월겁 음간 4, 고지 월지 0", () => {
    const by = (gyeok: string) => BIGYEOP_MONTH_TABLE.filter((row) => row.gyeok === gyeok).map((row) => `${row.dayMaster}.${row.monthBranch}`);
    expect(by("geonrok")).toEqual(["gap.in", "eul.myo", "byeong.sa", "jeong.o", "mu.sa", "gi.o", "gyeong.sin", "sin.yu", "im.hae", "gye.ja"]);
    expect(by("yangin")).toEqual(["gap.myo", "byeong.o", "mu.o", "gyeong.yu", "im.ja"]);
    expect(by("wolgeop")).toEqual(["eul.in", "jeong.sa", "sin.sin", "gye.hae"]);
    expect(BIGYEOP_MONTH_TABLE.some((row) => ["jin", "sul", "chuk", "mi"].includes(row.monthBranch))).toBe(false);
  });
});

describe("K4 경계 — 투출 다중 ambiguous", () => {
  it("g-1927-08-20-0915 丙 申월: 정기 庚 미투출, 중기 壬(시간)·여기 戊(월간) 투출 → 투출 우선 둘 다 + ambiguous", () => {
    expect(of(chart("g-1927-08-20-0915"))).toEqual({ "exposed-first": "pyeongwan/middle,siksin/residual!", "primary-only": "pyeonjae/primary", saryeong: "pyeongwan/middle" });
    expect(gyeokgukReadingsOf(chart("g-1927-08-20-0915"))[0]?.candidates.map((c) => c.exposedIn)).toEqual([["time"], ["month"]]);
  });

  it("합성 甲 巳월(戊·庚·丙): 戊·庚 투출, 丙 미투출 → 편관/중기 · 편재/여기 ambiguous", () => {
    expect(of(synthetic("gap", "sa", { year: "mu", month: "gyeong", time: "gap" }))["exposed-first"]).toBe("pyeongwan/middle,pyeonjae/residual!");
  });

  it("합성 甲 巳월: 정기 丙이 투출하면 중기·여기 투출과 무관하게 정기 하나(ambiguous 아님)", () => {
    expect(of(synthetic("gap", "sa", { year: "mu", month: "gyeong", time: "byeong" }))["exposed-first"]).toBe("siksin/primary");
  });

  it("합성 甲 巳월: 여기 戊 하나만 투출 → 편재/여기, ambiguous 아님", () => {
    expect(of(synthetic("gap", "sa", { year: "mu" }))["exposed-first"]).toBe("pyeonjae/residual");
  });
});

describe("K4 경계 — 건록 · 양인 · 월겁", () => {
  it("건록 실명식: g-1943-03-18-1320 乙 卯월 · g-1952-11-12-0510 壬 亥월 → 세 세트 모두 geonrok", () => {
    const all = { "exposed-first": "geonrok/primary", "primary-only": "geonrok/primary", saryeong: "geonrok/primary" };
    expect(of(chart("g-1943-03-18-1320"))).toEqual(all);
    expect(of(chart("g-1952-11-12-0510"))).toEqual(all);
  });

  it("양인 실명식: g-2015-12-22-0030 壬 子월 · g-2017-09-30-1305 庚 酉월 → yangin", () => {
    expect(of(chart("g-2015-12-22-0030"))["primary-only"]).toBe("yangin/primary");
    expect(of(chart("g-2017-09-30-1305"))["exposed-first"]).toBe("yangin/primary");
  });

  it("월겁(음간) 합성 4: 乙寅 · 丁巳 · 辛申 · 癸亥 → wolgeop; 음간 양인은 없다", () => {
    const all = { "exposed-first": "wolgeop/primary", "primary-only": "wolgeop/primary", saryeong: "wolgeop/primary" };
    for (const [day, branch] of [["eul", "in"], ["jeong", "sa"], ["sin", "sin"], ["gye", "hae"]] as Array<[Stem, Branch]>) {
      expect(of(synthetic(day, branch, {}))).toEqual(all);
    }
    // 乙 卯월은 록(양인 아님) — 음간 양인 미채택.
    expect(of(synthetic("eul", "myo", {}))["primary-only"]).toBe("geonrok/primary");
  });
});

describe("K4 경계 — 戊·己 일간의 록·양인(정기 십신이 아니라 표)", () => {
  it("g-2013-05-22-0530 戊 巳월 → geonrok (巳 정기 丙은 편인)", () => {
    expect(of(chart("g-2013-05-22-0530"))).toEqual({ "exposed-first": "geonrok/primary", "primary-only": "geonrok/primary", saryeong: "geonrok/primary" });
    expect(gyeokgukReadingsOf(chart("g-2013-05-22-0530"))[0]?.candidates[0]?.stem).toBe("byeong");
  });

  it("g-1971-07-02-1400 戊 午월 → yangin (午 정기 丁은 정인)", () => {
    expect(of(chart("g-1971-07-02-1400"))["primary-only"]).toBe("yangin/primary");
  });

  it("g-1929-06-13-1730 己 午월 → geonrok · g-1987-05-10-0230 己 巳월 → 표 밖이라 정인(巳 정기 丙)", () => {
    expect(of(chart("g-1929-06-13-1730"))["primary-only"]).toBe("geonrok/primary");
    expect(of(chart("g-1987-05-10-0230"))["primary-only"]).toBe("jeongin/primary");
  });
});

describe("K4 경계 — 토 일간 고지 월지(정기 비겁, 표 밖)", () => {
  it("g-1953-04-27-1610 戊 辰월: 중기 癸 투출 → 투출 우선 잡기 정재 · 정기 고정 bigyeop-month · 사령(戊) bigyeop-month", () => {
    expect(of(chart("g-1953-04-27-1610"))).toEqual({ "exposed-first": "jeongjae/middle", "primary-only": "bigyeop-month", saryeong: "bigyeop-month" });
  });

  it("g-2022-01-25-0350 戊 丑월: 중기 辛 투출 → 투출 우선 상관/중기", () => {
    expect(of(chart("g-2022-01-25-0350"))["exposed-first"]).toBe("sanggwan/middle");
  });

  it("합성 己 戌·辰월, 투출 없음 → bigyeop-month (己 辰·戌은 월겁 아님)", () => {
    expect(of(synthetic("gi", "sul", { year: "gap" }))).toEqual({ "exposed-first": "bigyeop-month", "primary-only": "bigyeop-month", saryeong: "bigyeop-month" });
    expect(of(synthetic("gi", "jin", {}))["primary-only"]).toBe("bigyeop-month");
  });

  it("합성 己 未월: 여기 丁·중기 乙 둘 다 투출 → 잡기 ambiguous", () => {
    expect(of(synthetic("gi", "mi", { year: "jeong", time: "eul" }))["exposed-first"]).toBe("pyeongwan/middle,pyeonin/residual!");
  });
});

describe("K4 경계 — 사령 세트 unavailable · 비겁", () => {
  it("japyeong: 골든 50 전부 사령 세트 no-day-counts (록 명식도 1행이 먼저)", () => {
    const rows = loadGoldenPillarCases().map((golden) => gyeokgukReadingsOf(chart(golden.id, "japyeong"))[2]);
    expect(rows.every((r) => r?.unavailable === "no-day-counts" && r.candidates.length === 0)).toBe(true);
    expect(of(chart("g-1943-03-18-1320", "japyeong")).saryeong).toBe("no-day-counts");
  });

  it("8a month-term-mismatch는 그대로 옮긴다(합성)", () => {
    expect(of(synthetic("gap", "sa", {}, null)).saryeong).toBe("month-term-mismatch");
  });

  it("사령 천간이 비겁: g-2024-02-04-1727 戊 寅월 사령 戊 · g-1986-07-12-1530 丁 未월 사령 丁 → bigyeop-month", () => {
    expect(of(chart("g-2024-02-04-1727")).saryeong).toBe("bigyeop-month");
    expect(of(chart("g-1986-07-12-1530"))).toEqual({ "exposed-first": "pyeonin/middle", "primary-only": "siksin/primary", saryeong: "bigyeop-month" });
  });

  it("사령 경계(nearThreshold) 명식에서 사령 세트와 투출 세트가 갈린다: g-1983-06-25-1525 · g-1946-05-19-2359", () => {
    expect(chart("g-1983-06-25-1525").saryeong?.nearThreshold).toBe(true);
    expect(of(chart("g-1983-06-25-1525"))).toEqual({ "exposed-first": "sanggwan/primary", "primary-only": "sanggwan/primary", saryeong: "jeongjae/middle" });
    expect(of(chart("g-1946-05-19-2359"))).toEqual({ "exposed-first": "jeongjae/primary", "primary-only": "jeongjae/primary", saryeong: "jeongin/middle" });
  });
});

describe("K4 경계 — 시각 미상 · 일간 투출 제외 · 비겁 장간", () => {
  it("시각 미상 3행: precision time-unknown 복사, 시간 투출 0", () => {
    for (const id of ["g-1999-08-23-xxxx", "g-1972-03-14-xxxx", "g-1933-11-17-xxxx"]) {
      const readings = gyeokgukReadingsOf(chart(id));
      expect(readings.every((r) => r.precision === "time-unknown")).toBe(true);
      expect(readings.flatMap((r) => r.candidates.flatMap((c) => c.exposedIn))).not.toContain("time");
    }
    expect(of(chart("g-1999-08-23-xxxx"))).toEqual({ "exposed-first": "jeonggwan/middle", "primary-only": "jeongjae/primary", saryeong: "jeongjae/primary" });
  });

  it("합성: 시간 천간이 없어지면 격이 바뀐다 — 甲 申월(戊·壬·庚) 시간 壬 투출 → 편인/중기, 시간 없으면 편관/정기", () => {
    expect(of(synthetic("gap", "sin", { year: "eul", time: "im" }))["exposed-first"]).toBe("pyeonin/middle");
    expect(of(synthetic("gap", "sin", { year: "eul" }))["exposed-first"]).toBe("pyeongwan/primary");
  });

  it("일간은 투출 위치가 아니다: 골든 50 어느 후보의 exposedIn에도 day가 없다", () => {
    const all = loadGoldenPillarCases().flatMap((golden) => gyeokgukReadingsOf(chart(golden.id)).flatMap((r) => r.candidates));
    expect(all.some((c) => c.exposedIn.includes("day"))).toBe(false);
  });

  it("비겁 중기는 투출해도 후보가 아니다(합성 甲 亥월: 중기 甲 투출, 戊·壬 미투출 → 편인/정기)", () => {
    expect(of(synthetic("gap", "hae", { year: "gap" }))["exposed-first"]).toBe("pyeonin/primary");
  });
});

describe("세트 간 일치 · 모양", () => {
  it("agreesAcrossSets: 같으면 true · 갈리면 false · unavailable 세트는 비교에서 뺀다", () => {
    expect(gyeokgukReadingsOf(chart("g-1990-01-01-1030")).map((r) => r.agreesAcrossSets)).toEqual([true, true, true]);
    expect(gyeokgukReadingsOf(chart("g-1927-08-20-0915")).map((r) => r.agreesAcrossSets)).toEqual([false, false, false]);
    // 戊 辰월: 정기 고정·사령이 unavailable → 투출 우선 1개만 비교 → true.
    expect(gyeokgukReadingsOf(chart("g-1953-04-27-1610")).map((r) => r.agreesAcrossSets)).toEqual([true, true, true]);
  });

  it("키 집합 고정 · 세 세트 ruleSetId 순 · doctrine unreviewed · 점수/성패 필드 없음 · monthBranchClashed 복사", () => {
    const readings = gyeokgukReadingsOf(chart("g-2011-11-08-0925"));
    expect(readings.map((r) => r.ruleSetId)).toEqual(["gyeokguk.exposed-first", "gyeokguk.primary-only", "gyeokguk.saryeong"]);
    for (const reading of readings) {
      expect(Object.keys(reading).filter((key) => key !== "unavailable").sort()).toEqual([
        "agreesAcrossSets", "ambiguous", "candidates", "doctrine", "firedConditions", "monthBranchClashed", "precision", "ruleSetId", "school"
      ]);
      expect(reading.doctrine).toBe("unreviewed");
      expect(reading.monthBranchClashed).toBe(true);
    }
    expect(JSON.stringify(readings)).not.toMatch(/"(score|rank|weight|success|broken|sangsin)"/);
  });
});

describe("어휘 가드 — GEOKGUK.md 본문·코드에 금지어 0", () => {
  it("the rules body (outside 「쓰지 않는 말」) and the code carry none", () => {
    expect(markdown.split("## 쓰지 않는 말")[0]).not.toMatch(/추천|권장|최적|반드시|귀격|천격|좋은 격|나쁜 격/);
    expect(readFileSync(resolve(HERE, "gyeokguk.ts"), "utf8")).not.toMatch(/추천|권장|최적|반드시|귀격|천격|좋은 격|나쁜 격|성격|파격/);
  });
});

describe("baby 공급 계약 — 격국도 include-only (완료 조건 4)", () => {
  const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "other" as const };

  it("gyeokguk is not an include block yet → INVALID_OPTIONS; the default response carries no gyeok key", () => {
    const asked = buildSajuPillarsV1Response({ ...base, options: { include: ["gyeokguk"] } as never });
    expect(asked.ok).toBe(false);
    if (!asked.ok) expect(asked.error.error.code).toBe("INVALID_OPTIONS");
    const plain = buildSajuPillarsV1Response(base);
    expect(plain.ok && JSON.stringify(plain.data)).not.toMatch(/gyeok|geonrok|yangin/i);
  });
});
