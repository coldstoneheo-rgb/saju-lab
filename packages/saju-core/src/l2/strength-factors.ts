import type { Branch, Stem } from "../cycle.js";
import type { ParsedBirthDateTime } from "../datetime.js";
import { BRANCH_FIVE_ELEMENT, FIVE_ELEMENTS, STEM_FIVE_ELEMENT } from "../five-elements.js";
import { SOLAR_MONTH_BOUNDARIES } from "../solar-terms.js";
import type { FiveElement, PillarsResult } from "../types.js";
import { DEFAULT_HIDDEN_STEM_SCHOOL, hiddenStemList, type HiddenStemSchool } from "./hidden-stems.data.js";
import { interactionsOfChart, type PillarKey } from "./interactions.js";
import { TEN_GODS, tenGodOf, type TenGod } from "./ten-gods.js";

/**
 * 일간 강약 팩터(8a) — facts only: character counts, table lookups and the
 * 절입 distance. No score, no grade, no 신강/신약 verdict and no weighting
 * (회의 2026-09-22 A2-4 · PLAN §2-1). The source of truth for the constants
 * below is docs/rules/STRENGTH.md; strength-factors.test.ts parses it.
 */

export type HiddenRole = "residual" | "middle" | "primary";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type StrengthPrecision = "exact" | "time-unknown";

/** 표 1 — the adopted definition ids (채택: yes). */
export const STRENGTH_DEFINITIONS = {
  deukryeong: "deukryeong.primary-support",
  deukji: "deukji.day-branch-support",
  deukse: "deukse.surface-majority-ge"
} as const;

/** 표 2 — 비겁 · 인성. */
export const SUPPORT_TEN_GODS: readonly TenGod[] = ["bigyeon", "geopjae", "pyeonin", "jeongin"];

/** 표 3 — 월지 계절. */
export const SEASON_OF_BRANCH: Record<Branch, Season> = {
  in: "spring", myo: "spring", jin: "spring",
  sa: "summer", o: "summer", mi: "summer",
  sin: "autumn", yu: "autumn", sul: "autumn",
  hae: "winter", ja: "winter", chuk: "winter"
};

/** 표 4 — 사령 경계 근접 폭(일) and the stand-in hour for an unknown birth time. */
export const SARYEONG_NEAR_THRESHOLD_DAYS = 1;
const TIME_UNKNOWN_HOUR = 12;

export interface HiddenStemRef {
  pillar: PillarKey;
  role: HiddenRole;
  stem: Stem;
}

export interface StrengthFactors {
  school: HiddenStemSchool;
  precision: StrengthPrecision;
  dayMaster: Stem;
  /** 층 원본 — 일간 제외 천간(연→시), 지지 정기(연→시), 지장간 전체(일수 원본 포함). */
  layers: {
    stems: Array<{ pillar: PillarKey; stem: Stem }>;
    branchPrimary: Array<{ pillar: PillarKey; stem: Stem }>;
    hiddenStems: Array<HiddenStemRef & { days: number | null }>;
  };
  tenGodCounts: { surface: Record<TenGod, number>; withHidden: Record<TenGod, number> };
  elementCounts: { surface: Record<FiveElement, number>; withHidden: Record<FiveElement, number> };
  /** 투간 — hidden stems that also stand as a stem somewhere (일간 포함); non-exposed ones are omitted. */
  exposed: Array<HiddenStemRef & { in: PillarKey[] }>;
  /** 통근 — hidden stems of the day master's element. */
  roots: HiddenStemRef[];
  deukryeong: { value: boolean; definitionId: typeof STRENGTH_DEFINITIONS.deukryeong; monthPrimary: Stem; tenGod: TenGod };
  deukji: { value: boolean; definitionId: typeof STRENGTH_DEFINITIONS.deukji; supporting: Array<{ role: HiddenRole; stem: Stem; tenGod: TenGod }> };
  deukse: { value: boolean; definitionId: typeof STRENGTH_DEFINITIONS.deukse; support: number; other: number };
  /** `yeonhae` only; null with `saryeongUnavailable` otherwise. */
  saryeong: Saryeong | null;
  saryeongUnavailable?: "no-day-counts" | "month-term-mismatch";
  dayStemCombined: { value: boolean; with: Array<{ pillar: PillarKey; id: string }> };
  monthBranchClashed: { value: boolean; with: Array<{ pillar: PillarKey; id: string }> };
  /** Every branch relation the day branch is part of, in 합충표 order. */
  dayBranchInteractions: Array<{ kind: string; id: string; pillars: PillarKey[] }>;
  /** Data for a 化 reading — there is deliberately no `transformed` field. */
  transformationMaterials: Array<{ ganhapId: string; pillars: [PillarKey, PillarKey]; potentialElement: FiveElement; monthElementMatches: boolean; potentialElementExposed: boolean }>;
  climate: { season: Season; fire: number; water: number };
}

