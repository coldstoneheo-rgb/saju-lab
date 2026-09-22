import { describe, expect, it } from "vitest";
import { BIRTH_PLACES, trueSolarOffsetMinutes } from "./birth-place.data.js";
import { hourBranchIndex, hourBranchIndexAtMinute } from "./cycle.js";
import { calculatePillarsWithResolution, NEAR_BOUNDARY_WINDOWS } from "./pillars.js";
import { buildSajuPillarsV1Response } from "./saju-pillars-v1.js";
import type { BirthInput } from "./types.js";

const seoul = (birthDate: string, birthTime: string, extra: Partial<BirthInput> = {}): BirthInput => ({
  birthDate,
  birthTime,
  timezone: "Asia/Seoul",
  sex: "female",
  ...extra
});

describe("birth-place table", () => {
  it("lists the 17 시·도 with a Wikidata source each and Seoul at −32 minutes", () => {
    expect(BIRTH_PLACES).toHaveLength(17);
    for (const place of BIRTH_PLACES) {
      expect(place.source).toMatch(/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/);
      expect(place.longitude).toBeGreaterThan(126);
      expect(place.longitude).toBeLessThan(130);
    }
    const offsets = Object.fromEntries(BIRTH_PLACES.map((place) => [place.code, trueSolarOffsetMinutes(place.longitude)]));
    expect(offsets.seoul).toBe(-32);
    expect(offsets.busan).toBe(-24);
    expect(offsets.ulsan).toBe(-23);
    expect(offsets.jeonnam).toBe(-34);
    expect(Math.min(...Object.values(offsets))).toBe(-34);
    expect(Math.max(...Object.values(offsets))).toBe(-23);
  });
});

describe("minute-level hour branch", () => {
  it("agrees with the integer-hour branch at every minute of the day", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      for (const minute of [0, 1, 29, 30, 59]) {
        expect(hourBranchIndexAtMinute(hour, minute)).toBe(hourBranchIndex(hour));
      }
    }
    expect(() => hourBranchIndexAtMinute(13, 60)).toThrow("minute");
  });
});

describe("true solar time option (경도 보정만, 균시차 미적용)", () => {
  it("moves the 회의 상담 사례 13:10 Seoul reading to 12:38: 未시 → 午시", () => {
    const plain = calculatePillarsWithResolution(seoul("1990-06-15", "13:10"));
    const corrected = calculatePillarsWithResolution(seoul("1990-06-15", "13:10", { options: { trueSolarTime: true }, birthPlace: "seoul" }));

    expect(plain.pillars.time?.branch).toBe("mi");
    expect(corrected.pillars.time?.branch).toBe("o");
    expect(corrected.pillars.day).toEqual(plain.pillars.day); // KST midnight still owns the day
    expect(corrected.pillars.year).toEqual(plain.pillars.year);
    expect(corrected.pillars.month).toEqual(plain.pillars.month);

    expect(corrected.resolution).toMatchObject({
      trueSolarTimeApplied: true,
      trueSolarOffsetMin: -32,
      birthPlace: "seoul",
      jaHourPolicy: "late",
      dayBoundary: "midnight"
    });
    expect(corrected.resolution.nearBoundary).toEqual([{ kind: "hourBranch", minutes: 10, direction: "after" }]);
  });

  it("reports the other reading in alternates.trueSolarTime, and only when it differs", () => {
    const plain = calculatePillarsWithResolution(seoul("1990-06-15", "13:10"));
    expect(plain.resolution.trueSolarTimeApplied).toBe(false);
    expect(plain.alternates?.trueSolarTime).toEqual({
      applied: true,
      appliedMinutes: -32,
      pillars: { ...plain.pillars, time: { stem: "gap", branch: "o" } }
    });

    const corrected = calculatePillarsWithResolution(seoul("1990-06-15", "13:10", { options: { trueSolarTime: true } }));
    expect(corrected.alternates?.trueSolarTime).toEqual({ applied: false, appliedMinutes: 0, pillars: plain.pillars });

    // 14:00 −32 = 13:28 stays in 未시: nothing to report.
    const farFromBoundary = calculatePillarsWithResolution(seoul("1990-06-15", "14:00"));
    expect(farFromBoundary.alternates).toBeUndefined();
    expect(farFromBoundary.resolution.nearBoundary).toEqual([]);
  });

  it("uses the birth place's own longitude: 13:30 crosses into 午 from Seoul (−32) but not from Ulsan (−23)", () => {
    const fromSeoul = calculatePillarsWithResolution(seoul("1990-06-15", "13:30", { options: { trueSolarTime: true }, birthPlace: "seoul" }));
    const fromUlsan = calculatePillarsWithResolution(seoul("1990-06-15", "13:30", { options: { trueSolarTime: true }, birthPlace: "ulsan" }));
    expect(fromSeoul.pillars.time?.branch).toBe("o"); // 12:58
    expect(fromUlsan.pillars.time?.branch).toBe("mi"); // 13:07
    expect(fromUlsan.resolution).toMatchObject({ birthPlace: "ulsan", trueSolarOffsetMin: -23 });
    expect(fromUlsan.alternates).toBeUndefined();
  });

  it("can move the day pillar too when dayBoundary is trueSolar", () => {
    const midnightRule = calculatePillarsWithResolution(seoul("1990-06-15", "00:10", { options: { trueSolarTime: true } }));
    const solarRule = calculatePillarsWithResolution(seoul("1990-06-15", "00:10", { options: { trueSolarTime: true, dayBoundary: "trueSolar" } }));
    const previousDay = calculatePillarsWithResolution(seoul("1990-06-14", "23:38"));

    expect(midnightRule.pillars.day).toEqual(calculatePillarsWithResolution(seoul("1990-06-15", "00:10")).pillars.day);
    expect(solarRule.pillars.day).toEqual(previousDay.pillars.day);
    expect(solarRule.pillars.time).toEqual(previousDay.pillars.time); // 23:38 자시 of 06-14
    expect(solarRule.resolution.dayBoundary).toBe("trueSolar");
  });

  it("refuses an unknown birth place", () => {
    expect(() => calculatePillarsWithResolution(seoul("1990-06-15", "13:10", { birthPlace: "mars" }))).toThrow("Unknown birthPlace");
  });
});

