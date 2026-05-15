import { getPillarTerms, getSajuTerm } from "./terminology.js";
import type { PaidReportV1, ReportInput, ReportV1 } from "./types.js";
import { generateReportV1 } from "./report.js";

export function generatePaidReportV1(input: ReportInput): PaidReportV1 {
  const baseReport = generateReportV1(input);
  const timeKnown = baseReport.meta.timeKnown;
  const generatedDate = baseReport.meta.generatedAt.slice(0, 10).replaceAll("-", "");
  const dayPillar = formatPillar(baseReport.pillars.day);
  const monthPillar = formatPillar(baseReport.pillars.month);
  const timeNotice = timeKnown
    ? "출생시간이 반영되어 시주까지 포함한 상세 리포트입니다."
    : "출생시간이 없어 시주와 세부 흐름은 낮은 신뢰도로 다룹니다.";

  return {
    meta: {
      ...baseReport.meta,
      product: "one-time-detailed-report",
      exportFormat: "pdf-ready-html"
    },
    input: baseReport.input,
    pillars: baseReport.pillars,
    baseReport,
    cover: {
      title: "Saju Lab 유료 상세 리포트",
      subtitle: `${dayPillar} 일주와 ${monthPillar} 월주를 중심으로 커리어와 재무 흐름을 깊게 정리합니다.`,
      scopeNote: "이 상세 리포트는 경향, 리스크, 실행 방향을 정리한 정보/오락 목적의 분석입니다.",
      privacyNote: "이번 SKU는 로그인, 계정 저장, 서버 보관을 포함하지 않는 로컬 다운로드 중심 모델입니다."
    },
    glossary: [
      ...getPillarTerms().map((term) => ({
        term: term.label,
        plainMeaning: `${term.short}: ${term.description}`
      })),
      {
        term: getSajuTerm("solarTerm").label,
        plainMeaning: `${getSajuTerm("solarTerm").short}: ${getSajuTerm("solarTerm").description}`
      }
    ],
    executiveSummary: {
      title: "핵심 요약",
      summary: "무료 리포트의 핵심을 바탕으로 커리어와 재무 판단에 필요한 질문을 더 촘촘히 정리합니다.",
      items: [
        baseReport.overview.summary,
        timeNotice,
        "확정적 예언보다 반복해서 점검할 수 있는 선택 기준을 중심에 둡니다."
      ]
    },
    personalityDeepDive: {
      title: "성향 심화",
      summary: "강점과 주의점을 동시에 보면서 실제 선택에서 어떻게 드러나는지 정리합니다.",
      items: [
        ...baseReport.personality.strengths,
        ...baseReport.personality.blindSpots,
        "강점이 과해지는 순간을 알아차리면 선택의 폭을 더 안정적으로 유지할 수 있습니다."
      ]
    },
    careerDeepDive: {
      roleFit: {
        title: "역할 적합도",
        summary: "어떤 직무명이 맞는지 단정하기보다 일하는 환경과 역할 조건을 나눠 봅니다.",
        items: [
          ...baseReport.career.trends,
          "성과가 잘 드러나는 조건과 회복 시간이 필요한 조건을 분리해 점검하세요."
        ]
      },
      workStyle: {
        title: "일하는 방식",
        summary: "협업, 의사결정, 학습 방식에서 반복될 수 있는 패턴을 정리합니다.",
        items: [
          ...baseReport.career.actions,
          "새 역할을 검토할 때 책임 범위, 피드백 방식, 수입 구조를 같은 표에 놓고 비교하세요."
        ]
      },
      riskPatterns: {
        title: "커리어 리스크",
        summary: "전환, 과로, 기준 흔들림처럼 현실에서 확인해야 할 위험 신호를 모읍니다.",
        items: [
          ...baseReport.career.risks,
          "중요한 결정은 시장 상황과 계약 조건, 건강한 회복 시간을 함께 확인해야 합니다."
        ]
      },
      actionPlan: {
        title: "커리어 실행 계획",
        summary: "이번 달 안에 확인할 수 있는 작은 행동으로 바꿉니다.",
        items: [
          "현재 역할에서 에너지가 생기는 업무와 소모되는 업무를 각각 3개씩 적어 보세요.",
          "전환 후보가 있다면 기대 효과, 비용, 회복 기간, 중단 기준을 한 장에 정리하세요.",
          "혼자 판단하기 어려운 결정은 업계 경험자나 전문가와 한 번 더 검토하세요."
        ]
      }
    },
    financeDeepDive: {
      rhythm: {
        title: "재무 리듬",
        summary: "돈의 흐름은 예측 대상이 아니라 습관과 위험 감수 방식을 점검하는 참고 정보입니다.",
        items: [
          ...baseReport.finance.trends,
          ...baseReport.finance.actions,
          "수입 확대보다 먼저 고정비, 비상금, 회복 가능한 손실 범위를 확인하세요."
        ]
      },
      riskChecklist: {
        title: "재무 리스크 체크리스트",
        items: [
          {
            label: "확신 과열",
            detail: "좋아 보이는 선택일수록 손실 한도와 중단 기준을 먼저 적었는지 확인합니다."
          },
          {
            label: "반복 지출",
            detail: "작은 결제가 누적되어 선택지를 줄이고 있지 않은지 월 단위로 확인합니다."
          },
          {
            label: "정보 출처",
            detail: "검증되지 않은 정보만으로 큰 금액을 움직이지 않는지 점검합니다."
          }
        ]
      },
      planningPrompts: {
        title: "재무 계획 질문",
        summary: "실제 숫자를 넣어 볼 수 있는 질문으로 바꿉니다.",
        items: [
          "이번 달 지출 중 줄여도 삶의 질이 크게 흔들리지 않는 항목은 무엇인가요?",
          "큰 선택을 했을 때 1개월, 3개월, 6개월 뒤 회복 가능한 범위는 어디까지인가요?",
          "수익 기대보다 먼저 감당 가능한 손실 범위를 숫자로 적었나요?"
        ]
      }
    },
    yearlyMonthlyExpansion: {
      yearlyTheme: {
        title: `${baseReport.yearlyOutlook.year}년 확장 흐름`,
        summary: "연간 흐름은 계획의 방향을 잡는 참고 축으로만 사용합니다.",
        items: [
          ...baseReport.yearlyOutlook.highlights,
          ...baseReport.yearlyOutlook.cautions,
          "분기마다 목표, 비용, 회복 시간을 다시 확인하면 과한 해석을 줄일 수 있습니다."
        ]
      },
      monthlyThemes: buildMonthlyThemes(baseReport)
    },
    actionPlan: {
      title: "실천 계획",
      items: [
        {
          label: "이번 주",
          detail: "커리어와 재무 선택에서 가장 먼저 확인할 숫자나 조건을 하나만 정합니다."
        },
        {
          label: "이번 달",
          detail: "월간 하이라이트를 참고해 시작할 일과 멈출 일을 각각 하나씩 선택합니다."
        },
        {
          label: "분기 점검",
          detail: "계획이 실제 생활, 예산, 관계에 어떤 부담을 만들었는지 다시 봅니다."
        },
        {
          label: "과해석 방지",
          detail: "불안이나 기대가 커질수록 리포트 문장을 현실 자료와 함께 검토합니다."
        }
      ]
    },
    transparencyAppendix: {
      certain: baseReport.transparency.certain,
      inferred: [
        ...baseReport.transparency.inferred,
        "유료 상세 리포트의 심화 문장도 동일한 규칙 기반 해석에서 확장된 참고 정보입니다."
      ],
      missingDataNotes: baseReport.transparency.missingDataNotes,
      disclaimers: [
        ...baseReport.overview.disclaimers,
        "이 리포트는 투자 추천, 의학적 판단, 법률 판단, 확정적 예측을 제공하지 않습니다."
      ]
    },
    pdf: {
      filename: `saju-lab-paid-report-${generatedDate}.html`,
      requiredNotices: [
        "생성 시각",
        "입력 요약",
        "신뢰도",
        "출생시간 미상 영향",
        "정보/오락 목적 및 비자문 고지",
        "로컬 다운로드 및 계정 저장 없음"
      ],
      printHints: [
        "브라우저 인쇄에서 PDF 저장을 선택할 수 있는 HTML 구조를 우선 사용합니다.",
        "A4 폭에서 섹션 제목, 표, 체크리스트가 잘리지 않도록 구성합니다.",
        "향후 실제 PDF 라이브러리를 도입해도 동일한 데이터 구조를 재사용합니다."
      ]
    }
  };
}

function buildMonthlyThemes(report: ReportV1): PaidReportV1["yearlyMonthlyExpansion"]["monthlyThemes"] {
  const good = report.monthly.goodMonths.map((item) => parseMonthItem(item, "확장"));
  const caution = report.monthly.cautionMonths.map((item) => parseMonthItem(item, "점검"));

  return [...good, ...caution].map((item) => ({
    month: item.month,
    theme: item.theme,
    action: item.kind === "확장"
      ? "작게 시작하고 실행 기준을 기록하세요."
      : "속도를 늦추고 비용, 관계, 회복 시간을 먼저 확인하세요."
  }));
}

function parseMonthItem(value: string, kind: "확장" | "점검"): { month: string; theme: string; kind: "확장" | "점검" } {
  const [month, note] = value.split(": ");

  return {
    month: month ?? "월간",
    theme: note ? `${kind}: ${note}` : `${kind}: 월간 흐름을 참고해 계획을 점검하세요.`,
    kind
  };
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
