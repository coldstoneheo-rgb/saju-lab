import { describe, expect, it } from "vitest";
import { loadGoldenPillarCases } from "./golden-pillars.load.js";
import { calculatePillarsWithResolution } from "./pillars.js";
import { buildSajuPillarsV1Response } from "./saju-pillars-v1.js";

// TASK-2026-0923 golden 39 (후보 설계표 life-coordinator/docs/GOLDEN-CANDIDATES-2026-0923.md).
// Items that belong beside the golden table rather than in it; describe name = 설계표 행 키.

describe("U1 — 1911-06-15 10:00: offset history known (+8:30), 24기 table not (starts 1920) → rejected, never a silent answer", () => {
  it("core throws and v1 maps it to OUT_OF_SUPPORTED_RANGE", () => {
    expect(() => calculatePillarsWithResolution({ birthDate: "1911-06-15", birthTime: "10:00", timezone: "Asia/Seoul", sex: "other" })).toThrow("No Ipchun boundary is available for 1911");
    const result = buildSajuPillarsV1Response({ birthDate: "1911-06-15", birthTime: "10:00", calendar: "solar", sex: "other" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.error.code).toBe("OUT_OF_SUPPORTED_RANGE");
  });
});

describe("L1 음의 대조 — the 윤달 flag is actually read", () => {
  it("lunar 1963-04-15: 평달 → 1963-05-08, 윤달 → 1963-06-06 (KARI getSolCalInfo 2026-09-23 both rows)", () => {
    const input = { birthDate: "1963-04-15", birthTime: "10:00", timezone: "Asia/Seoul", sex: "male" as const, calendar: "lunar" as const };
    expect(calculatePillarsWithResolution({ ...input, isLeapMonth: false }).resolution.calendar.solarDate).toBe("1963-05-08");
    expect(calculatePillarsWithResolution({ ...input, isLeapMonth: true }).resolution.calendar.solarDate).toBe("1963-06-06");
  });
});

describe("T1~T6 — every 진태양시경계 row actually crosses an hour boundary", () => {
  const rows = loadGoldenPillarCases().filter((row) => row.categories.includes("진태양시경계"));

  it.each(rows.map((row) => [row.id, row] as const))("%s: corrected hour ≠ uncorrected hour (alternates), day pillar unchanged", (_id, row) => {
    const result = calculatePillarsWithResolution(row.input);
    expect(result.resolution.trueSolarTimeApplied).toBe(true);
    const plain = result.alternates?.trueSolarTime?.pillars;
    expect(plain?.time).toBeDefined();
    expect(plain?.time).not.toEqual(result.pillars.time);
    expect(plain?.day).toEqual(result.pillars.day);
  });
});

describe("G1-3 — golden ≥ 50 and each category at least the planned count", () => {
  // 계획 §G1-1 목표 = 기존 11행의 범주 수 + 설계표 §2의 추가 수 (UTC+8:30은 U1 대신 D2가 채운다).
  const MINIMUM: Record<string, number> = { 진태양시경계: 6, 시간미상: 3, 윤달: 4, 절기경계: 13, "23시대": 4, DST: 4, "UTC+8:30": 4, 기본: 10, 합충: 5 };

  it("counts rows per category", () => {
    const rows = loadGoldenPillarCases();
    expect(rows.length).toBeGreaterThanOrEqual(50);
    for (const [category, minimum] of Object.entries(MINIMUM)) {
      expect(rows.filter((row) => row.categories.includes(category)).length, category).toBeGreaterThanOrEqual(minimum);
    }
  });
});
