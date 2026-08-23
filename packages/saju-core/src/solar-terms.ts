import { compareLocalMinute, localDateKey, type ParsedBirthDateTime } from "./datetime.js";
import { IPCHUN_BY_YEAR, SOLAR_MONTH_BOUNDARIES } from "./solar-terms.data.js";

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

export function effectiveSolarYear(dateTime: ParsedBirthDateTime): number {
  const ipchun = IPCHUN_BY_YEAR[dateTime.year];

  if (ipchun === undefined) {
    throw new Error(`No Ipchun boundary is available for ${dateTime.year}.`);
  }

  assertKnownTimeAwayFromBoundaryDate(dateTime);

  return compareLocalMinute(dateTime, ipchun) >= 0 ? dateTime.year : dateTime.year - 1;
}

export function solarMonthBoundary(dateTime: ParsedBirthDateTime): SolarMonthBoundary {
  assertKnownTimeAwayFromBoundaryDate(dateTime);

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

function assertKnownTimeAwayFromBoundaryDate(dateTime: ParsedBirthDateTime): void {
  if (dateTime.hour !== undefined && dateTime.minute !== undefined) {
    return;
  }

  const dateKey = localDateKey(dateTime);
  const isBoundaryDate = Object.values(IPCHUN_BY_YEAR).some((startsAt) => startsAt.startsWith(`${dateKey}T`)) ||
    SOLAR_MONTH_BOUNDARIES.some((boundary) => boundary.startsAt.startsWith(`${dateKey}T`));

  if (isBoundaryDate) {
    throw new Error("birthTime is required on solar-term boundary dates.");
  }
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
