import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Stem } from "../cycle.js";
import { goldenCase } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import type { FiveElement } from "../types.js";
import { strengthFactorsOf, type Season, type StrengthFactors } from "./strength-factors.js";
import { strengthReadingsOf, type StrengthVerdict } from "./strength-readings.js";
import { EOKBU_RULES, JOHU_RULES, yongsinCandidatesOf } from "./yongsin-candidates.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_MD = resolve(HERE, "../../../../docs/rules/YONGSIN-CANDIDATES.md");
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
const candidatesOf = (factors: StrengthFactors) => yongsinCandidatesOf(factors, strengthReadingsOf(factors));
const ids = (factors: StrengthFactors): string[] => candidatesOf(factors).map((candidate) => candidate.candidateId);

/** Only `dayMaster` and `climate.season` are read from the factors. */
function synthetic(dayMaster: Stem, season: Season): StrengthFactors {
  const base = chart("g-1990-01-01-1030");
  return { ...base, dayMaster, climate: { ...base.climate, season } };
}

describe("docs/rules/YONGSIN-CANDIDATES.md ↔ yongsin-candidates.ts", () => {
  it("표 1: every 억부 rule id, verdict and step equals EOKBU_RULES (- = no candidate)", () => {
    const fromMd = section(markdown, "표 1").map((cell) => ({
      ruleId: cell("ruleId"),
      verdict: cell("verdict"),
      step: cell("step") === "-" ? null : Number(cell("step"))
    }));
    expect(fromMd).toEqual(EOKBU_RULES.map((rule) => ({ ...rule })));
  });

  it("표 2: every 조후 rule id, season and element equals JOHU_RULES (- = no candidate)", () => {
    const fromMd = section(markdown, "표 2").map((cell) => ({
      ruleId: cell("ruleId"),
      season: cell("계절"),
      element: cell("오행") === "-" ? null : cell("오행")
    }));
    expect(fromMd).toEqual(JOHU_RULES.map((rule) => ({ ...rule })));
  });

  it("표 1 covers every verdict, 표 2 every season; 표 3 names both methods as unreviewed", () => {
    expect(new Set(EOKBU_RULES.map((rule) => rule.verdict))).toEqual(new Set(["strong", "weak", "indeterminate"]));
    expect(new Set(JOHU_RULES.map((rule) => rule.season))).toEqual(new Set(["spring", "summer", "autumn", "winter"]));
    const methods = section(markdown, "표 3");
    expect(methods.map((cell) => cell("method"))).toEqual(["eokbu", "johu"]);
    expect(methods.every((cell) => cell("doctrine") === "unreviewed")).toBe(true);
  });
});

describe("억부 — 합성 픽스처 30 (일간 10 × verdict 3, 판독 1건)", () => {
  // Hand-written, not from the code: [비겁, 식상, 재성, 관성, 인성] per day-master element.
  const RELATIONS: Record<FiveElement, [FiveElement, FiveElement, FiveElement, FiveElement, FiveElement]> = {
    wood: ["wood", "fire", "earth", "metal", "water"],
    fire: ["fire", "earth", "metal", "water", "wood"],
    earth: ["earth", "metal", "water", "wood", "fire"],
    metal: ["metal", "water", "wood", "fire", "earth"],
    water: ["water", "wood", "fire", "earth", "metal"]
  };
  const STEMS: Array<[Stem, FiveElement]> = [
    ["gap", "wood"], ["eul", "wood"], ["byeong", "fire"], ["jeong", "fire"], ["mu", "earth"],
    ["gi", "earth"], ["gyeong", "metal"], ["sin", "metal"], ["im", "water"], ["gye", "water"]
  ];
  for (const [stem, element] of STEMS) {
    const [bigyeop, siksang, jaeseong, gwanseong, inseong] = RELATIONS[element];
    // 봄 = 조후 후보 0, so only 억부 candidates come back.
    const run = (verdict: StrengthVerdict) =>
      yongsinCandidatesOf(synthetic(stem, "spring"), [{ ruleSetId: "strength.triad-majority", verdict }]).map((c) => [c.ruleId, c.element]);
    it(`${stem}(${element}) strong → 관성 ${gwanseong} · 재성 ${jaeseong} · 식상 ${siksang}`, () => {
      expect(run("strong")).toEqual([["strong.gwanseong", gwanseong], ["strong.jaeseong", jaeseong], ["strong.siksang", siksang]]);
    });
    it(`${stem}(${element}) weak → 비겁 ${bigyeop} · 인성 ${inseong}`, () => {
      expect(run("weak")).toEqual([["weak.bigyeop", bigyeop], ["weak.inseong", inseong]]);
    });
    it(`${stem}(${element}) indeterminate → 후보 0`, () => {
      expect(run("indeterminate")).toEqual([]);
    });
  }
});

