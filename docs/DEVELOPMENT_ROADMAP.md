# Saju Lab Development Roadmap

Last updated: 2026-05-26

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
- Phase 2D hardened calendrical boundary tests for Ipchun, solar month boundaries, and the current 23:00 Ja-hour day-pillar policy.
- Phase 2E expanded the verified 2024 solar-month fixture matrix while staying inside deterministic `Asia/Seoul` calculation scope.
- Phase 2B has added system/light/dark theme preferences and login-free local HTML report export for basic reports.
- Phase 3A has added a deterministic rules-only report engine with complete `ReportV1` sections.
- Phase 3B has added plain-language Korean terminology for core Saju terms and wired it into the web report and HTML export.
- Phase 3C has improved report scanning, confidence/disclaimer visibility, and the free-versus-paid report boundary.
- Phase 4A has improved mobile input hints, user-facing error messages, accessible controls, and section navigation.
- Phase 4B has added beta readiness documentation, privacy and safety notes, manual QA criteria, and clearer MVP scope limits.
- Phase 4C hardened beta CI gates for typecheck, test, build, audit, and whitespace verification.
- Phase 4D synced beta-readiness and roadmap state after recent CI and calendrical fixture hardening.
- Phase 4E added a repeatable beta manual QA runbook and launch guard coverage.
- Phase 4F completed a beta manual QA evidence pass for the current app build, with two browser-dependent checks intentionally left as PARTIAL evidence rather than overclaimed readiness.
- Phase 4G hardened automated coverage for Phase 4F QA gaps while keeping native date-input and actual download/open checks as human-controlled browser gates.
- Phase 4H synced beta readiness state after Phase 4G and turned the remaining launch blockers into explicit manual, owner, and external-source gates.
- Phase 4I recorded human-controlled Chrome evidence for the two browser-dependent QA gaps: native date-input boundary behavior and local free HTML download/open behavior.
- Phase 4J synced beta RC truth after the human QA pass and listed the remaining agent-actionable beta gaps.
- Phase 4K surfaced the full generated report value in the free web report and local HTML export.
- Phase 4L hardened invalid/unsupported input copy, export status, keyboard focus, and local asset trust.
- Phase 4M broadened runtime report safety-copy guard coverage before beta sharing.
- Phase 4N prepared the small-beta operator pack for controlled no-checkout MVP sharing.
- Phase 4O is auditing README and docs index links so beta readiness materials are easy to find.
- Phase 4P is replacing internal checkout-facing wording in beta user copy with clearer Korean phrasing.
- Phase 4Q recorded mobile visual smoke evidence for beta-facing home and policy routes.
- Phase 4R prepared the controlled beta tester handoff note.
- Phase 4S recorded the embedded solar-term source audit and kept KASI revalidation open as an external-source gate.
- Phase 4T recorded KASI 2024/2025 almanac evidence and identified one-minute mismatch rows for follow-up.
- Phase 4U aligned those mismatch rows with KASI minute values and added boundary regression coverage.
- Phase 4V switches historical fixture revalidation from brittle KASI web-image/OCR parsing to the data.go.kr `한국천문연구원_특일 정보` API collection path and records the API-supported 2000-2016 fixture plus the 1989-1999 source gap.
- Phase 5 defined the first paid upgrade path as a one-time detailed report with PDF export, while keeping payment/account work separately gated.
- Phase 5A added the paid detailed report data model, rules-only generator, and PDF-ready HTML output without checkout, login, or server storage.
- Phase 5B hardened the paid export HTML with a cover, table of contents, print-aware layout, and export-specific tests.
- Phase 5C completed paid report content depth with richer career/finance guidance, monthly cautions, and quality threshold tests.
- Phase 5D defined paid checkout readiness gates before payment, account, or server-storage work begins.
- Phase 5E validated browser print-to-PDF as the first paid detailed-report export path.
- Phase 5F drafted privacy, refund/support, and usage-caution policies before live checkout.
- Phase 5G documented payment provider candidates, failure states, and payment-data boundaries before checkout code.
- Phase 5H defined the first paid SKU data-retention boundary before checkout implementation.
- Phase 5I defined support contact and user-facing policy link structure before live checkout.
- Phase 5J scaffolded user-facing policy draft pages without opening checkout.
- Phase 5K defined checkout/session verification boundaries before payment code.

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
- Replace embedded fixture-only solar-term data with a broader verified data source before general public date coverage.
- Revisit whether 23:00 이후 자시 should roll the day pillar to the next day only after a separate product/calculation decision.

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

