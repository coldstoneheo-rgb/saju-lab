import { BRANCHES, type Branch, type Stem } from "../cycle.js";
import { hiddenStemList, type HiddenStemSchool } from "./hidden-stems.data.js";
import type { PillarKey } from "./interactions.js";
import type { HiddenRole, StrengthFactors, StrengthPrecision } from "./strength-factors.js";
import { tenGodOf, type TenGod } from "./ten-gods.js";

/**
 * 격국 취격(取格) — runs every named rule set over the 8a factors and returns one
 * reading per set. Only 取格: no 成敗, no 相神, no 외격, no default set, no score. The
 * source of truth for the tables below is docs/rules/GEOKGUK.md; gyeokguk.test.ts parses it.
 */

export type GyeokId =
  | "jeonggwan" | "pyeongwan" | "jeongjae" | "pyeonjae" | "siksin" | "sanggwan" | "jeongin" | "pyeonin"
  | "geonrok" | "yangin" | "wolgeop";

export type GyeokgukCondition =
  | "bigyeop-table"
  | "primary-exposed&!primary-bigyeop"
  | "one-other-exposed"
  | "two-others-exposed"
  | "primary-bigyeop"
  | "saryeong-unavailable"
  | "saryeong-bigyeop"
  | "else";

export type GyeokgukOutcome = "table" | "primary" | "other-exposed" | "others-exposed" | "saryeong" | "none-bigyeop" | "none-saryeong";

export interface GyeokgukRule {
  conditionId: string;
  when: GyeokgukCondition;
  then: GyeokgukOutcome;
}

/** 표 1 — 월지 비겁 표, shared by every set. */
export const BIGYEOP_MONTH_TABLE = [
  { gyeok: "geonrok", dayMaster: "gap", monthBranch: "in" },
  { gyeok: "geonrok", dayMaster: "eul", monthBranch: "myo" },
  { gyeok: "geonrok", dayMaster: "byeong", monthBranch: "sa" },
  { gyeok: "geonrok", dayMaster: "jeong", monthBranch: "o" },
  { gyeok: "geonrok", dayMaster: "mu", monthBranch: "sa" },
  { gyeok: "geonrok", dayMaster: "gi", monthBranch: "o" },
  { gyeok: "geonrok", dayMaster: "gyeong", monthBranch: "sin" },
  { gyeok: "geonrok", dayMaster: "sin", monthBranch: "yu" },
  { gyeok: "geonrok", dayMaster: "im", monthBranch: "hae" },
  { gyeok: "geonrok", dayMaster: "gye", monthBranch: "ja" },
  { gyeok: "yangin", dayMaster: "gap", monthBranch: "myo" },
  { gyeok: "yangin", dayMaster: "byeong", monthBranch: "o" },
  { gyeok: "yangin", dayMaster: "mu", monthBranch: "o" },
  { gyeok: "yangin", dayMaster: "gyeong", monthBranch: "yu" },
  { gyeok: "yangin", dayMaster: "im", monthBranch: "ja" },
  { gyeok: "wolgeop", dayMaster: "eul", monthBranch: "in" },
  { gyeok: "wolgeop", dayMaster: "jeong", monthBranch: "sa" },
  { gyeok: "wolgeop", dayMaster: "sin", monthBranch: "sin" },
  { gyeok: "wolgeop", dayMaster: "gye", monthBranch: "hae" }
] as const satisfies ReadonlyArray<{ gyeok: GyeokId; dayMaster: Stem; monthBranch: Branch }>;

