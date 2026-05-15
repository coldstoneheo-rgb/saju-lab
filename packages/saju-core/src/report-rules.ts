import type { BirthInput, PillarsResult, ReportV1 } from "./types.js";

type ReportSections = Omit<ReportV1, "meta" | "input" | "pillars">;

interface RuleContext {
  input: BirthInput;
  pillars: PillarsResult;
  generatedYear: number;
  timeKnown: boolean;
  dayTone: ToneRule;
  monthTone: ToneRule;
  yearTone: ToneRule;
}

interface ToneRule {
  label: string;
  summary: string;
  strength: string;
  blindSpot: string;
  career: string;
  finance: string;
  action: string;
}

const TONE_BY_STEM: Record<string, ToneRule> = {
  gap: {
    label: "성장",
    summary: "새로운 방향을 열고 가능성을 키우는 힘이 두드러집니다.",
    strength: "초기 아이디어를 만들고 장기적인 방향을 세우는 데 강점이 있습니다.",
    blindSpot: "가능성을 넓히는 과정에서 우선순위가 흐려질 수 있습니다.",
    career: "커리어에서는 새 과제나 역할 확장처럼 성장 여지가 있는 선택지가 잘 맞습니다.",
    finance: "재무에서는 확장보다 기반을 먼저 확인할 때 안정감이 커집니다.",
    action: "새로운 선택지는 목표, 비용, 회복 시간을 함께 적어 보세요."
  },
  eul: {
    label: "조율",
    summary: "상황을 살피며 부드럽게 방향을 조정하는 힘이 드러납니다.",
    strength: "관계를 읽고 작은 변화를 꾸준히 쌓는 데 강점이 있습니다.",
    blindSpot: "주변 흐름을 많이 고려하다가 결정이 늦어질 수 있습니다.",
    career: "커리어에서는 협업, 운영, 개선처럼 조율이 필요한 역할에서 힘이 납니다.",
    finance: "재무에서는 작은 지출과 반복 비용을 정리할 때 효과가 큽니다.",
    action: "결정 기준을 세 가지 이하로 줄이면 실행 속도를 높일 수 있습니다."
  },
  byeong: {
    label: "표현",
    summary: "생각을 밖으로 드러내고 흐름을 밝히는 힘이 있습니다.",
    strength: "상황을 설명하고 사람들을 움직이게 하는 표현력이 강점입니다.",
    blindSpot: "속도가 빨라질수록 세부 검토가 부족해질 수 있습니다.",
    career: "커리어에서는 발표, 설득, 기획처럼 메시지를 전달하는 일이 어울립니다.",
    finance: "재무에서는 즉흥적 선택보다 기록과 비교가 필요합니다.",
    action: "중요한 제안은 하루 뒤 다시 읽고 숫자 조건을 확인하세요."
  },
  jeong: {
    label: "집중",
    summary: "작은 불씨를 오래 지키듯 한 주제에 집중하는 힘이 있습니다.",
    strength: "섬세한 관찰과 꾸준한 개선에 강점이 있습니다.",
    blindSpot: "완성도를 높이려다 피로를 쌓을 수 있습니다.",
    career: "커리어에서는 전문성을 쌓거나 품질을 다듬는 역할이 잘 맞습니다.",
    finance: "재무에서는 소액이라도 규칙적으로 관리하는 방식이 유리합니다.",
    action: "해야 할 일을 작게 나누고 마감 기준을 먼저 정해 보세요."
  },
  mu: {
    label: "안정",
    summary: "흔들리는 상황을 붙잡고 기준을 세우는 힘이 있습니다.",
    strength: "복잡한 일을 구조화하고 책임 있게 버티는 데 강점이 있습니다.",
    blindSpot: "변화가 필요한 순간에도 익숙한 방식을 오래 유지할 수 있습니다.",
    career: "커리어에서는 관리, 운영, 책임 범위가 분명한 역할이 잘 맞습니다.",
    finance: "재무에서는 현금 흐름과 안전 여력을 확보할수록 선택지가 넓어집니다.",
    action: "큰 결정을 하기 전 유지 비용과 회복 기간을 먼저 계산하세요."
  },
  gi: {
    label: "정리",
    summary: "흩어진 정보를 모아 현실적인 형태로 정리하는 힘이 있습니다.",
    strength: "세부 조건을 살피고 실용적인 방법을 찾는 데 강점이 있습니다.",
    blindSpot: "검토가 길어지면 기회를 놓쳤다고 느낄 수 있습니다.",
    career: "커리어에서는 지원, 분석, 프로세스 개선처럼 현실 감각이 필요한 일이 어울립니다.",
    finance: "재무에서는 예산표, 지출 분류, 자동 저축처럼 체계가 도움이 됩니다.",
    action: "완벽한 계획보다 이번 주에 확인할 숫자 하나를 정해 보세요."
  },
  gyeong: {
    label: "기준",
    summary: "선택지를 분명히 나누고 기준을 세우는 힘이 있습니다.",
    strength: "판단 기준을 세우고 불필요한 것을 덜어내는 데 강점이 있습니다.",
    blindSpot: "기준이 강해질수록 유연한 협의가 어려워질 수 있습니다.",
    career: "커리어에서는 문제 해결, 기준 수립, 품질 관리 성격의 일이 잘 맞습니다.",
    finance: "재무에서는 손실 한도와 지출 상한을 미리 정하는 것이 중요합니다.",
    action: "선택 전 중단 기준과 재검토 시점을 함께 정하세요."
  },
  sin: {
    label: "정밀",
    summary: "세부를 정확히 보고 완성도를 높이는 힘이 있습니다.",
    strength: "작은 차이를 발견하고 결과물을 다듬는 데 강점이 있습니다.",
    blindSpot: "비판적 기준이 높아 스스로에게 압박이 커질 수 있습니다.",
    career: "커리어에서는 검토, 편집, 데이터, 품질 중심의 역할이 어울립니다.",
    finance: "재무에서는 계약 조건과 수수료처럼 작은 항목을 확인할수록 좋습니다.",
    action: "완료 기준을 먼저 정하고 남은 개선은 다음 단계로 넘겨 보세요."
  },
  im: {
    label: "탐색",
    summary: "정보를 넓게 살피고 흐름을 읽는 힘이 있습니다.",
    strength: "낯선 정보를 빠르게 흡수하고 대안을 찾는 데 강점이 있습니다.",
    blindSpot: "선택지가 많아질수록 결론을 미루기 쉽습니다.",
    career: "커리어에서는 조사, 전략, 콘텐츠, 이동성이 있는 역할에서 힘이 납니다.",
    finance: "재무에서는 여러 가능성을 보되 검증되지 않은 정보는 거리를 두는 편이 안전합니다.",
    action: "새 정보는 출처, 비용, 실패 시 손실을 한 줄씩 적어 보세요."
  },
  gye: {
    label: "유연",
    summary: "상황 변화에 맞춰 조용히 방향을 바꾸는 힘이 있습니다.",
    strength: "복잡한 감정과 맥락을 읽고 유연하게 대응하는 데 강점이 있습니다.",
    blindSpot: "분명한 표현을 미루면 주변이 의도를 오해할 수 있습니다.",
    career: "커리어에서는 상담, 리서치, 기획 보조, 장기 관찰이 필요한 일이 어울립니다.",
    finance: "재무에서는 불확실성이 큰 선택보다 작은 실험과 기록이 유리합니다.",
    action: "생각을 혼자 오래 두지 말고 선택 조건을 문장으로 정리해 보세요."
  }
};

