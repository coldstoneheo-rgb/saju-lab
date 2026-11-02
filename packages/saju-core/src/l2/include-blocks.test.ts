import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as core from "../index.js";
import { goldenCase, loadGoldenPillarCases } from "../golden-pillars.load.js";
import type { GoldenPillarCase } from "../golden-pillars.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import { INCLUDE_BLOCKS } from "../types.js";
import { strengthFactorsOf } from "./strength-factors.js";

/**
 * 9단계 L2 include 블록 5종 공통 계약(CLOUD-2026-1103 §15 · docs/design/l2-include-design.md §1·§5).
 * I3 — 블록 이름 ↔ 응답 키는 설계서 §1 표와 1:1 · 레코드 키 집합 고정.
 * I7 — 블록의 코어 함수·타입이 index.ts 공개 면에 있다.
 * 어휘 — 블록 응답 JSON 전체(골든 명식 전부)에 길흉·추천 어휘 0.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const DESIGN = readFileSync(resolve(HERE, "../../../../docs/design/l2-include-design.md"), "utf8");

/** 설계서 §1 블록 표: include 이름 → 응답 키(셀의 첫 백틱 토큰). */
function designBlockTable(): Record<string, string> {
  const lines = DESIGN.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith("## 1. 블록 표"));
  if (start === -1) throw new Error("design §1 not found");
  const rows: Record<string, string> = {};
  let header: string[] | undefined;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    if (!line.trim().startsWith("|")) {
      if (header) break;
      continue;
    }
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    if (!header) {
      header = cells;
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) continue;
    const token = (cell: string | undefined) => /`([^`]+)`/.exec(cell ?? "")?.[1] ?? "";
    rows[token(cells[header.indexOf("include 이름")])] = token(cells[header.indexOf("응답 키")]);
  }
  return rows;
}

/** 5~7단계 명식 사실 블록(게이트 없음, 설계서 §1 표 밖). */
const UNGATED = ["hiddenStems", "tenGods", "interactions", "daeun"];
const L2_BLOCKS = ["strengthFactors", "strengthReadings", "yongsinCandidates", "gyeokguk", "sinsal"] as const;
type L2Block = (typeof L2_BLOCKS)[number];

const base = { birthDate: "1988-10-09", birthTime: "02:30", calendar: "solar" as const, sex: "other" as const };

function requestOf(golden: GoldenPillarCase, include: readonly string[]) {
  const input = golden.input;
  return {
    birthDate: input.birthDate,
    ...(input.birthTime ? { birthTime: input.birthTime } : { timeUnknown: true }),
    calendar: input.calendar ?? "solar",
    ...(input.isLeapMonth ? { isLeapMonth: true } : {}),
    sex: input.sex,
    ...(input.birthPlace ? { birthPlace: input.birthPlace } : {}),
    options: { ...(input.options ?? {}), include: [...include] }
  };
}

function dataOf(request: unknown): Record<string, unknown> {
  const result = buildSajuPillarsV1Response(request);
  if (!result.ok) throw new Error(`request failed: ${JSON.stringify(result.error)}`);
  return result.data as unknown as Record<string, unknown>;
}

describe("I3 — 블록 이름 ↔ 응답 키 = 설계서 §1 표(1:1)", () => {
  const table = designBlockTable();

  it("설계서 §1 표의 블록 = L2 판독 블록 5종, 응답 키 = 블록 이름", () => {
    expect(Object.keys(table)).toEqual([...L2_BLOCKS]);
    for (const [block, key] of Object.entries(table)) expect(key, block).toBe(block);
  });

  it("INCLUDE_BLOCKS = 5~7단계 4블록 ∪ 설계서 §1 표 5블록(빠진 것·남는 것 0)", () => {
    expect([...INCLUDE_BLOCKS].sort()).toEqual([...UNGATED, ...Object.keys(table)].sort());
  });

  it("블록마다: include [블록] → 기본 응답 키 그대로 + 설계서 응답 키 1개만(의존 블록 자동 포함 0)", () => {
    const plain = dataOf(base);
    for (const [block, key] of Object.entries(table)) {
      const asked = dataOf({ ...base, options: { include: [block] } });
      expect(Object.keys(asked).filter((name) => !(name in plain)), block).toEqual([key]);
      const { [key]: _block, ...rest } = asked;
      expect(rest, block).toEqual(plain);
    }
  });

  it("5블록 동시 요청 → 응답 키 5개, 기본 응답 키는 그대로", () => {
    const plain = dataOf(base);
    const asked = dataOf({ ...base, options: { include: [...L2_BLOCKS] } });
    expect(Object.keys(asked).filter((name) => !(name in plain)).sort()).toEqual([...L2_BLOCKS].sort());
  });
});

/** 레코드 키 집합 — 필수 키 + 선택 키(있을 때만). 바뀌면 계약 변경이다. */
const RECORD_KEYS: Record<L2Block, { required: string[]; optional: string[] }> = {
  strengthFactors: {
    required: [
      "school", "precision", "dayMaster", "monthBranch", "layers", "tenGodCounts", "elementCounts", "exposed", "roots",
      "deukryeong", "deukji", "deukse", "saryeong", "dayStemCombined", "monthBranchClashed", "dayBranchInteractions",
      "transformationMaterials", "climate"
    ],
    optional: ["saryeongUnavailable"]
  },
  strengthReadings: {
    required: ["ruleSetId", "verdict", "firedConditions", "inputs", "definitionIds", "school", "precision", "agreesAcrossSets", "doctrine"],
    optional: []
  },
  yongsinCandidates: { required: ["candidateId", "element", "method", "ruleId", "basis", "note", "doctrine"], optional: [] },
  gyeokguk: {
    required: ["ruleSetId", "candidates", "ambiguous", "firedConditions", "monthBranchClashed", "agreesAcrossSets", "school", "precision", "doctrine"],
    optional: ["unavailable"]
  },
  sinsal: { required: ["sinsalId", "variantId", "basis", "at", "precision", "doctrine"], optional: [] }
};

describe("I3 — 블록별 레코드 키 스키마(골든 명식 전부 · 두 학파)", () => {
  const cases = loadGoldenPillarCases();

  it("모든 레코드의 키 = 필수 ⊆ 키 ⊆ 필수 ∪ 선택", () => {
    const seen: Record<L2Block, number> = { strengthFactors: 0, strengthReadings: 0, yongsinCandidates: 0, gyeokguk: 0, sinsal: 0 };
    for (const golden of cases) {
      for (const school of ["yeonhae", "japyeong"] as const) {
        const request = requestOf(golden, L2_BLOCKS);
        const data = dataOf({ ...request, options: { ...request.options, hiddenStemSchool: school } });
        for (const block of L2_BLOCKS) {
          const value = data[block];
          const records = (Array.isArray(value) ? value : [value]) as Array<Record<string, unknown>>;
          const { required, optional } = RECORD_KEYS[block];
          for (const record of records) {
            const keys = Object.keys(record);
            for (const key of required) expect(keys, `${golden.id} ${school} ${block}`).toContain(key);
            for (const key of keys) expect([...required, ...optional], `${golden.id} ${school} ${block}.${key}`).toContain(key);
            seen[block] += 1;
          }
        }
      }
    }
    for (const block of L2_BLOCKS) expect(seen[block], block).toBeGreaterThan(0);
  });
});

describe("9단계 개방 — strengthFactors 블록", () => {
  it("include [\"strengthFactors\"] → data.strengthFactors = 코어 strengthFactorsOf 직접 호출(학파·시각 미상 반영)", () => {
    const golden = goldenCase("g-1988-10-09-0230");
    const asked = dataOf(requestOf(golden, ["strengthFactors"]));
    expect(asked.strengthFactors).toEqual(strengthFactorsOf(calculatePillars(golden.input), resolveBirthKst(golden.input), { school: "yeonhae" }));

    const japyeong = dataOf({ ...base, options: { include: ["strengthFactors"], hiddenStemSchool: "japyeong" } });
    expect((japyeong.strengthFactors as { school: string; saryeong: unknown }).school).toBe("japyeong");
    expect((japyeong.strengthFactors as { saryeongUnavailable?: string }).saryeongUnavailable).toBe("no-day-counts");

    const unknown = loadGoldenPillarCases().find((entry) => !entry.input.birthTime);
    expect(unknown).toBeDefined();
    const timeUnknown = dataOf(requestOf(unknown as GoldenPillarCase, ["strengthFactors"]));
    expect((timeUnknown.strengthFactors as { precision: string }).precision).toBe("time-unknown");
  });

  it("다른 L2 블록만 요청하면 strengthFactors 키는 싣지 않는다(의존 블록 자동 포함 0)", () => {
    const asked = dataOf({ ...base, options: { include: ["strengthReadings", "yongsinCandidates", "gyeokguk"] } });
    expect("strengthFactors" in asked).toBe(false);
  });
});

describe("어휘 가드 — L2 블록 응답 JSON 전체에 길흉·추천 어휘 0(골든 명식 전부 · 두 학파)", () => {
  const KOREAN = /추천|권장|최적|반드시|길하|흉하|길신|흉신|흉살|길흉|좋은|나쁜|조심|주의|성공|실패|행운|불운|대길|대흉/;
  const ENGLISH = /\b(good|bad|lucky|unlucky|auspicious|inauspicious|recommend\w*|best|worst|score|rank|grade|fortune|success|failure)\b/i;

  it("5블록 값의 JSON(키·값 전부)에 금지어 0", () => {
    for (const golden of loadGoldenPillarCases()) {
      for (const school of ["yeonhae", "japyeong"] as const) {
        const request = requestOf(golden, L2_BLOCKS);
        const data = dataOf({ ...request, options: { ...request.options, hiddenStemSchool: school } });
        for (const block of L2_BLOCKS) {
          const json = JSON.stringify(data[block]);
          expect(json, `${golden.id} ${school} ${block}`).not.toMatch(KOREAN);
          expect(json, `${golden.id} ${school} ${block}`).not.toMatch(ENGLISH);
        }
      }
    }
  });

  it("판정기 변이: 금지어 하나를 넣으면 잡는다", () => {
    expect(JSON.stringify({ note: "용신 추천" })).toMatch(KOREAN);
    expect(JSON.stringify({ luck: "good" })).toMatch(ENGLISH);
    expect(JSON.stringify({ recommended: true })).toMatch(ENGLISH);
  });
});

describe("I7 — L2 블록 코어 함수·타입·상수가 index.ts 공개 면에 있다", () => {
  it("블록마다 코어 함수 + 표 상수 export", () => {
    const exported = core as Record<string, unknown>;
    for (const name of [
      "strengthFactorsOf", "STRENGTH_DEFINITIONS",
      "strengthReadingsOf", "STRENGTH_RULE_SETS",
      "yongsinCandidatesOf", "EOKBU_RULES", "JOHU_RULES",
      "gyeokgukReadingsOf", "GYEOKGUK_RULE_SETS",
      "sinsalOf", "SINSAL_VARIANTS",
      "INCLUDE_BLOCKS"
    ]) {
      expect(exported[name], name).toBeDefined();
    }
    expect(typeof core.sinsalOf).toBe("function");
    expect(typeof core.strengthFactorsOf).toBe("function");
  });

  it("타입 export(컴파일 시 확인): StrengthFactors · StrengthReading · YongsinCandidate · GyeokgukReading · SinsalHit", () => {
    const data = dataOf({ ...base, options: { include: [...L2_BLOCKS] } });
    const factors = data.strengthFactors as core.StrengthFactors;
    const readings = data.strengthReadings as core.StrengthReading[];
    const candidates = data.yongsinCandidates as core.YongsinCandidate[];
    const gyeokguk = data.gyeokguk as core.GyeokgukReading[];
    const sinsal = data.sinsal as core.SinsalHit[];
    expect(factors.dayMaster).toBe("jeong");
    expect([readings.length, candidates.length > 0, gyeokguk.length, sinsal.length > 0]).toEqual([2, true, 3, true]);
  });
});
