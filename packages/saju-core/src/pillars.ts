import { dayPillarFromEpochDay, monthPillarForSolarMonth, timePillarForDay, yearPillarForSolarYear, type Stem } from "./cycle.js";
import { epochDayKst, parseBirthDateTime } from "./datetime.js";
import { effectiveSolarYear, solarMonthBoundary } from "./solar-terms.js";
import { normalizeToKstWallClock, type BirthTimeResolution } from "./timezone-history.js";
import type { BirthInput, PillarsResult } from "./types.js";

export interface PillarsWithResolution {
  pillars: PillarsResult;
  /** How the birth wall clock was mapped onto KST before calculating. */
  resolution: BirthTimeResolution;
}

export function calculatePillarsWithResolution(input: BirthInput): PillarsWithResolution {
  const local = parseBirthDateTime(input);
  const { kst, resolution } = normalizeToKstWallClock(local);

  // When the civil clock was not on UTC+9 the KASI boundary date may sit on
  // the neighbouring civil day, so a time-less birth must also be refused
  // around those dates.
  const boundaryDateSlackDays = resolution.appliedOffsetMin === 0 ? 0 : 1;
  const solarYear = effectiveSolarYear(kst, boundaryDateSlackDays);
  const monthBoundary = solarMonthBoundary(kst, boundaryDateSlackDays);
  const dayPillar = dayPillarFromEpochDay(epochDayKst(kst));

  return {
    pillars: {
      year: yearPillarForSolarYear(solarYear),
      month: monthPillarForSolarMonth(monthBoundary.solarYear, monthBoundary.monthOrdinal),
      day: dayPillar,
      ...(kst.hour !== undefined ? { time: timePillarForDay(dayPillar.stem as Stem, kst.hour) } : {})
    },
    resolution
  };
}

export function calculatePillars(input: BirthInput): PillarsResult {
  return calculatePillarsWithResolution(input).pillars;
}
