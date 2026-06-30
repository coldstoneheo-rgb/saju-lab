# WORKLOG — saju-lab

> 오케스트레이터(Life Coordinator) `/project-scan`용 요약+신호 로그. 최신이 맨 위(append-only).
> 규약 전문: life-coordinator `docs/WORKLOG_PROTOCOL.md`. 상세 세션로그는 `docs/PROGRESS.md`.

---
date: 2026-06-30
project: saju-lab
agent: claude-opus-4-8 (Claude Code)
summary: 프로덕션 /api/saju-pillars 500 복구 — saju-pillars-v1 서버리스 함수가 프로덕션에서 로드되도록 수정
status: shipped
progress: "Phase 6(AI 해석) 진행 중 · 사주×작명 가치사슬 HO-A(오행)→HO-API(소비계약)→deploy-fix 완료, 다음 HO-B (근거: PR #60 머지 5efea26, npm run verify 통과, 라이브 프로덕션 POST→200/GET→405 확인)"
changes: ["PR #60 fix(api): make saju-pillars-v1 serverless function load in production", "2cc159f fix(api) 프로덕션 모듈로드 복구", "8e6626b chore(api) nested api/**/*.ts tsconfig 포함"]
next: HO-B 실행 — baby-naming-ai 안드로이드가 POST /api/saju-pillars 호출 → supplementPriority로 보완 한자 작명 (핸드오프 docs/handoffs/HO-2026-0620-naming-consume-01.md)
synergy: baby-naming-ai 작명앱이 이 사주 엔진의 소비측 — 사주×작명 번들의 가치사슬
monetization: saju-pillars-v1 계약 API가 다운스트림 유료 작명 번들의 기반 인프라
learning_need: SAJU_API_KEY 환경 주입 + 플랫폼 레이트리밋 운영화 (현재 키 미설정=개방 상태)
---
## 의미
라이브 프로덕션의 `/api/saju-pillars`가 모든 요청에 500을 반환하던 상태(`@vercel/node`가 `@saju-lab/saju-core` 심링크를 번들에 재생성하지 않아 bare specifier 런타임 모듈로드 실패)를 복구했다. 이로써 사주×작명 번들의 핵심 연결 고리인 소비 계약 API가 실제로 호출 가능해져, 다음 단계인 HO-B(baby-naming-ai 안드로이드 통합)가 비로소 실행 가능한 상태가 되었다. 엔진 자체(rules-only 리포트·오행 분포·보완 우선순위)는 이미 동작하므로, 남은 잠금해제는 운영화(키 주입·레이트리밋)와 소비측 통합이다.
