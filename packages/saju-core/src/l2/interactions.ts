import type { Branch, Stem } from "../cycle.js";
import type { FiveElement, PillarsResult } from "../types.js";
import { BANGHAP, CHUNG, GANHAP, HYEONG, SAMHAP, YUKHAP, type HyeongSubtype } from "./interactions.data.js";

/**
 * 합충형(合沖刑) v1 — pure functions over the chart's characters.
 * The core lists every relation with its position; it never suppresses by
 * adjacency, never judges 化 and never weighs anything (회의 2026-09-22 A2-3 ·
 * 7-1 · A5-4). Which pair a reading adopts is the 관점층's call.
 */

export type PillarKey = "year" | "month" | "day" | "time";
export type StemInteractionKind = "ganhap";
export type BranchInteractionKind = "yukhap" | "samhap" | "banghap" | "chung" | "hyeong";
export type InteractionKind = StemInteractionKind | BranchInteractionKind;

export interface StemInteraction {
  kind: "ganhap";
  /** Rule id from docs/rules/INTERACTIONS.md (e.g. "gap-gi"). */
  id: string;
  /** Pillars in chart order (연→시). */
  pillars: [PillarKey, PillarKey];
  /** The characters at those pillars, same order. */
  stems: [Stem, Stem];
  /** 연-월 · 월-일 · 일-시 only. Never used to suppress. */
  adjacent: boolean;
  /** 화기 — data only, 化 is not judged. */
  potentialElement: FiveElement;
  /** Another relation of the same rule id shares one of these pillars (쟁합·투합 — e.g. two 甲己 over one 己). */
  shared: boolean;
}

export interface BranchInteraction {
  kind: BranchInteractionKind;
  id: string;
  pillars: PillarKey[];
  branches: Branch[];
  /** Two-character relations only. */
  adjacent?: boolean;
  /** 삼합 · 삼형: true = all three present, false = 반합 / 부분 형. Absent for 육합·방합·충·상형·자형. */
  complete?: boolean;
  /** 삼합 국 오행 · 방합 방위 오행. */
  element?: FiveElement;
  /** 형 only. */
  subtype?: HyeongSubtype;
  /** Another relation of the same rule id (조·국·종) shares one of these pillars. Different ids of the same kind are not shared (A9). */
  shared: boolean;
}

export interface ChartInteractions {
  stems: StemInteraction[];
  branches: BranchInteraction[];
}

const PILLAR_ORDER: readonly PillarKey[] = ["year", "month", "day", "time"];

/** 연-월 · 월-일 · 일-시. */
export function isAdjacent(a: PillarKey, b: PillarKey): boolean {
  return Math.abs(PILLAR_ORDER.indexOf(a) - PILLAR_ORDER.indexOf(b)) === 1;
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && [...a].sort().join(" ") === [...b].sort().join(" ");
}

// ---------------------------------------------------------------- rule level

/** 천간합 rule for an unordered stem pair, if any. */
export function stemPairRule(a: Stem, b: Stem): { id: string; potentialElement: FiveElement } | undefined {
  const rule = GANHAP.find((entry) => sameSet(entry.stems, [a, b]));
  return rule ? { id: rule.id, potentialElement: rule.potentialElement } : undefined;
}

export interface BranchPairMatch {
  kind: BranchInteractionKind;
  id: string;
  complete?: false;
  element?: FiveElement;
  subtype?: HyeongSubtype;
}

/** Every two-character rule an unordered branch pair satisfies (a pair may hit several: 寅申 = 충 + 형). */
export function branchPairRules(a: Branch, b: Branch): BranchPairMatch[] {
  const matches: BranchPairMatch[] = [];
  if (a === b) {
    const self = HYEONG.find((rule) => rule.subtype === "ja");
    if (self && self.branches.includes(a)) matches.push({ kind: "hyeong", id: self.id, subtype: "ja" });
    return matches;
  }
  for (const rule of YUKHAP) if (sameSet(rule.branches, [a, b])) matches.push({ kind: "yukhap", id: rule.id });
  for (const rule of SAMHAP) {
    if ((a === rule.pivot || b === rule.pivot) && rule.branches.includes(a) && rule.branches.includes(b)) {
      matches.push({ kind: "samhap", id: rule.id, complete: false, element: rule.element });
    }
  }
  for (const rule of CHUNG) if (sameSet(rule.branches, [a, b])) matches.push({ kind: "chung", id: rule.id });
  for (const rule of HYEONG) {
    if (rule.subtype === "ja") continue;
    if (!rule.branches.includes(a) || !rule.branches.includes(b)) continue;
    matches.push(
      rule.branches.length === 3
        ? { kind: "hyeong", id: rule.id, complete: false, subtype: rule.subtype }
        : { kind: "hyeong", id: rule.id, subtype: rule.subtype }
    );
  }
  return matches;
}

export interface BranchTripleMatch {
  kind: "samhap" | "banghap" | "hyeong";
  id: string;
  complete: true;
  element?: FiveElement;
  subtype?: HyeongSubtype;
}

/** The three-character rule an unordered branch triple satisfies, if any. */
export function branchTripleRule(a: Branch, b: Branch, c: Branch): BranchTripleMatch | undefined {
  const set = [a, b, c];
  for (const rule of SAMHAP) if (sameSet(rule.branches, set)) return { kind: "samhap", id: rule.id, complete: true, element: rule.element };
  for (const rule of BANGHAP) if (sameSet(rule.branches, set)) return { kind: "banghap", id: rule.id, complete: true, element: rule.element };
  for (const rule of HYEONG) if (rule.branches.length === 3 && sameSet(rule.branches, set)) return { kind: "hyeong", id: rule.id, complete: true, subtype: rule.subtype };
  return undefined;
}

