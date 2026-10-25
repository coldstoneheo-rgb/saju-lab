import { FIVE_ELEMENTS, STEM_FIVE_ELEMENT } from "../five-elements.js";
import type { FiveElement } from "../types.js";
import type { Season, StrengthFactors } from "./strength-factors.js";
import type { StrengthReading, StrengthVerdict } from "./strength-readings.js";

/**
 * 용신 후보(8b-2) — runs the 억부 rules once per 8b-1 reading and the 조후 rules once
 * per chart, and returns every candidate side by side. There is no chosen 용신, no score
 * and no ranking. The source of truth for the rules below is
 * docs/rules/YONGSIN-CANDIDATES.md; yongsin-candidates.test.ts parses it.
 */

export type YongsinMethod = "eokbu" | "johu";

export interface EokbuRule {
  ruleId: string;
  verdict: StrengthVerdict;
  /** Steps along 木→火→土→金→水 from the day master's element; null = no candidate. */
  step: 0 | 1 | 2 | 3 | 4 | null;
}

export interface JohuRule {
  ruleId: string;
  season: Season;
  element: FiveElement | null;
}

/** 표 1 — 억부. */
export const EOKBU_RULES = [
  { ruleId: "strong.siksang", verdict: "strong", step: 1 },
  { ruleId: "strong.jaeseong", verdict: "strong", step: 2 },
  { ruleId: "strong.gwanseong", verdict: "strong", step: 3 },
  { ruleId: "weak.inseong", verdict: "weak", step: 4 },
  { ruleId: "weak.bigyeop", verdict: "weak", step: 0 },
  { ruleId: "indeterminate", verdict: "indeterminate", step: null }
] as const satisfies readonly EokbuRule[];

/** 표 2 — 조후. */
export const JOHU_RULES = [
  { ruleId: "winter", season: "winter", element: "fire" },
  { ruleId: "summer", season: "summer", element: "water" },
  { ruleId: "spring", season: "spring", element: null },
  { ruleId: "autumn", season: "autumn", element: null }
] as const satisfies readonly JohuRule[];

export interface YongsinCandidate {
  /** `${method}.${ruleId}.${element}`, plus `@${ruleSetId}` for 억부 so ids stay unique per response. */
  candidateId: string;
  element: FiveElement;
  method: YongsinMethod;
  ruleId: string;
  basis: { readingRef?: { ruleSetId: string; verdict: StrengthVerdict }; factorRefs: string[] };
  /** 규칙 정체성만 적는다(상위 §6). 사람 대면 문장 아님. */
  note: string;
  doctrine: "unreviewed";
}

const STEP_LABELS = ["비겁", "식상", "재성", "관성", "인성"] as const;

function shifted(element: FiveElement, step: number): FiveElement {
  return FIVE_ELEMENTS[(FIVE_ELEMENTS.indexOf(element) + step) % 5] as FiveElement;
}

/** 8b-2 reads only `ruleSetId` and `verdict` of each reading (설계 §6). */
export function yongsinCandidatesOf(
  factors: StrengthFactors,
  readings: ReadonlyArray<Pick<StrengthReading, "ruleSetId" | "verdict">>
): YongsinCandidate[] {
  const dayElement = STEM_FIVE_ELEMENT[factors.dayMaster];
  const candidates: YongsinCandidate[] = [];
  for (const reading of readings) {
    for (const rule of EOKBU_RULES as readonly EokbuRule[]) {
      if (rule.verdict !== reading.verdict || rule.step === null) continue;
      const element = shifted(dayElement, rule.step);
      candidates.push({
        candidateId: `eokbu.${rule.ruleId}.${element}@${reading.ruleSetId}`,
        element,
        method: "eokbu",
        ruleId: rule.ruleId,
        basis: { readingRef: { ruleSetId: reading.ruleSetId, verdict: reading.verdict }, factorRefs: ["dayMaster"] },
        note: `eokbu: ${reading.ruleSetId} ${reading.verdict} → ${STEP_LABELS[rule.step]}`,
        doctrine: "unreviewed"
      });
    }
  }
  for (const rule of JOHU_RULES as readonly JohuRule[]) {
    if (rule.season !== factors.climate.season || rule.element === null) continue;
    candidates.push({
      candidateId: `johu.${rule.ruleId}.${rule.element}`,
      element: rule.element,
      method: "johu",
      ruleId: rule.ruleId,
      basis: { factorRefs: ["climate.season"] },
      note: `johu: season ${rule.season} → ${rule.element}`,
      doctrine: "unreviewed"
    });
  }
  const setOf = (candidate: YongsinCandidate): string => candidate.basis.readingRef?.ruleSetId ?? "";
  const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
  return candidates.sort(
    (a, b) =>
      byCode(a.method, b.method) ||
      byCode(a.ruleId, b.ruleId) ||
      FIVE_ELEMENTS.indexOf(a.element) - FIVE_ELEMENTS.indexOf(b.element) ||
      byCode(setOf(a), setOf(b))
  );
}
