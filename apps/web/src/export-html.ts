import { getSajuTerm, type BirthInput, type PaidReportV1, type SajuTerm } from "@saju-lab/saju-core";

interface ExportSection {
  id: string;
  title: string;
  summary?: string;
  items: string[];
}

interface ChecklistSection {
  id: string;
  title: string;
  items: Array<{
    label: string;
    detail: string;
  }>;
}

export function buildPaidReportHtml(paidReport: PaidReportV1): string {
  const inputSummaryItems = buildInputSummaryItems(paidReport.input);
  const sections: ExportSection[] = [
    toExportSection("executive-summary", paidReport.executiveSummary),
    toExportSection("personality", paidReport.personalityDeepDive),
    toExportSection("career-role", paidReport.careerDeepDive.roleFit),
    toExportSection("career-style", paidReport.careerDeepDive.workStyle),
    toExportSection("career-risk", paidReport.careerDeepDive.riskPatterns),
    toExportSection("career-action", paidReport.careerDeepDive.actionPlan),
    toExportSection("finance-rhythm", paidReport.financeDeepDive.rhythm),
    toExportSection("finance-prompts", paidReport.financeDeepDive.planningPrompts),
    toExportSection("yearly-theme", paidReport.yearlyMonthlyExpansion.yearlyTheme)
  ];
  const checklists: ChecklistSection[] = [
    { id: "finance-checklist", ...paidReport.financeDeepDive.riskChecklist },
    { id: "action-plan", ...paidReport.actionPlan }
  ];
  const tableOfContents = [
    { id: "input-summary", title: "입력 요약" },
    { id: "pillar-summary", title: "사주 구조" },
    ...sections.map((section) => ({ id: section.id, title: section.title })),
    ...checklists.map((section) => ({ id: section.id, title: section.title })),
    { id: "monthly-timeline", title: "월별 확장 흐름" },
    { id: "glossary", title: "용어 해설" },
    { id: "print-guide", title: "PDF 저장 안내" },
    { id: "transparency", title: "투명성 부록" }
  ];

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(paidReport.cover.title)}</title>
    <style>
      @page { size: A4; margin: 16mm 15mm 18mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #202124; background: #fffdf8; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif; line-height: 1.62; }
      main { max-width: 860px; margin: 0 auto; padding: 28px; }
      h1 { margin: 0 0 8px; font-size: 30px; line-height: 1.18; }
      h2 { margin: 0 0 10px; padding-bottom: 6px; border-bottom: 2px solid #263f31; font-size: 20px; line-height: 1.25; }
      h3 { margin: 18px 0 6px; font-size: 16px; }
      a { color: #263f31; text-decoration: none; }
      .meta, .notice, footer { color: #66584b; font-size: 13px; }
      .cover, section, .checklist, .timeline { break-inside: avoid; page-break-inside: avoid; border: 1px solid #d8c9b8; border-radius: 8px; padding: 16px; margin: 14px 0; background: #fffdfa; }
      .cover { display: grid; gap: 10px; min-height: 210px; background: #f5f7f1; }
      .coverGrid, .pillars, .noticeGrid, .inputSummary dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .coverGrid span, .pillars div, .noticeGrid span, .inputSummary div { border: 1px solid #d8c9b8; border-radius: 8px; padding: 10px; background: #fffdf8; }
      .coverGrid strong, .inputSummary dd { display: block; margin: 3px 0 0; font-weight: 800; }
      .toc ol { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; margin: 0; padding-left: 20px; }
      .pillars strong { display: block; font-size: 22px; }
      .inputSummary dl { margin: 0; }
      .inputSummary dt, .coverGrid small { color: #66584b; font-size: 12px; font-weight: 700; }
      ul { margin: 0; padding-left: 20px; }
      li + li { margin-top: 5px; }
      .timeline article { break-inside: avoid; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eadfd0; }
      .timeline article:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: 0; }
      .footerNotice { margin-top: 24px; padding-top: 10px; border-top: 1px solid #d8c9b8; }
      @media print {
        main { padding: 0; }
        .cover { min-height: 240px; }
        .pageBreakBefore { break-before: page; page-break-before: always; }
        a { color: inherit; }
      }
      @media (max-width: 640px) {
        main { padding: 16px; }
        .coverGrid, .pillars, .noticeGrid, .inputSummary dl, .toc ol { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <article class="cover">
        <p class="meta">Saju Lab · ${escapeHtml(paidReport.meta.product)} · ${escapeHtml(paidReport.meta.generatedAt)}</p>
        <h1>${escapeHtml(paidReport.cover.title)}</h1>
        <p>${escapeHtml(paidReport.cover.subtitle)}</p>
        <div class="coverGrid" aria-label="문서 핵심 메타데이터">
          <span><small>생성 시각</small><strong>${escapeHtml(paidReport.meta.generatedAt)}</strong></span>
          <span><small>신뢰도</small><strong>${escapeHtml(confidenceLabel(paidReport.meta.confidence))}</strong></span>
          <span><small>출생시간</small><strong>${escapeHtml(paidReport.meta.timeKnown ? "반영" : "미상")}</strong></span>
          <span><small>저장 방식</small><strong>${escapeHtml(paidReport.meta.exportFormat)}</strong></span>
        </div>
        <p class="notice">${escapeHtml(paidReport.cover.scopeNote)} ${escapeHtml(paidReport.cover.privacyNote)}</p>
        <p class="notice">${escapeHtml(paidReport.transparencyAppendix.disclaimers.join(" "))}</p>
        <p class="notice"><strong>PDF 저장 안내:</strong> 이 HTML 문서를 연 뒤 브라우저 인쇄에서 PDF 저장을 선택하세요. 현재 단계에서는 결제, 계정 저장, 서버 보관을 포함하지 않습니다.</p>
      </article>
      <nav class="toc" aria-label="목차">
        <h2>목차</h2>
        <ol>${tableOfContents.map((item) => `<li><a href="#${escapeHtml(item.id)}">${escapeHtml(item.title)}</a></li>`).join("")}</ol>
      </nav>
      <section class="inputSummary" id="input-summary">
        <h2>입력 요약</h2>
        <dl>${inputSummaryItems.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("")}</dl>
      </section>
      <div class="noticeGrid" aria-label="리포트 필수 고지">
        <span>${escapeHtml(confidenceLabel(paidReport.meta.confidence))}</span>
        <span>${escapeHtml(paidReport.meta.timeKnown ? "출생시간 반영" : "출생시간 미상")}</span>
        <span>${escapeHtml(paidReport.input.timezone)}</span>
        <span>${escapeHtml(paidReport.meta.exportFormat)}</span>
      </div>
      <section id="pillar-summary">
        <h2>사주 구조</h2>
        <div class="pillars">
          ${renderDownloadedPillar(getSajuTerm("yearPillar"), paidReport.pillars.year)}
          ${renderDownloadedPillar(getSajuTerm("monthPillar"), paidReport.pillars.month)}
          ${renderDownloadedPillar(getSajuTerm("dayPillar"), paidReport.pillars.day)}
          ${renderDownloadedPillar(getSajuTerm("timePillar"), paidReport.pillars.time)}
        </div>
      </section>
      ${sections.map(renderPaidDownloadedSection).join("")}
      ${checklists.map(renderPaidChecklist).join("")}
      <section class="timeline pageBreakBefore" id="monthly-timeline">
        <h2>월별 확장 흐름</h2>
        ${paidReport.yearlyMonthlyExpansion.monthlyThemes.map((month) => `<article><strong>${escapeHtml(month.month)}</strong><p>${escapeHtml(month.theme)}</p><small>${escapeHtml(month.action)}</small><small>${escapeHtml(month.caution)}</small></article>`).join("")}
      </section>
      <section id="glossary">
        <h2>용어 해설</h2>
        <ul>${paidReport.glossary.map((item) => `<li><strong>${escapeHtml(item.term)}</strong>: ${escapeHtml(item.plainMeaning)}</li>`).join("")}</ul>
      </section>
      <section id="print-guide">
        <h2>PDF 저장 안내</h2>
        <p>이 문서는 브라우저 인쇄 기능에서 PDF로 저장하기 위한 상세 리포트 HTML입니다. 파일명은 생성일 기준으로 만들고, 생년월일이나 출생시간을 넣지 않습니다.</p>
        <ol>${paidReport.pdf.printHints.map((hint) => `<li>${escapeHtml(hint)}</li>`).join("")}</ol>
      </section>
      <section id="transparency">
        <h2>투명성 부록</h2>
        <ul>${[...paidReport.transparencyAppendix.certain, ...paidReport.transparencyAppendix.inferred, ...paidReport.transparencyAppendix.missingDataNotes, ...paidReport.transparencyAppendix.disclaimers].map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
      <footer class="footerNotice">${escapeHtml(paidReport.pdf.requiredNotices.join(" · "))}</footer>
    </main>
  </body>
</html>`;
}

export function buildInputSummaryItems(input: BirthInput): Array<{ label: string; value: string }> {
  return [
    { label: "생년월일", value: formatDate(input.birthDate) },
    { label: "출생시간", value: input.birthTime ?? "미상" },
    { label: "성별", value: sexLabel(input.sex) },
    { label: "타임존", value: input.timezone }
  ];
}

function toExportSection(id: string, section: PaidReportV1["executiveSummary"]): ExportSection {
  return {
    id,
    title: section.title,
    summary: section.summary,
    items: section.items
  };
}

function renderPaidDownloadedSection(section: ExportSection): string {
  const summary = section.summary ? `<p>${escapeHtml(section.summary)}</p>` : "";

  return `<section id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>${summary}<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function renderPaidChecklist(checklist: ChecklistSection): string {
  return `<section class="checklist" id="${escapeHtml(checklist.id)}"><h2>${escapeHtml(checklist.title)}</h2><ul>${checklist.items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong>: ${escapeHtml(item.detail)}</li>`).join("")}</ul></section>`;
}

function renderDownloadedPillar(term: SajuTerm, value: { stem: string; branch: string } | undefined): string {
  return `<div class="pillar"><span>${escapeHtml(term.label)}</span><strong>${value ? `${escapeHtml(termLabel(value.stem))} ${escapeHtml(termLabel(value.branch))}` : "미상"}</strong><small>${escapeHtml(term.short)} · ${escapeHtml(term.description)}</small></div>`;
}

function confidenceLabel(value: PaidReportV1["meta"]["confidence"]): string {
  return value === "high" ? "신뢰도 높음" : value === "medium" ? "신뢰도 보통" : "신뢰도 낮음";
}

function sexLabel(value: BirthInput["sex"]): string {
  return value === "female" ? "여성" : value === "male" ? "남성" : "기타";
}

function formatDate(value: string): string {
  return value.replaceAll("-", ".");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function termLabel(value: string): string {
  const labels: Record<string, string> = {
    gap: "갑",
    eul: "을",
    byeong: "병",
    jeong: "정",
    mu: "무",
    gi: "기",
    gyeong: "경",
    sin: "신",
    im: "임",
    gye: "계",
    ja: "자",
    chuk: "축",
    in: "인",
    myo: "묘",
    jin: "진",
    sa: "사",
    o: "오",
    mi: "미",
    yu: "유",
    sul: "술",
    hae: "해"
  };

  return labels[value] ?? value;
}
