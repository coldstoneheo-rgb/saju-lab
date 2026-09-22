# HO-2026-0922-saju-L1-stage12-01 — REPORT

- 발주서: life-coordinator `handoffs/HO-2026-0922-saju-L1-stage12-01.md` (LC main `86d0324`)
- 워커: saju-lab 세션 (Claude Opus 5), 2026-09-22. 착수 시점 main `395a4bb`.
- 순서: **PR 2(시간대 이력) 먼저**, PR 1(골든 표)은 일주 출처(data.go.kr 음양력 API 활성화) 통보 뒤 — LC 합의.
- §6 반박 5건 LC 수용: `resolution` 응답 최상위 · 표 행수 실측 · DST 전이 시각 tzdb 원문 · C5 범위 1920~1961 · `GOLDEN_FIXTURES` 처분은 PR 1.

## PR 2 — 한국 시간대 이력 정규화 (2단계) · 브랜치 `feat/l1-timezone-history`

### 요약
1908~1961년의 UTC+8:30 표준시 구간과 서머타임 12연도(1948-51·55-60·87-88) 출생은 그날 시계값이 KST가 아니다.
`normalizeToKstWallClock()`이 입력 벽시계를 `kst = local − (offsetAt(local) − 540분)`으로 환산하고, 절입 비교·일주·시주가
전부 환산값을 쓴다. 2000년 이후 값은 바뀌지 않는다(선행 게이트 테스트가 첫 커밋 `62be49e`에서 증명).

### C2 — 선행 게이트 (첫 커밋 `62be49e`)
`saju-pillars-v1.test.ts` «values pinned before timezone normalization»: main `395a4bb`에서 뽑은 **응답 3건 전체**(pillars 4기둥 + fiveElements 4필드, `deficient` 포함)를 고정 — 1975-03-21 10:30 · 2011-11-08 05:00 · **2010-06-21 23:00(23시대)**. 정규화 도입 후에도 통과.

### 구현
| 파일 | 내용 |
| --- | --- |
| `packages/saju-core/src/timezone-history.data.ts` (신규) | 표준 4구간(1908-04-01 +08:30 → 1912-01-01 +09:00 → 1954-03-21 +08:30 → 1961-08-10 +09:00; 1945-09-08은 오프셋 무변화라 행 없음) + 서머타임 12행. 행마다 tzdb 2026d 원문(`Zone Asia/Seoul` / `Rule ROK`) 인용 + 벽시계 전이 설명. `partition()`이 표준 구간을 서머타임 앞뒤로 쪼개 **28행**(전이 28시각)으로 타임라인을 분할. 1908-04-01 이전(LMT 8:27:52)은 미지원(throw → v1 `OUT_OF_SUPPORTED_RANGE`) |
| `timezone-history.ts` (신규) | `normalizeToKstWallClock(local)` → `{ kst, resolution: { appliedOffsetMin, flags } }`. 되감기 중복 시각은 **첫 발생(서머타임/전이 전) 채택 + `ambiguous`**, 건너뛴 시각은 **전이 전 오프셋 유지 + `nonexistent`**. 시각 미상은 정오 기준 오프셋만 보고, 날짜 불변 |
| `pillars.ts` | `calculatePillarsWithResolution()` 신설, `calculatePillars()`는 그 `.pillars`. parse 직후 정규화 1회, 이후 전부 kst. `PillarsResult` 불변 |
| `solar-terms.ts` | `effectiveSolarYear/solarMonthBoundary(dateTime, boundaryDateSlackDays = 0)` — 오프셋 ≠ 0인 날은 시각 미상 입력의 경계일 판정을 **전날·다음날**까지(V7 충돌 1). 오프셋 0이면 기존 동작 |
| `saju-pillars-v1.ts` | 응답 최상위 `resolution` 추가(additive). 요청·에러 코드 변경 0 |
| `index.ts` | `calculatePillarsWithResolution`, `normalizeToKstWallClock`, `KOREA_OFFSET_INTERVALS`, 타입 export |
| `apps/web/src/calculation-coverage-copy.ts` | 「1961년 8월 9일 이전 출생과 서머타임 시행 연도 … KST 기준으로 환산」 1줄 |
| `docs/algorithms/SOLAR_TERM_SPEC.md` · `docs/SAJU_PILLARS_API_V1.md` | «한국 시간대 이력 정규화» 절 · `resolution` 필드 문서 |

### C3 — Intl 대조 + 예제
- `timezone-history.test.ts` «matches Node ICU (tz 2025b) one minute before and after every transition»: 28행 전부 `fromUtc` −1분 = 이전 행 오프셋, `fromUtc` = 해당 행 오프셋을 `Intl.DateTimeFormat("Asia/Seoul", longOffset)`로 확인. 첫 행은 LMT→+08:30 전이(15:32:08Z)의 **다음 온분(15:33Z)**에서 시작 — 분 단위 표라 8초 뒤로 둔 것(1920년 이전이라 계산 영향 0).
- 예제(고정): **1955-02-04 22:50**(+08:30) → 23:20 KST → 입춘 23:18 후 = **을미년 무인월**, `{appliedOffsetMin: -30, flags: ["utc+8:30"]}`; 22:47 → 갑오년 정축월. **1988-10-09 02:30** → `ambiguous`, 01:30 KST. **1961-08-10 00:15** → `nonexistent`, 00:45 KST; 00:30부터 평범. 추가: 1948-09-12 23:30 ambiguous(자시 되감기), 1954-03-20 23:45 ambiguous(+09:00 첫 발생), 1987-05-10 02:30 nonexistent, 1959-07-01 09:15 → 08:45(`utc+8:30`+`dst`), 일주 전환(1955-02-04 23:45 → 02-05 일주), 1988-06-15 13:10 → 오시.
- 스파이크의 1955 입춘 테스트는 정규화 의미로 재작성: 벽시계 22:47/22:48이 경계(= KST 23:17/23:18).

