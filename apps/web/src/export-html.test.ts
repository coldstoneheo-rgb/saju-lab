import { describe, expect, it } from "vitest";
import { calculatePillars, generatePaidReportV1, generateReportV1, type BirthInput } from "@saju-lab/saju-core";
import { calculationCoverageCopy } from "./calculation-coverage-copy.js";
import { buildFreeReportHtml, buildInputSummaryItems, buildPaidReportHtml } from "./export-html.js";
import { buildFreeReportFilename } from "./report-filenames.js";

function createPaidHtml(input: BirthInput): string {
  const paidReport = generatePaidReportV1({
    input,
    pillars: calculatePillars(input),
    generatedAt: "2026-05-16T00:00:00.000Z"
  });

  return buildPaidReportHtml(paidReport);
}

function createFreeHtml(input: BirthInput): string {
  const report = generateReportV1({
    input,
    pillars: calculatePillars(input),
    generatedAt: "2026-05-16T00:00:00.000Z"
  });

  return buildFreeReportHtml(report);
}

function createFreeReport(input: BirthInput) {
  return generateReportV1({
    input,
    pillars: calculatePillars(input),
    generatedAt: "2026-05-16T00:00:00.000Z"
  });
}

describe("free report export HTML", () => {
  it("renders disclaimer, transparency, and local-only copy", () => {
    const html = createFreeHtml({
      birthDate: "1990-01-01",
      birthTime: "10:30",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(html).toContain("Saju Lab Report v1.0");
    expect(html).toContain("본 리포트는 정보/오락 목적이며, 금융, 의학, 법률 자문이 아닙니다.");
    expect(html).toContain("입력값은 서버 저장이나 외부 전송 없이 이 브라우저에서만 처리됩니다.");
    expect(html).toContain("<h2>투명성 노트</h2>");
    expect(html).toContain(`<h2>${calculationCoverageCopy.headline}</h2>`);
    expect(html).toContain(calculationCoverageCopy.summary);
    for (const item of calculationCoverageCopy.items) {
      expect(html).toContain(item);
    }
    expect(html).toContain("입력된 생년월일: 1990-01-01");
    expect(html).toContain("타임존: Asia/Seoul");
    expect(html).toContain("커리어와 재무 문장은 현실 자료와 함께 검토하세요.");
  });

  it("keeps unknown birth time visible in free export HTML", () => {
    const html = createFreeHtml({
      birthDate: "1990-01-01",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(html).toContain("신뢰도 낮음");
    expect(html).toContain("출생시간 미상");
    expect(html).toContain("<span>시주</span><strong>미상</strong>");
    expect(html).toContain("출생시간 정보가 없어 시주와 일부 해석의 신뢰도가 낮아질 수 있습니다.");
  });

  it("keeps free export filenames independent from birth data", () => {
    const filename = buildFreeReportFilename("2026-05-16T00:00:00.000Z");

    expect(filename).toBe("saju-lab-report-20260516.html");
    expect(filename).not.toContain("1990");
    expect(filename).not.toContain("01-01");
    expect(filename).not.toContain("10:30");
  });

  it("does not drop monthly details or action suggestions from free export HTML", () => {
    const report = createFreeReport({
      birthDate: "1990-01-01",
      birthTime: "10:30",
      timezone: "Asia/Seoul",
      sex: "other"
    });
    const html = buildFreeReportHtml(report);

    expect(html).toContain("<h2>월간 흐름</h2>");
    expect(html).toContain("<h2>행동 제안</h2>");
    for (const item of [...report.monthly.goodMonths, ...report.monthly.cautionMonths]) {
      expect(html).toContain(item);
    }
    for (const item of [
      ...report.actionSuggestions.habits,
      ...report.actionSuggestions.planning,
      ...report.actionSuggestions.riskManagement
    ]) {
      expect(html).toContain(item);
    }
  });
});

describe("paid report export HTML", () => {
  it("renders required paid PDF sections and first-page notices", () => {
    const html = createPaidHtml({
      birthDate: "2024-02-04",
      birthTime: "17:27",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(html).toContain("<h2>목차</h2>");
    expect(html).toContain("id=\"input-summary\"");
    expect(html).toContain("id=\"pillar-summary\"");
    expect(html).toContain("id=\"transparency\"");
    expect(html).toContain("Saju Lab 유료 상세 리포트");
    expect(html).toContain("생성 시각");
    expect(html).toContain("신뢰도 보통");
    expect(html).toContain("정보/오락 목적");
    expect(html).toContain("서버 보관을 포함하지 않는 로컬 다운로드 중심 모델");
    expect(html).toContain(`<h2>${calculationCoverageCopy.headline}</h2>`);
    expect(html).toContain(calculationCoverageCopy.summary);
    for (const item of calculationCoverageCopy.items) {
      expect(html).toContain(item);
    }
    expect(html).toContain("id=\"print-guide\"");
    expect(html).toContain("브라우저 인쇄에서 PDF 저장을 선택");
    expect(html).toContain("현재 단계에서는 결제, 계정 저장, 서버 보관을 포함하지 않습니다.");
  });

  it("renders the actual input summary without putting birth data in the filename", () => {
    const input: BirthInput = {
      birthDate: "1990-01-01",
      birthTime: "10:30",
      timezone: "Asia/Seoul",
      sex: "female"
    };
    const paidReport = generatePaidReportV1({
      input,
      pillars: calculatePillars(input),
      generatedAt: "2026-05-16T00:00:00.000Z"
    });
    const html = buildPaidReportHtml(paidReport);

    expect(buildInputSummaryItems(input)).toEqual([
      { label: "생년월일", value: "1990.01.01" },
      { label: "출생시간", value: "10:30" },
      { label: "성별", value: "여성" },
      { label: "타임존", value: "Asia/Seoul" }
    ]);
    expect(html).toContain("<dt>생년월일</dt><dd>1990.01.01</dd>");
    expect(html).toContain("<dt>출생시간</dt><dd>10:30</dd>");
    expect(html).toContain("<dt>성별</dt><dd>여성</dd>");
    expect(paidReport.pdf.filename).toBe("saju-lab-paid-report-20260516.html");
    expect(paidReport.pdf.filename).not.toContain("1990");
    expect(paidReport.pdf.filename).not.toContain("10");
    expect(html).toContain("파일명은 생성일 기준으로 만들고, 생년월일이나 출생시간을 넣지 않습니다.");
  });

  it("keeps unknown birth time visible in exported paid HTML", () => {
    const html = createPaidHtml({
      birthDate: "1990-01-01",
      timezone: "Asia/Seoul",
      sex: "other"
    });

    expect(html).toContain("<dt>출생시간</dt><dd>미상</dd>");
    expect(html).toContain("신뢰도 낮음");
    expect(html).toContain("출생시간 미상");
    expect(html).toContain("세부 시점보다 한 달 단위의 넓은 흐름");
    expect(html).toContain("출생시간 정보가 없어 시주와 일부 해석의 신뢰도가 낮아질 수 있습니다.");
  });
});
