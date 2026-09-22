import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { hiddenStemsOf } from "./l2/hidden-stems.data.js";
import { tenGodOf } from "./l2/ten-gods.js";
import { calculatePillars, calculatePillarsWithResolution, NEAR_BOUNDARY_WINDOWS } from "./pillars.js";
import { SAJU_PILLARS_V1_ERROR_CODES, buildSajuPillarsV1Response } from "./saju-pillars-v1.js";
import { BirthTimeRequiredError, solarMonthBoundary } from "./solar-terms.js";
import type { BirthInput } from "./types.js";

/**
 * 소급 코드 검수(life-coordinator docs/CODE-REVIEW-2026-0922-saju-l1-l2.md) 보정 — 항목별 고정 테스트.
 * A = 확정 결함, B = 보류 판정, C = 미검증 분기.
 */

const API_DOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/SAJU_PILLARS_API_V1.md");
const seoul = (birthDate: string, birthTime?: string, extra: Partial<BirthInput> = {}): BirthInput =>
  ({ birthDate, ...(birthTime ? { birthTime } : {}), timezone: "Asia/Seoul", sex: "male", ...extra }) as BirthInput;
const base = { calendar: "solar" as const, sex: "male" as const };

describe("A1 — 절기 경계일 × timeUnknown", () => {
  it("the core throws a dedicated error class, not a generic Error", () => {
    expect(() => solarMonthBoundary({ year: 1958, month: 2, day: 4, timezone: "Asia/Seoul" })).toThrow(BirthTimeRequiredError);
    expect(() => calculatePillars(seoul("1958-02-04"))).toThrow(BirthTimeRequiredError);
  });

  it("v1 maps it to MISSING_BIRTH_TIME on birthTime, never OUT_OF_SUPPORTED_RANGE", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "1958-02-04", timeUnknown: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("MISSING_BIRTH_TIME");
      expect(result.error.error.field).toBe("birthTime");
      expect(result.error.error.message).toContain("절기 경계일");
    }
    // A plain time-less day still works.
    expect(buildSajuPillarsV1Response({ ...base, birthDate: "1958-02-10", timeUnknown: true }).ok).toBe(true);
  });
});

describe("A2 — resolution.calendar.solarDate vs kstDate", () => {
  it("keeps solarDate as the input clock's date and adds kstDate for the normalized day (1958-06-11 00:15 → 06-10 KST)", () => {
    const { resolution, pillars } = calculatePillarsWithResolution(seoul("1958-06-11", "00:15"));
    expect(resolution.appliedOffsetMin).toBe(30); // DST on a +08:30 base = +09:30 → 30 min ahead of KST
    expect(resolution.calendar).toEqual({ input: "solar", solarDate: "1958-06-11", kstDate: "1958-06-10" });
    // The day pillar is the one of the KST date.
    expect(pillars.day).toEqual(calculatePillars(seoul("1958-06-10", "23:45")).day);
    expect(calculatePillarsWithResolution(seoul("1958-06-10", "23:45")).resolution.calendar.kstDate).toBe("1958-06-10");
  });
});

describe("A3 — dayMidnight window follows the largest longitude correction", () => {
  it("00:33 in 전남 (−34 min) with trueSolarTime + dayBoundary trueSolar moves the day pillar back and is flagged", () => {
    const shifted = calculatePillarsWithResolution(seoul("1990-06-15", "00:33", { birthPlace: "jeonnam", options: { trueSolarTime: true, dayBoundary: "trueSolar" } }));
    const plain = calculatePillarsWithResolution(seoul("1990-06-15", "00:33", { birthPlace: "jeonnam" }));
    expect(shifted.resolution.trueSolarOffsetMin).toBeLessThanOrEqual(-33);
    expect(shifted.pillars.day).not.toEqual(plain.pillars.day);
    expect(shifted.resolution.nearBoundary.some((flag) => flag.kind === "dayMidnight")).toBe(true);
    expect(NEAR_BOUNDARY_WINDOWS.dayMidnight.after).toBeGreaterThanOrEqual(-shifted.resolution.trueSolarOffsetMin);
  });

  it("C: 33~34 min after midnight × −34 region is inside the window; 35 is not", () => {
    const at = (time: string) => calculatePillarsWithResolution(seoul("1990-06-15", time, { birthPlace: "jeonnam" })).resolution.nearBoundary.filter((flag) => flag.kind === "dayMidnight");
    expect(at("00:33")).toEqual([{ kind: "dayMidnight", minutes: 33, direction: "after" }]);
    expect(at("00:34")).toEqual([{ kind: "dayMidnight", minutes: 34, direction: "after" }]);
    expect(at("00:35")).toEqual([]);
  });
});

