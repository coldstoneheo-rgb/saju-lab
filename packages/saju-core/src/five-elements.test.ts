import { describe, expect, it } from "vitest";
import { BRANCHES, STEMS } from "./cycle.js";
import { GOLDEN_FIXTURES } from "./fixtures.js";
import {
  BRANCH_FIVE_ELEMENT,
  FIVE_ELEMENTS,
  STEM_FIVE_ELEMENT,
  analyzeFiveElements,
  branchElement,
  stemElement
} from "./five-elements.js";
import type { FiveElementDistribution } from "./types.js";

function fixture(id: string) {
  const found = GOLDEN_FIXTURES.find((f) => f.id === id);
  if (!found) {
    throw new Error(`Missing fixture: ${id}`);
  }
  return found;
}

describe("stem/branch → five-element mapping", () => {
  it("maps every stem and branch with no gaps", () => {
    for (const stem of STEMS) {
      expect(STEM_FIVE_ELEMENT[stem]).toBeDefined();
    }
    for (const branch of BRANCHES) {
      expect(BRANCH_FIVE_ELEMENT[branch]).toBeDefined();
    }
  });

  it("keys stems and branches separately so the shared 'sin' label stays unambiguous", () => {
    // 辛 (stem) and 申 (branch) share the "sin" label; both resolve to metal but via
    // separate maps, never a global string match.
    expect(stemElement("sin")).toBe("metal");
    expect(branchElement("sin")).toBe("metal");
    expect(STEM_FIVE_ELEMENT.sin).toBe("metal");
    expect(BRANCH_FIVE_ELEMENT.sin).toBe("metal");
  });

  it("distributes branch primary qi as 木2 火2 土4 金2 水2", () => {
    const counts: Record<string, number> = {};
    for (const branch of BRANCHES) {
      const element = branchElement(branch);
      counts[element] = (counts[element] ?? 0) + 1;
    }
    expect(counts).toEqual({ wood: 2, fire: 2, earth: 4, metal: 2, water: 2 });
  });

  it("throws on an unknown stem or branch", () => {
    // @ts-expect-error invalid label guarded at runtime
    expect(() => stemElement("nope")).toThrow();
    // @ts-expect-error invalid label guarded at runtime
    expect(() => branchElement("nope")).toThrow();
  });
});

describe("analyzeFiveElements — golden cases", () => {
  it("fixture-1990 (4 pillars) lacks metal and ranks metal first to supplement", () => {
    const { expected } = fixture("fixture-1990-before-ipchun");
    const analysis = analyzeFiveElements(expected);

    const distribution: FiveElementDistribution = {
      wood: 1,
      fire: 4,
      earth: 1,
      metal: 0,
      water: 2
    };
    expect(analysis.distribution).toEqual(distribution);
    expect(analysis.total).toBe(8);
    expect(analysis.pillarsCounted).toBe(4);
    expect(analysis.timeIncluded).toBe(true);
    expect(analysis.absent).toEqual(["metal"]);
    expect(analysis.supplementPriority).toEqual(["metal", "wood", "earth", "water", "fire"]);
    expect(analysis.deficient).toEqual(["metal", "wood", "earth"]);
    expect(analysis.dominant).toEqual(["fire", "water"]);
  });

  it("fixture-2024 (4 pillars) lacks water and ranks water first to supplement", () => {
    const { expected } = fixture("fixture-2024-at-ipchun");
    const analysis = analyzeFiveElements(expected);

    const distribution: FiveElementDistribution = {
      wood: 2,
      fire: 1,
      earth: 3,
      metal: 2,
      water: 0
    };
    expect(analysis.distribution).toEqual(distribution);
    expect(analysis.absent).toEqual(["water"]);
    expect(analysis.supplementPriority[0]).toBe("water");
    expect(analysis.deficient).toEqual(["water", "fire"]);
    expect(analysis.dominant).toEqual(["earth", "wood", "metal"]);
  });

  it("counts only 3 pillars when the time pillar is unknown", () => {
    const { expected } = fixture("fixture-1990-before-ipchun");
    const { time, ...noTime } = expected;
    void time;
    const analysis = analyzeFiveElements(noTime);

    expect(analysis.pillarsCounted).toBe(3);
    expect(analysis.timeIncluded).toBe(false);
    expect(analysis.total).toBe(6);
    expect(analysis.distribution).toEqual({
      wood: 1,
      fire: 3,
      earth: 1,
      metal: 0,
      water: 1
    });
    expect(analysis.absent).toEqual(["metal"]);
    expect(analysis.supplementPriority[0]).toBe("metal");
  });
});

describe("analyzeFiveElements — invariants over all fixtures", () => {
  it("distribution always sums to total and supplementPriority covers all five elements", () => {
    for (const { expected } of GOLDEN_FIXTURES) {
      const analysis = analyzeFiveElements(expected);
      const sum = FIVE_ELEMENTS.reduce((acc, element) => acc + analysis.distribution[element], 0);
      expect(sum).toBe(analysis.total);
      expect([...analysis.supplementPriority].sort()).toEqual([...FIVE_ELEMENTS].sort());
    }
  });
});
