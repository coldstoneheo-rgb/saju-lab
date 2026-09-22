import { STEMS, type Branch, type Stem } from "../cycle.js";
import { STEM_FIVE_ELEMENT } from "../five-elements.js";
import type { FiveElement, PillarsResult } from "../types.js";
import { DEFAULT_HIDDEN_STEM_SCHOOL, hiddenStemList, type HiddenStemSchool } from "./hidden-stems.data.js";

/**
 * 십신(十神): the relation of every other stem to the day master (일간).
 * Five element relations × same/different polarity = ten codes.
 *   same element        → 비견 bigyeon (same polarity) / 겁재 geopjae
 *   I generate it       → 식신 siksin / 상관 sanggwan
 *   I control it        → 편재 pyeonjae / 정재 jeongjae
 *   it controls me      → 편관 pyeongwan / 정관 jeonggwan
 *   it generates me     → 편인 pyeonin / 정인 jeongin
 * "same" codes are the same polarity as the day master (회의 2026-09-22 §6 규칙 ⓐ~ⓔ).
 */
export type TenGod =
  | "bigyeon" | "geopjae"
  | "siksin" | "sanggwan"
  | "pyeonjae" | "jeongjae"
  | "pyeongwan" | "jeonggwan"
  | "pyeonin" | "jeongin";

export const TEN_GODS: readonly TenGod[] = [
  "bigyeon", "geopjae", "siksin", "sanggwan", "pyeonjae", "jeongjae", "pyeongwan", "jeonggwan", "pyeonin", "jeongin"
];

export const TEN_GOD_LABELS: Record<TenGod, { ko: string; hanja: string }> = {
  bigyeon: { ko: "비견", hanja: "比肩" },
  geopjae: { ko: "겁재", hanja: "劫財" },
  siksin: { ko: "식신", hanja: "食神" },
  sanggwan: { ko: "상관", hanja: "傷官" },
  pyeonjae: { ko: "편재", hanja: "偏財" },
  jeongjae: { ko: "정재", hanja: "正財" },
  pyeongwan: { ko: "편관", hanja: "偏官" },
  jeonggwan: { ko: "정관", hanja: "正官" },
  pyeonin: { ko: "편인", hanja: "偏印" },
  jeongin: { ko: "정인", hanja: "正印" }
};

// 목 → 화 → 토 → 금 → 수 → 목 (상생); each element controls the one two steps ahead (상극).
const CYCLE: readonly FiveElement[] = ["wood", "fire", "earth", "metal", "water"];

function isYang(stem: Stem): boolean {
  return STEMS.indexOf(stem) % 2 === 0; // 甲丙戊庚壬 are yang
}

/** Ten god of `other` seen from the day master `dayStem`. */
export function tenGodOf(dayStem: Stem, other: Stem): TenGod {
  if (!(STEMS as readonly string[]).includes(dayStem) || !(STEMS as readonly string[]).includes(other)) {
    throw new Error(`Unknown stem: ${dayStem} / ${other}`);
  }
  const me = CYCLE.indexOf(STEM_FIVE_ELEMENT[dayStem]);
  const it = CYCLE.indexOf(STEM_FIVE_ELEMENT[other]);
  const samePolarity = isYang(dayStem) === isYang(other);
  const step = (it - me + 5) % 5; // 0 same, 1 I generate, 2 I control, 3 it controls me, 4 it generates me

  switch (step) {
    case 0: return samePolarity ? "bigyeon" : "geopjae";
    case 1: return samePolarity ? "siksin" : "sanggwan";
    case 2: return samePolarity ? "pyeonjae" : "jeongjae";
    case 3: return samePolarity ? "pyeongwan" : "jeonggwan";
    default: return samePolarity ? "pyeonin" : "jeongin";
  }
}

export interface HiddenStemTenGod {
  role: "residual" | "middle" | "primary";
  stem: Stem;
  tenGod: TenGod;
}

export interface PillarTenGods {
  /** Ten god of the pillar's stem; absent on the day pillar (the day master itself). */
  stem?: TenGod;
  /** Ten god of the branch's 정기 (primary hidden stem). */
  branchPrimary: TenGod;
  /** Every hidden stem of the branch, 여기 → 중기 → 정기. */
  branchAll: HiddenStemTenGod[];
}

export interface ChartTenGods {
  dayMaster: Stem;
  school: HiddenStemSchool;
  year: PillarTenGods;
  month: PillarTenGods;
  day: PillarTenGods;
  time?: PillarTenGods;
}

export function tenGodsOfChart(pillars: PillarsResult, school: HiddenStemSchool = DEFAULT_HIDDEN_STEM_SCHOOL): ChartTenGods {
  const dayMaster = pillars.day.stem as Stem;

  const forPillar = (stem: string, branch: string, includeStem: boolean): PillarTenGods => {
    const branchAll = hiddenStemList(branch as Branch, school).map((entry) => ({
      role: entry.role,
      stem: entry.stem,
      tenGod: tenGodOf(dayMaster, entry.stem)
    }));
    const primary = branchAll[branchAll.length - 1] as HiddenStemTenGod;
    return {
      ...(includeStem ? { stem: tenGodOf(dayMaster, stem as Stem) } : {}),
      branchPrimary: primary.tenGod,
      branchAll
    };
  };

  return {
    dayMaster,
    school,
    year: forPillar(pillars.year.stem, pillars.year.branch, true),
    month: forPillar(pillars.month.stem, pillars.month.branch, true),
    day: forPillar(pillars.day.stem, pillars.day.branch, false),
    ...(pillars.time ? { time: forPillar(pillars.time.stem, pillars.time.branch, true) } : {})
  };
}