## Phase 2D: Calendrical Boundary Hardening

Status: Complete.

Goal: harden the fixture-limited calculation core around known boundary risks before public beta expansion.

Deliverables:
- Ipchun before, at, and after boundary regression tests.
- Solar month boundary before, at, and after regression tests.
- Test coverage for the current MVP policy that 23:00 Ja hour does not roll the day pillar to the next civil date.
- Solar-term spec and golden-fixture documentation updates for the boundary policy.

Exit Criteria:
- Boundary tests cover one minute before, exact minute, and one minute after known Ipchun and solar month boundaries.
- The 23:00 Ja-hour behavior is explicit in tests and docs.
- No broad solar-term table expansion or external data dependency is introduced in this phase.

## Phase 2E: Verified Calendrical Fixture Matrix Expansion

Status: Complete.

Goal: broaden the fixture-limited calculation core around verified 2024 solar-month boundaries before public beta expansion.

Deliverables:
- Add 2024 monthly boundary records for Cheongmyeong, Ipha, Mangjong, Soseo, Ipchu, Baengno, Hallo, Ipdong, and Daeseol.
- Add before, exact, and after boundary tests for each newly covered monthly boundary.
- Add date-only boundary rejection tests for the expanded boundary dates.
- Update fixture and solar-term documentation with source notes and scope limits.

Exit Criteria:
- Expanded 2024 boundary tests pass without changing the current 23:00 Ja-hour no-rollover policy.
- Each added boundary has a documented source note and remains limited to the current fixture range until broader KASI source coverage exists.
- `npm run verify` passes.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4D: Beta Readiness And Roadmap State Sync

Status: Complete.

Goal: keep roadmap and beta-readiness docs accurate after Phase 4C and Phase 2E, while separating safe engineering work from owner/business and external-data gates.

Deliverables:
- Mark Phase 2E complete and update current repository snapshot language.
- Distinguish automated CI gates, local verification, manual QA, owner/business gates, and external-data gates.
- Keep real support contact and final payment provider selection clearly blocked until the owner makes those decisions.
- Keep broader KASI source revalidation clearly blocked until direct source verification is completed for any expanded date range.

Exit Criteria:
- Roadmap no longer describes completed work as current.
- Immediate next actions avoid implying that checkout, provider, support, or legal decisions can be made autonomously.
- Beta readiness docs distinguish automated checks from manual, business, and external-source readiness.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4E: Beta Manual QA Runbook And Launch Guard Coverage

Status: Complete.

Goal: make beta manual QA repeatable and strengthen guard coverage around the no-live-checkout launch boundary.

Deliverables:
- Add a focused beta manual QA runbook covering mobile input, time unknown behavior, boundary-date errors, report safety, local HTML export, policy draft routes, and paid readiness copy.
- Update the beta checklist to reference the runbook without claiming QA has passed.
- Add lightweight guard coverage for no live purchase CTA, no placeholder support exposure, no account/server-storage claims, and metadata-only checkout verification.

Exit Criteria:
- Another agent or human can execute beta manual QA without reconstructing expected behavior from scattered docs.
- Guard tests fail if user-facing readiness copy exposes live checkout, placeholder support contact, account/storage claims, or report payload checkout fields.
- `npm run verify` passes.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4F: Beta Manual QA Evidence Pass

Status: Complete.

Goal: execute the beta manual QA runbook against the current app build and record concrete pass/fail evidence without changing owner/business or external-source gates.

Deliverables:
- Add a dated beta manual QA results document.
- Record tested viewports, input flows, policy routes, paid readiness copy, and launch-boundary checks.
- Update the beta checklist to point to the latest QA evidence.
- Keep any objective fixes narrow and tied to a documented QA finding.

