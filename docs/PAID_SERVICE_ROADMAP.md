# Paid Service Roadmap

Last updated: 2026-06-03

## Direction

Saju Lab should evolve from a free report-first MVP into a paid service by increasing depth, continuity, and personal usefulness. The paid model should not sell deterministic fortune-telling. It should sell clearer structure, saved context, periodic updates, and decision-support depth.

The implementation-ready scope for the first paid SKU is defined in `docs/PAID_REPORT_PRD.md`.

The AI interpretation boundary is defined in `docs/AI_INTERPRETATION_POLICY.md` and `docs/AI_PROMPT_CONTRACT.md`.

## Product Ladder

| Stage | Offer | User Value | Notes |
| --- | --- | --- | --- |
| Free MVP | Basic report, confidence note, monthly/daily keywords, HTML download | Understand and save the product quickly | No account required |
| One-Time Detailed Report | Career/finance deep report, yearly/monthly expansion, PDF export | Pay for a richer single analysis | First paid SKU; see `docs/PAID_REPORT_PRD.md` |
| AI-Assisted Interpretation | AI-expanded report language on top of rules-only calculation | Makes the app feel personalized and conversational | Move into post-beta Phase 6; must disclose AI assistance clearly |
| Subscription | Monthly updates, saved reports, change tracking, reminders | Ongoing guidance and habit loop | Requires account and privacy policy |
| Premium Add-On | AI-assisted Q&A, personalized scenarios, bilingual report | Higher-touch interpretation | Later than bounded AI report expansion |

## Free MVP Boundary

Keep free access useful enough to build trust:
- birth input and basic report
- four-pillar summary with simple explanations
- career and finance preview
- transparency notes and disclaimer
- monthly/daily keyword summary
- local HTML report download without login

Do not put safety-critical transparency behind paywalls.

## Paid Report Scope

The first paid SKU should be a one-time detailed report.

Included sections:
- expanded personality pattern
- career direction and role fit
- finance rhythm and risk checklist
- yearly outlook
- monthly highlights
- action plan
- transparency appendix
- polished PDF export with print-ready layout

The paid PDF should be a deeper product artifact than the free local HTML save. It must include generated date/time, input summary, confidence level, missing birth-time impact when applicable, disclaimer, and a transparency appendix.

Excluded from early paid scope:
- investment recommendations
- medical advice
- legal advice
- guaranteed predictions
- checkout, account storage, and saved report history

Required gates before payment work:
- privacy policy for birth data and report generation
- refund/contact policy
- usage caution or terms text
- payment provider decision
- data retention decision
- customer support contact path

## AI-Assisted Interpretation Scope

AI should move earlier than subscription, but it should start as a bounded interpretation layer rather than open-ended chat.

Included in the first AI pass:
- AI-expanded wording for the existing free or paid report sections
- clear `AI 보조 해석` disclosure
- deterministic rules-only fallback
- prompt and output safety checks
- no client-side API key exposure
- sanitized prompt payload that excludes raw birth date, birth time, sex, and other direct PII
- server-side prompt construction from controlled `saju-core` output, not client-supplied prompt text

Excluded from the first AI pass:
- AI pillar calculation
- transmission of raw birth date, birth time, sex, or other direct PII to the LLM provider
- open-ended medical, legal, investment, or crisis advice
- guaranteed prediction language
- saved chat history
- account-based personalization
- server-side report storage unless separately approved

## Subscription Scope

Subscription should start only after the one-time paid report has real usage feedback.

Candidate features:
- saved report library
- monthly flow updates
- daily lightweight prompt
- change notes based on yearly/monthly cycles
- private memo and reflection history
- Korean/English bilingual export

## Pricing Experiments

Initial experiments:
- Free basic report
- KRW 4,900 to 9,900 for a one-time detailed report
- KRW 3,900 to 7,900 monthly subscription after saved reports exist

Evaluate pricing by:
- report completion rate
- paid conversion after free report
- refund/contact rate
- repeat usage over 30 days
- user comprehension of uncertainty language

## Trust Requirements

Paid features must preserve:
- clear disclaimer
- confidence level
- known vs inferred information
- plain-language explanation of technical terms
- no deterministic guarantee language

## Implementation Order

1. Free mobile MVP
2. Login-free HTML download for basic reports
3. Paid detailed report PRD and free/paid boundary
4. Report export-ready schema
5. One-time detailed report content depth and PDF export
6. Privacy/refund/contact policy gates
7. AI interpretation policy and prompt contract
8. AI-assisted report interpretation prototype
9. Payment integration
10. Account and saved report storage
11. Subscription updates
12. AI-assisted Q&A premium layer
