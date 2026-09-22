# HO-2026-0922-saju-L1-stage3-01 — REPORT

- 발주서: life-coordinator `handoffs/HO-2026-0922-saju-L1-stage3-01.md` (LC main `e986505`)
- 워커: saju-lab 세션 (Claude Opus 5), 2026-09-22. 착수 시점 main `24be32a`.
- §6 반박 5건 LC 수용: C1 = 기존 필드 값 동일(+신규 필드만) · 경계 창 = 벽시계 [B−10, B+34] · 웹은 로컬 재계산 · `alternates` 규약(반대쪽·같으면 생략·시각 미상 생략·dayBoundary 제외) · 시·도청 좌표 Wikidata 출처.

## PR 1 — 코어 + API · 브랜치 `feat/l1-stage3-true-solar-time`

### 요약
시주가 옵션을 갖게 됐다. `options.trueSolarTime`(경도 보정만, 균시차 미적용) + `birthPlace`(17 시·도) · `options.jaHourPolicy`(야자시 `late` 기본 / 조자시 `early`) · `options.dayBoundary`(학파 옵션). 두 명식은 상시 계산되어 반대쪽이 `alternates`에 실리고, `resolution.nearBoundary`가 경계 명식을 표시한다. 옵션 미지정 응답의 기존 필드는 그대로다.

### 구현
| 파일 | 내용 |
| --- | --- |
| `types.ts` | `CalculationOptions { trueSolarTime?, jaHourPolicy?, dayBoundary? }`, `BirthInput.birthPlace?`·`options?` (additive — 웹·API 동형) |
| `birth-place.data.ts` (신규) | 17 시·도 = 시·도청 좌표(Wikidata P625, 2026-09-22 조회, 행별 QID URL). 보정 = round((경도 − 135) × 4). 서울 126.9778 → **−32**, 범위 −23(울산)~−34(전남·제주) |
| `cycle.ts` | `hourBranchIndexAtMinute(hour, minute)` + `timePillarForDay(dayStem, hour, minute = 0)` — 정수 시 경로 하위 호환(테스트: 24시×5분 전부 동일) |
| `solar-terms.ts` | `minutesFromNearestBoundary(kst)` — 절입 플래그용 |
| `pillars.ts` | 순서 = KST 정규화 → [trueSolar 분 보정] → [dayBoundary] → [jaHourPolicy early: 23시대 익일] → 분 단위 시주. 연·월주는 옵션 무관. `CalculationResolution`(2단계 필드 + `trueSolarTimeApplied`·`trueSolarOffsetMin`·`birthPlace`·`jaHourPolicy`·`dayBoundary`·`nearBoundary`), `alternates` 수집, `NEAR_BOUNDARY_WINDOWS` |
| `saju-pillars-v1.ts` | 요청 `birthPlace?`·`options?` 검증(`INVALID_BIRTH_PLACE`·`INVALID_OPTIONS` 코드 추가), 응답 `resolution` 확장 + `alternates?` |
| `docs/SAJU_PILLARS_API_V1.md` · `SOLAR_TERM_SPEC.md` | 「요청 옵션」·`alternates`·`nearBoundary` 절, **「균시차 미적용」 명문화**, 「진태양시 = 경도 보정만」 |

### C1 — 옵션 미지정 = 기존 필드 값 동일
2단계 선행 게이트 3건(1975·2011·2010-06-21 23:00 응답 전체)·골든 11건·200건·100건 스냅샷 전부 통과. 2단계 `resolution` 핀 2곳만 `toEqual` → `toMatchObject`(신규 필드 허용). 신규 필드 = `alternates`, `resolution.{trueSolarTimeApplied, trueSolarOffsetMin, birthPlace, jaHourPolicy, dayBoundary, nearBoundary}`뿐.

### C2 — 회의 상담 사례 13:10 서울
`1990-06-15 13:10` 옵션 없음 → 시주 **갑미(未)**, `alternates.trueSolarTime = { applied: true, appliedMinutes: -32, pillars: … 시주 갑오(午) }`, `nearBoundary = [{ hourBranch, +10, after }]`. `options.trueSolarTime: true, birthPlace: "seoul"` → 시주 **갑오(午)**(12:38), `resolution.trueSolarTimeApplied: true`, alternates 반대쪽 = 갑미. 연·월·일주 불변. 울산(−23)에서 13:30은 13:07로 未 유지, 서울은 12:58로 午 — 출생지별 차이 고정.

### C3 — 23시대 6점 + 생략 규칙
2010-06-21 23:00·23:59 × late/early: late 일주 임인(壬寅) 유지, early 일주 계묘(癸卯, = 06-22 00:00의 일주), 시주 둘 다 자시. `alternates.jaHourPolicy`는 서로의 반대쪽. 2010-06-22 00:00: late = early, alternates 없음. 시각 미상: alternates 없음·nearBoundary []. 14:00(경계 밖): alternates 없음.

