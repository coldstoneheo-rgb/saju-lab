import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase } from "../golden-pillars.load.js";
import { calculatePillars, resolveBirthKst } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import { SOLAR_MONTH_BOUNDARIES } from "../solar-terms.js";
import type { BirthInput } from "../types.js";
import { DAEUN_DIRECTION_TABLE, DAEUN_TERMS, MINUTES_PER_DAEUN_YEAR, daeunDirection, daeunOf, isDaeunUnavailable, todayKst, type DaeunBlock } from "./daeun.js";

const RULES_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/rules/DAEUN.md");

function parseTables(markdown: string): { direction: unknown[]; terms: unknown[] } {
  const out: Record<string, unknown[]> = {};
  let kind: string | undefined;
  let columns: string[] | undefined;
  for (const line of markdown.split(/\r?\n/)) {
    const heading = /^## 표 \d+ — `(\w+)`/.exec(line);
    if (heading) {
      kind = heading[1];
      columns = undefined;
      out[kind as string] = [];
      continue;
    }
    if (/^## /.test(line)) {
      kind = undefined;
      continue;
    }
    if (!kind || !line.trim().startsWith("|")) continue;
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    if (!columns) {
      columns = cells;
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) continue;
    const cell = (name: string): string => cells[columns?.indexOf(name) ?? -1] ?? "";
    if (kind === "direction") (out[kind] as unknown[]).push({ yearStemPolarity: cell("연간 음양"), sex: cell("성별"), direction: cell("순역") });
    else if (kind === "terms") (out[kind] as unknown[]).push({ code: cell("코드"), ko: cell("절"), branch: cell("월지") });
    else throw new Error(`DAEUN.md has a table the code does not know: ${kind}`);
  }
  return { direction: out["direction"] ?? [], terms: out["terms"] ?? [] };
}

const input = (birthDate: string, birthTime: string | undefined, sex: BirthInput["sex"]): BirthInput =>
  ({ birthDate, ...(birthTime ? { birthTime } : {}), timezone: "Asia/Seoul", sex }) as BirthInput;

function block(birth: BirthInput, referenceDate = "2026-09-22"): DaeunBlock {
  const result = daeunOf(calculatePillars(birth), resolveBirthKst(birth), birth.sex, { referenceDate });
  if (isDaeunUnavailable(result)) throw new Error("unexpected null daeun");
  return result;
}

describe("DAEUN.md ↔ daeun.ts (C1)", () => {
  const parsed = parseTables(readFileSync(RULES_MD, "utf8"));

  it("순역행 4조합 matches the markdown exactly", () => {
    expect(parsed.direction).toEqual(DAEUN_DIRECTION_TABLE);
    expect(DAEUN_DIRECTION_TABLE).toHaveLength(4);
  });

  it("12절 list matches the markdown exactly and is the solar-term table's vocabulary", () => {
    expect(parsed.terms).toEqual(DAEUN_TERMS);
    expect(DAEUN_TERMS).toHaveLength(12);
    const tableTerms = new Set(SOLAR_MONTH_BOUNDARIES.map((boundary) => boundary.term));
    expect([...tableTerms].sort()).toEqual(DAEUN_TERMS.map((term) => term.code).sort());
    // Each 절 opens the month branch the table says, 입춘 = 寅.
    for (const boundary of SOLAR_MONTH_BOUNDARIES.slice(1, 13)) {
      expect(DAEUN_TERMS.find((term) => term.code === boundary.term)?.branch).toBe(["in", "myo", "jin", "sa", "o", "mi", "sin", "yu", "sul", "hae", "ja", "chuk"][boundary.monthOrdinal]);
    }
  });

  it("derives the direction from year-stem polarity × sex; other has no single direction", () => {
    expect(daeunDirection("gap", "male")).toBe("forward");
    expect(daeunDirection("gap", "female")).toBe("backward");
    expect(daeunDirection("eul", "male")).toBe("backward");
    expect(daeunDirection("eul", "female")).toBe("forward");
    expect(daeunDirection("gap", "other")).toBeUndefined();
  });
});

