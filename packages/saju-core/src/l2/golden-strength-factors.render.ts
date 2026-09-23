import type { StrengthFactors } from "./strength-factors.js";

// Test-side cell renderer for docs/golden/GOLDEN-STRENGTH-FACTORS.md (not exported from index.ts).
// The md cell formats are documented in that file; golden-strength-factors.test.ts compares with this.

const yn = (value: boolean): string => (value ? "Y" : "N");

function counts(record: Record<string, number>): string {
  const cells = Object.entries(record).filter(([, n]) => n > 0).map(([key, n]) => `${key}=${n}`);
  return cells.length > 0 ? cells.join(" ") : "-";
}

function list(items: string[]): string {
  return items.length > 0 ? items.join(" ") : "-";
}

export const STRENGTH_GOLDEN_COLUMNS = [
  "표층십신", "장간십신", "표층오행", "장간오행", "득령", "득지", "득세", "투간", "통근", "사령", "사령경계", "일간합", "월지충", "일지관계", "化재료", "조후"
] as const;

export type StrengthGoldenCells = Record<(typeof STRENGTH_GOLDEN_COLUMNS)[number], string>;

export function renderStrengthFactors(factors: StrengthFactors): StrengthGoldenCells {
  return {
    표층십신: counts(factors.tenGodCounts.surface),
    장간십신: counts(factors.tenGodCounts.withHidden),
    표층오행: counts(factors.elementCounts.surface),
    장간오행: counts(factors.elementCounts.withHidden),
    득령: `${yn(factors.deukryeong.value)}(${factors.deukryeong.tenGod})`,
    득지: factors.deukji.value ? `Y(${factors.deukji.supporting.map((entry) => `${entry.stem}=${entry.tenGod}`).join(" ")})` : "N",
    득세: `${yn(factors.deukse.value)} ${factors.deukse.support}:${factors.deukse.other}`,
    투간: list(factors.exposed.map((entry) => `${entry.pillar}.${entry.role}:${entry.stem}>${entry.in.join(",")}`)),
    통근: list(factors.roots.map((entry) => `${entry.pillar}.${entry.role}:${entry.stem}`)),
    사령: factors.saryeong ? `${factors.saryeong.stem} ${factors.saryeong.role} ${factors.saryeong.elapsedMinutes}` : `- ${factors.saryeongUnavailable ?? ""}`.trim(),
    사령경계: factors.saryeong ? yn(factors.saryeong.nearThreshold) : "-",
    일간합: list(factors.dayStemCombined.with.map((entry) => `${entry.id}@${entry.pillar}`)),
    월지충: list(factors.monthBranchClashed.with.map((entry) => `${entry.id}@${entry.pillar}`)),
    일지관계: list(factors.dayBranchInteractions.map((entry) => `${entry.kind}:${entry.id}@${entry.pillars.join("+")}`)),
    化재료: list(factors.transformationMaterials.map((entry) => `${entry.ganhapId}@${entry.pillars.join("+")}:${entry.potentialElement} m=${yn(entry.monthElementMatches)} x=${yn(entry.potentialElementExposed)}`)),
    조후: `${factors.climate.season} fire=${factors.climate.fire} water=${factors.climate.water}`
  };
}
