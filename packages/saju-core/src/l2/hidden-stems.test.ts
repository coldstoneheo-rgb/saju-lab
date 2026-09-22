import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BRANCHES, STEMS, type Branch, type Stem } from "../cycle.js";
import { HIDDEN_STEM_TABLES, hiddenStemList, hiddenStemsOf, type HiddenStemSchool } from "./hidden-stems.data.js";
import { loadHiddenStemTables } from "./hidden-stems-rules.load.js";
import { TEN_GODS, tenGodOf, tenGodsOfChart, type TenGod } from "./ten-gods.js";


describe("HIDDEN-STEMS.md ↔ hidden-stems.data.ts", () => {
  const parsed = loadHiddenStemTables();

  it.each(Object.keys(HIDDEN_STEM_TABLES) as HiddenStemSchool[])("school %s matches the markdown table exactly", (school) => {
    expect(parsed[school]).toBeDefined();
    for (const branch of BRANCHES) {
      expect({ school, branch, table: HIDDEN_STEM_TABLES[school][branch] }).toEqual({ school, branch, table: parsed[school]?.[branch] });
    }
  });

  it("has no school in the markdown that the code does not know", () => {
    expect(Object.keys(parsed).sort()).toEqual(Object.keys(HIDDEN_STEM_TABLES).sort());
  });

  it("yeonhae day counts add up to 30 per branch and the primary is always last", () => {
    for (const branch of BRANCHES) {
      const list = hiddenStemList(branch, "yeonhae");
      expect(list.reduce((sum, entry) => sum + (entry.days ?? 0), 0)).toBe(30);
      expect(list[list.length - 1]?.role).toBe("primary");
    }
  });

  it("exposes the five disputed cells as the difference between the two schools", () => {
    expect(hiddenStemsOf("hae", "yeonhae").residual?.stem).toBe("mu");
    expect(hiddenStemsOf("hae", "japyeong").residual).toBeNull();
    expect(hiddenStemsOf("o", "japyeong")).toEqual({ residual: null, middle: { stem: "gi", days: null }, primary: { stem: "jeong", days: null } });
    expect(hiddenStemList("ja", "japyeong").map((entry) => entry.stem)).toEqual(["gye"]);
    expect(hiddenStemList("ja", "yeonhae").map((entry) => entry.stem)).toEqual(["im", "gye"]);
    // 寅·申 keep 戊 in both schools (the 己 alternative is recorded in the md only).
    expect(hiddenStemsOf("in", "japyeong").residual?.stem).toBe("mu");
    expect(hiddenStemsOf("sin", "japyeong").residual?.stem).toBe("mu");
  });
});

describe("tenGodOf — 10 × 10 table", () => {
  // Row = day master, columns 甲乙丙丁戊己庚辛壬癸. Built from the rule ⓐ~ⓔ and checked
  // against the textbook row for 甲 given in the HO (C2).
  const B: TenGod = "bigyeon", G: TenGod = "geopjae", S: TenGod = "siksin", SG: TenGod = "sanggwan",
    PJ: TenGod = "pyeonjae", JJ: TenGod = "jeongjae", PG: TenGod = "pyeongwan", JG: TenGod = "jeonggwan",
    PI: TenGod = "pyeonin", JI: TenGod = "jeongin";
  const table: Record<Stem, TenGod[]> = {
    gap: [B, G, S, SG, PJ, JJ, PG, JG, PI, JI],
    eul: [G, B, SG, S, JJ, PJ, JG, PG, JI, PI],
    byeong: [PI, JI, B, G, S, SG, PJ, JJ, PG, JG],
    jeong: [JI, PI, G, B, SG, S, JJ, PJ, JG, PG],
    mu: [PG, JG, PI, JI, B, G, S, SG, PJ, JJ],
    gi: [JG, PG, JI, PI, G, B, SG, S, JJ, PJ],
    gyeong: [PJ, JJ, PG, JG, PI, JI, B, G, S, SG],
    sin: [JJ, PJ, JG, PG, JI, PI, G, B, SG, S],
    im: [S, SG, PJ, JJ, PG, JG, PI, JI, B, G],
    gye: [SG, S, JJ, PJ, JG, PG, JI, PI, G, B]
  };

  it("matches the textbook table for all 100 combinations", () => {
    const failures: string[] = [];
    for (const dayStem of STEMS) {
      STEMS.forEach((other, index) => {
        const expected = table[dayStem][index];
        const actual = tenGodOf(dayStem, other);
        if (actual !== expected) failures.push(`${dayStem}→${other}: ${actual} ≠ ${expected}`);
      });
    }
    expect(failures).toEqual([]);
  });

  it("uses every code exactly once per day master", () => {
    for (const dayStem of STEMS) {
      const codes = STEMS.map((other) => tenGodOf(dayStem, other)).sort();
      expect(codes).toEqual([...TEN_GODS].sort());
    }
  });
});

describe("tenGodsOfChart", () => {
  it("assigns the 1990-01-01 10:30 golden (己巳·丙子·丙寅·癸巳, day master 丙)", () => {
    const chart = tenGodsOfChart({
      year: { stem: "gi", branch: "sa" },
      month: { stem: "byeong", branch: "ja" },
      day: { stem: "byeong", branch: "in" },
      time: { stem: "gye", branch: "sa" }
    });
    expect(chart.dayMaster).toBe("byeong");
    expect(chart.year.stem).toBe("sanggwan"); // 己 from 丙: I generate earth, different polarity
    expect(chart.month.stem).toBe("bigyeon");
    expect(chart.day.stem).toBeUndefined();
    expect(chart.time?.stem).toBe("jeonggwan"); // 癸 controls 丙, different polarity
    expect(chart.year.branchPrimary).toBe("bigyeon"); // 巳 정기 丙
    expect(chart.month.branchPrimary).toBe("jeonggwan"); // 子 정기 癸
    expect(chart.day.branchPrimary).toBe("pyeonin"); // 寅 정기 甲 generates 丙, same polarity
    expect(chart.day.branchAll).toEqual([
      { role: "residual", stem: "mu", tenGod: "siksin" },
      { role: "middle", stem: "byeong", tenGod: "bigyeon" },
      { role: "primary", stem: "gap", tenGod: "pyeonin" }
    ]);
  });

  it("omits the time pillar when the birth time is unknown and follows the chosen school", () => {
    const pillars = { year: { stem: "gi", branch: "sa" }, month: { stem: "byeong", branch: "ja" }, day: { stem: "byeong", branch: "hae" } };
    const yeonhae = tenGodsOfChart(pillars);
    const japyeong = tenGodsOfChart(pillars, "japyeong");
    expect(yeonhae.time).toBeUndefined();
    expect(yeonhae.day.branchAll.map((entry) => entry.stem)).toEqual(["mu", "gap", "im"]);
    expect(japyeong.day.branchAll.map((entry) => entry.stem)).toEqual(["gap", "im"]);
    expect(japyeong.school).toBe("japyeong");
  });
});
