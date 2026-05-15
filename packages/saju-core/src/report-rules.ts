import type { BirthInput, PillarsResult, ReportV1 } from "./types.js";
import { formatReportCopy, reportCopy, type ReportCopyKey } from "./report-copy.js";

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
  label: ReportCopyKey;
  summary: ReportCopyKey;
  strength: ReportCopyKey;
  blindSpot: ReportCopyKey;
  career: ReportCopyKey;
  finance: ReportCopyKey;
  action: ReportCopyKey;
}

const TONE_BY_STEM: Record<string, ToneRule> = {
  gap: {
    label: "report.rules.tone.gap.label",
    summary: "report.rules.tone.gap.summary",
    strength: "report.rules.tone.gap.strength",
    blindSpot: "report.rules.tone.gap.blindSpot",
    career: "report.rules.tone.gap.career",
    finance: "report.rules.tone.gap.finance",
    action: "report.rules.tone.gap.action"
  },
  eul: {
    label: "report.rules.tone.eul.label",
    summary: "report.rules.tone.eul.summary",
    strength: "report.rules.tone.eul.strength",
    blindSpot: "report.rules.tone.eul.blindSpot",
    career: "report.rules.tone.eul.career",
    finance: "report.rules.tone.eul.finance",
    action: "report.rules.tone.eul.action"
  },
  byeong: {
    label: "report.rules.tone.byeong.label",
    summary: "report.rules.tone.byeong.summary",
    strength: "report.rules.tone.byeong.strength",
    blindSpot: "report.rules.tone.byeong.blindSpot",
    career: "report.rules.tone.byeong.career",
    finance: "report.rules.tone.byeong.finance",
    action: "report.rules.tone.byeong.action"
  },
  jeong: {
    label: "report.rules.tone.jeong.label",
    summary: "report.rules.tone.jeong.summary",
    strength: "report.rules.tone.jeong.strength",
    blindSpot: "report.rules.tone.jeong.blindSpot",
    career: "report.rules.tone.jeong.career",
    finance: "report.rules.tone.jeong.finance",
    action: "report.rules.tone.jeong.action"
  },
  mu: {
    label: "report.rules.tone.mu.label",
    summary: "report.rules.tone.mu.summary",
    strength: "report.rules.tone.mu.strength",
    blindSpot: "report.rules.tone.mu.blindSpot",
    career: "report.rules.tone.mu.career",
    finance: "report.rules.tone.mu.finance",
    action: "report.rules.tone.mu.action"
  },
  gi: {
    label: "report.rules.tone.gi.label",
    summary: "report.rules.tone.gi.summary",
    strength: "report.rules.tone.gi.strength",
    blindSpot: "report.rules.tone.gi.blindSpot",
    career: "report.rules.tone.gi.career",
    finance: "report.rules.tone.gi.finance",
    action: "report.rules.tone.gi.action"
  },
  gyeong: {
    label: "report.rules.tone.gyeong.label",
    summary: "report.rules.tone.gyeong.summary",
    strength: "report.rules.tone.gyeong.strength",
    blindSpot: "report.rules.tone.gyeong.blindSpot",
    career: "report.rules.tone.gyeong.career",
    finance: "report.rules.tone.gyeong.finance",
    action: "report.rules.tone.gyeong.action"
  },
  sin: {
    label: "report.rules.tone.sin.label",
    summary: "report.rules.tone.sin.summary",
    strength: "report.rules.tone.sin.strength",
    blindSpot: "report.rules.tone.sin.blindSpot",
    career: "report.rules.tone.sin.career",
    finance: "report.rules.tone.sin.finance",
    action: "report.rules.tone.sin.action"
  },
  im: {
    label: "report.rules.tone.im.label",
    summary: "report.rules.tone.im.summary",
    strength: "report.rules.tone.im.strength",
    blindSpot: "report.rules.tone.im.blindSpot",
    career: "report.rules.tone.im.career",
    finance: "report.rules.tone.im.finance",
    action: "report.rules.tone.im.action"
  },
  gye: {
    label: "report.rules.tone.gye.label",
    summary: "report.rules.tone.gye.summary",
    strength: "report.rules.tone.gye.strength",
    blindSpot: "report.rules.tone.gye.blindSpot",
    career: "report.rules.tone.gye.career",
    finance: "report.rules.tone.gye.finance",
    action: "report.rules.tone.gye.action"
  }
};

