# Beta RC Status

Date: 2026-05-18

## Summary

Saju Lab has enough automated and manual evidence to continue beta-readiness hardening, but it is not yet a public-beta-ready release candidate.

Evidence now supports:
- rules-only report generation on the current fixture-limited calculation range.
- mobile and desktop smoke checks from the Phase 4F browser QA pass.
- human-controlled Chrome confirmation for the native boundary-date error flow.
- human-controlled Chrome confirmation for local free HTML download/open behavior.
- CI verification for typecheck, tests, build, audit, and whitespace checks.

Still open:
- agent-actionable product polish before small beta sharing.
- owner/business decisions before live checkout.
- KASI source revalidation before broader date-range or public beta expansion.

## Evidence-Backed Closed Gates

| Gate | Evidence | Status |
| --- | --- | --- |
| Native boundary-date flow explains that birth time is required | `docs/BETA_HUMAN_BROWSER_QA_RESULTS_2026-05-17.md` | Closed for current Chrome QA pass |
| Free HTML export downloads and opens locally with a safe filename | `docs/BETA_HUMAN_BROWSER_QA_RESULTS_2026-05-17.md` | Closed for current Chrome QA pass |
| Boundary-date rejection and friendly error mapping are covered by tests | `apps/web/src/friendly-error.test.ts`, `packages/saju-core/src/index.test.ts` | Closed for current fixture scope |
| Free export content and safe filename behavior are covered by tests | `apps/web/src/export-html.test.ts`, `apps/web/src/report-filenames.test.ts` | Closed for current free export scope |
| No live checkout or server-storage claim appears in guarded user-facing copy | `apps/web/src/beta-launch-guard.test.ts`, `apps/web/src/paid-readiness-copy.test.ts` | Closed for current guarded copy |

## Agent-Actionable Remaining Gaps

These can be handled autonomously in small PRs without owner decisions, checkout implementation, account storage, AI, analytics, PDF libraries, or KASI source ingestion.

1. **Report Value Completeness**
   - Phase 4K surfaces action suggestions and monthly good/caution detail in the free web report and local HTML export.
   - Status: closed for the current `ReportV1` fields, with export tests protecting monthly detail and action suggestions from being silently dropped.

2. **Input And Export UX Hardening**
   - Invalid and unsupported date states need more specific pre-calculation or friendly error handling.
   - Local export should show success/failure status with an accessible live region.
   - Custom controls should have clearer keyboard focus styles.

3. **Local Trust And Asset Hygiene**
   - The app should avoid remote decorative asset requests that can weaken the local-processing trust message.
   - Next PR candidate: remove remote background image usage or replace it with local CSS/asset treatment, with a guard scan.

4. **Safety Copy Regression Sweep**
   - Runtime report copy should avoid finance-certainty phrases even when negated, to reduce safety-review noise.
   - Next PR candidate: rephrase sensitive copy and broaden runtime copy guard coverage.

5. **Beta Operator Pack**
   - Small-beta operators still need release notes, known limitations, feedback questions, and a rollback/incident checklist.

## Non-Agent Gates

These remain blocked until the owner or an external source completes them:
- real support email or support form.
- final payment provider and failure-state behavior.
- final legal/user-facing policy review.
- KASI source revalidation for embedded solar-term times before broader public beta expansion.
- any checkout, payment SDK, webhook, login, account, server report storage, subscription, analytics, AI interpretation, or PDF-library work.

## Recommended Next PR

Phase 4L should harden input and export UX before beta sharing:
- improve invalid and unsupported input correction copy.
- add accessible local export success/failure status.
- strengthen keyboard focus states for custom controls.
- remove or guard remote decorative asset requests that weaken the local-processing trust message.