Exit Criteria:
- QA evidence distinguishes passed checks, partial checks, owner decisions, and external source gates.
- Boundary-date, support-contact, payment-provider, and KASI-source limitations are not overclaimed.
- `npm run verify` passes after the evidence document is added.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

Completion Note:
- The evidence pass recorded two intentional PARTIAL checks: native date-input boundary UI and real downloaded HTML open behavior. Those remain human-controlled browser QA gates before beta distribution.

## Phase 4G: Beta QA Gap Hardening And 4F Closure

Status: Complete.

Goal: add targeted automated support evidence for Phase 4F gaps and clarify that human-controlled browser QA is still required for native date input and actual local file download/open.

Deliverables:
- Extract friendly error mapping into a tested web helper.
- Export and test free report HTML generation for disclaimer, transparency, local-processing copy, safe filename, and unknown birth-time visibility.
- Update beta QA docs to distinguish automated support coverage from remaining human browser confirmation.

Exit Criteria:
- Boundary-date friendly error mapping has direct test coverage.
- Free HTML export content and filename safety have direct test coverage.
- Docs still require human-controlled browser confirmation for native date input and downloaded-file open behavior.
- `npm run verify` passes.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4H: Beta Readiness State Sync And Manual Gate Closure Plan

Status: Complete.

Goal: align roadmap and beta readiness docs after Phase 4G so the project can move forward without mistaking automated support coverage for beta launch readiness.

Deliverables:
- Mark Phase 4G complete after PR review and merge.
- Reframe immediate next actions around the remaining human browser checks, owner/business decisions, and KASI source revalidation.
- Keep beta checklist wording clear that automated coverage supports, but does not complete, the open manual QA gates.

Exit Criteria:
- Roadmap no longer lists Phase 4G PR review as pending.
- Immediate next actions identify the native date-input and downloaded HTML checks as human-controlled browser work.
- Owner support contact, payment provider, legal policy review, and external KASI revalidation remain open gates.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4I: Human Browser QA Evidence Closure

Status: Complete.

Goal: close the two browser-dependent QA evidence gaps that could not be completed in the Codex in-app browser.

Deliverables:
- Record human-controlled Chrome evidence for the native `type=date` boundary-date flow.
- Record human-controlled Chrome evidence for free HTML download and local-open behavior.
- Update beta readiness checklist to mark only those two browser-dependent gates complete.

Exit Criteria:
- Boundary-date `2024-02-04` with missing birth time shows friendly Korean birth-time-required copy in a human-controlled browser.
- Free HTML export downloads, opens locally, uses a personal-data-safe filename, and includes disclaimer, transparency, and local-processing copy.
- Owner/business gates and KASI source revalidation remain open and are not overclaimed.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4J: Beta RC Truth Sync

Status: Complete.

Goal: summarize the current beta release-candidate truth after Phase 4I and identify which remaining gaps can be safely handled by autonomous implementation agents.

Deliverables:
- Add a dated beta RC status document.
- Link the RC status from the beta readiness checklist.
- Separate evidence-backed closed gates, agent-actionable product gaps, owner/business gates, and KASI source gates.
- Recommend the next implementation PR without opening checkout, account, server-storage, AI, analytics, PDF-library, or KASI ingestion scope.

Exit Criteria:
- Beta readiness docs no longer mix agent-actionable polish with owner/business or external-source decisions.
- Phase 4I is marked complete without claiming full public beta readiness.
- The next agent-actionable PR is clear enough to start without re-reading all QA history.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4K: Report Value Completeness

Status: Complete.

Goal: make the free web report and local HTML export show the generated `ReportV1` value users need before beta sharing.

Deliverables:
- Add visible monthly good/caution detail to the free web report.
- Add visible `행동 제안` groups to the free web report.
- Include monthly detail and action suggestions in the free local HTML export.
- Add export tests so generated monthly and action fields are not silently dropped.

