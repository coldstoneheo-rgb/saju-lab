# Beta Human Browser QA Results

Date: 2026-05-17

## Metadata

- Phase: Phase 4I Human Browser QA Evidence Closure
- Branch: `codex/phase4i-human-browser-qa-evidence`
- Base commit at QA start: `3279ae1`
- Dev server URL: `http://127.0.0.1:5173/`
- Browser surface: human-controlled Chrome
- Reporter: project owner

## Summary

This pass closes the two browser-dependent QA gaps left open by the Phase 4F in-app browser evidence pass and the Phase 4G automated hardening pass.

Result:
- PASS: native `type=date` boundary-date flow shows the friendly Korean birth-time-required error.
- PASS: free HTML report downloads, opens locally, uses a personal-data-safe filename, and includes the required notices.

This pass does not mark Saju Lab as fully public-beta ready. Owner/business gates and KASI source revalidation remain open.

## Human Browser QA Results

| Flow | Browser | Input | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Boundary-date error | Chrome | `2024-02-04` with birth time unknown or empty | Friendly Korean error explains that birth time is required on solar-term boundary dates | User confirmed the expected friendly Korean error appeared | PASS | Human-controlled Chrome confirmation |
| Free HTML export | Chrome | `1990-01-01`, `10:30`, `Asia/Seoul` | Downloaded HTML opens locally, uses a safe filename, and includes disclaimer, transparency, and local-processing copy | User confirmed the file downloaded and opened locally with required content | PASS | Filename: `saju-lab-report-20260517.html` |

## Gates Still Open

- Real support email or support form must be chosen before live checkout.
- Final payment provider must be selected before checkout work.
- Final legal/user-facing policy review remains required before checkout opens.
- Embedded solar-term times must be revalidated against KASI source data before broader public beta expansion.
- Account, saved report storage, subscription, analytics, AI interpretation, checkout, payment SDKs, webhooks, server report storage, and PDF-library work remain out of scope until explicitly approved.
