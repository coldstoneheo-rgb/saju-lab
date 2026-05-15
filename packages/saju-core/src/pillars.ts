import { dayPillarFromEpochDay, monthPillarForSolarMonth, timePillarForDay, yearPillarForSolarYear, type Stem } from "./cycle.js";
import { epochDayKst, parseBirthDateTime } from "./datetime.js";
import { effectiveSolarYear, solarMonthBoundary } from "./solar-terms.js";
import type { BirthInput, PillarsResult } from "./types.js";

export function calculatePillars(input: BirthInput): PillarsResult {
  const dateTime = parseBirthDateTime(input);
  const solarYear = effectiveSolarYear(dateTime);
  const monthBoundary = solarMonthBoundary(dateTime);
  const dayPillar = dayPillarFromEpochDay(epochDayKst(dateTime));

  return {
    year: yearPillarForSolarYear(solarYear),
    month: monthPillarForSolarMonth(monthBoundary.solarYear, monthBoundary.monthOrdinal),
    day: dayPillar,
    ...(dateTime.hour !== undefined ? { time: timePillarForDay(dayPillar.stem as Stem, dateTime.hour) } : {})
  };
}
