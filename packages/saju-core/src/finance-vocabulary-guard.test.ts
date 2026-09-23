import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FINANCE_SOLICITATION_RULES, financeSolicitationFindings, findFinanceSolicitation } from "./finance-vocabulary-guard.js";
import { loadGoldenPillarCases } from "./golden-pillars.load.js";
import { generatePaidReportV1 } from "./paid-report.js";
import { calculatePillars } from "./pillars.js";
import { REPORT_COPY_KO } from "./report-copy.js";
import { generateReportV1 } from "./report.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const KO_JSON = resolve(HERE, "../../../docs/i18n/ko.json");

describe("한국어 투자권유 어휘 가드 — 규칙 자체", () => {
  it("every rule catches its own example and only its own rule id is reported for it", () => {
    for (const rule of FINANCE_SOLICITATION_RULES) {
      const hits = findFinanceSolicitation(rule.example);
      expect(hits.map((hit) => hit.ruleId), rule.example).toContain(rule.id);
    }
    expect(new Set(FINANCE_SOLICITATION_RULES.map((rule) => rule.id)).size).toBe(FINANCE_SOLICITATION_RULES.length);
  });

  it("catches solicitation-shaped sentences", () => {
    const bad = [
      "올해는 재물운이 터지니 지금 사두세요.",
      "이 종목은 무조건 오릅니다.",
      "원금 보장되는 펀드에 넣어 두세요.",
      "대출 받아 투자하면 대박입니다.",
      "저점 매수 타이밍입니다.",
      "지금 매수하세요. 손해 보지 않습니다.",
      "지금 매수하세요 손해 보지 않습니다"
    ];
    for (const sentence of bad) expect(findFinanceSolicitation(sentence).length, sentence).toBeGreaterThan(0);
  });

  it("passes the disclaimers and risk-management copy the report actually uses", () => {
    const fine = [
      "투자 판단을 대신하지 않으며, 과도한 확신이나 충동 지출은 별도로 점검해야 합니다.",
      "재무에서는 손실 한도와 지출 상한을 미리 정하는 것이 중요합니다.",
      "수익 기대보다 먼저 감당 가능한 손실 범위를 숫자로 적었나요?",
      "확정 예언이나 전문 투자, 의료, 법률 조언이 아니라 참고 정보입니다.",
      "재무 흐름은 수익을 예단하기보다 지출 습관과 리스크 관리 방식을 점검하는 참고 정보입니다.",
      "이 리포트는 투자 추천, 의학적 판단, 법률 판단, 확정적 예측을 제공하지 않습니다."
    ];
    for (const sentence of fine) expect(findFinanceSolicitation(sentence), sentence).toEqual([]);
  });
});

describe("한국어 투자권유 어휘 가드 — 리포트 카피 0건 (MEETING-2026-0923-saju-away A1 백로그)", () => {
  it("REPORT_COPY_KO and docs/i18n/ko.json values carry none", () => {
    const ko = JSON.parse(readFileSync(KO_JSON, "utf8")) as Record<string, string>;
    expect(financeSolicitationFindings(REPORT_COPY_KO)).toEqual([]);
    expect(financeSolicitationFindings(ko)).toEqual([]);
  });

  it("paid-report.ts and report-copy.ts sources carry none (covers strings no golden input reaches)", () => {
    const sources = Object.fromEntries(["paid-report.ts", "report-copy.ts", "report-rules.ts", "report.ts"].map((name) => [name, readFileSync(resolve(HERE, name), "utf8")]));
    expect(financeSolicitationFindings(sources)).toEqual([]);
  });

  it("free report.finance and paid financeDeepDive for every golden chart carry none (all 10 day masters)", () => {
    const dayMasters = new Set<string>();
    for (const golden of loadGoldenPillarCases()) {
      const pillars = calculatePillars(golden.input);
      dayMasters.add(pillars.day.stem);
      const reportInput = { input: golden.input, pillars, generatedAt: "2026-09-24T00:00:00+09:00" };
      const free = generateReportV1(reportInput);
      const paid = generatePaidReportV1(reportInput);
      const texts = {
        [`${golden.id} free.finance`]: JSON.stringify(free.finance),
        [`${golden.id} paid.financeDeepDive`]: JSON.stringify(paid.financeDeepDive),
        [`${golden.id} free.all`]: JSON.stringify(free),
        [`${golden.id} paid.all`]: JSON.stringify(paid)
      };
      expect(financeSolicitationFindings(texts)).toEqual([]);
    }
    expect(dayMasters.size).toBe(10);
  });
});