describe("A4 — top-level body keys", () => {
  it("rejects a case variant of a known key with INVALID_BODY and names the field", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "1990-01-01", birthTime: "10:30", birthplace: "jeju" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("INVALID_BODY");
      expect(result.error.error.field).toBe("birthplace");
      expect(result.error.error.message).toContain("birthPlace");
    }
    expect(buildSajuPillarsV1Response({ ...base, birthDate: "1990-01-01", birthTime: "10:30", TimeUnknown: false }).ok).toBe(false);
  });

  it("still ignores genuinely unknown keys (baby-naming compatibility) and validates timeUnknown's type", () => {
    expect(buildSajuPillarsV1Response({ ...base, birthDate: "1990-01-01", birthTime: "10:30", clientVersion: "1.2.3" }).ok).toBe(true);
    const typed = buildSajuPillarsV1Response({ ...base, birthDate: "1990-01-01", timeUnknown: "true" });
    expect(typed.ok).toBe(false);
    if (!typed.ok) {
      expect(typed.error.error.code).toBe("INVALID_BODY");
      expect(typed.error.error.field).toBe("timeUnknown");
    }
  });
});

describe("A6 — API document error table equals the code's error union", () => {
  it("lists exactly SAJU_PILLARS_V1_ERROR_CODES among the 400 rows (plus the 401/405/429 handled by the route), and no retired code anywhere in the document", () => {
    const doc = readFileSync(API_DOC, "utf8");
    const section = doc.slice(doc.indexOf("## 에러 형식 (4xx)"), doc.indexOf("## 예시 (curl)"));
    // Every backticked SCREAMING_CASE token that looks like an error code, anywhere in the document, must be a live code or a route-level code.
    const mentioned = new Set([...doc.matchAll(/`((?:INVALID|UNSUPPORTED|MISSING|OUT_OF|RATE|UNAUTHORIZED|METHOD)[A-Z_]*)`/g)].map((match) => match[1] as string));
    const allowed = new Set<string>([...SAJU_PILLARS_V1_ERROR_CODES, "METHOD_NOT_ALLOWED", "RATE_LIMITED", "UNAUTHORIZED"]);
    expect([...mentioned].filter((code) => !allowed.has(code))).toEqual([]);
    const rows = section.split(/\r?\n/).filter((line) => /^\|\s*\d{3}\s*\|/.test(line));
    const documented400 = rows.filter((line) => line.startsWith("| 400")).map((line) => /`([A-Z_]+)`/.exec(line)?.[1]).filter(Boolean);
    expect([...documented400].sort()).toEqual([...SAJU_PILLARS_V1_ERROR_CODES].sort());
    const other = rows.filter((line) => !line.startsWith("| 400")).map((line) => /`([A-Z_]+)`/.exec(line)?.[1]);
    expect(other.sort()).toEqual(["METHOD_NOT_ALLOWED", "RATE_LIMITED", "UNAUTHORIZED"]);
    expect(section).not.toContain("UNSUPPORTED_CALENDAR");
  });

  it("C: every 400 code is reachable — one input per code", () => {
    const code = (body: unknown): string | undefined => {
      const result = buildSajuPillarsV1Response(body);
      return result.ok ? undefined : result.error.error.code;
    };
    expect(code("not an object")).toBe("INVALID_BODY");
    expect(code({ ...base, calendar: "julian", birthDate: "1990-01-01", birthTime: "10:30" })).toBe("INVALID_CALENDAR");
    expect(code({ ...base, birthDate: "1990-01-01", birthTime: "10:30", timezone: "UTC" })).toBe("UNSUPPORTED_TIMEZONE");
    expect(code({ ...base, birthDate: "2023-02-29", birthTime: "10:30" })).toBe("INVALID_BIRTH_DATE");
    expect(code({ ...base, birthDate: "1990-01-01" })).toBe("MISSING_BIRTH_TIME");
    expect(code({ ...base, birthDate: "1990-01-01", birthTime: "25:00" })).toBe("INVALID_BIRTH_TIME");
    expect(code({ ...base, birthDate: "1990-01-01", birthTime: "10:30", sex: "unknown" })).toBe("INVALID_SEX");
    expect(code({ ...base, birthDate: "1990-01-01", birthTime: "10:30", birthPlace: "mars" })).toBe("INVALID_BIRTH_PLACE");
    expect(code({ ...base, birthDate: "1990-01-01", birthTime: "10:30", options: { include: ["sinsal"] } })).toBe("INVALID_OPTIONS");
    expect(code({ ...base, calendar: "lunar", birthDate: "2025-06-30", birthTime: "10:30", isLeapMonth: true })).toBe("INVALID_LUNAR_DATE");
    expect(code({ ...base, birthDate: "1900-05-05", birthTime: "10:30" })).toBe("OUT_OF_SUPPORTED_RANGE");
  });
});

