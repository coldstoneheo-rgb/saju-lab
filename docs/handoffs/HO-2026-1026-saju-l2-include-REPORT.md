# HO-2026-1026-saju-l2-include-01 — REPORT

- 발주: `life-coordinator/handoffs/HO-2026-1026-saju-l2-include-01.md`
- 워커: saju-lab 창(Claude Opus 5.5, 세션 effort medium · critic high). 역할 규약 그대로이고, effort를 올린 곳은 없다.
- 분기: main 9a4ae5c. 2026-10-27 KST, 사용자 여행 중 RC 루프.
- 하지 않은 것: 배포 조작 0 · env 조회 0 · 외부 API 호출 0 · apps/web 화면·유료 리포트 변경 0.

## 체크리스트 (완료 조건 번호)

- [x] 1. 계획 REPLY. 반박 수용 3건:
  - ① 골든 confirmed PR을 맨 앞에 둔다(GYEOKGUK k-6 pending이 gyeokguk 게이트를 막고 있었다).
  - ② keyless 앱 라우트는 새 블록을 거절한다.
  - ③ PR4 머지는 §7-7에 해당하지 않는다(LC 판정). 조건은 (가) 기본 응답 스냅샷 (나) keyless 거절 테스트.
- [x] 2. I1 선행 게이트 → #124 **7617ffa**
- [x] 3. I5 monthBranch 안 A → #125 **e2c3f58**
- [x] 4. 블록 개방 I2·I3·I4·I7(sinsal 포함 4블록) + LC 조건 (다) → #126 **839c3ba**
- [x] 5. GOLDEN-SINSAL 50 confirmed + 출처 열, GYEOKGUK k-6 실행 confirmed(세트 셀만) → #123 **d8e4ef9**. sinsal 개방은 #126.
- [ ] 6. S-YNY 편입 — **보류**. LC 판정 (c): 일주 출처가 외부 `getLunCalInfo`라서 외부 호출 = 멈출 곳이다. 유도 출처 (b)는 골든 출처 규칙을 완화하는 것이라 쓰지 않는다.
- [x] 7. PR마다 verify · critic(verifier high) PASS · LC 게이트(아래 표)
- [x] 8. 인계 블록 → 이 PR

## 한 일

| PR | 범위 | critic | LC 게이트 | 머지 |
| --- | --- | --- | --- | --- |
| #123 | GOLDEN-SINSAL 50 confirmed · GYEOKGUK k-6 · SINSAL/GEOKGUK md 보강 ①②③ | PASS · 변이 8 · 관찰 4(O1·O3·O4 반영) | PASS · 델타 PASS 유지 | d8e4ef9 |
| #124 | `INCLUDE_BLOCKS` 상수 + `include-gate.test.ts`(게이트 · 판정기 변이 · 이름 허용 목록 · 표 끊김 오류) | PASS · 권고 2 반영 | PASS · 델타 PASS 유지 | 7617ffa |
| #125 | `StrengthFactors.monthBranch` · 격국 우회 삭제 | PASS · 관찰 1(선택) | PASS · 관찰 3 | e2c3f58 |
| #126 | 네 블록 개방 · keyless 거절 · export · API 문서 9단계 절 | PASS · 관찰 a·d 반영 · b → LC 조건 (다)로 코드화 | PASS · 관찰 3 | 839c3ba |

## 열린 블록 (saju-pillars-v1 `options.include`)

