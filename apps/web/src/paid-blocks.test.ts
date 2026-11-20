import { describe, expect, it } from "vitest";
import {
  calculatePillars,
  generatePaidReportV1,
  gyeokgukReadingsOf,
  resolveBirthKst,
  strengthFactorsOf,
  strengthReadingsOf,
  yongsinCandidatesOf,
  type BirthInput,
  type PaidReportV1
} from "@saju-lab/saju-core";
import { loadGoldenPillarCases } from "../../../packages/saju-core/src/golden-pillars.load.js";
import { buildPaidReportHtml } from "./export-html.js";
import {
  GYEOK_KO,
  GYEOKGUK_SET_KO,
  PAID_BLOCKS_NOTE,
  PAID_BLOCKS_TIME_UNKNOWN_NOTE,
  paidBlocksViewOf,
  STRENGTH_SET_KO,
  VERDICT_KO,
  YONGSIN_EMPTY
} from "./paid-blocks.js";

// 유료 3블록(HO-2026-1120) — 화면·HTML에 나간 값 = 코어 함수 결과(완료 조건 3).

const goldens = loadGoldenPillarCases();
const paidOf = (input: BirthInput): PaidReportV1 =>
  generatePaidReportV1({ input, pillars: calculatePillars(input), generatedAt: "2026-11-20T00:00:00.000Z" });

/** 코어 함수를 화면 경로와 독립으로 직접 부른 기대값. */
function coreOf(input: BirthInput) {
  const factors = strengthFactorsOf(calculatePillars(input), resolveBirthKst(input));
  const strengthReadings = strengthReadingsOf(factors);
  return { strengthReadings, yongsinCandidates: yongsinCandidatesOf(factors, strengthReadings), gyeokguk: gyeokgukReadingsOf(factors) };
}

const ELEMENT_KO: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };

describe("유료 3블록 — 골든 명식 전부에서 화면 값 = 코어 값", () => {
  it("골든이 5건 이상이고 시각 known·unknown이 둘 다 있다", () => {
    expect(goldens.length).toBeGreaterThanOrEqual(5);
    expect(goldens.some((entry) => entry.input.birthTime)).toBe(true);
    expect(goldens.some((entry) => !entry.input.birthTime)).toBe(true);
  });

  it("PaidReportV1.structure = 코어 3함수 결과(깊은 동등)", () => {
    for (const golden of goldens) {
      expect(paidOf(golden.input).structure, golden.id).toEqual(coreOf(golden.input));
    }
  });

  it("화면 행 = 코어 판정을 세트 순서대로 옮긴 이름", () => {
    for (const golden of goldens) {
      const core = coreOf(golden.input);
      const view = paidBlocksViewOf(paidOf(golden.input));
      expect(view.strength.rows, golden.id).toEqual(core.strengthReadings.map((r) => ({ label: STRENGTH_SET_KO[r.ruleSetId], value: VERDICT_KO[r.verdict] })));
      expect(view.strength.agrees, golden.id).toBe(core.strengthReadings[0]?.agreesAcrossSets);
      expect(view.gyeokguk.rows.map((row) => row.label), golden.id).toEqual(core.gyeokguk.map((r) => GYEOKGUK_SET_KO[r.ruleSetId]));
      core.gyeokguk.forEach((reading, index) => {
        const value = view.gyeokguk.rows[index]?.value ?? "";
        for (const candidate of reading.candidates) expect(value, golden.id).toContain(GYEOK_KO[candidate.gyeok]);
        if (reading.unavailable) expect(value, golden.id).toMatch(/없음|불가/);
      });
      expect(view.gyeokguk.agrees, golden.id).toBe(core.gyeokguk[0]?.agreesAcrossSets);
      const shownElements = new Set(view.yongsin.map((row) => row.value.slice(0, 1)));
      expect(shownElements, golden.id).toEqual(new Set(core.yongsinCandidates.map((c) => ELEMENT_KO[c.element])));
    }
  });

  it("골든이 갈림·유보·격 없음 사례를 덮는다(아래 화면 단언의 전제)", () => {
    const views = goldens.map((golden) => paidBlocksViewOf(paidOf(golden.input)));
    expect(views.some((view) => !view.strength.agrees)).toBe(true);
    expect(views.some((view) => !view.gyeokguk.agrees)).toBe(true);
    expect(views.some((view) => view.gyeokguk.rows.some((row) => /없음|불가/.test(row.value)))).toBe(true);
  });
});

describe("유료 3블록 — 경계·빈 값에서 깨지지 않는다", () => {
  const base: BirthInput = { birthDate: "2024-02-04", birthTime: "17:27", calendar: "solar", sex: "female", timezone: "Asia/Seoul" };
  const { birthTime: _omit, ...timeless } = base;

  it("입춘 당일 시각 미상은 3블록 전에 코어가 거절한다(기존 BirthTimeRequiredError 경로)", () => {
    expect(() => paidOf(timeless)).toThrow(/birthTime is required/);
  });

  it("입춘 직전·정각·직후·경계 아닌 날 시각 미상 모두 3블록 행이 채워진다", () => {
    const cases: BirthInput[] = [
      ...["17:26", "17:27", "17:28"].map((birthTime) => ({ ...base, birthTime })),
      { ...timeless, birthDate: "2024-02-10" }
    ];
    for (const input of cases) {
      const view = paidBlocksViewOf(paidOf(input));
      expect(view.strength.rows).toHaveLength(2);
      expect(view.gyeokguk.rows).toHaveLength(3);
      for (const row of [...view.strength.rows, ...view.gyeokguk.rows, ...view.yongsin]) expect(row.value).not.toMatch(/undefined|NaN/);
    }
  });

  it("시각 미상이면 안내에 시주 제외 고지를 1회 덧붙인다", () => {
    const unknown = goldens.find((entry) => !entry.input.birthTime);
    expect(unknown).toBeDefined();
    expect(paidBlocksViewOf(paidOf(unknown!.input)).note).toBe(`${PAID_BLOCKS_NOTE} ${PAID_BLOCKS_TIME_UNKNOWN_NOTE}`);
  });

  it("용신 후보가 비면 HTML에 빈 값 문구가 나온다", () => {
    const report = paidOf(goldens[0]!.input);
    const empty = { ...report, structure: { ...report.structure, yongsinCandidates: [] } };
    expect(paidBlocksViewOf(empty).yongsin).toEqual([]);
    expect(buildPaidReportHtml(empty)).toContain(YONGSIN_EMPTY);
  });
});

describe("유료 3블록 — 안내는 묶음 전체 1회(LC 11-20)", () => {
  it("HTML 저장본에 안내 문장이 정확히 1회", () => {
    for (const golden of goldens.slice(0, 5)) {
      const html = buildPaidReportHtml(paidOf(golden.input));
      expect(html.split(PAID_BLOCKS_NOTE).length - 1, golden.id).toBe(1);
      expect(html).toContain('id="structure-blocks"');
    }
  });

  it("라벨에 길흉·단정 어휘 0", () => {
    const BANNED = /길하|흉하|길흉|좋은|나쁜|반드시|운명|필연|확정|추천|최적/;
    for (const golden of goldens) {
      const view = paidBlocksViewOf(paidOf(golden.input));
      for (const row of [...view.strength.rows, ...view.yongsin, ...view.gyeokguk.rows]) expect(`${row.label} ${row.value}`).not.toMatch(BANNED);
    }
  });
});
