import { describe, expect, it } from "vitest";
import { calculatePillars, generatePaidReportV1, type BirthInput } from "@saju-lab/saju-core";
import { buildInputSummaryItems, buildPaidReportHtml } from "./export-html.js";

function createPaidHtml(input: BirthInput): string {
  const paidReport = generatePaidReportV1({
    input,
    pillars: calculatePillars(input),
    generatedAt: "2026-05-16T00:00:00.000Z"
  });

  return buildPaidReportHtml(paidReport);
}

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
