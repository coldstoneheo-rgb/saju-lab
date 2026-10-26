import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BRANCHES, STEMS, type Branch } from "../cycle.js";
import { BIGYEOP_MONTH_TABLE } from "./gyeokguk.js";
import { SAMHAP } from "./interactions.data.js";
import { CHEONEUL_TABLE, PAIR_TABLE, SAMHAP_SINSAL_TABLE, SINSAL_VARIANTS, YANGIN_TABLE } from "./sinsal.data.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_MD = resolve(HERE, "../../../../docs/rules/SINSAL.md");
const markdown = readFileSync(RULES_MD, "utf8");

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

/** Rows of the first table under a `## ` heading that starts with `title`; columns matched by header name. */
function section(source: string, title: string): Array<(name: string) => string> {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(`## ${title}`));
  if (start === -1) throw new Error(`section ${title} not found`);
  const rows: Array<(name: string) => string> = [];
  let columns: string[] | undefined;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    if (!line.trim().startsWith("|")) {
      if (columns) break;
      continue;
    }
    const cells = split(line);
    if (!columns) {
      columns = cells;
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) continue;
    const header = columns;
    rows.push((name: string) => cells[header.indexOf(name)] ?? "");
  }
  return rows;
}

const words = (cell: string) => cell.split(/\s+/).filter(Boolean);
const shift = (branch: Branch, by: number) => BRANCHES[(BRANCHES.indexOf(branch) + by) % 12];

describe("docs/rules/SINSAL.md ↔ sinsal.data.ts", () => {
  it("표 1: 변형 목록 = SINSAL_VARIANTS (행·순서·기준·대상)", () => {
    const fromMd = section(markdown, "표 1").map((cell) => ({
      variantId: cell("variantId"),
      sinsalId: cell("sinsalId"),
      basis: cell("기준"),
      scope: cell("대상")
    }));
    expect(fromMd).toEqual(SINSAL_VARIANTS.map((row) => ({ ...row })));
  });

  it("표 1의 `표` 열이 가리키는 표에 그 변형이 실제로 있다", () => {
    const tableOf = Object.fromEntries(section(markdown, "표 1").map((cell) => [cell("variantId"), cell("표")]));
    const listed = (title: string) => new Set(section(markdown, title).map((cell) => cell("variantId")));
    for (const [variantId, table] of Object.entries(tableOf)) {
      if (table === "표 2" || table === "표 5" || table === "표 6") expect(listed(table).has(variantId), variantId).toBe(true);
    }
    expect(Object.keys(tableOf).filter((id) => /^(dohwa|yeokma|hwagae)\./.test(id)).every((id) => tableOf[id] === "표 3")).toBe(true);
    expect(tableOf["yangin.yang-only"]).toBe("표 4");
  });

  it("표 2: 천을귀인 = CHEONEUL_TABLE, 일간 10 × 2판본", () => {
    const fromMd: Record<string, Record<string, string[]>> = {};
    for (const cell of section(markdown, "표 2")) (fromMd[cell("variantId")] ??= {})[cell("일간")] = words(cell("지지"));
    expect(fromMd).toEqual(JSON.parse(JSON.stringify(CHEONEUL_TABLE)));
    for (const variant of Object.values(CHEONEUL_TABLE)) expect(Object.keys(variant)).toEqual([...STEMS]);
  });

  it("표 2: A·B 차이는 庚 일간 한 행(A 丑未 / B 寅午)뿐", () => {
    const differ = STEMS.filter((stem) => CHEONEUL_TABLE["cheoneul.a"][stem].join() !== CHEONEUL_TABLE["cheoneul.b"][stem].join());
    expect(differ).toEqual(["gyeong"]);
    expect(CHEONEUL_TABLE["cheoneul.a"].gyeong).toEqual(["chuk", "mi"]);
    expect(CHEONEUL_TABLE["cheoneul.b"].gyeong).toEqual(["in", "o"]);
  });

  it("표 3: 삼합 기준 표 = SAMHAP_SINSAL_TABLE, 삼합 묶음 = INTERACTIONS SAMHAP", () => {
    const fromMd = section(markdown, "표 3").map((cell) => ({
      samhap: cell("삼합"),
      branches: words(cell("지지")),
      dohwa: cell("dohwa"),
      yeokma: cell("yeokma"),
      hwagae: cell("hwagae")
    }));
    expect(fromMd).toEqual(JSON.parse(JSON.stringify(SAMHAP_SINSAL_TABLE)));
    const samhap = (rows: ReadonlyArray<{ branches: readonly string[] }>) => new Set(rows.map((row) => [...row.branches].sort().join()));
    expect(samhap(SAMHAP_SINSAL_TABLE)).toEqual(samhap(SAMHAP));
    const ids = new Set(SAMHAP.map((rule) => rule.id));
    expect(SAMHAP_SINSAL_TABLE.every((row) => ids.has(row.samhap))).toBe(true);
  });

  it("표 3 짜임: 도화 = 생지 다음 · 역마 = 생지 충 · 화개 = 고지, 도화·역마는 기준 삼합 밖", () => {
    for (const row of SAMHAP_SINSAL_TABLE) {
      const [saengji, , goji] = row.branches;
      expect(row.dohwa).toBe(shift(saengji, 1));
      expect(row.yeokma).toBe(shift(saengji, 6));
      expect(row.hwagae).toBe(goji);
      expect((row.branches as readonly Branch[]).includes(row.dohwa)).toBe(false);
      expect((row.branches as readonly Branch[]).includes(row.yeokma)).toBe(false);
    }
    expect(new Set(SAMHAP_SINSAL_TABLE.flatMap((row) => row.branches)).size).toBe(12);
  });

  it("표 4: 양인 = YANGIN_TABLE = 격국 BIGYEOP_MONTH_TABLE yangin 행(정의 1곳), 양간만", () => {
    const fromMd = section(markdown, "표 4").map((cell) => ({ dayMaster: cell("일간"), branch: cell("지지") }));
    expect(fromMd).toEqual(YANGIN_TABLE);
    expect(YANGIN_TABLE).toEqual(BIGYEOP_MONTH_TABLE.filter((row) => row.gyeok === "yangin").map((row) => ({ dayMaster: row.dayMaster, branch: row.monthBranch })));
    expect(YANGIN_TABLE.every((row) => STEMS.indexOf(row.dayMaster) % 2 === 0)).toBe(true);
  });

  it("표 5·6: 괴강·백호 간지 = PAIR_TABLE, 戊戌 판본 = 4쌍 + 戊戌", () => {
    const fromMd = Object.fromEntries(
      [...section(markdown, "표 5"), ...section(markdown, "표 6")].map((cell) => [cell("variantId"), words(cell("간지"))])
    );
    expect(fromMd).toEqual(JSON.parse(JSON.stringify(PAIR_TABLE)));
    expect(PAIR_TABLE["goegang.day-mu-sul"]).toEqual([...PAIR_TABLE["goegang.day-four"], "mu-sul"]);
    expect(PAIR_TABLE["goegang.four-pillars"]).toEqual(PAIR_TABLE["goegang.day-four"]);
    const valid = (pair: string) => {
      const [stem, branch] = pair.split("-");
      // 60갑자: 천간·지지 음양이 같다.
      return STEMS.indexOf(stem as never) % 2 === BRANCHES.indexOf(branch as never) % 2;
    };
    expect(Object.values(PAIR_TABLE).flat().every(valid)).toBe(true);
  });
});