const BRANCH_MONTH_HINTS: Record<string, { goodMonths: ReportCopyKey; cautionMonths: ReportCopyKey; note: ReportCopyKey }> = {
  ja: { goodMonths: "report.rules.month.ja.goodMonths", cautionMonths: "report.rules.month.ja.cautionMonths", note: "report.rules.month.ja.note" },
  chuk: { goodMonths: "report.rules.month.chuk.goodMonths", cautionMonths: "report.rules.month.chuk.cautionMonths", note: "report.rules.month.chuk.note" },
  in: { goodMonths: "report.rules.month.in.goodMonths", cautionMonths: "report.rules.month.in.cautionMonths", note: "report.rules.month.in.note" },
  myo: { goodMonths: "report.rules.month.myo.goodMonths", cautionMonths: "report.rules.month.myo.cautionMonths", note: "report.rules.month.myo.note" },
  jin: { goodMonths: "report.rules.month.jin.goodMonths", cautionMonths: "report.rules.month.jin.cautionMonths", note: "report.rules.month.jin.note" },
  sa: { goodMonths: "report.rules.month.sa.goodMonths", cautionMonths: "report.rules.month.sa.cautionMonths", note: "report.rules.month.sa.note" },
  o: { goodMonths: "report.rules.month.o.goodMonths", cautionMonths: "report.rules.month.o.cautionMonths", note: "report.rules.month.o.note" },
  mi: { goodMonths: "report.rules.month.mi.goodMonths", cautionMonths: "report.rules.month.mi.cautionMonths", note: "report.rules.month.mi.note" },
  sin: { goodMonths: "report.rules.month.sin.goodMonths", cautionMonths: "report.rules.month.sin.cautionMonths", note: "report.rules.month.sin.note" },
  yu: { goodMonths: "report.rules.month.yu.goodMonths", cautionMonths: "report.rules.month.yu.cautionMonths", note: "report.rules.month.yu.note" },
  sul: { goodMonths: "report.rules.month.sul.goodMonths", cautionMonths: "report.rules.month.sul.cautionMonths", note: "report.rules.month.sul.note" },
  hae: { goodMonths: "report.rules.month.hae.goodMonths", cautionMonths: "report.rules.month.hae.cautionMonths", note: "report.rules.month.hae.note" }
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
      summary: formatReportCopy("report.rules.overview.summary", {
        dayPillar: formatPillar(context.pillars.day),
        daySummary: reportCopy(context.dayTone.summary)
      }),
      toneGuidelines: [
        reportCopy("report.rules.overview.tone.terminology"),
        reportCopy("report.rules.overview.tone.noPrediction")
      ],
      disclaimers: [
        reportCopy("report.rules.overview.disclaimer")
      ]
    },
    personality: {
      strengths: [
        reportCopy(context.dayTone.strength),
        formatReportCopy("report.rules.personality.monthStrength", {
          monthSummary: reportCopy(context.monthTone.summary)
        })
      ],
      blindSpots: [
        reportCopy(context.dayTone.blindSpot),
        reportCopy("report.rules.personality.balanceNote")
      ]
    },
    career: {
      trends: [
        reportCopy(context.dayTone.career),
        formatReportCopy("report.rules.career.yearTrend", {
          yearLabel: reportCopy(context.yearTone.label)
        })
      ],
      risks: [
        reportCopy("report.rules.career.realityRisk"),
        reportCopy(context.monthTone.blindSpot)
      ],
      actions: [
        reportCopy(context.dayTone.action),
        reportCopy("report.rules.career.transitionAction")
      ]
    },
    finance: {
      trends: [
        reportCopy(context.dayTone.finance),
        reportCopy("report.rules.finance.scope")
      ],
      risks: [
        reportCopy("report.rules.finance.investmentRisk"),
        reportCopy("report.rules.finance.uncertainMoneyRisk")
      ],
      actions: [
        reportCopy("report.rules.finance.budgetAction"),
        reportCopy(context.monthTone.action)
      ]
    },
    yearlyOutlook: {
      year: context.generatedYear,
      highlights: [
        formatReportCopy("report.rules.yearly.highlight", {
          year: context.generatedYear,
          dayLabel: reportCopy(context.dayTone.label)
        }),
        reportCopy("report.rules.yearly.resourceHighlight")
      ],
      cautions: [
        reportCopy("report.rules.yearly.noCertaintyCaution"),
        reportCopy("report.rules.yearly.smallMetricsCaution")
      ]
    },
    monthly: {
      goodMonths: copyList(monthHint.goodMonths).map((month) => `${month}: ${reportCopy(monthHint.note)}`),
      cautionMonths: copyList(monthHint.cautionMonths).map((month) => `${month}: ${reportCopy("report.rules.month.cautionNote")}`)
    },
    actionSuggestions: {
      habits: [
        reportCopy("report.rules.actions.habitRecord"),
        reportCopy(context.dayTone.action)
      ],
      planning: [
        reportCopy("report.rules.actions.monthlyPlanning"),
        reportCopy("report.rules.actions.careerFinanceCompare")
      ],
      riskManagement: [
        reportCopy("report.rules.actions.noCertainAdvice"),
        reportCopy("report.rules.actions.expertRealityCheck")
      ]
    },
    transparency: {
      certain: [
        formatReportCopy("report.rules.transparency.birthDate", { birthDate: context.input.birthDate }),
        formatReportCopy("report.rules.transparency.timezone", { timezone: context.input.timezone }),
        formatReportCopy("report.rules.transparency.dayPillar", { dayPillar: formatPillar(context.pillars.day) })
      ],
      inferred: [
        reportCopy("report.rules.transparency.pillarMeaning"),
        reportCopy("report.rules.transparency.ruleBased"),
        reportCopy("report.rules.transparency.fixtureRange")
      ],
      missingDataNotes: context.timeKnown
        ? []
        : [reportCopy("report.rules.transparency.missingBirthTime")]
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

function copyList(key: ReportCopyKey): string[] {
  return reportCopy(key).split("|");
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
