import { LUNAR_ANCHOR_EPOCH_DAY, LUNAR_MAX_YEAR, LUNAR_MIN_YEAR, LUNAR_YEAR_DATA } from "./lunar-calendar.data.js";

/**
 * Korean lunar → Gregorian conversion on the embedded KARI table.
 *
 * Contract (same as the Kotlin original in baby-naming-ai): a date that does
 * not exist — a year outside 1900..2050, a leap month the year does not have,
 * day 30 of a 29-day month — returns null. Nothing is silently moved to a
 * nearby date, because a non-existent birthday would otherwise surface as a
 * wrong day pillar.
 */

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

function yearData(year: number): number {
  return LUNAR_YEAR_DATA[year - LUNAR_MIN_YEAR] as number;
}

function leapMonthOf(value: number): number {
  return (value >> 12) & 0xf;
}

function yearDaysOf(value: number): number {
  return (value >> 17) & 0x1ff;
}

function monthDaysOf(value: number, month: number, isLeap: boolean): number {
  if (isLeap) {
    return ((value >> 16) & 1) === 1 ? 30 : 29;
  }
  return ((value >> (12 - month)) & 1) === 1 ? 30 : 29;
}

function inRange(year: number): boolean {
  return Number.isInteger(year) && year >= LUNAR_MIN_YEAR && year <= LUNAR_MAX_YEAR;
}

/** The leap month number (1..12) of a lunar year, or 0 when it has none or is out of range. */
export function leapMonth(year: number): number {
  return inRange(year) ? leapMonthOf(yearData(year)) : 0;
}

/** Total days of a lunar year (354..385), or null out of range. */
export function lunarYearDays(year: number): number | null {
  return inRange(year) ? yearDaysOf(yearData(year)) : null;
}

/** Days in a lunar month (29 or 30); null for a month that does not exist. */
export function daysInLunarMonth(year: number, month: number, isLeapMonth = false): number | null {
  if (!inRange(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  const value = yearData(year);
  if (isLeapMonth && leapMonthOf(value) !== month) {
    return null;
  }
  return monthDaysOf(value, month, isLeapMonth);
}

/** Lunar (year, month, day[, leap]) → Gregorian date, or null when the lunar date does not exist. */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth = false): SolarDate | null {
  const daysInMonth = daysInLunarMonth(year, month, isLeapMonth);
  if (daysInMonth === null || !Number.isInteger(day) || day < 1 || day > daysInMonth) {
    return null;
  }

  const value = yearData(year);
  let days = 0;
  for (let y = LUNAR_MIN_YEAR; y < year; y += 1) {
    days += yearDaysOf(yearData(y));
  }
  for (let m = 1; m < month; m += 1) {
    days += monthDaysOf(value, m, false);
  }
  // A leap month follows the regular month of the same number. Months after
  // it are pushed back by its length; asking for the leap month itself means
  // the regular month of that number has already passed too.
  const leap = leapMonthOf(value);
  if (leap !== 0 && leap < month) {
    days += monthDaysOf(value, leap, true);
  }
  if (isLeapMonth) {
    days += monthDaysOf(value, month, false);
  }
  days += day - 1;

  const date = new Date((LUNAR_ANCHOR_EPOCH_DAY + days) * 86_400_000);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}
