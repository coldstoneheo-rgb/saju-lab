import { analyzeFiveElements } from "./five-elements.js";
import { findBirthPlace } from "./birth-place.data.js";
import { calculatePillarsWithResolution, LunarDateError, resolveBirthKst, type CalculationResolution, type PillarsAlternates } from "./pillars.js";
import { BirthTimeRequiredError } from "./solar-terms.js";
import { DEFAULT_HIDDEN_STEM_SCHOOL, hiddenStemsOf, type HiddenStems } from "./l2/hidden-stems.data.js";
import { tenGodsOfChart, type ChartTenGods } from "./l2/ten-gods.js";
import { interactionsOfChart, type ChartInteractions } from "./l2/interactions.js";
import { daeunOf, isDaeunUnavailable, type DaeunBlock } from "./l2/daeun.js";
import type { Branch } from "./cycle.js";
import type {
  BirthInput,
  CalculationOptions,
  CalendarSystem,
  FiveElement,
  FiveElementDistribution,
  PillarsResult,
  Sex
} from "./types.js";

// Stable contract identifier. Bump only on a breaking change; additive fields stay v1.
export const SAJU_PILLARS_CONTRACT = "saju-pillars-v1" as const;
export type SajuPillarsContract = typeof SAJU_PILLARS_CONTRACT;

export type { CalendarSystem } from "./types.js";

export interface SajuPillarsV1Request {
  /** Optional echo of the contract id; ignored if present. */
  contract?: SajuPillarsContract;
  /** Birth date in the supplied calendar system, formatted YYYY-MM-DD. */
  birthDate: string;
  /** Birth time HH:mm (24h). Required unless timeUnknown is true. */
  birthTime?: string;
  /** When true, birthTime is ignored and only 3 pillars are produced. */
  timeUnknown?: boolean;
  /** Calendar of birthDate: "solar" (Gregorian) or "lunar" (Korean lunar, 1900..2050; 2026-09-22 additive). */
  calendar: CalendarSystem;
  /** Lunar only: birthDate is in that year's leap month (윤달). Default false. */
  isLeapMonth?: boolean;
  /** IANA timezone. Defaults to Asia/Seoul. */
  timezone?: string;
  sex: Sex;
  /** 시·도 code (birth-place.data.ts). Defaults to "seoul"; only changes the result with options.trueSolarTime. */
  birthPlace?: string;
  /** Calculation options. Omitted = current behaviour (no true solar time, 야자시, KST midnight). */
  options?: CalculationOptions;
}

export interface SajuPillarsV1Response {
  contract: SajuPillarsContract;
  /** Whether the time pillar is present (false when timeUnknown). */
  timeKnown: boolean;
  pillars: PillarsResult;
  /**
   * How the birth wall clock was mapped onto KST (UTC+9) before calculating.
   * `appliedOffsetMin` is 0 and `flags` empty for every birth on plain KST;
   * non-zero only for 1908-1961 standard-time periods and summer-time dates.
   */
  resolution: CalculationResolution;
  /**
   * The other reading for each option, only when it changes the pillars:
   * `trueSolarTime` = the opposite of the applied true-solar-time setting,
   * `jaHourPolicy` = the opposite 23시대 policy. Absent when nothing differs
   * or when the birth time is unknown.
   */
  alternates?: PillarsAlternates;
  /** 지장간 per pillar — only with options.include "hiddenStems". Day counts are data, never weighted. */
  hiddenStems?: ChartHiddenStems;
  /** 십신 per pillar — only with options.include "tenGods". */
  tenGods?: ChartTenGods;
  /** 합충형 — only with options.include "interactions". Existence and position only; no 化 judgement, no weighting. */
  interactions?: ChartInteractions;
  /** 대운 — only with options.include "daeun". Minute-precision decimals, no rounding; null (with daeunReason) when the reference 절 is outside the solar-term table. */
  daeun?: DaeunBlock | null;
  daeunReason?: "OUT_OF_SOLAR_TERM_TABLE";
  fiveElements: {
    /** Count of each element across the counted stems and branches. */
    distribution: FiveElementDistribution;
    /** Elements entirely missing from the chart. */
    absent: FiveElement[];
    /** Below-average elements, most lacking first. */
    deficient: FiveElement[];
    /** All five elements ranked most-needed first — the naming target order. */
    supplementPriority: FiveElement[];
  };
}