describe("A7 · A10 — library hygiene", () => {
  it("A7: mutating a returned hidden-stem entry does not leak into the next call", () => {
    const first = hiddenStemsOf("ja");
    (first.primary as { stem: string }).stem = "gap";
    first.residual = null;
    expect(hiddenStemsOf("ja")).toEqual({ residual: { stem: "im", days: 10 }, middle: null, primary: { stem: "gye", days: 20 } });
  });

  it("A10: tenGodOf throws on an unknown stem instead of returning a value", () => {
    expect(() => tenGodOf("foo" as never, "gap")).toThrow("Unknown stem");
    expect(() => tenGodOf("gap", "" as never)).toThrow("Unknown stem");
  });
});

describe("A15 — DST-start gap carries dst as well as nonexistent", () => {
  it("1988-05-08 02:30 (skipped) → flags dst + nonexistent, wall clock kept", () => {
    const { resolution, pillars } = calculatePillarsWithResolution(seoul("1988-05-08", "02:30"));
    expect(resolution.flags).toEqual(["dst", "nonexistent"]);
    expect(resolution.appliedOffsetMin).toBe(0);
    // Read as 02:30 KST: 丑시.
    expect(pillars.time?.branch).toBe("chuk");
    // D3 (골든 후보 표 §6): 1987-05-10 02:30 behaves the same — accepted, flagged, not rejected.
    expect(calculatePillarsWithResolution(seoul("1987-05-10", "02:30")).resolution.flags).toEqual(["dst", "nonexistent"]);
  });
});

describe("B1 — 시지 경계 후보는 같은 날 12개만 (죽은 항목 제거)", () => {
  it("23:34 flags the 23:00 boundary, 00:50 flags the 01:00 boundary; nothing else appears around midnight", () => {
    const at = (date: string, time: string) => calculatePillarsWithResolution(seoul(date, time)).resolution.nearBoundary.filter((flag) => flag.kind === "hourBranch");
    expect(at("1990-06-15", "23:34")).toEqual([{ kind: "hourBranch", minutes: 34, direction: "after" }]);
    expect(at("1990-06-15", "00:50")).toEqual([{ kind: "hourBranch", minutes: -10, direction: "before" }]);
    expect(at("1990-06-15", "00:20")).toEqual([]);
    expect(at("1990-06-15", "23:45")).toEqual([]);
  });
});