/** 표 4 — evaluated top to bottom, first match wins. Keys in ruleSetId order. */
export const GYEOKGUK_RULE_SETS = {
  "gyeokguk.exposed-first": [
    { conditionId: "exposed-first.bigyeop-table", when: "bigyeop-table", then: "table" },
    { conditionId: "exposed-first.primary-exposed", when: "primary-exposed&!primary-bigyeop", then: "primary" },
    { conditionId: "exposed-first.one-other-exposed", when: "one-other-exposed", then: "other-exposed" },
    { conditionId: "exposed-first.two-others-exposed", when: "two-others-exposed", then: "others-exposed" },
    { conditionId: "exposed-first.bigyeop-month", when: "primary-bigyeop", then: "none-bigyeop" },
    { conditionId: "exposed-first.otherwise", when: "else", then: "primary" }
  ],
  "gyeokguk.primary-only": [
    { conditionId: "primary-only.bigyeop-table", when: "bigyeop-table", then: "table" },
    { conditionId: "primary-only.bigyeop-month", when: "primary-bigyeop", then: "none-bigyeop" },
    { conditionId: "primary-only.otherwise", when: "else", then: "primary" }
  ],
  "gyeokguk.saryeong": [
    { conditionId: "saryeong.unavailable", when: "saryeong-unavailable", then: "none-saryeong" },
    { conditionId: "saryeong.bigyeop-table", when: "bigyeop-table", then: "table" },
    { conditionId: "saryeong.bigyeop", when: "saryeong-bigyeop", then: "none-bigyeop" },
    { conditionId: "saryeong.otherwise", when: "else", then: "saryeong" }
  ]
} as const satisfies Record<string, readonly GyeokgukRule[]>;

export type GyeokgukRuleSetId = keyof typeof GYEOKGUK_RULE_SETS;

export interface GyeokCandidate {
  gyeok: GyeokId;
  stem: Stem;
  role: HiddenRole;
  exposedIn: PillarKey[];
}

export interface GyeokgukReading {
  ruleSetId: GyeokgukRuleSetId;
  /** 보통 1개, ambiguous면 2개. 정기 → 중기 → 여기 순, 순위 아님. */
  candidates: GyeokCandidate[];
  ambiguous: boolean;
  unavailable?: "no-day-counts" | "month-term-mismatch" | "bigyeop-month";
  firedConditions: [string];
  /** 8a monthBranchClashed.value — 표시용, 판정에 쓰지 않는다. */
  monthBranchClashed: boolean;
  /** 세트 간 일치: unavailable이 없는 세트들의 격 집합이 모두 같다. Same value on every record. */
  agreesAcrossSets: boolean;
  school: HiddenStemSchool;
  precision: StrengthPrecision;
  /** 학설 축 — fixed until a G2-3 ⓐ record (a real practitioner) reviews the table. */
  doctrine: "unreviewed";
}

const BIGYEOP: readonly TenGod[] = ["bigyeon", "geopjae"];
const ROLE_ORDER: readonly HiddenRole[] = ["primary", "middle", "residual"];

/** The month branch whose hidden-stem list (in this school) equals the 8a month layer. */
function monthBranchOf(factors: StrengthFactors): Branch {
  const month = factors.layers.hiddenStems.filter((entry) => entry.pillar === "month").map((entry) => `${entry.role}:${entry.stem}`).join(",");
  const found = BRANCHES.filter((branch) => hiddenStemList(branch, factors.school).map((entry) => `${entry.role}:${entry.stem}`).join(",") === month);
  if (found.length !== 1) throw new Error(`month hidden stems ${month} do not identify one branch`);
  return found[0] as Branch;
}

interface Context {
  table: GyeokId | undefined;
  primary: GyeokCandidate & { tenGod: TenGod };
  othersExposed: Array<GyeokCandidate & { tenGod: TenGod }>;
  saryeong: (GyeokCandidate & { tenGod: TenGod }) | undefined;
}