| 블록 | 선행 골든(실행 축) | 키 라우트 `/api/saju-pillars` | keyless `/api/app/saju-pillars` |
| --- | --- | --- | --- |
| hiddenStems · tenGods · interactions · daeun | (5~7단계, 게이트 없음) | 열림 | 열림 |
| strengthReadings | 8a 50 + READINGS 50 confirmed | 열림(#126) — **키가 실제로 걸린 호출만**. `SAJU_API_KEY` 미설정(열린 키 라우트)이면 거절 | **거절** INVALID_OPTIONS |
| yongsinCandidates | 8a 50 + YONGSIN 50 | 열림(#126) | 거절 |
| gyeokguk | 8a 50 + GYEOKGUK 56 | 열림(#126) | 거절 |
| sinsal | SINSAL 50 | 열림(#126) | 거절 |

- 모든 레코드는 `doctrine: "unreviewed"`다. 의존 블록은 자동으로 붙지 않는다.
- 기본 응답 바이트는 그대로다.
- 8a `strengthFactors`는 블록으로 열지 않았다.

## 검증 (명령 · 결과)

| 명령 | 결과 |
| --- | --- |
| `npm run verify` PR1 | EXIT 0 · api 115 · core 1049 · web 49 |
| `npm run verify` PR2 | EXIT 0 · core **1053** |
| `npm run verify` PR4 끝(PR3 포함) 1차 | **EXIT 1** · 옛 테스트 2건이 `sinsal`을 «모르는 블록» 예시로 쓰고 있었다 |
| 같은 슬롯 재실행 | EXIT 0 · api **117** · core **1057** · web 49 |
| `npm run verify` #126 최종(조건 (다) 뒤, main e2c3f58 위) | EXIT 0 · api **118** · core 1057 · web 49 · CI verify pass |
| `npm run golden:strength-pack -- --check`(PR3) | 50×16 일치 |
| 변이(워커) | 신살 1행 pending → 1 fail · 게이트 판정기 선행 골든 7파일 각 1행 pending → 닫힘 |
| CI `verify` #123·#124 | pass |

## 발견

1. **GYEOKGUK 보강 6행이 gyeokguk 게이트를 막고 있었다.** 발주서 원안 PR3(세 블록 먼저)으로는 gyeokguk을 열 수 없었다. 그래서 LC 신살 재계산 파일(표 3이 6행도 닫음)로 confirmed PR을 맨 앞에 두었다.
2. **api 라우트 두 개는 include 필터 없이 코어로 그대로 넘긴다.** 코어만 열면 keyless 공개면에도 유료 기본값 블록이 열린다. 그래서 `respondSajuPillars(…, deniedIncludes)`를 두어 라우트 단위로 막았다.
3. **키 라우트는 `SAJU_API_KEY`가 설정돼 있어야만 닫힌다**(기존 설계, 미설정이면 open). LC 머지 조건 (다)로 코드화했다: 키 미설정 키 라우트도 L2 4블록을 거절한다(`KEYLESS_DENIED_INCLUDES`). 그래서 «키 없이 노출 0»은 env와 무관하게 성립한다. env 설정 여부는 사용자 확인 목록 2에 남긴다(설정 시 (다)는 안전망).
4. **S-YNY**: GOLDEN-PILLARS 출처 규칙상 일주는 외부 출처가 필요하다. LC 일수 세기(유도)는 출처가 되지 못한다 → 보류.
5. **메모리 압박**: 다른 세션의 전체 스위트와 겹쳐 PR2 첫 verify가 Claude Code에 의해 중단됐다. 그 뒤로는 LC «가» 슬롯 규약을 따랐다.
6. **검증 정본**: 전체 verify는 PR4 끝에서 1회(PR3 포함)였다. #125 단독 verify는 따로 돌리지 않았다. #125는 #126의 부분 집합이고, CI가 PR마다 돈다.

## 규칙 md 보강 제안 4건(LC 재계산 §요약) 처리

- ① 수용(#123): `SINSAL.md` 자기 제외는 삼합 기준에만 적용한다고 명시.
- ② 수용(#123): 양인 음간은 적중 없음.
- ③ 수용(#123): k-6 출처 문구.
- ④ 보류(#123): `TENGODS` 규칙 md는 신설하지 않고 GOLDEN-TENGODS 참조 1줄만 두었다. 정의가 이미 confirmed 골든 머리에 있고, 신설은 범위 밖이다.

## LC·사용자에게 필요한 것

- LC: 이 인계 PR 게이트.
- 사용자: 아래 확인 목록. 전부 기본값으로 진행 중이라 막힌 것은 없다.

## 사용자 확인 목록 (기본값으로 진행 중)

1. **S-YNY 일주 출처**: (a) 복귀 뒤 data.go.kr `getLunCalInfo` 2회 조회 / (c) 보류. 기본값은 **(c)**.
2. **(신규) 프로덕션 `SAJU_API_KEY` 설정 여부**: 미설정이면 키 라우트가 L1·5~7단계 블록을 키 없이 내는 기존 상태가 그대로다. L2 4블록은 조건 (다)로 막힌다. Vercel env 확인은 사용자 몫.
3. **(신규) PR4로 키 라우트에 9단계 4블록이 공개된다**(데이터 블록만). 화면·유료 리포트 노출은 0이고, keyless 앱 라우트는 거절한다.
4. 층 노출 범위 재확인(`docs/design/l2-include-design.md` §4 «제안 기본값» 열). 결정 전에는 화면 0 · keyless 0.
5. 이전 REPORT(sinsal) 확인 목록 1~6은 그대로다(괴강 판본 · 의존 블록 «안 함» · monthBranch 안 A는 이번에 집행).

## 남은 것 · 다음 (우선순위)

0. **다음 HO 첫 항목(#126 LC 관찰 ①)**: `KEYLESS_DENIED_INCLUDES`가 리터럴 4개다. 다음 L2 블록을 추가하면 keyless 면이 기본 개방(fail-open)된다. `INCLUDE_BLOCKS`와 게이트 표에서 파생하거나, 집합 일치 테스트 1건을 둔다.
1. S-YNY 2행 편입(사용자 (a) 결정 뒤): GOLDEN-PILLARS 선등록 → 8a 2행 confirmed → `golden-strength-factors.test.ts`의 `toHaveLength(50)` 제거.
2. 층 노출 결정 뒤 UI HO: apps/web 화면과 유료 리포트(`generatePaidReportV1`)의 블록 사용. 사람 대면 문장은 13단계 + `saju-domain`.
3. 선택: synthetic factors의 «월 장간 = hiddenStemList(monthBranch)» 불변식 테스트(#125 critic 관찰).
