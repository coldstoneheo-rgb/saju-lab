# CLOUD-2026-1103 §15 — 9단계 include 블록 개방 REPORT

- 발주: LC `CLOUD-2026-1103-wave4-15-18.md` §15 (origin: user — «클라우드 세션 4개 선정»). 등급 HO.
- 브랜치 `cloud/saju-l2-include` (origin/main a0c640d에서 분기). 세션 시작 2026-11-02T16:01:28Z(`date -u`).

## 시작 시 확인 (이미 끝난 항목)

확인 시각 2026-11-02T16:01Z, 근거 `git log origin/main` · `packages/saju-core/src/types.ts:14-24` · `AGENT_STATUS.json`.

- 블록 5종 중 4종(`strengthReadings`·`yongsinCandidates`·`gyeokguk`·`sinsal`)은 **#126 839c3ba(10-27)에서 이미 개방** — I1(#124 7617ffa `include-gate.test.ts`)·I2(바이트 스냅샷)·I3(INVALID_OPTIONS 목록 = `INCLUDE_BLOCKS` 파생)·I4(API 문서 9단계 절)·I7(`sinsalOf`·`SinsalHit`·`SINSAL_VARIANTS` export, `index.ts`)까지 그 4블록은 닫혀 있음. I5는 #125.
- 남은 블록 = **8a `strengthFactors` 1종**(HO-2026-1026 REPORT:43 «8a `strengthFactors`는 블록으로 열지 않았다»). 이 PR의 범위 = `strengthFactors` 개방 + 5블록 공통 계약·어휘·export 테스트. LC 가정의 3 PR 분할은 불필요(1 PR).

## 체크리스트

| # | 조건 | 상태 | 근거 |
| --- | --- | --- | --- |
| 1 | I1 선행 게이트 RED→GREEN 커밋 분리 | 열림 | |
| 2 | I2 기본 응답 바이트 스냅샷 diff 0 | 열림 | |
| 3 | I3 블록별 응답 키 스키마 + INVALID_OPTIONS 목록 | 열림 | |
| 4 | I4 API 문서 블록 절 + 예시(실제 응답 복사) | 열림 | |
| 5 | I7 export + export 테스트 | 열림 | |
| 6 | I6 verify EXIT 0 · verifier PASS · 테스트 수치 | 열림 | |
| 7 | 어휘 가드(블록 응답 JSON 전체) | 열림 | |
| 8 | apps/web diff 0 | 열림 | |
| 9 | AGENT_STATUS · WORKLOG · 설계서 §6 상태 줄 | 열림 | |
| 10 | PR [cloud] · 본문 · REPORT | 열림 | |
