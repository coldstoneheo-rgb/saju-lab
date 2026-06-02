# Beta RC Status

Date: 2026-05-18

## Summary

Saju Lab has enough automated and manual evidence to continue beta-readiness hardening, but it is not yet a public-beta-ready release candidate.

Evidence now supports:
- rules-only report generation on the current fixture-limited calculation range.
- mobile and desktop smoke checks from the Phase 4F browser QA pass.
- post-PR #47 automated beta smoke evidence and share-guard checks.
- human-controlled Chrome confirmation for the native boundary-date error flow.
- human-controlled Chrome confirmation for local free HTML download/open behavior.
- CI verification for typecheck, tests, build, audit, and whitespace checks.

Still open:
- agent-actionable product polish before small beta sharing.
- owner/business decisions before live checkout.
- older fixture-limited KASI revalidation before broader date-range or public beta expansion.

## Evidence-Backed Closed Gates

| Gate | Evidence | Status |
| --- | --- | --- |
| Native boundary-date flow explains that birth time is required | `docs/BETA_HUMAN_BROWSER_QA_RESULTS_2026-05-17.md` | Closed for current Chrome QA pass |
| Free HTML export downloads and opens locally with a safe filename | `docs/BETA_HUMAN_BROWSER_QA_RESULTS_2026-05-17.md` | Closed for current Chrome QA pass |
| Boundary-date rejection and friendly error mapping are covered by tests | `apps/web/src/friendly-error.test.ts`, `packages/saju-core/src/index.test.ts` | Closed for current fixture scope |
| Free export content and safe filename behavior are covered by tests | `apps/web/src/export-html.test.ts`, `apps/web/src/report-filenames.test.ts` | Closed for current free export scope |
| No live checkout or server-storage claim appears in guarded user-facing copy | `apps/web/src/beta-launch-guard.test.ts`, `apps/web/src/paid-readiness-copy.test.ts` | Closed for current guarded copy |
| Tester handoff placeholders and MVP limits remain visible before sharing | `apps/web/src/beta-share-guard.test.ts`, `docs/BETA_SHARE_CHECKLIST.md` | Closed for current no-checkout beta package |

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
   - Phase 4N adds release notes, known limitations, feedback questions, and a rollback/incident checklist for controlled small-beta sharing.
   - Status: closed for the current no-checkout MVP beta package.

6. **Mobile Visual Smoke**
   - Phase 4Q records browser layout metrics for beta-facing home and policy routes across mobile and desktop viewports.
   - Status: closed for the current tested routes and viewports, without claiming public-beta approval.

7. **Beta Tester Handoff**
   - Phase 4R adds a short tester handoff note with build/URL placeholder, tester flow, feedback questions, stop conditions, and current MVP limits.
   - Status: closed for the current controlled no-checkout MVP handoff package.

## Non-Agent Gates

These remain blocked until the owner or an external source completes them:
- real support email or support form.
- final payment provider and failure-state behavior.
- final legal/user-facing policy review.
- KASI source revalidation for older fixture-limited rows before broader public beta expansion.
- any checkout, payment SDK, webhook, login, account, server report storage, subscription, analytics, AI interpretation, or PDF-library work.

## Recommended Next PR

Current remaining beta-service work is tracked in `docs/BETA_SERVICE_REMAINING_WORK_2026-06-02.md`.

Next work is blocked mostly on operator, owner, or external-source gates:
- fill the beta tester handoff build or URL before sending invites.
- replace the tester feedback-channel placeholder before sending invites.
- run the pre-beta smoke flow in `docs/BETA_OPERATOR_PACK_2026-05-18.md` and `docs/BETA_SHARE_CHECKLIST.md` against the target build before sending invites.
- choose a real support email or support form before live checkout.
- select the final payment provider only after settlement, receipt, support, and retention requirements are clear.
- complete final legal/user-facing policy review before checkout opens.
- keep older fixture-limited rows out of broad public date coverage until they are revalidated against KASI source data.