### C4 — 불변
`npm run verify`의 골든 2건(1990·2024)·핀 3건·2024 인벤토리·200건 1950~99 전부 통과. baby 소비 필드 스키마·산식 변경 0, 추가는 `resolution` 1개.

### C5 — 200건 + 100건
- 1950~1999 200건(스파이크 테스트) 계속 통과(정규화 후에도 400 0건).
- 1920~1961 + 1987·88 **100건**(시드 19540321 LCG): 400 **0건**, `appliedOffsetMin ≠ 0` **19건**, flags `utc+8:30` 14 · `dst` 8(스냅샷 `__snapshots__/timezone-history.test.ts.snap`에 고정).

### C6 — 게이트
`npm run verify` exit 0 — typecheck · test **180**(api 17 + saju-core 131 + web 32) · build · audit(low 1) · diff --check. CI 결과는 PR 체크.

### 하지 않은 것
진태양시 · 분 단위 시주 · 23시 플래그(3단계) · 해외 시간대 · 폴더 재배치. 웹 UI에 `resolution` 표시는 범위 밖(카피 1줄만).

## PR 1 — 골든 명식 표 정본화 (1단계) · 브랜치 `feat/golden-pillars-table`

### 요약
`docs/golden/GOLDEN-PILLARS.md`가 기대 사주의 정본이 됐다. `golden-pillars.test.ts`가 md를 **열 이름으로 직접 파싱**해
`calculatePillars`와 대조하고, 출처 빈칸·「commonly listed」류는 파서 실패다. 기존 `fixtures.ts` 5건은 출처를 채워 이관했고
파일은 **폐기**(외부 소비 0 — `index.ts`의 `export *`만 있었고 web·api import 0). 테스트 3파일(`five-elements`·`index`·`saju-pillars-v1`)은
`golden-pillars.load.ts`(테스트 전용 로더, index.ts 미수출)를 공유한다.

### 출처 경로 (사용자 결정 ⓐ + ⓓ 보조)
- 연·월주: KASI 24기 표의 해당 절입 행(파일·시각·전/후를 출처 열에 명기).
- 일주: data.go.kr 「한국천문연구원_음양력 정보」 `getLunCalInfo`의 `lunIljin`(활용신청 승인 2026-09-22 13:17, 사용자). `scripts/fetch_golden_day_pillars.py`가 날짜 → `lunIljin` 로마자 + 요청 URL(키 마스킹)을 표 행으로 출력. **함정(LC FYI)**: 같은 응답의 `lunSecha`·`lunWolgeon`은 음력 연·월 간지라 사주 연·월주가 아니다 → 쓰지 않는다.
- 시주: 일간 기준 오자둔(五子遁) 규칙의 결정론 값이라 별도 출처 없음(표 머리말에 명기).
- ⓓ lunar-typescript 교차 검산은 이번엔 쓰지 않았다(비고 열 규약만 마련).

### C1 — 케이스 11건 (출처 전부 채움) · 네거티브 6건
| id | 입력 | 범주 | 특기 |
| --- | --- | --- | --- |
| g-1990-01-01-1030 | 1990-01-01 10:30 | 기본 | HO-A 골든(金 부재), 이관 |
| g-2000-02-04-1200 | 2000-02-04 12:00 | 절기경계 | 입춘 21:40 전, 이관 |
| g-2010-06-21-2359 | 2010-06-21 23:59 | 기본·23시대 | 이관 |
| g-2015-12-22-0030 | 2015-12-22 00:30 | 기본 | 이관 |
| g-2024-02-04-1727 | 2024-02-04 17:27 | 절기경계 | 입춘 동시각, 이관 |
| g-2011-11-08-0334 / 0335 / 0925 | 2011-11-08 | 절기경계 | 스파이크 C9 회귀 3점 |
| g-1955-02-04-2247 / 2248 | 1955-02-04 | UTC+8:30·절기경계 | PR 2 예제(22:48 = KST 23:18 입춘) |
| g-1988-10-09-0230 | 1988-10-09 02:30 | DST | 서머타임 종료 중복 시각, flags dst·ambiguous |

일진 대조 결과: API `lunIljin` 8일자(1990-01-01 병인 · 2000-02-04 임진 · 2010-06-21 임인 · 2015-12-22 임신 · 2024-02-04 무술 · 2011-11-08 정묘 · 1955-02-04 병신 · 1988-10-09 정유) **8/8이 코어의 일주와 일치** — `cycle.ts:63`의 «1990-01-01 = 병인일» 앵커가 KASI 일진과 처음으로 외부 대조됐다.
네거티브: 출처 빈칸 · 「commonly listed」 · 한자 라벨 · 검증자 빈칸 · 시각/시주 불일치 · 표 없음 → 전부 `GoldenTableError`.

### 게이트
`npm run verify` exit 0 — test **217**(api 17 + saju-core 168 + web 32). CI 결과는 PR #70 체크.

### 하지 않은 것
케이스 수집(역술가·사용자 트랙 — 이 표가 착지점) · 음력 케이스(4단계) · lunar-typescript 교차 검산 열.