Exit Criteria:
- `ReportV1.monthly.goodMonths` and `ReportV1.monthly.cautionMonths` are visible in the free web report and local HTML export.
- `ReportV1.actionSuggestions` groups are visible in the free web report and local HTML export.
- Beta readiness docs mark the report-value gap closed without claiming owner/business or external-source gates are complete.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4L: Input Export Accessibility Hardening

Status: Complete.

Goal: reduce beta friction in the free report flow without changing calculation rules or opening paid/account/server scope.

Deliverables:
- Add pre-calculation validation for empty, malformed, or impossible birth dates and malformed times.
- Expand friendly unsupported-range error mapping.
- Add accessible local export success/failure status.
- Add visible keyboard focus styles for custom controls and primary actions.
- Remove remote decorative background image requests that weaken the local-processing trust message.

Exit Criteria:
- Invalid date, invalid time, unsupported-range, and boundary-date errors use specific user-facing Korean copy.
- Free local export reports success or failure through an accessible live region.
- Theme, time-unknown, sex, navigation, and action controls have visible focus states.
- The web shell no longer loads a remote decorative background asset.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4M: Report Safety Copy Guard Sweep

Status: Complete.

Goal: reduce beta safety-review noise by keeping generated free report copy away from deterministic finance or success claims while preserving clear disclaimers.

Deliverables:
- Rephrase runtime report copy that used finance-certainty examples even in negated form.
- Keep professional advice disclaimers visible without turning examples into claim-like phrases.
- Add generated free-report tests that fail if deterministic finance/success phrases return.
- Sync Korean i18n mirror copy for changed report rules.

Exit Criteria:
- Generated `ReportV1` copy does not contain deterministic finance/success phrases such as `확정 수익`, `무조건 성공`, or `반드시 성공`.
- Disclaimers still state that the report is information/entertainment and not financial, medical, or legal advice.
- Beta readiness docs mark the safety-copy gap closed without claiming public-beta readiness.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4N: Small-Beta Operator Pack

Status: Complete.

Goal: prepare controlled beta sharing materials so the MVP can be tested without implying public launch readiness or opening paid/account/server scope.

Deliverables:
- Add a small-beta operator pack with current scope, known limitations, tester instructions, feedback prompts, stop conditions, and rollback notes.
- Link the operator pack from beta readiness and RC status docs.
- Keep owner/business, legal, payment, support, and KASI gates explicitly open.

Exit Criteria:
- Operators can understand what the current MVP can safely demonstrate.
- Testers can be guided through report generation, time-unknown behavior, local export, and draft policy pages.
- Stop conditions cover unsafe copy, checkout/account/storage claims, filename privacy, boundary-date failures, fake support contact exposure, and KASI overclaims.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4O: Documentation Index And Beta Link Audit

Status: Complete.

Goal: make the current beta-readiness and operator materials discoverable from the repository entry points without overstating launch readiness.

Deliverables:
- Add a docs index that groups product, beta-readiness, calculation, UI, paid-service, and policy documents.
- Update the root README documentation list to link the docs index and current beta-readiness materials.
- Keep owner/business, legal, payment, support, and KASI gates explicitly open.

Exit Criteria:
- A new agent can find the beta readiness checklist, RC status, operator pack, and QA evidence from README or the docs index.
- The docs index distinguishes controlled no-checkout MVP readiness from public launch approval.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4P: Beta User Copy Koreanization

Status: Complete.

Goal: make beta-facing policy and paid-readiness copy easier for Korean users to understand by removing internal checkout and user-facing jargon.

Deliverables:
- Replace visible `live checkout`, `checkout 전`, and `사용자-facing` wording in app copy with plain Korean alternatives.
- Update copy guard tests so internal checkout jargon does not return to user-facing readiness or policy pages.
- Keep paid-readiness meaning intact: no live purchase flow, no account storage, no server report storage, and no final legal/support/payment claims.

Exit Criteria:
- Policy and paid-readiness copy reads as Korean-first user guidance rather than internal implementation notes.
- Guard tests fail if the removed internal phrases return to user-facing copy.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4Q: Mobile Visual Smoke Evidence

