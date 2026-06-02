# Beta Share Checklist

Use this checklist immediately before sending Saju Lab to a small, controlled beta group.

This checklist is for a no-checkout MVP beta only. It does not approve public beta, paid launch, checkout, payment SDK, webhook, login, account storage, server report storage, analytics, AI interpretation, subscription, or PDF library work.

## Operator Inputs

- [ ] Copy the content of `docs/BETA_TESTER_HANDOFF_2026-05-24.md` and replace `TBD by operator before sending` with the real beta build or URL in the copied tester message.
- [ ] Replace `[피드백 채널 입력]` with the real private feedback channel in the copied tester message.
- [ ] Do not commit real beta URLs or private feedback channels to the tracked handoff template.
- [ ] Confirm testers should not send detailed report contents or personal birth input through public channels.

## Smoke Checks

- [ ] Run `npm run verify` on the target branch or build source.
- [ ] Open the target build or URL on a mobile device.
- [ ] Generate a known-time report.
- [ ] Generate a time-unknown report and confirm confidence and missing-data copy are visible.
- [ ] Confirm the current MVP calculation coverage note is visible.
- [ ] Save the local HTML report and confirm the filename does not include birth date, birth time, sex, or pillar values.
- [ ] Visit `/policies/privacy`, `/policies/refund-support`, and `/policies/usage-caution`.
- [ ] Confirm the paid detailed-report preview does not look like a live purchase flow.

## Copy And Scope Guard

- [ ] The tester message says this is a limited beta, not a public launch.
- [ ] The tester message says payment, account login, saved reports, server report storage, subscription, analytics, AI interpretation, and live PDF generation are not available.
- [ ] The tester message says reports are explanatory references, not deterministic predictions or professional investment, medical, or legal advice.
- [ ] The app does not expose `support@example.com` as a real support address.
- [ ] The app does not claim broad date coverage beyond the current fixture-limited MVP scope.

## Stop Before Sharing If Any Appears

- live checkout, purchase CTA, or payment is available.
- payment SDK, webhook, or provider verification behavior.
- login, account storage, saved report library, or server report history.
- analytics or automated feedback collection.
- AI interpretation or subscription claim.
- PDF library or live PDF generation claim.
- deterministic success, loss, diagnosis, treatment, legal certainty, or investment-advice wording.
