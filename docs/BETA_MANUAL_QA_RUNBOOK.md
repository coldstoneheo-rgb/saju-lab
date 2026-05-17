# Beta Manual QA Runbook

Last updated: 2026-05-17

Use this runbook before sharing Saju Lab with a small beta group. This is a manual checklist, not evidence that QA has already passed.

## Scope

In scope:
- mobile-first free report generation.
- time-known and time-unknown confidence behavior.
- boundary-date error messaging.
- disclaimer and transparency visibility.
- local HTML export behavior.
- draft policy routes.
- paid readiness preview copy.

Out of scope:
- live checkout.
- payment provider integration.
- webhook handling.
- login, account storage, or saved report library.
- server-side report storage.
- AI-assisted interpretation.
- subscription or analytics.
- KASI source revalidation.

## Test Setup

1. Start the web app in the local development environment.
2. Open the app on a narrow mobile viewport first.
3. Repeat the highest-risk checks on a desktop viewport.
4. Run `npm run verify` before opening or merging a PR.

Recommended viewports:
- mobile narrow: 360 x 780.
- mobile wide: 430 x 932.
- desktop: 1280 x 800.

## Mobile Input Flow

Use the default `Asia/Seoul` timezone.

1. Enter `1990-01-01` and `10:30`.
2. Confirm the report generates without an internal error message.
3. Confirm birth date, birth time, sex, and time unknown controls are tappable.
4. Confirm the fixed timezone note is visible before report generation.
5. Confirm text does not overflow inside buttons, tabs, or report cards.

Expected result:
- the app shows a full report.
- the confidence badge is visible.
- the four-pillar summary is readable on mobile.

## Time Unknown Flow

1. Enable time unknown.
2. Confirm the time input is disabled.
3. Generate a report for `1990-01-01`.

Expected result:
- the report still generates.
- the report shows lower confidence.
- the missing birth-time note is visible before detailed interpretation.
- the time pillar is shown as unknown rather than inferred.

## Boundary-Date Error Flow

Use an implemented boundary date without birth time.

1. Enter `2024-02-04`.
2. Enable time unknown or leave birth time empty.
3. Generate the report.

Expected result:
- the app shows a friendly Korean error that birth time is required on solar-term boundary dates.
- the message does not expose raw implementation details beyond the useful correction.
- the app does not silently guess the month pillar.

## Report Safety And Transparency

Check the generated report top area before reading detailed sections.

Expected result:
- confidence and disclaimer appear before detailed report sections.
- career and finance copy is framed as trends, risks, and actions.
- transparency notes separate entered facts from inferred interpretation.
- no copy guarantees success, loss, health outcomes, legal outcomes, or investment outcomes.

## Local HTML Export

1. Generate a report.
2. Use the free report save button.
3. Open the downloaded HTML file locally.

Expected result:
- the filename does not include birth date, birth time, sex, or pillar values.
- the exported document includes the disclaimer and transparency notes.
- copy says the report was generated locally and does not imply server sync.

## Draft Policy Routes

Open:
- `/policies/privacy`
- `/policies/refund-support`
- `/policies/usage-caution`

Expected result:
- every page is reachable.
- every page says it is a draft or pre-checkout review document.
- no page exposes `support@example.com` as a real support address.
- no page says checkout is live.

## Paid Readiness Preview

Review the paid readiness panel and PDF-ready detailed report preview.

Expected result:
- the panel says it is preparation or preview, not a live purchase flow.
- no live purchase CTA appears.
- payment verification is described as metadata-only.
- birth input, calculated pillars, report body, and PDF-ready HTML are not described as provider or server payloads.
- account storage and saved report library remain out of scope.

## Stop Conditions

Stop the beta readiness pass if any of these appear:
- a live checkout or purchase button.
- real-payment language before owner approval.
- `support@example.com` exposed as a real support channel.
- copy implying account storage, saved report library, or server report history is available.
- deterministic prediction language.
- medical, legal, investment, or professional advice claims.
- unverified KASI source validation claimed as complete.
