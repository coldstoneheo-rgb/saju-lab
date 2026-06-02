# Beta Service Remaining Work

Date: 2026-06-02

This document lists the remaining work before sharing Saju Lab as a controlled small beta. It separates work that implementation agents can safely handle from work that requires the owner, an operator, legal review, or an external source.

This is not public-beta approval, paid-launch approval, or permission to add checkout, login, account storage, server report storage, analytics, AI interpretation, subscription, payment SDKs, webhooks, or a PDF library.

## Current State

Saju Lab is close to a controlled no-checkout beta for a small tester group.

Evidence-backed strengths:
- mobile-first Korean report flow exists.
- known-time and time-unknown report generation are supported.
- confidence, missing birth-time notes, disclaimer, transparency notes, local processing, and MVP calculation-range limits are visible.
- free local HTML export uses a personal-data-safe filename.
- paid detailed-report preview and PDF-ready HTML preview exist without checkout.
- draft policy pages exist and remain clearly pre-checkout drafts.
- CI verifies install, typecheck, tests, build, audit, and whitespace.

Current beta posture:
- suitable for a controlled small beta after operator target setup and final smoke pass.
- not suitable for public beta or paid launch.
- not suitable for broader date-range claims.

## Priority 1: Required Before Sending Small-Beta Invites

| Owner | Task | Why It Matters | Current Status |
| --- | --- | --- | --- |
| Operator | Fill the current beta build or URL in `docs/BETA_TESTER_HANDOFF_2026-05-24.md`. | Testers need one unambiguous target. | Open |
| Operator | Run the pre-beta smoke flow in `docs/BETA_OPERATOR_PACK_2026-05-18.md`. | Confirms the shared build matches the documented MVP behavior. | Open |
| Operator | Confirm the feedback channel and replace `[피드백 채널 입력]` in the tester message. | Testers need a safe place to send feedback without sharing report contents publicly. | Open |
| Operator | Confirm that tester instructions include the current MVP limits. | Prevents confusion around payment, account storage, AI, and broad date coverage. | Open |

## Priority 2: Agent-Actionable Hardening

These can be handled by implementation agents in future PRs without opening checkout or expanding calculation coverage.

| Task | Suggested Next PR Shape | Notes |
| --- | --- | --- |
| Refresh beta QA evidence after PR #46. | Run the current app through the beta smoke checklist and add a dated evidence doc. | Useful after the Vitest upgrade and calculation coverage copy change. |
| Add automated checks for tester-handoff placeholders. | Guard that the handoff still names unresolved placeholders and does not expose fake support as real. | Prevents accidental invite copy drift. |
| Add a compact beta share checklist to README/docs index. | Link the remaining-work matrix, operator pack, handoff note, and readiness checklist. | Helps future sessions find the launch materials quickly. |
| Improve mobile visual evidence for the calculation coverage note. | Record a new visual smoke result including the Phase 5L coverage card. | Builds confidence before external testers see it. |

## Priority 3: Owner Or Business Decisions

These must not be resolved autonomously.

| Decision | Required Before | Notes |
| --- | --- | --- |
| Real support email or support form | Live checkout and broader tester support | `support@example.com` remains a placeholder only. |
| Final payment provider | Any checkout implementation | Provider choice must account for settlement, receipts, refunds, and support handling. |
| Final user-facing legal/policy review | Live checkout or public beta | Current policy pages are drafts. |
| Whether account/saved report storage belongs in scope | Any login or saved-report implementation | Current first paid SKU remains local-download first. |

## Priority 4: External Source Gates

| Gate | Why It Remains Open |
| --- | --- |
| 1989-1999 solar-term records need an approved non-OCR source or KASI/public-data confirmation path. | The approved data.go.kr API returns no records for those years. |
| Any broader solar-term table needs source, update, and regression-test notes. | The app must not imply broad date coverage before evidence exists. |

## Explicitly Out Of Scope Until Approved

- checkout or live purchase buttons.
- payment SDKs, webhooks, or payment-provider verification code.
- login, account storage, saved report library, or server-side report history.
- analytics or automated feedback collection.
- AI-assisted interpretation.
- subscription products.
- server-side storage of birth input, calculated pillars, report body, or PDF-ready HTML.
- PDF library integration.
- broad date-range claims beyond the currently documented fixture-limited scope.

## Recommended Next Step

Before inviting testers, the next safest implementation PR is a **post-PR #46 beta smoke evidence refresh**:

1. Run `npm run verify`.
2. Open the app in a normal browser or controlled browser session.
3. Check known-time report generation, time-unknown report generation, local HTML export copy, policy draft routes, paid readiness copy, and the calculation coverage note.
4. Record results in a dated evidence document.
5. Update `docs/BETA_READINESS_CHECKLIST.md` only for checks that have direct evidence.
