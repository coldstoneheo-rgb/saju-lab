import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { BRANCHES, STEMS, type Branch, type Stem } from "../cycle.js";
import type { FiveElement } from "../types.js";
import type { BanghapRule, BranchPairRule, GanhapRule, HyeongRule, HyeongSubtype, SamhapRule } from "./interactions.data.js";

// Test-side loader for docs/rules/INTERACTIONS.md. Not exported from index.ts: it
// reads the filesystem. Used by interactions.test.ts (md ↔ ts identity) and by
// golden-interactions.test.ts as an oracle that is independent of interactions.data.ts.

export const INTERACTIONS_RULES_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/rules/INTERACTIONS.md");

export interface ParsedInteractionTables {
  ganhap: GanhapRule[];
  yukhap: BranchPairRule[];
  samhap: SamhapRule[];
  banghap: BanghapRule[];
  chung: BranchPairRule[];
  hyeong: HyeongRule[];
}

/** Parse "## 표 N — `kind` …" sections into the same shape as interactions.data.ts; columns matched by header name. */
export function parseInteractionTables(markdown: string): Record<string, unknown[]> {
  const tables: Record<string, unknown[]> = {};
  const lines = markdown.split(/\r?\n/);
  let kind: string | undefined;
  let columns: string[] | undefined;

  const words = (value: string): string[] => value.split(/\s+/).filter(Boolean);
  const checkStems = (list: string[]): Stem[] => list.map((stem) => {
    if (!(STEMS as readonly string[]).includes(stem)) throw new Error(`Unknown stem ${stem} in INTERACTIONS.md`);
    return stem as Stem;
  });
  const checkBranches = (list: string[]): Branch[] => list.map((branch) => {
    if (!(BRANCHES as readonly string[]).includes(branch)) throw new Error(`Unknown branch ${branch} in INTERACTIONS.md`);
    return branch as Branch;
  });

  for (const line of lines) {
    const heading = /^## 표 \d+ — `([^`]+)`/.exec(line);
    if (heading) {
      kind = heading[1];
      columns = undefined;
      tables[kind as string] = [];
      continue;
    }
    if (/^## /.test(line)) {
      kind = undefined;
      continue;
    }
    if (!kind || !line.trim().startsWith("|")) continue;
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    if (!columns) {
      columns = cells;
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) continue;
    const cell = (name: string): string => cells[columns?.indexOf(name) ?? -1] ?? "";
    const rows = tables[kind] as unknown[];
    switch (kind) {
      case "ganhap":
        rows.push({ id: cell("조"), stems: checkStems(words(cell("천간"))), potentialElement: cell("화기") });
        break;
      case "yukhap":
      case "chung":
        rows.push({ id: cell("조"), branches: checkBranches(words(cell("지지"))) });
        break;
      case "samhap":
        rows.push({ id: cell("국"), branches: checkBranches(words(cell("지지"))), pivot: checkBranches([cell("왕지")])[0], element: cell("오행") });
        break;
      case "banghap":
        rows.push({ id: cell("국"), branches: checkBranches(words(cell("지지"))), direction: cell("방위"), element: cell("오행") });
        break;
      case "hyeong":
        rows.push({ id: cell("종"), subtype: cell("유형"), branches: checkBranches(words(cell("지지"))) });
        break;
      default:
        throw new Error(`INTERACTIONS.md has a table kind the code does not know: ${kind}`);
    }
  }
  return tables;
}

export function loadInteractionRules(): ParsedInteractionTables {
  const parsed = parseInteractionTables(readFileSync(INTERACTIONS_RULES_MD, "utf8"));
  return {
    ganhap: (parsed["ganhap"] ?? []) as GanhapRule[],
    yukhap: (parsed["yukhap"] ?? []) as BranchPairRule[],
    samhap: (parsed["samhap"] ?? []) as SamhapRule[],
    banghap: (parsed["banghap"] ?? []) as BanghapRule[],
    chung: (parsed["chung"] ?? []) as BranchPairRule[],
    hyeong: (parsed["hyeong"] ?? []) as HyeongRule[]
  };
}

export type { FiveElement, HyeongSubtype, Stem, Branch };
