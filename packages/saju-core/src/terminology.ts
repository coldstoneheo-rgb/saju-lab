import { reportCopy, type ReportCopyKey } from "./report-copy.js";

export type SajuTermKey =
  | "yearPillar"
  | "monthPillar"
  | "dayPillar"
  | "timePillar"
  | "heavenlyStem"
  | "earthlyBranch"
  | "solarTerm";

export interface SajuTerm {
  key: SajuTermKey;
  label: string;
  short: string;
  description: string;
}

const TERM_COPY_KEYS: Record<SajuTermKey, {
  label: ReportCopyKey;
  short: ReportCopyKey;
  description: ReportCopyKey;
}> = {
  yearPillar: {
    label: "report.terms.yearPillar.label",
    short: "report.terms.yearPillar.short",
    description: "report.terms.yearPillar.description"
  },
  monthPillar: {
    label: "report.terms.monthPillar.label",
    short: "report.terms.monthPillar.short",
    description: "report.terms.monthPillar.description"
  },
  dayPillar: {
    label: "report.terms.dayPillar.label",
    short: "report.terms.dayPillar.short",
    description: "report.terms.dayPillar.description"
  },
  timePillar: {
    label: "report.terms.timePillar.label",
    short: "report.terms.timePillar.short",
    description: "report.terms.timePillar.description"
  },
  heavenlyStem: {
    label: "report.terms.heavenlyStem.label",
    short: "report.terms.heavenlyStem.short",
    description: "report.terms.heavenlyStem.description"
  },
  earthlyBranch: {
    label: "report.terms.earthlyBranch.label",
    short: "report.terms.earthlyBranch.short",
    description: "report.terms.earthlyBranch.description"
  },
  solarTerm: {
    label: "report.terms.solarTerm.label",
    short: "report.terms.solarTerm.short",
    description: "report.terms.solarTerm.description"
  }
};

export const PILLAR_TERM_KEYS = ["yearPillar", "monthPillar", "dayPillar", "timePillar"] as const;

export function getSajuTerm(key: SajuTermKey): SajuTerm {
  const copyKeys = TERM_COPY_KEYS[key];

  return {
    key,
    label: reportCopy(copyKeys.label),
    short: reportCopy(copyKeys.short),
    description: reportCopy(copyKeys.description)
  };
}

export function getPillarTerms(): SajuTerm[] {
  return PILLAR_TERM_KEYS.map(getSajuTerm);
}
