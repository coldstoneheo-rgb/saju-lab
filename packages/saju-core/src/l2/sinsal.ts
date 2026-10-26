import type { Branch, Stem } from "../cycle.js";
import type { PillarsResult } from "../types.js";
import type { PillarKey } from "./interactions.js";
import type { StrengthPrecision } from "./strength-factors.js";
import {
  CHEONEUL_TABLE,
  PAIR_TABLE,
  SAMHAP_SINSAL_TABLE,
  SINSAL_VARIANTS,
  YANGIN_TABLE,
  type GanjiPair,
  type SinsalId,
  type SinsalVariantId
} from "./sinsal.data.js";

/**
 * 신살 표 조회 — runs every variant in docs/rules/SINSAL.md 표 1 over the chart's
 * characters and returns one hit per matched basis. Lookup only: no good/bad labels, no strength,
 * no default variant. Reads PillarsResult only (not 8a · 8b · 격국).
 */

export interface SinsalHit {
  sinsalId: SinsalId;
  variantId: SinsalVariantId;
  basis: { pillar: PillarKey; char: Stem | Branch | GanjiPair };
  /** 걸린 기둥(연→시). Never empty. */
  at: PillarKey[];
  precision: StrengthPrecision;
  /** 학설 축 — fixed until a G2-3 ⓐ record (a real practitioner) reviews the table. */
  doctrine: "unreviewed";
}

const PILLAR_ORDER: readonly PillarKey[] = ["year", "month", "day", "time"];

export function sinsalOf(pillars: PillarsResult): SinsalHit[] {
  const present = PILLAR_ORDER.filter((key) => pillars[key] !== undefined);
  const stemAt = (key: PillarKey) => pillars[key]?.stem as Stem;
  const branchAt = (key: PillarKey) => pillars[key]?.branch as Branch;
  const precision: StrengthPrecision = pillars.time ? "exact" : "time-unknown";
  const dayMaster = stemAt("day");
  const hits: SinsalHit[] = [];
  const push = (variantId: SinsalVariantId, sinsalId: SinsalId, basis: SinsalHit["basis"], at: PillarKey[]) => {
    if (at.length > 0) hits.push({ sinsalId, variantId, basis, at, precision, doctrine: "unreviewed" });
  };

  for (const { variantId, sinsalId, basis, scope } of SINSAL_VARIANTS) {
    if (basis === "day-stem") {
      const targets: readonly Branch[] =
        sinsalId === "cheoneul"
          ? CHEONEUL_TABLE[variantId as keyof typeof CHEONEUL_TABLE][dayMaster]
          : YANGIN_TABLE.filter((row) => row.dayMaster === dayMaster).map((row) => row.branch);
      push(variantId, sinsalId, { pillar: "day", char: dayMaster }, present.filter((key) => targets.includes(branchAt(key))));
    } else if (basis === "year-branch" || basis === "day-branch") {
      const from: PillarKey = basis === "year-branch" ? "year" : "day";
      const row = SAMHAP_SINSAL_TABLE.find((entry) => (entry.branches as readonly Branch[]).includes(branchAt(from)));
      if (!row) throw new Error(`branch ${branchAt(from)} is in no 삼합`);
      const target = row[sinsalId as "dohwa" | "yeokma" | "hwagae"];
      // 기준 기둥 자기 제외(SINSAL.md 본문).
      push(variantId, sinsalId, { pillar: from, char: branchAt(from) }, present.filter((key) => key !== from && branchAt(key) === target));
    } else {
      const pairs = PAIR_TABLE[variantId as keyof typeof PAIR_TABLE];
      for (const key of scope === "day" ? (["day"] as const) : present) {
        const pair = `${stemAt(key)}-${branchAt(key)}` as GanjiPair;
        if (pairs.includes(pair)) push(variantId, sinsalId, { pillar: key, char: pair }, [key]);
      }
    }
  }
  return hits;
}