const BRANCH_MONTH_HINTS: Record<string, { goodMonths: string[]; cautionMonths: string[]; note: string }> = {
  ja: { goodMonths: ["1월", "12월"], cautionMonths: ["6월"], note: "정리와 저장의 흐름이 강해 계획을 차분히 다듬기 좋습니다." },
  chuk: { goodMonths: ["1월", "2월"], cautionMonths: ["7월"], note: "기반을 점검하고 미뤄 둔 일을 정리하기 좋은 흐름입니다." },
  in: { goodMonths: ["2월", "3월"], cautionMonths: ["8월"], note: "새로운 시도를 시작하기 쉽지만 속도 조절이 필요합니다." },
  myo: { goodMonths: ["3월", "4월"], cautionMonths: ["9월"], note: "관계와 협업의 기회가 늘 수 있어 조율이 중요합니다." },
  jin: { goodMonths: ["4월", "5월"], cautionMonths: ["10월"], note: "변화 전 점검이 필요한 시기라 기준 정리가 도움이 됩니다." },
  sa: { goodMonths: ["5월", "6월"], cautionMonths: ["11월"], note: "표현과 실행력이 살아나지만 과열을 경계해야 합니다." },
  o: { goodMonths: ["6월", "7월"], cautionMonths: ["12월"], note: "성과를 드러내기 좋지만 무리한 확장은 피하는 편이 좋습니다." },
  mi: { goodMonths: ["7월", "8월"], cautionMonths: ["1월"], note: "현실적인 조정과 마무리 작업에 힘이 실립니다." },
  sin: { goodMonths: ["8월", "9월"], cautionMonths: ["2월"], note: "분석과 정리에 유리하지만 관계 표현은 부드럽게 가져가세요." },
  yu: { goodMonths: ["9월", "10월"], cautionMonths: ["3월"], note: "결과물을 다듬고 기준을 세우기 좋은 흐름입니다." },
  sul: { goodMonths: ["10월", "11월"], cautionMonths: ["4월"], note: "책임과 마무리가 중요해지는 흐름입니다." },
  hae: { goodMonths: ["11월", "12월"], cautionMonths: ["5월"], note: "탐색과 회복에 유리하지만 결정은 천천히 확인하세요." }
};

