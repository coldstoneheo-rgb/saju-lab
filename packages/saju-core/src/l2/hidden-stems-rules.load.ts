import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { BRANCHES, STEMS, type Branch, type Stem } from "../cycle.js";
import type { HiddenStems } from "./hidden-stems.data.js";

// Test-side loader for docs/rules/HIDDEN-STEMS.md (reads the filesystem; not exported from index.ts).
// Used by hidden-stems.test.ts (md ↔ ts identity) and golden-tengods.test.ts (school-toggle oracle).

export const HIDDEN_STEMS_RULES_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/rules/HIDDEN-STEMS.md");

/** Parse "## 표 N — `school` …" sections; columns matched by header name. */
export function parseHiddenStemTables(markdown: string): Record<string, Record<Branch, HiddenStems>> {
  const tables: Record<string, Record<Branch, HiddenStems>> = {};
  const lines = markdown.split(/\r?\n/);
  let school: string | undefined;
  let columns: string[] | undefined;

  for (const line of lines) {
    const heading = /^## 표 \d+ — `([^`]+)`/.exec(line);
    if (heading) {
      school = heading[1];
      columns = undefined;
      tables[school as string] = {} as Record<Branch, HiddenStems>;
      continue;
    }
    if (/^## /.test(line)) {
      school = undefined;
      continue;
    }
    if (!school || !line.trim().startsWith("|")) {
      continue;
    }
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    if (!columns) {
      columns = cells;
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) {
      continue;
    }
    const cell = (name: string): string => cells[columns?.indexOf(name) ?? -1] ?? "";
    const branch = cell("지지") as Branch;
    if (!(BRANCHES as readonly string[]).includes(branch)) {
      throw new Error(`Unknown branch ${branch} in HIDDEN-STEMS.md`);
    }
    const entry = (value: string): { stem: Stem; days: number | null } | null => {
      if (value === "-" || value === "") return null;
      const [stem, days] = value.split(":");
      if (!(STEMS as readonly string[]).includes(stem ?? "")) throw new Error(`Unknown stem ${stem} in HIDDEN-STEMS.md`);
      return { stem: stem as Stem, days: days === undefined ? null : Number(days) };
    };
    const primary = entry(cell("정기"));
    if (!primary) throw new Error(`Branch ${branch} has no 정기`);
    (tables[school] as Record<Branch, HiddenStems>)[branch] = { residual: entry(cell("여기")), middle: entry(cell("중기")), primary };
  }
  return tables;
}

export function loadHiddenStemTables(): Record<string, Record<Branch, HiddenStems>> {
  return parseHiddenStemTables(readFileSync(HIDDEN_STEMS_RULES_MD, "utf8"));
}
