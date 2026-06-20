import { analyzeFiveElements } from "./five-elements.js";
import { calculatePillars } from "./pillars.js";
import type {
  BirthInput,
  FiveElement,
  FiveElementDistribution,
  PillarsResult,
  Sex
} from "./types.js";

// Stable contract identifier. Bump only on a breaking change; additive fields stay v1.
export const SAJU_PILLARS_CONTRACT = "saju-pillars-v1" as const;
export type SajuPillarsContract = typeof SAJU_PILLARS_CONTRACT;

export type CalendarSystem = "solar" | "lunar";

export interface SajuPillarsV1Request {
  /** Optional echo of the contract id; ignored if present. */
  contract?: SajuPillarsContract;
  /** Birth date in the supplied calendar system, formatted YYYY-MM-DD. */
  birthDate: string;
  /** Birth time HH:mm (24h). Required unless timeUnknown is true. */
  birthTime?: string;
  /** When true, birthTime is ignored and only 3 pillars are produced. */
  timeUnknown?: boolean;
  /** Calendar of birthDate. v1 supports "solar" only. */
  calendar: CalendarSystem;
  /** IANA timezone. Defaults to Asia/Seoul. */
  timezone?: string;
  sex: Sex;
}

export interface SajuPillarsV1Response {
  contract: SajuPillarsContract;
  /** Whether the time pillar is present (false when timeUnknown). */
  timeKnown: boolean;
  pillars: PillarsResult;
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

export type SajuPillarsV1ErrorCode =
  | "INVALID_BODY"
  | "INVALID_CALENDAR"
  | "UNSUPPORTED_CALENDAR"
  | "UNSUPPORTED_TIMEZONE"
  | "INVALID_BIRTH_DATE"
  | "MISSING_BIRTH_TIME"
  | "INVALID_BIRTH_TIME"
  | "INVALID_SEX"
  | "OUT_OF_SUPPORTED_RANGE";

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

  if (body.calendar !== "solar" && body.calendar !== "lunar") {
    return failure("INVALID_CALENDAR", "calendar must be 'solar' or 'lunar'.", "calendar");
  }
  if (body.calendar === "lunar") {
    return failure(
      "UNSUPPORTED_CALENDAR",
      "saju-pillars-v1 supports the solar calendar only; convert lunar dates before calling.",
      "calendar"
    );
  }

  if (typeof body.birthDate !== "string" || !DATE_PATTERN.test(body.birthDate)) {
    return failure("INVALID_BIRTH_DATE", "birthDate must be formatted YYYY-MM-DD.", "birthDate");
  }
  // Format alone admits impossible dates (e.g. 2023-02-29). The engine would reject
  // them too, but catch it here so the consumer gets INVALID_BIRTH_DATE rather than a
  // misleading OUT_OF_SUPPORTED_RANGE.
  if (!isRealCalendarDate(body.birthDate)) {
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

  const birthInput: BirthInput = {
    birthDate: body.birthDate,
    timezone,
    sex: body.sex as Sex,
    ...(timeUnknown ? {} : { birthTime: body.birthTime as string })
  };

  let pillars: PillarsResult;
  try {
    pillars = calculatePillars(birthInput);
  } catch {
    return failure(
      "OUT_OF_SUPPORTED_RANGE",
      "This birth date is outside the verified calculation range supported by saju-pillars-v1."
    );
  }

  const analysis = analyzeFiveElements(pillars);

  return {
    ok: true,
    status: 200,
    data: {
      contract: SAJU_PILLARS_CONTRACT,
      timeKnown: Boolean(pillars.time),
      pillars,
      fiveElements: {
        distribution: analysis.distribution,
        absent: analysis.absent,
        deficient: analysis.deficient,
        supplementPriority: analysis.supplementPriority
      }
    }
  };
}
