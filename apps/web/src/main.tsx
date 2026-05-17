import React from "react";
import ReactDOM from "react-dom/client";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Coins, Compass, Download, LockKeyhole, Monitor, Moon, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react";
import { buildFreeReportHtml, buildInputSummaryItems, buildPaidReportHtml } from "./export-html.js";
import { toFriendlyError } from "./friendly-error.js";
import { paidReadinessCopy } from "./paid-readiness-copy.js";
import { findPolicyPage, policyPages, type PolicyPage } from "./policy-pages.js";
import { buildFreeReportFilename } from "./report-filenames.js";
import {
  calculatePillars,
  generatePaidReportV1,
  generateReportV1,
  getSajuTerm,
  type BirthInput,
  type PaidReportV1,
  type ReportV1,
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

interface ReportBundle {
  report: ReportV1;
  paidReport: PaidReportV1;
}

const THEME_STORAGE_KEY = "saju-lab-theme";

function App(): JSX.Element {
  const [birthDate, setBirthDate] = React.useState(DEFAULT_INPUT.birthDate);
  const [birthTime, setBirthTime] = React.useState(DEFAULT_INPUT.birthTime ?? "");
  const [timeUnknown, setTimeUnknown] = React.useState(false);
  const [sex, setSex] = React.useState<BirthInput["sex"]>(DEFAULT_INPUT.sex);
  const [reportBundle, setReportBundle] = React.useState<ReportBundle>(() => createReportBundle(DEFAULT_INPUT));
  const [error, setError] = React.useState<string | undefined>();
  const [theme, setTheme] = React.useState<ThemePreference>(() => readThemePreference());
  const policyPage = findPolicyPage(readPathname());
  const { report, paidReport } = reportBundle;

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
      setReportBundle(createReportBundle(input));
      setError(undefined);
    } catch (caught) {
      setError(toFriendlyError(caught));
    }
  }

  if (policyPage) {
    return <PolicyPageView page={policyPage} theme={theme} onThemeChange={setTheme} />;
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

        <PrivacyNote />
        <ReportView paidReport={paidReport} report={report} />
      </section>
    </main>
  );
}

