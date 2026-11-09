import { describe, expect, it } from "vitest";
import { calculatePillars, sinsalOf, type BirthInput } from "@saju-lab/saju-core";
import { loadGoldenPillarCases } from "../../../packages/saju-core/src/golden-pillars.load.js";
import {
  freeL2ChipsOf,
  SINSAL_CHIP_NOTE,
  SINSAL_EMPTY_NOTE,
  SINSAL_NAME_KO,
  SINSAL_TIME_UNKNOWN_NOTE,
  sinsalChipsOf,
  STRENGTH_CHIP_NOTE,
  STRENGTH_TIME_UNKNOWN_NOTE
} from "./l2-chips.js";

// 무료 화면 L2 칩(l2-include-design §4, 2026-11-09 결정) — 칩·안내 어디에도 평가 어휘 0, 시각 미상 표지 고정.

/** include-blocks.test.ts 어휘 가드 + saju-domain 기준 보강(귀하다·액·살이 끼다·운명류, 강약 단정). */
const EVALUATIVE = /추천|권장|최적|반드시|길하|흉하|길신|흉신|흉살|길흉|좋은|나쁜|좋다|나쁘|조심|주의|성공|실패|행운|불운|대길|대흉|귀하|액운|액땜|횡액|(?<!신)살|운명|팔자|강하다|약하다|강한|약한|강해|약해|신강|신약|위험|피해야|해야 한다|흉|재앙|이롭|유리|불리|필연|확정/;
/** 안내 문구는 «판단하지 않는다»는 부정 고지를 담아야 하므로, 그 고지 구절만 빼고 같은 가드를 건다. */
const NEGATION_PHRASES = ["뜻풀이나 좋고 나쁨은 판단하지 않습니다", "강하다·약하다는 판단은 하지 않습니다"];
const CJK = /[一-鿿]/;
const SINSAL_CHIP = new RegExp(`^(${Object.values(SINSAL_NAME_KO).join("|")})\\((연|월|일|시)(·(연|월|일|시))*\\)$`);

const goldens = loadGoldenPillarCases();
const chipsOf = (input: BirthInput) => freeL2ChipsOf(calculatePillars(input), input);

describe("무료 L2 칩 — 골든 명식 전부", () => {
  it("골든에 시각 known·unknown이 둘 다 있다(아래 단언의 전제)", () => {
    expect(goldens.some((entry) => entry.input.birthTime)).toBe(true);
    expect(goldens.some((entry) => !entry.input.birthTime)).toBe(true);
  });

  it("강약 칩 = 득령·득지·득세 해당/해당 없음 + 학파, 칩에 평가 어휘·한자 0", () => {
    for (const golden of goldens) {
      const { strength, sinsal } = chipsOf(golden.input);
      expect(strength.chips.slice(0, 3).map((chip) => chip.replace(/ 해당( 없음)?$/, "")), golden.id).toEqual(["득령", "득지", "득세"]);
      expect(strength.chips[3], golden.id).toBe("연해자평 지장간");
      for (const chip of [...strength.chips, ...sinsal]) {
        expect(chip, `${golden.id} ${chip}`).not.toMatch(EVALUATIVE);
        expect(chip, `${golden.id} ${chip}`).not.toMatch(CJK);
      }
    }
  });

  it("시각 미상이면 «시주 제외» 표지가 붙고, 시각이 있으면 붙지 않는다", () => {
    for (const golden of goldens) {
      const { strength } = chipsOf(golden.input);
      const unknown = !golden.input.birthTime;
      expect(strength.timeUnknown, golden.id).toBe(unknown);
      expect(strength.chips.includes("시주 제외"), golden.id).toBe(unknown);
      expect(strength.chips, golden.id).toHaveLength(unknown ? 5 : 4);
    }
  });

  it("신살 칩 = «이름(걸린 기둥)»만, 이름 중복 0, 시각 미상이면 «시» 기둥 0", () => {
    for (const golden of goldens) {
      const { sinsal } = chipsOf(golden.input);
      for (const chip of sinsal) expect(chip, golden.id).toMatch(SINSAL_CHIP);
      const names = sinsal.map((chip) => chip.slice(0, chip.indexOf("(")));
      expect(new Set(names).size, golden.id).toBe(names.length);
      if (!golden.input.birthTime) for (const chip of sinsal) expect(chip, golden.id).not.toMatch(/[(·]시[)·]/);
    }
  });

  it("신살 칩 기둥 = 그 이름의 변형 전부에서 걸린 기둥의 합집합", () => {
    for (const golden of goldens) {
      const hits = sinsalOf(calculatePillars(golden.input));
      for (const chip of chipsOf(golden.input).sinsal) {
        const name = chip.slice(0, chip.indexOf("("));
        const id = (Object.keys(SINSAL_NAME_KO) as Array<keyof typeof SINSAL_NAME_KO>).find((key) => SINSAL_NAME_KO[key] === name);
        const union = new Set(hits.filter((hit) => hit.sinsalId === id).flatMap((hit) => hit.at));
        const expected = (["year", "month", "day", "time"] as const).filter((pillar) => union.has(pillar)).map((pillar) => ({ year: "연", month: "월", day: "일", time: "시" })[pillar]).join("·");
        expect(chip, golden.id).toBe(`${name}(${expected})`);
      }
    }
  });
});

describe("무료 L2 칩 — 안내 문구", () => {
  it("신살 안내에 «좋고 나쁨은 판단하지 않습니다», 강약 안내에 «강하다·약하다는 판단은 하지 않습니다»", () => {
    expect(SINSAL_CHIP_NOTE).toContain("좋고 나쁨은 판단하지 않습니다");
    expect(STRENGTH_CHIP_NOTE).toContain("강하다·약하다는 판단은 하지 않습니다");
    expect(SINSAL_CHIP_NOTE).toContain("검토 전이라 참고용");
    expect(STRENGTH_CHIP_NOTE).toContain("월지를 뺀");
  });

  it("부정 고지 구절을 뺀 안내 문구 전부에 평가 어휘·한자 0", () => {
    for (const note of [STRENGTH_CHIP_NOTE, STRENGTH_TIME_UNKNOWN_NOTE, SINSAL_CHIP_NOTE, SINSAL_EMPTY_NOTE, SINSAL_TIME_UNKNOWN_NOTE]) {
      const rest = NEGATION_PHRASES.reduce((text, phrase) => text.replace(phrase, ""), note);
      expect(rest, note).not.toMatch(EVALUATIVE);
      expect(rest, note).not.toMatch(CJK);
    }
  });

  it("신살 없음 = 칩 0개(빈 안내로 대체)", () => {
    expect(sinsalChipsOf([])).toEqual([]);
  });

  it("판정기 변이: 평가 어휘·한자를 넣으면 잡는다", () => {
    for (const bad of ["도화 조심", "천을귀인 귀하다", "백호 액운", "역마살", "득세 해당 — 신강", "도화(桃花)", "일간이 강한 편", "역마는 불리"]) {
      expect(EVALUATIVE.test(bad) || CJK.test(bad), bad).toBe(true);
    }
  });
});
