export type Sex = "male" | "female" | "other";

export type Locale = "ko" | "en";

export type Confidence = "high" | "medium" | "low";

export interface BirthInput {
  birthDate: string;
  birthTime?: string;
  timezone: string;
  sex: Sex;
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