const DEFAULT_TONE = TONE_BY_STEM.gi;
const DEFAULT_MONTH_HINT = BRANCH_MONTH_HINTS.ja;

export function buildReportSections(input: {
  birthInput: BirthInput;
  pillars: PillarsResult;
  generatedYear: number;
}): ReportSections {
  const context = createRuleContext(input.birthInput, input.pillars, input.generatedYear);
  const monthHint = BRANCH_MONTH_HINTS[context.pillars.month.branch] ?? DEFAULT_MONTH_HINT;

  if (monthHint === undefined) {
    throw new Error("Default month hint is not configured.");
  }

  return {
    overview: {
      summary: `이 리포트는 ${formatPillar(context.pillars.day)} 일주를 중심으로 사주 구조를 읽기 쉽게 정리한 설명형 요약입니다. ${context.dayTone.summary}`,
      toneGuidelines: [
        "사주 용어는 꼭 필요한 범위에서만 사용하고, 바로 이해할 수 있는 설명을 함께 제공합니다.",
        "확정적 예언 대신 경향, 리스크, 준비 방향을 구분해 보여줍니다."
      ],
      disclaimers: [
        "본 리포트는 정보/오락 목적이며, 금융, 의학, 법률 자문이 아닙니다."
      ]
    },
    personality: {
      strengths: [
        context.dayTone.strength,
        `월주는 주변 환경과 일의 리듬을 볼 때 참고합니다. ${context.monthTone.summary}`
      ],
      blindSpots: [
        context.dayTone.blindSpot,
        "강점이 커질수록 한쪽 방식에 익숙해질 수 있으므로, 중요한 선택은 다른 관점과 함께 확인하는 편이 좋습니다."
      ]
    },
    career: {
      trends: [
        context.dayTone.career,
        `연주는 큰 흐름을 보는 참고점입니다. ${context.yearTone.label} 성향은 장기 방향을 정리할 때 단서가 됩니다.`
      ],
      risks: [
        "커리어 판단은 현실 조건, 시장 상황, 건강한 회복 시간과 함께 봐야 합니다.",
        context.monthTone.blindSpot
      ],
      actions: [
        context.dayTone.action,
        "전환을 고민한다면 역할, 수입, 학습 비용을 분리해 적어 보세요."
      ]
    },
    finance: {
      trends: [
        context.dayTone.finance,
        "재무 흐름은 확정 수익을 예측하기보다 지출 습관과 리스크 관리 방식을 점검하는 참고 정보로 보는 편이 안전합니다."
      ],
      risks: [
        "투자 판단을 대신하지 않으며, 과도한 확신이나 충동 지출은 별도로 점검해야 합니다.",
        "불확실한 정보만으로 큰 금액을 움직이는 선택은 피하는 것이 좋습니다."
      ],
      actions: [
        "큰 의사결정 전 예산, 최악의 경우, 회복 기간을 함께 적어보세요.",
        context.monthTone.action
      ]
    },
    yearlyOutlook: {
      year: context.generatedYear,
      highlights: [
        `${context.generatedYear}년은 ${context.dayTone.label} 성향을 현실적인 계획으로 옮기는 데 초점을 둘 수 있습니다.`,
        "이미 가진 자원과 관계를 정리하면 다음 선택의 여지가 더 선명해집니다."
      ],
      cautions: [
        "검증되지 않은 해석을 확정 정보로 받아들이지 말고, 중요한 결정은 현실 자료와 함께 보완해야 합니다.",
        "빠른 결론보다 반복해서 확인할 수 있는 작은 지표를 두는 편이 안전합니다."
      ]
    },
    monthly: {
      goodMonths: monthHint.goodMonths.map((month) => `${month}: ${monthHint.note}`),
      cautionMonths: monthHint.cautionMonths.map((month) => `${month}: 속도보다 점검을 우선하면 부담을 줄일 수 있습니다.`)
    },
    actionSuggestions: {
      habits: [
        "하루 한 번 오늘의 선택과 감정 변화를 짧게 기록해 보세요.",
        context.dayTone.action
      ],
      planning: [
        "목표를 한 달 단위로 나누고, 실행 기준과 중단 기준을 함께 정해 보세요.",
        "커리어와 재무 선택은 기대 효과와 비용을 분리해서 비교하는 방식이 좋습니다."
      ],
      riskManagement: [
        "단정적 조언이나 확정 수익처럼 들리는 정보는 한 번 더 검토하세요.",
        "중요한 선택은 전문가 조언과 현실 자료를 함께 확인하는 보조 도구로만 활용하세요."
      ]
    },
    transparency: {
      certain: [
        `입력된 생년월일: ${context.input.birthDate}`,
        `타임존: ${context.input.timezone}`,
        `계산된 일주: ${formatPillar(context.pillars.day)}`
      ],
      inferred: [
        "연주, 월주, 일주, 시주는 사주 구조를 나눠 보는 표시입니다. 각각 큰 흐름, 환경, 나의 중심, 세부 흐름을 읽는 데 사용합니다.",
        "성향, 커리어, 재무 문장은 계산된 기둥을 바탕으로 한 규칙 기반 해석이며 확정적 예측이 아닙니다.",
        "현재 계산 코어는 내장된 검증 fixture 범위에서 우선 동작하며, 절기 데이터 범위는 단계적으로 확장됩니다."
      ],
      missingDataNotes: context.timeKnown
        ? []
        : ["출생시간 정보가 없어 시주와 일부 해석의 신뢰도가 낮아질 수 있습니다."]
    }
  };
}