describe("산식 (C2)", () => {
  it("절입 동시각 g-2024-02-04-1727: forward D = to 경칩 (≈30일), backward D = 0", () => {
    const result = block(goldenCase("g-2024-02-04-1727").input);
    expect(result.direction).toBe("both");
    expect(result.forward?.referenceTerm).toEqual({ term: "gyeongchip", at: "2024-03-05T11:23" });
    expect(result.forward?.distanceMinutes).toBe(42836); // 29일 17시간 56분
    expect(result.forward?.startAgeExact).toBeCloseTo(42836 / MINUTES_PER_DAEUN_YEAR, 10);
    expect(result.backward?.referenceTerm).toEqual({ term: "ipchun", at: "2024-02-04T17:27" });
    expect(result.backward?.distanceMinutes).toBe(0);
    expect(result.backward?.startAgeExact).toBe(0);
    expect(result.backward?.startsAt).toBe("2024-02-04");
    expect(result.backward?.years).toBe(0);
    expect(result.backward?.months).toBe(0);
    // 甲辰 → 순행 丙寅 month +1 = 丁卯, 역행 −1 = 乙丑.
    expect(result.forward?.periods[0]).toMatchObject({ index: 0, stem: "jeong", branch: "myo" });
    expect(result.backward?.periods[0]).toMatchObject({ index: 0, stem: "eul", branch: "chuk" });
  });

  it("순역 4조합 on real charts: 甲午 남 순행 · 乙未 남 역행 · 辛卯 여 순행 · 甲辰 여 역행", () => {
    expect(block(input("1955-02-04", "22:47", "male")).direction).toBe("forward"); // 甲午
    expect(block(input("1955-02-04", "22:48", "male")).direction).toBe("backward"); // 乙未
    expect(block(input("2011-11-08", "03:34", "female")).direction).toBe("forward"); // 辛卯
    expect(block(input("2024-02-04", "17:27", "female")).direction).toBe("backward"); // 甲辰
    const male = block(input("1955-02-04", "22:47", "male"));
    expect(male.forward).toBeDefined();
    expect(male.backward).toBeUndefined();
  });

  it("uses the normalized KST clock: 1955-02-04 22:47 (UTC+8:30) is 23:17 KST, 1 minute before 입춘", () => {
    const result = block(input("1955-02-04", "22:47", "male"));
    expect(result.forward?.referenceTerm).toEqual({ term: "ipchun", at: "1955-02-04T23:18" });
    expect(result.forward?.distanceMinutes).toBe(1);
  });

  it("sex other returns both readings and marks direction both", () => {
    const result = block(goldenCase("g-1990-01-01-1030").input);
    expect(result.direction).toBe("both");
    expect(result.forward?.direction).toBe("forward");
    expect(result.backward?.direction).toBe("backward");
    // 己巳 1990-01-01 10:30: forward to 소한 1990-01-05 23:33 = 6543분, backward from 대설 1989-12-07 12:21 = 35889분.
    expect(result.forward?.distanceMinutes).toBe(6543);
    expect(result.backward?.distanceMinutes).toBe(35889);
    expect(result.forward?.startAgeExact).toBeCloseTo(1.5146, 4);
    expect(result.forward?.years).toBe(1);
    expect(result.forward?.months).toBe(6);
    expect(result.forward?.startsAt).toBe("1991-07-08");
    expect(result.forward?.periods.map((period) => `${period.stem}-${period.branch}`)).toEqual(
      ["jeong-chuk", "mu-in", "gi-myo", "gyeong-jin", "sin-sa", "im-o", "gye-mi", "gap-sin", "eul-yu", "byeong-sul"]
    );
    expect(result.backward?.periods.map((period) => `${period.stem}-${period.branch}`)).toEqual(
      ["eul-hae", "gap-sul", "gye-yu", "im-sin", "sin-mi", "gyeong-o", "gi-sa", "mu-jin", "jeong-myo", "byeong-in"]
    );
  });

  it("time-unknown reads noon and flags precision", () => {
    const known = block(input("1990-01-01", "12:00", "male"));
    const unknown = block(input("1990-01-01", undefined, "male"));
    expect(unknown.precision).toBe("time-unknown");
    expect(known.precision).toBe("exact");
    expect(unknown.backward?.distanceMinutes).toBe(known.backward?.distanceMinutes);
  });

  it("periods carry 십신 of stem and branch 정기 from the day master, ages step by 10 and ends meet starts", () => {
    const result = block(goldenCase("g-1988-10-09-0230").input); // 丁 일간, 순행 from 壬戌
    const periods = result.forward?.periods ?? [];
    expect(periods).toHaveLength(10);
    expect(periods[0]).toMatchObject({ stem: "gye", branch: "hae", tenGods: { stem: "pyeongwan", branchPrimary: "jeonggwan" } });
    for (let index = 1; index < periods.length; index += 1) {
      expect(periods[index]?.startAge).toBeCloseTo((periods[0]?.startAge ?? 0) + 10 * index, 10);
      const prevEnd = new Date(`${periods[index - 1]?.endsAt}T00:00Z`).getTime();
      const start = new Date(`${periods[index]?.startsAt}T00:00Z`).getTime();
      expect(start - prevEnd).toBe(86_400_000);
    }
  });

  it("truncates periods whose start passes the table end (2100-12-07): a 2010s birth loses its 10th period", () => {
    const result = block(goldenCase("g-2010-06-21-2359").input);
    expect(result.forward?.truncated).toBe(true);
    expect(result.forward?.periods).toHaveLength(9);
    expect(result.forward?.periods.at(-1)?.startsAt.slice(0, 4)).toBe("2095");
    const old = block(goldenCase("g-1988-10-09-0230").input);
    expect(old.forward?.truncated).toBe(false);
    expect(old.forward?.periods).toHaveLength(10);
  });

  it("returns daeun null with reason when the reference 절 is outside the table (function level — the API cannot reach it)", () => {
    // Backward from a birth before the first table row 1920-01-06 23:41: no 절 at/before it.
    const pillars = calculatePillars(input("1920-01-10", "12:00", "female")); // 己未 → 여 순행, but we force the clock earlier
    const result = daeunOf(pillars, { year: 1920, month: 1, day: 3, hour: 12, minute: 0, timezone: "Asia/Seoul" }, "other", { referenceDate: "2026-09-22" });
    expect(result).toEqual({ daeun: null, reason: "OUT_OF_SOLAR_TERM_TABLE" });
    // 1920-01-06 23:41 ~ 1920-02-05 역행 출생 itself is fine: 소한 1920-01-06 is in the table.
    const early = block(input("1920-01-10", "12:00", "male")); // 己未 남 → 역행
    expect(early.direction).toBe("backward");
    expect(early.backward?.referenceTerm).toEqual({ term: "sohan", at: "1920-01-06T23:41" });
  });

  it("current follows referenceDate: before the first period → null, inside → that index, default = today KST", () => {
    const birth = goldenCase("g-1990-01-01-1030").input;
    expect(block(birth, "1990-06-01").forward?.current).toBeNull();
    expect(block(birth, "1991-07-08").forward?.current).toEqual({ index: 0, startsAt: "1991-07-08", endsAt: "2001-07-07" });
    expect(block(birth, "2001-07-07").forward?.current?.index).toBe(0);
    expect(block(birth, "2001-07-08").forward?.current?.index).toBe(1);
    expect(block(birth, "2026-09-22").forward?.current?.index).toBe(3);
    const today = daeunOf(calculatePillars(birth), resolveBirthKst(birth), birth.sex);
    expect(isDaeunUnavailable(today) ? undefined : today.referenceDate).toBe(todayKst());
    expect(todayKst(Date.UTC(2026, 8, 22, 15, 30))).toBe("2026-09-23"); // 15:30Z = 00:30 KST next day
  });
});

