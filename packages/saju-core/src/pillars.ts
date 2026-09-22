import { DEFAULT_BIRTH_PLACE, findBirthPlace, trueSolarOffsetMinutes } from "./birth-place.data.js";
import { dayPillarFromEpochDay, monthPillarForSolarMonth, timePillarForDay, yearPillarForSolarYear, type Stem } from "./cycle.js";
import { epochDayKst, parseBirthDateTime, type ParsedBirthDateTime } from "./datetime.js";
import { LUNAR_MAX_YEAR, LUNAR_MIN_YEAR } from "./lunar-calendar.data.js";
import { lunarToSolar } from "./lunar-calendar.js";
import { effectiveSolarYear, minutesFromNearestBoundary, solarMonthBoundary } from "./solar-terms.js";
import { normalizeToKstWallClock, type BirthTimeFlag } from "./timezone-history.js";
import type { BirthInput, CalendarSystem, DayBoundaryPolicy, JaHourPolicy, Pillar, PillarsResult } from "./types.js";

/** Thrown for a lunar date that does not exist (leap month the year lacks, day 30 of a 29-day month, bad month). */
export class LunarDateError extends Error {}

export interface CalendarResolution {
  input: CalendarSystem;
  /** Lunar input only. */
  isLeapMonth?: boolean;
  /** The Gregorian date the pillars were calculated from (YYYY-MM-DD). */
  solarDate: string;
}

/** Wall-clock window (minutes from the boundary) that marks a reading as "near" it. */
export const NEAR_BOUNDARY_WINDOWS = {
  // 시지 경계는 홀수 정시. Korea's longitude corrections run −12 … −34 min, so a
  // reading up to 34 min after a boundary can be pulled back across it; 10 min
  // before covers the usual imprecision of birth records.
  hourBranch: { before: 10, after: 34 },
  dayMidnight: { before: 32, after: 32 },
  solarTerm: { before: 60, after: 60 }
} as const;

export type NearBoundaryKind = keyof typeof NEAR_BOUNDARY_WINDOWS;

export interface NearBoundary {
  kind: NearBoundaryKind;
  /** Signed minutes from the boundary on the KST wall clock (negative = before). */
  minutes: number;
  direction: "before" | "after";
  /** For solarTerm: which 절입 and when (KST). */
  term?: string;
  at?: string;
}

/** Everything the caller needs to see which rules produced the pillars. */
export interface CalculationResolution {
  appliedOffsetMin: number;
  flags: BirthTimeFlag[];
  trueSolarTimeApplied: boolean;
  /** Longitude correction in minutes for `birthPlace` (always ≤ 0 in Korea); reported even when not applied. */
  trueSolarOffsetMin: number;
  birthPlace: string;
  jaHourPolicy: JaHourPolicy;
  dayBoundary: DayBoundaryPolicy;
  nearBoundary: NearBoundary[];
  calendar: CalendarResolution;
}

export interface PillarsAlternates {
  /** The other true-solar-time reading, when it yields different pillars. */
  trueSolarTime?: { applied: boolean; appliedMinutes: number; pillars: PillarsResult };
  /** The other 23시대 policy, when it yields different pillars. */
  jaHourPolicy?: { policy: JaHourPolicy; pillars: PillarsResult };
}

export interface PillarsWithResolution {
  pillars: PillarsResult;
  resolution: CalculationResolution;
  alternates?: PillarsAlternates;
}

interface Policy {
  trueSolarTime: boolean;
  jaHourPolicy: JaHourPolicy;
  dayBoundary: DayBoundaryPolicy;
}

