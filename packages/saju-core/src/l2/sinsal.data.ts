import type { Branch, Stem } from "../cycle.js";
import { BIGYEOP_MONTH_TABLE } from "./gyeokguk.js";

/**
 * 신살 조회표 — the source of truth is docs/rules/SINSAL.md; sinsal.data.test.ts parses it.
 * Lookup data only: no good/bad labels, no strength, no default variant.
 */

export type SinsalId = "cheoneul" | "dohwa" | "yeokma" | "hwagae" | "yangin" | "goegang" | "baekho";
export type SinsalBasis = "day-stem" | "year-branch" | "day-branch" | "pillar";
export type SinsalScope = "branches" | "day" | "all";
export type GanjiPair = `${Stem}-${Branch}`;

/** 표 1 — every variant, in output order. */
export const SINSAL_VARIANTS = [
  { variantId: "cheoneul.a", sinsalId: "cheoneul", basis: "day-stem", scope: "branches" },
  { variantId: "cheoneul.b", sinsalId: "cheoneul", basis: "day-stem", scope: "branches" },
  { variantId: "dohwa.year-basis", sinsalId: "dohwa", basis: "year-branch", scope: "branches" },
  { variantId: "dohwa.day-basis", sinsalId: "dohwa", basis: "day-branch", scope: "branches" },
  { variantId: "yeokma.year-basis", sinsalId: "yeokma", basis: "year-branch", scope: "branches" },
  { variantId: "yeokma.day-basis", sinsalId: "yeokma", basis: "day-branch", scope: "branches" },
  { variantId: "hwagae.year-basis", sinsalId: "hwagae", basis: "year-branch", scope: "branches" },
  { variantId: "hwagae.day-basis", sinsalId: "hwagae", basis: "day-branch", scope: "branches" },
  { variantId: "yangin.yang-only", sinsalId: "yangin", basis: "day-stem", scope: "branches" },
  { variantId: "goegang.day-four", sinsalId: "goegang", basis: "pillar", scope: "day" },
  { variantId: "goegang.day-mu-sul", sinsalId: "goegang", basis: "pillar", scope: "day" },
  { variantId: "goegang.four-pillars", sinsalId: "goegang", basis: "pillar", scope: "all" },
  { variantId: "baekho", sinsalId: "baekho", basis: "pillar", scope: "all" }
] as const satisfies ReadonlyArray<{ variantId: string; sinsalId: SinsalId; basis: SinsalBasis; scope: SinsalScope }>;

export type SinsalVariantId = (typeof SINSAL_VARIANTS)[number]["variantId"];

/** 표 2 — 천을귀인, 일간 → 지지. A and B differ only at 庚. */
export const CHEONEUL_TABLE: Record<"cheoneul.a" | "cheoneul.b", Record<Stem, readonly Branch[]>> = {
  "cheoneul.a": {
    gap: ["chuk", "mi"], eul: ["ja", "sin"], byeong: ["hae", "yu"], jeong: ["hae", "yu"], mu: ["chuk", "mi"],
    gi: ["ja", "sin"], gyeong: ["chuk", "mi"], sin: ["in", "o"], im: ["sa", "myo"], gye: ["sa", "myo"]
  },
  "cheoneul.b": {
    gap: ["chuk", "mi"], eul: ["ja", "sin"], byeong: ["hae", "yu"], jeong: ["hae", "yu"], mu: ["chuk", "mi"],
    gi: ["ja", "sin"], gyeong: ["in", "o"], sin: ["in", "o"], im: ["sa", "myo"], gye: ["sa", "myo"]
  }
};

/** 표 3 — 삼합 기준 도화·역마·화개. Groups are the INTERACTIONS.md 표 3 삼합. */
export const SAMHAP_SINSAL_TABLE = [
  { samhap: "in-o-sul", branches: ["in", "o", "sul"], dohwa: "myo", yeokma: "sin", hwagae: "sul" },
  { samhap: "sin-ja-jin", branches: ["sin", "ja", "jin"], dohwa: "yu", yeokma: "in", hwagae: "jin" },
  { samhap: "sa-yu-chuk", branches: ["sa", "yu", "chuk"], dohwa: "o", yeokma: "hae", hwagae: "chuk" },
  { samhap: "hae-myo-mi", branches: ["hae", "myo", "mi"], dohwa: "ja", yeokma: "sa", hwagae: "mi" }
] as const satisfies ReadonlyArray<{ samhap: string; branches: readonly [Branch, Branch, Branch]; dohwa: Branch; yeokma: Branch; hwagae: Branch }>;

/** 표 4 — 양인(양간만). The same table as GEOKGUK.md 표 1 `yangin` rows — not redefined here. */
export const YANGIN_TABLE: ReadonlyArray<{ dayMaster: Stem; branch: Branch }> = BIGYEOP_MONTH_TABLE.filter(
  (row) => row.gyeok === "yangin"
).map((row) => ({ dayMaster: row.dayMaster, branch: row.monthBranch }));

/** 표 5·6 — 괴강·백호 간지 쌍. */
export const PAIR_TABLE: Record<"goegang.day-four" | "goegang.day-mu-sul" | "goegang.four-pillars" | "baekho", readonly GanjiPair[]> = {
  "goegang.day-four": ["gyeong-jin", "gyeong-sul", "im-jin", "im-sul"],
  "goegang.day-mu-sul": ["gyeong-jin", "gyeong-sul", "im-jin", "im-sul", "mu-sul"],
  "goegang.four-pillars": ["gyeong-jin", "gyeong-sul", "im-jin", "im-sul"],
  baekho: ["gap-jin", "eul-mi", "byeong-sul", "jeong-chuk", "mu-jin", "im-sul", "gye-chuk"]
};
