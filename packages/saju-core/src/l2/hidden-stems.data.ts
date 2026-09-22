import type { Branch, Stem } from "../cycle.js";

// 지장간(支藏干) tables. The source of truth is docs/rules/HIDDEN-STEMS.md;
// hidden-stems.test.ts parses that markdown and fails if this module drifts.
// The core only uses the stems and their order (여기 residual · 중기 middle ·
// 정기 primary). Day counts are carried as data for consumers — there is no
// weighting arithmetic anywhere in the core (회의 2026-09-22 A2-1 · F3).

export type HiddenStemSchool = "yeonhae" | "japyeong";

export interface HiddenStemEntry {
  stem: Stem;
  /** 월률분야 day count; null for schools that do not assign days (자평진전). */
  days: number | null;
}

export interface HiddenStems {
  residual: HiddenStemEntry | null;
  middle: HiddenStemEntry | null;
  primary: HiddenStemEntry;
}

export const DEFAULT_HIDDEN_STEM_SCHOOL: HiddenStemSchool = "yeonhae";

const e = (stem: Stem, days: number | null): HiddenStemEntry => ({ stem, days });

/** 『연해자평』 월률분야 일수 — the default. */
const YEONHAE: Record<Branch, HiddenStems> = {
  ja: { residual: e("im", 10), middle: null, primary: e("gye", 20) },
  chuk: { residual: e("gye", 9), middle: e("sin", 3), primary: e("gi", 18) },
  in: { residual: e("mu", 7), middle: e("byeong", 7), primary: e("gap", 16) },
  myo: { residual: e("gap", 10), middle: null, primary: e("eul", 20) },
  jin: { residual: e("eul", 9), middle: e("gye", 3), primary: e("mu", 18) },
  sa: { residual: e("mu", 7), middle: e("gyeong", 7), primary: e("byeong", 16) },
  o: { residual: e("byeong", 10), middle: e("gi", 9), primary: e("jeong", 11) },
  mi: { residual: e("jeong", 9), middle: e("eul", 3), primary: e("gi", 18) },
  sin: { residual: e("mu", 7), middle: e("im", 7), primary: e("gyeong", 16) },
  yu: { residual: e("gyeong", 10), middle: null, primary: e("sin", 20) },
  sul: { residual: e("sin", 9), middle: e("jeong", 3), primary: e("mu", 18) },
  hae: { residual: e("mu", 7), middle: e("gap", 7), primary: e("im", 16) }
};

/** 『자평진전』 인원용사 — no day counts; 子·卯·酉 carry only the primary, 亥 has no 戊. */
const JAPYEONG: Record<Branch, HiddenStems> = {
  ja: { residual: null, middle: null, primary: e("gye", null) },
  chuk: { residual: e("gye", null), middle: e("sin", null), primary: e("gi", null) },
  in: { residual: e("mu", null), middle: e("byeong", null), primary: e("gap", null) },
  myo: { residual: null, middle: null, primary: e("eul", null) },
  jin: { residual: e("eul", null), middle: e("gye", null), primary: e("mu", null) },
  sa: { residual: e("mu", null), middle: e("gyeong", null), primary: e("byeong", null) },
  o: { residual: null, middle: e("gi", null), primary: e("jeong", null) },
  mi: { residual: e("jeong", null), middle: e("eul", null), primary: e("gi", null) },
  sin: { residual: e("mu", null), middle: e("im", null), primary: e("gyeong", null) },
  yu: { residual: null, middle: null, primary: e("sin", null) },
  sul: { residual: e("sin", null), middle: e("jeong", null), primary: e("mu", null) },
  hae: { residual: null, middle: e("gap", null), primary: e("im", null) }
};

export const HIDDEN_STEM_TABLES: Record<HiddenStemSchool, Record<Branch, HiddenStems>> = {
  yeonhae: YEONHAE,
  japyeong: JAPYEONG
};

/** A fresh copy every call — the tables are module state and a library consumer must not be able to mutate them (A7). */
export function hiddenStemsOf(branch: Branch, school: HiddenStemSchool = DEFAULT_HIDDEN_STEM_SCHOOL): HiddenStems {
  const table = HIDDEN_STEM_TABLES[school][branch];
  return {
    residual: table.residual ? { ...table.residual } : null,
    middle: table.middle ? { ...table.middle } : null,
    primary: { ...table.primary }
  };
}

/** The hidden stems in 여기 → 중기 → 정기 order, skipping empty slots. */
export function hiddenStemList(branch: Branch, school: HiddenStemSchool = DEFAULT_HIDDEN_STEM_SCHOOL): Array<{ role: "residual" | "middle" | "primary"; stem: Stem; days: number | null }> {
  const table = hiddenStemsOf(branch, school);
  const list: Array<{ role: "residual" | "middle" | "primary"; stem: Stem; days: number | null }> = [];
  if (table.residual) list.push({ role: "residual", ...table.residual });
  if (table.middle) list.push({ role: "middle", ...table.middle });
  list.push({ role: "primary", ...table.primary });
  return list;
}
