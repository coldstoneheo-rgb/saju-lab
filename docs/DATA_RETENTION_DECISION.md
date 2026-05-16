# Data Retention Decision

Status: Phase 5H decision. This document defines the first paid SKU's data-retention boundary before checkout implementation.

## Decision Summary

The first paid SKU remains local-report first.

Server-side storage is not allowed for:
- birth date
- birth time
- sex
- timezone
- calculated pillars
- free report body
- paid report body
- PDF-ready HTML

Server-side payment/order records may include only:
- order ID
- checkout/session ID
- product SKU
- price
- currency
- payment status
- provider event ID
- timestamps
- refund/support status

Payment provider payloads must not include birth input, calculated pillars, report body, or PDF-ready HTML.

## Fulfillment Model

Preferred model:
- Generate the report in the browser.
- Keep birth input and generated report content in browser memory or local download only.
- Use checkout/session verification only to confirm payment state.
- Let the user save the paid detailed report as a PDF-ready HTML document and browser print-to-PDF artifact.

Allowed server responsibility:
- create or verify payment/order sessions.
- receive provider payment status events.
- reconcile order status for refunds or support.

Not allowed without a new decision:
- storing the user's birth input.
- storing calculated pillars.
- storing generated report text.
- storing PDF-ready HTML.
- creating a saved report library.
- account-based report history.

## Scenario Boundaries

### Report generated before payment

Allowed if the report remains local until checkout completes. Do not send report content or birth input to the payment provider.

### Report generated after payment

Allowed if generation can still happen in the browser. If server-side generation is proposed, this decision must be reopened.

### User closes the page after payment

Without account storage or server report storage, automatic report recovery is not guaranteed. Support may use order/session ID and payment status to decide refund or retry handling.

### Download fails

The app should provide retry guidance. Support should identify the order without asking the user to send birth data in plain text.

### Duplicate payment or refund

Order/session ID, payment status, provider event ID, timestamps, and refund/support status may be used to resolve the case.

### Support inquiry

Support records should contain order/support metadata and the minimum user message needed to resolve the issue. Users should not be asked to include birth data, calculated pillars, report body, or PDF-ready HTML.

If a user voluntarily sends birth data, report text, or PDF-ready HTML in a support message, support tooling or process must redact those fields before retention. Keeping those fields in support records requires reopening this data-retention decision.

## Retention Draft

These are product-retention defaults, not final legal retention terms:

| Record type | Default handling |
| --- | --- |
| Birth input | No server storage |
| Calculated pillars | No server storage |
| Free report body | No server storage |
| Paid report body | No server storage |
| PDF-ready HTML | No server storage |
| Local downloaded files | User device responsibility |
| Order/payment event | Limited retention for settlement, refund, support, and reconciliation |
| Support message | Limited retention after redacting birth input, calculated pillars, report body, and PDF-ready HTML |

Before live checkout, legal/user-facing policy links must define exact retention periods for order/payment and support records.

## Checkout Readiness Impact

This decision closes the data-retention gate for the first paid SKU's product direction.

Still open before live checkout:
- final payment provider.
- exact order/payment record retention period.
- real support contact path.
- final user-facing privacy, refund/support, and usage-caution pages.
- implementation details for checkout/session verification.
