# DESIGN — 9단계 L2 include 개방 (설계만, 코드 0)

- **상태: 초안 → LC 게이트 대상.** 저자 = saju-lab 워커(Claude Opus 5.5), 2026-10-26. 발주 = LC `HO-2026-1026-saju-sinsal-01` 완료 조건 6.
- **범위:** 8b `strengthReadings` · 8b-2 `yongsinCandidates` · 격국 `gyeokguk` · 신살 `sinsal` 네 블록을 `saju-pillars-v1`의 `options.include`로 여는 방법. 8a `strengthFactors` 블록과 `monthBranch` 필드 여부를 함께 다룬다. 코드·계약 변경은 이 문서의 게이트 뒤 별도 HO.
- **반박 가능:** 블록 이름 · 의존 블록 자동 포함 여부 · 선행 게이트 기준 · 층 노출 범위(사용자 결정).

## 0. 요약

네 블록은 지금 `INVALID_OPTIONS`로 거절된다(`SAJU_PILLARS_API_V1.md` include-only 규칙, 테스트 = `strength-readings.test.ts`·`yongsin-candidates.test.ts`·`gyeokguk.test.ts`·`sinsal.test.ts` «공개 계약»). 9단계는 ① 블록마다 이름을 열고 ② 기본 응답 바이트를 그대로 두며 ③ 골든 `confirmed` 여부로 블록 노출을 막는 **선행 게이트 테스트**를 같이 넣는다. 유료/무료 층은 API 계약이 아니라 **앱(apps/web)·서버 라우트 쪽 노출 정책**으로 둔다 — 코어와 `saju-pillars-v1`은 층을 모른다.

## 1. 블록 표

| include 이름 | 코어 함수 | 입력 | 응답 키 | 레코드 공통 라벨 | 선행 게이트(골든) |
| --- | --- | --- | --- | --- | --- |
| `strengthFactors` | `strengthFactorsOf(pillars, birthKst, {school})` | 명식 + KST + 학파 | `strengthFactors` (객체 1) | `school` · `precision` | `GOLDEN-STRENGTH-FACTORS.md` 50행 전부 `confirmed` |
| `strengthReadings` | `strengthReadingsOf(factors)` | 8a | `strengthReadings` (배열, ruleSetId 순) | `school` · `precision` · `doctrine: "unreviewed"` | 8a 게이트 + `GOLDEN-STRENGTH-READINGS.md` 50 `confirmed` |
| `yongsinCandidates` | `yongsinCandidatesOf(factors, readings)` | 8a + 8b-1 판독 | `yongsinCandidates` (배열) | 같음 | 8a 게이트 + `GOLDEN-YONGSIN-CANDIDATES.md` 50 `confirmed` |
| `gyeokguk` | `gyeokgukReadingsOf(factors)` | 8a | `gyeokguk` (배열, ruleSetId 순) | 같음 + `agreesAcrossSets` | 8a 게이트 + `GOLDEN-GYEOKGUK.md` 56 `confirmed` |
| `sinsal` | `sinsalOf(pillars)` | 명식만 | `sinsal` (배열, 변형 순) | `precision` · `doctrine` | `GOLDEN-SINSAL.md` 50×변형 `confirmed`(8a와 무관) |

- **실행 축 vs 학설 축**: 선행 게이트는 «코어가 표대로 실행했는가»(실행 축, LC 재계산으로 닫힘)만 본다. «표가 명리학적으로 맞는가»(학설 축)는 G2-3 전까지 열리지 않으므로 게이트로 쓰지 않고, 응답 레코드마다 `doctrine: "unreviewed"`로 싣는다.
- 게이트 테스트 형태(제안): 블록별 골든 md를 파싱해 `상태`가 전부 `confirmed`가 아니면 그 블록의 «개방됨» 테스트가 실패한다. 즉 개방 PR은 골든 confirmed PR 뒤에만 green이 된다.

## 2. 요청 · 응답 형태 (제안)

```jsonc
// 요청
{ "birthDate": "1988-10-09", "birthTime": "02:30", "calendar": "solar", "sex": "male",
  "options": { "include": ["gyeokguk", "sinsal"], "hiddenStemSchool": "yeonhae" } }
// 응답 data — 기존 키는 그대로, 요청한 블록 키만 덧붙는다
{ "...기존 키...": "…", "gyeokguk": [ /* GyeokgukReading × 3 */ ], "sinsal": [ /* SinsalHit … */ ] }
```

