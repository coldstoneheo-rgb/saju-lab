# WORKLOG — saju-lab

> 오케스트레이터(Life Coordinator) `/project-scan`용 요약+신호 로그. 최신이 맨 위(append-only).
> 규약 전문: life-coordinator `docs/WORKLOG_PROTOCOL.md`. 상세 세션로그는 `docs/PROGRESS.md`.

---
date: 2026-07-02
project: saju-lab
agent: claude-code (Sonnet 5)
summary: HO-B(baby-naming-ai 소비측 통합) 완료 확인 — 이미 구현돼 있던 걸 라이브 교차검증으로 확정, 양쪽 저장소 WORKLOG 갱신
status: shipped
progress: "사주×작명 가치사슬 전 구간(HO-A→HO-API→deploy-fix→HO-B) 완료 (근거: baby-naming-ai 커밋 `5efea26` 이전 `5ec49a0`/`22b3585`가 이미 통합 구현, 오늘 프로덕션 API를 baby-naming-ai 로컬 `SAJU_API_KEY`로 직접 호출해 골든 케이스 재현·확인)"
changes: ["docs/PROGRESS.md HO-B를 다음후보→완료로 갱신", "baby-naming-ai ceff283 docs(worklog): record HO-B saju API integration as complete"]
next: baby-naming-ai 쪽 후속(캐싱, `GEMINI_API_KEY` 로컬 주입 후 실기기 풀플로우 검증)은 saju-lab 소관 밖 — baby-naming-ai 레포에서 진행
synergy: 사주 엔진(saju-lab)과 작명앱(baby-naming-ai)의 API 연결이 실제로 살아있음을 라이브로 재확인 — 번들 가치사슬 첫 엔드투엔드 검증
---
## 의미
saju-lab이 발행한 HO-B 핸드오프가 이미 다른 세션(AI Studio, baby-naming-ai 레포)에서 구현·머지돼 있었는데
어느 WORKLOG에도 완료로 기록되지 않아 이 문서에는 "다음 후보"로 계속 남아 있었다. 오늘 세션에서 발견하고
프로덕션 `/api/saju-pillars`를 baby-naming-ai의 실제 키로 호출해 핸드오프의 골든 교차검증 기준을 재현함으로써
"코드는 있지만 완료로 인지되지 않은" 상태를 해소했다. 오케스트레이터가 더 이상 HO-B를 열린 작업으로 오인하지 않도록
양쪽 저장소 WORKLOG를 동시에 갱신했다.

---
date: 2026-07-01
project: saju-lab
agent: claude-opus-4-8 (Claude Code · Life Coordinator 오케스트레이터)
summary: 🧪 [시범] paused 엔트리 — HO-B(작명앱↔사주 API 통합)를 열린 루프로 표식. saju-lab 실코드 변경 없음
status: paused
progress: "Phase 6(AI 해석) 진행 중 · HO-B 미착수 상태 유지 (근거: git 최신 e970cba 2026-06-30 이후 saju-lab 코드 변경 없음 — 이 엔트리는 진척 보고가 아니라 '중단 표식'이다)"
changes: []
next: HO-B 실행 — baby-naming-ai 안드로이드가 POST /api/saju-pillars 호출 → supplementPriority로 보완 한자 작명
resume: "복귀 첫 액션 = baby-naming-ai 앱의 사주 API 호출부부터 착수. 열린 것: HO-B 지시서 미발행 · SAJU_API_KEY 미주입(개방모드)이라 통합 테스트 전 키 주입 필요. 미저장 결정: 없음(코드 미변경)."
synergy: baby-naming-ai가 이 사주 엔진의 소비측 — 사주×작명 번들 가치사슬의 다음 연결
---
## 의미
Life Coordinator의 새 열린-루프 파이프(WORKLOG `status: paused` → project-scan `open_loop` → 브리핑 `🔁 열린 루프`)를 saju-lab에서 시범 검증하기 위한 엔트리다. saju-lab 코드는 건드리지 않았고, 사주×작명 가치사슬의 다음 단계 HO-B가 "아직 시작 전이지만 오케스트레이터가 다른 작업으로 이동해 열어둔" 상태임을 기계가독 신호로 남긴다. 다음 `/project-scan`이 이 엔트리를 읽어 saju-lab 상태파일에 `open_loop`를 실으면, 아침 브리핑 "열린 루프" 섹션에 HO-B 복귀 지점이 자동 노출되는지 확인하는 것이 이 시범의 목적이다.

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
