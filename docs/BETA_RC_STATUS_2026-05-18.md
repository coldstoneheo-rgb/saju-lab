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
   - Phase 4L adds pre-calculation birth-date/time validation, broader unsupported-range friendly error mapping, accessible local export status, and clearer keyboard focus styles.
   - Status: closed for the current MVP input/export surface.

3. **Local Trust And Asset Hygiene**
   - Phase 4L removes the remote decorative background image request and uses local CSS backgrounds instead.
   - Status: closed for the current web shell.

4. **Safety Copy Regression Sweep**
   - Phase 4M rephrases sensitive runtime report copy and adds generated-report guard coverage against deterministic finance/success claims.
   - Status: closed for the current free report generator.

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

Phase 4N should prepare a small-beta operator pack before sharing:
- release notes for the current MVP scope.
- known limitations and still-open owner/KASI gates.
- beta tester feedback prompts.
- rollback and incident notes for a no-checkout MVP.
