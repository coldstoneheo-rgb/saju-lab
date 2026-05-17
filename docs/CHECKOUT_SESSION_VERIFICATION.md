# Checkout Session Verification Blueprint

Status: Phase 5K implementation blueprint. This document does not add live checkout, payment SDKs, webhooks, login, or server-side report storage.

## Goal

Define how Saju Lab should verify a paid checkout session before unlocking a one-time detailed report download.

The first paid SKU remains local-report first:
- the browser may generate the free report and PDF-ready paid report preview.
- the server may verify payment/session state.
- birth input, calculated pillars, report body, and PDF-ready HTML must not be sent to the payment provider.
- birth input, calculated pillars, report body, and PDF-ready HTML must not be stored server-side by default.

## Recommended Flow

### 1. Before Payment

The app may prepare a local paid-report artifact preview, but checkout stays locked until all launch gates are complete.

Allowed checkout-session inputs:
- product SKU.
- price.
- currency.
- generated order ID.
- checkout/session ID after provider session creation.
- return URL and cancel URL.
- locale.

Forbidden checkout-session inputs:
- birth date.
- birth time.
- sex.
- timezone.
- calculated pillars.
- free report body.
- paid report body.
- PDF-ready HTML.

### 2. During Payment

Use hosted checkout by default until a final provider decision is made.

The provider may receive:
- product SKU.
- price.
- currency.
- order/session identifier.
- payment status.
- provider event identifiers.
- timestamps.

The provider must not receive:
- birth input.
- calculated pillars.
- report text.
- generated HTML export.

### 3. After Return

The app should not trust a return URL alone.

Before unlocking the paid download, a server-side verification step should confirm:
- provider session ID exists.
- provider status is paid or complete.
- amount and currency match the expected SKU.
- order/session ID has not already been consumed in a conflicting state.
- duplicate or replay attempts are handled.

The verified result may unlock local download generation in the browser without sending the report payload to the server.

## State Model

Recommended states:
- `draft`: local paid-report preview exists, checkout is not open.
- `session_created`: provider checkout session exists.
- `payment_pending`: user is at hosted checkout or returning.
- `payment_verified`: provider confirms successful payment.
- `download_ready`: browser may generate or download the paid artifact.
- `download_failed`: payment is verified but local download did not complete.
- `refund_requested`: support/refund handling is in progress.
- `refunded`: refund is completed.
- `verification_failed`: provider/session verification failed.
- `expired`: checkout session expired or was abandoned.

## Failure Handling

### Payment Failed

Show a neutral failure message and keep report data local. Do not retry automatically in a way that creates duplicate payment sessions.

### Payment Succeeded But Return Is Missing

Use support/order lookup based on order or session ID only. Do not ask users to send birth data, calculated pillars, report text, or PDF-ready HTML.

### Provider Verification Failed

Do not unlock paid download. Show a support path once a real support channel exists.

### Download Failed

If payment is verified but download fails, support should use order/session ID to validate the purchase and guide retry or refund handling.

### Duplicate Payment

Compare order/session IDs, provider event IDs, amount, currency, and timestamps. Do not inspect report content to resolve duplicate payment.

### Refund Requested

Refund handling may store refund/support status, but must not store birth input, calculated pillars, report body, or PDF-ready HTML.

## Implementation Guardrails

- Do not add checkout buttons until final provider, support contact, policy copy, and retention periods are ready.
- Do not create payment SDK integration in the client during this blueprint phase.
- Do not add webhook handlers in this blueprint phase.
- Do not add account, login, saved report library, or server-side report history.
- Keep the first paid SKU as a one-time local-download detailed report unless a new product decision changes this boundary.

## Remaining Gates

Still required before live checkout:
- final payment provider selection.
- real support contact path.
- exact legal retention periods.
- final user-facing legal policy review.
- checkout/session verification implementation.
- manual QA for failed return, duplicate payment, verified download, and refund/support paths.
