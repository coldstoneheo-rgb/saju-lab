import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { INCLUDE_BLOCKS } from "../types.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";

/**
 * 9단계 I1 — 선행 게이트(docs/design/l2-include-design.md §1·§5). L2 판독 블록은 그 블록의 골든 md가
 * 실행 축 전부 `confirmed`일 때만 INCLUDE_BLOCKS에 들어갈 수 있다. 블록을 여는 PR이 골든 confirmed PR보다
 * 먼저 오면 이 파일이 실패한다. 학설 축(`doctrine: "unreviewed"`)은 게이트가 아니다(설계 §1).
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (file: string) => readFileSync(resolve(HERE, "../../../../docs/golden", file), "utf8");

function split(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

/** 상태 열 값들 — `## 표` 아래 첫 표, 열 이름 매핑. 표가 끊긴 뒤 같은 절에 표 줄이 또 있으면 던진다(빈 줄로 행을 숨기는 것 차단). */
function statusCells(source: string, column: string): string[] {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith("## 표"));
  if (start === -1) throw new Error("section 표 not found");
  const values: string[] = [];
  let columns: string[] | undefined;
  let ended = false;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    if (!line.trim().startsWith("|")) {
      if (columns) ended = true;
      continue;
    }
    if (ended) throw new Error("table rows after the table ended");
    const cells = split(line);
    if (!columns) {
      columns = cells;
      if (!columns.includes(column)) throw new Error(`column ${column} not found`);
      continue;
    }
    if (/^:?-{3,}/.test(cells[0] ?? "")) continue;
    values.push(cells[columns.indexOf(column)] ?? "");
  }
  return values;
}

/** 블록 → 선행 골든(파일 · 실행 축 열). 8a는 판독 블록 셋의 입력이라 함께 건다. */
const STRENGTH_FACTORS = { file: "GOLDEN-STRENGTH-FACTORS.md", column: "상태" };
const GATES = {
  strengthReadings: [STRENGTH_FACTORS, { file: "GOLDEN-STRENGTH-READINGS.md", column: "실행" }],
  yongsinCandidates: [STRENGTH_FACTORS, { file: "GOLDEN-YONGSIN-CANDIDATES.md", column: "실행" }],
  gyeokguk: [STRENGTH_FACTORS, { file: "GOLDEN-GYEOKGUK.md", column: "실행" }],
  sinsal: [{ file: "GOLDEN-SINSAL.md", column: "상태" }]
} as const;
type GatedBlock = keyof typeof GATES;

const allConfirmed = (source: string, column: string) => {
  const values = statusCells(source, column);
  return values.length > 0 && values.every((value) => value === "confirmed");
};
const gateOpen = (block: GatedBlock, readFile: (file: string) => string = read) =>
  GATES[block].every((gate) => allConfirmed(readFile(gate.file), gate.column));
const isOpen = (block: string) => (INCLUDE_BLOCKS as readonly string[]).includes(block);
const BLOCKS = Object.keys(GATES) as GatedBlock[];
/** 게이트 없이 열려도 되는 블록(5~7단계 — 명식 사실, 판독 아님). */
const UNGATED = ["hiddenStems", "tenGods", "interactions", "daeun"];

describe("9단계 I1 — L2 include 선행 게이트", () => {
  it("INCLUDE_BLOCKS의 모든 이름 = 게이트 없는 4블록 ∪ 게이트 표의 키(다른 이름으로 열어 게이트를 우회하지 못함)", () => {
    for (const block of INCLUDE_BLOCKS) expect([...UNGATED, ...BLOCKS], block).toContain(block);
  });

  it("판정기: 표가 끊긴 뒤 같은 절의 표 줄은 오류(빈 줄로 pending 행 숨기기 차단)", () => {
    const source = read("GOLDEN-SINSAL.md");
    const lines = source.split(/\r?\n/);
    const firstRow = lines.findIndex((line) => line.startsWith("| g-"));
    lines.splice(firstRow + 1, 0, "");
    expect(() => statusCells(lines.join("\n"), "상태")).toThrow();
  });

  it("INCLUDE_BLOCKS에 든 L2 판독 블록은 선행 골든이 전부 confirmed", () => {
    for (const block of BLOCKS.filter(isOpen)) expect(gateOpen(block), block).toBe(true);
  });

  it("판정기: 현 골든 상태(2026-10-27 — 네 블록 모두 게이트 통과)", () => {
    expect(Object.fromEntries(BLOCKS.map((block) => [block, gateOpen(block)]))).toEqual({
      strengthReadings: true,
      yongsinCandidates: true,
      gyeokguk: true,
      sinsal: true
    });
  });

  it("판정기 변이: 어느 선행 골든이든 1행이 pending이면 그 블록의 게이트가 닫힌다", () => {
    for (const block of BLOCKS) {
      for (const gate of GATES[block]) {
        const mutated = (file: string) => (file === gate.file ? read(file).replace(/\| confirmed \|/, "| pending |") : read(file));
        expect(mutated(gate.file)).not.toBe(read(gate.file));
        expect(gateOpen(block, mutated), `${block} ← ${gate.file}`).toBe(false);
      }
    }
  });

  it("열리지 않은 L2 블록은 include에서 INVALID_OPTIONS", () => {
    const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "other" as const };
    for (const block of BLOCKS.filter((block) => !isOpen(block))) {
      const result = buildSajuPillarsV1Response({ ...base, options: { include: [block] } });
      expect(result.ok, block).toBe(false);
      if (!result.ok) expect(result.error.error.code).toBe("INVALID_OPTIONS");
    }
  });
});
