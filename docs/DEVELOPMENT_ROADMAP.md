# Saju Lab Development Roadmap

Last updated: 2026-05-15

## Roadmap Principles

- Ship the smallest trustworthy report-first experience first.
- Lock calculation correctness before expanding paid, AI, or global features.
- Treat transparency and tone as product requirements, not final polish.
- Keep each phase testable with visible exit criteria.

## Current Repository Snapshot

- `main` includes the planning-doc baseline with PRD, AGENTS, architecture, calculation, tone, schema, i18n, fixture, UI, and paid-service roadmap docs.
- `main` also includes the Phase 1 TypeScript workspace scaffold, `packages/saju-core`, and `apps/web`.
- The current MVP model is mobile-first: birth input, time-unknown mode, confidence badge, report cards, four-pillar summary, transparency notes, and free-to-paid upgrade framing.
- Phase 2A has replaced the original calculation placeholder with a deterministic, fixture-limited `Asia/Seoul` calculation core covering 60-cycle utilities, Ipchun year boundaries, solar-term month boundaries, day pillars, time pillars, and golden fixture tests.
- Phase 2B has added system/light/dark theme preferences and login-free local HTML report export for basic reports.
- The next product risk is report content depth: the rules-only report engine still needs richer, tested interpretation rules before beta.

## Completed Work

### Phase 0: Planning Baseline And Branch Hygiene

Status: Complete.

Completed Deliverables:
- Resolved documentation conflict markers.
- Added `docs/PRD.md`.
- Added root `AGENTS.md`.
- Added `docs/DEVELOPMENT_ROADMAP.md`.
- Updated README documentation index.

### Phase 1: Repository Scaffold

Status: Complete.

Completed Deliverables:
- npm workspace configuration.
- `packages/saju-core` with TypeScript build and Vitest setup.
- `apps/web` mobile-first React/Vite application.
- CI workflow for install, typecheck, test, build, and audit.
- Typed `BirthInput`, `Pillar`, `PillarsResult`, and `ReportV1` interfaces.

### Phase 2A: Calculation Core Fixtures

Status: Complete for a narrow verified range.

Completed Deliverables:
- 60갑자 stem/branch utilities.
- Year pillar logic with 입춘 boundary handling.
- Month pillar logic with embedded solar-term boundary handling.
- Day pillar and day-stem based time pillar logic.
- Golden fixture test suite and before/at/after boundary tests.
- Guardrails for unsupported fixture ranges and solar-term boundary dates without `birthTime`.

Remaining Follow-Up:
- Replace embedded fixture-only solar-term data with a broader verified data source before general public date coverage.
- Decide whether 23:00 이후 자시 should roll the day pillar to the next day.

### Phase 2B: Theme Preferences And Basic Report Export

Status: Complete.

Completed Deliverables:
- System/light/dark theme toggle.
- Theme-aware CSS variables for the mobile-first web UI.
- Storage fallback when Web Storage is blocked.
- Login-free local HTML report export for the current report.
- Paid-service roadmap update clarifying free HTML export vs paid PDF export.

## Phase 2C: Roadmap And Documentation Sync

Status: Current.

Goal: make planning docs match the implementation state after Phase 2A and Phase 2B.

Deliverables:
- Remove stale placeholder language.
- Mark completed phases clearly.
- Reorder upcoming work around report quality, Korean copy, mobile UX, beta readiness, and paid-service evolution.
- Keep PRD, README, architecture, and roadmap aligned.

Exit Criteria:
- Roadmap and README describe the current implementation accurately.
- Upcoming phases are explicit enough to plan Phase 3A without re-reading merged PR history.

## Historical Phase Details

### Phase 0: Planning Baseline And Branch Hygiene

Goal: make the planning branch readable, coherent, and merge-ready.

Deliverables:
- Resolve documentation conflict markers.
- Add `docs/PRD.md`.
- Add root `AGENTS.md`.
- Add `docs/DEVELOPMENT_ROADMAP.md`.
- Update README documentation index.
- Decide whether `docs/plan-updates` should merge `origin/main` or be recreated from it.

Exit Criteria:
- `git status` has no unmerged paths.
- All markdown docs have no conflict markers.
- README links cover PRD, AGENTS, architecture, roadmap, and MVP specs.

### Phase 1: Repository Scaffold

Goal: create the minimum TypeScript workspace needed to implement and test the core.

Deliverables:
- Package manager and workspace configuration.
- `packages/saju-core` with TypeScript build and test setup.
- `packages/saju-types` or local exported shared types.
- Lint/format/test scripts.
- CI skeleton for install, typecheck, test.

Suggested Tasks:
- Choose package manager.
- Add TypeScript strict mode.
- Add test runner.
- Encode `BirthInput`, `Pillar`, `PillarsResult`, `ReportV1`.

Exit Criteria:
- `calculatePillars` and `generateReportV1` compile with typed contracts.
- CI or local scripts can run typecheck and tests.

### Phase 2: Calculation Core

Goal: produce deterministic, verifiable pillar results.

Deliverables:
- 60갑자 stem/branch utilities.
- Year pillar logic with 입춘 boundary handling.
- Month pillar logic with solar term boundary handling.
- Day pillar and time pillar implementation or documented dependency choice.
- Solar term data source/caching strategy.
- Golden fixture test suite.

Suggested Tasks:
- Confirm KASI data usage path.
- Convert fixture candidates into structured test records.
- Add before/at/after boundary tests.
- Add `birthTime` omitted behavior.

