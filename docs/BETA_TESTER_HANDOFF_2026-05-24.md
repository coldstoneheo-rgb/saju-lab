# Beta Tester Handoff Note

Date: 2026-05-24

Use this note when inviting a small, controlled tester group to try Saju Lab.

This is a tester handoff for the current no-checkout MVP. It is not public-beta approval, a paid launch, legal policy approval, KASI source revalidation, or permission to add checkout, account storage, server report storage, AI interpretation, analytics, subscription, or a PDF library.

## Current Test Target

- Build or URL: `TBD by operator before sending`
- Product mode: controlled small beta
- Language: Korean-first
- Calculation scope: fixture-limited `Asia/Seoul` MVP range
- Report scope: free rules-only report plus paid detailed-report preview
- Export scope: login-free local HTML download

## Before Sending To Testers

Operators should complete these checks before sharing the link or build:

1. Confirm the build or URL opens on mobile.
2. Confirm testers know this is a limited beta, not a public launch.
3. Confirm testers know payment, account login, saved reports, server report storage, subscription, analytics, AI interpretation, and live PDF generation are not available.
4. Confirm testers should avoid sending sensitive report contents through support or feedback channels.
5. Keep the operator pack open: `docs/BETA_OPERATOR_PACK_2026-05-18.md`.
6. Keep the readiness checklist open: `docs/BETA_READINESS_CHECKLIST.md`.

## Suggested Tester Message

Saju Lab은 설명형 사주 리포트 MVP를 소규모로 확인하는 단계입니다.

테스트에서는 생년월일과 출생시간을 입력해 리포트를 생성하고, 출생시간 미상 상태, 신뢰도 안내, 투명성 노트, 로컬 HTML 저장 흐름을 확인해 주세요.

현재 버전은 결제, 계정 로그인, 저장된 리포트 목록, 서버 저장, 구독, AI 해석을 제공하지 않습니다. 리포트는 확정 예언이나 전문 투자, 의료, 법률 조언이 아니라 자기 이해와 의사결정 점검을 돕는 참고 자료입니다.

확인 후 의견이나 버그 제보는 `[피드백 채널 입력]`으로 전달해 주세요. 보안을 위해 피드백 전달 시 리포트의 상세 내용이나 개인정보가 포함되지 않도록 주의 부탁드립니다.

## Suggested Tester Flow

1. Open the test build or URL on a mobile device first.
2. Generate a report with known birth time.
3. Generate another report with birth time unknown.
4. Read the confidence, disclaimer, transparency, career, finance, monthly, and action suggestion sections.
5. Save the free report as local HTML and confirm the filename does not include birth data.
6. Visit the draft policy pages from the paid-readiness area.
7. Review the paid detailed-report preview only as a future paid-value preview, not as a purchase flow.

## Feedback Questions

Ask testers to answer these questions in plain language:

- Did the first screen make it clear what information was needed?
- Did any Saju term feel too difficult or unexplained?
- Did the report feel like a useful explanation rather than a short fortune message?
- Were confidence, missing birth-time impact, and transparency notes easy to understand?
- Did career and finance sections feel practical without sounding deterministic?
- Did the local HTML download feel trustworthy, and did you confirm the filename is free of your birth date or time?
- Did the paid detailed-report preview feel valuable enough for a future one-time purchase?
- Did any wording sound like guaranteed success, investment advice, medical advice, legal advice, or fear-based prediction?
- Was anything confusing, too long, or hard to read on mobile?
- Did you notice any placeholder text or example contact information, such as `support@example.com`, in the app?

## Stop Conditions

Pause tester sharing and record the issue if any tester reports:

- a live purchase button or payment flow.
- account login, saved report library, server report history, subscription, analytics, or AI interpretation claims.
- `support@example.com` exposed as a real support contact.
- a filename or exported document that includes birth date, birth time, or other sensitive input.
- deterministic language such as guaranteed success, unavoidable failure, certain profit, diagnosis, treatment, or legal certainty.
- a claim that broad date coverage or KASI source revalidation is complete.
- repeated confusion about confidence, missing data, transparency, or the current MVP limits.
- mobile layout overflow that prevents reading or tapping key controls.

## Evidence Links

- Operator pack: `docs/BETA_OPERATOR_PACK_2026-05-18.md`
- Beta readiness checklist: `docs/BETA_READINESS_CHECKLIST.md`
- RC status: `docs/BETA_RC_STATUS_2026-05-18.md`
- Manual QA runbook: `docs/BETA_MANUAL_QA_RUNBOOK.md`
- Human browser QA evidence: `docs/BETA_HUMAN_BROWSER_QA_RESULTS_2026-05-17.md`
- Mobile visual smoke evidence: `docs/BETA_MOBILE_VISUAL_SMOKE_2026-05-18.md`

## Still Open Before Wider Beta Or Paid Launch

- Replace placeholder support contact with a real email or form.
- Choose the final payment provider after settlement, receipt, support, and retention requirements are clear.
- Complete final legal/user-facing policy review.
- Revalidate embedded solar-term times against KASI source data before broader public beta expansion.
- Get explicit approval before checkout, payment SDK, webhook, login, account, server report storage, subscription, analytics, AI interpretation, or PDF-library implementation.
