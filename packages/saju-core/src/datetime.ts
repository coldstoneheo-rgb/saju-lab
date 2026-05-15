import type { BirthInput } from "./types.js";

export interface ParsedBirthDateTime {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  timezone: "Asia/Seoul";
}

export function parseBirthDateTime(input: BirthInput): ParsedBirthDateTime {
  if (input.timezone !== "Asia/Seoul") {
    throw new Error("Only Asia/Seoul timezone is supported in the current calculation core.");
  }

  const date = parseGregorianDate(input.birthDate);

  if (input.birthTime === undefined) {
    return { ...date, timezone: "Asia/Seoul" };
  }

  const time = parseTime(input.birthTime);

  return {
    ...date,
    ...time,
    timezone: "Asia/Seoul"
  };
}

export function epochDayKst(date: Pick<ParsedBirthDateTime, "year" | "month" | "day">): number {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000);
}

export function compareLocalMinute(
  left: Pick<ParsedBirthDateTime, "year" | "month" | "day"> & { hour?: number; minute?: number },
  right: string
): number {
  const leftValue = toComparableLocalMinute(left);

  return leftValue < right ? -1 : leftValue > right ? 1 : 0;
}

export function localDateKey(value: Pick<ParsedBirthDateTime, "year" | "month" | "day">): string {
  return `${pad(value.year, 4)}-${pad(value.month, 2)}-${pad(value.day, 2)}`;
}

function parseGregorianDate(value: string): { year: number; month: number; day: number } {
  const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec(value);

  if (!match?.groups) {
    throw new Error("birthDate must use YYYY-MM-DD format.");
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("birthDate must be a valid Gregorian date.");
  }

  return { year, month, day };
}

function parseTime(value: string): { hour: number; minute: number } {
  const match = /^(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d)$/.exec(value);

  if (!match?.groups) {
    throw new Error("birthTime must use HH:mm in 24-hour format.");
  }

  return {
    hour: Number(match.groups.hour),
    minute: Number(match.groups.minute)
  };
}

function toComparableLocalMinute(value: Pick<ParsedBirthDateTime, "year" | "month" | "day"> & { hour?: number; minute?: number }): string {
  const hour = value.hour ?? 12;
  const minute = value.minute ?? 0;

  return `${localDateKey(value)}T${pad(hour, 2)}:${pad(minute, 2)}`;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0");
}