describe("조후 — 합성 픽스처 4 (계절, 판독과 무관)", () => {
  const CASES: Array<[Season, string[]]> = [
    ["winter", ["johu.winter.fire"]],
    ["summer", ["johu.summer.water"]],
    ["spring", []],
    ["autumn", []]
  ];
  for (const [season, expected] of CASES) {
    it(`${season} → ${expected.join(",") || "후보 0"} (판독 0건이어도 같다)`, () => {
      expect(yongsinCandidatesOf(synthetic("gap", season), []).map((c) => c.candidateId)).toEqual(expected);
      const withReading = yongsinCandidatesOf(synthetic("gap", season), [{ ruleSetId: "strength.month-first", verdict: "indeterminate" }]);
      expect(withReading.map((c) => c.candidateId)).toEqual(expected);
    });
  }
});

describe("실명식 · 학파 병기", () => {
  it("세트 갈림 g-2013-05-22-0530 (戊, 여름; triad weak · month-first strong) → 묶음 2개 + 조후 水", () => {
    expect(ids(chart("g-2013-05-22-0530"))).toEqual([
      "eokbu.strong.gwanseong.wood@strength.month-first",
      "eokbu.strong.jaeseong.water@strength.month-first",
      "eokbu.strong.siksang.metal@strength.month-first",
      "eokbu.weak.bigyeop.earth@strength.triad-majority",
      "eokbu.weak.inseong.fire@strength.triad-majority",
      "johu.summer.water"
    ]);
  });

  it("같은 오행도 합치지 않는다: g-1923-10-05-0840 (辛, 가을; 두 세트 strong) → 억부 6건, 조후 0", () => {
    expect(ids(chart("g-1923-10-05-0840"))).toEqual([
      "eokbu.strong.gwanseong.fire@strength.month-first",
      "eokbu.strong.gwanseong.fire@strength.triad-majority",
      "eokbu.strong.jaeseong.wood@strength.month-first",
      "eokbu.strong.jaeseong.wood@strength.triad-majority",
      "eokbu.strong.siksang.water@strength.month-first",
      "eokbu.strong.siksang.water@strength.triad-majority"
    ]);
  });

  it("지장간 학파 japyeong: g-1923-10-05-0840 triad가 weak로 바뀌어 후보가 바뀐다(STRENGTH-READINGS 「학파 차분」)", () => {
    expect(ids(chart("g-1923-10-05-0840", "japyeong"))).toEqual([
      "eokbu.strong.gwanseong.fire@strength.month-first",
      "eokbu.strong.jaeseong.wood@strength.month-first",
      "eokbu.strong.siksang.water@strength.month-first",
      "eokbu.weak.bigyeop.metal@strength.triad-majority",
      "eokbu.weak.inseong.earth@strength.triad-majority"
    ]);
  });

  it("월지충 g-2011-11-08-0925 (丁, 겨울; month-first indeterminate) → 그 세트 묶음 0 · triad 묶음 3 · 조후 火", () => {
    const candidates = candidatesOf(chart("g-2011-11-08-0925"));
    expect(candidates.map((c) => c.candidateId)).toEqual([
      "eokbu.strong.gwanseong.water@strength.triad-majority",
      "eokbu.strong.jaeseong.metal@strength.triad-majority",
      "eokbu.strong.siksang.earth@strength.triad-majority",
      "johu.winter.fire"
    ]);
    expect(candidates.some((c) => c.basis.readingRef?.ruleSetId === "strength.month-first")).toBe(false);
  });

  it("시각 미상 g-1972-03-14-xxxx (甲, 봄; 두 세트 strong) → 억부 6건, 조후 0", () => {
    expect(ids(chart("g-1972-03-14-xxxx"))).toHaveLength(6);
  });

  it("8b-2는 판독의 ruleSetId·verdict만 읽는다: 다른 필드를 지워도 결과가 같다", () => {
    const factors = chart("g-2013-05-22-0530");
    const slim = strengthReadingsOf(factors).map(({ ruleSetId, verdict }) => ({ ruleSetId, verdict }));
    expect(yongsinCandidatesOf(factors, slim)).toEqual(candidatesOf(factors));
  });
});

describe("레코드 모양", () => {
  const candidates = candidatesOf(chart("g-2013-05-22-0530"));

  it("키 집합 고정 · doctrine unreviewed · 점수/순위/선택 필드 없음 · candidateId 유일", () => {
    for (const candidate of candidates) {
      expect(Object.keys(candidate).sort()).toEqual(["basis", "candidateId", "doctrine", "element", "method", "note", "ruleId"]);
      expect(candidate.doctrine).toBe("unreviewed");
    }
    expect(JSON.stringify(candidates)).not.toMatch(/"(score|rank|primary|weight|selected|chosen)"/);
    expect(new Set(candidates.map((c) => c.candidateId)).size).toBe(candidates.length);
  });

  it("basis: 억부 = readingRef + dayMaster · 조후 = climate.season만", () => {
    const eokbu = candidates.find((c) => c.method === "eokbu");
    const johu = candidates.find((c) => c.method === "johu");
    expect(eokbu?.basis).toEqual({ readingRef: { ruleSetId: "strength.month-first", verdict: "strong" }, factorRefs: ["dayMaster"] });
    expect(johu?.basis).toEqual({ factorRefs: ["climate.season"] });
  });
});

