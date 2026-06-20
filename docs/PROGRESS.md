# PROGRESS — 세션 진행 상태 파일

> 루프 하네스의 ⑥ 상태 파일. 매 세션 끝에 갱신한다. 거버넌스 규칙은 `AGENTS.md`, 작업 지침은 `CLAUDE.md`.

## 현재 위치
- 단계: **Phase 6 — AI 해석(AI-assisted interpretation)** 도입.
- 브랜치: `codex/phase6a-ai-policy-prompt-contract`.
- 직전 작업: AI 해석 정책/프롬프트 계약 정의, AI 가드와 계약 정렬, Vercel Analytics 활성화.
- 기반 상태: rules-only 무료/유료 리포트 + 픽스처 한정 결정론적 절기 계산이 동작(MVP).

## 다음 후보
- AI 프롬프트 계약(`docs/AI_PROMPT_CONTRACT.md`)을 실제 해석 경로에 연결 (rules-only 보조 위치 유지).
- `packages/saju-core/src/ai-interpretation-guard.ts` 가드 범위 확장 + 테스트.
- 절기 픽스처 검증 범위 확대 (KASI 재검증 문서 참조).

## 작업 로그
| 날짜 | 내용 | 검증 |
|------|------|------|
| 2026-06-20 | 클로드코드 하네스 구조 도입(CLAUDE.md, .claude/agents·skills·commands, settings, 본 상태 파일) | — |

## 세션 종료 체크
- [ ] `npm run verify` 통과
- [ ] 도메인 불변 규칙 위반 없음 (verifier 또는 /verify로 확인)
- [ ] 본 파일의 "현재 위치 / 다음 후보 / 작업 로그" 갱신
