import type { Pillar } from "./types.js";

export const STEMS = ["gap", "eul", "byeong", "jeong", "mu", "gi", "gyeong", "sin", "im", "gye"] as const;
export const BRANCHES = ["ja", "chuk", "in", "myo", "jin", "sa", "o", "mi", "sin", "yu", "sul", "hae"] as const;

export type Stem = (typeof STEMS)[number];
export type Branch = (typeof BRANCHES)[number];

const TIGER_MONTH_START_STEM_BY_YEAR_STEM: Record<Stem, number> = {
  gap: 2,
  gi: 2,
  eul: 4,
  gyeong: 4,
  byeong: 6,
  sin: 6,
  jeong: 8,
  im: 8,
  mu: 0,
  gye: 0
};

const ZI_HOUR_START_STEM_BY_DAY_STEM: Record<Stem, number> = {
  gap: 0,
  gi: 0,
  eul: 2,
  gyeong: 2,
  byeong: 4,
  sin: 4,
  jeong: 6,
  im: 6,
  mu: 8,
  gye: 8
};

export function cyclePillar(index: number): Pillar {
  const normalized = mod(index, 60);

  return {
    stem: at(STEMS, normalized % STEMS.length),
    branch: at(BRANCHES, normalized % BRANCHES.length)
  };
}

export function yearPillarForSolarYear(year: number): Pillar {
  return cyclePillar(year - 4);
}

export function monthPillarForSolarMonth(solarYear: number, monthOrdinal: number): Pillar {
  if (!Number.isInteger(monthOrdinal) || monthOrdinal < 0 || monthOrdinal > 11) {
    throw new Error("monthOrdinal must be an integer from 0 to 11.");
  }

  const yearStem = yearPillarForSolarYear(solarYear).stem as Stem;
  const tigerStemIndex = TIGER_MONTH_START_STEM_BY_YEAR_STEM[yearStem];

  return {
    stem: at(STEMS, (tigerStemIndex + monthOrdinal) % STEMS.length),
    branch: at(BRANCHES, (2 + monthOrdinal) % BRANCHES.length)
  };
}

export function dayPillarFromEpochDay(epochDay: number): Pillar {
  // 1990-01-01 is widely listed as Bing Yin day; that fixes the UTC-day offset.
  return cyclePillar(epochDay + 17);
}

export function timePillarForDay(dayStem: Stem, hour: number, minute = 0): Pillar {
  const branchIndex = hourBranchIndexAtMinute(hour, minute);
  const ziStemIndex = ZI_HOUR_START_STEM_BY_DAY_STEM[dayStem];

  return {
    stem: at(STEMS, (ziStemIndex + branchIndex) % STEMS.length),
    branch: at(BRANCHES, branchIndex)
  };
}

export function hourBranchIndex(hour: number): number {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error("hour must be an integer from 0 to 23.");
  }

  return Math.floor(((hour + 1) % 24) / 2);
}

/**
 * Minute-level hour branch. The twelve 시지 open at the odd whole hours
 * (자 23:00, 축 01:00, 인 03:00 …), so the minute only matters once a
 * true-solar-time correction has moved the reading across one of them.
 */
export function hourBranchIndexAtMinute(hour: number, minute: number): number {
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error("minute must be an integer from 0 to 59.");
  }
  hourBranchIndex(hour);

  const minuteOfDay = hour * 60 + minute;
  return Math.floor(((minuteOfDay + 60) % 1440) / 120);
}

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function at<const T>(items: readonly T[], index: number): T {
  const item = items[index];

  if (item === undefined) {
    throw new Error(`Cycle index out of range: ${index}`);
  }

  return item;
}
