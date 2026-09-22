# HO-2026-0922-saju-L1-stage4-lunar-01 — REPORT (파트 B, saju-lab)

- 발주서: life-coordinator `handoffs/HO-2026-0922-saju-L1-stage4-lunar-01.md` (LC `9317a7c`). 착수 시점 main `77cfa0a`. 브랜치 `feat/l1-stage4-lunar`, PR 1개.
- §6 3건 LC 수용: B3 케이스 정정(2025-06-15 윤/평 + 네거티브 2) · 표 SHA-256 정의(`0x%07X` LF) · 범위 문구.
- 파트 A(baby) 착지: baby main `db13f2e` `docs/golden/lunar-golden.json`(50건, null 7·윤달 10) + `lunar-golden.meta.json` + `lunar-table.sha256` → saju-lab `docs/golden/`에 그대로 복사, 테스트가 로드. baby의 [ASK](getLunCalInfo 교차 6건)는 이 세션이 조회해 회신(5건 일치, 「2028 평5/15 = 06-13 추정」 1건을 06-07로 정정).

## 구현
| 파일 | 내용 |
| --- | --- |
| `packages/saju-core/src/lunar-calendar.data.ts` (신규) | 151개 26비트 int — Kotlin 원본에서 **스크립트로** 추출(손 전사 0). 비트 규약·출처(KARI, usingsky/korean_lunar_calendar 0.4.0 MIT, baby `KoreanLunarCalendar.kt`)·앵커 −25537·`LUNAR_TABLE_SHA256 = 3507414e…205107` |
| `lunar-calendar.ts` (신규) | `lunarToSolar(y,m,d,isLeap) → {year,month,day} | null`, `leapMonth`, `daysInLunarMonth`, `lunarYearDays`. 범위 1900~2050. null 계약(근처로 흘리지 않음). civil-from-days는 UTC epoch 산수 |
| `types.ts` | `BirthInput.calendar?: "solar"|"lunar"`, `isLeapMonth?` (additive, 웹·API 동형) |
| `pillars.ts` | 진입 시 `resolveCalendar()`: 음력이면 양력으로 바꾸고 이후 단계는 음력을 모른다. `resolution.calendar { input, isLeapMonth?, solarDate }`(solar 입력도 `{input:"solar", solarDate}`). 없는 날짜 → `LunarDateError`, 연도 밖 → 일반 Error(→ `OUT_OF_SUPPORTED_RANGE`) |
| `saju-pillars-v1.ts` | `calendar:"lunar"` 수용 + `isLeapMonth?` 검증, `INVALID_LUNAR_DATE` 코드 추가(`UNSUPPORTED_CALENDAR`는 미발생, 목록 유지). solar 입력에 `isLeapMonth:true`도 `INVALID_LUNAR_DATE`. 실존 양력 검사는 solar만 |
| `saju-pillars-v1.test.ts` | `:110 rejects the lunar calendar` → «accepts the lunar calendar since stage 4» **반전 1건** |
| `scripts/verify_lunar_table.py` (신규) | 전수 대조(CI 밖) |
| 웹 `main.tsx`·`input-validation.ts`·`friendly-error.ts`·`calculation-coverage-copy.ts`·`calculation-rule-copy.ts`·`styles.css` | 달력 양력/음력 세그먼트 + 윤달 체크(음력이고 그 해 윤달이 있을 때만 활성, 「이 해의 윤달은 6월」 표시), 음력 검증 문구, 없는 날짜 안내, 카피 1줄 「음력 입력 1900~2050 … 양력 환산 후 1920년 1월 6일 이후」, 규칙 1줄 앞에 「음력[ 윤달] 입력 → 양력 YYYY-MM-DD」 |
| `docs/SAJU_PILLARS_API_V1.md` · `SOLAR_TERM_SPEC.md` | 「음력 입력」 절, `resolution.calendar`, baby 변경 요구 0 명시 |

