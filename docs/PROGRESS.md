# PROGRESS — 세션 진행 상태 파일

> 루프 하네스의 ⑥ 상태 파일. 매 세션 끝에 갱신한다. 거버넌스 규칙은 `AGENTS.md`, 작업 지침은 `CLAUDE.md`.

## 현재 위치
- 단계: **Phase 6 — AI 해석(AI-assisted interpretation)** 도입. (작업 환경 Codex → Claude Code 전환 완료)
- 브랜치: `main` (PR #55 머지 후 동기화, 워킹트리 클린).
- 직전 작업: Claude Code 루프 하네스 + Karpathy 스타일 CLAUDE.md 도입(PR #52). 이후 문서 후속 — PROGRESS 세션 기록(#53), CLAUDE.md PR 프로세스 줄(#54), AGENTS↔CLAUDE 상호 링크(#55).
- 기반 상태: rules-only 무료/유료 리포트 + 픽스처 한정 결정론적 절기 계산이 동작(MVP).

## 다음 후보
- AI 프롬프트 계약(`docs/AI_PROMPT_CONTRACT.md`)을 실제 해석 경로에 연결 (rules-only 보조 위치 유지).
- `packages/saju-core/src/ai-interpretation-guard.ts` 가드 범위 확장 + 테스트.
- 절기 픽스처 검증 범위 확대 (KASI 재검증 문서 참조).
- 잔여 esbuild low 권고(GHSA-g7r4-m6w7-qqqr): moderate 게이트 미만이라 비차단. 패치 버전 esbuild 0.28.1은 vite 7.3.5의 `^0.27.0` 범위 밖이라 `overrides` 강제 시 빌드 호환성 위험 → vite 업데이트로 자연 해소 대기.

## 작업 로그
| 날짜 | 내용 | 검증 |
|------|------|------|
| 2026-06-20 | 클로드코드 하네스 구조 도입(CLAUDE.md, .claude/agents·skills·commands, settings, 본 상태 파일) — PR #52 | `npm run verify` 통과 |
| 2026-06-20 | PR #52 리뷰 반영: Bash 권한 규칙 `:*`→`+공백 와일드카드`(제품 생성 settings.local.json 근거 검증), vite 7.3.3→7.3.5(audit high 권고 해소) | CI green, 리뷰 스레드 resolved |
| 2026-06-20 | PR #52 머지(main `9c6fcf7`), 원격·로컬 브랜치 정리, 구식 `codex/phase6a` 로컬 브랜치 삭제, main 동기화 | — |
| 2026-06-20 | PR #53: 본 PROGRESS에 하네스 세션 결과 기록. 리뷰봇 esbuild `overrides` 제안은 vite `^0.27.0` 범위 충돌로 검증 후 기각(근거 문서화) | CI green, 머지(main `52c0bdf`) |
| 2026-06-20 | PR #54: CLAUDE.md 하네스 섹션에 PR 프로세스 한 줄 추가. 리뷰봇 문체 일관성 제안 검증 후 반영 | CI green, 머지(main `79b4d2b`) |
| 2026-06-20 | PR #55: AGENTS.md Source Of Truth에 CLAUDE.md 링크 추가. 리뷰봇 지적 없음 | CI green, 머지(main `e1401ab`) |

## 세션 종료 체크
- [x] `npm run verify` 통과
- [x] 도메인 불변 규칙 위반 없음 (문서/설정 변경만, verifier 체크리스트 해당 없음)
- [x] 본 파일의 "현재 위치 / 다음 후보 / 작업 로그" 갱신