### 경계 창 실측
시지: 13:34 → +34 after, 13:35 → 없음, 12:50 → −10 before, 12:49 → 없음, 13:00 → 0 after. 자정: 23:40 → dayMidnight −20, 00:20 → +20. 절입: 2024-02-04 17:00 → `{ solarTerm, -27, ipchun, 2024-02-04T17:27 }`(+ 17:00 시지 경계 0). 창 상수 `NEAR_BOUNDARY_WINDOWS = { hourBranch: {10, 34}, dayMidnight: {32, 32}, solarTerm: {60, 60} }`.

### dayBoundary 학파 옵션
`00:10` 서울 trueSolar + `dayBoundary: "trueSolar"` → 보정 23:38 전날 → 일주·시주가 전날 23:38과 동일. 기본 `midnight`은 KST 날짜 유지. alternates에는 포함하지 않음(옵션 조합 폭발 방지).

### C6 — 게이트
`npm run verify` exit 0 — test **234**(api 17 + saju-core 185 + web 32). baby 소비 필드 스키마·산식 변경 0.

### 하지 않은 것
균시차(v1.1 후보로 기록만) · 해외 경도 · 음력 · 폴더 재배치 · 웹 UI(PR 2).

## PR 2 — 웹 「계산 규칙」 1줄 · 브랜치 `feat/web-calculation-rule-line`

### 구현
| 파일 | 내용 |
| --- | --- |
| `apps/web/src/calculation-rule-copy.ts` (신규) | `describeCalculationRule(resolution, alternates, label)` — 코어 `resolution`에서 1줄 조립(표준시 이력 · 진태양시 · 일주 경계 · [23시대 정책]) + 경계 프롬프트 + 보정 후 「보정 전 시주 … 어느 쪽으로 봤는지: 경도 보정 명식」. 카피가 계산과 어긋날 수 없게 값에서만 생성 |
| `main.tsx` | `createReportBundle`이 `calculatePillarsWithResolution`을 써 `resolution`·`alternates`를 번들에. 명식 컨테이너(`pillarGrid`) 바로 아래 `CalculationRuleLine`. 경계(`nearBoundary.hourBranch`, 미보정)일 때만 시·도 `<select>`(17개) → 선택 시 **로컬 재계산**(`trueSolarTime:true`+`birthPlace`, 기기 밖으로 나가는 것 0). `alternates.jaHourPolicy`가 있을 때만 `<details>` 「참고 명식 보기」 표(통변 없음). 열람 카운터 = `localStorage["saju-lab-alt-pillars-views"]` 증가(try/catch, 서버 0) |
| `styles.css` | `.calculationRule`·`.boundaryPrompt`·`.alternatePillars` |
| `calculation-rule-copy.test.ts` (신규) | 비경계 3파트 · 경계 프롬프트 · 보정 후 문구(부산 −24) · 1955 +08:30 문구 · early 정책 문구 = 5건 |

### C5 — 스크린샷 (`docs/evidence/2026-09-22-stage3-web/`, 로컬 dev 서버 + Chrome)
| 파일 | 상태 | 확인 |
| --- | --- | --- |
| `1-non-boundary.jpg` | 1990-01-01 10:30 | 1줄 「표준시 이력 해당 없음 · 진태양시 미적용 · 자정 기준 일주」, **안내 0·선택 0·접힘 0** |
| `2-boundary-prompt.jpg` | 1990-06-15 13:10 | 1줄 「진태양시 미적용(서울특별시 기준 -32분 보정 시 시주 변동 가능)」 + ⚠ 경계 안내 + 시·도 선택, 시주 을미 |
| `2b-corrected.jpg` | 위에서 서울 선택 | 시주 **갑오**, 1줄 「진태양시 적용(서울특별시 -32분, 균시차 미적용)」, 「보정 전 … 시주 을 미 — 어느 쪽으로 봤는지: 경도 보정 명식」, 안내 사라짐 |
| `3-ja-hour-alternate.jpg` | 2010-06-21 23:30 | 접힘 「참고 명식 보기 — 23시대를 다음 날로 보는 학파(조자시)」 표(경인·임오·**계묘**·임자), 카운터 증가 실측(localStorage). 23:30은 23:00 시지 창 안이라 경계 안내도 함께 뜸(규칙대로) |

### 게이트
`npm run verify` exit 0 — test **239**(api 17 + saju-core 185 + web 37).

### 하지 않은 것
질문 3개·카드 UI(13단계) · 리포트 본문에 옵션 반영(명식 컨테이너·1줄만) · HTML 내보내기에 `resolution` 포함(후속 후보).
