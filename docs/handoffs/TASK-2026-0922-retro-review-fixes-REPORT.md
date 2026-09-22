# TASK-2026-0922-retro-review-fixes — REPORT

- 발주: LC 메시지 09-22 19:3x(보정 TASK) + 20:0x(TASK-ADD A12 확장 P2) + 21:1x(VERDICT #80 지시 2·3: 골든 대운표 confirmed + D1~D5·미검증 4). 판정 정본 `life-coordinator/docs/CODE-REVIEW-2026-0922-saju-l1-l2.md` · `docs/GOLDEN-CANDIDATES-2026-0923.md` §1 · `docs/CODE-REVIEW-2026-0922-saju-pr80-daeun.md`. **origin**: 세 메시지 모두 사용자 원문 인용 없음 → §8-2에 따라 `lc`로 취급(실행 동일, 반박은 §6). 머지 게이트(09-22 18:3x 사용자 지시)는 origin:user.
- 브랜치 `fix/retro-review-2026-0922`, main `786a214`(#80 머지 뒤) 기반. 7단계 PR과 분리. 명식·십신·합충·대운 **값 변경 0**(골든 4표 전부 그대로 통과).

## 항목별 처리
| # | 처리 | 파일 | 테스트 |
| --- | --- | --- | --- |
| **A1** | `BirthTimeRequiredError` 클래스 신설(`solar-terms.ts`), v1이 `MISSING_BIRTH_TIME`(field `birthTime`, 「절기 경계일」 메시지)로 매핑 | `solar-terms.ts` · `saju-pillars-v1.ts` · `index.ts` export | `retro-review-2026-0922.test.ts` 「A1」 2건(1958-02-04 timeUnknown → 코드·필드·메시지, 비경계일 통과) |
| **A2** | `solarDate` 의미를 「입력 시계의 양력 날짜」로 명시하고 **`kstDate` additive 추가**(정규화 KST 날짜). 기존 키 불변 | `pillars.ts` `CalendarResolution` | 「A2」(1958-06-11 00:15 → solarDate 06-11 · kstDate 06-10 · 일주 = 06-10 것) + 기존 3 테스트 기대값에 kstDate 추가 |
| **A3** | `dayMidnight` 창 `{before: 10, after: 34}`(hourBranch와 같은 논리) | `pillars.ts` | 「A3」 2건(00:33 전남 trueSolar+trueSolar 경계 → 일주 전날 + dayMidnight 경고 · 33/34/35분 창) + `stage3-options.test.ts` 갱신 |
| **A4** | 최상위 키의 **대소문자 변형만** 400 `INVALID_BODY`(field = 원 키, 메시지에 정식 키) · `timeUnknown` boolean 아니면 400. 모르는 키는 계속 무시(baby 호환) | `saju-pillars-v1.ts` `KNOWN_BODY_KEYS` | 「A4」 2건(`birthplace`·`TimeUnknown` 거부, `clientVersion` 통과, `"true"` 거부) |
| **A5** | 골든 합충 파서를 **md 규칙표 기반 오라클**로 재작성: 셀(글자·기둥) + `docs/rules/INTERACTIONS.md` 표에서 `id·complete·element·subtype·adjacent·shared` 전부 유도 → 코드 산출과 **정렬 집합(전 필드 canonical JSON) 비교**. `interactions.data.ts`를 쓰지 않음. **셀 형식·confirmed 11행 불변**(LC 제안 중 「render 전 필드 + 정렬 비교」 쪽 채택 — md 재생성 불필요) | `l2/golden-interactions.test.ts` · 신규 `l2/interactions-rules.load.ts`(테스트 측 md 파서 공용화) | 15건 + 「오라클이 무은↔지세·water↔fire 교체를 잡는다」 자기검증 |
| **A6** | 문서 에러 표 = 코드 유니언: `UNSUPPORTED_CALENDAR` 제거(유니언·문서·예시), `INVALID_LUNAR_DATE`·`INVALID_BIRTH_PLACE`·`INVALID_OPTIONS`·429 `RATE_LIMITED` 추가, A1·A4 의미 반영. `SAJU_PILLARS_V1_ERROR_CODES` 상수 export | `saju-pillars-v1.ts` · `docs/SAJU_PILLARS_API_V1.md` | 「A6」 문서 표 400 코드 집합 == 상수(파서) · 401/405/429 존재 · **C: 400 코드 11종 각 1입력으로 도달** |
| **A7** | `hiddenStemsOf` 복사 반환(테이블 공유 상태 보호) | `l2/hidden-stems.data.ts` | 「A7」 반환값 변형 → 다음 호출 불변 |
| **A8** | 포섭 판정에 `kind` 비교 추가 | `l2/interactions.ts` | 기존 포섭 테스트 유지(v1 표에서는 관측 불가 — 방어) |
| **A9** | `shared` = **같은 `id`** 안에서 기둥 공유. md 위치 규칙·API 문서 갱신. **골든 confirmed 값 불변**(파서 통과) | `l2/interactions.ts` · `INTERACTIONS.md` · API 문서 | 「shared is scoped to the same rule id」: v1 표에서 지지 하나가 kind마다 규칙 ≤1개라 kind/id 기준이 일치함을 **불변식으로 고정** + 甲己 2건 shared / 甲己·丁壬 비shared |
| **A10** | `tenGodOf` 미지 천간 throw | `l2/ten-gods.ts` | 「A10」 |
| **A11** | md 헤딩 정규식 `` `([^`]+)` `` | `interactions-rules.load.ts` · `hidden-stems-rules.load.ts` | 기존 C1 테스트 통과 |
| **A12** | 골든 파서 달력 열 `lunar` · `lunar(윤달)` → `input.calendar/isLeapMonth` | `golden-pillars.ts` · `GOLDEN-PILLARS.md` 머리말 | `golden-pillars.test.ts` 「A12」(정상 2행 + `solar(윤달)`·`julian` 거부) |
| **P2** | 선택 열 `출생지`·`옵션`(`trueSolarTime` · `jaHourPolicy=` · `dayBoundary=`) → `input.birthPlace/options`. REQUIRED_COLUMNS 불변(기존 11행 그대로) | `golden-pillars.ts` `GOLDEN_OPTIONAL_COLUMNS` | 「P2」(3행: 전남 trueSolar+trueSolar · 조자시 · 기본 — 기대 명식 = 옵션 적용 후, `calculatePillars` 대조 · 미지 코드/토큰 거부) |
| **A13** | 십신 골든 중복 id 검출 | `l2/golden-tengods.test.ts` | 「unique ids」 |
| **A14** | `utc+8:30` 정의 문서화(표준시 +8:30 구간, DST 시 +9:30) + 1958-06-11 예시. 코드 불변. 웹 카피는 이미 두 사유를 함께 표기 | API 문서 | — |
| **A15** | DST 개시 결번 시각에 `dst` 동반(`gapInto` 구간 조회) | `timezone-history.ts` | 「A15」(1988-05-08 02:30 → `["dst","nonexistent"]`, 丑시 · 1987-05-10 동일) + `timezone-history.test.ts` 갱신 |
| **B1** | **결함 확정 → 제거.** 후보 `-60`·`1500`은 창 [−10,+34]에 산술적으로 절대 안 걸림(delta ∈ [60,1499] / [−1500,−61]). 자정 넘는 이웃 경계는 23:00(1380)·01:00(60)이 이미 덮는다 | `pillars.ts` | 「B1」(23:34 → 23:00 경계, 00:50 → 01:00 경계, 00:20·23:45 없음) |
| **B2** | 설계 의도 확인 → **문서화로 종결**: nearBoundary 기준 시계 = 정규화 KST(1961-08-10 00:10 예시) | API 문서 | — |
| **B3** | md 표 6에 출처 『삼명통회』 논형 + 이설 1줄(코드 유형 코드는 데이터, 산출 무관) | `INTERACTIONS.md` | — |
| **B4** | 「additive의 정의」 1줄(`additionalProperties: false` 소비자 주의) | API 문서 | — |
| **C 동어반복** | ① `interactions.test.ts` 순수성 테스트 → g-1990 리터럴 기대값 ② 십신 골든 `toBe(20)` → **HIDDEN-STEMS.md 두 표의 장간 차분 × 골든 지지 출현**으로 유도한 `predicted`와 비교(구현을 돌려 센 수 아님) ③ 합충 골든 정렬 집합(A5) ④ **pending 상한 20%**(`MAX_PENDING_RATIO`) 3표(십신·합충·대운) 적용 — 현재 pending 0 | 각 테스트 | — |
| **C 미검증 6** | v1 에러 코드 11종 각 1입력 · `early`×`trueSolarTime`(23:20 전남 → 22:46 亥시라 일주 유지, 23:50 → 23:16 子시라 +1일) · `dayMidnight` 33~34분×−34 · 조자시 +1일이 절입 넘는 날(1921-12-07 23:30, 대설 12-08 00:11 → 월주 亥 유지·일주 +1) · DST 결번 1988-05-08 02:30 · 음력×비KST(음력 1958-04-24 = 양력 06-11 00:15 → kstDate 06-10) | `retro-review-2026-0922.test.ts` | 6건 |
| **D1** | 절단 시 남은 마지막 주 `endsAt`을 2100-12-07로 **클램프**(산술 확인: 2010년생 8번째 주 endsAt 2105 > 표 끝). 첫 주부터 넘으면 `periods: []` | `l2/daeun.ts` · `DAEUN.md` · `GOLDEN-DAEUN.md` 머리말 | 「D1」 2건(클램프 · 2100-11-30 출생 `[]`+truncated+current null) |
| **D2** | 학파는 십신만 변경 — md·API 문서 1줄 + 테스트 | `DAEUN.md` · API 문서 | 「D2」(간지·나이·날짜 동일, school 표기) |
| **D3** | 시각 미상 = 두 층 모두 정오·오프셋 미적용 — 문서 + 테스트(1988-06-15 미상 vs 13:00 DST = 12:00 KST 동일 거리) | `DAEUN.md` | 「D3」 |
| **D4** | 시주·일주 옵션은 거리·간지·날짜 무영향 — **실측 정정**: 일주가 바뀌면 동봉 십신은 바뀐다(십신은 일간 기준). 단언은 십신 제외 비교 + 십신 변동 확인 | `DAEUN.md` · API 문서 | 「D4」 |
| **D5** | `current` null 조건 3가지 md + 테스트(첫 주 전 · 마지막 주 뒤 · `[]`) | `DAEUN.md` · API 문서 | 「D5」 |
| **미검증 4(대운)** | 음력+대운(음력 1989-12-05 = 양력 1990-01-01 동일) · API other 두 벌 · referenceDate 마지막 주 이후 null · index 0 절단 | `daeun.test.ts` | 4건 |
| **골든 대운표** | 16행 `pending` → `confirmed`, 출처 = 「코어 산출 2026-09-22 · LC 검산 2026-09-22: 독립 재계산 16/16 + 리뷰 에이전트 손계산(`…/CODE-REVIEW-2026-0922-saju-pr80-daeun.md`)」. 머리말에 페르소나 생략 근거 | `GOLDEN-DAEUN.md` · `golden-daeun.test.ts` | confirmed 16 + 출처 인용 + 행 유일성 |

## 완료 조건
- `npm run verify` exit 0 — test **388**(api 17 + saju-core 334 + web 37). `git diff --check` 0.
- **include 없는 응답 바이트 동일**: 테스트 유지(include 유무 비교). **단 A2로 `resolution.calendar.kstDate` 키가 additive 추가**되어 이전 배치 대비 바이트는 달라진다 — A2 지시(「둘로 분리」)와 「바이트 동일 유지」 중 A2를 택했고, baby 미소비 필드라 소비 계약은 불변. 반대면 kstDate를 include 블록 뒤로 옮길 수 있음(1줄).
- baby 소비 필드(`pillars`·`fiveElements`) 불변.
- 라이브 A1·A3·A4 재현 3건(`1958-02-04 timeUnknown` → `MISSING_BIRTH_TIME` · `1990-06-15 00:33 jeonnam trueSolarTime+trueSolar` → `nearBoundary dayMidnight` · `"birthplace":"jeju"` → `INVALID_BODY`)은 머지·배포 뒤 LC curl.

## 반박·정정 (§6)
| 항목 | 내용 |
| --- | --- |
| A5 방식 | 「셀 형식 확장」 대신 「md 오라클 + 전 필드 정렬 비교」. 셀·confirmed 불변, 오라클이 코드 표와 독립(`interactions.data.ts` 미참조). 원하시면 셀 형식 확장으로 바꿀 수 있으나 정보 중복 |
| A9 관측성 | v1 표에서 kind 기준과 id 기준은 **항상 같은 값**(지지 하나가 kind마다 규칙 ≤1). 「辰辰 자형 + 丑戌 부분형이 서로 shared」는 두 관계가 같은 기둥을 공유해야 하는데 辰 기둥이 丑戌未 규칙에 들 수 없어 발생 불가. 규칙 변경은 미래 표(파·해) 대비 스펙 강화로 채택, 불변식 테스트로 근거 고정 |
| C pending 상한 | 20% 채택. **새 단계의 골든표는 100% pending으로 시작**하므로 상한은 confirmed 기입과 같은 PR에서 켜는 운영 규칙이 필요 — 이번엔 세 표 모두 confirmed라 즉시 적용. 다음 단계(8단계) 골든표는 confirmed PR에서 상한을 켠다 |
| D4 | 「무영향」은 거리·간지·날짜에 한함. 십신은 일간 종속이라 일주가 바뀌면 바뀐다 — 문서에 명시 |
| B1 | LC 「확인 후 제거 또는 의도 복원」 → 산술로 죽은 항목 확정, 제거 |
| A4 | 대소문자 변형만 거부·미지 키 무시. `birthdate`·`Sex`처럼 필수 키의 변형은 그 뒤 필수 검증에서도 걸렸겟지만(`INVALID_CALENDAR` 등 오도) 이제 `INVALID_BODY`가 먼저 정확한 키를 알려준다 |

## 골든 후보 표 §6 열린 질문 — 현행 동작 (설계 결정은 LC)
- **D3 (1987-05-10 02:30, 존재하지 않는 시각)**: 거부하지 않는다. 벽시계 그대로(02:30 KST, 전이 전 오프셋 0) 계산하고 `flags: ["dst","nonexistent"]`(A15 뒤). 시주 = 丑시. 골든 표에 넣을 수 있는 형태(기대값 1개 + 플래그).
- **Q4 (진태양시 보정이 자정을 되감는 경우, 전남 00:20 → 23:46 전일)**: 기본 `dayBoundary: "midnight"`이면 일주는 **KST 날짜 그대로**(되감지 않음), 시주는 보정 시계로(子시). `dayBoundary: "trueSolar"`이면 일주가 **전일로 되감긴다**. 두 정책 다 코드 존재·테스트(「Q4」) 고정. 골든에 넣으려면 옵션 열로 어느 정책인지 명시해야 한다(P2 열로 가능).

## 하지 않은 것
골든 행 추가(G1-2, 내일 TASK) · 8단계 입력 · 파·해 · 코어 값 변경.

## 검토 (verifier 서브에이전트) — PASS, 권고 2 반영
- 골든 값 불변(십신·합충 diff 0, 명식 머리말만, 대운 상태·출처 열만) · A1 다른 generic Error는 여전히 `OUT_OF_SUPPORTED_RANGE` · A4 `contract` 키 허용·미지 키 무시 · A5 오라클은 `interactions.data.ts`를 타입만 import(런타임 미참조), canonical이 전 키 비교, adjacent/shared 독립 재구현 · A9 코드↔md 일치, 12지 파티션 수기 확인 · A15 1988-05-08(dst+nonexistent)·1961-08-10(utc+8:30+nonexistent, std→std라 dst 없음) 수기 재계산 일치 · D1 마지막 유지 주만·startsAt 불변 · 도메인 불변 PASS.
- 권고 반영: ① API 문서 대운 블록의 「pending」 문구 → confirmed로 정정 ② 불변식 테스트에 samhap·banghap(12지 각 정확히 1국) 추가.
- 리뷰봇 코멘트: PR 열린 뒤 확인(0이면 0으로 기재).
- 리뷰봇 코멘트: **0**(PR #81).
- **LC 판정(09-22 22:5x) 조건부 머지 가 → 조건 반영**: ① 루트 빈 파일 `8` `git rm` ② API 문서 31행(calendar 열 「solar만」 → lunar 지원 안내)·45행(제거된 코드명 문구)·169행(dayMidnight 예시 [−10,+34])·244행(lunar curl 예시 400 → 200) 정정 ③ A6 파서 테스트를 문서 전체 스캔으로 확장(에러 코드형 토큰 전부 유니언+라우트 코드 안에 있어야 함 — 확장 직후 45행 잔존 코드명을 실제로 잡아 정정) ④ `types.ts:24` 주석 「stage 4와 바이트 동일」 → 「include 유무 간 동일」. verify exit 0(388).