export function calculatePillarsWithResolution(input: BirthInput): PillarsWithResolution {
  const { solarInput, calendar } = resolveCalendar(input);
  const local = parseBirthDateTime(solarInput);
  const { kst, resolution: timeResolution } = normalizeToKstWallClock(local);

  const placeCode = input.birthPlace ?? DEFAULT_BIRTH_PLACE;
  const place = findBirthPlace(placeCode);
  if (place === undefined) {
    throw new Error(`Unknown birthPlace "${placeCode}"; use one of the 시·도 codes in birth-place.data.ts.`);
  }
  const trueSolarOffsetMin = trueSolarOffsetMinutes(place.longitude);

  const policy: Policy = {
    trueSolarTime: input.options?.trueSolarTime ?? false,
    jaHourPolicy: input.options?.jaHourPolicy ?? "late",
    dayBoundary: input.options?.dayBoundary ?? "midnight"
  };

  // When the civil clock was not on UTC+9 the KASI boundary date may sit on
  // the neighbouring civil day, so a time-less birth must also be refused
  // around those dates.
  const boundaryDateSlackDays = timeResolution.appliedOffsetMin === 0 ? 0 : 1;
  const solarYear = effectiveSolarYear(kst, boundaryDateSlackDays);
  const monthBoundary = solarMonthBoundary(kst, boundaryDateSlackDays);
  const yearAndMonth = {
    year: yearPillarForSolarYear(solarYear),
    month: monthPillarForSolarMonth(monthBoundary.solarYear, monthBoundary.monthOrdinal)
  };

  const assemble = (variant: Policy): PillarsResult => assembleDayAndTime(kst, yearAndMonth, variant, trueSolarOffsetMin);
  const pillars = assemble(policy);

  const resolution: CalculationResolution = {
    appliedOffsetMin: timeResolution.appliedOffsetMin,
    flags: timeResolution.flags,
    trueSolarTimeApplied: policy.trueSolarTime,
    trueSolarOffsetMin,
    birthPlace: place.code,
    jaHourPolicy: policy.jaHourPolicy,
    dayBoundary: policy.dayBoundary,
    nearBoundary: nearBoundaries(kst),
    calendar
  };

  const alternates = timeKnown(kst) ? collectAlternates(pillars, policy, assemble, trueSolarOffsetMin) : undefined;
  return alternates ? { pillars, resolution, alternates } : { pillars, resolution };
}

/**
 * Lunar input is converted to Gregorian here and the rest of the pipeline never
 * sees it. A lunar year outside the table is a range error (→ OUT_OF_SUPPORTED_RANGE
 * in the API); a date the table says does not exist is a LunarDateError.
 */
function resolveCalendar(input: BirthInput): { solarInput: BirthInput; calendar: CalendarResolution } {
  if ((input.calendar ?? "solar") === "solar") {
    return { solarInput: input, calendar: { input: "solar", solarDate: input.birthDate } };
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate);
  if (!match) {
    throw new LunarDateError("birthDate must use YYYY-MM-DD format.");
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (year < LUNAR_MIN_YEAR || year > LUNAR_MAX_YEAR) {
    throw new Error(`Lunar years are supported from ${LUNAR_MIN_YEAR} to ${LUNAR_MAX_YEAR}.`);
  }
  const isLeapMonth = input.isLeapMonth ?? false;
  const solar = lunarToSolar(year, month, day, isLeapMonth);
  if (solar === null) {
    throw new LunarDateError(
      `Lunar ${input.birthDate}${isLeapMonth ? " (leap month)" : ""} does not exist in the Korean lunar calendar.`
    );
  }
  const pad = (value: number): string => String(value).padStart(2, "0");
  const solarDate = `${solar.year}-${pad(solar.month)}-${pad(solar.day)}`;
  const { calendar: _calendar, isLeapMonth: _leap, ...rest } = input;
  return {
    solarInput: { ...rest, birthDate: solarDate },
    calendar: { input: "lunar", isLeapMonth, solarDate }
  };
}

export function calculatePillars(input: BirthInput): PillarsResult {
  return calculatePillarsWithResolution(input).pillars;
}

/**
 * The normalized KST wall clock the pillars are calculated from (lunar → solar,
 * UTC+8:30 / summer-time history applied, 진태양시 not applied). Time-less input
 * keeps hour/minute undefined. Used by L2 blocks that measure from the birth
 * instant (대운 절입 거리).
 */
export function resolveBirthKst(input: BirthInput): ParsedBirthDateTime {
  const { solarInput } = resolveCalendar(input);
  return normalizeToKstWallClock(parseBirthDateTime(solarInput)).kst;
}

function timeKnown(value: ParsedBirthDateTime): value is ParsedBirthDateTime & { hour: number; minute: number } {
  return value.hour !== undefined && value.minute !== undefined;
}

/**
 * Day and hour pillars for one policy. Order: KST wall clock → (true solar
 * time: shift by the longitude minutes) → (dayBoundary: pick the civil date
 * that owns the day pillar) → (jaHourPolicy "early": 23:xx belongs to the
 * next day) → hour pillar from the day stem. Year and month never move here.
 */
function assembleDayAndTime(
  kst: ParsedBirthDateTime,
  yearAndMonth: { year: Pillar; month: Pillar },
  policy: Policy,
  trueSolarOffsetMin: number
): PillarsResult {
  if (!timeKnown(kst)) {
    return { ...yearAndMonth, day: dayPillarFromEpochDay(epochDayKst(kst)) };
  }

  const reading = policy.trueSolarTime ? shiftMinutes(kst, trueSolarOffsetMin) : kst;
  let dayEpoch = epochDayKst(policy.dayBoundary === "trueSolar" ? reading : kst);
  if (policy.jaHourPolicy === "early" && reading.hour === 23) {
    // 조자시: the 23:xx hour already belongs to the next day — the day after
    // the reading's own date (which is the KST date when the shift crossed midnight).
    dayEpoch = epochDayKst(reading) + 1;
  }
  const day = dayPillarFromEpochDay(dayEpoch);

  return {
    ...yearAndMonth,
    day,
    time: timePillarForDay(day.stem as Stem, reading.hour, reading.minute)
  };
}

function shiftMinutes(value: ParsedBirthDateTime & { hour: number; minute: number }, minutes: number): ParsedBirthDateTime & { hour: number; minute: number } {
  const shifted = new Date(Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute + minutes));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    timezone: value.timezone
  };
}