export interface ChartHiddenStems {
  school: "yeonhae" | "japyeong";
  year: HiddenStems;
  month: HiddenStems;
  day: HiddenStems;
  time?: HiddenStems;
}

/** Every 400 code this builder can emit. docs/SAJU_PILLARS_API_V1.md's error table is tested against this list. */
export const SAJU_PILLARS_V1_ERROR_CODES = [
  "INVALID_BODY",
  "INVALID_CALENDAR",
  "UNSUPPORTED_TIMEZONE",
  "INVALID_BIRTH_DATE",
  "MISSING_BIRTH_TIME",
  "INVALID_BIRTH_TIME",
  "INVALID_SEX",
  "INVALID_BIRTH_PLACE",
  "INVALID_OPTIONS",
  "INVALID_LUNAR_DATE",
  "OUT_OF_SUPPORTED_RANGE"
] as const;
export type SajuPillarsV1ErrorCode = (typeof SAJU_PILLARS_V1_ERROR_CODES)[number];

/** Top-level request keys. A key that matches one of these only case-insensitively is a typo, not an extension (A4). */
const KNOWN_BODY_KEYS = ["contract", "birthDate", "birthTime", "timeUnknown", "calendar", "isLeapMonth", "timezone", "sex", "birthPlace", "options"] as const;

export interface SajuPillarsV1Error {
  contract: SajuPillarsContract;
  error: {
    code: SajuPillarsV1ErrorCode;
    message: string;
    field?: string;
  };
}

export type SajuPillarsV1Result =
  | { ok: true; status: 200; data: SajuPillarsV1Response }
  | { ok: false; status: 400; error: SajuPillarsV1Error };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const SEXES: readonly Sex[] = ["male", "female", "other"];
const DEFAULT_TIMEZONE = "Asia/Seoul";