describe("C — 미검증 분기", () => {
  it("jaHourPolicy early × trueSolarTime together: the shift is applied first, then the 23시대 rule on the shifted reading", () => {
    // 23:20 in 전남 → 22:46 true solar → no longer 23시대: early policy does not advance the day.
    const both = calculatePillars(seoul("1990-06-15", "23:20", { birthPlace: "jeonnam", options: { trueSolarTime: true, jaHourPolicy: "early" } }));
    const earlyOnly = calculatePillars(seoul("1990-06-15", "23:20", { birthPlace: "jeonnam", options: { jaHourPolicy: "early" } }));
    const plain = calculatePillars(seoul("1990-06-15", "23:20", { birthPlace: "jeonnam" }));
    expect(earlyOnly.day).not.toEqual(plain.day); // 23:20 KST is 23시대 → next day
    expect(both.day).toEqual(plain.day); // 22:46 is 亥시 → same day
    expect(both.time?.branch).toBe("hae");
    // 23:50 in 전남 → 23:16 true solar → still 23시대: early advances the day.
    const late = calculatePillars(seoul("1990-06-15", "23:50", { birthPlace: "jeonnam", options: { trueSolarTime: true, jaHourPolicy: "early" } }));
    expect(late.day).toEqual(calculatePillars(seoul("1990-06-16", "01:00")).day);
  });

  it("조자시 +1일 that crosses a 절입 date keeps the month pillar of the KST instant (1921-12-07 23:30, 대설 12-08 00:11)", () => {
    const early = calculatePillars(seoul("1921-12-07", "23:30", { options: { jaHourPolicy: "early" } }));
    const late = calculatePillars(seoul("1921-12-07", "23:30"));
    expect(early.month).toEqual(late.month); // still 亥월 — 23:30 is before 대설 00:11
    expect(early.month.branch).toBe("hae");
    expect(early.day).toEqual(calculatePillars(seoul("1921-12-08", "01:00")).day); // day advanced by the policy
    expect(late.day).not.toEqual(early.day);
  });

  it("lunar input in a non-KST era normalizes after conversion (음력 1958-04-24 → 양력 1958-06-11 00:15 → KST 06-10 23:45)", () => {
    const lunar = calculatePillarsWithResolution({ birthDate: "1958-04-24", calendar: "lunar", birthTime: "00:15", timezone: "Asia/Seoul", sex: "male" });
    const solar = calculatePillarsWithResolution(seoul("1958-06-11", "00:15"));
    expect(lunar.pillars).toEqual(solar.pillars);
    expect(lunar.resolution.calendar).toEqual({ input: "lunar", isLeapMonth: false, solarDate: "1958-06-11", kstDate: "1958-06-10" });
    expect(lunar.resolution.appliedOffsetMin).toBe(30);
  });

  it("Q4 (골든 후보 표): true solar time rewinding across midnight — day pillar follows dayBoundary, hour pillar follows the shifted clock", () => {
    const midnightRule = calculatePillars(seoul("1990-06-15", "00:20", { birthPlace: "jeonnam", options: { trueSolarTime: true } }));
    const trueSolarRule = calculatePillars(seoul("1990-06-15", "00:20", { birthPlace: "jeonnam", options: { trueSolarTime: true, dayBoundary: "trueSolar" } }));
    const plain = calculatePillars(seoul("1990-06-15", "00:20"));
    expect(midnightRule.day).toEqual(plain.day); // default: the KST civil date owns the day pillar
    expect(trueSolarRule.day).toEqual(calculatePillars(seoul("1990-06-14", "12:00")).day); // trueSolar: the day rewinds
    expect(midnightRule.time?.branch).toBe("ja"); // 23:46 is still 子시 either way
    expect(trueSolarRule.time?.branch).toBe("ja");
  });
});
