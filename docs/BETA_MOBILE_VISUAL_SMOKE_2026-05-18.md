# Beta Mobile Visual Smoke Results

Date: 2026-05-18

Branch: `codex/phase4q-mobile-visual-smoke`

Base commit at smoke start: `3cfbfff`

Dev server URL: `http://127.0.0.1:5173/`

## Scope

This pass checks beta-facing layout and safety-copy signals after the latest wording cleanup. It is automated browser evidence, not final public-beta approval.

Checked routes:
- `/`
- `/policies/privacy`
- `/policies/refund-support`
- `/policies/usage-caution`

Checked viewports:
- `360 x 780`
- `430 x 932`
- `1280 x 800`

## Results

| Check | Result |
| --- | --- |
| Horizontal overflow on tested routes and viewports | PASS |
| Removed internal checkout wording appears in user-facing app source | PASS |
| Purchase-like CTA appears on tested routes | PASS |
| `support@example.com` appears as user-facing support contact | PASS |
| Policy draft notice appears on policy routes | PASS |
| Browser console errors during tested route pass | PASS |

## Layout Metrics

| Viewport | Route | `scrollWidth` | `clientWidth` | Result |
| --- | --- | ---: | ---: | --- |
| `360 x 780` | `/` | 345 | 345 | PASS |
| `360 x 780` | `/policies/privacy` | 345 | 345 | PASS |
| `360 x 780` | `/policies/refund-support` | 345 | 345 | PASS |
| `360 x 780` | `/policies/usage-caution` | 345 | 345 | PASS |
| `430 x 932` | `/` | 415 | 415 | PASS |
| `430 x 932` | `/policies/privacy` | 415 | 415 | PASS |
| `430 x 932` | `/policies/refund-support` | 415 | 415 | PASS |
| `430 x 932` | `/policies/usage-caution` | 415 | 415 | PASS |
| `1280 x 800` | `/` | 1265 | 1265 | PASS |
| `1280 x 800` | `/policies/privacy` | 1280 | 1280 | PASS |
| `1280 x 800` | `/policies/refund-support` | 1280 | 1280 | PASS |
| `1280 x 800` | `/policies/usage-caution` | 1280 | 1280 | PASS |

## Safety-Copy Signals

For every tested route and viewport:
- `live checkout`, `checkout 전`, `checkout 전에`, and `사용자-facing` were not present in rendered user-facing text.
- `지금 구매`, `바로 결제`, `결제하기`, `결제 완료`, and `구매 완료` were not present.
- `support@example.com` was not present.
- No browser console error logs were captured.

## Remaining Gates

This smoke pass does not close:
- final legal/user-facing policy review.
- real support contact selection.
- final payment provider selection.
- KASI source revalidation before broader public beta expansion.
- any checkout, payment SDK, webhook, login, account, server report storage, subscription, analytics, AI interpretation, or PDF-library scope.