// --------------------------------------------------------------- chart level

interface Slot {
  key: PillarKey;
  stem: Stem;
  branch: Branch;
}

function slotsOf(pillars: PillarsResult): Slot[] {
  const slots: Slot[] = [
    { key: "year", stem: pillars.year.stem as Stem, branch: pillars.year.branch as Branch },
    { key: "month", stem: pillars.month.stem as Stem, branch: pillars.month.branch as Branch },
    { key: "day", stem: pillars.day.stem as Stem, branch: pillars.day.branch as Branch }
  ];
  if (pillars.time) slots.push({ key: "time", stem: pillars.time.stem as Stem, branch: pillars.time.branch as Branch });
  return slots;
}

function pairs<T>(items: readonly T[]): Array<[T, T]> {
  const out: Array<[T, T]> = [];
  for (let i = 0; i < items.length; i += 1) for (let j = i + 1; j < items.length; j += 1) out.push([items[i] as T, items[j] as T]);
  return out;
}

function triples<T>(items: readonly T[]): Array<[T, T, T]> {
  const out: Array<[T, T, T]> = [];
  for (let i = 0; i < items.length; i += 1)
    for (let j = i + 1; j < items.length; j += 1)
      for (let k = j + 1; k < items.length; k += 1) out.push([items[i] as T, items[j] as T, items[k] as T]);
  return out;
}

/** Mark `shared` on every record that shares a pillar with another record of the same rule id (조·국·종). */
function markShared<T extends { kind: string; id: string; pillars: readonly PillarKey[]; shared: boolean }>(records: T[]): T[] {
  return records.map((record) => ({
    ...record,
    shared: records.some((other) => other !== record && other.kind === record.kind && other.id === record.id && other.pillars.some((pillar) => record.pillars.includes(pillar)))
  }));
}

export function stemInteractions(pillars: PillarsResult): StemInteraction[] {
  const records: StemInteraction[] = [];
  for (const [a, b] of pairs(slotsOf(pillars))) {
    const rule = stemPairRule(a.stem, b.stem);
    if (!rule) continue;
    records.push({
      kind: "ganhap",
      id: rule.id,
      pillars: [a.key, b.key],
      stems: [a.stem, b.stem],
      adjacent: isAdjacent(a.key, b.key),
      potentialElement: rule.potentialElement,
      shared: false
    });
  }
  return markShared(records);
}

export function branchInteractions(pillars: PillarsResult): BranchInteraction[] {
  const slots = slotsOf(pillars);
  const records: BranchInteraction[] = [];

  for (const [a, b, c] of triples(slots)) {
    const rule = branchTripleRule(a.branch, b.branch, c.branch);
    if (!rule) continue;
    records.push({
      kind: rule.kind,
      id: rule.id,
      pillars: [a.key, b.key, c.key],
      branches: [a.branch, b.branch, c.branch],
      complete: true,
      ...(rule.element ? { element: rule.element } : {}),
      ...(rule.subtype ? { subtype: rule.subtype } : {}),
      shared: false
    });
  }
  const completeTriples = [...records];

  for (const [a, b] of pairs(slots)) {
    for (const rule of branchPairRules(a.branch, b.branch)) {
      // A partial (반합 · 부분 형) already inside a complete triple of the same 국 is subsumed, not repeated.
      const subsumed =
        rule.complete === false &&
        completeTriples.some((triple) => triple.kind === rule.kind && triple.id === rule.id && triple.pillars.includes(a.key) && triple.pillars.includes(b.key));
      if (subsumed) continue;
      records.push({
        kind: rule.kind,
        id: rule.id,
        pillars: [a.key, b.key],
        branches: [a.branch, b.branch],
        adjacent: isAdjacent(a.key, b.key),
        ...(rule.complete === false ? { complete: false } : {}),
        ...(rule.element ? { element: rule.element } : {}),
        ...(rule.subtype ? { subtype: rule.subtype } : {}),
        shared: false
      });
    }
  }
  return markShared(records);
}

/** Every 합충형 relation in the chart. Empty arrays (keys kept) when there is none. */
export function interactionsOfChart(pillars: PillarsResult): ChartInteractions {
  return { stems: stemInteractions(pillars), branches: branchInteractions(pillars) };
}

export const INTERACTION_LABELS: Record<InteractionKind, { ko: string; hanja: string }> = {
  ganhap: { ko: "천간합", hanja: "干合" },
  yukhap: { ko: "육합", hanja: "六合" },
  samhap: { ko: "삼합", hanja: "三合" },
  banghap: { ko: "방합", hanja: "方合" },
  chung: { ko: "충", hanja: "沖" },
  hyeong: { ko: "형", hanja: "刑" }
};

export const HYEONG_SUBTYPE_LABELS: Record<HyeongSubtype, { ko: string; hanja: string }> = {
  mueun: { ko: "삼형(무은지형)", hanja: "無恩之刑" },
  jise: { ko: "삼형(지세지형)", hanja: "持勢之刑" },
  murye: { ko: "상형(무례지형)", hanja: "無禮之刑" },
  ja: { ko: "자형", hanja: "自刑" }
};
