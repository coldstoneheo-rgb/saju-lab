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
| 1 | I1 선행 게이트 RED→GREEN 커밋 분리 | ✓ | RED 371d294: `include-gate.test.ts` GATES에 `strengthFactors: [GOLDEN-STRENGTH-FACTORS 상태]` + «게이트 통과 블록 전부 개방» 기대 → `vitest run src/l2/include-gate.test.ts src/l2/include-blocks.test.ts` **8 failed / 11 passed**(전부 INVALID_OPTIONS·INCLUDE_BLOCKS 누락). GREEN 651dc59: 같은 두 파일 통과. 변이(1행 pending → 게이트 닫힘)는 기존 판정기 변이 테스트가 strengthFactors까지 순회 |
| 2 | I2 기본 응답 바이트 스냅샷 diff 0 | ✓ | `git diff --stat origin/main -- packages/saju-core/src/l2/__snapshots__ api/_lib/__snapshots__` = 0줄. 스냅샷 테스트(`strength-readings.test.ts` «baby 공급 계약») 통과, `-u` 미사용 |
| 3 | I3 응답 키 스키마 + INVALID_OPTIONS 목록 | ✓ | `l2/include-blocks.test.ts`: 설계서 §1 표를 파싱 → 블록 5종 = 응답 키 5종(1:1), `INCLUDE_BLOCKS` = 5~7단계 4 ∪ 표 5, 블록별 «기본 키 그대로 + 키 1개», 골든 50 × 두 학파 레코드 키 집합(필수⊆키⊆필수∪선택). INVALID_OPTIONS 메시지는 `INCLUDE_BLOCKS` 파생(#126) — `include-gate.test.ts` I3 테스트가 strengthFactors 포함 확인 |
| 4 | I4 API 문서 블록 절 + 예시 | ✓ | `docs/SAJU_PILLARS_API_V1.md` 9단계 절에 `strengthFactors` 항목 + 실제 응답 JSON 예(g-1988-10-09-0230). 손으로 쓴 값 0 — `include-blocks.test.ts` «I4» 테스트가 문서 JSON과 코어 응답을 `toEqual`로 대조. 나머지 4블록 예는 #126 |
| 5 | I7 export + export 테스트 | ✓ | `index.ts`는 이미 `strengthFactorsOf`·`StrengthFactors`·`sinsalOf`·`SinsalHit`·`SINSAL_VARIANTS` 등 export(#126) — 변경 0. `include-blocks.test.ts` «I7» 2건: 함수·상수 런타임 존재 + 타입 5종 컴파일 사용 |
| 6 | I6 verify · verifier · 수치 | ✓ | verifier 서브에이전트 **PASS(조건부)** — 불변 7개 충족, 비차단 위험 6건 중 1·2·3·5·6 반영(아래 «발견» 4~6), 4는 사유 기록. 반영 후 `npm run verify` 재실행 결과는 PR 본문 |
| 7 | 어휘 가드(블록 응답 JSON 전체) | ✓ | `include-blocks.test.ts`: 골든 50 × 두 학파 × 5블록 JSON에 한국어 길흉·추천어(추천·권장·최적·반드시·길흉·좋은·나쁜·조심·주의·성공·실패·행운…)·영어(good·bad·lucky·recommend*·best·score·rank·grade·fortune…) 0 + 판정기 변이 3건 |
| 8 | apps/web diff 0 | ✓ | `git diff --stat origin/main -- apps/web` = 0줄 |
| 9 | AGENT_STATUS · WORKLOG · 설계서 §6 | ✓ | AGENT_STATUS as_of `2026-11-03T01:09:08+09:00`(`TZ=Asia/Seoul date` 실측), next_actions[0] 배포 묶음에 이 PR 추가, metrics 1244 · WORKLOG 맨 위 블록 · 설계서 §6 상태 줄 1줄 |
| 10 | PR [cloud] · 본문 · REPORT | (PR 생성 시) | |

## 한 일

- `packages/saju-core/src/types.ts` `INCLUDE_BLOCKS` 끝에 `strengthFactors` 추가(끝에 둬서 기존 오류 메시지·keyless 거절 목록의 앞 4개 순서 불변).
- `saju-pillars-v1.ts`: include 시 `data.strengthFactors` = `strengthFactorsOf(pillars, birthKst, {school})` 그대로(판독 블록과 같은 인스턴스 계산 1회). 응답 키 순서 = `strengthFactors` → `strengthReadings` → …
- `KEYLESS_INCLUDE_BLOCKS` 변경 0 → keyless·키 미설정 라우트 거절 목록이 파생으로 `strengthFactors`를 자동 포함(`api/_lib/keyless-includes.test.ts` 기대값 갱신, `saju-pillars.test.ts` L2 목록 5종).
- «모르는 블록» 예시 2곳(`golden-tengods.test.ts`·`retro-review-2026-0922.test.ts`)을 `strengthFactors` → `saryeong`으로.

## 발견

1. **발주서 범위의 대부분이 이미 끝나 있었다.** 4블록·I1~I4·I7은 #124·#126(10-27)에서 닫혔다. 발주서가 인용한 «AGENT_STATUS next_actions 1 = 9단계 include 개방 착수 HO(§5 I1~I7)»는 main a0c640d의 AGENT_STATUS에 없다(실제 next_actions[0] = «[배포] 11-20 전 배포 묶음»). LC 쪽 사본이 #129(상태 현행화) 이전 것으로 보인다 — 다음 발주 전 LC가 main의 AGENT_STATUS를 다시 읽기를 권함.
2. `strengthFactors`에는 `doctrine` 라벨이 없다 — 설계서 §1 표의 «레코드 공통 라벨»이 `school · precision`뿐이고 8a는 판독이 아닌 사실(정의 id 명시)이라 설계대로다. 문서에 그 이유를 적었다.
3. 블록 데이터 사람 대면 문장 필드: `yongsinCandidates.note`는 기계 문자열(`eokbu: … → …`)이라 어휘 가드에 걸리지 않음을 골든 100 응답으로 확인.

4. **(verifier 위험 1) 문서 오류 반영** — «시각 미상이면 블록 모두 레코드마다 `precision`»은 `yongsinCandidates`에 거짓(레코드에 `precision` 없음). #126 때부터 있던 서술을 이 PR이 «다섯»으로 넓혔다가 verifier가 잡음 → 블록 4종만 명시하고 용신 후보는 필드 없음으로 고침.
5. **(verifier 위험 2) 설계서 §1 표 «레코드 공통 라벨» 열의 `yongsinCandidates` = «같음»(school·precision·doctrine)은 코드와 다르다** — 실제 레코드 키에 `school`·`precision`이 없다(#113부터). 테스트는 코드(현 계약)를 고정했고 설계서 표는 결정 기록이라 고치지 않았다 — LC가 표를 정정할지 판정. `doctrine === "unreviewed"` 값 단언은 추가.
6. **(verifier 위험 3) 영어 어휘 가드를 `\b` 정규식 → camelCase 단어 분해로** — `luckyColor`·`bestElement` 같은 키도 잡는다(변이 테스트 1건 추가).
7. (verifier 위험 4) `include-gate.test.ts` «열리지 않은 L2 블록은 INVALID_OPTIONS»는 5블록 전부 열려 지금 빈 루프다. 다음 게이트 블록이 표에 추가되면 다시 일하는 테스트라 그대로 둠.

## LC·사용자에게 필요한 것

- [사용자] 층 노출 범위(설계 §4 «결정» 열) — 변함없이 UI HO의 전제. 이 PR은 그 결정과 무관.
- [LC] 11-20 전 배포 묶음에 이 PR 포함 여부 판정. AGENT_STATUS gauge(4/8) 재산정은 이전 WORKLOG learning_need 그대로.
