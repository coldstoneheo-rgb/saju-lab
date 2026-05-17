# Saju Lab Beta Readiness Checklist

Last updated: 2026-05-17

Use this checklist before sharing the MVP with a small beta group.

Detailed manual steps live in `docs/BETA_MANUAL_QA_RUNBOOK.md`.

Latest QA evidence: `docs/BETA_MANUAL_QA_RESULTS_2026-05-17.md`.

## Mobile Input Flow

- [ ] Birth date input is usable on a narrow mobile viewport.
- [ ] Birth time input is usable and explains why accuracy matters.
- [ ] Time unknown mode disables birth time and clearly explains the confidence impact.
- [ ] Sex selection is tappable and does not overflow on mobile.
- [ ] The fixed `Asia/Seoul` timezone is visible before report generation.

## Error And Partial Data States

- [ ] Invalid dates show a user-facing correction message.
- [ ] Invalid times show a user-facing correction message.
- [ ] Unsupported date ranges are described as an MVP data-range limitation.
- [ ] Solar-term boundary dates explain that birth time is required.
- [ ] Time unknown is treated as a supported partial-data state, not as an error.

## Report Safety

- [ ] Report top area shows confidence and disclaimer before detailed sections.
- [ ] Missing birth time adds a visible warning note.
- [ ] Career and finance text is framed as trends, risks, and actions, not certainty.
- [ ] No section implies guaranteed success, guaranteed loss, diagnosis, treatment, legal advice, or investment advice.
- [ ] Transparency notes separate certain information from inferred interpretation.

## Privacy And Export

- [ ] The app states that the MVP does not provide login, server sync, or account storage.
- [ ] The app states that input is used locally in the browser for report generation.
- [ ] HTML export is described as a local download.
- [ ] PDF export remains framed as a future paid detailed-report candidate.

## Navigation And Accessibility

- [ ] Report section links move users to overview, career, finance, monthly highlights, and transparency.
- [ ] Form controls have labels or accessible descriptions.
- [ ] Theme controls expose selected state.
- [ ] Save report button has an accessible label.
- [ ] Main content remains readable in light, dark, and system theme modes.

## Automated CI Verification

These commands are now enforced by the GitHub Actions CI workflow on pull requests and pushes to `main`.

- [x] `npm ci`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm audit --audit-level=moderate`
- [x] `git diff --check`

## Local Verification Command

Use this before opening a PR when the change has code, build, dependency, or whitespace risk.

- [ ] `npm run verify`

## Manual QA Verification

These checks remain manual because they require looking at the rendered mobile experience.

- [ ] `docs/BETA_MANUAL_QA_RUNBOOK.md` has been followed for the target build.
- [ ] Basic report generation is readable on a narrow mobile viewport.
- [ ] Time unknown mode visibly lowers confidence and explains the impact.
- [ ] Policy draft pages are reachable and still marked as drafts.
- [ ] Paid readiness panel does not imply checkout is live.
- [ ] HTML export can be opened locally and does not put birth data in the filename.

## Owner And Business Gates

These items must not be resolved autonomously by implementation agents.

- [ ] Real support contact email or support form is chosen.
- [ ] Final payment provider is selected after settlement, receipt, refund, and support needs are clear.
- [ ] Final legal/user-facing policy review is complete before checkout opens.
- [ ] Account, saved report storage, or subscription scope is explicitly approved before it is implemented.

## External Source Gates

These items require direct source verification before broad public beta or wider date-range support.

- [ ] Embedded solar-term times are revalidated against KASI source data.
- [ ] Fixture-limited date coverage is still visible to users as an MVP limitation.
- [ ] Any future broader solar-term table has source, update, and regression-test notes.

## Manual Verification Commands

These remain useful for targeted debugging or when a PR changes only one area.

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm audit --audit-level=moderate`
- [ ] `git diff --check`