function isRealCalendarDate(value: string): boolean {
  const parts = value.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

function failure(
  code: SajuPillarsV1ErrorCode,
  message: string,
  field?: string
): { ok: false; status: 400; error: SajuPillarsV1Error } {
  return {
    ok: false,
    status: 400,
    error: {
      contract: SAJU_PILLARS_CONTRACT,
      error: field ? { code, message, field } : { code, message }
    }
  };
}

/** undefined = no options given; null = malformed; otherwise the validated options. */
function parseOptions(value: unknown): CalculationOptions | undefined | null {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const options: CalculationOptions = {};
  for (const key of Object.keys(raw)) {
    if (key === "trueSolarTime" && typeof raw[key] === "boolean") {
      options.trueSolarTime = raw[key] as boolean;
    } else if (key === "jaHourPolicy" && (raw[key] === "late" || raw[key] === "early")) {
      options.jaHourPolicy = raw[key] as "late" | "early";
    } else if (key === "dayBoundary" && (raw[key] === "midnight" || raw[key] === "trueSolar")) {
      options.dayBoundary = raw[key] as "midnight" | "trueSolar";
    } else if (key === "hiddenStemSchool" && (raw[key] === "yeonhae" || raw[key] === "japyeong")) {
      options.hiddenStemSchool = raw[key] as "yeonhae" | "japyeong";
    } else if (
      key === "include" &&
      Array.isArray(raw[key]) &&
      (raw[key] as unknown[]).every((block) => block === "hiddenStems" || block === "tenGods" || block === "interactions" || block === "daeun")
    ) {
      options.include = [...new Set(raw[key] as Array<"hiddenStems" | "tenGods" | "interactions" | "daeun">)];
    } else if (key === "referenceDate" && typeof raw[key] === "string" && DATE_PATTERN.test(raw[key] as string) && isRealCalendarDate(raw[key] as string)) {
      options.referenceDate = raw[key] as string;
    } else {
      return null;
    }
  }
  return options;
}

/**
 * saju-pillars-v1 contract builder: a pure adapter over the HO-A engine
 * (calculatePillars + analyzeFiveElements). Validates an untrusted request and
 * returns either the contract response or a structured error with an HTTP status.
 * No engine logic lives here — it only composes existing outputs.
 */
export function buildSajuPillarsV1Response(request: unknown): SajuPillarsV1Result {
  if (typeof request !== "object" || request === null) {
    return failure("INVALID_BODY", "Request body must be a JSON object.");
  }

  const body = request as Partial<SajuPillarsV1Request>;

  // Unknown keys are ignored on purpose (consumers may send extra fields — baby-naming compatibility),
  // but a key that differs from a known one only by case would silently fall back to a default.
  for (const key of Object.keys(request as Record<string, unknown>)) {
    const known = KNOWN_BODY_KEYS.find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (known !== undefined && known !== key) {
      return failure("INVALID_BODY", `Unknown field "${key}" — did you mean "${known}"? Field names are case-sensitive.`, key);
    }
  }
  if (body.timeUnknown !== undefined && typeof body.timeUnknown !== "boolean") {
    return failure("INVALID_BODY", "timeUnknown must be a boolean.", "timeUnknown");
  }

  if (body.calendar !== "solar" && body.calendar !== "lunar") {
    return failure("INVALID_CALENDAR", "calendar must be 'solar' or 'lunar'.", "calendar");
  }
  if (body.isLeapMonth !== undefined && typeof body.isLeapMonth !== "boolean") {
    return failure("INVALID_LUNAR_DATE", "isLeapMonth must be a boolean.", "isLeapMonth");
  }
  if (body.calendar === "solar" && body.isLeapMonth === true) {
    return failure("INVALID_LUNAR_DATE", "isLeapMonth applies to calendar 'lunar' only.", "isLeapMonth");
  }

  if (typeof body.birthDate !== "string" || !DATE_PATTERN.test(body.birthDate)) {
    return failure("INVALID_BIRTH_DATE", "birthDate must be formatted YYYY-MM-DD.", "birthDate");
  }
  // Format alone admits impossible dates (e.g. 2023-02-29). The engine would reject
  // them too, but catch it here so the consumer gets INVALID_BIRTH_DATE rather than a
  // misleading OUT_OF_SUPPORTED_RANGE.
  if (body.calendar === "solar" && !isRealCalendarDate(body.birthDate)) {
    return failure("INVALID_BIRTH_DATE", "birthDate must be a real calendar date.", "birthDate");
  }

  if (!SEXES.includes(body.sex as Sex)) {
    return failure("INVALID_SEX", "sex must be 'male', 'female', or 'other'.", "sex");
  }

  // The engine supports Asia/Seoul only; reject anything else with a clear code
  // instead of letting calculatePillars throw into OUT_OF_SUPPORTED_RANGE.
  const timezone =
    typeof body.timezone === "string" && body.timezone ? body.timezone : DEFAULT_TIMEZONE;
  if (timezone !== DEFAULT_TIMEZONE) {
    return failure(
      "UNSUPPORTED_TIMEZONE",
      `saju-pillars-v1 supports the ${DEFAULT_TIMEZONE} timezone only.`,
      "timezone"
    );
  }

  const timeUnknown = body.timeUnknown === true;
  if (!timeUnknown) {
    if (typeof body.birthTime !== "string") {
      return failure(
        "MISSING_BIRTH_TIME",
        "birthTime is required unless timeUnknown is true.",
        "birthTime"
      );
    }
    if (!TIME_PATTERN.test(body.birthTime)) {
      return failure("INVALID_BIRTH_TIME", "birthTime must be formatted HH:mm (24h).", "birthTime");
    }
  }

  if (body.birthPlace !== undefined && (typeof body.birthPlace !== "string" || findBirthPlace(body.birthPlace) === undefined)) {
    return failure("INVALID_BIRTH_PLACE", "birthPlace must be one of the 17 시·도 codes (e.g. 'seoul').", "birthPlace");
  }

  const options = parseOptions(body.options);
  if (options === null) {
    return failure(
      "INVALID_OPTIONS",
      "options may contain trueSolarTime (boolean), jaHourPolicy ('late' | 'early'), dayBoundary ('midnight' | 'trueSolar'), include (['hiddenStems' | 'tenGods' | 'interactions' | 'daeun']), referenceDate (YYYY-MM-DD) and hiddenStemSchool ('yeonhae' | 'japyeong').",
      "options"
    );
  }

  const birthInput: BirthInput = {
    birthDate: body.birthDate,
    timezone,
    sex: body.sex as Sex,
    ...(timeUnknown ? {} : { birthTime: body.birthTime as string }),
    ...(body.calendar === "lunar" ? { calendar: "lunar" as const, isLeapMonth: body.isLeapMonth === true } : {}),
    ...(typeof body.birthPlace === "string" ? { birthPlace: body.birthPlace } : {}),
    ...(options ? { options } : {})
  };

  let pillars: PillarsResult;
  let resolution: CalculationResolution;
  let alternates: PillarsAlternates | undefined;
  try {
    ({ pillars, resolution, alternates } = calculatePillarsWithResolution(birthInput));
  } catch (caught) {
    if (caught instanceof LunarDateError) {
      return failure("INVALID_LUNAR_DATE", caught.message, "birthDate");
    }
    if (caught instanceof BirthTimeRequiredError) {
      return failure(
        "MISSING_BIRTH_TIME",
        "This birth date is a solar-term boundary date (절기 경계일); the month pillar depends on the time, so birthTime is required.",
        "birthTime"
      );
    }
    return failure(
      "OUT_OF_SUPPORTED_RANGE",
      "This birth date is outside the verified calculation range supported by saju-pillars-v1."
    );
  }

  const analysis = analyzeFiveElements(pillars);

  const include = new Set(options?.include ?? []);
  const school = options?.hiddenStemSchool ?? DEFAULT_HIDDEN_STEM_SCHOOL;
  const hiddenStems: ChartHiddenStems | undefined = include.has("hiddenStems")
    ? {
        school,
        year: hiddenStemsOf(pillars.year.branch as Branch, school),
        month: hiddenStemsOf(pillars.month.branch as Branch, school),
        day: hiddenStemsOf(pillars.day.branch as Branch, school),
        ...(pillars.time ? { time: hiddenStemsOf(pillars.time.branch as Branch, school) } : {})
      }
    : undefined;
  const tenGods = include.has("tenGods") ? tenGodsOfChart(pillars, school) : undefined;
  const interactions = include.has("interactions") ? interactionsOfChart(pillars) : undefined;
  const daeun = include.has("daeun")
    ? daeunOf(pillars, resolveBirthKst(birthInput), body.sex as Sex, { school, ...(options?.referenceDate ? { referenceDate: options.referenceDate } : {}) })
    : undefined;

  return {
    ok: true,
    status: 200,
    data: {
      contract: SAJU_PILLARS_CONTRACT,
      timeKnown: Boolean(pillars.time),
      pillars,
      resolution,
      ...(alternates ? { alternates } : {}),
      ...(hiddenStems ? { hiddenStems } : {}),
      ...(tenGods ? { tenGods } : {}),
      ...(interactions ? { interactions } : {}),
      ...(daeun ? (isDaeunUnavailable(daeun) ? { daeun: null, daeunReason: daeun.reason } : { daeun }) : {}),
      fiveElements: {
        distribution: analysis.distribution,
        absent: analysis.absent,
        deficient: analysis.deficient,
        supplementPriority: analysis.supplementPriority
      }
    }
  };
}
