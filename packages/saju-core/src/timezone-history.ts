import type { ParsedBirthDateTime } from "./datetime.js";
import {
  KOREA_OFFSET_HISTORY_START_UTC,
  KOREA_OFFSET_INTERVALS,
  KST_OFFSET_MINUTES,
  type KoreaOffsetInterval
} from "./timezone-history.data.js";

export type BirthTimeFlag = "utc+8:30" | "dst" | "ambiguous" | "nonexistent";

export interface BirthTimeResolution {
  /** Minutes subtracted from the birth wall clock to reach KST (UTC+9). 0 = nothing changed. */
  appliedOffsetMin: number;
  flags: BirthTimeFlag[];
}

export interface NormalizedBirthDateTime {
  /** The wall clock to use for every calculation: solar-term comparison, day pillar, hour pillar. */
  kst: ParsedBirthDateTime;
  resolution: BirthTimeResolution;
}

/**
 * Bring a Korean civil birth time onto the fixed UTC+9 wall clock that the
 * KASI solar-term table uses. Between 1908 and 1961 the standard offset was
 * +08:30 for two periods, and summer time (+1h) ran in 1948-51, 1955-60 and
 * 1987-88; a clock reading from those periods is not a KST reading.
 *
 * kst = local − (offsetAt(local) − 540 min). When the local reading falls in a
 * repeated hour (DST end) the first occurrence wins and `ambiguous` is set;
 * when it falls in a skipped hour (DST start, 1961-08-10 00:00-00:29) the
 * pre-transition offset is kept and `nonexistent` is set.
 *
 * A birth with no time is resolved at noon: the date is left alone and only
 * the offset is reported, because a ±60 min shift cannot be applied to an
 * unknown time and noon never sits in a transition window.
 */
export function normalizeToKstWallClock(local: ParsedBirthDateTime): NormalizedBirthDateTime {
  const timeKnown = local.hour !== undefined && local.minute !== undefined;
  const wallMinutes = wallClockMinutes(local.year, local.month, local.day, local.hour ?? 12, local.minute ?? 0);

  const { interval, ambiguous, nonexistent, gapInto } = resolveInterval(wallMinutes);
  const appliedOffsetMin = interval.offsetMinutes - KST_OFFSET_MINUTES;

  // `utc+8:30` = the standard offset of the interval is +08:30 (1908-1911, 1954-1961), regardless of
  // summer time; `dst` = summer time was in force (or, for a skipped reading, was about to start — A15).
  const flags: BirthTimeFlag[] = [];
  if (interval.offsetMinutes % 60 === 30) {
    flags.push("utc+8:30");
  }
  if (interval.kind === "dst" || (timeKnown && nonexistent && gapInto?.kind === "dst")) {
    flags.push("dst");
  }
  if (timeKnown && ambiguous) {
    flags.push("ambiguous");
  }
  if (timeKnown && nonexistent) {
    flags.push("nonexistent");
  }

  const kst: ParsedBirthDateTime =
    timeKnown && appliedOffsetMin !== 0
      ? { ...fromWallClockMinutes(wallMinutes - appliedOffsetMin), timezone: local.timezone }
      : local;

  return { kst, resolution: { appliedOffsetMin, flags } };
}

function resolveInterval(wallMinutes: number): { interval: KoreaOffsetInterval; ambiguous: boolean; nonexistent: boolean; gapInto?: KoreaOffsetInterval } {
  const matches = KOREA_OFFSET_INTERVALS.filter((row) => {
    const utc = wallMinutes - row.offsetMinutes;
    return utc >= isoMinutes(row.fromUtc) && (row.toUtc === null || utc < isoMinutes(row.toUtc));
  });

  if (matches.length > 0) {
    const interval = matches[0];
    if (interval === undefined) {
      throw new Error("Korean civil time history has no matching interval.");
    }
    return { interval, ambiguous: matches.length > 1, nonexistent: false };
  }

  // No interval claims this reading: either before the history starts, or a
  // wall-clock reading that the clocks skipped over. Keep the interval that
  // was in force just before the gap.
  const earliest = KOREA_OFFSET_INTERVALS[0];
  if (earliest === undefined || wallMinutes - earliest.offsetMinutes < isoMinutes(KOREA_OFFSET_HISTORY_START_UTC)) {
    throw new Error("Korean civil time before 1908-04-01 (LMT) is not supported.");
  }

  let before: KoreaOffsetInterval | undefined;
  for (const row of KOREA_OFFSET_INTERVALS) {
    if (row.toUtc !== null && wallMinutes - row.offsetMinutes >= isoMinutes(row.toUtc)) {
      before = row;
    }
  }
  if (before === undefined) {
    throw new Error("Korean civil time history has no matching interval.");
  }
  // The interval the clocks jumped into (the one starting where `before` ends) — reported so the
  // caller can flag a DST-start gap as `dst` as well as `nonexistent`.
  const gapInto = KOREA_OFFSET_INTERVALS.find((row) => before !== undefined && row.fromUtc === before.toUtc);
  return { interval: before, ambiguous: false, nonexistent: true, ...(gapInto ? { gapInto } : {}) };
}

/** Wall-clock fields read as if they were UTC, in minutes since the epoch. No timezone math. */
function wallClockMinutes(year: number, month: number, day: number, hour: number, minute: number): number {
  return Date.UTC(year, month - 1, day, hour, minute) / 60_000;
}

function fromWallClockMinutes(minutes: number): Omit<ParsedBirthDateTime, "timezone"> {
  const date = new Date(minutes * 60_000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes()
  };
}

function isoMinutes(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Timezone history instant must use YYYY-MM-DDTHH:mm: ${value}`);
  }
  return wallClockMinutes(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5]));
}
