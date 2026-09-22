import { describe, expect, it } from "vitest";
import { goldenCase } from "./golden-pillars.load.js";
import {
  SAJU_PILLARS_CONTRACT,
  buildSajuPillarsV1Response,
  type SajuPillarsV1Request
} from "./saju-pillars-v1.js";

function ok(request: SajuPillarsV1Request) {
  const result = buildSajuPillarsV1Response(request);
  if (!result.ok) {
    throw new Error(`expected ok, got error ${result.error.error.code}`);
  }
  return result;
}

describe("saju-pillars-v1 contract — golden PoC", () => {
  it("returns the contract response with HO-A golden values (1990 → metal absent)", () => {
    const result = ok({
      birthDate: "1990-01-01",
      birthTime: "10:30",
      calendar: "solar",
      timezone: "Asia/Seoul",
      sex: "male"
    });

    expect(result.status).toBe(200);
    expect(result.data.contract).toBe(SAJU_PILLARS_CONTRACT);
    expect(result.data.timeKnown).toBe(true);

    // Pillars match the g-1990-01-01-1030 golden row (docs/golden/GOLDEN-PILLARS.md).
    const fixture = goldenCase("g-1990-01-01-1030");
    expect(result.data.pillars).toEqual(fixture.expected);

    // Five-element values match HO-A golden case to the value.
    expect(result.data.fiveElements.distribution).toEqual({
      wood: 1,
      fire: 4,
      earth: 1,
      metal: 0,
      water: 2
    });
    expect(result.data.fiveElements.absent).toEqual(["metal"]);
    expect(result.data.fiveElements.supplementPriority).toEqual([
      "metal",
      "wood",
      "earth",
      "water",
      "fire"
    ]);
  });

  it("matches the 2024 golden case (water absent)", () => {
    const result = ok({
      birthDate: "2024-02-04",
      birthTime: "17:27",
      calendar: "solar",
      sex: "female"
    });

    expect(result.data.fiveElements.distribution).toEqual({
      wood: 2,
      fire: 1,
      earth: 3,
      metal: 2,
      water: 0
    });
    expect(result.data.fiveElements.absent).toEqual(["water"]);
    expect(result.data.fiveElements.supplementPriority[0]).toBe("water");
  });

  it("produces 3 pillars and no time pillar when timeUnknown is set", () => {
    const result = ok({
      birthDate: "1990-01-01",
      timeUnknown: true,
      calendar: "solar",
      sex: "other"
    });

    expect(result.data.timeKnown).toBe(false);
    expect(result.data.pillars.time).toBeUndefined();
    expect(result.data.fiveElements.distribution).toEqual({
      wood: 1,
      fire: 3,
      earth: 1,
      metal: 0,
      water: 1
    });
    expect(result.data.fiveElements.absent).toEqual(["metal"]);
  });
});

