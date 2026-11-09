import { resolveBirthKst, sinsalOf, strengthFactorsOf, type BirthInput, type HiddenStemSchool, type PillarKey, type PillarsResult, type SinsalHit, type StrengthFactors } from "@saju-lab/saju-core";

// 무료 화면 L2 칩(l2-include-design §4, 2026-11-09 사용자 결정): 강약 팩터는 요약 칩만, 신살은 이름 칩만.
// 칩은 규칙 표의 사실(해당/해당 없음 · 이름 · 걸린 기둥)만 담는다. 강약 판정·뜻풀이·길흉은 13단계 문장 뒤.

const PILLAR_ORDER: readonly PillarKey[] = ["year", "month", "day", "time"];
const PILLAR_SHORT: Record<PillarKey, string> = { year: "연", month: "월", day: "일", time: "시" };

const SCHOOL_LABELS: Record<HiddenStemSchool, string> = { yeonhae: "연해자평", japyeong: "자평진전" };

/** 신살 고유명사(sinsal-design.md:58 — 이름으로만 쓴다). 한자는 폰트 서브셋 결정 전이라 싣지 않는다. */
export const SINSAL_NAME_KO: Record<SinsalHit["sinsalId"], string> = {
  cheoneul: "천을귀인",
  dohwa: "도화",
  yeokma: "역마",
  hwagae: "화개",
  yangin: "양인",
  goegang: "괴강",
  baekho: "백호"
};

export const STRENGTH_CHIP_NOTE = "득령·득지·득세는 일간을 돕는 글자(비겁·인성)가 월지 정기·일지 지장간·드러난 글자의 절반 이상에 있는지를 규칙 표로 확인한 결과입니다. 강하다·약하다는 판단은 하지 않습니다.";
export const STRENGTH_TIME_UNKNOWN_NOTE = "출생 시간이 없어 시주를 빼고 셌습니다.";
export const SINSAL_CHIP_NOTE = "신살은 규칙 표에 해당하는 이름과 걸린 기둥만 보여 줍니다. 여러 기준표 중 하나라도 해당하면 표시하며, 뜻풀이나 좋고 나쁨은 판단하지 않습니다.";
export const SINSAL_EMPTY_NOTE = "없음 — 기준표(천을귀인·도화·역마·화개·양인·괴강·백호)에 해당하는 글자가 없습니다.";

export interface StrengthChips {
  chips: string[];
  timeUnknown: boolean;
}

export function strengthChipsOf(factors: StrengthFactors): StrengthChips {
  const mark = (name: string, value: boolean) => `${name} ${value ? "해당" : "해당 없음"}`;
  const timeUnknown = factors.precision === "time-unknown";
  return {
    chips: [
      mark("득령", factors.deukryeong.value),
      mark("득지", factors.deukji.value),
      mark("득세", factors.deukse.value),
      `${SCHOOL_LABELS[factors.school]} 지장간`,
      ...(timeUnknown ? ["시주 제외"] : [])
    ],
    timeUnknown
  };
}

/** sinsalId별로 묶어 변형(기준표)마다 걸린 기둥의 합집합을 연→시 순으로 보인다. 순서 = 코어 SINSAL_VARIANTS 순. */
export function sinsalChipsOf(hits: SinsalHit[]): string[] {
  const pillarsById = new Map<SinsalHit["sinsalId"], Set<PillarKey>>();
  for (const hit of hits) {
    const set = pillarsById.get(hit.sinsalId) ?? new Set<PillarKey>();
    for (const pillar of hit.at) set.add(pillar);
    pillarsById.set(hit.sinsalId, set);
  }
  return [...pillarsById].map(([id, set]) => `${SINSAL_NAME_KO[id]}(${PILLAR_ORDER.filter((pillar) => set.has(pillar)).map((pillar) => PILLAR_SHORT[pillar]).join("·")})`);
}

export interface FreeL2Chips {
  strength: StrengthChips;
  sinsal: string[];
}

export function freeL2ChipsOf(pillars: PillarsResult, input: BirthInput): FreeL2Chips {
  return {
    strength: strengthChipsOf(strengthFactorsOf(pillars, resolveBirthKst(input))),
    sinsal: sinsalChipsOf(sinsalOf(pillars))
  };
}
