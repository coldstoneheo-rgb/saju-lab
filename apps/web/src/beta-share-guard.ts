export const betaShareGuard = {
  handoffDocument: "docs/BETA_TESTER_HANDOFF_2026-05-24.md",
  operatorBuildPlaceholder: "TBD by operator before sending",
  feedbackChannelPlaceholder: "[피드백 채널 입력]",
  requiredMvpLimitSignals: [
    "결제, 계정 로그인, 저장된 리포트 목록, 서버 저장, 구독, AI 해석을 제공하지 않습니다",
    "확정 예언이나 전문 투자, 의료, 법률 조언이 아니라",
    "fixture-limited `Asia/Seoul` MVP range",
    "local HTML download"
  ],
  requiredOperatorChecks: [
    "Confirm the build or URL opens on mobile.",
    "Confirm testers know this is a limited beta, not a public launch.",
    "Confirm testers should avoid sending sensitive report contents through support or feedback channels."
  ],
  forbiddenBeforeApproval: [
    "checkout",
    "payment SDK",
    "webhook",
    "login",
    "account storage",
    "server report storage",
    "analytics",
    "AI interpretation",
    "subscription",
    "PDF library"
  ]
} as const;
