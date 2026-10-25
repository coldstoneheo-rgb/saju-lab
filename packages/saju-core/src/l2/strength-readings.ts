import type { HiddenStemSchool } from "./hidden-stems.data.js";
import { STRENGTH_DEFINITIONS, type StrengthFactors, type StrengthPrecision } from "./strength-factors.js";

/**
 * 일간 강약 판독(8b-1) — runs every named rule set over the 8a factors and returns one
 * reading per set. There is no default set, no score and no ranking; which set a
 * perspective quotes is decided outside the core. The source of truth for the rule
 * sets below is docs/rules/STRENGTH-READINGS.md; strength-readings.test.ts parses it.
 */

export type StrengthVerdict = "strong" | "weak" | "indeterminate";
export type StrengthCondition = "triadCount>=2" | "triadCount<=1" | "monthBranchClashed" | "deukryeong" | "deukji&deukse" | "else";

export interface StrengthRule {
  conditionId: string;
  when: StrengthCondition;
  verdict: StrengthVerdict;
}

/** 표 2 — evaluated top to bottom, first match wins. Keys in ruleSetId order. */
export const STRENGTH_RULE_SETS = {
  "strength.month-first": [
    { conditionId: "month-first.month-clashed", when: "monthBranchClashed", verdict: "indeterminate" },
    { conditionId: "month-first.deukryeong", when: "deukryeong", verdict: "strong" },
    { conditionId: "month-first.ji-and-se", when: "deukji&deukse", verdict: "strong" },
    { conditionId: "month-first.otherwise", when: "else", verdict: "weak" }
  ],
  "strength.triad-majority": [
    { conditionId: "triad-majority.two-or-more", when: "triadCount>=2", verdict: "strong" },
    { conditionId: "triad-majority.one-or-less", when: "triadCount<=1", verdict: "weak" }
  ]
} as const satisfies Record<string, readonly StrengthRule[]>;

export type StrengthRuleSetId = keyof typeof STRENGTH_RULE_SETS;

export interface StrengthReadingInputs {
  deukryeong: boolean;
  deukji: boolean;
  deukse: boolean;
  monthBranchClashed: boolean;
  triadCount: number;
}

export interface StrengthReading {
  ruleSetId: StrengthRuleSetId;
  verdict: StrengthVerdict;
  firedConditions: [string];
  inputs: StrengthReadingInputs;
  definitionIds: typeof STRENGTH_DEFINITIONS;
  school: HiddenStemSchool;
  precision: StrengthPrecision;
  /** 세트 간 일치(회의 2026-10-03 E3): every set returned the same verdict. Same value on every record. */
  agreesAcrossSets: boolean;
  /** 학설 축 — fixed until a G2-3 ⓐ record (a real practitioner) reviews the table. */
  doctrine: "unreviewed";
}

const CONDITIONS: Record<StrengthCondition, (inputs: StrengthReadingInputs) => boolean> = {
  "triadCount>=2": (inputs) => inputs.triadCount >= 2,
  "triadCount<=1": (inputs) => inputs.triadCount <= 1,
  monthBranchClashed: (inputs) => inputs.monthBranchClashed,
  deukryeong: (inputs) => inputs.deukryeong,
  "deukji&deukse": (inputs) => inputs.deukji && inputs.deukse,
  else: () => true
};

export function strengthReadingsOf(factors: StrengthFactors): StrengthReading[] {
  const triad = [factors.deukryeong.value, factors.deukji.value, factors.deukse.value];
  const inputs: StrengthReadingInputs = {
    deukryeong: factors.deukryeong.value,
    deukji: factors.deukji.value,
    deukse: factors.deukse.value,
    monthBranchClashed: factors.monthBranchClashed.value,
    triadCount: triad.filter(Boolean).length
  };
  const readings = (Object.keys(STRENGTH_RULE_SETS) as StrengthRuleSetId[]).map((ruleSetId): Omit<StrengthReading, "agreesAcrossSets"> => {
    const rules: readonly StrengthRule[] = STRENGTH_RULE_SETS[ruleSetId];
    const fired = rules.find((rule) => CONDITIONS[rule.when](inputs));
    if (!fired) throw new Error(`strength rule set ${ruleSetId} has no matching condition`);
    return {
      ruleSetId,
      verdict: fired.verdict,
      firedConditions: [fired.conditionId],
      inputs: { ...inputs },
      definitionIds: { ...STRENGTH_DEFINITIONS },
      school: factors.school,
      precision: factors.precision,
      doctrine: "unreviewed"
    };
  });
  const agreesAcrossSets = new Set(readings.map((reading) => reading.verdict)).size === 1;
  return readings.map((reading) => ({ ...reading, agreesAcrossSets }));
}
