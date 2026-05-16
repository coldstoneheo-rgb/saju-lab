# Privacy Draft

Status: Draft for paid-launch readiness. This is not a finalized legal policy.

User-facing page candidate: `/policies/privacy`.

Before live checkout:
- replace or finalize this draft as user-facing policy copy.
- link this policy before payment.
- define exact retention periods for order/payment and support records.

Saju Lab uses birth information only to generate a report-first Saju interpretation. The first paid SKU should remain no-login and local-download oriented unless a later data-retention decision changes that boundary.

## Data Covered

User-provided data:
- birth date
- optional birth time
- sex selection
- timezone

Generated data:
- Four Pillars calculation output
- confidence level
- free report content
- paid detailed report content
- PDF-ready HTML export

Support-related data, if support is introduced:
- user message
- contact address supplied by the user
- payment or download issue description
- optional order identifier if checkout is later introduced

## Current MVP Handling

Current product direction:
- reports are generated in the browser.
- no account login is required.
- no saved report library is provided.
- local HTML and PDF-ready HTML downloads are created on the user's device.
- filenames should not include birth date, birth time, sex, or other unnecessary personal data.

## Paid Launch Requirements

Before live checkout:
- users must be able to read this privacy policy or its final version before payment.
- the product must explain whether report generation is local, server-side, or hybrid.
- any server-side payment session must avoid receiving birth data unless explicitly required and disclosed.
- data retention duration must be written before checkout opens.
- support messages must have a clear handling and deletion expectation.

## Open Decisions

- final support contact destination.
- whether checkout needs a server-side payment session.
- whether birth input ever leaves the browser.
- retention period for payment/support records.
- deletion request handling if support or payment records exist.