## B1 — 골든·SHA·일관성·null
- 공유 골든 `docs/golden/lunar-golden.json` **50건 전부 통과**(null 7, 윤달 10 포함) — 테스트가 파일 존재·건수·`lunar-table.sha256` 첫 토큰 = `LUNAR_TABLE_SHA256`까지 검사.
- 전사 골든(파트 A 전 착수용): 앵커+3건, 설·추석 13건, 윤달 위치 7년(2012·17·20·23·25·26·28)+환산 7건, 2025 윤6월(07-25·08-08 / 평 07-09, 윤6월 29일)·2028 윤5월(06-23), null 7건.
- 표 SHA-256: 데이터 모듈 상수 = 테스트 재계산 = baby 파일 = **`3507414e2d89d13e85ec02979772fc7f0a333fb6d97a575ccb953bda0d205107`**.
- 150년 일관성: 1900~2050 매년 «달 길이 합 = 연 총일수», «전년 그믐 + 1일 = 1/1» 통과.

## B2 — 전수 대조
`python scripts/verify_lunar_table.py`(pip `korean_lunar_calendar` 0.4.0):
```
table values: 151  canonical sha256: 3507414e…205107  declared: 3507414e…205107  MATCH
compared lunar days 1900..2049: 54779  mismatches: 0
```

## B3 — 라이브 케이스 (로컬 계약 테스트로 고정, 라이브 curl은 keyless `/api/app/saju-pillars`로 LC 검수)
| 요청 | 결과 |
| --- | --- |
| `{"birthDate":"2025-06-15","calendar":"lunar","isLeapMonth":true,"birthTime":"10:00","sex":"female"}` | 200, `resolution.calendar = {input:"lunar", isLeapMonth:true, solarDate:"2025-08-08"}` — 일주 기유(己酉) = data.go.kr 2025-08-08 lunIljin 기유 ✓ |
| 같은 날 `isLeapMonth:false` | 200, `solarDate:"2025-07-09"` — 일주 기묘(己卯) = lunIljin 기묘 ✓, 월주 다름 |
| `{"birthDate":"2025-13-01","calendar":"lunar"}` | `INVALID_LUNAR_DATE` |
| `{"birthDate":"2025-07-01","calendar":"lunar","isLeapMonth":true}` | `INVALID_LUNAR_DATE`(2025 윤달은 6월) |
| `1973-12-30` lunar | `INVALID_LUNAR_DATE`(12월 29일까지) · `1899-12-01`·`1900-01-01` lunar → `OUT_OF_SUPPORTED_RANGE` · `2050-12-01` lunar → 200(양력 2051-01) |

## B4 — 불변
옵션 미지정·solar 응답의 기존 필드 동일(게이트 3건·골든 11건·3단계 17건·스냅샷 통과). 신규 = `resolution.calendar`, 요청 `isLeapMonth`, 코드 `INVALID_LUNAR_DATE`. baby 소비 필드 불변·**baby 변경 요구 0**(계속 로컬 변환 + `calendar:"solar"`). 유니크 테스트 무변경(반전 1건 외).

## B5 — 웹 스크린샷 (`docs/evidence/2026-09-22-stage4-lunar/`)
| 파일 | 상태 |
| --- | --- |
| `1-lunar-form.jpg` | 달력 «음력» 선택, 도움말 「음력 생년월일(1900~2050)을 양력으로 바꾼 뒤 계산」, 윤달 체크 「윤달 생일 (이 해의 윤달은 6월)」 |
| `2-regular-month-result.jpg` | 음력 2025-06-15 평달 → 「음력 입력 → 양력 2025-07-09 · …」, 명식 을사·계미·기묘·기사 |
| `3-leap-month-result.jpg` | 윤달 체크 → 「음력 윤달 입력 → 양력 2025-08-08 · …」, 명식 을사·갑신·기유·기사 |

게이트: `npm run verify` exit 0 — test **262**(api 17 + saju-core 208 + web 37). CI 결과는 PR 체크.

## 하지 않은 것
baby UI 윤달 토글(vc21 C1) · 양→음 역변환 · 1900 이전 · 중국력 · `lunar-golden.json` 자동 동기(수동 복사, sha·건수 테스트가 어긋남을 잡는다).
