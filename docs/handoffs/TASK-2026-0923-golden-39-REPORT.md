# TASK-2026-0923 golden-39 — REPORT (draft, LC 판정 대기)

- 발주: LC `life-coordinator-a5` [TASK] origin:lc, 2026-09-23 · 설계표 `life-coordinator/docs/GOLDEN-CANDIDATES-2026-0923.md` §5-1 1~7 · 계획 `ACTION-PLAN-2026-0922-saju-quality-gates.md` G1-2
- 작업자: saju-lab 워커(Claude Opus 5.5) · 브랜치 `golden/g39-add`(base `084d18f`)
- **머지 게이트**: HANDOFF §9 — PR·CI·verify·verifier PASS → 이 REPORT → LC 판정 「머지 가」 뒤 머지. **코어 코드 변경 0**(테스트·md만).

## 1. 결과 요약

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| §5-1-1 파서 선결 | P1(lunar·윤달)·P2(출생지·옵션 옵셔널 열)은 #81 `392d794`에 이미 있음 → **코드 변경 없이 사용**. P3 = U1 단위 테스트 + §7 R1 치환 | `golden-pillars.ts` `calendarMatch`·`GOLDEN_OPTIONAL_COLUMNS` |
| §5-1-2 일진 34일 | **34/34 일치**(+ R1 1986-07-08 `gye-chuk`도 일치, R2 1955-08-15 `mu-sin` 산출) | `scripts/fetch_golden_day_pillars.py` 34+2일, 설계표 `†` 값과 `diff` 0 |
| §5-1-3 윤달 교차 | **4/4 일치**(KARI `getSolCalInfo`). 평달 대조도 코어와 일치(1963-05-08) | §3 표 |
| §5-1-4 D3 정책 | **거부 안 함** → 골든 유지. `normalizeToKstWallClock({1987-05-10 02:30})` = `kst 02:30`, `appliedOffsetMin 0`, `flags ["dst","nonexistent"]` → 丑시 | 기존 테스트 `retro-review-2026-0922.test.ts:150`이 같은 입력의 flags를 이미 고정 |
| §5-1-4 Q4 | 진태양시 6행 옵션 열 = `trueSolarTime dayBoundary=midnight`(기본값을 일부러 적음) + 머리말 1줄 | `GOLDEN-PILLARS.md` 머리말 |
| §5-1-5 행 추가 | GOLDEN-PILLARS **11 → 50행**. 코어 산출 = 설계표 기대 4주 **39/39**, 진태양시 비보정 시주 **6/6** | vitest 전부 통과 |
| §5-1-6 L2 재생성 | 십신 +39 · 합충 +39 · 대운 +43(other 4건 두 벌) 전부 `pending`. X1~X5·R1 구조를 설계표 근거 열 리터럴로 고정 | §4 |
| verify | `npm run verify` **exit 0** · 테스트 388 → **675**(api 17 + saju-core 621 + web 37) · verifier PASS(§8) | 워커 실행 2026-09-23 |

## 2. 일진 대조 (34일 + 예비 2)

`python scripts/fetch_golden_day_pillars.py <34일> 1986-07-08 1955-08-15` → 로마자 열과 설계표 `†` 값을 줄 단위 `diff` → **차이 0행**.
각 행의 출처 열에 `getLunCalInfo?solYear=…&solMonth=…&solDay=…` → 한글(漢字)(조회 2026-09-23)을 적었다. **KASI 인용 68개**(행별 절입 시각)는 생성 스크립트가 `docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`의 행과 일일이 대조했다(없으면 실패) — 68/68 존재.

## 3. 윤달 교차 (KARI `getSolCalInfo`)

| 키 | 음력 | 윤달 → 양력 | 평달 → 양력 | 설계표 |
| --- | --- | --- | --- | --- |
| L1 | 1963-04-15 | 1963-06-06 (경진) | 1963-05-08 | 일치 |
| L2 | 1971-05-10 | 1971-07-02 (무자) | 1971-06-02 | 일치 |
| L3 | 1984-10-20 | 1984-12-12 (경진) | 1984-11-12 | 일치 |
| L4 | 2020-04-05 | 2020-05-27 (경오) | 2020-04-27 | 일치 |

윤달 행의 일진(KARI 응답 `lunIljin`)도 `getLunCalInfo` 결과와 같다.

## 4. 합충 구조 (X1~X5·R1) — 설계 vs 코어

