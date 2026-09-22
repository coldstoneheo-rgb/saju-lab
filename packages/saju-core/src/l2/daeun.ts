import { BRANCHES, STEMS, cyclePillar, type Branch, type Stem } from "../cycle.js";
import type { ParsedBirthDateTime } from "../datetime.js";
import { SOLAR_MONTH_BOUNDARIES, type SolarMonthBoundary } from "../solar-terms.js";
import type { PillarsResult, Sex } from "../types.js";
import { DEFAULT_HIDDEN_STEM_SCHOOL, hiddenStemsOf, type HiddenStemSchool } from "./hidden-stems.data.js";
import { tenGodOf, type TenGod } from "./ten-gods.js";

/**
 * 대운(大運) v1 — the core returns minute-precision decimals and never rounds
 * (회의 2026-09-22 §3 7-1 · §4 A2-2 · DEC F10). The source of truth for the
 * constants below is docs/rules/DAEUN.md; daeun.test.ts parses it.
 * 세운·월운, rounding policy and 대운↔원국 합충 are out of v1.
 */

export type DaeunDirection = "forward" | "backward";
export type DaeunPrecision = "exact" | "time-unknown";
export type SolarTermCode = SolarMonthBoundary["term"];

/** 표 1 — 순역행 4조합. 연간 양 + 남 = 순행 … */
export const DAEUN_DIRECTION_TABLE: ReadonlyArray<{ yearStemPolarity: "yang" | "yin"; sex: "male" | "female"; direction: DaeunDirection }> = [
  { yearStemPolarity: "yang", sex: "male", direction: "forward" },
  { yearStemPolarity: "yang", sex: "female", direction: "backward" },
  { yearStemPolarity: "yin", sex: "male", direction: "backward" },
  { yearStemPolarity: "yin", sex: "female", direction: "forward" }
];

/** 표 2 — the twelve 節 used for the 절입 distance, 입춘 first, with the month branch each one opens. */
export const DAEUN_TERMS: ReadonlyArray<{ code: SolarTermCode; ko: string; branch: Branch }> = [
  { code: "ipchun", ko: "입춘", branch: "in" },
  { code: "gyeongchip", ko: "경칩", branch: "myo" },
  { code: "cheongmyeong", ko: "청명", branch: "jin" },
  { code: "ipha", ko: "입하", branch: "sa" },
  { code: "mangjong", ko: "망종", branch: "o" },
  { code: "soseo", ko: "소서", branch: "mi" },
  { code: "ipchu", ko: "입추", branch: "sin" },
  { code: "baengno", ko: "백로", branch: "yu" },
  { code: "hallo", ko: "한로", branch: "sul" },
  { code: "ipdong", ko: "입동", branch: "hae" },
  { code: "daeseol", ko: "대설", branch: "ja" },
  { code: "sohan", ko: "소한", branch: "chuk" }
];

/** 3 days = 1 year. */
export const MINUTES_PER_DAEUN_YEAR = 3 * 1440;
export const DAYS_PER_YEAR = 365.2425;
export const DAEUN_PERIOD_COUNT = 10;
/** Noon stands in for an unknown birth time (±12h = ±0.17년). */
const TIME_UNKNOWN_HOUR = 12;

export interface DaeunTermRef {
  term: SolarTermCode;
  /** KST, YYYY-MM-DDTHH:mm. */
  at: string;
}

export interface DaeunPeriod {
  index: number;
  stem: Stem;
  branch: Branch;
  /** 십신 of the period's stem and of its branch 정기, seen from the day master. Data only. */
  tenGods: { stem: TenGod; branchPrimary: TenGod };
  /** Exact decimal years from birth; startAgeExact + 10·index. */
  startAge: number;
  startsAt: string;
  endsAt: string;
}

