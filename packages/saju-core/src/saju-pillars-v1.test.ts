import { describe, expect, it } from "vitest";
import { GOLDEN_FIXTURES } from "./fixtures.js";
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

    // Pillars match the fixture-1990 golden output of calculatePillars.
    const fixture = GOLDEN_FIXTURES.find((f) => f.id === "fixture-1990-before-ipchun");
    expect(result.data.pillars).toEqual(fixture?.expected);

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

  it("rejects the lunar calendar as unsupported in v1", () => {
    const result = buildSajuPillarsV1Response({ ...base, calendar: "lunar" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("UNSUPPORTED_CALENDAR");
      expect(result.error.error.field).toBe("calendar");
    }
  });

  it("rejects a malformed birthDate", () => {
    const result = buildSajuPillarsV1Response({ ...base, birthDate: "1990/01/01" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.code).toBe("INVALID_BIRTH_DATE");
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
});
