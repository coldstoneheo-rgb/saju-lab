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
      summary: "이 리포트는 태어난 날짜와 시간을 바탕으로 성향과 흐름을 읽기 쉽게 정리한 설명형 요약입니다.",
      toneGuidelines: [
        "사주 용어는 꼭 필요한 범위에서만 쓰고, 바로 이해할 수 있는 설명을 함께 제공합니다.",
        "확정적 예언 대신 경향, 리스크, 준비 방향을 구분해 보여줍니다."
      ],
      disclaimers: [
        "본 리포트는 정보/오락 목적이며, 금융, 의학, 법률 자문이 아닙니다."
      ]
    },
    personality: {
      strengths: ["일의 흐름을 구조화하고, 선택지를 비교해 보는 힘이 드러나는 편입니다."],
      blindSpots: ["생각이 많아질수록 실행 시점이 늦어질 수 있어 작은 결정부터 분리해 보는 것이 좋습니다."]
    },
    career: {
      trends: ["커리어는 한 번에 크게 바꾸기보다, 현재 강점을 살릴 수 있는 역할을 넓히는 흐름이 어울립니다."],
      risks: ["확신이 부족한 상태에서 큰 전환을 서두르면 피로가 커질 수 있습니다."],
      actions: ["중요한 선택은 목표, 비용, 회복 시간을 나눠 검토하는 방식을 권장합니다."]
    },
    finance: {
      trends: ["재무는 공격적인 확장보다 현금 흐름과 고정 지출을 정리할 때 안정감이 커지는 흐름입니다."],
      risks: ["투자 판단을 대신하지 않으며, 충동 지출과 과도한 확신을 경계하는 참고 정보로만 제공합니다."],
      actions: ["큰 의사결정 전 예산, 최악의 경우, 회복 기간을 함께 적어보세요."]
    },
    yearlyOutlook: {
      year: new Date(generatedAt).getUTCFullYear(),
      highlights: ["올해의 핵심은 방향을 넓히기보다 이미 가진 자원을 정돈해 다음 선택의 여지를 만드는 데 있습니다."],
      cautions: ["검증되지 않은 해석을 확정 정보로 표시하지 않으며, 중요한 결정은 현실 자료와 함께 보완해야 합니다."]
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
        "연주, 월주, 일주, 시주는 사주 구조를 나눠 보는 표시입니다. 각각 큰 흐름, 환경, 나의 중심, 세부 흐름을 읽는 데 사용합니다.",
        "현재 계산 코어는 내장된 검증 fixture 범위에서 우선 동작하며, 절기 데이터 범위는 단계적으로 확장됩니다."
      ],
      missingDataNotes: timeKnown
        ? []
        : ["출생시간 정보가 없어 시주와 일부 해석의 신뢰도가 낮아질 수 있습니다."]
    }
  };
}