export interface DaeunReading {
  direction: DaeunDirection;
  /** Minutes between birth and the reference 절, integer. */
  distanceMinutes: number;
  /** distanceMinutes ÷ 4320, decimal years, unrounded. */
  startAgeExact: number;
  /** Birth + startAgeExact × 365.2425 days, KST date. */
  startsAt: string;
  /** startAgeExact split into whole years and whole months (floor). A data field, not a rounding rule. */
  years: number;
  months: number;
  /** The 절 at/before birth and the next one; `referenceTerm` is the one the distance was measured to. */
  terms: { from: DaeunTermRef; to: DaeunTermRef };
  referenceTerm: DaeunTermRef;
  periods: DaeunPeriod[];
  /** True when periods past the solar-term table's end (2100-12-07) were dropped. */
  truncated: boolean;
  /** The period that contains `referenceDate`, or null when it is before the first period (or after the last kept one). */
  current: { index: number; startsAt: string; endsAt: string } | null;
}

export interface DaeunBlock {
  precision: DaeunPrecision;
  school: HiddenStemSchool;
  /** "both" for sex "other" — both readings are returned and neither is the default. */
  direction: DaeunDirection | "both";
  /** KST date the `current` lookup used. */
  referenceDate: string;
  forward?: DaeunReading;
  backward?: DaeunReading;
}

export interface DaeunUnavailable {
  daeun: null;
  reason: "OUT_OF_SOLAR_TERM_TABLE";
}

export interface DaeunOptions {
  school?: HiddenStemSchool;
  /** YYYY-MM-DD (KST). Defaults to today in KST. */
  referenceDate?: string;
}

// ------------------------------------------------------------------ helpers

function isYangStem(stem: Stem): boolean {
  return STEMS.indexOf(stem) % 2 === 0;
}

/** 순역 for a definite sex; `undefined` for "other" (both readings). */
export function daeunDirection(yearStem: Stem, sex: Sex): DaeunDirection | undefined {
  if (sex === "other") return undefined;
  const polarity = isYangStem(yearStem) ? "yang" : "yin";
  return DAEUN_DIRECTION_TABLE.find((row) => row.yearStemPolarity === polarity && row.sex === sex)?.direction;
}

function minuteValue(year: number, month: number, day: number, hour: number, minute: number): number {
  return Date.UTC(year, month - 1, day, hour, minute) / 60_000;
}

