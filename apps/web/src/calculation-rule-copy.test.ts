import { describe, expect, it } from "vitest";
import { calculatePillarsWithResolution } from "@saju-lab/saju-core";
import { describeCalculationRule } from "./calculation-rule-copy.js";

const seoul = { timezone: "Asia/Seoul", sex: "female" } as const;

describe("describeCalculationRule — the line under the pillars", () => {
  it("says nothing special for a plain reading away from every boundary", () => {
    const { resolution, alternates } = calculatePillarsWithResolution({ ...seoul, birthDate: "1975-08-15", birthTime: "10:30" });
    const copy = describeCalculationRule(resolution, alternates);

    expect(copy.parts).toEqual(["표준시 이력 해당 없음", "진태양시 미적용", "자정 기준 일주"]);
    expect(copy.boundaryPrompt).toBeUndefined();
    expect(copy.uncorrectedNote).toBeUndefined();
  });

  it("prompts for a birth place when the reading sits in the 시지 boundary window", () => {
    const { resolution, alternates } = calculatePillarsWithResolution({ ...seoul, birthDate: "1990-06-15", birthTime: "13:10" });
    const copy = describeCalculationRule(resolution, alternates);

    expect(copy.parts[1]).toBe("진태양시 미적용(서울특별시 기준 -32분 보정 시 시주 변동 가능)");
    expect(copy.boundaryPrompt).toContain("출생지를 고르면");
    expect(copy.uncorrectedNote).toBeUndefined();
  });

  it("names the applied correction and the uncorrected hour pillar once a place is chosen", () => {
    const { resolution, alternates } = calculatePillarsWithResolution({
      ...seoul,
      birthDate: "1990-06-15",
      birthTime: "13:10",
      birthPlace: "busan",
      options: { trueSolarTime: true }
    });
    const copy = describeCalculationRule(resolution, alternates, (value) => value.toUpperCase());

    expect(copy.parts[1]).toBe("진태양시 적용(부산광역시 -24분, 균시차 미적용)");
    expect(copy.boundaryPrompt).toBeUndefined();
    expect(copy.uncorrectedNote).toContain("시주 EUL MI");
    expect(copy.uncorrectedNote).toContain("경도 보정 명식");
  });

  it("explains the standard-time conversion for a 1955 +08:30 reading", () => {
    const { resolution, alternates } = calculatePillarsWithResolution({ ...seoul, birthDate: "1955-02-04", birthTime: "22:50" });
    const copy = describeCalculationRule(resolution, alternates);

    expect(copy.parts[0]).toBe("표준시 이력 반영(UTC+8:30, 30분 더해 KST로 환산)");
  });

  it("mentions the early 23시대 policy only when it is the applied rule", () => {
    const late = calculatePillarsWithResolution({ ...seoul, birthDate: "2010-06-21", birthTime: "23:30" });
    const early = calculatePillarsWithResolution({ ...seoul, birthDate: "2010-06-21", birthTime: "23:30", options: { jaHourPolicy: "early" } });

    expect(describeCalculationRule(late.resolution, late.alternates).parts).not.toContain("23시대 다음 날 일주");
    expect(describeCalculationRule(early.resolution, early.alternates).parts).toContain("23시대 다음 날 일주");
    expect(late.alternates?.jaHourPolicy?.policy).toBe("early"); // the collapsed table has something to show
  });
});
