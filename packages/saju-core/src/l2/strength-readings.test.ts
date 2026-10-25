import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import { strengthFactorsOf, type StrengthFactors } from "./strength-factors.js";
import { STRENGTH_RULE_SETS, strengthReadingsOf, type StrengthVerdict } from "./strength-readings.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_MD = resolve(HERE, "../../../../docs/rules/STRENGTH-READINGS.md");
const FACTORS_GOLDEN_MD = resolve(HERE, "../../../../docs/golden/GOLDEN-STRENGTH-FACTORS.md");
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
const verdicts = (factors: StrengthFactors): Record<string, StrengthVerdict> =>
  Object.fromEntries(strengthReadingsOf(factors).map((reading) => [reading.ruleSetId, reading.verdict]));

/** Minimal factors carrying only what 8b-1 reads; the rest is irrelevant to a reading. */
function synthetic(deukryeong: boolean, deukji: boolean, deukse: boolean, monthBranchClashed: boolean): StrengthFactors {
  const base = chart("g-1990-01-01-1030");
  return {
    ...base,
    deukryeong: { ...base.deukryeong, value: deukryeong },
    deukji: { ...base.deukji, value: deukji },
    deukse: { ...base.deukse, value: deukse },
    monthBranchClashed: { value: monthBranchClashed, with: monthBranchClashed ? [{ pillar: "time", id: "ja-o" }] : [] }
  };
}

describe("docs/rules/STRENGTH-READINGS.md ↔ strength-readings.ts", () => {
  it("표 2: every rule set, order, condition id, token and verdict equals STRENGTH_RULE_SETS", () => {
    const fromMd = section(markdown, "표 2").map((cell) => ({
      ruleSetId: cell("ruleSetId"),
      order: Number(cell("순서")),
      conditionId: cell("conditionId"),
      when: cell("조건"),
      verdict: cell("verdict")
    }));
    const fromCode = Object.entries(STRENGTH_RULE_SETS).flatMap(([ruleSetId, rules]) =>
      rules.map((rule, index) => ({ ruleSetId, order: index + 1, conditionId: rule.conditionId, when: rule.when, verdict: rule.verdict }))
    );
    expect(fromMd).toEqual(fromCode);
  });

  it("표 1 lists exactly the tokens the code evaluates; 표 3 names every rule set as unreviewed", () => {
    const tokens = section(markdown, "표 1").map((cell) => cell("토큰"));
    const used = new Set(Object.values(STRENGTH_RULE_SETS).flatMap((rules) => rules.map((rule) => rule.when as string)));
    expect(new Set(tokens)).toEqual(used);
    const sources = section(markdown, "표 3");
    expect(sources.map((cell) => cell("ruleSetId"))).toEqual(Object.keys(STRENGTH_RULE_SETS));
    expect(sources.every((cell) => cell("doctrine") === "unreviewed")).toBe(true);
  });

  it("every rule set ends in a total condition, so a reading always exists", () => {
    for (const rules of Object.values(STRENGTH_RULE_SETS)) {
      const last = rules[rules.length - 1];
      expect(["else", "triadCount<=1"]).toContain(last?.when);
    }
  });
});

describe("strengthReadingsOf — 합성 픽스처 16 (득령·득지·득세 8조합 × 월지충 2)", () => {
  // Hand-written from 표 2, not from the code: [득령, 득지, 득세, 월지충, triad, month-first].
  const CASES: Array<[boolean, boolean, boolean, boolean, StrengthVerdict, StrengthVerdict]> = [
    [true, true, true, false, "strong", "strong"],
    [true, true, false, false, "strong", "strong"],
    [true, false, true, false, "strong", "strong"],
    [true, false, false, false, "weak", "strong"],
    [false, true, true, false, "strong", "strong"],
    [false, true, false, false, "weak", "weak"],
    [false, false, true, false, "weak", "weak"],
    [false, false, false, false, "weak", "weak"],
    [true, true, true, true, "strong", "indeterminate"],
    [true, true, false, true, "strong", "indeterminate"],
    [true, false, true, true, "strong", "indeterminate"],
    [true, false, false, true, "weak", "indeterminate"],
    [false, true, true, true, "strong", "indeterminate"],
    [false, true, false, true, "weak", "indeterminate"],
    [false, false, true, true, "weak", "indeterminate"],
    [false, false, false, true, "weak", "indeterminate"]
  ];
  const flag = (value: boolean): string => (value ? "Y" : "N");
  for (const [ryeong, ji, se, clashed, triad, monthFirst] of CASES) {
    it(`${flag(ryeong)}${flag(ji)}${flag(se)} 충${flag(clashed)} → triad ${triad} · month-first ${monthFirst}`, () => {
      expect(verdicts(synthetic(ryeong, ji, se, clashed))).toEqual({ "strength.month-first": monthFirst, "strength.triad-majority": triad });
    });
  }
});