| 키 | 설계표 근거 | 코어 산출(해당 열) | 비고 |
| --- | --- | --- | --- |
| X1 | 巳酉丑 완전 삼합, 반합 따로 안 냄 | 삼합 `sa-chuk-yu:year-day-time` 단독 | 포섭 확인 |
| X2 | 申酉戌 방합 3자 | 방합 `yu-sin-sul:month-day-time` | 글자 = 명식 순서 |
| X3 | 寅巳申 완전 삼형 + 寅申 충 | 형 `in-sa-sin:year-day-time` 단독 · 충 `in-sin:year-time` | 寅申 2자 형은 완전 삼형에 포섭(형 열에 따로 없음), 충은 별개 종류라 나열. 추가로 巳申 육합 `sa-sin:day-time`(규칙대로) |
| X4 | 亥亥 자형 1건 | 형 `hae-hae:day-time` | 申酉 2자 방합 미산출 |
| X5 | 子卯 상형, 巳巳 미산출 | 형 `ja-myo:day-time` 단독 | 추가로 간합 `gye-mu:year-day` |
| R1 | 丑戌未 완전 삼형 | 형 `mi-chuk-sul:month-day-time` | 추가로 충 `mi-chuk:month-day` |

`golden-interactions.test.ts`에 위 7개 토큰을 **설계표 리터럴**로 고정했다(코어 산출을 복사한 게 아니라 설계표 근거 열에서 옮겼다).

## 5. 실측 정정 (설계표 대비)

| # | 설계표 | 실측 | 처리 |
| --- | --- | --- | --- |
| 1 | B6 「연지=월지 酉酉(`ja-hyeong` 대상 아님) 대조군」 | **酉는 자형 대상**(辰午酉亥). 코어가 `yu-yu:year-month` 자형을 낸다 — 규칙표 `docs/rules/INTERACTIONS.md`와 일치 | GOLDEN-PILLARS B6 비고에 정정 기록. 합충 pending 행은 코어 값 그대로 |
| 2 | (암묵) 골든 명식은 전부 관계 1건 이상 | 새 39건 중 **3건이 관계 0**: `g-1946-05-19-2359`(巳巳) · `g-1963-06-06-1000`(巳巳) · `g-2022-01-25-0350`(丑丑·寅寅, 甲戊 천간충은 v1 밖) | 합충 테스트 C3 단언을 「confirmed 중 0건 + 관계 0 = 이 3개 id」로 바꿈. 머리말 갱신 |
| 3 | §5-1-6 「pending으로 생성」 | 기존 세 테스트의 pending 상한 20%가 39/50 = 78%에서 실패 | §6 결정 1 |

## 6. LC 판단이 필요한 결정 (반박 가능)

1. **pending 상한 예외 방식**: #81 REPORT §6 운영 규칙(새 행은 100% pending으로 시작, 상한은 confirmed PR에서 켠다)을 **기존 표 확장**에 적용하려고, 세 테스트에 `OPEN_REVIEW_ROUND = { tag: "TASK-2026-0923-golden-39", goldenVerifiedOn: "2026-09-23", rows: 39|43 }`를 두었다. 출처에 태그가 있고 **GOLDEN-PILLARS 일자가 2026-09-23인 행만**, 그리고 **이번 라운드 행 수(`rows`) 이하로만** 상한 계산에서 빠진다(V-D 반영 — 태그를 다시 써서 뒤의 행을 숨길 수 없다). confirmed 기입 PR이 이 상수를 지우면 상한이 다시 전면 적용된다. 대안: 상한을 표별로 끄고 켜는 플래그 — 더 넓게 열려서 채택하지 않음.
2. **L2 표 완전성 단언 추가**: 세 표의 id 집합 = GOLDEN-PILLARS id 집합(대운은 other 두 벌 포함 행 수까지). 앞으로 골든 명식을 추가하면 L2 세 표도 같은 PR에서 재생성해야 테스트가 통과한다.
3. **십신 japyeong 20셀 단언**: confirmed 11행에 한정(`predictedConfirmed === 20`). 전체 50행 차분 셀 수는 계속 md 두 표에서 유도해 코어와 대조한다.
4. **범주 `합충` 신설**: X1~X5·R1 = `기본·합충`. 범주 범례에 추가.
5. **UTC+8:30 +2**: U1이 빠져 D2(`DST·UTC+8:30`)·U2가 채운다. G1-3 범주 최소치는 새 테스트 `golden-39-2026-0923.test.ts`에 표로 고정(기존 11행 수 + 설계표 §2 추가 수).

## 7. 테스트가 실행한 분기 (G3-3)

