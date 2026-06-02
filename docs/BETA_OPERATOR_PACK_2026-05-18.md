# Beta Operator Pack

Date: 2026-05-18

## Purpose

Use this pack when sharing Saju Lab with a small, controlled beta group. It summarizes what the current MVP can safely demonstrate, what must be explained to testers, what feedback to collect, and when to pause the beta.

This is not a public launch checklist and does not open checkout, account storage, AI interpretation, analytics, subscription, server report storage, or PDF-library work.

## Current Beta Scope

Included:
- Korean-first free Saju report generation for the current fixture-limited date range.
- Birth date, optional birth time, sex selection, and fixed `Asia/Seoul` timezone.
- Time-unknown flow with lower confidence and visible missing-data notes.
- Confidence, disclaimer, transparency notes, four-pillar summary, monthly detail, and action suggestions.
- Login-free local HTML export with personal-data-safe filename.
- Draft policy pages for privacy, refund/support, and usage caution.
- Paid detailed-report preview and PDF-ready HTML preview, without checkout.

Not included:
- live checkout or purchase flow.
- payment provider integration, webhooks, or provider verification.
- login, account storage, saved report library, or server-side report history.
- AI-assisted interpretation.
- subscription, analytics, or automated feedback collection.
- broad date-range support beyond the current fixture-limited calculation scope.
- final legal policy copy, real support contact, or broader KASI date-range revalidation.

## Pre-Beta Operator Checks

Before inviting testers:
1. Run `npm run verify`.
2. Open the app in a normal browser and generate a known-time report.
3. Generate a time-unknown report and confirm confidence lowers.
4. Confirm `2024-02-04` without birth time shows the friendly boundary-date message.
5. Save a free HTML report and open it locally.
6. Visit `/policies/privacy`, `/policies/refund-support`, and `/policies/usage-caution`.
7. Confirm no live purchase button, real-payment language, account-storage claim, or server-report-history claim appears.
8. Tell testers that results are explanatory and for information/entertainment, not professional advice.

## Tester Instructions

Ask testers to use the service as a report-reading experience, not as a deterministic prediction tool.

Suggested tester flow:
1. Enter birth date and birth time if known.
2. If birth time is unknown, enable time-unknown mode and compare how confidence and missing-data notes change.
3. Read the top disclaimer and confidence before detailed sections.
4. Review overview, career, finance, monthly highlights, action suggestions, and transparency notes.
5. Save the local HTML report and open it from the device.
6. Open the draft policy pages and note whether the limits are understandable.

## Feedback Questions

Collect written answers to these questions:
- Which section was most useful: overview, career, finance, monthly, action suggestions, or transparency?
- Did the report feel understandable without too many difficult Saju terms?
- Did the confidence and missing-data notes make the uncertainty clear?
- Did any sentence feel too deterministic or too close to financial, medical, or legal advice?
- Was the local HTML export easy to understand and open?
- Did the paid detailed-report preview make the future paid value clear without feeling like checkout is live?
- What information would you need before trusting this as a paid one-time detailed report?
- Did anything feel confusing, too long, too vague, or unsafe?

## Stop Conditions

Pause beta sharing if any of these occur:
- a tester sees a live checkout or purchase-like button.
- the app implies account storage, saved report history, or server-side report storage is available.
- generated copy sounds like guaranteed success, guaranteed loss, diagnosis, treatment, legal advice, or investment advice.
- a boundary date silently generates a report without requiring birth time.
- local HTML export uses birth date, birth time, sex, or pillar values in the filename.
- a policy page exposes `support@example.com` as a real support address.
- the app claims broad public date coverage is complete.
- repeated testers cannot understand confidence, missing-data, or transparency notes.

## Rollback And Incident Notes

For a no-checkout MVP beta, rollback is operational:
- Stop sharing the beta link or build.
- Record the failing flow, browser, input, and screenshot if available.
- Reproduce locally before changing code.
- If the issue involves unsafe copy, remove or rephrase the copy before sharing again.
- If the issue involves calculation boundaries or KASI source confidence, keep the affected flow blocked until source validation is complete.
- If the issue involves policy/support/payment wording, do not patch in a fake support contact or payment decision. Wait for the owner decision.

## Still Required Before Wider Beta Or Checkout

- Remaining beta-service work matrix: `docs/BETA_SERVICE_REMAINING_WORK_2026-06-02.md`.
- Real support email or support form.
- Final payment provider and failure-state behavior.
- Final legal/user-facing policy review.
- broader KASI date-range revalidation before broader public beta expansion.
- Explicit approval before checkout, payment SDK, webhook, login, account, server report storage, subscription, analytics, AI interpretation, or PDF-library implementation.