Status: Complete.

Goal: record a lightweight browser evidence pass for the beta-facing home and policy routes before sharing with testers.

Deliverables:
- Add a dated mobile visual smoke results document with tested routes, viewports, layout metrics, safety-copy checks, and remaining gates.
- Link the smoke evidence from the beta readiness checklist and docs index.
- Keep this as automated browser evidence rather than public-beta approval.

Exit Criteria:
- Home and policy routes show no horizontal overflow in the tested mobile and desktop viewports.
- Rendered beta-facing text avoids live-purchase CTA, placeholder support contact, and internal checkout wording.
- No browser console errors are captured during the tested route pass.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4R: Beta Tester Handoff Note

Status: Complete.

Goal: package the controlled small-beta tester instructions into one short handoff note that can be sent after the operator fills the current build or URL.

Deliverables:
- Add a dated beta tester handoff note with current target placeholder, tester message, suggested flow, feedback questions, stop conditions, and evidence links.
- Link the handoff note from the beta readiness checklist, RC status, and docs index.
- Reframe immediate next actions around owner, legal, payment, support, and KASI gates.

Exit Criteria:
- Operators can hand testers one concise note without reconstructing instructions from the operator pack and QA docs.
- The note clearly says the current MVP does not include checkout, account storage, server report storage, subscription, analytics, AI interpretation, or final PDF-library scope.
- The note does not claim public-beta readiness, legal approval, real support contact selection, payment provider selection, or KASI source revalidation.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4S: Solar-Term Source Audit And KASI Revalidation Prep

Status: Complete.

Goal: make the current embedded solar-term boundary table auditable before broader public beta expansion, without claiming KASI source revalidation is complete.

Deliverables:
- Add a dated solar-term source audit document that lists each embedded boundary minute, current use, source status, and KASI revalidation need.
- Define source-status terms so `fixture-limited`, `public-table fixed`, `needs KASI revalidation`, and `KASI revalidated` are not mixed.
- Update fixture, solar-term spec, and beta-readiness docs to avoid overclaiming KASI verification.
- Add targeted automated coverage that keeps the documented 2024 boundary inventory aligned with the embedded table.

Exit Criteria:
- `docs/SOLAR_TERM_SOURCE_AUDIT_2026-05-25.md` exists and records the current embedded boundary inventory.
- Related docs continue to mark KASI source revalidation as open before broader public beta or wider date-range support.
- Existing boundary behavior remains unchanged.
- No broad solar-term ingestion, date-range expansion, checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4T: KASI Solar-Term Revalidation Evidence Pass

Status: Complete.

Goal: compare the current embedded 2024 solar-month boundary matrix and 2025 upper-boundary guard records against official KASI almanac PDFs without changing calculation behavior while mismatch rows remain unresolved.

Deliverables:
- Add a dated KASI evidence document for the 2024 and 2025 official almanac PDF comparison.
- Record source URLs, access date, extraction method, timezone evidence, and row-level match status.
- Identify the 1-minute mismatch rows for 2024 경칩, 2024 망종, 2024 한로, and 2025 소한.
- Update source-audit, fixture, readiness, RC status, docs index, and roadmap docs so the external-source gate stays open until the mismatches are resolved.

Exit Criteria:
- `docs/KASI_SOLAR_TERM_REVALIDATION_2026-05-25.md` exists and records the evidence pass.
- Matching rows are distinguished from mismatch rows without claiming broad date-range revalidation.
- Existing calculation behavior and boundary tests remain unchanged in this evidence-only PR.
- No broad solar-term ingestion, date-range expansion, checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4U: KASI Boundary Alignment

Status: Complete.

Goal: align the four KASI mismatch rows from Phase 4T with official almanac minute values while keeping the supported date range unchanged.

Deliverables:
- Update 2024 경칩, 2024 망종, 2024 한로, and 2025 소한 embedded boundary minutes to KASI values.
- Shift before, exact, and after boundary tests for the changed 2024 rows.
- Add before, exact, and after boundary coverage for the 2025 소한 upper-boundary guard.
- Update source-audit, KASI evidence, fixture, readiness, RC status, and roadmap docs to mark only the embedded 2024 matrix and 2025 upper-boundary guards as resolved.