Exit Criteria:
- At least 5 golden fixtures are verified.
- Boundary tests explicitly cover "same instant applies new term".
- Known/unknown birth time returns the expected confidence impact.

## Phase 3A: Rules-Only Report Engine

Goal: generate a complete `ReportV1` without AI dependency.

Deliverables:
- Rules table for overview, personality, career, finance, yearly, monthly, actions, transparency.
- Report generator matching `docs/REPORT_SCHEMA_V1.md`.
- Korean default copy using `docs/i18n/ko.json`.
- Snapshot tests for report shape and disclaimer presence.

Suggested Tasks:
- Keep interpretation conservative and explainable.
- Store rule IDs or evidence notes where useful.
- Add tests that all required sections are populated.

Exit Criteria:
- A valid `ReportV1` can be generated from every golden fixture.
- Disclaimer and transparency sections cannot be omitted.
- Snapshot output is stable for repeated runs.

## Phase 3B: Korean Copy And Terminology Layer

Goal: make Korean report copy feel professional, readable, and understandable without overloading users with difficult Hanja-heavy terminology.

Deliverables:
- Plain-language explanations for core terms such as 연주, 월주, 일주, 시주, 천간, 지지, 절기, and 용신/균형-related concepts if introduced.
- Korean i18n keys for recurring UI/report phrases.
- Copy review against `docs/TONE_GUIDE.md`.
- A terminology policy for when to show a technical term, when to paraphrase it, and when to add a short explanatory note.

Suggested Tasks:
- Audit existing Korean UI/report copy.
- Move repeated report phrases toward `docs/i18n/ko.json` or a package-level copy map.
- Add tests or checklist coverage for required disclaimer and uncertainty phrasing.

Exit Criteria:
- Important Saju terms have short plain-language notes.
- Report copy avoids deterministic fortune-telling language.
- Korean copy remains primary and ready for later English expansion.

## Phase 4A: Mobile Report UX Polish

Goal: make the report-first experience usable in a browser.

Deliverables:
- `apps/web` app scaffold.
- Input screen with date, optional time, sex, timezone default.
- Report screen following IA and wireframe.
- Confidence badge and missing-data notice.
- Free monthly/daily summary screen.
- Korean i18n wiring.

Suggested Tasks:
- Prioritize readable report navigation over decorative landing content.
- Keep mobile layout first because casual users are likely to enter from mobile.
- Add basic form validation and accessible labels.

Exit Criteria:
- User can enter birth data and receive a full report.
- Time unknown mode visibly changes confidence/transparency.
- Report sections are ordered consistently with IA.

Mobile-first requirements:
- Input controls must be usable with one thumb on narrow screens.
- Four-pillar terms such as 연주, 월주, 일주, 시주 must include plain-language notes.
- Report copy should use simple Korean sentences and avoid dense Hanja-heavy terminology.
- Premium prompts must appear as a product ladder, not as pressure to pay.
- Theme preference must support system, light, and dark modes without login.
- Free report export should use a local HTML download so users can save results without an account.

## Phase 4B: Quality, Safety, And Beta Readiness

Goal: prepare for a small beta without overbuilding.

Deliverables:
- Copy review against tone guide.
- Accessibility pass for forms and report sections.
- Error states for invalid input and calculation failures.
- Privacy note for birth data handling.
- Lightweight analytics events for funnel understanding.
- Beta release checklist.
- Login-free HTML report download for basic reports.

Suggested Tasks:
- Add no-data and partial-data states.
- Add test coverage for i18n key coverage.
- Add manual QA checklist for mobile and desktop.

Exit Criteria:
- No deterministic prediction language in shipped Korean copy.
- Core flows pass manual QA.
- Users understand that reports are informational/entertainment-oriented.

## Phase 5: Paid Service Path

Goal: define the first paid upgrade path without weakening trust or hiding safety-critical transparency.

Deliverables:
- One-time detailed report scope.
- PDF export requirements for paid detailed reports.
- Account/saved report scope separated from the free MVP.
- Payment and subscription sequencing.
- Trust requirements for paid copy and AI-assisted features.

Suggested Tasks:
- Convert `docs/PAID_SERVICE_ROADMAP.md` into an implementation-ready paid PRD.
- Define free vs paid report section depth.
- Specify export formats: free local HTML, paid polished PDF.
- Identify required privacy and refund/contact policies before payment work.

Exit Criteria:
- Paid work can start from a separate PRD without changing the free MVP promise.
- No disclaimer, confidence, or transparency requirement is paywalled.

## Phase 6: Post-Beta Expansion

Goal: expand only after the MVP proves understandable and trustworthy.

Candidate Work:
- Account and saved reports.
- Payment and subscription reports.
- PDF export for one-time detailed reports.
- English localization.
- AI-assisted interpretation with explicit AI disclosure.
- Deeper yearly/monthly trend modules.
- Shareable report summaries.

Gate:
- Do not start this phase until calculation fixtures, report snapshots, and beta UX feedback are stable.

## Immediate Next Actions

1. Finish Phase 2C roadmap/documentation sync.
2. Implement Phase 3A rules-only report engine with richer deterministic sections and snapshot tests.
3. Add Phase 3B Korean terminology and copy layer.
4. Polish Phase 4A mobile report UX and error states.
5. Run Phase 4B beta readiness QA before expanding paid features.