function collectAlternates(
  base: PillarsResult,
  policy: Policy,
  assemble: (variant: Policy) => PillarsResult,
  trueSolarOffsetMin: number
): PillarsAlternates | undefined {
  const alternates: PillarsAlternates = {};

  const otherSolar = assemble({ ...policy, trueSolarTime: !policy.trueSolarTime });
  if (!samePillars(base, otherSolar)) {
    alternates.trueSolarTime = {
      applied: !policy.trueSolarTime,
      appliedMinutes: policy.trueSolarTime ? 0 : trueSolarOffsetMin,
      pillars: otherSolar
    };
  }

  const otherPolicy: JaHourPolicy = policy.jaHourPolicy === "late" ? "early" : "late";
  const otherJa = assemble({ ...policy, jaHourPolicy: otherPolicy });
  if (!samePillars(base, otherJa)) {
    alternates.jaHourPolicy = { policy: otherPolicy, pillars: otherJa };
  }

  return Object.keys(alternates).length > 0 ? alternates : undefined;
}

function samePillars(a: PillarsResult, b: PillarsResult): boolean {
  const key = (pillars: PillarsResult): string =>
    ["year", "month", "day", "time"].map((slot) => {
      const pillar = pillars[slot as keyof PillarsResult];
      return pillar ? `${pillar.stem}-${pillar.branch}` : "-";
    }).join("/");
  return key(a) === key(b);
}

/** Flags on the KST wall clock, before any true-solar-time shift. */
function nearBoundaries(kst: ParsedBirthDateTime): NearBoundary[] {
  if (!timeKnown(kst)) {
    return [];
  }
  const found: NearBoundary[] = [];
  const minuteOfDay = kst.hour * 60 + kst.minute;

  // 시지 경계: odd whole hours, i.e. 60, 180, …, 1380 and 23:00 → 1380; 01:00 of the next day is 1500.
  for (const boundary of [-60, 60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380, 1500]) {
    const delta = minuteOfDay - boundary;
    if (delta >= -NEAR_BOUNDARY_WINDOWS.hourBranch.before && delta <= NEAR_BOUNDARY_WINDOWS.hourBranch.after) {
      found.push({ kind: "hourBranch", minutes: delta, direction: delta < 0 ? "before" : "after" });
      break;
    }
  }

  if (minuteOfDay <= NEAR_BOUNDARY_WINDOWS.dayMidnight.after) {
    found.push({ kind: "dayMidnight", minutes: minuteOfDay, direction: "after" });
  } else if (1440 - minuteOfDay <= NEAR_BOUNDARY_WINDOWS.dayMidnight.before) {
    found.push({ kind: "dayMidnight", minutes: minuteOfDay - 1440, direction: "before" });
  }

  const term = minutesFromNearestBoundary(kst);
  if (term && term.minutes >= -NEAR_BOUNDARY_WINDOWS.solarTerm.before && term.minutes <= NEAR_BOUNDARY_WINDOWS.solarTerm.after) {
    found.push({ kind: "solarTerm", minutes: term.minutes, direction: term.minutes < 0 ? "before" : "after", term: term.term, at: term.startsAt });
  }

  return found;
}
