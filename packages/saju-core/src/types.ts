export type Sex = "male" | "female" | "other";

export type Locale = "ko" | "en";

export type Confidence = "high" | "medium" | "low";

/** 23시대(자시) 처리: "late" = 달력일 유지(야자시, 기본), "early" = 다음 날 일주(조자시). */
export type JaHourPolicy = "late" | "early";

/** 일주 경계: "midnight" = KST 자정(기본), "trueSolar" = 진태양시 자정(학파 옵션). */
export type DayBoundaryPolicy = "midnight" | "trueSolar";

export interface CalculationOptions {
  /** Shift the hour pillar by the birth place's longitude offset (경도 보정만, 균시차 미적용). Default false. */
  trueSolarTime?: boolean;
  jaHourPolicy?: JaHourPolicy;
  dayBoundary?: DayBoundaryPolicy;
}

export type CalendarSystem = "solar" | "lunar";

export interface BirthInput {
  /** YYYY-MM-DD in the calendar named by `calendar` (Gregorian by default). */
  birthDate: string;
  birthTime?: string;
  timezone: string;
  sex: Sex;
  /** "lunar" = Korean lunar calendar (1900..2050), converted to Gregorian before calculating. Default "solar". */
  calendar?: CalendarSystem;
  /** Lunar only: the date is in that year's leap month (윤달). Default false. */
  isLeapMonth?: boolean;
  /** 시·도 code from birth-place.data.ts; defaults to "seoul". Only read when options.trueSolarTime is true. */
  birthPlace?: string;
  options?: CalculationOptions;
}

export interface Pillar {
  stem: string;
  branch: string;
}

export interface PillarsResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  time?: Pillar;
}

export interface ReportMeta {
  version: "1.0";
  generatedAt: string;
  locale: Locale;
  timeKnown: boolean;
  confidence: Confidence;
}

export interface ReportInput {
  input: BirthInput;
  pillars: PillarsResult;
  locale?: Locale;
  generatedAt?: string;
}

export interface ReportV1 {
  meta: ReportMeta;
  input: BirthInput;
  pillars: PillarsResult;
  overview: {
    summary: string;
    toneGuidelines: string[];
    disclaimers: string[];
  };
  personality: {
    strengths: string[];
    blindSpots: string[];
  };
  career: {
    trends: string[];
    risks: string[];
    actions: string[];
  };
  finance: {
    trends: string[];
    risks: string[];
    actions: string[];
  };
  yearlyOutlook: {
    year: number;
    highlights: string[];
    cautions: string[];
  };
  monthly: {
    goodMonths: string[];
    cautionMonths: string[];
  };
  actionSuggestions: {
    habits: string[];
    planning: string[];
    riskManagement: string[];
  };
  transparency: {
    certain: string[];
    inferred: string[];
    missingDataNotes: string[];
  };
}

export type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";

export type FiveElementDistribution = Record<FiveElement, number>;

export interface FiveElementAnalysis {
  /** Count of each element across the counted stems and branches. */
  distribution: FiveElementDistribution;
  /** Total stem+branch slots counted (pillarsCounted * 2). */
  total: number;
  /** Number of pillars counted: 4 when the time pillar is known, otherwise 3. */
  pillarsCounted: number;
  /** Whether the time pillar contributed to the distribution. */
  timeIncluded: boolean;
  /** Elements with a count of 0, in canonical 목화토금수 order. */
  absent: FiveElement[];
  /** Below-average elements, most lacking first (deterministic tie-break). */
  deficient: FiveElement[];
  /** Above-average elements, most dominant first (deterministic tie-break). */
  dominant: FiveElement[];
  /**
   * All five elements ranked by how much they should be supplemented,
   * most-needed first. This is the target ranking a downstream naming
   * step fills (부족 오행 = 작명이 채워야 할 타깃).
   */
  supplementPriority: FiveElement[];
}

export interface PaidReportMeta extends ReportMeta {
  version: "1.0";
  product: "one-time-detailed-report";
  exportFormat: "pdf-ready-html";
}

export interface PaidReportSection {
  title: string;
  summary: string;
  items: string[];
}

export interface PaidReportChecklist {
  title: string;
  items: Array<{
    label: string;
    detail: string;
  }>;
}

export interface PaidReportV1 {
  meta: PaidReportMeta;
  input: BirthInput;
  pillars: PillarsResult;
  baseReport: ReportV1;
  cover: {
    title: string;
    subtitle: string;
    scopeNote: string;
    privacyNote: string;
  };
  glossary: Array<{
    term: string;
    plainMeaning: string;
  }>;
  executiveSummary: PaidReportSection;
  personalityDeepDive: PaidReportSection;
  careerDeepDive: {
    roleFit: PaidReportSection;
    workStyle: PaidReportSection;
    riskPatterns: PaidReportSection;
    actionPlan: PaidReportSection;
  };
  financeDeepDive: {
    rhythm: PaidReportSection;
    riskChecklist: PaidReportChecklist;
    planningPrompts: PaidReportSection;
  };
  yearlyMonthlyExpansion: {
    yearlyTheme: PaidReportSection;
    monthlyThemes: Array<{
      month: string;
      theme: string;
      action: string;
      caution: string;
    }>;
  };
  actionPlan: PaidReportChecklist;
  transparencyAppendix: {
    certain: string[];
    inferred: string[];
    missingDataNotes: string[];
    disclaimers: string[];
  };
  pdf: {
    filename: string;
    requiredNotices: string[];
    printHints: string[];
  };
}
