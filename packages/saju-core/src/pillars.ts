import type { BirthInput, Pillar, PillarsResult } from "./types.js";

const STEMS = ["gap", "eul", "byeong", "jeong", "mu", "gi", "gyeong", "sin", "im", "gye"] as const;
const BRANCHES = ["ja", "chuk", "in", "myo", "jin", "sa", "o", "mi", "sin", "yu", "sul", "hae"] as const;

export function calculatePillars(input: BirthInput): PillarsResult {
  validateBirthInput(input);

  const date = parseGregorianDate(input.birthDate);
  const yearPillar = cyclePillar(date.year - 4);
  const monthPillar = cyclePillar(date.year * 12 + date.month - 1);
  const dayPillar = cyclePillar(daysSinceUnixEpoch(date) + 40);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    ...(input.birthTime ? { time: cyclePillar(hourBranchIndex(input.birthTime)) } : {})
  };
}

function validateBirthInput(input: BirthInput): void {
  parseGregorianDate(input.birthDate);

  if (input.birthTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.birthTime)) {
    throw new Error("birthTime must use HH:mm in 24-hour format.");
  }

  if (!input.timezone) {
    throw new Error("timezone is required.");
  }
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

function cyclePillar(index: number): Pillar {
  const normalized = mod(index, 60);

  return {
    stem: at(STEMS, normalized % STEMS.length),
    branch: at(BRANCHES, normalized % BRANCHES.length)
  };
}

function daysSinceUnixEpoch(date: { year: number; month: number; day: number }): number {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000);
}

function hourBranchIndex(value: string): number {
  const hour = Number(value.slice(0, 2));
  return Math.floor(((hour + 1) % 24) / 2);
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
