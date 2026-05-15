# Saju Lab Development Roadmap

Last updated: 2026-05-14

## Roadmap Principles

- Ship the smallest trustworthy report-first experience first.
- Lock calculation correctness before expanding paid, AI, or global features.
- Treat transparency and tone as product requirements, not final polish.
- Keep each phase testable with visible exit criteria.

## Current Repository Snapshot

- `main` includes the planning-doc baseline with PRD, AGENTS, architecture, calculation, tone, schema, i18n, fixture, UI, and paid-service roadmap docs.
- `codex/phase1-implementation-scaffold` starts the implementation track with npm workspaces, `packages/saju-core`, and `apps/web`.
- The first MVP model is mobile-first: birth input, time-unknown mode, confidence badge, report cards, four-pillar summary, transparency notes, and free-to-paid upgrade framing.
- Calculation is still a stub and must not be treated as verified Saju output until Phase 2 fixtures pass.

## Phase 0: Planning Baseline And Branch Hygiene

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

## Phase 1: Repository Scaffold

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
- `calculatePillars` and `generateReportV1` compile as typed stubs.
- CI or local scripts can run typecheck and tests.

## Phase 2: Calculation Core

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

## Phase 3: Rules-Only Report Engine

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

## Phase 4: MVP Web App

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

## Phase 5: Quality, Safety, And Beta Readiness

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

1. Finish branch hygiene and merge planning docs.
2. Choose package manager and scaffold TypeScript workspace.
3. Implement typed interfaces before calculation details.
4. Verify solar term data source and convert fixtures into tests.
5. Build the rules-only report engine before adding AI.