describe("saju-pillars-v1 — options.include daeun (C4 shape)", () => {
  const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "male" as const };

  it("returns the block only when asked and leaves every other field byte-identical", () => {
    const plain = buildSajuPillarsV1Response(base);
    const withBlock = buildSajuPillarsV1Response({ ...base, options: { include: ["daeun"], referenceDate: "2026-09-22" } });
    expect(plain.ok && withBlock.ok).toBe(true);
    if (!plain.ok || !withBlock.ok) return;
    expect("daeun" in plain.data).toBe(false);
    expect(withBlock.data.daeun?.direction).toBe("backward"); // 己巳 남 → 역행
    expect(withBlock.data.daeun?.referenceDate).toBe("2026-09-22");
    expect(withBlock.data.daeun?.backward?.current?.index).toBe(2);
    const { daeun: _omit, ...rest } = withBlock.data;
    expect(JSON.stringify(rest)).toBe(JSON.stringify(plain.data));
  });

  it("honours hiddenStemSchool for the branch 정기 and rejects a malformed referenceDate", () => {
    const japyeong = buildSajuPillarsV1Response({ ...base, options: { include: ["daeun"], hiddenStemSchool: "japyeong", referenceDate: "2026-09-22" } });
    expect(japyeong.ok && japyeong.data.daeun?.school).toBe("japyeong");
    const bad = buildSajuPillarsV1Response({ ...base, options: { include: ["daeun"], referenceDate: "2026-13-01" } });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.error.code).toBe("INVALID_OPTIONS");
    const badFormat = buildSajuPillarsV1Response({ ...base, options: { include: ["daeun"], referenceDate: "20260922" } });
    expect(badFormat.ok).toBe(false);
  });

  it("time-unknown request still yields daeun with precision time-unknown", () => {
    const result = buildSajuPillarsV1Response({ birthDate: "1990-01-01", timeUnknown: true, calendar: "solar", sex: "female", options: { include: ["daeun"], referenceDate: "2026-09-22" } });
    expect(result.ok && result.data.daeun?.precision).toBe("time-unknown");
    expect(result.ok && result.data.daeun?.direction).toBe("forward"); // 己巳 여 → 순행
  });
});