Exit Criteria:
- `packages/saju-core/src/solar-terms.ts` matches the KASI evidence rows for the embedded 2024 matrix and 2025 upper-boundary guards.
- Boundary tests prove that the old mismatch minute is now the previous month and the KASI minute is the exact transition.
- Docs avoid claiming broad date-range support or full historical KASI ingestion.
- No broad solar-term ingestion, date-range expansion, checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 4V: Public Data Solar-Term Collection Path

Status: Complete for the API-supported 2000-2016 range; 1989-1999 remains an external-source gap.

Goal: replace the abandoned historical almanac image/OCR approach with a repeatable data.go.kr API collection path for historical 24절기 records.

Deliverables:
- Add a standard-library collection script for `SpcdeInfoService/get24DivisionsInfo`.
- Support service keys through local environment variables or ignored key files without committing secrets.
- Normalize API rows to `YYYY-MM-DDTHH:mm` KST and compare them against the embedded `SOLAR_MONTH_BOUNDARIES` table.
- Generate and review the API-supported `docs/fixtures/kasi-special-days-solar-terms-2000-2016.json` fixture.
- Document the API's 1989-1999 zero-record responses and keep those rows open until a separate approved source is chosen.

Exit Criteria:
- `python scripts/collect_public_data_solar_terms.py` generates `docs/fixtures/kasi-special-days-solar-terms-2000-2016.json` with complete per-year checks.
- Embedded rows in the 2000-2016 API-supported range are marked revalidated only if the generated fixture comparison reports matches.
- The observed 2000 소한 and 2010 소서 minute mismatches are resolved with calculation data and evidence docs in the same PR.
- A 1989-2016 run remains a source-availability probe and fails completeness until a pre-2000 source is approved.
- No broad date-range expansion, checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

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

## Phase 4C: Beta CI And Verification Gate Hardening

Status: Complete.

Goal: turn beta-readiness verification commands into automated pull-request gates without expanding product scope.

Deliverables:
- CI build gate.
- CI moderate audit gate.
- CI whitespace gate via `git diff --check`.
- Root `npm run verify` script matching the local verification flow.
- Beta checklist update distinguishing automated CI checks from manual QA.

Exit Criteria:
- GitHub Actions runs install, typecheck, test, build, audit, and whitespace checks.
- Local `npm run verify` runs typecheck, test, build, audit, and whitespace checks in order.
- Docs clearly identify which beta checks are automated and which remain manual.
- No checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

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

Status: Complete.

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

## Phase 5B: PDF Export Hardening

Status: Complete.

Goal: make the paid detailed report export read like a real product document before checkout work starts.

Deliverables:
- Separate paid export HTML builder that can be tested directly.
- Cover page metadata with generated time, confidence, birth-time state, and export format.
- Table of contents for core paid sections.
- A4-oriented print CSS with section break protection.
- Export tests for required notices, input summary, privacy/scope note, and unknown birth-time handling.

Exit Criteria:
- Paid export HTML includes cover, table of contents, input summary, pillar summary, paid sections, glossary, and transparency appendix.
- The saved document keeps birth data inside the document while keeping the filename generation-date based.
- Unknown birth time remains visible in the saved document.
- No PDF library, checkout, login, account storage, or server storage is introduced.

## Phase 5C: Paid Content Quality

Status: Complete.

Goal: make the paid detailed report feel meaningfully deeper than the free report.

Deliverables:
- Stronger career role-fit, work-style, risk, and action-plan copy.
- Stronger finance rhythm, risk checklist, and planning prompt copy.
- Monthly themes with both action and caution fields.
- Content quality tests for minimum section density and missing birth-time caution.
- Safety checks that paid copy does not imply deterministic outcomes or professional advice.

