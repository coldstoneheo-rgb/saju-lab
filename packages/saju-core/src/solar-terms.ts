import { compareLocalMinute, localDateKey, type ParsedBirthDateTime } from "./datetime.js";
import { IPCHUN_BY_YEAR, SOLAR_MONTH_BOUNDARIES } from "./solar-terms.data.js";

/** A time-less birth on a 절입 date cannot be placed in a month: the caller must supply birthTime. */
export class BirthTimeRequiredError extends Error {}

export interface SolarMonthBoundary {
  term: "ipchun" | "gyeongchip" | "cheongmyeong" | "ipha" | "mangjong" | "soseo" | "ipchu" | "baengno" | "hallo" | "ipdong" | "daeseol" | "sohan";
  startsAt: string;
  solarYear: number;
  monthOrdinal: number;
}

// The tables live in a generated module so the KASI fixture stays the single
// source of truth; see scripts/generate_solar_terms_module.py.
export { IPCHUN_BY_YEAR, SOLAR_MONTH_BOUNDARIES };

const MAX_SOLAR_MONTH_SPAN_MINUTES = 45 * 24 * 60;

export function effectiveSolarYear(dateTime: ParsedBirthDateTime, boundaryDateSlackDays = 0): number {
  const ipchun = IPCHUN_BY_YEAR[dateTime.year];

  if (ipchun === undefined) {
    throw new Error(`No Ipchun boundary is available for ${dateTime.year}.`);
  }

  assertKnownTimeAwayFromBoundaryDate(dateTime, boundaryDateSlackDays);

  return compareLocalMinute(dateTime, ipchun) >= 0 ? dateTime.year : dateTime.year - 1;
}

export function solarMonthBoundary(dateTime: ParsedBirthDateTime, boundaryDateSlackDays = 0): SolarMonthBoundary {
  assertKnownTimeAwayFromBoundaryDate(dateTime, boundaryDateSlackDays);

  const boundaryIndex = findActiveBoundaryIndex(dateTime);

  if (boundaryIndex === -1) {
    throw new Error("No solar month boundary is available for the given date.");
  }

  const boundary = SOLAR_MONTH_BOUNDARIES[boundaryIndex];
  const nextBoundary = SOLAR_MONTH_BOUNDARIES[boundaryIndex + 1];

  if (boundary === undefined) {
    throw new Error("No solar month boundary is available for the given date.");
  }

  if (nextBoundary === undefined) {
    throw new Error("No upper solar month boundary is available for the given date.");
  }

  if (minutesBetween(boundary.startsAt, nextBoundary.startsAt) > MAX_SOLAR_MONTH_SPAN_MINUTES) {
    throw new Error("No upper solar month boundary is available for the given date.");
  }

  return boundary;
}

/**
 * Signed minutes from the nearest month-boundary 절입 to a known-time KST
 * reading (negative = before the boundary). Used for the nearBoundary flag.
 */
export function minutesFromNearestBoundary(dateTime: ParsedBirthDateTime): { term: SolarMonthBoundary["term"]; startsAt: string; minutes: number } | undefined {
  if (dateTime.hour === undefined || dateTime.minute === undefined) {
    return undefined;
  }
  const value = Date.UTC(dateTime.year, dateTime.month - 1, dateTime.day, dateTime.hour, dateTime.minute) / 60_000;
  let best: { term: SolarMonthBoundary["term"]; startsAt: string; minutes: number } | undefined;
  for (const boundary of SOLAR_MONTH_BOUNDARIES) {
    const delta = value - localMinuteValue(boundary.startsAt);
    if (best === undefined || Math.abs(delta) < Math.abs(best.minutes)) {
      best = { term: boundary.term, startsAt: boundary.startsAt, minutes: delta };
    }
    if (delta < -60) {
      break; // the table is sorted; nothing later can be closer
    }
  }
  return best;
}

function findActiveBoundaryIndex(dateTime: ParsedBirthDateTime): number {
  let activeBoundaryIndex = -1;

  for (let index = 0; index < SOLAR_MONTH_BOUNDARIES.length; index += 1) {
    const boundary = SOLAR_MONTH_BOUNDARIES[index];

    if (boundary === undefined) {
      break;
    }

    if (compareLocalMinute(dateTime, boundary.startsAt) >= 0) {
      activeBoundaryIndex = index;
    } else {
      break;
    }
  }

  return activeBoundaryIndex;
}

// A time-less birth cannot be placed on a boundary date. The table is in KST;
// when the civil clock of the day was not UTC+9 the boundary may fall on the
// neighbouring civil date, so `boundaryDateSlackDays` widens the check.
function assertKnownTimeAwayFromBoundaryDate(dateTime: ParsedBirthDateTime, boundaryDateSlackDays: number): void {
  if (dateTime.hour !== undefined && dateTime.minute !== undefined) {
    return;
  }

  const dateKeys = neighbouringDateKeys(dateTime, boundaryDateSlackDays);
  const isBoundaryDate = dateKeys.some((dateKey) =>
    Object.values(IPCHUN_BY_YEAR).some((startsAt) => startsAt.startsWith(`${dateKey}T`)) ||
    SOLAR_MONTH_BOUNDARIES.some((boundary) => boundary.startsAt.startsWith(`${dateKey}T`))
  );

  if (isBoundaryDate) {
    throw new BirthTimeRequiredError("birthTime is required on solar-term boundary dates.");
  }
}

function neighbouringDateKeys(dateTime: ParsedBirthDateTime, slackDays: number): string[] {
  const keys: string[] = [];
  for (let offset = -slackDays; offset <= slackDays; offset += 1) {
    const shifted = new Date(Date.UTC(dateTime.year, dateTime.month - 1, dateTime.day + offset));
    keys.push(localDateKey({ year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() }));
  }
  return keys;
}

function minutesBetween(left: string, right: string): number {
  return localMinuteValue(right) - localMinuteValue(left);
}

function localMinuteValue(value: string): number {
  const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2})$/.exec(value);

  if (!match?.groups) {
    throw new Error("Solar month boundary must use YYYY-MM-DDTHH:mm format.");
  }

  return Date.UTC(
    Number(match.groups.year),
    Number(match.groups.month) - 1,
    Number(match.groups.day),
    Number(match.groups.hour),
    Number(match.groups.minute)
  ) / 60_000;
}
