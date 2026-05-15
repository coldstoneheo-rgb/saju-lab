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
| Privacy policy | How birth data, generated reports, device data, and support messages are handled | Users can read the policy before payment |
| Refund/contact policy | Refund window, support channel, response expectation, and failed-download handling | The checkout and report pages can link to a support path |
| Usage caution or terms | Informational/entertainment-oriented scope and no professional-advice boundary | Paid copy does not imply stronger certainty than the free report |
| Payment provider | Provider, currency, receipt handling, and failure-state behavior | Failed payment does not generate or expose paid output |
| Data retention | Whether reports are generated locally, server-side, or hybrid | The product can explain what is stored, where, and for how long |
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

## Merge Checklist

Before checkout code is implemented:
- [ ] Privacy policy draft exists and is linkable.
- [ ] Refund/contact policy draft exists and is linkable.
- [ ] Usage caution or terms copy exists and is linkable.
- [ ] Payment provider and failure-state behavior are selected.
- [ ] Data retention decision is written.
- [ ] Support contact path is available.
- [ ] The app still avoids live purchase language until checkout is actually implemented.
