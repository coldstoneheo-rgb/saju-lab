import type { Confidence, ReportInput, ReportV1 } from "./types.js";

export function generateReportV1(input: ReportInput): ReportV1 {
  const timeKnown = input.input.birthTime !== undefined;
  const confidence: Confidence = timeKnown ? "medium" : "low";
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const locale = input.locale ?? "ko";

  return {
    meta: {
      version: "1.0",
      generatedAt,
      locale,
      timeKnown,
      confidence
    },
    input: input.input,
    pillars: input.pillars,
    overview: {
      summary: "이 리포트는 사주 구조를 바탕으로 한 설명형 요약입니다.",
      toneGuidelines: [
        "확정적 예언 대신 경향과 참고 정보를 제공합니다.",
        "커리어와 재무 내용은 결정지원 관점의 참고 정보입니다."
      ],
      disclaimers: [
        "본 리포트는 정보/오락 목적이며, 금융, 의학, 법률 자문이 아닙니다."
      ]
    },
    personality: {
      strengths: ["구조를 해석하기 위한 기본 성향 요약이 제공될 예정입니다."],
      blindSpots: ["출생 정보와 해석 규칙 확장에 따라 주의점이 구체화됩니다."]
    },
    career: {
      trends: ["커리어 흐름은 경향 중심으로 제시됩니다."],
      risks: ["단정적 판단 대신 리스크 요인을 분리해 표시합니다."],
      actions: ["중요한 선택은 단계적으로 검토하는 방식을 권장합니다."]
    },
    finance: {
      trends: ["재무 흐름은 변동성과 준비 방향 중심으로 요약됩니다."],
      risks: ["투자 판단을 대신하지 않으며 참고 정보로만 제공합니다."],
      actions: ["큰 의사결정 전 추가 자료와 전문가 조언을 함께 검토하세요."]
    },
    yearlyOutlook: {
      year: new Date(generatedAt).getUTCFullYear(),
      highlights: ["연간 하이라이트 규칙은 계산 코어 검증 이후 확장됩니다."],
      cautions: ["검증되지 않은 해석을 확정 정보로 표시하지 않습니다."]
    },
    monthly: {
      goodMonths: [],
      cautionMonths: []
    },
    actionSuggestions: {
      habits: ["작은 습관 개선부터 시작해 주세요."],
      planning: ["단계별 실행 계획을 세우는 것이 유리합니다."],
      riskManagement: ["리스크 요인을 사전에 점검하세요."]
    },
    transparency: {
      certain: [
        `입력된 생년월일: ${input.input.birthDate}`,
        `타임존: ${input.input.timezone}`
      ],
      inferred: [
        "현재 리포트 문장은 rules-only 초안이며, 계산 검증 이후 세분화됩니다."
      ],
      missingDataNotes: timeKnown
        ? []
        : ["출생시간 정보가 없어 시주와 일부 해석의 신뢰도가 낮아질 수 있습니다."]
    }
  };
}