describe("골든 50 — 8a md 셀(일간·득령·득지·득세·월지충·조후)에서 유도한 후보 = 코어", () => {
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
      return {
        id: cell("id"),
        dayMaster: cell("일간") as Stem,
        ryeong: cell("득령").startsWith("Y"),
        ji: cell("득지").startsWith("Y"),
        se: cell("득세").startsWith("Y"),
        clashed: cell("월지충") !== "-",
        season: cell("조후").split(" ")[0] as Season
      };
    });

  // The oracle never reads yongsin-candidates.ts or strength-readings.ts: 표 2 of both rule docs applied by hand.
  const ELEMENT: Record<Stem, FiveElement> = {
    gap: "wood", eul: "wood", byeong: "fire", jeong: "fire", mu: "earth", gi: "earth", gyeong: "metal", sin: "metal", im: "water", gye: "water"
  };
  const CYCLE: FiveElement[] = ["wood", "fire", "earth", "metal", "water"];
  const at = (element: FiveElement, step: number) => CYCLE[(CYCLE.indexOf(element) + step) % 5] as FiveElement;
  const expected = (row: (typeof rows)[number]): string[] => {
    const count = [row.ryeong, row.ji, row.se].filter(Boolean).length;
    const verdicts: Array<[string, StrengthVerdict]> = [
      ["strength.month-first", row.clashed ? "indeterminate" : row.ryeong || (row.ji && row.se) ? "strong" : "weak"],
      ["strength.triad-majority", count >= 2 ? "strong" : "weak"]
    ];
    const me = ELEMENT[row.dayMaster];
    const out: string[] = [];
    for (const [set, verdict] of verdicts) {
      if (verdict === "strong") out.push(`eokbu.strong.gwanseong.${at(me, 3)}@${set}`, `eokbu.strong.jaeseong.${at(me, 2)}@${set}`, `eokbu.strong.siksang.${at(me, 1)}@${set}`);
      if (verdict === "weak") out.push(`eokbu.weak.bigyeop.${me}@${set}`, `eokbu.weak.inseong.${at(me, 4)}@${set}`);
    }
    if (row.season === "winter") out.push("johu.winter.fire");
    if (row.season === "summer") out.push("johu.summer.water");
    return out.sort();
  };

  it("parses all 50 rows", () => {
    expect(rows).toHaveLength(50);
  });

  it("every row's candidate id set equals the md-derived expectation", () => {
    const mismatches = rows.filter((row) => JSON.stringify([...ids(chart(row.id))].sort()) !== JSON.stringify(expected(row))).map((row) => row.id);
    expect(mismatches).toEqual([]);
  });

  it("분포 고정: 후보 총수 · 방법별 · 조후 계절별", () => {
    const all = rows.flatMap((row) => candidatesOf(chart(row.id)));
    const tally = (pick: (c: (typeof all)[number]) => string) =>
      all.reduce<Record<string, number>>((acc, c) => ({ ...acc, [pick(c)]: (acc[pick(c)] ?? 0) + 1 }), {});
    const seasons = rows.reduce<Record<string, number>>((acc, row) => ({ ...acc, [row.season]: (acc[row.season] ?? 0) + 1 }), {});
    // 억부: strong 판독 58건 × 3 + weak 33건 × 2 = 240 (판독 분포 triad 29/21/0 · month-first 29/12/9).
    expect(tally((c) => c.method)).toEqual({ eokbu: 240, johu: (seasons.winter ?? 0) + (seasons.summer ?? 0) });
    expect(tally((c) => (c.method === "johu" ? c.ruleId : "eokbu"))).toEqual({ eokbu: 240, winter: seasons.winter, summer: seasons.summer });
    expect(seasons).toEqual({ spring: 12, summer: 14, autumn: 11, winter: 13 });
    expect(all).toHaveLength(267);
  });
});

describe("어휘 가드 — YONGSIN-CANDIDATES.md 본문·코드에 금지어 0", () => {
  const FORBIDDEN = /추천|권장|최적|반드시|좋은 오행|나쁜 오행|채워야/;
  it("the rules body (outside 「쓰지 않는 말」) and the candidate code carry none", () => {
    expect(markdown.split("## 쓰지 않는 말")[0]).not.toMatch(FORBIDDEN);
    expect(readFileSync(resolve(HERE, "yongsin-candidates.ts"), "utf8")).not.toMatch(FORBIDDEN);
  });
});

describe("baby 공급 계약 — 8b-2도 include-only (완료 조건 4)", () => {
  const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "other" as const };

  it("yongsinCandidates is not an include block yet → INVALID_OPTIONS; the default response carries no yongsin key", () => {
    const asked = buildSajuPillarsV1Response({ ...base, options: { include: ["yongsinCandidates"] } as never });
    expect(asked.ok).toBe(false);
    if (!asked.ok) expect(asked.error.error.code).toBe("INVALID_OPTIONS");
    const plain = buildSajuPillarsV1Response(base);
    expect(plain.ok && JSON.stringify(plain.data)).not.toMatch(/yongsin|eokbu|johu/i);
  });
});