describe("saju-pillars-v1 contract — validation", () => {
  const base: SajuPillarsV1Request = {
    birthDate: "1990-01-01",
    birthTime: "10:30",
    calendar: "solar",
    sex: "male"
  };

  it("rejects a non-object body", () => {
    const result = buildSajuPillarsV1Response("nope");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error.error.code).toBe("INVALID_BODY");
    }
  });

  it("accepts the lunar calendar since stage 4 (2025 윤6월 15일 → 2025-08-08)", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "2025-06-15", calendar: "lunar", isLeapMonth: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.resolution.calendar).toEqual({ input: "lunar", isLeapMonth: true, solarDate: "2025-08-08", kstDate: "2025-08-08" });
    }
  });

  it("rejects a malformed birthDate", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "1990/01/01" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("INVALID_BIRTH_DATE");
    }
  });

  it("rejects a well-formatted but impossible calendar date", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "2023-02-29" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("INVALID_BIRTH_DATE");
    }
  });

  it("rejects a timezone other than Asia/Seoul as unsupported", () => {
    const result = buildSajuPillarsV1Response({ ...base, timezone: "America/New_York" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("UNSUPPORTED_TIMEZONE");
      expect(result.error.error.field).toBe("timezone");
    }
  });

  it("requires birthTime unless timeUnknown is true", () => {
    const { birthTime, ...withoutTime } = base;
    void birthTime;
    const result = buildSajuPillarsV1Response(withoutTime);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("MISSING_BIRTH_TIME");
    }
  });

  it("rejects an out-of-range birth date", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "1700-01-01" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("OUT_OF_SUPPORTED_RANGE");
    }
  });

  // The consumers of this contract are naming apps for newborns, so the birth
  // dates they send are always recent. Before the KASI 2000-2028 table these
  // returned OUT_OF_SUPPORTED_RANGE and the app fell back to an ungrounded path.
  it.each(["2023-11-20", "2025-07-14", "2026-06-06", "2028-12-06"])(
    "serves present-day birth date %s",
    (birthDate) => {
      const result = ok({ ...base, birthDate, birthTime: "09:15" });

      expect(result.status).toBe(200);
      expect(result.data.timeKnown).toBe(true);
      expect(result.data.pillars.month.branch).not.toHaveLength(0);
    }
  );

  it("still refuses dates past the end of the sourced solar-term table", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "2101-01-02" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("OUT_OF_SUPPORTED_RANGE");
    }
  });

  it("refuses dates before the first KASI row (1919)", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "1919-06-15" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("OUT_OF_SUPPORTED_RANGE");
    }
  });

  // Before the KASI 1920-2100 table every 1950-1999 birth was OUT_OF_SUPPORTED_RANGE.
  // 200 deterministic dates spread over years, months, days and hours must all resolve.
  it("serves 200 spread-out 1950-1999 birth dates without OUT_OF_SUPPORTED_RANGE", () => {
    let seed = 20260922;
    const next = (): number => {
      // Park-Miller minimal standard LCG — deterministic across runs and platforms.
      seed = (seed * 48271) % 2147483647;
      return seed;
    };
    const pad = (value: number): string => String(value).padStart(2, "0");

    const failures: string[] = [];
    for (let index = 0; index < 200; index += 1) {
      const year = 1950 + (index % 50);
      const month = 1 + (next() % 12);
      const day = 1 + (next() % 28);
      const hour = next() % 24;
      const minute = next() % 60;
      const birthDate = `${year}-${pad(month)}-${pad(day)}`;
      const result = buildSajuPillarsV1Response({ ...base, birthDate, birthTime: `${pad(hour)}:${pad(minute)}` });

      if (!result.ok) {
        failures.push(`${birthDate} ${result.error.error.code}`);
      } else if (result.data.pillars.month.branch.length === 0) {
        failures.push(`${birthDate} empty month`);
      }
    }

    expect(failures).toEqual([]);
  });
});

// Gate for the timezone-history change (HO-2026-0922-saju-L1-stage12-01 §2-5):
// full responses pinned from main 395a4bb, before normalizeToKstWallClock existed.
// Every date here is in a plain UTC+9 period, so normalization must be a no-op.
describe("saju-pillars-v1 contract — values pinned before timezone normalization", () => {
  const pinned = [
    {
      request: { birthDate: "1975-03-21", birthTime: "10:30", sex: "male" },
      pillars: {
        year: { stem: "eul", branch: "myo" },
        month: { stem: "gi", branch: "myo" },
        day: { stem: "byeong", branch: "in" },
        time: { stem: "gye", branch: "sa" }
      },
      fiveElements: {
        distribution: { wood: 4, fire: 2, earth: 1, metal: 0, water: 1 },
        absent: ["metal"],
        deficient: ["metal", "earth", "water"],
        supplementPriority: ["metal", "earth", "water", "fire", "wood"]
      }
    },
    {
      request: { birthDate: "2011-11-08", birthTime: "05:00", sex: "female" },
      pillars: {
        year: { stem: "sin", branch: "myo" },
        month: { stem: "gi", branch: "hae" },
        day: { stem: "jeong", branch: "myo" },
        time: { stem: "gye", branch: "myo" }
      },
      fiveElements: {
        distribution: { wood: 3, fire: 1, earth: 1, metal: 1, water: 2 },
        absent: [],
        deficient: ["fire", "earth", "metal"],
        supplementPriority: ["fire", "earth", "metal", "water", "wood"]
      }
    },
    {
      // 23:00 Ja hour: the day pillar stays on the civil date (MVP policy).
      request: { birthDate: "2010-06-21", birthTime: "23:00", sex: "other" },
      pillars: {
        year: { stem: "gyeong", branch: "in" },
        month: { stem: "im", branch: "o" },
        day: { stem: "im", branch: "in" },
        time: { stem: "gyeong", branch: "ja" }
      },
      fiveElements: {
        distribution: { wood: 2, fire: 1, earth: 0, metal: 2, water: 3 },
        absent: ["earth"],
        deficient: ["earth", "fire"],
        supplementPriority: ["earth", "fire", "wood", "metal", "water"]
      }
    }
  ] as const;

  it.each(pinned)("keeps the full response for $request.birthDate $request.birthTime", (expected) => {
    const result = ok({ ...expected.request, calendar: "solar" });

    expect(result.data.contract).toBe(SAJU_PILLARS_CONTRACT);
    expect(result.data.timeKnown).toBe(true);
    expect(result.data.pillars).toEqual(expected.pillars);
    expect(result.data.fiveElements).toEqual(expected.fiveElements);
  });
});