Exit Criteria:
- Paid sections have summaries and at least three practical items where appropriate.
- Career and finance sections include both risk and action-oriented guidance.
- Monthly paid themes include `theme`, `action`, and `caution`.
- Birth-time unknown cases visibly lower confidence and warn against overreading detailed timing.
- No checkout, login, account storage, server storage, AI interpretation, or PDF library is introduced.

## Phase 5D: Paid Checkout Readiness Gates

Status: Complete.

Goal: make the paid-product launch gates explicit before checkout or account work starts.

Deliverables:
- Checkout-readiness document covering privacy, refund/contact, usage caution, payment provider, data retention, and support gates.
- Paid PRD update that names the readiness document as the source of truth.
- Mobile paid-upgrade panel copy that avoids live-purchase language while explaining the trust gates.
- Clear first-SKU boundary: one-time local-download detailed report, no account storage, no saved report library.

Exit Criteria:
- Checkout cannot start without written decisions for privacy, refund/contact, payment provider, data retention, and support path.
- The app does not show a live purchase CTA or imply that payment is available.
- The paid preview explains account-free local-download direction and policy readiness.
- No checkout, login, account storage, server storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 5E: PDF Export Spike

Status: Complete.

Goal: validate the first paid detailed-report export path as a browser print-to-PDF flow before checkout starts.

Deliverables:
- PDF export spike document covering the export decision, manual QA checklist, and failure criteria.
- Paid export HTML with visible PDF save guidance.
- Mobile paid preview copy that describes PDF-ready HTML without implying live checkout.
- Export tests that protect the PDF save guide, required notices, input summary, and personal-data-safe filename.

Exit Criteria:
- Users can understand that the saved paid document is opened in the browser and saved as PDF through print.
- The export includes cover, table of contents, input summary, pillar summary, paid sections, monthly cautions, glossary, print guide, and transparency appendix.
- The filename remains generated-date based and excludes birth data.
- No checkout, login, account storage, server storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 5F: Policy Drafts For Paid Launch

Status: Complete.

Goal: prepare minimum policy drafts before live checkout work starts.

Deliverables:
- Privacy draft covering birth data, generated reports, support messages, local downloads, and open retention decisions.
- Refund/support draft covering payment failure, duplicate charge, download failure, and support path requirements.
- Usage-caution draft covering informational scope, no deterministic predictions, and no professional-advice boundary.
- Checkout-readiness update that marks policy drafts complete while keeping payment provider, data retention, and support contact open.
- Paid readiness copy that mentions policy-draft readiness without implying live checkout.

Exit Criteria:
- `docs/policies/PRIVACY_DRAFT.md`, `docs/policies/REFUND_AND_SUPPORT_DRAFT.md`, and `docs/policies/USAGE_CAUTION_DRAFT.md` exist.
- Checkout readiness distinguishes drafted policy gates from unresolved launch gates.
- The app still does not show purchase, checkout, account, server-storage, or subscription behavior.
- No payment provider SDK, login, account storage, server storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 5G: Payment Provider Decision And Failure States

Status: Complete.

Goal: document payment provider candidates, failure states, and data boundaries before checkout code starts.

Deliverables:
- Payment provider decision draft comparing Stripe Checkout, PortOne, and Toss Payments.
- Failure-state checklist for payment failure, report generation failure, download failure, duplicate payment, abandoned return, verification failure, and provider outage.
- Explicit rule that birth input, calculated pillars, report body, and PDF-ready HTML must not be sent to the payment provider.
- Checkout-readiness update that distinguishes provider decision draft from final provider selection.
- Paid readiness copy that mentions failure-state preparation without implying live checkout.

Exit Criteria:
- `docs/PAYMENT_PROVIDER_DECISION.md` exists and includes provider candidates, selection criteria, failure states, and data-retention impact.
- Checkout readiness marks provider candidates/failure states as documented while keeping final provider and data retention open.
- The app still does not show purchase, checkout, account, server-storage, or subscription behavior.
- No checkout code, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 5H: Data Retention Final Decision

Status: Complete.

Goal: define what the first paid SKU may store before checkout implementation starts.