describe("23시대 policy option", () => {
  const cases = [
    { birthDate: "2010-06-21", birthTime: "23:00" },
    { birthDate: "2010-06-21", birthTime: "23:59" },
    { birthDate: "2010-06-22", birthTime: "00:00" }
  ];

  it.each(cases)("$birthDate $birthTime: late keeps the calendar day, early moves 23:xx to the next day", ({ birthDate, birthTime }) => {
    const late = calculatePillarsWithResolution(seoul(birthDate, birthTime));
    const early = calculatePillarsWithResolution(seoul(birthDate, birthTime, { options: { jaHourPolicy: "early" } }));
    const nextDay = calculatePillarsWithResolution(seoul("2010-06-22", "00:00"));

    expect(late.pillars.time?.branch).toBe("ja");
    expect(early.pillars.time?.branch).toBe("ja");
    expect(late.resolution.jaHourPolicy).toBe("late");
    expect(early.resolution.jaHourPolicy).toBe("early");

    if (birthTime.startsWith("23")) {
      expect(late.pillars.day).toEqual({ stem: "im", branch: "in" });
      expect(early.pillars.day).toEqual(nextDay.pillars.day); // 2010-06-22 계묘일
      expect(early.pillars.day).toEqual({ stem: "gye", branch: "myo" });
      expect(late.alternates?.jaHourPolicy).toEqual({ policy: "early", pillars: early.pillars });
      expect(early.alternates?.jaHourPolicy).toEqual({ policy: "late", pillars: late.pillars });
    } else {
      expect(late.pillars).toEqual(early.pillars);
      expect(late.alternates?.jaHourPolicy).toBeUndefined();
      expect(early.alternates?.jaHourPolicy).toBeUndefined();
    }
  });
});

