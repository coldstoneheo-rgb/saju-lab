import type { Branch, Stem } from "../cycle.js";
import type { FiveElement } from "../types.js";

// 합충형(合沖刑) rule tables. The source of truth is docs/rules/INTERACTIONS.md;
// interactions.test.ts parses that markdown and fails if this module drifts.
// The core records existence and position only — no 化 judgement, no weighting
// (회의 2026-09-22 A2-3 · A5-4). 파·해·천간충 are out of v1.

export type HyeongSubtype = "mueun" | "jise" | "murye" | "ja";
export type Direction = "east" | "south" | "west" | "north";

export interface GanhapRule {
  id: string;
  stems: readonly [Stem, Stem];
  /** 화기 — the element the pair could transform into. Data only; 化 is not judged here. */
  potentialElement: FiveElement;
}

export interface BranchPairRule {
  id: string;
  branches: readonly [Branch, Branch];
}

export interface SamhapRule {
  id: string;
  branches: readonly [Branch, Branch, Branch];
  /** 왕지 — the pair must contain it to count as 반합. */
  pivot: Branch;
  element: FiveElement;
}

export interface BanghapRule {
  id: string;
  branches: readonly [Branch, Branch, Branch];
  direction: Direction;
  element: FiveElement;
}

export interface HyeongRule {
  id: string;
  subtype: HyeongSubtype;
  /** 삼형 = 3 branches, 상형 = 2, 자형 = the branches that punish themselves. */
  branches: readonly Branch[];
}

/** 표 1 — 천간합 5조. */
export const GANHAP: readonly GanhapRule[] = [
  { id: "gap-gi", stems: ["gap", "gi"], potentialElement: "earth" },
  { id: "eul-gyeong", stems: ["eul", "gyeong"], potentialElement: "metal" },
  { id: "byeong-sin", stems: ["byeong", "sin"], potentialElement: "water" },
  { id: "jeong-im", stems: ["jeong", "im"], potentialElement: "wood" },
  { id: "mu-gye", stems: ["mu", "gye"], potentialElement: "fire" }
];

/** 표 2 — 지지 육합 6조 (no 화기 field in v1 — 교재 갈림). */
export const YUKHAP: readonly BranchPairRule[] = [
  { id: "ja-chuk", branches: ["ja", "chuk"] },
  { id: "in-hae", branches: ["in", "hae"] },
  { id: "myo-sul", branches: ["myo", "sul"] },
  { id: "jin-yu", branches: ["jin", "yu"] },
  { id: "sa-sin", branches: ["sa", "sin"] },
  { id: "o-mi", branches: ["o", "mi"] }
];

/** 표 3 — 지지 삼합 4국. */
export const SAMHAP: readonly SamhapRule[] = [
  { id: "sin-ja-jin", branches: ["sin", "ja", "jin"], pivot: "ja", element: "water" },
  { id: "hae-myo-mi", branches: ["hae", "myo", "mi"], pivot: "myo", element: "wood" },
  { id: "in-o-sul", branches: ["in", "o", "sul"], pivot: "o", element: "fire" },
  { id: "sa-yu-chuk", branches: ["sa", "yu", "chuk"], pivot: "yu", element: "metal" }
];

/** 표 4 — 지지 방합 4국 (complete triples only in v1). */
export const BANGHAP: readonly BanghapRule[] = [
  { id: "in-myo-jin", branches: ["in", "myo", "jin"], direction: "east", element: "wood" },
  { id: "sa-o-mi", branches: ["sa", "o", "mi"], direction: "south", element: "fire" },
  { id: "sin-yu-sul", branches: ["sin", "yu", "sul"], direction: "west", element: "metal" },
  { id: "hae-ja-chuk", branches: ["hae", "ja", "chuk"], direction: "north", element: "water" }
];

/** 표 5 — 지지충 6조 (천간충 is out of v1). */
export const CHUNG: readonly BranchPairRule[] = [
  { id: "ja-o", branches: ["ja", "o"] },
  { id: "chuk-mi", branches: ["chuk", "mi"] },
  { id: "in-sin", branches: ["in", "sin"] },
  { id: "myo-yu", branches: ["myo", "yu"] },
  { id: "jin-sul", branches: ["jin", "sul"] },
  { id: "sa-hae", branches: ["sa", "hae"] }
];

/** 표 6 — 형 4종. */
export const HYEONG: readonly HyeongRule[] = [
  { id: "in-sa-sin", subtype: "mueun", branches: ["in", "sa", "sin"] },
  { id: "chuk-sul-mi", subtype: "jise", branches: ["chuk", "sul", "mi"] },
  { id: "ja-myo", subtype: "murye", branches: ["ja", "myo"] },
  { id: "ja-hyeong", subtype: "ja", branches: ["jin", "o", "yu", "hae"] }
];

export const INTERACTION_TABLES = {
  ganhap: GANHAP,
  yukhap: YUKHAP,
  samhap: SAMHAP,
  banghap: BANGHAP,
  chung: CHUNG,
  hyeong: HYEONG
} as const;
