# Payment Provider Decision

Status: Phase 5G decision draft. This document does not implement checkout.

Saju Lab's first paid SKU is a one-time detailed report. The payment provider should support a low-friction hosted checkout path while keeping birth data out of payment metadata and provider payloads.

## Decision Summary

Recommended implementation posture:
- Use a hosted checkout flow before building an embedded or custom payment UI.
- Keep birth date, birth time, sex, timezone, calculated pillars, and report content out of payment-provider metadata.
- Store or pass only a product SKU, price, currency, order/session identifier, and fulfillment status.
- Treat provider webhooks or session verification as payment-order events, not report-storage events.
- Keep checkout code out of the repo until data-retention and support-contact decisions are final.

Current recommendation:
- Korea-first MVP: keep PortOne and Toss Payments as primary candidates.
- Global-first or English expansion: keep Stripe Checkout as the leading candidate.
- Final provider selection remains open until business registration, settlement, currency, receipt, and support requirements are known.

Official docs referenced during planning:
- Stripe Checkout: https://docs.stripe.com/payments/checkout
- PortOne payment integration: https://portone.gitbook.io/docs-en/console/guide/connect
- Toss Payments developer documentation should be checked directly before implementation.

## Candidate Comparison

| Candidate | Strength | Risk / open question | Best fit |
| --- | --- | --- | --- |
| Stripe Checkout | Hosted checkout, low-code sessions, strong global expansion path | Korea-local payment and settlement fit must be verified for the target business | Global-first or bilingual launch |
| PortOne | Korea PG aggregation and PG-channel abstraction | Requires PG/channel setup and operational decisions before live use | Korea-first launch with multiple PG options |
| Toss Payments | Strong Korea-first payment experience candidate | Official API, settlement, receipt, and webhook details must be verified before implementation | Korea-first launch if direct Toss integration is preferred |

## Selection Criteria

The final provider decision must answer:
- supported currency for the first SKU.
- supported payment methods for Korean users.
- hosted checkout or redirect flow availability.
- whether server-side session creation is required.
- webhook or payment-status verification requirements.
- refund flow and duplicate-payment handling.
- receipt or proof-of-payment handling.
- test mode and sandbox support.
- production approval and settlement requirements.
- whether the provider requires any personal data beyond payment/order data.

## Failure States

Checkout implementation must handle these before launch:

1. Payment failed before authorization
   - Do not generate or expose paid output.
   - Show retry guidance and support path.

2. Payment succeeded but report generation failed
   - Do not ask the user to send birth data through support by default.
   - Provide retry or refund path.

3. Payment succeeded but download failed
   - Provide retry guidance.
   - Support should identify the order without requiring birth data in plain text.

4. Duplicate payment
   - Support/refund policy must define duplicate-charge handling.
   - Order/session identifiers must be sufficient for support review.

5. User closes the page after payment
   - Define whether fulfillment can be resumed locally, server-side, or through support.
   - This depends on the final data-retention decision.

6. Webhook or session verification failed
   - Do not generate paid output from an unverified payment.
   - Log only payment/order state needed for support and reconciliation.

7. Provider outage or timeout
   - Show a non-alarming retry message.
   - Avoid creating multiple paid reports for ambiguous payment state.

## Data Retention Impact

Payment-provider integration may require server-side order verification. That does not automatically allow report storage.

Default boundary:
- allowed: SKU, price, currency, order/session ID, payment status, timestamps, provider event IDs.
- not allowed without a separate decision: birth date, birth time, sex, timezone, calculated pillars, report body, PDF-ready HTML.

The data-retention boundary is defined in `docs/DATA_RETENTION_DECISION.md`.

If server-side verification is required:
- report generation should still happen in the browser unless the data-retention decision is reopened.
- the app should fulfill a paid report without sending birth input to a server.
- payment/order records may be retained only for settlement, refund, support, and reconciliation needs.
- exact retention periods still need final user-facing policy language.

## Readiness Checklist

Before checkout code starts:
- [ ] Choose final payment provider.
- [ ] Choose hosted checkout, embedded checkout, or provider popup flow.
- [ ] Define payment/session creation location.
- [ ] Define webhook or session verification behavior.
- [ ] Define refund and duplicate-charge workflow.
- [ ] Define support-contact path.
- [x] Define data-retention boundary for order records and report data.
- [ ] Confirm birth data is not sent to the payment provider.
