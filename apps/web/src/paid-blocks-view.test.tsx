import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { calculatePillars, generatePaidReportV1, type BirthInput, type PaidReportV1 } from "@saju-lab/saju-core";
import { loadGoldenPillarCases } from "../../../packages/saju-core/src/golden-pillars.load.js";
import { PaidStructureBlocks } from "./paid-blocks-view.js";
import { gyeokgukAgreementLabel, PAID_BLOCKS_NOTE, paidBlocksViewOf } from "./paid-blocks.js";

// 유료 3블록 화면 컴포넌트 — 안내 1회(LC 게이트 #145 관찰 ②) · 격국 일치 표시(관찰 ①) · 빈 괄호 0(관찰 ③).

const goldens = loadGoldenPillarCases();
const paidOf = (input: BirthInput): PaidReportV1 =>
  generatePaidReportV1({ input, pillars: calculatePillars(input), generatedAt: "2026-11-20T00:00:00.000Z" });

describe("PaidStructureBlocks 화면", () => {
  it("골든 전부: 안내 문장이 화면에 정확히 1회, 카드 3개", () => {
    for (const golden of goldens) {
      const html = renderToStaticMarkup(<PaidStructureBlocks paidReport={paidOf(golden.input)} />);
      expect(html.split(PAID_BLOCKS_NOTE).length - 1, golden.id).toBe(1);
      expect(html.match(/<article/g)?.length, golden.id).toBe(3);
    }
  });

  it("격국: 판정 불가 세트가 있고 나머지가 같으면 «판정된 세트끼리 같음»", () => {
    const report = paidOf(goldens[0]!.input);
    const [first, ...rest] = report.structure.gyeokguk;
    const partial: PaidReportV1 = {
      ...report,
      structure: {
        ...report.structure,
        gyeokguk: [{ ...first!, candidates: [], unavailable: "no-day-counts", agreesAcrossSets: true }, ...rest.map((r) => ({ ...r, agreesAcrossSets: true }))]
      }
    };
    const view = paidBlocksViewOf(partial);
    expect(gyeokgukAgreementLabel(view.gyeokguk)).toBe("판정된 세트끼리 같음");
    expect(renderToStaticMarkup(<PaidStructureBlocks paidReport={partial} />)).toContain("판정된 세트끼리 같음");
  });

  it("골든 전부: 판정 불가 세트가 없으면 일치 표시는 코어 agreesAcrossSets 그대로", () => {
    for (const golden of goldens) {
      const view = paidBlocksViewOf(paidOf(golden.input));
      if (view.gyeokguk.partial) continue;
      expect(gyeokgukAgreementLabel(view.gyeokguk), golden.id).toBe(view.gyeokguk.agrees ? "세트 결과 같음" : "세트마다 다름");
    }
  });

  it("억부 후보에 근거 세트가 없으면 빈 괄호 대신 오행만", () => {
    const report = paidOf(goldens[0]!.input);
    const eokbu = report.structure.yongsinCandidates.find((c) => c.method === "eokbu");
    expect(eokbu).toBeDefined();
    const { readingRef: _drop, ...basis } = eokbu!.basis;
    const stripped: PaidReportV1 = { ...report, structure: { ...report.structure, yongsinCandidates: [{ ...eokbu!, basis }] } };
    const rows = paidBlocksViewOf(stripped).yongsin;
    expect(rows).toHaveLength(1);
    expect(rows[0]!.value).not.toContain("()");
    expect(rows[0]!.value).toMatch(/^[목화토금수]$/);
  });
});
