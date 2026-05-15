import React from "react";
import ReactDOM from "react-dom/client";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Coins, Compass, Download, LockKeyhole, Monitor, Moon, Sparkles, Sun, UserRound } from "lucide-react";
import {
  calculatePillars,
  generateReportV1,
  getSajuTerm,
  type BirthInput,
  type ReportV1,
  type SajuTerm,
  type SajuTermKey
} from "@saju-lab/saju-core";
import "./styles.css";

const DEFAULT_INPUT: BirthInput = {
  birthDate: "1990-01-01",
  birthTime: "10:30",
  timezone: "Asia/Seoul",
  sex: "other"
};

type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "saju-lab-theme";

function App(): JSX.Element {
  const [birthDate, setBirthDate] = React.useState(DEFAULT_INPUT.birthDate);
  const [birthTime, setBirthTime] = React.useState(DEFAULT_INPUT.birthTime ?? "");
  const [timeUnknown, setTimeUnknown] = React.useState(false);
  const [sex, setSex] = React.useState<BirthInput["sex"]>(DEFAULT_INPUT.sex);
  const [report, setReport] = React.useState<ReportV1>(() => createReport(DEFAULT_INPUT));
  const [error, setError] = React.useState<string | undefined>();
  const [theme, setTheme] = React.useState<ThemePreference>(() => readThemePreference());

  React.useEffect(() => {
    applyTheme(theme);
    persistThemePreference(theme);
  }, [theme]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const input: BirthInput = {
      birthDate,
      ...(timeUnknown || birthTime === "" ? {} : { birthTime }),
      timezone: "Asia/Seoul",
      sex
    };

    try {
      setReport(createReport(input));
      setError(undefined);
    } catch (caught) {
      setError(toFriendlyError(caught));
    }
  }

  return (
    <main className="appShell">
      <section className="workspace">
        <header className="appHeader">
          <div>
            <p className="eyebrow">Saju Lab MVP</p>
            <h1>설명형 사주 리포트</h1>
          </div>
          <div className="headerActions">
            <ThemeToggle value={theme} onChange={setTheme} />
            <span className={`confidence confidence-${report.meta.confidence}`}>
              {confidenceLabel(report.meta.confidence)}
            </span>
          </div>
        </header>

        <form className="inputPanel" onSubmit={handleSubmit}>
          <label>
            <span><CalendarDays size={18} /> 생년월일</span>
            <input
              aria-describedby="birth-date-help"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              type="date"
              required
            />
            <small id="birth-date-help">양력 생년월일을 기준으로 계산합니다.</small>
          </label>

          <label>
            <span><Clock3 size={18} /> 출생시간</span>
            <input
              aria-describedby="birth-time-help"
              value={birthTime}
              onChange={(event) => setBirthTime(event.target.value)}
              type="time"
              disabled={timeUnknown}
            />
            <small id="birth-time-help">{timeUnknown ? "시간 미상 선택 중이라 시주는 계산하지 않습니다." : "알고 있다면 가능한 정확한 시간을 입력하세요."}</small>
          </label>

          <div className="switchRow">
            <div>
              <strong>시간 미상</strong>
              <p>시간을 모르면 일부 해석은 참고 범위로 낮춰 표시합니다.</p>
            </div>
            <label className="toggle">
              <input
                aria-label="출생시간을 모름"
                checked={timeUnknown}
                onChange={(event) => setTimeUnknown(event.target.checked)}
                type="checkbox"
              />
              <span />
            </label>
          </div>

          <fieldset>
            <legend><UserRound size={18} /> 성별</legend>
            <div className="segmented">
              {(["female", "male", "other"] as const).map((value) => (
                <label key={value}>
                  <input checked={sex === value} onChange={() => setSex(value)} name="sex" type="radio" />
                  <span>{sexLabel(value)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button className="primaryButton" type="submit">
            <Sparkles size={20} /> 리포트 생성
          </button>
          <p className="timezoneNote">타임존은 현재 MVP에서 Asia/Seoul 기준으로 고정됩니다.</p>
          {error ? <p className="formError" role="alert">{error}</p> : null}
        </form>

        <ReportView report={report} />
      </section>
    </main>
  );
}

function ThemeToggle({ value, onChange }: { value: ThemePreference; onChange: (value: ThemePreference) => void }): JSX.Element {
  const options: Array<{ value: ThemePreference; label: string; icon: React.ReactNode }> = [
    { value: "system", label: "시스템", icon: <Monitor size={16} /> },
    { value: "light", label: "라이트", icon: <Sun size={16} /> },
    { value: "dark", label: "다크", icon: <Moon size={16} /> }
  ];

  return (
    <div className="themeToggle" aria-label="테마 선택">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

function ReportView({ report }: { report: ReportV1 }): JSX.Element {
  const freeSummary = buildFreeMonthlySummary(report);

  return (
    <section className="reportStack" aria-live="polite">
      <div className="reportHeader">
        <div>
          <p className="eyebrow">Report v{report.meta.version}</p>
          <h2>{formatDate(report.input.birthDate)} 기준 분석</h2>
        </div>
        <span>{report.meta.timeKnown ? "시간 반영" : "시간 미상"}</span>
      </div>

      <section className="reportNotice" aria-label="리포트 안내">
        <div>
          <strong><CheckCircle2 size={18} /> {confidenceLabel(report.meta.confidence)}</strong>
          <p>{report.overview.disclaimers[0]}</p>
        </div>
        {!report.meta.timeKnown ? (
          <div className="warningNote">
            <strong><AlertTriangle size={18} /> 출생시간 미상</strong>
            <p>{report.transparency.missingDataNotes[0] ?? "시주와 일부 해석은 참고 범위로 낮춰 표시합니다."}</p>
          </div>
        ) : null}
      </section>

      <nav className="sectionNav" aria-label="리포트 섹션 바로가기">
        <a href="#overview">요약</a>
        <a href="#career">커리어</a>
        <a href="#finance">재무</a>
        <a href="#monthly">월간</a>
        <a href="#transparency">투명성</a>
      </nav>

      <section className="savePanel">
        <div>
          <h3><Download size={20} /> 로그인 없이 리포트 저장</h3>
          <p>현재 리포트는 이 기기에서 HTML 파일로 생성되며 서버에 저장되지 않습니다. PDF 내보내기는 유료 상세 리포트 단계에서 제공하는 방향이 적합합니다.</p>
        </div>
        <button
          aria-label="현재 리포트를 HTML 파일로 저장"
          className="secondaryButton"
          onClick={() => downloadReportHtml(report)}
          type="button"
        >
          <Download size={18} /> 리포트 저장
        </button>
      </section>

      <section className="pillarGrid" aria-label="사주 구조">
        <PillarCell termKey="yearPillar" value={report.pillars.year} />
        <PillarCell termKey="monthPillar" value={report.pillars.month} />
        <PillarCell termKey="dayPillar" value={report.pillars.day} />
        <PillarCell termKey="timePillar" value={report.pillars.time} />
      </section>

      <ArticleCard id="overview" icon={<Compass size={20} />} title="전체 요약" items={[report.overview.summary, ...report.overview.toneGuidelines]} />
      <InsightSection
        icon={<Sparkles size={20} />}
        id="personality"
        title="성향 포인트"
        groups={[
          { label: "강점", items: report.personality.strengths },
          { label: "주의", items: report.personality.blindSpots }
        ]}
      />
      <InsightSection
        icon={<Compass size={20} />}
        id="career"
        title="커리어 흐름"
        groups={[
          { label: "경향", items: report.career.trends },
          { label: "리스크", items: report.career.risks },
          { label: "실행", items: report.career.actions }
        ]}
      />
      <InsightSection
        icon={<Coins size={20} />}
        id="finance"
        title="재무 흐름"
        groups={[
          { label: "경향", items: report.finance.trends },
          { label: "리스크", items: report.finance.risks },
          { label: "실행", items: report.finance.actions }
        ]}
      />

      <section className="twoColumn">
        <ArticleCard title={`${report.yearlyOutlook.year}년 포인트`} items={[...report.yearlyOutlook.highlights, ...report.yearlyOutlook.cautions]} />
        <FreeSummaryCard id="monthly" summary={freeSummary} />
      </section>

      <ArticleCard id="transparency" title="투명성 노트" items={[...report.transparency.certain, ...report.transparency.inferred, ...report.transparency.missingDataNotes]} />
      <PaidRoadmap />
    </section>
  );
}

function PillarCell({ termKey, value }: { termKey: SajuTermKey; value: { stem: string; branch: string } | undefined }): JSX.Element {
  const term = getSajuTerm(termKey);

  return (
    <div className="pillarCell">
      <span>{term.label}</span>
      <strong>{value ? `${termLabel(value.stem)} ${termLabel(value.branch)}` : "미상"}</strong>
      <p>{term.short}</p>
      <small>{term.description}</small>
    </div>
  );
}

function ArticleCard({ icon, id, title, items }: { icon?: React.ReactNode; id?: string; title: string; items: string[] }): JSX.Element {
  return (
    <article className="articleCard" id={id}>
      <h3>{icon}{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function InsightSection({ icon, id, title, groups }: {
  icon?: React.ReactNode;
  id?: string;
  title: string;
  groups: Array<{ label: string; items: string[] }>;
}): JSX.Element {
  return (
    <article className="articleCard" id={id}>
      <h3>{icon}{title}</h3>
      <div className="insightGroups">
        {groups.map((group) => (
          <section className="insightGroup" key={group.label}>
            <span>{group.label}</span>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

function FreeSummaryCard({ id, summary }: { id?: string; summary: { keywords: string[]; comment: string } }): JSX.Element {
  return (
    <article className="articleCard freeSummaryCard" id={id}>
      <h3><Sparkles size={20} /> 월간 무료 하이라이트</h3>
      <div className="keywordRow">
        {summary.keywords.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>
      <p>{summary.comment}</p>
    </article>
  );
}

function PaidRoadmap(): JSX.Element {
  return (
    <section className="paidPanel">
      <div>
        <h3><LockKeyhole size={20} /> 프리미엄 확장 모델</h3>
        <p>무료 리포트는 핵심 흐름과 투명성 노트를 제공합니다. 더 깊은 비교, PDF 보관, 월간 업데이트는 유료 상세 리포트 후보로 분리합니다.</p>
      </div>
      <ol>
        <li>무료: 기본 리포트, 투명성 노트, 로컬 HTML 저장</li>
        <li>상세 리포트: 커리어/재무 심화 분석과 선택지 비교</li>
        <li>유료 보관: PDF 리포트, 월간 업데이트, 저장 리포트</li>
      </ol>
    </section>
  );
}

function createReport(input: BirthInput): ReportV1 {
  return generateReportV1({
    input,
    pillars: calculatePillars(input),
    generatedAt: new Date().toISOString()
  });
}

function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);

    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return "system";
  }
}

function persistThemePreference(theme: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme persistence is optional; blocked storage should not break reports.
  }
}

function applyTheme(theme: ThemePreference): void {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    return;
  }

  document.documentElement.dataset.theme = theme;
}

function downloadReportHtml(report: ReportV1): void {
  const html = buildReportHtml(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `saju-lab-report-${report.input.birthDate}.html`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildReportHtml(report: ReportV1): string {
  const freeSummary = buildFreeMonthlySummary(report);
  const sections = [
    ["전체 요약", [report.overview.summary, ...report.overview.toneGuidelines]],
    ["성향 포인트", [...report.personality.strengths, ...report.personality.blindSpots]],
    ["커리어 흐름", [...report.career.trends, ...report.career.risks, ...report.career.actions]],
    ["재무 흐름", [...report.finance.trends, ...report.finance.risks, ...report.finance.actions]],
    [`${report.yearlyOutlook.year}년 포인트`, [...report.yearlyOutlook.highlights, ...report.yearlyOutlook.cautions]],
    ["투명성 노트", [...report.transparency.certain, ...report.transparency.inferred, ...report.transparency.missingDataNotes]]
  ] as const;

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Saju Lab Report ${escapeHtml(report.input.birthDate)}</title>
    <style>
      body { margin: 0; padding: 24px; color: #202124; background: #f8f3eb; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif; line-height: 1.6; }
      main { max-width: 820px; margin: 0 auto; }
      h1 { margin: 0 0 4px; font-size: 30px; }
      h2 { margin: 24px 0 8px; font-size: 20px; }
      .meta, .notice { color: #66584b; font-size: 14px; }
      .notice { border: 1px solid #d8c9b8; border-radius: 8px; background: #fffdf8; padding: 12px; }
      .pillars { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 20px 0; }
      .pillar, section { border: 1px solid #d8c9b8; border-radius: 8px; background: #fffdf8; padding: 14px; }
      .pillar strong { display: block; font-size: 24px; }
      .keywords { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
      .keywords span { border: 1px solid #d8c9b8; border-radius: 999px; padding: 4px 10px; font-size: 13px; font-weight: 700; }
      ul { margin: 0; padding-left: 20px; }
      footer { margin-top: 24px; color: #66584b; font-size: 12px; }
      @media (max-width: 640px) { body { padding: 16px; } .pillars { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    </style>
  </head>
  <body>
    <main>
      <p class="meta">Saju Lab Report v${escapeHtml(report.meta.version)}</p>
      <h1>${escapeHtml(formatDate(report.input.birthDate))} 기준 사주 리포트</h1>
      <p class="notice">${escapeHtml(confidenceLabel(report.meta.confidence))} · ${escapeHtml(report.meta.timeKnown ? "출생시간 반영" : "출생시간 미상")}<br />이 파일은 로그인 없이 기기에서 생성된 HTML 리포트입니다. 서버 저장이나 외부 전송 없이 다운로드됩니다.</p>
      <div class="pillars">
        ${renderDownloadedPillar(getSajuTerm("yearPillar"), report.pillars.year)}
        ${renderDownloadedPillar(getSajuTerm("monthPillar"), report.pillars.month)}
        ${renderDownloadedPillar(getSajuTerm("dayPillar"), report.pillars.day)}
        ${renderDownloadedPillar(getSajuTerm("timePillar"), report.pillars.time)}
      </div>
      ${renderDownloadedFreeSummary(freeSummary)}
      ${sections.map(([title, items]) => renderDownloadedSection(title, items)).join("")}
      <footer>${escapeHtml(report.overview.disclaimers[0] ?? "")}</footer>
    </main>
  </body>
</html>`;
}

function renderDownloadedPillar(term: SajuTerm, value: { stem: string; branch: string } | undefined): string {
  return `<div class="pillar"><span>${escapeHtml(term.label)}</span><strong>${value ? `${escapeHtml(termLabel(value.stem))} ${escapeHtml(termLabel(value.branch))}` : "미상"}</strong><small>${escapeHtml(term.short)} · ${escapeHtml(term.description)}</small></div>`;
}

function toFriendlyError(caught: unknown): string {
  const message = caught instanceof Error ? caught.message : "";

  if (message.includes("birthTime is required")) {
    return "절기 경계일에는 출생시간이 필요합니다. 현재 MVP에서는 이 날짜를 시간 미상으로 계산할 수 없으니, 가능한 정확한 시간을 입력해 주세요.";
  }

  if (message.includes("No upper solar month boundary")) {
    return "현재 MVP 계산 범위를 벗어난 날짜입니다. 검증된 절기 데이터 범위가 확장되면 지원할 예정입니다.";
  }

  if (message.includes("valid Gregorian date")) {
    return "생년월일을 다시 확인해 주세요. 실제 존재하는 양력 날짜만 입력할 수 있습니다.";
  }

  if (message.includes("HH:mm")) {
    return "출생시간은 00:00부터 23:59 사이로 입력해 주세요.";
  }

  if (message.includes("Asia/Seoul")) {
    return "현재 MVP는 Asia/Seoul 타임존만 지원합니다.";
  }

  return "리포트를 생성하지 못했습니다. 입력값을 다시 확인해 주세요.";
}

function renderDownloadedFreeSummary(summary: { keywords: string[]; comment: string }): string {
  return `<section><h2>월간 무료 하이라이트</h2><div class="keywords">${summary.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}</div><p>${escapeHtml(summary.comment)}</p></section>`;
}

function renderDownloadedSection(title: string, items: readonly string[]): string {
  return `<section><h2>${escapeHtml(title)}</h2><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function confidenceLabel(value: ReportV1["meta"]["confidence"]): string {
  return value === "high" ? "신뢰도 높음" : value === "medium" ? "신뢰도 보통" : "신뢰도 낮음";
}

function sexLabel(value: BirthInput["sex"]): string {
  return value === "female" ? "여성" : value === "male" ? "남성" : "기타";
}

function formatDate(value: string): string {
  return value.replaceAll("-", ".");
}

function buildFreeMonthlySummary(report: ReportV1): { keywords: string[]; comment: string } {
  const sourceItems = [
    report.monthly.goodMonths[0],
    report.monthly.cautionMonths[0],
    report.actionSuggestions.planning[0]
  ].filter((item): item is string => item !== undefined);
  const keywords = ["월간 흐름", "좋은 달", "주의 달"];

  return {
    keywords,
    comment: sourceItems.join(" ")
  };
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