Deliverables:
- Data-retention decision document covering forbidden server-stored report data and allowed order/payment records.
- Scenario boundaries for pre-payment generation, post-payment generation, abandoned payment return, download failure, duplicate payment, refunds, and support inquiries.
- Checkout-readiness update that closes the data-retention gate while keeping final provider, support contact, and user-facing policy links open.
- Paid readiness copy that explains birth information and report body are not sent to the payment provider or stored server-side.
- Data-retention guard test covering forbidden report payload and allowed order record fields.

Exit Criteria:
- `docs/DATA_RETENTION_DECISION.md` exists and defines the first paid SKU retention boundary.
- Birth input, calculated pillars, report body, and PDF-ready HTML are excluded from server-side storage by default.
- Payment/order records are limited to identifiers, SKU, price, currency, payment status, provider events, timestamps, and refund/support status.
- No checkout code, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 5I: Support Contact And Policy Links

Status: Complete.

Goal: define the support contact and user-facing policy link structure before live checkout.

Deliverables:
- Support and policy link structure document with candidate policy paths and support-contact placement.
- Policy draft updates that name candidate user-facing paths.
- Checkout-readiness update that marks link structure documented while keeping real support contact and legal/user-facing final copy open.
- Paid readiness copy that mentions policy link structure and support-contact replacement without exposing placeholder support as real.
- Policy link guard test covering candidate paths and placeholder replacement requirement.

Exit Criteria:
- `docs/SUPPORT_AND_POLICY_LINKS.md` exists and defines policy paths for privacy, refund/support, and usage caution.
- `support@example.com` is explicitly marked as a placeholder that must be replaced before checkout.
- The app does not expose placeholder support contact as a real support address.
- No checkout code, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 5J: User-Facing Policy Page Scaffold

Status: Complete.

Goal: make the planned policy paths reachable in the app as draft user-facing pages before live checkout.

Deliverables:
- Policy page copy/data for `/policies/privacy`, `/policies/refund-support`, and `/policies/usage-caution`.
- Mobile-first policy page rendering that reuses the existing app shell, theme preference, and card styles.
- Paid readiness links that point to draft policy pages without implying checkout is open.
- Policy page tests covering planned paths, draft status, placeholder support-email non-exposure, no live purchase CTA, and usage-scope safety language.

Exit Criteria:
- The three planned policy paths render draft pages in Korean.
- Pages clearly state that they are pre-checkout drafts and not final legal policies.
- The app does not expose `support@example.com` as a real support address.
- No checkout code, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

## Phase 5K: Checkout Session Verification Blueprint

Status: Complete.

Goal: define how a paid checkout session should be verified before unlocking a local paid-report download.

Deliverables:
- Checkout/session verification blueprint covering before-payment, during-payment, and after-return states.
- Allowed checkout/session and verification fields.
- Forbidden checkout payload fields for birth input, calculated pillars, report body, and PDF-ready HTML.
- Failure handling for payment failure, missing return, verification failure, download failure, duplicate payment, and refund requests.
- Checkout verification guard test covering metadata-only verification, forbidden report payload, and disabled live checkout.

Exit Criteria:
- `docs/CHECKOUT_SESSION_VERIFICATION.md` exists and defines the verification flow.
- App guard data keeps checkout/session verification limited to payment metadata.
- The paid readiness copy explains that payment verification should not transmit Saju report data.
- No checkout code, payment SDK, webhook, login, account storage, server report storage, AI interpretation, subscription, analytics, or PDF library is introduced.

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

1. Operator action required: fill the current beta build or URL in `docs/BETA_TESTER_HANDOFF_2026-05-24.md` before sending invites.
2. Owner decision required: replace placeholder support contact with a real support email or form before live checkout.
3. Owner/business decision required: choose the final payment provider only after settlement, receipt, support, and retention needs are clear.
4. Final legal/user-facing policy review remains required before checkout opens.
5. External source gate: keep older fixture-limited rows and any future broader solar-term table out of public date coverage until they have direct source, update, and regression-test notes.
6. Keep account and saved report storage out of the first paid SKU unless the product intentionally moves to subscription.