describe("strengthReadingsOf — 경계 · 실명식", () => {
  it("triadCount 1 ↔ 2 is the triad-majority boundary; the fired condition id names the row", () => {
    const one = strengthReadingsOf(synthetic(false, true, false, false)).find((r) => r.ruleSetId === "strength.triad-majority");
    const two = strengthReadingsOf(synthetic(false, true, true, false)).find((r) => r.ruleSetId === "strength.triad-majority");
    expect([one?.inputs.triadCount, one?.firedConditions]).toEqual([1, ["triad-majority.one-or-less"]]);
    expect([two?.inputs.triadCount, two?.firedConditions]).toEqual([2, ["triad-majority.two-or-more"]]);
  });

  it("month clash outranks every 得: all three true + 충 → month-first indeterminate via month-clashed", () => {
    const reading = strengthReadingsOf(synthetic(true, true, true, true)).find((r) => r.ruleSetId === "strength.month-first");
    expect(reading?.verdict).toBe("indeterminate");
    expect(reading?.firedConditions).toEqual(["month-first.month-clashed"]);
  });

  it("득세 동률(3:3 → 득세 참, `≥`)이 판독을 가른다: g-2024-02-04-1727 NYY → 둘 다 strong", () => {
    const factors = chart("g-2024-02-04-1727");
    expect([factors.deukse.support, factors.deukse.other, factors.deukse.value]).toEqual([3, 3, true]);
    expect(verdicts(factors)).toEqual({ "strength.month-first": "strong", "strength.triad-majority": "strong" });
  });

  it("세트 갈림: g-2013-05-22-0530 (득령만 참, 충 없음) → triad weak · month-first strong", () => {
    expect(verdicts(chart("g-2013-05-22-0530"))).toEqual({ "strength.month-first": "strong", "strength.triad-majority": "weak" });
  });

  it("월지충: g-2011-11-08-0925 (NYY, 巳亥충 @time) → triad strong · month-first indeterminate", () => {
    expect(verdicts(chart("g-2011-11-08-0925"))).toEqual({ "strength.month-first": "indeterminate", "strength.triad-majority": "strong" });
  });

  it("YYY g-2015-12-22-0030 · NNN g-2005-04-22-0130 (충 없음)", () => {
    expect(verdicts(chart("g-2015-12-22-0030"))).toEqual({ "strength.month-first": "strong", "strength.triad-majority": "strong" });
    expect(verdicts(chart("g-2005-04-22-0130"))).toEqual({ "strength.month-first": "weak", "strength.triad-majority": "weak" });
  });

  it("시각 미상 g-1972-03-14-xxxx: 판독은 계산하고 precision time-unknown을 복사한다", () => {
    const readings = strengthReadingsOf(chart("g-1972-03-14-xxxx"));
    expect(readings.map((r) => [r.verdict, r.precision])).toEqual([["strong", "time-unknown"], ["strong", "time-unknown"]]);
  });

  it("japyeong: school을 복사하고, 골든 50에서 판독이 바뀌는 행은 1행이다(md 「학파 차분」 표)", () => {
    const changed = loadGoldenPillarCases().filter((golden) => JSON.stringify(verdicts(chart(golden.id))) !== JSON.stringify(verdicts(chart(golden.id, "japyeong"))));
    expect(changed.map((golden) => golden.id)).toEqual(section(markdown, "학파 차분").map((cell) => cell("id")));
    expect(changed).toHaveLength(1);
    // 辛亥: yeonhae 亥 여기 戊 = 정인 → 득지 Y (YYN) / japyeong 亥 = 甲·壬 → 득지 N (YNN).
    expect(verdicts(chart("g-1923-10-05-0840", "japyeong"))).toEqual({ "strength.month-first": "strong", "strength.triad-majority": "weak" });
    expect(verdicts(chart("g-1923-10-05-0840"))).toEqual({ "strength.month-first": "strong", "strength.triad-majority": "strong" });
    expect(strengthReadingsOf(chart("g-1990-01-01-1030", "japyeong")).every((r) => r.school === "japyeong")).toBe(true);
  });

  it("shape: two readings in ruleSetId order, doctrine unreviewed, no score/rank field, fresh objects", () => {
    const readings = strengthReadingsOf(chart("g-1990-01-01-1030"));
    expect(readings.map((r) => r.ruleSetId)).toEqual(["strength.month-first", "strength.triad-majority"]);
    expect(readings.every((r) => r.doctrine === "unreviewed")).toBe(true);
    expect(JSON.stringify(readings)).not.toMatch(/"(score|rank|primary|weight)"/);
    (readings[0] as { inputs: { triadCount: number } }).inputs.triadCount = 99;
    expect(readings[1]?.inputs.triadCount).not.toBe(99);
  });
});