const CONDITIONS: Record<GyeokgukCondition, (context: Context) => boolean> = {
  "bigyeop-table": (context) => context.table !== undefined,
  "primary-exposed&!primary-bigyeop": (context) => context.primary.exposedIn.length > 0 && !BIGYEOP.includes(context.primary.tenGod),
  "one-other-exposed": (context) => context.othersExposed.length === 1,
  "two-others-exposed": (context) => context.othersExposed.length === 2,
  "primary-bigyeop": (context) => BIGYEOP.includes(context.primary.tenGod),
  "saryeong-unavailable": (context) => context.saryeong === undefined,
  "saryeong-bigyeop": (context) => context.saryeong !== undefined && BIGYEOP.includes(context.saryeong.tenGod),
  else: () => true
};

const asGyeok = ({ tenGod, ...candidate }: GyeokCandidate & { tenGod: TenGod }): GyeokCandidate => ({ ...candidate, gyeok: tenGod as GyeokId });

export function gyeokgukReadingsOf(factors: StrengthFactors): GyeokgukReading[] {
  const dayMaster = factors.dayMaster;
  const monthBranch = monthBranchOf(factors);
  const exposedIn = (stem: Stem): PillarKey[] => factors.layers.stems.filter((entry) => entry.stem === stem).map((entry) => entry.pillar);
  const candidateOf = (stem: Stem, role: HiddenRole) => ({ gyeok: tenGodOf(dayMaster, stem) as GyeokId, stem, role, exposedIn: exposedIn(stem), tenGod: tenGodOf(dayMaster, stem) });
  const monthHidden = factors.layers.hiddenStems
    .filter((entry) => entry.pillar === "month")
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))
    .map((entry) => candidateOf(entry.stem, entry.role));
  const primary = monthHidden[0] as Context["primary"];
  const context: Context = {
    table: BIGYEOP_MONTH_TABLE.find((row) => row.dayMaster === dayMaster && row.monthBranch === monthBranch)?.gyeok,
    primary,
    othersExposed: monthHidden.slice(1).filter((entry) => entry.exposedIn.length > 0 && !BIGYEOP.includes(entry.tenGod)),
    saryeong: factors.saryeong ? candidateOf(factors.saryeong.stem, factors.saryeong.role) : undefined
  };

  const readings = (Object.keys(GYEOKGUK_RULE_SETS) as GyeokgukRuleSetId[]).map((ruleSetId): Omit<GyeokgukReading, "agreesAcrossSets"> => {
    const rules: readonly GyeokgukRule[] = GYEOKGUK_RULE_SETS[ruleSetId];
    const fired = rules.find((rule) => CONDITIONS[rule.when](context));
    if (!fired) throw new Error(`gyeokguk rule set ${ruleSetId} has no matching condition`);
    const base = {
      ruleSetId,
      firedConditions: [fired.conditionId] as [string],
      monthBranchClashed: factors.monthBranchClashed.value,
      school: factors.school,
      precision: factors.precision,
      doctrine: "unreviewed" as const
    };
    switch (fired.then) {
      case "table":
        return { ...base, candidates: [{ ...asGyeok(primary), gyeok: context.table as GyeokId }], ambiguous: false };
      case "primary":
        return { ...base, candidates: [asGyeok(primary)], ambiguous: false };
      case "other-exposed":
        return { ...base, candidates: context.othersExposed.map(asGyeok), ambiguous: false };
      case "others-exposed":
        return { ...base, candidates: context.othersExposed.map(asGyeok), ambiguous: true };
      case "saryeong":
        return { ...base, candidates: [asGyeok(context.saryeong as Context["primary"])], ambiguous: false };
      case "none-bigyeop":
        return { ...base, candidates: [], ambiguous: false, unavailable: "bigyeop-month" };
      case "none-saryeong":
        return { ...base, candidates: [], ambiguous: false, unavailable: factors.saryeongUnavailable ?? "no-day-counts" };
    }
  });
  const compared = readings.filter((reading) => reading.unavailable === undefined).map((reading) => reading.candidates.map((c) => c.gyeok).sort().join(","));
  const agreesAcrossSets = new Set(compared).size <= 1;
  return readings.map((reading) => ({ ...reading, agreesAcrossSets }));
}
