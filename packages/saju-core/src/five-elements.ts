import type {
  FiveElement,
  FiveElementAnalysis,
  FiveElementDistribution,
  PillarsResult
} from "./types.js";
import { type Branch, type Stem } from "./cycle.js";

// Canonical 목 화 토 금 수 order — the deterministic tie-break for every ranking below.
export const FIVE_ELEMENTS: readonly FiveElement[] = [
  "wood",
  "fire",
  "earth",
  "metal",
  "water"
] as const;

// 천간(heavenly stems) → 오행. Keyed by the stem set so it never collides with branches.
export const STEM_FIVE_ELEMENT: Record<Stem, FiveElement> = {
  gap: "wood",
  eul: "wood",
  byeong: "fire",
  jeong: "fire",
  mu: "earth",
  gi: "earth",
  gyeong: "metal",
  sin: "metal",
  im: "water",
  gye: "water"
};

// 지지(earthly branches) → 오행, 본기(primary qi) only.
// NOTE: "sin" exists in both sets (辛 metal stem / 申 metal branch). The maps are kept
// separate and keyed by their own set so the lookup is unambiguous, even though both
// happen to resolve to metal. 지장간 가중(hidden-stem weighting) can later replace this
// single-element map with a weighted contribution without touching callers.
export const BRANCH_FIVE_ELEMENT: Record<Branch, FiveElement> = {
  in: "wood",
  myo: "wood",
  sa: "fire",
  o: "fire",
  jin: "earth",
  sul: "earth",
  chuk: "earth",
  mi: "earth",
  sin: "metal",
  yu: "metal",
  ja: "water",
  hae: "water"
};

// Accept a plain string so callers can pass Pillar.stem/branch (typed as string)
// without a cast; the map lookup + undefined guard validates at runtime.
export function stemElement(stem: string): FiveElement {
  const element = (STEM_FIVE_ELEMENT as Record<string, FiveElement | undefined>)[stem];
  if (element === undefined) {
    throw new Error(`Unknown heavenly stem: ${stem}`);
  }
  return element;
}

export function branchElement(branch: string): FiveElement {
  const element = (BRANCH_FIVE_ELEMENT as Record<string, FiveElement | undefined>)[branch];
  if (element === undefined) {
    throw new Error(`Unknown earthly branch: ${branch}`);
  }
  return element;
}

function emptyDistribution(): FiveElementDistribution {
  return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
}

/**
 * Count the five-element distribution across a chart and rank deficiency.
 *
 * Pure and deterministic. Counts the 본기(primary qi) of each branch once, mirroring
 * a simple stem+branch tally. The time pillar is included only when present, so a
 * time-unknown chart is analyzed over 3 pillars (6 slots) instead of 4 (8 slots).
 */
export function analyzeFiveElements(pillars: PillarsResult): FiveElementAnalysis {
  const distribution = emptyDistribution();
  const counted = [pillars.year, pillars.month, pillars.day];
  if (pillars.time) {
    counted.push(pillars.time);
  }

  for (const pillar of counted) {
    distribution[stemElement(pillar.stem)] += 1;
    distribution[branchElement(pillar.branch)] += 1;
  }

  const pillarsCounted = counted.length;
  const total = pillarsCounted * 2;
  const average = total / FIVE_ELEMENTS.length;

  // Ascending by count = most needed first; ties fall back to canonical order.
  const byNeedAscending = [...FIVE_ELEMENTS].sort((a, b) => {
    const delta = distribution[a] - distribution[b];
    if (delta !== 0) {
      return delta;
    }
    return FIVE_ELEMENTS.indexOf(a) - FIVE_ELEMENTS.indexOf(b);
  });

  const dominant = [...FIVE_ELEMENTS]
    .filter((element) => distribution[element] > average)
    .sort((a, b) => {
      const delta = distribution[b] - distribution[a];
      if (delta !== 0) {
        return delta;
      }
      return FIVE_ELEMENTS.indexOf(a) - FIVE_ELEMENTS.indexOf(b);
    });

  return {
    distribution,
    total,
    pillarsCounted,
    timeIncluded: Boolean(pillars.time),
    absent: FIVE_ELEMENTS.filter((element) => distribution[element] === 0),
    deficient: byNeedAscending.filter((element) => distribution[element] < average),
    dominant,
    supplementPriority: byNeedAscending
  };
}