describe("골든 50 — 8a md 셀에서 유도한 판독 = 코어 (READINGS 골든 표는 8a confirmed 뒤, 설계 §5)", () => {
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
      return { id: cell("id"), ryeong: cell("득령").startsWith("Y"), ji: cell("득지").startsWith("Y"), se: cell("득세").startsWith("Y"), clashed: cell("월지충") !== "-" };
    });

  /** 표 2 applied by hand to md cells — the oracle never reads strength-readings.ts. */
  const expected = (row: (typeof rows)[number]): Record<string, StrengthVerdict> => {
    const count = [row.ryeong, row.ji, row.se].filter(Boolean).length;
    const monthFirst: StrengthVerdict = row.clashed ? "indeterminate" : row.ryeong || (row.ji && row.se) ? "strong" : "weak";
    return { "strength.month-first": monthFirst, "strength.triad-majority": count >= 2 ? "strong" : "weak" };
  };

  it("parses all 50 rows", () => {
    expect(rows).toHaveLength(50);
  });

  it("every row's core readings equal the md-derived expectation", () => {
    const mismatches = rows.filter((row) => JSON.stringify(verdicts(chart(row.id))) !== JSON.stringify(expected(row))).map((row) => row.id);
    expect(mismatches).toEqual([]);
  });

  it("분포 고정(설계 §3): triad 29/21/0 · month-first 29/12/9 · 갈림 10행", () => {
    const tally = (ruleSetId: string) => {
      const out = { strong: 0, weak: 0, indeterminate: 0 };
      for (const row of rows) out[verdicts(chart(row.id))[ruleSetId] as StrengthVerdict] += 1;
      return out;
    };
    expect(tally("strength.triad-majority")).toEqual({ strong: 29, weak: 21, indeterminate: 0 });
    expect(tally("strength.month-first")).toEqual({ strong: 29, weak: 12, indeterminate: 9 });
    const split = rows.filter((row) => new Set(Object.values(verdicts(chart(row.id)))).size > 1);
    expect(split).toHaveLength(10);
  });
});

describe("어휘 가드 — STRENGTH-READINGS.md 본문·코드에 금지어 0", () => {
  const FORBIDDEN = /추천|권장|최적|반드시|좋은 오행|나쁜 오행|채워야/;
  it("the rules body (outside 「쓰지 않는 말」) and the reading code carry none", () => {
    expect(markdown.split("## 쓰지 않는 말")[0]).not.toMatch(FORBIDDEN);
    expect(readFileSync(resolve(HERE, "strength-readings.ts"), "utf8")).not.toMatch(FORBIDDEN);
  });
});

describe("baby 공급 계약 — 8b는 include-only, 기본 응답은 바이트 동일 (완료 조건 5)", () => {
  const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "other" as const };

  it("the default response carries no strength key and its bytes are pinned", () => {
    const plain = buildSajuPillarsV1Response(base);
    expect(plain.ok).toBe(true);
    if (!plain.ok) return;
    const bytes = JSON.stringify(plain.data);
    expect(bytes).not.toMatch(/strength|yongsin|doctrine/i);
    expect(bytes).toMatchSnapshot();
  });

  it("strengthReadings is not an include block yet → INVALID_OPTIONS (opens in 9단계 with its gate)", () => {
    const asked = buildSajuPillarsV1Response({ ...base, options: { include: ["strengthReadings"] } as never });
    expect(asked.ok).toBe(false);
    if (!asked.ok) expect(asked.error.error.code).toBe("INVALID_OPTIONS");
  });
});
