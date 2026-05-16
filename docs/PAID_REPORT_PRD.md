# Paid Detailed Report PRD

Last updated: 2026-05-15

## 1. Product Summary

The first paid product for Saju Lab is a one-time detailed report. It extends the free mobile MVP by adding deeper career and finance interpretation, longer yearly/monthly structure, a practical action plan, and a polished PDF export.

This paid product must sell depth, organization, and convenience. It must not sell certainty. Disclaimer, confidence, missing-data notes, and transparency information remain available in free and paid experiences.

## 2. Goals

| ID | Goal | Success Signal |
| --- | --- | --- |
| G1 | Define the first paid SKU clearly | Product and engineering can implement paid report depth without reworking the free MVP |
| G2 | Preserve trust while adding monetization | Paid copy does not imply guaranteed outcomes or professional advice |
| G3 | Make PDF export worth paying for | The paid PDF contains deeper sections, metadata, and print-friendly structure beyond the free HTML save |
| G4 | Separate payment/account work from report content | Payment provider, login, and saved reports remain separately gated |

## 3. Non-Goals

- Do not implement checkout, payment provider integration, login, account storage, or server-side report history in this phase.
- Do not provide investment, medical, legal, or guaranteed life-outcome advice.
- Do not hide confidence, disclaimer, missing birth-time impact, or calculation transparency behind payment.
- Do not introduce AI-assisted interpretation without explicit AI disclosure and a separate policy review.

## 4. Target Users

### Free-to-Paid Reader
- Has generated a free report and wants a deeper single analysis.
- Values readable Korean explanations more than dense technical terminology.

### Career/Finance Planner
- Wants structured hints for career direction, work style, money habits, and risk awareness.
- Needs practical checklists and reflection prompts, not deterministic predictions.

### Save-and-Share User
- Wants a polished document they can keep locally without creating an account.
- Expects the PDF to be readable on mobile and printable on desktop.

## 5. Product Boundary

| Area | Free MVP | One-Time Paid Detailed Report | Later Subscription |
| --- | --- | --- | --- |
| Core report | Basic `ReportV1` sections | Expanded detailed sections | Ongoing updates |
| Export | Local HTML save | Polished PDF download | Saved report library |
| Career | Short direction and strengths | Role fit, work style, risk patterns, action plan | Monthly career updates |
| Finance | Basic tendency and caution | Finance rhythm, risk checklist, planning prompts | Recurring finance review |
| Monthly content | Free monthly highlights | Expanded monthly themes and actions | Updated monthly cycle tracking |
| Account | None | None by default | Required |
| Transparency | Always included | Always included | Always included |

## 6. First Paid SKU

Working name: One-Time Detailed Report.

Entry point:
- The user completes the free report.
- The report screen shows an optional paid upgrade panel.
- The upgrade explains added depth, PDF output, and scope limits without pressuring the user.

Output:
- A paid detailed report generated for the current birth input.
- A local PDF download.
- No account or report history unless a later phase adds account storage.

Suggested purchase promise:
- "커리어와 재무 흐름을 더 자세히 정리한 PDF 상세 리포트"
- Avoid wording such as "성공 보장", "수익 예측", "투자 판단", or "확정 운세".

## 7. Required Paid Report Sections

### 7.1 Cover And Metadata

Required fields:
- report title
- generated date and time
- input summary
- timezone
- birth time known/unknown state
- confidence level
- short disclaimer
- local/download scope note

### 7.2 Pillar Summary With Plain-Language Notes

The paid report may include more Saju terms than the free report, but every important term needs a short plain-language explanation.

Required treatment:
- show 연주, 월주, 일주, 시주 with short meaning notes
- explain missing 시주 when birth time is unknown
- distinguish calculated information from interpretive guidance

### 7.3 Expanded Personality Pattern

Required content:
- repeated tendencies
- tension or balance points
- strengths in ordinary language
- caution areas stated as possibilities, not fixed defects

### 7.4 Career Deep Dive

Required content:
- suitable work environments
- role-fit hints
- collaboration and decision style
- career risk patterns
- short-term action suggestions
- long-term reflection questions

Prohibited content:
- guaranteed promotion, success, failure, or exact timing claims
- professional career counseling replacement claims

### 7.5 Finance Risk Checklist

Required content:
- money-habit tendencies
- risk-awareness checklist
- planning prompts
- spending/saving rhythm notes
- confidence and uncertainty reminders

Prohibited content:
- investment recommendations
- asset allocation instructions
- expected return, price, or market timing claims
- language that resembles licensed financial advice

### 7.6 Yearly And Monthly Expansion

Required content:
- yearly theme summary
- monthly highlights with readable labels
- recommended reflection/action per period
- uncertainty note when source data is limited

The monthly section should be more detailed than the free monthly highlights. It should still be framed as a planning aid, not a prediction calendar.

### 7.7 Action Plan

Required content:
- 3 to 5 practical action items
- what to watch
- what to avoid overinterpreting
- follow-up reflection prompts

### 7.8 Transparency Appendix

Required content:
- calculation assumptions
- known data
- missing data
- inferred interpretation data
- confidence explanation
- disclaimer
- no medical/legal/financial advice note

## 8. PDF Export Requirements

The paid PDF should be a detailed report product, not only a prettier version of the free HTML export.

Required:
- Korean-first content.
- A4-friendly layout.
- readable mobile preview and desktop print output.
- table of contents or section anchors when technically feasible.
- generated date/time.
- input summary and timezone.
- confidence level and missing birth-time note.
- disclaimer on the first page and in the transparency appendix.
- privacy/scope note explaining that account storage is not included in this SKU.
- filename pattern that avoids exposing unnecessary sensitive data, such as `saju-lab-paid-report-YYYYMMDD.pdf`.