function PolicyPageView({ page, theme, onThemeChange }: {
  page: PolicyPage;
  theme: ThemePreference;
  onThemeChange: (value: ThemePreference) => void;
}): JSX.Element {
  return (
    <main className="appShell">
      <section className="workspace policyWorkspace">
        <header className="appHeader">
          <div>
            <p className="eyebrow">Saju Lab Policy Draft</p>
            <h1>{page.title}</h1>
          </div>
          <div className="headerActions">
            <ThemeToggle value={theme} onChange={onThemeChange} />
          </div>
        </header>

        <section className="policyIntro" aria-label="정책 초안 안내">
          <strong><ShieldCheck size={18} /> 결제 오픈 전 검토 문서</strong>
          <p>{page.summary}</p>
          <p>{page.statusNote}</p>
        </section>

        <nav className="sectionNav" aria-label="정책 문서 바로가기">
          <a href="/">리포트로 돌아가기</a>
          {policyPages.map((policy) => (
            <a aria-current={policy.path === page.path ? "page" : undefined} href={policy.path} key={policy.path}>
              {policy.title.replace(" 초안", "")}
            </a>
          ))}
        </nav>

        <section className="policyStack">
          {page.sections.map((section) => (
            <article className="articleCard" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="safetyNote" aria-label="정책 초안 한계">
          <strong><AlertTriangle size={18} /> 아직 live checkout 문서가 아닙니다</strong>
          <p>이 페이지는 정책 링크 구조와 사용자 안내 문구를 검토하기 위한 초안입니다. 실제 지원 연락처, 최종 결제 제공자, 정확한 보관 기간은 결제 오픈 전에 확정해야 합니다.</p>
        </section>
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

function ReportView({ paidReport, report }: { paidReport: PaidReportV1; report: ReportV1 }): JSX.Element {
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
        <a href="#paid-preview">상세</a>
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
      <SafetyNote />
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
      <PaidReportPrototype paidReport={paidReport} />
      <PaidRoadmap />
    </section>
  );
}

function PrivacyNote(): JSX.Element {
  return (
    <section className="privacyNote" aria-label="개인정보 처리 안내">
      <strong><CheckCircle2 size={18} /> 로컬 처리 안내</strong>
      <p>현재 MVP는 로그인, 계정 저장, 서버 동기화를 제공하지 않습니다. 입력한 생년월일과 출생시간은 이 브라우저에서 리포트를 만드는 데만 사용됩니다.</p>
    </section>
  );
}

function SafetyNote(): JSX.Element {
  return (
    <section className="safetyNote" aria-label="해석 안전 안내">
      <strong><AlertTriangle size={18} /> 중요한 결정 전 확인</strong>
      <p>커리어와 재무 문장은 경향과 점검 방향을 정리한 참고 정보입니다. 실제 결정은 계약, 예산, 건강 상태, 전문가 조언 같은 현실 자료와 함께 확인하세요.</p>
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

function PaidReportPrototype({ paidReport }: { paidReport: PaidReportV1 }): JSX.Element {
  return (
    <section className="paidPrototype" id="paid-preview">
      <div className="paidPrototypeHeader">
        <div>
          <p className="eyebrow">Phase 5E PDF-ready Spike</p>
          <h3><LockKeyhole size={20} /> {paidReport.cover.title}</h3>
          <p>{paidReport.cover.subtitle}</p>
          <p className="paidPrintHint">저장한 HTML을 브라우저에서 열고 인쇄 메뉴의 PDF 저장을 선택하면 됩니다. 현재 단계는 결제 없이 산출물 품질을 검증합니다.</p>
        </div>
        <button
          aria-label="PDF 저장용 유료 상세 리포트 HTML 저장"
          className="secondaryButton"
          onClick={() => downloadPaidReportHtml(paidReport)}
          type="button"
        >
          <Download size={18} /> PDF 저장용 HTML
        </button>
      </div>

      <div className="paidMetaGrid">
        <span>{confidenceLabel(paidReport.meta.confidence)}</span>
        <span>{paidReport.meta.timeKnown ? "시주 포함" : "출생시간 미상 반영"}</span>
        <span>{paidReport.meta.exportFormat}</span>
      </div>

      <div className="paidInputSummary" aria-label="상세 리포트 입력 요약">
        <h4>입력 요약</h4>
        <dl>
          {buildInputSummaryItems(paidReport.input).map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="paidSectionGrid">
        <PaidSectionPreview section={paidReport.executiveSummary} />
        <PaidSectionPreview section={paidReport.careerDeepDive.roleFit} />
        <PaidSectionPreview section={paidReport.financeDeepDive.rhythm} />
        <PaidChecklistPreview checklist={paidReport.financeDeepDive.riskChecklist} />
      </div>

      <div className="monthlyTimeline" aria-label="유료 상세 월간 흐름">
        {paidReport.yearlyMonthlyExpansion.monthlyThemes.map((month) => (
          <article key={`${month.month}-${month.theme}`}>
            <strong>{month.month}</strong>
            <p>{month.theme}</p>
            <small>{month.action}</small>
            <small>{month.caution}</small>
          </article>
        ))}
      </div>

      <div className="paidAppendix">
        <div>
          <h4>PDF 필수 고지</h4>
          <ul>
            {paidReport.pdf.requiredNotices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>투명성 부록</h4>
          <ul>
            {paidReport.transparencyAppendix.disclaimers.map((disclaimer) => (
              <li key={disclaimer}>{disclaimer}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PaidSectionPreview({ section }: { section: PaidReportV1["executiveSummary"] }): JSX.Element {
  return (
    <article className="paidPreviewCard">
      <h4>{section.title}</h4>
      <p>{section.summary}</p>
      <ul>
        {section.items.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function PaidChecklistPreview({ checklist }: { checklist: PaidReportV1["financeDeepDive"]["riskChecklist"] }): JSX.Element {
  return (
    <article className="paidPreviewCard">
      <h4>{checklist.title}</h4>
      <ul>
        {checklist.items.map((item) => (
          <li key={item.label}><strong>{item.label}</strong> {item.detail}</li>
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
        <p>무료 리포트는 핵심 흐름과 투명성 노트를 제공합니다. 상세 리포트는 커리어/재무 해설, 월별 주의점, PDF-ready 저장물을 더 깊게 다루는 1회성 유료 상품 후보입니다.</p>
      </div>
      <ol>
        <li>무료: 기본 리포트, 투명성 노트, 로컬 HTML 저장</li>
        <li>상세 리포트 후보: 커리어/재무 심화 분석, 선택지 비교, PDF-ready 다운로드</li>
        <li>결제 오픈 전 준비: 개인정보, 환불/문의, 데이터 보관 기준 확정</li>
      </ol>
      <div className="paidReadiness" aria-label="유료 상세 리포트 준비 기준">
        <h4><ShieldCheck size={18} /> {paidReadinessCopy.headline}</h4>
        <ul>
          {paidReadinessCopy.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="policyLinkList" aria-label="정책 초안 링크">
          {policyPages.map((policy) => (
            <a href={policy.path} key={policy.path}>{policy.title.replace(" 초안", "")}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

function createReportBundle(input: BirthInput): ReportBundle {
  const reportInput = {
    input,
    pillars: calculatePillars(input),
    generatedAt: new Date().toISOString()
  };

  return {
    report: generateReportV1(reportInput),
    paidReport: generatePaidReportV1(reportInput)
  };
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

function readPathname(): string {
  return typeof window === "undefined" ? "/" : window.location.pathname;
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
  const html = buildFreeReportHtml(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = buildFreeReportFilename(report.meta.generatedAt);
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadPaidReportHtml(paidReport: PaidReportV1): void {
  const html = buildPaidReportHtml(paidReport);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = paidReport.pdf.filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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
