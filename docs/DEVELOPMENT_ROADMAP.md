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
- Phase 3A has added a deterministic rules-only report engine with complete `ReportV1` sections.
- Phase 3B has added plain-language Korean terminology for core Saju terms and wired it into the web report and HTML export.
- Phase 3C has improved report scanning, confidence/disclaimer visibility, and the free-versus-paid report boundary.
- Phase 4A has improved mobile input hints, user-facing error messages, accessible controls, and section navigation.
- Phase 4B has added beta readiness documentation, privacy and safety notes, manual QA criteria, and clearer MVP scope limits.
- Phase 5 defined the first paid upgrade path as a one-time detailed report with PDF export, while keeping payment/account work separately gated.
- Phase 5A is prototyping the paid detailed report data model, rules-only generator, and PDF-ready HTML output without checkout, login, or server storage.

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
- CI workflow for install, typecheck, and test.
- Typed `BirthInput`, `Pillar`, `PillarsResult`, and `ReportV1` interfaces.

### Phase 2A: Calculation Core Fixtures

Status: Complete for a narrow verified range.

Completed Deliverables:
- 60갑자 stem/branch utilities.
- Year pillar logic with 입춘 boundary handling.
- Month pillar logic with embedded solar-term boundary handling.
- Day pillar and day-stem based time pillar logic.
- Golden fixture test suite with pre-boundary and exact-boundary coverage.
- Guardrails for unsupported fixture ranges and solar-term boundary dates without `birthTime`.

Remaining Follow-Up:
- Add explicit post-boundary tests for Ipchun and solar month boundaries.
- Add build and audit to CI if they should become protected merge gates.
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

Status: Complete.

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

Status: Complete.

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

## Phase 3C: Report UX And Free/Paid Boundary

Status: Complete.

Goal: make the mobile report easier to scan while clarifying what is free now and what belongs to future paid detailed reports.

Deliverables:
- Clear report-level notice for confidence, disclaimer, and missing birth time impact.
- Grouped report sections that separate trends, risks, and actions.
- Free monthly summary based on generated report data rather than static placeholder copy.
- Premium panel that frames paid PDF, saved reports, and deeper career/finance analysis as optional future depth.
- HTML export that carries the same confidence and free-summary context.

Exit Criteria:
- Report-first screen explains uncertainty and scope before the user reads detailed sections.
- Free report value is visible without pressuring payment.
- Paid candidates do not hide disclaimer, confidence, or transparency.

## Phase 4A: Mobile Report UX Polish

Status: Complete.

Goal: make the report-first experience usable in a browser.

Deliverables:
- Mobile-first input hints for birth date, birth time, time unknown mode, sex, and fixed `Asia/Seoul` timezone.
- Friendly error messages for invalid dates, invalid times, unsupported ranges, unsupported timezones, and solar-term boundary dates that require birth time.
- Accessible labels/descriptions for form controls, theme controls, time unknown toggle, and report saving.
- Lightweight report section navigation for overview, career, finance, monthly highlights, and transparency.
- Mobile spacing and text overflow hardening for input, buttons, and report cards.

Suggested Tasks:
- Prioritize readable report navigation over decorative landing content.
- Keep mobile layout first because casual users are likely to enter from mobile.
- Add basic form validation and accessible labels.

Exit Criteria:
- User can enter birth data and receive a full report.
- Time unknown mode visibly changes confidence/transparency.
- Report sections are ordered consistently with IA.
- User-facing errors explain what to fix instead of exposing internal calculation messages.
- Key report sections can be reached quickly from the top of the report on mobile.

Mobile-first requirements:
- Input controls must be usable with one thumb on narrow screens.
- Four-pillar terms such as 연주, 월주, 일주, 시주 must include plain-language notes.
- Report copy should use simple Korean sentences and avoid dense Hanja-heavy terminology.
- Premium prompts must appear as a product ladder, not as pressure to pay.
- Theme preference must support system, light, and dark modes without login.
- Free report export should use a local HTML download so users can save results without an account.

## Phase 4B: Quality, Safety, And Beta Readiness

Status: Complete.

Goal: prepare for a small beta without overbuilding.

Deliverables:
- Copy review against tone guide.
- Accessibility pass for forms and report sections.
- Error states for invalid input and calculation failures.
- Privacy note for birth data handling.
- Beta release checklist.
- Login-free HTML report download for basic reports.
- Safety note for career and finance interpretation limits.

Suggested Tasks:
- Add no-data and partial-data states.
- Add test coverage for i18n key coverage.
- Add manual QA checklist for mobile and desktop.

Exit Criteria:
- No deterministic prediction language in shipped Korean copy.
- Core flows pass manual QA.
- Users understand that reports are informational/entertainment-oriented.
- Users understand that the MVP does not provide login, server sync, or account storage.

## Phase 5: Paid Service Path

Status: Complete.

Goal: define the first paid upgrade path without weakening trust or hiding safety-critical transparency.

Deliverables:
- One-time detailed report PRD.
- Free MVP vs paid detailed report boundary.
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
- Paid PDF scope is clearly deeper than the free local HTML export.
- Payment, account, and saved report work are explicitly gated by policy and retention decisions.
- No disclaimer, confidence, or transparency requirement is paywalled.

## Phase 5A: Paid Detailed Report Prototype

Status: Current.

Goal: make the first paid SKU feel concrete before adding payment.

Deliverables:
- `PaidReportV1` schema for one-time detailed reports.
- `generatePaidReportV1(input)` rules-only generator.
- Career deep-dive, finance risk checklist, yearly/monthly expansion, action plan, glossary, and transparency appendix.
- PDF-ready HTML export prototype that can be saved locally.
- Tests for known and unknown birth-time cases.

Exit Criteria:
- Paid report generation is deterministic and reuses the free report inputs.
- Missing birth time remains visible in paid output.
- Paid export includes generated metadata, confidence, disclaimer, privacy/scope note, and transparency appendix.
- No checkout, login, saved report storage, or payment provider code is introduced.

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

1. Complete Phase 5A paid report prototype and PR review.
2. Plan Phase 5B PDF rendering hardening or print QA based on prototype feedback.
3. Decide privacy, refund/contact, and data-retention gates before checkout work.
4. Keep account and saved report storage out of the first paid SKU unless the product intentionally moves to subscription.
5. Continue broadening calendrical fixture coverage before public beta expansion.