export interface Saryeong {
  stem: Stem;
  role: HiddenRole;
  /** Integer minutes from the month's 절 to the birth moment (unknown time = 12:00). */
  elapsedMinutes: number;
  /** Cumulative day marks where the next hidden stem takes over (여기 끝, 중기 끝). */
  boundaries: number[];
  nearThreshold: boolean;
  term: { code: string; at: string };
}

export interface StrengthFactorOptions {
  school?: HiddenStemSchool;
}

const PILLARS: readonly PillarKey[] = ["year", "month", "day", "time"];

function emptyCounts<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>;
}

function minuteOf(year: number, month: number, day: number, hour: number, minute: number): number {
  return Date.UTC(year, month - 1, day, hour, minute) / 60_000;
}

function parseMinute(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Solar term time must be YYYY-MM-DDTHH:mm: ${value}`);
  return minuteOf(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5]));
}

const TERM_BRANCH: Record<string, Branch> = {
  ipchun: "in", gyeongchip: "myo", cheongmyeong: "jin", ipha: "sa", mangjong: "o", soseo: "mi",
  ipchu: "sin", baengno: "yu", hallo: "sul", ipdong: "hae", daeseol: "ja", sohan: "chuk"
};

function saryeongOf(monthBranch: Branch, birthMinute: number, school: HiddenStemSchool): { saryeong: Saryeong } | { unavailable: "no-day-counts" | "month-term-mismatch" } {
  const list = hiddenStemList(monthBranch, school);
  if (list.some((entry) => entry.days === null)) return { unavailable: "no-day-counts" };

  let fromIndex = -1;
  for (let index = 0; index < SOLAR_MONTH_BOUNDARIES.length; index += 1) {
    if (parseMinute((SOLAR_MONTH_BOUNDARIES[index] as { startsAt: string }).startsAt) <= birthMinute) fromIndex = index;
    else break;
  }
  const from = SOLAR_MONTH_BOUNDARIES[fromIndex];
  if (!from || TERM_BRANCH[from.term] !== monthBranch) return { unavailable: "month-term-mismatch" };

  const elapsedMinutes = Math.round(birthMinute - parseMinute(from.startsAt));
  const elapsedDays = elapsedMinutes / 1440;
  const boundaries: number[] = [];
  let cumulative = 0;
  for (const entry of list.slice(0, -1)) {
    cumulative += entry.days as number;
    boundaries.push(cumulative);
  }
  const slot = boundaries.findIndex((mark) => elapsedDays < mark);
  const holder = list[slot === -1 ? list.length - 1 : slot] as (typeof list)[number];
  return {
    saryeong: {
      stem: holder.stem,
      role: holder.role,
      elapsedMinutes,
      boundaries,
      nearThreshold: boundaries.some((mark) => Math.abs(elapsedDays - mark) <= SARYEONG_NEAR_THRESHOLD_DAYS),
      term: { code: from.term, at: from.startsAt }
    }
  };
}

/**
 * 8a strength factors for the main chart. `birthKst` is the normalized KST wall
 * clock the pillars were calculated from (resolveBirthKst); it is used only for 사령.
 */
export function strengthFactorsOf(pillars: PillarsResult, birthKst: ParsedBirthDateTime, options: StrengthFactorOptions = {}): StrengthFactors {
  const school = options.school ?? DEFAULT_HIDDEN_STEM_SCHOOL;
  const dayMaster = pillars.day.stem as Stem;
  const present = PILLARS.filter((key) => pillars[key] !== undefined);
  const stemAt = (key: PillarKey): Stem => (pillars[key] as { stem: string }).stem as Stem;
  const branchAt = (key: PillarKey): Branch => (pillars[key] as { branch: string }).branch as Branch;
  const god = (stem: Stem): TenGod => tenGodOf(dayMaster, stem);
  const isSupport = (tenGod: TenGod): boolean => SUPPORT_TEN_GODS.includes(tenGod);

  const stems = present.filter((key) => key !== "day").map((pillar) => ({ pillar, stem: stemAt(pillar) }));
  const branchPrimary = present.map((pillar) => {
    const list = hiddenStemList(branchAt(pillar), school);
    return { pillar, stem: (list[list.length - 1] as { stem: Stem }).stem };
  });
  const hiddenStems = present.flatMap((pillar) => hiddenStemList(branchAt(pillar), school).map((entry) => ({ pillar, role: entry.role, stem: entry.stem, days: entry.days })));

  const tally = (list: Stem[]): { tenGods: Record<TenGod, number>; elements: Record<FiveElement, number> } => {
    const tenGods = emptyCounts(TEN_GODS);
    const elements = emptyCounts(FIVE_ELEMENTS);
    for (const stem of list) {
      tenGods[god(stem)] += 1;
      elements[STEM_FIVE_ELEMENT[stem]] += 1;
    }
    return { tenGods, elements };
  };
  const surface = tally([...stems, ...branchPrimary].map((entry) => entry.stem));
  const withHidden = tally([...stems, ...hiddenStems].map((entry) => entry.stem));

  const allStems = present.map((pillar) => ({ pillar, stem: stemAt(pillar) }));
  const exposed = hiddenStems
    .map(({ pillar, role, stem }) => ({ pillar, role, stem, in: allStems.filter((entry) => entry.stem === stem).map((entry) => entry.pillar) }))
    .filter((entry) => entry.in.length > 0);
  const roots = hiddenStems
    .filter((entry) => STEM_FIVE_ELEMENT[entry.stem] === STEM_FIVE_ELEMENT[dayMaster])
    .map(({ pillar, role, stem }) => ({ pillar, role, stem }));

  const monthPrimary = (branchPrimary.find((entry) => entry.pillar === "month") as { stem: Stem }).stem;
  const dayHidden = hiddenStemList(branchAt("day"), school).map((entry) => ({ role: entry.role, stem: entry.stem, tenGod: god(entry.stem) }));
  const dayHiddenSupport = dayHidden.filter((entry) => isSupport(entry.tenGod));
  const outsideMonth = [...stems, ...branchPrimary.filter((entry) => entry.pillar !== "month")].map((entry) => god(entry.stem));
  const support = outsideMonth.filter(isSupport).length;
  const other = outsideMonth.length - support;

  const timeKnown = birthKst.hour !== undefined && birthKst.minute !== undefined;
  const birthMinute = minuteOf(birthKst.year, birthKst.month, birthKst.day, timeKnown ? (birthKst.hour as number) : TIME_UNKNOWN_HOUR, timeKnown ? (birthKst.minute as number) : 0);
  const saryeong = saryeongOf(branchAt("month"), birthMinute, school);

  const interactions = interactionsOfChart(pillars);
  const partner = (list: PillarKey[], self: PillarKey): PillarKey => (list[0] === self ? list[1] : list[0]) as PillarKey;
  const combined = interactions.stems
    .filter((entry) => entry.pillars.includes("day"))
    .map((entry) => ({ pillar: partner(entry.pillars, "day"), id: entry.id }));
  const clashed = interactions.branches
    .filter((entry) => entry.kind === "chung" && entry.pillars.includes("month"))
    .map((entry) => ({ pillar: partner(entry.pillars, "month"), id: entry.id }));
  const monthElement = BRANCH_FIVE_ELEMENT[branchAt("month")];
  const transformationMaterials = interactions.stems.map((entry) => ({
    ganhapId: entry.id,
    pillars: entry.pillars,
    potentialElement: entry.potentialElement,
    monthElementMatches: monthElement === entry.potentialElement,
    potentialElementExposed: allStems.some((other) => !entry.pillars.includes(other.pillar) && STEM_FIVE_ELEMENT[other.stem] === entry.potentialElement)
  }));

  const climateStems = [...allStems, ...branchPrimary].map((entry) => STEM_FIVE_ELEMENT[entry.stem]);

  return {
    school,
    precision: timeKnown ? "exact" : "time-unknown",
    dayMaster,
    layers: { stems, branchPrimary, hiddenStems },
    tenGodCounts: { surface: surface.tenGods, withHidden: withHidden.tenGods },
    elementCounts: { surface: surface.elements, withHidden: withHidden.elements },
    exposed,
    roots,
    deukryeong: { value: isSupport(god(monthPrimary)), definitionId: STRENGTH_DEFINITIONS.deukryeong, monthPrimary, tenGod: god(monthPrimary) },
    deukji: { value: dayHiddenSupport.length > 0, definitionId: STRENGTH_DEFINITIONS.deukji, supporting: dayHiddenSupport },
    deukse: { value: support >= other, definitionId: STRENGTH_DEFINITIONS.deukse, support, other },
    ...("saryeong" in saryeong ? { saryeong: saryeong.saryeong } : { saryeong: null, saryeongUnavailable: saryeong.unavailable }),
    dayStemCombined: { value: combined.length > 0, with: combined },
    monthBranchClashed: { value: clashed.length > 0, with: clashed },
    dayBranchInteractions: interactions.branches.filter((entry) => entry.pillars.includes("day")).map((entry) => ({ kind: entry.kind, id: entry.id, pillars: entry.pillars })),
    transformationMaterials,
    climate: {
      season: SEASON_OF_BRANCH[branchAt("month")],
      fire: climateStems.filter((element) => element === "fire").length,
      water: climateStems.filter((element) => element === "water").length
    }
  };
}