function parseMinute(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Solar term time must be YYYY-MM-DDTHH:mm: ${value}`);
  return minuteValue(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5]));
}

function dateOfMinute(value: number): string {
  const date = new Date(Math.floor(value) * 60_000);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function dateValue(date: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`referenceDate must be YYYY-MM-DD: ${date}`);
  return minuteValue(Number(match[1]), Number(match[2]), Number(match[3]), 0, 0);
}

/** Today's date on the KST wall clock. */
export function todayKst(now = Date.now()): string {
  return dateOfMinute(now / 60_000 + 9 * 60);
}

function sexagenaryIndex(stem: Stem, branch: Branch): number {
  const s = STEMS.indexOf(stem);
  const b = BRANCHES.indexOf(branch);
  for (let index = 0; index < 60; index += 1) if (index % 10 === s && index % 12 === b) return index;
  throw new Error(`Impossible pillar ${stem}-${branch}`);
}

const TABLE_END_MINUTE = parseMinute((SOLAR_MONTH_BOUNDARIES[SOLAR_MONTH_BOUNDARIES.length - 1] as SolarMonthBoundary).startsAt);

// -------------------------------------------------------------------- core

function readingFor(
  direction: DaeunDirection,
  birthMinute: number,
  pillars: PillarsResult,
  school: HiddenStemSchool,
  referenceDate: string
): DaeunReading | undefined {
  // Boundaries around the birth: `from` = last 절 at/before birth, `to` = first 절 strictly after.
  let fromIndex = -1;
  for (let index = 0; index < SOLAR_MONTH_BOUNDARIES.length; index += 1) {
    if (parseMinute((SOLAR_MONTH_BOUNDARIES[index] as SolarMonthBoundary).startsAt) <= birthMinute) fromIndex = index;
    else break;
  }
  const from = fromIndex >= 0 ? SOLAR_MONTH_BOUNDARIES[fromIndex] : undefined;
  const to = SOLAR_MONTH_BOUNDARIES[fromIndex + 1];
  const reference = direction === "forward" ? to : from;
  if (!from || !to || !reference) return undefined;

  const referenceMinute = parseMinute(reference.startsAt);
  const distanceMinutes = Math.round(direction === "forward" ? referenceMinute - birthMinute : birthMinute - referenceMinute);
  const startAgeExact = distanceMinutes / MINUTES_PER_DAEUN_YEAR;
  const minuteAtAge = (age: number): number => birthMinute + age * DAYS_PER_YEAR * 1440;

  const dayMaster = pillars.day.stem as Stem;
  const monthIndex = sexagenaryIndex(pillars.month.stem as Stem, pillars.month.branch as Branch);
  const step = direction === "forward" ? 1 : -1;
  const periods: DaeunPeriod[] = [];
  let truncated = false;
  for (let index = 0; index < DAEUN_PERIOD_COUNT; index += 1) {
    const startAge = startAgeExact + 10 * index;
    const startMinute = minuteAtAge(startAge);
    if (startMinute > TABLE_END_MINUTE) {
      truncated = true;
      break;
    }
    const pillar = cyclePillar(monthIndex + step * (index + 1));
    const stem = pillar.stem as Stem;
    const branch = pillar.branch as Branch;
    periods.push({
      index,
      stem,
      branch,
      tenGods: { stem: tenGodOf(dayMaster, stem), branchPrimary: tenGodOf(dayMaster, hiddenStemsOf(branch, school).primary.stem) },
      startAge,
      startsAt: dateOfMinute(startMinute),
      endsAt: dateOfMinute(minuteAtAge(startAge + 10) - 1440)
    });
  }

  const referenceMinuteOfDay = dateValue(referenceDate);
  const currentPeriod = periods.find((period) => dateValue(period.startsAt) <= referenceMinuteOfDay && referenceMinuteOfDay <= dateValue(period.endsAt));

  return {
    direction,
    distanceMinutes,
    startAgeExact,
    startsAt: dateOfMinute(minuteAtAge(startAgeExact)),
    years: Math.floor(startAgeExact),
    months: Math.floor((startAgeExact - Math.floor(startAgeExact)) * 12),
    terms: { from: { term: from.term, at: from.startsAt }, to: { term: to.term, at: to.startsAt } },
    referenceTerm: { term: reference.term, at: reference.startsAt },
    periods,
    truncated,
    current: currentPeriod ? { index: currentPeriod.index, startsAt: currentPeriod.startsAt, endsAt: currentPeriod.endsAt } : null
  };
}

/**
 * 대운 for a chart. `birthKst` is the normalized KST wall clock the pillars were
 * calculated from (진태양시 not applied); an unknown time is read as noon.
 */
export function daeunOf(pillars: PillarsResult, birthKst: ParsedBirthDateTime, sex: Sex, options: DaeunOptions = {}): DaeunBlock | DaeunUnavailable {
  const school = options.school ?? DEFAULT_HIDDEN_STEM_SCHOOL;
  const referenceDate = options.referenceDate ?? todayKst();
  const timeKnown = birthKst.hour !== undefined && birthKst.minute !== undefined;
  const birthMinute = minuteValue(birthKst.year, birthKst.month, birthKst.day, timeKnown ? (birthKst.hour as number) : TIME_UNKNOWN_HOUR, timeKnown ? (birthKst.minute as number) : 0);
  const precision: DaeunPrecision = timeKnown ? "exact" : "time-unknown";

  const single = daeunDirection(pillars.year.stem as Stem, sex);
  const directions: DaeunDirection[] = single ? [single] : ["forward", "backward"];
  const readings: Partial<Record<DaeunDirection, DaeunReading>> = {};
  for (const direction of directions) {
    const reading = readingFor(direction, birthMinute, pillars, school, referenceDate);
    if (!reading) return { daeun: null, reason: "OUT_OF_SOLAR_TERM_TABLE" };
    readings[direction] = reading;
  }

  return {
    precision,
    school,
    direction: single ?? "both",
    referenceDate,
    ...(readings.forward ? { forward: readings.forward } : {}),
    ...(readings.backward ? { backward: readings.backward } : {})
  };
}

export function isDaeunUnavailable(value: DaeunBlock | DaeunUnavailable): value is DaeunUnavailable {
  return "daeun" in value && value.daeun === null;
}
