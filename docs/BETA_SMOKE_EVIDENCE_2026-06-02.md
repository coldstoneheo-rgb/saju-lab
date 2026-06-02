# Beta Smoke Evidence

Date: 2026-06-02

Branch: `codex/phase5n-beta-smoke-evidence-guards`

Base commit at smoke start: `6d111ec`

Dev server URL checked: `http://127.0.0.1:5173/`

## Scope

This pass refreshes beta-readiness evidence after the calculation-coverage copy and beta-service remaining-work matrix were merged.

It is evidence for the controlled no-checkout MVP package. It is not public-beta approval, paid-launch approval, legal policy approval, broader date-range approval, or permission to add checkout, account storage, server report storage, analytics, AI interpretation, subscription, payment SDKs, webhooks, or a PDF library.

## Automated Results

| Check | Evidence | Result |
| --- | --- | --- |
| Local dev server responds | `Invoke-WebRequest http://127.0.0.1:5173/` returned `200` | PASS |
| Web beta share guard tests | `npm.cmd test --workspace @saju-lab/web` passed `12` files and `32` tests | PASS |
| Handoff placeholders remain operator-only | `apps/web/src/beta-share-guard.test.ts` | PASS |
| Tester handoff keeps MVP limits visible | `apps/web/src/beta-share-guard.test.ts` | PASS |
| Beta share checklist names forbidden scope | `apps/web/src/beta-share-guard.test.ts` | PASS |

## Product Flows Covered By Existing Automated Tests

| Flow | Existing Evidence | Status |
| --- | --- | --- |
| Known-time rules-only report generation | `packages/saju-core/src/index.test.ts` | Covered |
| Time-unknown report generation and lower-confidence handling | `packages/saju-core/src/index.test.ts`, `apps/web/src/input-validation.test.ts` | Covered |
| Boundary-date friendly error copy | `apps/web/src/friendly-error.test.ts` | Covered |
| Local free HTML export notices and filename safety | `apps/web/src/export-html.test.ts`, `apps/web/src/report-filenames.test.ts` | Covered |
| Paid detailed-report HTML preview without checkout | `apps/web/src/export-html.test.ts`, `apps/web/src/paid-readiness-copy.test.ts` | Covered |
| Policy draft routes and no placeholder support exposure in app copy | `apps/web/src/policy-pages.test.ts`, `apps/web/src/beta-launch-guard.test.ts` | Covered |
| Fixture-limited calculation coverage note | `apps/web/src/beta-launch-guard.test.ts`, `apps/web/src/export-html.test.ts` | Covered |

## Browser Evidence Boundary

The local dev server was available in this pass, but a fresh automated browser viewport measurement was not completed in the current tool environment. `npx playwright --version` failed before execution because the sandbox could not create npm cache files under `C:\Users\colds\AppData\Local\npm-cache`.

The latest recorded mobile visual evidence remains `docs/BETA_MOBILE_VISUAL_SMOKE_2026-05-18.md`. Before sending tester invites, the operator should still run the pre-beta smoke flow in `docs/BETA_OPERATOR_PACK_2026-05-18.md` against the actual target build or URL.

## Remaining Gates

This evidence does not close:
- current beta build or URL selection.
- feedback channel selection.
- target-build pre-beta smoke execution.
- real support contact selection.
- final payment provider selection.
- final legal/user-facing policy review.
- 1989-1999 non-OCR/KASI/public-data solar-term source confirmation.
- checkout, payment SDK, webhook, login, account storage, server report storage, analytics, AI interpretation, subscription, or PDF-library scope.
