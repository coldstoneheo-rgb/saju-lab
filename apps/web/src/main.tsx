import React from "react";
import ReactDOM from "react-dom/client";
import { CalendarDays, Clock3, Coins, Compass, Download, LockKeyhole, Monitor, Moon, Sparkles, Sun, UserRound } from "lucide-react";
import { calculatePillars, generateReportV1, type BirthInput, type ReportV1 } from "@saju-lab/saju-core";
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
      setError(caught instanceof Error ? caught.message : "리포트를 생성하지 못했습니다.");
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
            <input value={birthDate} onChange={(event) => setBirthDate(event.target.value)} type="date" required />
          </label>

          <label>
            <span><Clock3 size={18} /> 출생시간</span>
            <input
              value={birthTime}
              onChange={(event) => setBirthTime(event.target.value)}
              type="time"
              disabled={timeUnknown}
            />
          </label>

          <div className="switchRow">
            <div>
              <strong>시간 미상</strong>
              <p>시간을 모르면 일부 해석은 참고 범위로 낮춰 표시합니다.</p>
            </div>
            <label className="toggle">
              <input checked={timeUnknown} onChange={(event) => setTimeUnknown(event.target.checked)} type="checkbox" />
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
          {error ? <p className="formError">{error}</p> : null}
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
  return (
    <section className="reportStack" aria-live="polite">
      <div className="reportHeader">
        <div>
          <p className="eyebrow">Report v{report.meta.version}</p>
          <h2>{formatDate(report.input.birthDate)} 기준 분석</h2>
        </div>
        <span>{report.meta.timeKnown ? "시간 반영" : "시간 미상"}</span>
      </div>

      <section className="savePanel">
        <div>
          <h3><Download size={20} /> 로그인 없이 리포트 저장</h3>
          <p>현재 리포트는 이 기기에서 HTML 파일로 생성되며 서버에 저장되지 않습니다. PDF 내보내기는 유료 상세 리포트 단계에서 제공하는 방향이 적합합니다.</p>
        </div>
        <button className="secondaryButton" onClick={() => downloadReportHtml(report)} type="button">
          <Download size={18} /> 리포트 저장
        </button>
      </section>

      <section className="pillarGrid" aria-label="사주 구조">
        <PillarCell title="연주" note="큰 흐름" value={report.pillars.year} />
        <PillarCell title="월주" note="환경" value={report.pillars.month} />
        <PillarCell title="일주" note="나의 중심" value={report.pillars.day} />
        <PillarCell title="시주" note="세부 흐름" value={report.pillars.time} />
      </section>

      <ArticleCard icon={<Compass size={20} />} title="전체 요약" items={[report.overview.summary, ...report.overview.toneGuidelines]} />
      <ArticleCard icon={<Sparkles size={20} />} title="성향 포인트" items={[...report.personality.strengths, ...report.personality.blindSpots]} />
      <ArticleCard icon={<Compass size={20} />} title="커리어 흐름" items={[...report.career.trends, ...report.career.risks, ...report.career.actions]} />
      <ArticleCard icon={<Coins size={20} />} title="재무 흐름" items={[...report.finance.trends, ...report.finance.risks, ...report.finance.actions]} />

      <section className="twoColumn">
        <ArticleCard title={`${report.yearlyOutlook.year}년 포인트`} items={[...report.yearlyOutlook.highlights, ...report.yearlyOutlook.cautions]} />
        <ArticleCard title="이번 달 무료 요약" items={["속도보다 정리가 유리한 달입니다.", "지출은 작게 나눠 점검하세요.", "중요한 선택은 하루 더 검토해도 좋습니다."]} />
      </section>

      <ArticleCard title="투명성 노트" items={[...report.transparency.certain, ...report.transparency.inferred, ...report.transparency.missingDataNotes]} />
      <PaidRoadmap />
      <p className="disclaimer">{report.overview.disclaimers[0]}</p>
    </section>
  );
}

function PillarCell({ title, note, value }: { title: string; note: string; value: { stem: string; branch: string } | undefined }): JSX.Element {
  return (
    <div className="pillarCell">
      <span>{title}</span>
      <strong>{value ? `${termLabel(value.stem)} ${termLabel(value.branch)}` : "미상"}</strong>
      <p>{note}</p>
    </div>
  );
}

function ArticleCard({ icon, title, items }: { icon?: React.ReactNode; title: string; items: string[] }): JSX.Element {
  return (
    <article className="articleCard">
      <h3>{icon}{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function PaidRoadmap(): JSX.Element {
  return (
    <section className="paidPanel">
      <div>
        <h3><LockKeyhole size={20} /> 프리미엄 확장 모델</h3>
        <p>무료 요약에서 상세 리포트, 저장 리포트, 월간 업데이트 구독으로 자연스럽게 확장합니다.</p>
      </div>
      <ol>
        <li>무료: 입력 기반 요약과 투명성 노트</li>
        <li>상세 리포트: 커리어/재무 심화 분석</li>
        <li>구독: 월간 흐름, 변화 알림, 저장 리포트</li>
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
      .pillars { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 20px 0; }
      .pillar, section { border: 1px solid #d8c9b8; border-radius: 8px; background: #fffdf8; padding: 14px; }
      .pillar strong { display: block; font-size: 24px; }
      ul { margin: 0; padding-left: 20px; }
      footer { margin-top: 24px; color: #66584b; font-size: 12px; }
      @media (max-width: 640px) { body { padding: 16px; } .pillars { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    </style>
  </head>
  <body>
    <main>
      <p class="meta">Saju Lab Report v${escapeHtml(report.meta.version)}</p>
      <h1>${escapeHtml(formatDate(report.input.birthDate))} 기준 사주 리포트</h1>
      <p class="notice">이 파일은 로그인 없이 기기에서 생성된 HTML 리포트입니다. 서버 저장이나 외부 전송 없이 다운로드됩니다.</p>
      <div class="pillars">
        ${renderDownloadedPillar("연주", "큰 흐름", report.pillars.year)}
        ${renderDownloadedPillar("월주", "환경", report.pillars.month)}
        ${renderDownloadedPillar("일주", "나의 중심", report.pillars.day)}
        ${renderDownloadedPillar("시주", "세부 흐름", report.pillars.time)}
      </div>
      ${sections.map(([title, items]) => renderDownloadedSection(title, items)).join("")}
      <footer>${escapeHtml(report.overview.disclaimers[0] ?? "")}</footer>
    </main>
  </body>
</html>`;
}

function renderDownloadedPillar(title: string, note: string, value: { stem: string; branch: string } | undefined): string {
  return `<div class="pillar"><span>${escapeHtml(title)}</span><strong>${value ? `${escapeHtml(termLabel(value.stem))} ${escapeHtml(termLabel(value.branch))}` : "미상"}</strong><small>${escapeHtml(note)}</small></div>`;
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
