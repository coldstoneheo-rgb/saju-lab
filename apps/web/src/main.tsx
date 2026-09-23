import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Coins, Compass, Download, LockKeyhole, Monitor, Moon, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react";
import { buildFreeReportHtml, buildInputSummaryItems, buildPaidReportHtml } from "./export-html.js";
import { calculationCoverageCopy } from "./calculation-coverage-copy.js";
import { describeCalculationRule } from "./calculation-rule-copy.js";
import { toFriendlyError } from "./friendly-error.js";
import { validateInputDraft } from "./input-validation.js";
import { paidReadinessCopy } from "./paid-readiness-copy.js";
import { findPolicyPage, policyPages, type PolicyPage } from "./policy-pages.js";
import { buildFreeReportFilename } from "./report-filenames.js";
import {
  BIRTH_PLACES,
  BRANCH_FIVE_ELEMENT,
  calculatePillarsWithResolution,
  daeunOf,
  hiddenStemList,
  isDaeunUnavailable,
  resolveBirthKst,
  HYEONG_SUBTYPE_LABELS,
  INTERACTION_LABELS,
  interactionsOfChart,
  leapMonth,
  STEM_FIVE_ELEMENT,
  TEN_GOD_LABELS,
  tenGodsOfChart,
  generatePaidReportV1,
  generateReportV1,
  getSajuTerm,
  type BirthInput,
  type CalculationResolution,
  type BranchInteraction,
  type ChartInteractions,
  type ChartTenGods,
  type DaeunBlock,
  type DaeunReading,
  type PaidReportV1,
  type PillarKey,
  type PillarsAlternates,
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
  resolution: CalculationResolution;
  alternates?: PillarsAlternates;
  tenGods: ChartTenGods;
  interactions: ChartInteractions;
  /** null when the reference 절 is outside the solar-term table (unreachable for dates the calculator accepts). */
  daeun: DaeunBlock | null;
}

const ALT_PILLARS_VIEWS_KEY = "saju-lab-alt-pillars-views";

const THEME_STORAGE_KEY = "saju-lab-theme";