| 범주 | 행 | 실행한 코드 분기 | 단언 위치 |
| --- | --- | --- | --- |
| 진태양시경계 | T1~T6 | `pillars.ts:196` `policy.trueSolarTime ? shiftMinutes(...)` 보정 경로 + `collectAlternates` `:232` 반대 정책 재조립 → `alternates.trueSolarTime` | 골든 4주 + `golden-39-2026-0923.test.ts` 「T1~T6」(보정 시주 ≠ 비보정 시주, 일주 동일) |
| 시간미상 | N1~N3 | `pillars.ts:192` `!timeKnown(kst)` → 3주·`alternates` 미생성(`:123`) · 대운은 정오 대체 | 골든 3주 + L2 표 3기둥 |
| 윤달 | L1~L4 | `pillars.ts:132` `resolveCalendar` → `:146` `lunarToSolar(…, isLeapMonth=true)` | 골든 4주 + 「L1 음의 대조」(평달 1963-05-08) |
| 절기경계 | S1~S6·Z3 | `solar-terms.ts:81` `findActiveBoundaryIndex`(동시각 = 새 절) — S1/S4 1분 전, S2/S5 동시각, S3/S6 1분 후 | 골든 4주(연·월주가 1분 사이에 갈림) |
| 23시대 | Z1~Z3·U2 | `pillars.ts:198` 야자시(`late`) = 23시대에도 일주 당일 유지 · Z3은 자정 넘김 + 입동 7분 전(월주 유지) | 골든 4주 |
| DST | D1~D3 | `timezone-history.ts:42` `resolveInterval` → `:51` `dst` · D3은 `:103` 결번 `nonexistent`(전이 전 오프셋 유지) | 골든 4주 + 기존 `retro-review-2026-0922.test.ts:150`(D3 flags) |
| UTC+8:30 | D2·U2 | `timezone-history.ts:48` `utc+8:30` · D2는 +8:30 + DST(실효 +9:30, 벽시계 −30분), U2는 +30분으로 亥→子 | 골든 4주 |
| 기본 | B1~B7 | 경계 없는 단순 경로(1920년대·1953·2022 1월 = 간지 해 유지) | 골든 4주 |
| 합충 | X1~X5·R1 | `l2/interactions.ts:118` `branchTripleRule`(완전 3자) · `:207` 포섭(부분 형·반합 생략) · 쌍별 자형 | 합충 골든(md 오라클) + 설계 구조 리터럴 테스트 |
| 범위 밖 | U1(표 밖) | `solar-terms.ts:24` `No Ipchun boundary` → v1 `OUT_OF_SUPPORTED_RANGE` | 「U1」 단위 테스트 |

## 8. 리뷰 지적·처리

독립 verifier 서브에이전트(`.claude/agents/verifier.md`, 만든 AI와 분리) — **PASS (notes)**, 2026-09-23.

| # | 지적 | 근거(verifier 실측) | 처리 |
| --- | --- | --- | --- |
| V-A | 코어 코드 변경 0 · 기존 행 byte-identical | `git diff origin/main --name-only` = md 4 + l2 테스트 3(+ 새 테스트·REPORT). 원본 행 PILLARS 11 · TENGODS 11 · INTERACTIONS 11 · DAEUN 16 `diff` IDENTICAL | 확인만 |
| V-B | verify | exit 0, api 17 · core 621 · web 37. audit low 1건(esbuild, 기존, moderate 미만) | 확인만 |
| V-C | 독립 재계산(코어 미사용) | S1·S2·S4·S5·Z3·D2·U2·B7 연·월주, S1·S4·Z1·Z3·D2·U2·B7 일주, D2·U2 시주 재현 **불일치 0** · X1~X5·R1 4주 = 설계표 6/6 | 확인만 |
| V-D | **pending 상한 예외가 고정 날짜에만 기대 자연 만료가 없다** — 뒤 PR이 같은 태그 + 일자 2026-09-23으로 새 pending을 숨길 수 있다(현재 상태로는 발생 안 함, 중) | 세 테스트의 `OPEN_REVIEW_ROUND` | **반영**: 상수에 `rows`(십신·합충 39, 대운 43)를 넣어 예외 행 수를 이번 라운드로 묶었다. 태그를 다시 써도 행 수 상한에 걸린다. 상수 삭제는 confirmed PR의 완료 조건으로 §9에 적었다 |
| V-E | 도메인 규칙 | 새 L2 행 전부 pending, PILLARS 새 행 전부 API·KASI 인용, 웹·i18n diff 0 | 확인만 |
| V-S | verify 중 `__snapshots__/timezone-history.test.ts.snap`이 EOL만 바뀐 `M`으로 뜸(내용 diff 없음) | 새 worktree에서 vitest가 스냅샷을 LF로 다시 씀 | 커밋에서 제외(`git checkout --`) |

## 9. 남은 것

- **LC 검산 라운드(§5-2)**: 연·월·시주 재검산 + 일주 34/34 대조 → GOLDEN-PILLARS는 이미 출처 인용형 정본, L2 세 표 pending → confirmed PR. **그 PR의 완료 조건 = 세 테스트의 `OPEN_REVIEW_ROUND` 상수 삭제**(V-D).
- 사용자 표본 3건(§5-3: D2·S2·Z3) 교차는 비고 「교차: …」로 대기.
- G1-3 판정(골든 ≥ 50 · 범주 최소치)은 이 PR의 새 테스트가 기계로 확인한다 — 8단계 HO 발신 조건 판정은 LC.
