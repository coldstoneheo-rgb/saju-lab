import { describe, expect, it } from "vitest";
import { calculatePillars, calculatePillarsWithResolution } from "./pillars.js";
import { normalizeToKstWallClock } from "./timezone-history.js";
import { KOREA_OFFSET_INTERVALS } from "./timezone-history.data.js";
import type { ParsedBirthDateTime } from "./datetime.js";

function local(date: string, time?: string): ParsedBirthDateTime {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  if (time === undefined) {
    return { year, month, day, timezone: "Asia/Seoul" };
  }
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  return { year, month, day, hour, minute, timezone: "Asia/Seoul" };
}

function wall(kst: ParsedBirthDateTime): string {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${kst.year}-${pad(kst.month)}-${pad(kst.day)}T${pad(kst.hour ?? 12)}:${pad(kst.minute ?? 0)}`;
}

/** Offset that the ICU tz data bundled with Node reports for Asia/Seoul at a UTC instant, in minutes. */
function icuOffsetMinutes(isoUtcMinute: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", timeZoneName: "longOffset" })
    .formatToParts(new Date(`${isoUtcMinute}:00Z`));
  const name = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  const match = /GMT([+-])(\d{2}):(\d{2})(?::(\d{2}))?/.exec(name);
  if (!match) {
    throw new Error(`Unexpected offset name ${name}`);
  }
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]) + Number(match[4] ?? 0) / 60);
}

function shiftIsoMinute(isoUtcMinute: string, minutes: number): string {
  return new Date(Date.parse(`${isoUtcMinute}:00Z`) + minutes * 60_000).toISOString().slice(0, 16);
}

describe("Korean offset history table", () => {
  it("partitions the timeline from 1908-04-01 with 12 summer-time intervals", () => {
    const dst = KOREA_OFFSET_INTERVALS.filter((row) => row.kind === "dst");
    expect(dst).toHaveLength(12);
    expect(dst.map((row) => row.fromUtc.slice(0, 4))).toEqual([
      "1948", "1949", "1950", "1951", "1955", "1956", "1957", "1958", "1959", "1960", "1987", "1988"
    ]);

    for (let index = 1; index < KOREA_OFFSET_INTERVALS.length; index += 1) {
      const previous = KOREA_OFFSET_INTERVALS[index - 1];
      const current = KOREA_OFFSET_INTERVALS[index];
      expect(previous?.toUtc).toBe(current?.fromUtc);
    }
    expect(KOREA_OFFSET_INTERVALS[0]?.fromUtc).toBe("1908-03-31T15:33");
    expect(KOREA_OFFSET_INTERVALS.at(-1)?.toUtc).toBeNull();
  });

  it("matches Node ICU (tz 2025b) one minute before and after every transition", () => {
    // 1 LMT start + 3 standard-time changes + 24 summer-time changes = 28 rows / 28 transition instants.
    expect(KOREA_OFFSET_INTERVALS).toHaveLength(28);

    for (const [index, row] of KOREA_OFFSET_INTERVALS.entries()) {
      const previous = KOREA_OFFSET_INTERVALS[index - 1];
      if (previous === undefined) {
        // ICU carries LMT 8:27:52 before 1908-03-31T15:33Z; the first row must read +08:30.
        expect(icuOffsetMinutes(row.fromUtc)).toBe(row.offsetMinutes);
        continue;
      }
      const before = shiftIsoMinute(row.fromUtc, -1);
      expect({ at: before, offset: icuOffsetMinutes(before) }).toEqual({ at: before, offset: previous.offsetMinutes });
      expect({ at: row.fromUtc, offset: icuOffsetMinutes(row.fromUtc) }).toEqual({ at: row.fromUtc, offset: row.offsetMinutes });
    }
  });
});

describe("normalizeToKstWallClock", () => {
  it("leaves plain KST readings untouched", () => {
    for (const input of [local("1975-03-21", "10:30"), local("2011-11-08", "05:00"), local("1930-07-01", "00:00"), local("2100-12-07", "10:41")]) {
      const result = normalizeToKstWallClock(input);
      expect(result.kst).toBe(input);
      expect(result.resolution).toEqual({ appliedOffsetMin: 0, flags: [] });
    }
  });

  it("moves a 1955 +08:30 reading forward 30 minutes across the 입춘 minute", () => {
    const result = normalizeToKstWallClock(local("1955-02-04", "22:50"));
    expect(wall(result.kst)).toBe("1955-02-04T23:20");
    expect(result.resolution).toEqual({ appliedOffsetMin: -30, flags: ["utc+8:30"] });
  });

  it("moves a 1988 summer-time reading back one hour", () => {
    const result = normalizeToKstWallClock(local("1988-06-15", "14:00"));
    expect(wall(result.kst)).toBe("1988-06-15T13:00");
    expect(result.resolution).toEqual({ appliedOffsetMin: 60, flags: ["dst"] });
  });

  it("treats 1955-1960 summer time as +09:30 (both flags)", () => {
    const result = normalizeToKstWallClock(local("1959-07-01", "09:15"));
    expect(wall(result.kst)).toBe("1959-07-01T08:45");
    expect(result.resolution).toEqual({ appliedOffsetMin: 30, flags: ["utc+8:30", "dst"] });
  });

  it("flags the repeated hour at a summer-time end and keeps the first (DST) occurrence", () => {
    // 1988-10-09 03:00 DST -> 02:00 standard: 02:00-02:59 happened twice.
    const late80s = normalizeToKstWallClock(local("1988-10-09", "02:30"));
    expect(wall(late80s.kst)).toBe("1988-10-09T01:30");
    expect(late80s.resolution).toEqual({ appliedOffsetMin: 60, flags: ["dst", "ambiguous"] });

    // 1948-09-12 24:00 DST -> 23:00 standard: the repeated hour is the 자시 hour.
    const fortyEight = normalizeToKstWallClock(local("1948-09-12", "23:30"));
    expect(wall(fortyEight.kst)).toBe("1948-09-12T22:30");
    expect(fortyEight.resolution).toEqual({ appliedOffsetMin: 60, flags: ["dst", "ambiguous"] });

    // 1954-03-21 00:00 +09:00 -> 03-20 23:30 +08:30: 23:30-23:59 repeated, first = +09:00.
    const fiftyFour = normalizeToKstWallClock(local("1954-03-20", "23:45"));
    expect(wall(fiftyFour.kst)).toBe("1954-03-20T23:45");
    expect(fiftyFour.resolution).toEqual({ appliedOffsetMin: 0, flags: ["ambiguous"] });
  });

  it("flags a reading inside a skipped hour and keeps the pre-transition offset", () => {
    // 1987-05-10 02:00 -> 03:00: 02:30 never showed on a correctly set clock.
    const dstStart = normalizeToKstWallClock(local("1987-05-10", "02:30"));
    expect(wall(dstStart.kst)).toBe("1987-05-10T02:30");
    expect(dstStart.resolution).toEqual({ appliedOffsetMin: 0, flags: ["nonexistent"] });

    // 1961-08-10 00:00 +08:30 -> 00:30 +09:00: 00:00-00:29 skipped.
    const backToKst = normalizeToKstWallClock(local("1961-08-10", "00:15"));
    expect(wall(backToKst.kst)).toBe("1961-08-10T00:45");
    expect(backToKst.resolution).toEqual({ appliedOffsetMin: -30, flags: ["utc+8:30", "nonexistent"] });

    // The first minute on +09:00 is a plain reading again.
    expect(normalizeToKstWallClock(local("1961-08-10", "00:30")).resolution).toEqual({ appliedOffsetMin: 0, flags: [] });
  });

  it("resolves a time-less birth at noon and leaves the date alone", () => {
    const result = normalizeToKstWallClock(local("1957-08-01"));
    expect(result.kst).toEqual(local("1957-08-01"));
    expect(result.resolution).toEqual({ appliedOffsetMin: 30, flags: ["utc+8:30", "dst"] });

    const plain = normalizeToKstWallClock(local("1975-03-21"));
    expect(plain.resolution).toEqual({ appliedOffsetMin: 0, flags: [] });
  });

  it("refuses civil time before 1908-04-01", () => {
    expect(() => normalizeToKstWallClock(local("1908-03-31", "23:00"))).toThrow("before 1908-04-01");
    // The +08:30 clock started at 00:02:08 on 1908-04-01 (LMT 8:27:52 → 8:30).
    expect(() => normalizeToKstWallClock(local("1908-04-01", "00:05"))).not.toThrow();
  });
});

describe("calculatePillars with normalized KST", () => {
  it("puts 1955-02-04 22:50 (+08:30 clock) after the 23:18 입춘: 을미년 무인월", () => {
    const { pillars, resolution } = calculatePillarsWithResolution({
      birthDate: "1955-02-04",
      birthTime: "22:50",
      timezone: "Asia/Seoul",
      sex: "male"
    });
    expect(pillars.year).toEqual({ stem: "eul", branch: "mi" });
    expect(pillars.month).toEqual({ stem: "mu", branch: "in" });
    expect(pillars.time).toEqual({ stem: "mu", branch: "ja" }); // 23:20 KST is 자시 of the 병 day
    expect(resolution).toMatchObject({ appliedOffsetMin: -30, flags: ["utc+8:30"] });

    // A reading 30 minutes earlier still lands before 23:18 KST: 갑오년 정축월.
    const before = calculatePillars({ birthDate: "1955-02-04", birthTime: "22:47", timezone: "Asia/Seoul", sex: "male" });
    expect(before.year).toEqual({ stem: "gap", branch: "o" });
    expect(before.month).toEqual({ stem: "jeong", branch: "chuk" });
  });

  it("rolls the day pillar when the +08:30 correction crosses KST midnight", () => {
    const late = calculatePillars({ birthDate: "1955-02-04", birthTime: "23:45", timezone: "Asia/Seoul", sex: "male" });
    const nextDay = calculatePillars({ birthDate: "1955-02-05", birthTime: "00:10", timezone: "Asia/Seoul", sex: "male" });
    const earlier = calculatePillars({ birthDate: "1955-02-04", birthTime: "23:15", timezone: "Asia/Seoul", sex: "male" });

    expect(late.day).toEqual(nextDay.day); // 23:45 on the +08:30 clock = 00:15 KST on 02-05; 00:10 = 00:40 KST
    expect(late.day).not.toEqual(earlier.day);
    expect(late.time).toEqual(nextDay.time); // both 자시 of the 02-05 day stem
  });

  it("moves a 1988 summer-time reading back one hour into the previous hour branch", () => {
    const summer = calculatePillars({ birthDate: "1988-06-15", birthTime: "13:10", timezone: "Asia/Seoul", sex: "male" });
    expect(summer.time?.branch).toBe("o"); // 12:10 KST is 오시 (11:00-12:59), not 미시
  });

  it("requires a birth time on the civil days next to a boundary date when the clock was not UTC+9", () => {
    // 1957-09-08 07:13 백로 (KST). The summer clock that year was +09:30.
    expect(() => calculatePillars({ birthDate: "1957-09-07", timezone: "Asia/Seoul", sex: "other" }))
      .toThrow("birthTime is required on solar-term boundary dates.");
    expect(() => calculatePillars({ birthDate: "1957-09-09", timezone: "Asia/Seoul", sex: "other" }))
      .toThrow("birthTime is required on solar-term boundary dates.");
    // Plain KST years keep the exact-date rule: 2024-03-05 경칩, 03-04 is fine.
    expect(() => calculatePillars({ birthDate: "2024-03-04", timezone: "Asia/Seoul", sex: "other" })).not.toThrow();
  });

  it("serves 100 spread-out births from 1920-1961 and the summer-time years", () => {
    let seed = 19540321;
    const next = (): number => {
      seed = (seed * 48271) % 2147483647;
      return seed;
    };
    const pad = (value: number): string => String(value).padStart(2, "0");
    const years = [...Array.from({ length: 42 }, (_, index) => 1920 + index), 1987, 1988];

    let shifted = 0;
    const flagged: Record<string, number> = {};
    for (let index = 0; index < 100; index += 1) {
      const year = years[index % years.length] as number;
      const month = 1 + (next() % 12);
      const day = 1 + (next() % 28);
      const hour = next() % 24;
      const minute = next() % 60;
      const { resolution } = calculatePillarsWithResolution({
        birthDate: `${year}-${pad(month)}-${pad(day)}`,
        birthTime: `${pad(hour)}:${pad(minute)}`,
        timezone: "Asia/Seoul",
        sex: "other"
      });
      if (resolution.appliedOffsetMin !== 0) {
        shifted += 1;
      }
      for (const flag of resolution.flags) {
        flagged[flag] = (flagged[flag] ?? 0) + 1;
      }
    }

    expect(shifted).toBeGreaterThan(0);
    // The distribution is reported in the HO REPORT (C5) and pinned here so it shows up in diffs.
    expect({ shifted, flagged }).toMatchSnapshot();
  });
});