Recommended:
- page numbers.
- section-level visual hierarchy.
- compact glossary for technical terms.
- summary page for quick review.

Phase 5B implementation baseline:
- PDF-ready HTML should be generated through a testable export builder.
- The export should include a cover, table of contents, input summary, pillar summary, main paid sections, glossary, and transparency appendix.
- Print CSS should use A4 page settings and avoid splitting cover, checklist, and timeline sections when possible.
- Export tests should check required notices, input summary, privacy/scope note, and birth-time unknown handling.

## 8.1 Paid Content Quality Baseline

Phase 5C implementation baseline:
- Every paid narrative section should include a summary and at least three practical items when the section is action-oriented.
- Career sections should separate role fit, work style, risks, and concrete action planning.
- Finance sections should separate rhythm, risk checklist, and planning prompts.
- Monthly paid themes should include `theme`, `action`, and `caution` so users do not read a month label as a deterministic prediction.
- Birth-time unknown cases should explicitly warn that monthly and detailed timing should be read as broad guidance.
- Paid copy should sell structure, depth, and usefulness, not stronger certainty.

## 9. Trust, Safety, And Copy Rules

Paid copy must:
- use plain Korean sentences before technical terms.
- describe tendencies, contexts, and options.
- keep uncertainty visible.
- avoid implying that payment increases prediction certainty.
- preserve the same disclaimer and confidence treatment as the free report.

Paid copy must not:
- guarantee outcomes.
- promise exact money, health, legal, relationship, or career events.
- pressure users with fear-based messaging.
- describe the report as professional investment, medical, legal, or psychological advice.

## 10. Payment And Account Gates

Payment implementation should not start until these documents or decisions exist:
- privacy policy for birth data and report generation.
- refund/contact policy.
- terms or usage caution for informational/entertainment-oriented reports.
- payment provider decision.
- data retention decision for paid report generation.
- customer support contact path.
- decision on whether paid reports are generated locally, server-side, or hybrid.

Account and saved reports should stay out of the first paid SKU unless the product intentionally moves to the subscription phase.

Phase 5D implementation baseline:
- `docs/PAID_CHECKOUT_READINESS.md` is the checkout-readiness source of truth.
- The app may show a paid detailed-report preview, but it should not present a live purchase action until readiness gates are complete.
- The first paid SKU should remain a one-time local-download product unless the data-retention decision intentionally changes that boundary.
- Account storage, saved report history, subscription billing, AI interpretation, and server-side report history remain out of scope.
- The paid preview should tell users that privacy, refund/contact, payment provider, and data-retention decisions must be ready before checkout opens.

Phase 5E implementation baseline:
- `docs/PDF_EXPORT_SPIKE.md` is the PDF export validation source of truth.
- The MVP paid export path should remain PDF-ready HTML plus browser print-to-PDF until a PDF library is intentionally selected.
- The export must include a visible PDF save guide, required notices, input summary, confidence, missing-data notes, and transparency appendix.
- The generated filename must continue to avoid birth date, birth time, sex, or other unnecessary personal data.
- Checkout, login, account storage, server storage, subscription, and analytics remain out of scope.

Phase 5F implementation baseline:
- Privacy, refund/support, and usage-caution drafts live under `docs/policies/`.
- These drafts guide checkout readiness but are not final legal policies.
- Live checkout still requires a payment provider decision, final data-retention decision, real support contact path, and user-facing policy links.
- The paid preview may mention policy-draft readiness, but it must not imply checkout is open.

Phase 5G implementation baseline:
- `docs/PAYMENT_PROVIDER_DECISION.md` defines provider candidates, selection criteria, failure states, and data-boundary rules.
- Birth input, calculated pillars, report body, and PDF-ready HTML must not be sent to the payment provider.
- Hosted checkout should remain the default assumption until a final provider decision is made.
- Checkout code, payment SDKs, webhooks, account storage, server report storage, subscription, and analytics remain out of scope.

Phase 5H implementation baseline:
- `docs/DATA_RETENTION_DECISION.md` defines the first paid SKU's data-retention boundary.
- Birth input, calculated pillars, free report body, paid report body, and PDF-ready HTML are not stored server-side.
- Server-side payment/order records may include only order/session ID, SKU, price, currency, payment status, provider event ID, timestamps, and refund/support status.
- Exact legal retention periods and user-facing policy links remain required before live checkout.

Phase 5I implementation baseline:
- `docs/SUPPORT_AND_POLICY_LINKS.md` defines candidate policy paths and support-contact placement.
- Candidate user-facing policy paths are `/policies/privacy`, `/policies/refund-support`, and `/policies/usage-caution`.
- `support@example.com` is a placeholder and must be replaced before live checkout.
- Live checkout still requires final provider selection, real support contact, final legal/user-facing policy copy, and exact retention periods.

## 11. Metrics

Track only after analytics and privacy policy are ready:
- free report completion rate.
- paid upgrade click rate.
- checkout completion rate.
- PDF generation success rate.
- refund/contact rate.
- user comprehension of confidence and disclaimer language.
- repeat report generation within 30 days.

## 12. Acceptance Criteria

- Free vs paid report depth is explicit.
- PDF requirements are detailed enough for implementation planning.
- Checkout, account, and saved report work are clearly excluded from the first implementation pass.
- Disclaimer, confidence, missing-data impact, and transparency are required in paid output.
- No paid section relies on deterministic prediction language.
- `docs/PAID_SERVICE_ROADMAP.md`, `docs/DEVELOPMENT_ROADMAP.md`, `docs/PRD.md`, and `README.md` link or align with this PRD.
