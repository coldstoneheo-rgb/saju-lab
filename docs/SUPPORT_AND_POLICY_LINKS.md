# Support And Policy Links

Status: Phase 5I link-structure decision. This document does not create live checkout or public policy pages.

## Decision Summary

Before live checkout, Saju Lab needs user-facing policy links and a real support contact path. This phase defines the structure only.

Placeholder support contact:
- `support@example.com`

Important:
- `support@example.com` must be replaced before live checkout.
- Do not expose the placeholder as a real support address in production UI.
- Checkout must not open until a real support email or support form is selected.

## User-Facing Policy Paths

Candidate paths:
- `/policies/privacy`
- `/policies/refund-support`
- `/policies/usage-caution`

Source drafts:
- `docs/policies/PRIVACY_DRAFT.md`
- `docs/policies/REFUND_AND_SUPPORT_DRAFT.md`
- `docs/policies/USAGE_CAUTION_DRAFT.md`

## Placement Plan

Paid preview:
- show that policy/support links are being prepared before checkout.
- do not expose a purchase CTA.
- do not show placeholder support email as a live contact.

Checkout page, once implemented:
- link privacy policy before payment.
- link refund/support policy before payment.
- link usage caution before payment.
- show real support contact path.

Paid export:
- include privacy/scope note and no-professional-advice disclaimer.
- include user-facing policy links only after pages exist.

Support flow:
- identify orders by order/session ID where possible.
- do not ask users to send birth data, calculated pillars, report body, or PDF-ready HTML.
- redact those fields if users voluntarily send them.

## Remaining Gates

Still required before live checkout:
- real support email or support form.
- final legal/user-facing policy copy.
- exact retention periods for order/payment and support records.
- final payment provider decision.
- checkout/session verification implementation plan.