describe("nearBoundary flags (KST wall clock, before any true-solar shift)", () => {
  it("marks the 시지 window [B−10, B+34] and nothing outside it", () => {
    const at = (time: string) => calculatePillarsWithResolution(seoul("1990-06-15", time)).resolution.nearBoundary;

    expect(at("13:34")).toEqual([{ kind: "hourBranch", minutes: 34, direction: "after" }]);
    expect(at("13:35")).toEqual([]);
    expect(at("12:50")).toEqual([{ kind: "hourBranch", minutes: -10, direction: "before" }]);
    expect(at("12:49")).toEqual([]);
    expect(at("13:00")).toEqual([{ kind: "hourBranch", minutes: 0, direction: "after" }]);
    expect(NEAR_BOUNDARY_WINDOWS.hourBranch).toEqual({ before: 10, after: 34 });
  });

  it("marks midnight [−10, +34] (same logic as the 시지 window, A3) and the 23:00 시지 boundary together", () => {
    expect(NEAR_BOUNDARY_WINDOWS.dayMidnight).toEqual({ before: 10, after: 34 });
    const late = calculatePillarsWithResolution(seoul("1990-06-15", "23:52")).resolution.nearBoundary;
    expect(late).toEqual([{ kind: "dayMidnight", minutes: -8, direction: "before" }]);
    expect(calculatePillarsWithResolution(seoul("1990-06-15", "23:40")).resolution.nearBoundary).toEqual([]);

    const afterMidnight = calculatePillarsWithResolution(seoul("1990-06-15", "00:20")).resolution.nearBoundary;
    expect(afterMidnight).toEqual([{ kind: "dayMidnight", minutes: 20, direction: "after" }]);
    expect(calculatePillarsWithResolution(seoul("1990-06-15", "00:34")).resolution.nearBoundary).toEqual([{ kind: "dayMidnight", minutes: 34, direction: "after" }]);
    expect(calculatePillarsWithResolution(seoul("1990-06-15", "00:35")).resolution.nearBoundary).toEqual([]);

    const jaStart = calculatePillarsWithResolution(seoul("1990-06-15", "23:05")).resolution.nearBoundary;
    expect(jaStart).toEqual([{ kind: "hourBranch", minutes: 5, direction: "after" }]);
  });

  it("marks a 절입 within ±60 minutes with the term and its KST minute", () => {
    const beforeIpchun = calculatePillarsWithResolution(seoul("2024-02-04", "17:00")).resolution.nearBoundary;
    expect(beforeIpchun).toEqual([
      { kind: "hourBranch", minutes: 0, direction: "after" },
      { kind: "solarTerm", minutes: -27, direction: "before", term: "ipchun", at: "2024-02-04T17:27" }
    ]);
    expect(calculatePillarsWithResolution(seoul("2024-02-04", "19:00")).resolution.nearBoundary).toEqual([
      { kind: "hourBranch", minutes: 0, direction: "after" }
    ]);
  });

  it("is empty, with no alternates, when the birth time is unknown", () => {
    const result = calculatePillarsWithResolution({ birthDate: "1990-06-15", timezone: "Asia/Seoul", sex: "male" });
    expect(result.resolution.nearBoundary).toEqual([]);
    expect(result.alternates).toBeUndefined();
    expect(result.resolution.trueSolarTimeApplied).toBe(false);
  });
});

describe("saju-pillars-v1 — options and birthPlace", () => {
  const base = { birthDate: "1990-06-15", birthTime: "13:10", calendar: "solar" as const, sex: "male" as const };

  it("applies options.trueSolarTime with birthPlace and reports it in resolution", () => {
    const result = buildSajuPillarsV1Response({ ...base, options: { trueSolarTime: true }, birthPlace: "seoul" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.pillars.time?.branch).toBe("o");
    expect(result.data.resolution.trueSolarTimeApplied).toBe(true);
    expect(result.data.alternates?.trueSolarTime?.applied).toBe(false);
  });

  it("keeps the option-less response on the current values and adds alternates.trueSolarTime", () => {
    const result = buildSajuPillarsV1Response(base);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.pillars.time?.branch).toBe("mi");
    expect(result.data.resolution).toMatchObject({ appliedOffsetMin: 0, flags: [], trueSolarTimeApplied: false, birthPlace: "seoul", jaHourPolicy: "late" });
    expect(result.data.alternates?.trueSolarTime?.pillars.time?.branch).toBe("o");
  });

  it("rejects an unknown birthPlace and malformed options with their own codes", () => {
    const place = buildSajuPillarsV1Response({ ...base, birthPlace: "atlantis" });
    expect(place.ok).toBe(false);
    if (!place.ok) expect(place.error.error.code).toBe("INVALID_BIRTH_PLACE");

    const options = buildSajuPillarsV1Response({ ...base, options: { trueSolarTime: "yes" } as never });
    expect(options.ok).toBe(false);
    if (!options.ok) expect(options.error.error.code).toBe("INVALID_OPTIONS");

    const unknownKey = buildSajuPillarsV1Response({ ...base, options: { equationOfTime: true } as never });
    expect(unknownKey.ok).toBe(false);
    if (!unknownKey.ok) expect(unknownKey.error.error.code).toBe("INVALID_OPTIONS");
  });
});