function createRuleContext(input: BirthInput, pillars: PillarsResult, generatedYear: number): RuleContext {
  return {
    input,
    pillars,
    generatedYear,
    timeKnown: input.birthTime !== undefined,
    dayTone: toneForStem(pillars.day.stem),
    monthTone: toneForStem(pillars.month.stem),
    yearTone: toneForStem(pillars.year.stem)
  };
}

function toneForStem(stem: string): ToneRule {
  const tone = TONE_BY_STEM[stem] ?? DEFAULT_TONE;

  if (tone === undefined) {
    throw new Error("Default tone rule is not configured.");
  }

  return tone;
}

function formatPillar(pillar: { stem: string; branch: string }): string {
  return `${termLabel(pillar.stem)}${termLabel(pillar.branch)}`;
}

function termLabel(value: string): string {
  const labels: Record<string, string> = {
    gap: "갑",
    eul: "을",
    byeong: "병",
    jeong: "정",
    mu: "무",
    gi: "기",
    gyeong: "경",
    sin: "신",
    im: "임",
    gye: "계",
    ja: "자",
    chuk: "축",
    in: "인",
    myo: "묘",
    jin: "진",
    sa: "사",
    o: "오",
    mi: "미",
    yu: "유",
    sul: "술",
    hae: "해"
  };

  return labels[value] ?? value;
}
