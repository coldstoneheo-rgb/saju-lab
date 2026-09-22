import { findBirthPlace, type CalculationResolution, type PillarsAlternates } from "@saju-lab/saju-core";

// One line under the pillars that says which rules produced them (회의 F1):
// standard-time history, true solar time, day boundary. Assembled from the
// core's resolution so the copy can never disagree with the calculation.

export interface CalculationRuleCopy {
  /** The always-visible rule line, parts joined with " · ". */
  parts: string[];
  /** Shown only when the reading sits inside the 시지 boundary window and no correction was applied yet. */
  boundaryPrompt?: string;
  /** Shown after a correction was applied, when the uncorrected reading differs. */
  uncorrectedNote?: string;
}

export function describeCalculationRule(
  resolution: CalculationResolution,
  alternates?: PillarsAlternates,
  label: (value: string) => string = (value) => value
): CalculationRuleCopy {
  const parts: string[] = [];

  if (resolution.appliedOffsetMin !== 0) {
    const reasons = resolution.flags
      .filter((flag) => flag === "utc+8:30" || flag === "dst")
      .map((flag) => (flag === "dst" ? "서머타임" : "UTC+8:30"));
    const shift = resolution.appliedOffsetMin < 0 ? `${-resolution.appliedOffsetMin}분 더해` : `${resolution.appliedOffsetMin}분 빼서`;
    parts.push(`표준시 이력 반영(${reasons.join("·")}, ${shift} KST로 환산)`);
  } else {
    parts.push("표준시 이력 해당 없음");
  }

  const placeName = findBirthPlace(resolution.birthPlace)?.nameKo ?? resolution.birthPlace;
  if (resolution.trueSolarTimeApplied) {
    parts.push(`진태양시 적용(${placeName} ${resolution.trueSolarOffsetMin}분, 균시차 미적용)`);
  } else if (alternates?.trueSolarTime) {
    parts.push(`진태양시 미적용(${placeName} 기준 ${resolution.trueSolarOffsetMin}분 보정 시 시주 변동 가능)`);
  } else {
    parts.push("진태양시 미적용");
  }

  parts.push(resolution.dayBoundary === "midnight" ? "자정 기준 일주" : "진태양시 자정 기준 일주");
  if (resolution.jaHourPolicy === "early") {
    parts.push("23시대 다음 날 일주");
  }

  const nearHourBoundary = resolution.nearBoundary.some((flag) => flag.kind === "hourBranch");
  const copy: CalculationRuleCopy = { parts };

  if (nearHourBoundary && !resolution.trueSolarTimeApplied) {
    copy.boundaryPrompt = "출생 시각이 시지 경계 근처입니다 — 출생지를 고르면 경도 보정 명식으로 봅니다.";
  }
  if (resolution.trueSolarTimeApplied && alternates?.trueSolarTime) {
    const time = alternates.trueSolarTime.pillars.time;
    copy.uncorrectedNote = time
      ? `보정 전 시계 시각 그대로면 시주 ${label(time.stem)} ${label(time.branch)} — 어느 쪽으로 봤는지: 경도 보정 명식`
      : "보정 전 명식과 다릅니다 — 어느 쪽으로 봤는지: 경도 보정 명식";
  }
  return copy;
}
