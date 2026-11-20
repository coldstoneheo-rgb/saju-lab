import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { calculatePillars, generatePaidReportV1, type BirthInput, type PaidReportV1 } from "@saju-lab/saju-core";
import { loadGoldenPillarCases } from "../../../packages/saju-core/src/golden-pillars.load.js";
import { PaidStructureBlocks } from "./paid-blocks-view.js";
import { COPY, PAID_BLOCKS_NOTE, paidReadingOfReport, WHY_SUMMARY } from "./paid-reading.js";

// 유료 3블록 뜻풀이 화면 — 안내 1회 · 한눈에 · 카드 2개 · basis만 <details>로 접는다 · 격국 배지(결론 낸 방식 수).

const goldens = loadGoldenPillarCases();
const paidOf = (input: BirthInput): PaidReportV1 =>
  generatePaidReportV1({ input, pillars: calculatePillars(input), generatedAt: "2026-11-20T00:00:00.000Z" });

const textOf = (html: string): string => html.replace(/<[^>]+>/g, "\n");

describe("PaidStructureBlocks 화면", () => {
  it("골든 전부: 안내 1회 · «역술가 검토 전» 1회 · 카드 2개 · 접기 2개(basis만) · «세트»·«규칙표» 0", () => {
    for (const golden of goldens) {
      const html = renderToStaticMarkup(<PaidStructureBlocks paidReport={paidOf(golden.input)} />);
      expect(html.split(PAID_BLOCKS_NOTE).length - 1, golden.id).toBe(1);
      expect(html.split("역술가 검토 전").length - 1, golden.id).toBe(1);
      expect(html.match(/<article/g)?.length, golden.id).toBe(2);
      expect(html.match(/<details/g)?.length, golden.id).toBe(2);
      expect(html.split(`<summary>${WHY_SUMMARY}</summary>`).length - 1, golden.id).toBe(2);
      expect(textOf(html), golden.id).not.toMatch(/세트|규칙표/);
    }
  });

  it("골든 전부: 접힌 칸 밖에는 conclusion · meaning만, basis 문장은 <details> 안에만", () => {
    for (const golden of goldens) {
      const report = paidOf(golden.input);
      const reading = paidReadingOfReport(report);
      const html = renderToStaticMarkup(<PaidStructureBlocks paidReport={report} />);
      const outside = html.replace(/<details[\s\S]*?<\/details>/g, "");
      for (const card of [reading.energy, reading.frame]) {
        for (const line of card.lines) {
          expect(outside, golden.id).toContain(line.conclusion.replaceAll("'", "&#x27;").replaceAll("\"", "&quot;"));
          for (const basis of line.basis) expect(outside.includes(basis), `${golden.id} ${basis}`).toBe(false);
        }
      }
    }
  });

  /** 앞에서부터 n개 방식을 결론 없음으로 바꾼 합성 보고서. 나머지는 같음으로 둔다. */
  function withUnavailable(n: number): PaidReportV1 {
    const report = paidOf(goldens[0]!.input);
    return {
      ...report,
      structure: {
        ...report.structure,
        gyeokguk: report.structure.gyeokguk.map((r, i) =>
          i < n ? { ...r, candidates: [], unavailable: "no-day-counts" as const, firedConditions: ["saryeong.unavailable"] as [string], agreesAcrossSets: true } : { ...r, agreesAcrossSets: true })
      }
    };
  }

  it("격국 배지: 결론 낸 방식 0개 · 1개 · 2개(결론 없음 1)", () => {
    const cases: Array<[number, string]> = [[3, COPY["B-JUDGED-NONE"]], [2, COPY["B-JUDGED-ONE"]], [1, COPY["B-JUDGED-SAME"]]];
    for (const [unavailable, label] of cases) {
      const report = withUnavailable(unavailable);
      expect(paidReadingOfReport(report).frame.badge).toBe(label);
      expect(renderToStaticMarkup(<PaidStructureBlocks paidReport={report} />)).toContain(label);
    }
  });

  it("골든 전부: 격국 배지는 코어 agreesAcrossSets와 결론 낸 방식 수를 따른다", () => {
    for (const golden of goldens) {
      const report = paidOf(golden.input);
      const judged = report.structure.gyeokguk.filter((r) => !r.unavailable).length;
      const badge = paidReadingOfReport(report).frame.badge;
      if (judged === 1) expect(badge, golden.id).toBe(COPY["B-JUDGED-ONE"]);
      if (judged >= 2) expect(badge === COPY["B-DIFF"], golden.id).toBe(!report.structure.gyeokguk[0]!.agreesAcrossSets);
    }
  });
});