- **의존 블록은 자동으로 붙이지 않는다**(제안). `yongsinCandidates`만 요청해도 응답에 `strengthReadings`를 싣지 않는다. 코어는 내부에서 8a·8b-1을 계산하되 응답 키는 요청한 것만. 이유: include-only 규칙(«적은 블록만 붙는다»)을 깨지 않는다. 대안 = 의존 블록 자동 포함(소비자 편의) — 반박 가능.
- `hiddenStemSchool`은 8a 이후 블록 전부에 그대로 적용(지장간 블록과 같은 옵션 1개).
- 시각 미상: 블록은 붙고 레코드마다 `precision: "time-unknown"`. 기존 `meta.confidence`는 바뀌지 않는다.
- `alternates`(야자시·진태양시 대안 명식)의 L2 블록은 v1 제외 — 주 명식만(8단계 설계 §6과 같음).
- 알 수 없는 블록 이름은 지금처럼 `INVALID_OPTIONS`. 열린 블록 목록은 오류 메시지 문자열(`saju-pillars-v1.ts` 277행)과 `SAJU_PILLARS_API_V1.md` 54행을 함께 바꾼다.

## 3. 8a `monthBranch` 필드

| 안 | 내용 | 장점 | 단점 |
| --- | --- | --- | --- |
| A (제안) | `StrengthFactors`에 `monthBranch: Branch` 추가, 격국 `monthBranchOf` 우회 삭제 | 격국 코드가 단순해짐 · 소비자도 월지를 직접 읽음 | 8a 출력 키 변경 → 8a 골든 confirmed 뒤라면 키 집합 테스트·팩 렌더러 갱신 필요(값은 불변) |
| B | 지금처럼 장간 목록에서 되찾기 유지 | 8a 변경 0 | 우회가 남음(학파마다 12지 장간 목록이 유일하다는 가정에 기댐 — 테스트 고정) |

- 순서 제안: 8a confirmed PR → `monthBranch` 추가 PR(값 변경 0, 키 1개 추가) → 9단계 개방 PR. 8a confirmed 전에 키를 바꾸면 LC 재계산 대상이 흔들린다.

## 4. 층 노출 범위 — 사용자 결정 표

코어·API는 층을 모른다. 아래는 **apps/web 화면과 유료 리포트(`generatePaidReportV1`)가 어떤 블록을 쓰는가**의 결정이다. 가격·약관 문안은 이 문서 밖(멈출 곳).

| 블록 | 제안 기본값 | 대안 | 결정 |
| --- | --- | --- | --- |
| `strengthFactors` (팩터 사실) | 무료 화면에 요약만(득령·득지·득세 칩) | 유료만 | 사용자 |
| `strengthReadings` (강약 판독) | 유료 리포트만 | 무료에 «세트별 판독이 갈린다»만 | 사용자 |
| `yongsinCandidates` (용신 후보) | 유료 리포트만 | 비공개(내부 생성 재료로만) | 사용자 |
| `gyeokguk` (격국 취격) | 유료 리포트만 | 무료에 격 이름만 | 사용자 |
| `sinsal` (신살) | 무료 화면에 이름 칩(설명은 13단계 문장 뒤) | 유료만 | 사용자 |
| 외부 소비자(`/api/saju-pillars` 키 게이트, baby-naming-ai 등) | 블록 개방 = 계약 공개. 층 구분 없음 | 서버 라우트별 허용 블록 목록 | 사용자 |

- 어느 층이든 사람 대면 문장은 13단계 + `saju-domain` 스킬 뒤에만 나간다. 9단계 개방은 «데이터 블록»까지이고, 화면 노출은 별도 UI HO.
- 블록 데이터에는 길흉·추천 필드가 없다(각 블록 어휘 가드 테스트). 층 결정이 이 성질을 바꾸지 않는다.

## 5. 완료 조건 (9단계 착수 HO용, 제안)

| # | 조건 | 판정 |
| --- | --- | --- |
| I1 | 블록별 선행 게이트 테스트(골든 `confirmed` 아니면 실패) | 테스트 |
| I2 | 기본 응답 바이트 스냅샷 불변 | 스냅샷 |
| I3 | 블록별 응답 키 스키마 테스트 + `INVALID_OPTIONS` 목록 갱신 | 계약 |
| I4 | `SAJU_PILLARS_API_V1.md` 블록 절 + 예시 1건씩 | 문서 |
| I5 | 8a `monthBranch`(안 A 채택 시) 별도 PR | 키 집합 |
| I6 | verify EXIT 0 · verifier PASS · LC 게이트 | G3 |

## 6. 사용자 확인 목록

1. 층 노출 범위(§4 표) — 기본값 = 표의 «제안 기본값» 열. 결정 전에는 9단계가 데이터 블록만 열고 화면 노출 0.
2. 의존 블록 자동 포함 — 기본값 **안 함**.
3. 8a `monthBranch` — 기본값 **안 A**(8a confirmed 뒤 별도 PR).
