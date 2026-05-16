# Paid Checkout Readiness

Saju Lab should not introduce checkout until the first paid SKU has clear trust, privacy, refund, and data-retention boundaries. This document defines the gates that must be satisfied before payment provider integration, login, account storage, or server-side report history begins.

## Product Boundary

The first paid SKU is a one-time detailed report for the user's current birth input.

Included:
- deeper career and finance interpretation
- yearly and monthly structure with cautions
- action planning prompts
- polished PDF-ready export
- transparency appendix and disclaimer

Excluded before a separate decision:
- subscription billing
- account login
- saved report library
- server-side report history
- AI-assisted interpretation
- deterministic prediction claims
- professional investment, medical, legal, or psychological advice

## Required Gates

Checkout work can start only after every gate below has an owner and a written decision.

| Gate | Required decision | Minimum acceptance |
| --- | --- | --- |
| Privacy policy | How birth data, generated reports, device data, and support messages are handled | Draft exists at `docs/policies/PRIVACY_DRAFT.md`; final policy must be readable before payment |
| Refund/contact policy | Refund window, support channel, response expectation, and failed-download handling | Draft exists at `docs/policies/REFUND_AND_SUPPORT_DRAFT.md`; real support path is still required |
| Usage caution or terms | Informational/entertainment-oriented scope and no professional-advice boundary | Draft exists at `docs/policies/USAGE_CAUTION_DRAFT.md`; paid copy must not imply stronger certainty |
| Payment provider | Provider, currency, receipt handling, and failure-state behavior | Decision draft exists at `docs/PAYMENT_PROVIDER_DECISION.md`; final provider remains open |
| Data retention | Whether reports are generated locally, server-side, or hybrid | Decision exists at `docs/DATA_RETENTION_DECISION.md`; exact legal retention periods still need user-facing policy links |
| Customer support path | Email or form destination for payment/report issues | The support path is available before money is collected |

## Recommended Phase 5D Baseline

Until the gates are complete, the app may show a paid detailed-report preview and a readiness note, but it should not show a live purchase button.

The preview may say:
- the detailed report is being prepared as a one-time paid product.
- account storage is not included in the first SKU.
- the report is designed for local download.
- policy, refund/contact, payment provider, and data-retention decisions must be ready before checkout opens.

The preview must not say:
- payment is available now.
- the report guarantees success, exact money outcomes, health events, legal outcomes, or relationship outcomes.
- payment increases prediction certainty.
- the product replaces professional advice.

## Data Handling Decision Draft

Preferred first-SKU direction:
- Generate the free report in the browser.
- Keep the no-login experience.
- Keep the paid report as a local download artifact unless checkout requirements force a server step.
- Avoid saved report history until subscription or account scope is intentionally approved.

Open decision:
- If a payment provider requires server-side order verification, decide whether the birth input is sent to the server or whether only a payment/session token is handled server-side.

## Phase 5F Policy Draft Baseline

Drafted policy documents:
- `docs/policies/PRIVACY_DRAFT.md`
- `docs/policies/REFUND_AND_SUPPORT_DRAFT.md`
- `docs/policies/USAGE_CAUTION_DRAFT.md`

These drafts are enough to guide product and engineering planning, but they are not final legal policies. Before live checkout, the product still needs:
- payment provider decision.
- final data-retention decision.
- real support contact path.
- final policy review and linkable user-facing pages.

## Phase 5G Payment Decision Baseline

Payment decision draft:
- `docs/PAYMENT_PROVIDER_DECISION.md`

The current recommendation is to keep a hosted checkout flow as the default before building embedded or custom payment UI. Provider selection remains open between Korea-first candidates and global-first candidates until business, settlement, currency, receipt, and support requirements are known.

Data boundary:
- Do not send birth date, birth time, sex, timezone, calculated pillars, report body, or PDF-ready HTML to the payment provider.
- Payment provider integration may use SKU, price, currency, order/session identifier, payment status, timestamps, and provider event identifiers.
- Webhook or session verification must be treated as payment-order verification, not permission to store report data.

## Phase 5H Data Retention Baseline

Data-retention decision:
- `docs/DATA_RETENTION_DECISION.md`

The first paid SKU remains local-report first. Server-side systems may handle order/session IDs, SKU, price, currency, payment status, provider event IDs, timestamps, and refund/support status. They must not store birth input, calculated pillars, report body, or PDF-ready HTML without a new product decision.

## Merge Checklist

Before checkout code is implemented:
- [x] Privacy policy draft exists.
- [x] Refund/contact policy draft exists.
- [x] Usage caution or terms copy exists.
- [x] Payment provider candidates and failure states are documented.
- [ ] Final payment provider and failure-state behavior are selected.
- [x] Data retention decision is written.
- [ ] Support contact path is available.
- [ ] The app still avoids live purchase language until checkout is actually implemented.