function App(): JSX.Element {
  const [birthDate, setBirthDate] = React.useState(DEFAULT_INPUT.birthDate);
  const [birthTime, setBirthTime] = React.useState(DEFAULT_INPUT.birthTime ?? "");
  const [timeUnknown, setTimeUnknown] = React.useState(false);
  const [calendar, setCalendar] = React.useState<"solar" | "lunar">("solar");
  const [isLeapMonth, setIsLeapMonth] = React.useState(false);
  const [sex, setSex] = React.useState<BirthInput["sex"]>(DEFAULT_INPUT.sex);
  const [reportBundle, setReportBundle] = React.useState<ReportBundle>(() => createReportBundle(DEFAULT_INPUT));
  const [lastInput, setLastInput] = React.useState<BirthInput>(DEFAULT_INPUT);
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

    const validationError = validateInputDraft({ birthDate, birthTime, timeUnknown, calendar });

    if (validationError) {
      setError(validationError);
      return;
    }

    const input: BirthInput = {
      birthDate,
      ...(timeUnknown || birthTime === "" ? {} : { birthTime }),
      timezone: "Asia/Seoul",
      sex,
      ...(calendar === "lunar" ? { calendar: "lunar" as const, isLeapMonth } : {})
    };

    try {
      setReportBundle(createReportBundle(input));
      setLastInput(input);
      setError(undefined);
    } catch (caught) {
      setError(toFriendlyError(caught));
    }
  }

  // Boundary reading: the user picked a 시·도, so recalculate locally with the
  // longitude correction. Same input otherwise — nothing leaves the device.
  function handleBirthPlace(birthPlace: string): void {
    const input: BirthInput = { ...lastInput, birthPlace, options: { ...lastInput.options, trueSolarTime: true } };
    try {
      setReportBundle(createReportBundle(input));
      setLastInput(input);
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
            <small id="birth-date-help">
              {calendar === "lunar" ? "음력 생년월일(1900~2050)을 양력으로 바꾼 뒤 계산합니다." : "양력 생년월일을 기준으로 계산합니다."}
            </small>
          </label>

          <fieldset>
            <legend><CalendarDays size={18} /> 달력</legend>
            <div className="segmented">
              {(["solar", "lunar"] as const).map((value) => (
                <label key={value}>
                  <input
                    checked={calendar === value}
                    name="calendar"
                    onChange={() => { setCalendar(value); if (value === "solar") setIsLeapMonth(false); }}
                    type="radio"
                  />
                  <span>{value === "solar" ? "양력" : "음력"}</span>
                </label>
              ))}
            </div>
            {calendar === "lunar" ? (
              <label className="leapMonthRow">
                <input
                  aria-label="윤달 생일"
                  checked={isLeapMonth}
                  disabled={leapMonthOfDraft(birthDate) === 0}
                  onChange={(event) => setIsLeapMonth(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  {leapMonthOfDraft(birthDate) === 0
                    ? "이 해에는 윤달이 없습니다."
                    : `윤달 생일 (이 해의 윤달은 ${leapMonthOfDraft(birthDate)}월)`}
                </span>
              </label>
            ) : null}
          </fieldset>

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
        <CalculationCoverageNote />
        <ReportView
          alternates={reportBundle.alternates}
          onBirthPlace={handleBirthPlace}
          paidReport={paidReport}
          report={report}
          resolution={reportBundle.resolution}
          tenGods={reportBundle.tenGods}
          interactions={reportBundle.interactions}
          daeun={reportBundle.daeun}
        />
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
          <strong><AlertTriangle size={18} /> 아직 실제 결제용 문서가 아닙니다</strong>
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

function ReportView({ alternates, daeun, interactions, onBirthPlace, paidReport, report, resolution, tenGods }: {
  alternates: PillarsAlternates | undefined;
  daeun: DaeunBlock | null;
  interactions: ChartInteractions;
  onBirthPlace: (birthPlace: string) => void;
  paidReport: PaidReportV1;
  report: ReportV1;
  resolution: CalculationResolution;
  tenGods: ChartTenGods;
}): JSX.Element {
  const freeSummary = buildFreeMonthlySummary(report);
  const [exportStatus, setExportStatus] = React.useState<string | undefined>();

  function handleFreeExport(): void {
    try {
      const filename = downloadReportHtml(report);
      setExportStatus(`${filename} 파일을 이 기기에 저장했습니다.`);
    } catch {
      setExportStatus("리포트 저장에 실패했습니다. 브라우저 다운로드 설정을 확인해 주세요.");
    }
  }

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
        <a href="#actions">행동</a>
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
          onClick={handleFreeExport}
          type="button"
        >
          <Download size={18} /> 리포트 저장
        </button>
        {exportStatus ? <p className="exportStatus" aria-live="polite">{exportStatus}</p> : null}
      </section>

      {/* 명식 카드: 時日月年 좌→우(전통 배열, 베타 UI 시안 2026-09-23). 오행색은 글자·점에만 쓰고 좋고 나쁨을 뜻하지 않는다. */}
      <section className="pillarGrid" aria-label="사주 구조">
        <PillarCell termKey="timePillar" tenGods={tenGods.time} value={report.pillars.time} />
        <PillarCell termKey="dayPillar" tenGods={tenGods.day} value={report.pillars.day} />
        <PillarCell termKey="monthPillar" tenGods={tenGods.month} value={report.pillars.month} />
        <PillarCell termKey="yearPillar" tenGods={tenGods.year} value={report.pillars.year} />
      </section>
      <p className="elementNote">색과 점은 오행(목·화·토·금·수) 표시일 뿐, 좋고 나쁨을 뜻하지 않습니다.</p>
      <PillarTermsDetails />
      <HiddenStemsDetails pillars={report.pillars} tenGods={tenGods} />
      <InteractionsLine interactions={interactions} />
      <CalculationRuleLine alternates={alternates} onBirthPlace={onBirthPlace} resolution={resolution} />
      <DaeunRow daeun={daeun} />

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
        <MonthlyHighlightsCard id="monthly" report={report} summary={freeSummary} />
      </section>

      <InsightSection
        icon={<CheckCircle2 size={20} />}
        id="actions"
        title="행동 제안"
        groups={[
          { label: "습관", items: report.actionSuggestions.habits },
          { label: "계획", items: report.actionSuggestions.planning },
          { label: "리스크 관리", items: report.actionSuggestions.riskManagement }
        ]}
      />

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

function CalculationCoverageNote(): JSX.Element {
  return (
    <section className="coverageNote" aria-label="현재 MVP 계산 범위 안내">
      <strong><CalendarDays size={18} /> {calculationCoverageCopy.headline}</strong>
      <p>{calculationCoverageCopy.summary}</p>
      <ul>
        {calculationCoverageCopy.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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

function CalculationRuleLine({ alternates, onBirthPlace, resolution }: {
  alternates: PillarsAlternates | undefined;
  onBirthPlace: (birthPlace: string) => void;
  resolution: CalculationResolution;
}): JSX.Element {
  const copy = describeCalculationRule(resolution, alternates, termLabel);
  const jaHourAlternate = alternates?.jaHourPolicy;

  return (
    <section className="calculationRule" aria-label="계산 규칙">
      <p className="calculationRuleLine">{copy.parts.join(" · ")}</p>
      {copy.boundaryPrompt ? (
        <label className="boundaryPrompt">
          <span><AlertTriangle size={16} /> {copy.boundaryPrompt}</span>
          <select aria-label="출생지 시·도" defaultValue="" onChange={(event) => { if (event.target.value) onBirthPlace(event.target.value); }}>
            <option value="" disabled>출생지 선택</option>
            {BIRTH_PLACES.map((place) => (
              <option key={place.code} value={place.code}>{place.nameKo}</option>
            ))}
          </select>
        </label>
      ) : null}
      {copy.uncorrectedNote ? <p className="uncorrectedNote">{copy.uncorrectedNote}</p> : null}
      {jaHourAlternate ? (
        <details className="alternatePillars" onToggle={(event) => { if ((event.target as HTMLDetailsElement).open) countAlternateView(); }}>
          <summary>참고 명식 보기 — 23시대를 다음 날로 보는 학파({jaHourAlternate.policy === "early" ? "조자시" : "야자시"})</summary>
          <table>
            <thead>
              <tr><th>연주</th><th>월주</th><th>일주</th><th>시주</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>{pillarText(jaHourAlternate.pillars.year)}</td>
                <td>{pillarText(jaHourAlternate.pillars.month)}</td>
                <td>{pillarText(jaHourAlternate.pillars.day)}</td>
                <td>{pillarText(jaHourAlternate.pillars.time)}</td>
              </tr>
            </tbody>
          </table>
          <p>표만 제공합니다. 해석은 위 기본 명식 기준입니다.</p>
        </details>
      ) : null}
    </section>
  );
}

function pillarText(value: { stem: string; branch: string } | undefined): string {
  return value ? `${termLabel(value.stem)} ${termLabel(value.branch)}` : "-";
}

// 열람 카운터: 서버 없이 이 기기에만 남긴다(v1.1에서 접힘 표 유지 여부를 판단할 재료).
function countAlternateView(): void {
  try {
    const current = Number(window.localStorage.getItem(ALT_PILLARS_VIEWS_KEY) ?? "0");
    window.localStorage.setItem(ALT_PILLARS_VIEWS_KEY, String(current + 1));
  } catch {
    // storage unavailable — the counter is a convenience, not a feature
  }
}

const STEM_HANJA: Record<string, string> = { gap: "甲", eul: "乙", byeong: "丙", jeong: "丁", mu: "戊", gi: "己", gyeong: "庚", sin: "辛", im: "壬", gye: "癸" };
const BRANCH_HANJA: Record<string, string> = { ja: "子", chuk: "丑", in: "寅", myo: "卯", jin: "辰", sa: "巳", o: "午", mi: "未", sin: "申", yu: "酉", sul: "戌", hae: "亥" };

function PillarCell({ termKey, tenGods, value }: {
  termKey: SajuTermKey;
  tenGods: ChartTenGods["year"] | undefined;
  value: { stem: string; branch: string } | undefined;
}): JSX.Element {
  const term = getSajuTerm(termKey);
  const isDay = termKey === "dayPillar";
  // 계산 층의 라벨이지 해석이 아니다: 천간 십신(일간 자신은 「일간」) · 지지 정기 십신.
  const stemGod = value && tenGods ? (tenGods.stem ? TEN_GOD_LABELS[tenGods.stem].ko : "일간") : undefined;
  const branchGod = value && tenGods ? TEN_GOD_LABELS[tenGods.branchPrimary].ko : undefined;

  return (
    <div className={isDay ? "pillarCell dayPillar" : "pillarCell"}>
      <span className="pillarLabel">{term.label}</span>
      {value ? (
        <>
          {stemGod ? <em className="tenGodLine" aria-label="천간 십신">{stemGod}</em> : null}
          <Glyph hanja={STEM_HANJA[value.stem]} ko={termLabel(value.stem)} element={STEM_FIVE_ELEMENT[value.stem as keyof typeof STEM_FIVE_ELEMENT]} />
          <hr />
          <Glyph hanja={BRANCH_HANJA[value.branch]} ko={termLabel(value.branch)} element={BRANCH_FIVE_ELEMENT[value.branch as keyof typeof BRANCH_FIVE_ELEMENT]} />
          {branchGod ? <em className="tenGodLine" aria-label="지지 정기 십신">{branchGod}</em> : null}
        </>
      ) : (
        <strong className="pillarUnknown">미상</strong>
      )}
    </div>
  );
}

function Glyph({ element, hanja, ko }: { element: string | undefined; hanja: string | undefined; ko: string }): JSX.Element {
  return (
    <span className={`glyph element-${element ?? "none"}`}>
      <strong className="hanja" lang="zh-Hant">{hanja ?? ko}</strong>
      <span className="glyphLabel"><i className="elementDot" aria-hidden="true" />{ko} · {elementLabel(element ?? "")}</span>
    </span>
  );
}

// 기둥 설명 카피(기존 카드 본문)는 카드가 좁아져 접힘으로 옮긴다 — 문구는 그대로.
function PillarTermsDetails(): JSX.Element {
  const keys: SajuTermKey[] = ["yearPillar", "monthPillar", "dayPillar", "timePillar"];
  return (
    <details className="pillarTerms">
      <summary>기둥 설명 보기</summary>
      <dl>
        {keys.map((key) => {
          const term = getSajuTerm(key);
          return (
            <div key={key}>
              <dt>{term.label} — {term.short}</dt>
              <dd>{term.description}</dd>
            </div>
          );
        })}
      </dl>
    </details>
  );
}

// 지장간: 계산 층 표시(회의 A2-6 「계산과 해석의 경계를 본다」). 접힘 표만, 통변 없음.
function HiddenStemsDetails({ pillars, tenGods }: { pillars: ReportV1["pillars"]; tenGods: ChartTenGods }): JSX.Element {
  const slots: Array<{ label: string; branch: string | undefined; gods: ChartTenGods["year"] | undefined }> = [
    { label: "연지", branch: pillars.year.branch, gods: tenGods.year },
    { label: "월지", branch: pillars.month.branch, gods: tenGods.month },
    { label: "일지", branch: pillars.day.branch, gods: tenGods.day },
    { label: "시지", branch: pillars.time?.branch, gods: tenGods.time }
  ];
  const roleLabel = { residual: "여기", middle: "중기", primary: "정기" } as const;

  return (
    <details className="hiddenStems">
      <summary>지장간 보기 — 지지 속 천간과 각각의 십신(연해자평 월률분야, 일수는 참고값)</summary>
      <table>
        <thead>
          <tr><th>지지</th><th>여기</th><th>중기</th><th>정기</th></tr>
        </thead>
        <tbody>
          {slots.map((slot) => {
            if (!slot.branch || !slot.gods) return null;
            const list = hiddenStemList(slot.branch as Parameters<typeof hiddenStemList>[0]);
            const cell = (role: "residual" | "middle" | "primary"): string => {
              const entry = list.find((item) => item.role === role);
              const god = slot.gods?.branchAll.find((item) => item.role === role);
              return entry && god ? `${termLabel(entry.stem)} ${TEN_GOD_LABELS[god.tenGod].ko}${entry.days ? ` (${entry.days}일)` : ""}` : "-";
            };
            return (
              <tr key={slot.label}>
                <th>{slot.label} {termLabel(slot.branch)}</th>
                <td>{cell("residual")}</td>
                <td>{cell("middle")}</td>
                <td>{cell("primary")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>{Object.values(roleLabel).join("·")} 순서는 지지 안에서 기운이 드러나는 차례를 뜻합니다. 가중 계산은 하지 않습니다.</p>
    </details>
  );
}

// 합충형: 계산 층 표시(6단계 v1). 관계의 존재·위치만 — 化 판정·길흉·가중 없음. 칩 1줄 + 접힘 상세 표, 통변 없음.
const PILLAR_SHORT: Record<PillarKey, string> = { year: "연", month: "월", day: "일", time: "시" };

function interactionChip(kind: keyof typeof INTERACTION_LABELS, characters: string[], pillars: PillarKey[], complete: boolean | undefined, subtype: BranchInteraction["subtype"]): string {
  const letters = characters.map(termLabel).join("");
  const label = kind === "ganhap" ? "합"
    : kind === "samhap" && complete === false ? "반합"
    : kind === "hyeong" && subtype === "ja" ? "자형"
    : INTERACTION_LABELS[kind].ko;
  return `${letters}${label}(${pillars.map((pillar) => PILLAR_SHORT[pillar]).join("·")})`;
}

function InteractionsLine({ interactions }: { interactions: ChartInteractions }): JSX.Element {
  const chips = [
    ...interactions.stems.map((entry) => interactionChip("ganhap", entry.stems, entry.pillars, undefined, undefined)),
    ...interactions.branches.map((entry) => interactionChip(entry.kind, entry.branches, entry.pillars, entry.complete, entry.subtype))
  ];
  const rows: Array<{ kind: string; pillars: string; letters: string; complete: string; adjacent: string }> = [
    ...interactions.stems.map((entry) => ({
      kind: `${INTERACTION_LABELS.ganhap.ko}(${INTERACTION_LABELS.ganhap.hanja})`,
      pillars: entry.pillars.map((pillar) => PILLAR_SHORT[pillar]).join("·"),
      letters: entry.stems.map(termLabel).join(" "),
      complete: `화기 ${elementLabel(entry.potentialElement)} (참고값)`,
      adjacent: entry.adjacent ? "인접" : "비인접"
    })),
    ...interactions.branches.map((entry) => ({
      kind: entry.kind === "hyeong" && entry.subtype
        ? `${HYEONG_SUBTYPE_LABELS[entry.subtype].ko}(${HYEONG_SUBTYPE_LABELS[entry.subtype].hanja})`
        : `${INTERACTION_LABELS[entry.kind].ko}(${INTERACTION_LABELS[entry.kind].hanja})`,
      pillars: entry.pillars.map((pillar) => PILLAR_SHORT[pillar]).join("·"),
      letters: entry.branches.map(termLabel).join(" "),
      complete: entry.complete === true ? "완전" : entry.complete === false ? (entry.kind === "samhap" ? "반합" : "부분") : "-",
      adjacent: entry.adjacent === undefined ? "-" : entry.adjacent ? "인접" : "비인접"
    }))
  ];

  return (
    <div className="interactions">
      <p className="interactionChips" aria-label="합충">
        <strong>합충</strong>
        {chips.length ? chips.map((chip) => <span key={chip} className="chip">{chip}</span>) : <span>없음 — 간합·육합·삼합·방합·충·형 규칙에 해당하는 글자 쌍이 없습니다.</span>}
      </p>
      {rows.length ? (
        <details className="interactionDetails">
          <summary>합충 상세 — 종류·기둥·글자·완전/부분·인접 (규칙 표 기준, 해석은 하지 않습니다)</summary>
          <table>
            <thead>
              <tr><th>종류</th><th>기둥</th><th>글자</th><th>완전/부분</th><th>인접</th></tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.kind}-${row.pillars}-${index}`}>
                  <th>{row.kind}</th>
                  <td>{row.pillars}</td>
                  <td>{row.letters}</td>
                  <td>{row.complete}</td>
                  <td>{row.adjacent}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>모든 기둥 쌍을 그대로 나열합니다. 인접 여부로 걸러내지 않고, 합이 실제로 변하는지(化)나 좋고 나쁨은 판단하지 않습니다.</p>
        </details>
      ) : null}
    </div>
  );
}

// 대운: 계산 층 표시(7단계 v1). 분 단위 소수를 그대로 보이고 반올림하지 않는다. 성별 「기타」는 순행·역행 두 줄, 기본 없음. 통변 없음.
const TERM_KO: Record<string, string> = {
  ipchun: "입춘", gyeongchip: "경칩", cheongmyeong: "청명", ipha: "입하", mangjong: "망종", soseo: "소서",
  ipchu: "입추", baengno: "백로", hallo: "한로", ipdong: "입동", daeseol: "대설", sohan: "소한"
};

function DaeunRow({ daeun }: { daeun: DaeunBlock | null }): JSX.Element {
  if (!daeun) {
    return <p className="daeunNote">대운 — 절기표(1920~2100) 밖이라 계산하지 않습니다.</p>;
  }
  const readings = [daeun.forward, daeun.backward].filter((reading): reading is DaeunReading => Boolean(reading));
  return (
    <div className="daeun">
      {readings.map((reading) => (
        <div key={reading.direction} className="daeunReading">
          <p className="daeunHead">
            <strong>대운{daeun.direction === "both" ? `(${reading.direction === "forward" ? "순행" : "역행"})` : ""}</strong>
            <span>
              {daeun.direction === "both" ? "성별 「기타」는 순행·역행을 모두 보입니다 · " : `${reading.direction === "forward" ? "순행" : "역행"} · `}
              시작 {reading.startAgeExact.toFixed(2)}세({reading.startsAt}){daeun.precision === "time-unknown" ? " · 시각 미상 ±0.17년" : ""}
            </span>
          </p>
          <ol className="daeunPeriods" aria-label={`대운 ${reading.direction === "forward" ? "순행" : "역행"}`}>
            {reading.periods.map((period) => (
              <li key={period.index} className={reading.current?.index === period.index ? "current" : undefined} aria-current={reading.current?.index === period.index ? "true" : undefined}>
                <span className="daeunAge">{period.startAge.toFixed(1)}세</span>
                <strong className="hanja" lang="zh-Hant">{STEM_HANJA[period.stem]}{BRANCH_HANJA[period.branch]}</strong>
                <span className="daeunKo">{termLabel(period.stem)}{termLabel(period.branch)}</span>
                <em>{TEN_GOD_LABELS[period.tenGods.stem].ko}·{TEN_GOD_LABELS[period.tenGods.branchPrimary].ko}</em>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <details className="daeunRule">
        <summary>대운 계산 규칙 — 순역·기준 절·거리·소수 그대로(반올림 없음)</summary>
        <ul>
          {readings.map((reading) => (
            <li key={reading.direction}>
              {reading.direction === "forward" ? "순행" : "역행"}: 기준 절 {TERM_KO[reading.referenceTerm.term] ?? reading.referenceTerm.term} {reading.referenceTerm.at.replace("T", " ")} · 거리 {reading.distanceMinutes.toLocaleString("ko-KR")}분 ÷ 4,320분(3일 = 1년) = {reading.startAgeExact}년
              {reading.truncated ? " · 절기표 끝(2100-12-07)을 넘는 주는 표시하지 않습니다" : ""}
            </li>
          ))}
          <li>출생 시각은 정규화 KST 벽시계(진태양시 미적용). 시작 나이의 반올림·버림은 정하지 않고 소수 그대로 둡니다. 기준일 {daeun.referenceDate} 현재 대운만 강조합니다.</li>
        </ul>
      </details>
    </div>
  );
}

function elementLabel(element: string): string {
  const labels: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
  return labels[element] ?? element;
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

function MonthlyHighlightsCard({ id, report, summary }: { id?: string; report: ReportV1; summary: { keywords: string[]; comment: string } }): JSX.Element {
  return (
    <article className="articleCard freeSummaryCard" id={id}>
      <h3><Sparkles size={20} /> 월간 무료 하이라이트</h3>
      <div className="keywordRow">
        {summary.keywords.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>
      <p>{summary.comment}</p>
      <div className="insightGroups">
        <section className="insightGroup">
          <span>좋은 달</span>
          <ul>
            {report.monthly.goodMonths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="insightGroup">
          <span>주의 달</span>
          <ul>
            {report.monthly.cautionMonths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}

function PaidReportPrototype({ paidReport }: { paidReport: PaidReportV1 }): JSX.Element {
  return (
    <section className="paidPrototype" id="paid-preview">
      <div className="paidPrototypeHeader">
        <div>
          <p className="eyebrow">유료 상세 리포트 준비 중</p>
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

/** Leap month number of the lunar year typed into the form, or 0 (no leap month / unparseable). */
function leapMonthOfDraft(birthDate: string): number {
  const year = Number(birthDate.slice(0, 4));
  return Number.isInteger(year) ? leapMonth(year) : 0;
}

function createReportBundle(input: BirthInput): ReportBundle {
  const { pillars, resolution, alternates } = calculatePillarsWithResolution(input);
  const reportInput = {
    input,
    pillars,
    generatedAt: new Date().toISOString()
  };

  return {
    report: generateReportV1(reportInput),
    paidReport: generatePaidReportV1(reportInput),
    resolution,
    ...(alternates ? { alternates } : {}),
    tenGods: tenGodsOfChart(pillars),
    interactions: interactionsOfChart(pillars),
    daeun: daeunBlock(pillars, input)
  };
}

function daeunBlock(pillars: ReportV1["pillars"], input: BirthInput): DaeunBlock | null {
  const result = daeunOf(pillars, resolveBirthKst(input), input.sex);
  return isDaeunUnavailable(result) ? null : result;
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

function downloadReportHtml(report: ReportV1): string {
  const html = buildFreeReportHtml(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const filename = buildFreeReportFilename(report.meta.generatedAt);

  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return filename;
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
    <Analytics />
  </React.StrictMode>
);
