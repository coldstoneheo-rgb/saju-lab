# CLAUDE.md — saju-lab

사주(Four Pillars) **설명형 리포트** 웹앱. 결정론적 운세가 아니라 경향·불확실성을 설명한다.
전체 거버넌스는 `AGENTS.md`, 세션 진행은 `docs/PROGRESS.md`.

## 1. 코딩 전에 생각하라 (Think Before Coding)
- 손대기 전에 관련 문서를 읽는다. 진실의 원천은 아래 `docs/` 목록.
- 가정을 드러내고, 모호하면 멈추고 질문한다. 트레이드오프를 먼저 말한다.
- 이해하지 못한 코드를 부작용으로 바꾸지 않는다.

## 2. 단순하게 (Simplicity First)
- 요청된 것만 구현한다. 추측성 기능·미래 대비 추상화 금지.
- MVP를 작게 유지한다: "출시할 수 있을 만큼 작은가?"
- 저장소 안정화 전까지 광범위한 리팩터 금지.

## 3. 수술적 변경 (Surgical Changes)
- 꼭 필요한 부분만 고치고, 주변 코드 스타일·구조를 따른다.
- 계산 / 리포트 / UI / 번역(i18n) 레이어를 분리해서 유지한다.
- 무관한 코드는 건드리지 않는다.

## 4. 목표 기반 실행 (Goal-Driven Execution)
- 완료 기준 = 검증 게이트 통과: `npm run verify`
  (typecheck && test && build && audit && git diff --check)
- 통과 못 하면 통과할 때까지 반복한다. "다 됐다"는 검증으로만 말한다.
- 절기 경계(입춘 전/at/후), 출생시각 known/unknown, 리포트 스키마 스냅샷,
  ko i18n 키 커버리지에 테스트를 둔다.

## 도메인 불변 규칙 (절대 위반 금지)
- 결정론적 점술 표현 금지: "반드시 성공/필연적 실패", 의료·재무·법률 확정 표현 금지.
- 모든 리포트는 면책·투명성(추론 vs 확정, confidence)을 포함한다.
- 출생 시각 등 소스가 없으면 confidence를 낮추고 영향을 설명한다.
- AI 해석은 rules-only 다음에 보조한다. 검증 안 된 픽스처를 confirmed로 표기 금지.
- 한국어 카피가 기본. 영어는 같은 i18n 구조로만 추가한다.

## 진실의 원천 (읽고 시작)
- 제품 docs/PRD.md · 아키텍처 docs/ARCHITECTURE.md · 로드맵 docs/DEVELOPMENT_ROADMAP.md
- 절기 계산 docs/algorithms/SOLAR_TERM_SPEC.md · 코어 docs/packages/saju-core/INTERFACE_SPEC.md
- 리포트 스키마 docs/REPORT_SCHEMA_V1.md · 톤 docs/TONE_GUIDE.md
- AI 정책/계약 docs/AI_INTERPRETATION_POLICY.md · docs/AI_PROMPT_CONTRACT.md
- i18n docs/i18n/KEYS.md, docs/i18n/ko.json

## 구조 & 명령
- `apps/web` React UI · `packages/saju-core` 계산·룰 리포트·AI 가드
- 공개 API: `calculatePillars(input)` · `generateReportV1(input)` · `generatePaidReportV1(input)`
- 개발: `npm run dev --workspace @saju-lab/web` → http://localhost:5173
- 검증: `npm run verify`

## 하네스 (루프 엔지니어링)
- **만든 AI와 검증 AI를 분리**한다 → 변경 검토는 `.claude/agents/verifier.md` 서브에이전트.
- 병렬 작업은 `git worktree`로 격리한다. 동시 실행은 사람이 검토할 수 있는 만큼만.
- 반복 작업은 `/loop`·`/goal`. 진행 상황은 매 세션 `docs/PROGRESS.md`에 기록한다.
- 도메인 카피 작성은 `saju-domain` 스킬을, 게이트는 `/verify` 커맨드를 쓴다.
- PR은 항상 전용 브랜치로 낸다 → CI·리뷰봇 대기 → 리뷰는 맹신 말고 근거로 검증·반영·resolve → 머지·브랜치 정리.
- 최종 검증은 사람 몫이다. 루프가 좋아도 사고를 기계에 넘기지 않는다.
