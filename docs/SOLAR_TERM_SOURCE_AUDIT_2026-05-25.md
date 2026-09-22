# Solar Term Source Audit

Date: 2026-05-25

This audit records the current source status of Saju Lab's embedded solar-term boundary table. It records KASI revalidation for the embedded 2024 matrix and 2025 upper-boundary guard rows without claiming broad date-range coverage.

## 2026-09-22 판정 — KASI 24기 표(1920~2100) 채택, 손관리 행 폐기

이 절이 아래 2026-05-25 인벤토리보다 우선한다. 아래 표의 `fixture-limited` / `needs KASI revalidation` 행은 전부 대체됐다.

**출처 표시(3요소).** 한국천문연구원 «24기 입기 시각» 공개 자료 · 원본 파일명 `24기입기시각(1920-2100)_20260902.txt`(저장명 `docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) · URL `https://astro.kasi.re.kr/kor/almanac/solarTerms/download` · 다운로드일 2026-09-22 · sha256 `508761248c7d18eb`… 표는 KST(UTC+9 고정)이며 과거 표준자오선·서머타임을 반영하지 않는다(파일 헤더 원문).
**저작권.** 파일과 다운로드 페이지에 공공누리 표시가 없다. KASI 저작권정책(`https://www.kasi.re.kr/kor/pageView/134`)은 «공공누리가 표시되지 않은 자료는 사전에 협의한 이후에 이용»을 요구한다 → 사전 협의 문의를 2026-09-22 발송(사용자), 회신 대기. 부정 회신 시 롤백 경로는 아래.

**판정 규칙.** 같은 기관의 두 산출물(특일 정보 API 픽스처 2000-2028 vs 24기 표)이 갈릴 때 |Δ| ≤ 1분은 집계만 하고 24기 표를 채택, 1분 초과는 독립 천문 계산(astronomia 4.2.0, VSOP87B + ΔT)을 제3 증거로 붙여 판정한다.

**cross-check 결과** (`python scripts/generate_solar_terms_module.py --cross-check docs/fixtures/kasi-special-days-solar-terms-2000-2028.json`): 348행 중 동일 328 · |Δ| ≤ 1분 19 · > 1분 1.

| 행 | 이전 값(API 픽스처) | 24기 표 | Δ | astronomia (KST, 초) | 판정 |
| --- | --- | --- | --- | --- | --- |
| 2011-11-08 입동 | 09:26 | **03:35** | −5h 51m | 03:34:55 | **24기 표 채택.** API 값은 어느 계산과도 맞지 않음. 03:35~09:25 출생의 월주가 무술(戊戌)→기해(己亥)로 바뀜 — 회귀 테스트 `index.test.ts` «uses the KASI 03:35 입동 minute for 2011-11-08» |
| 1분 차 19행 (2007-10-09 한로 … 2020-12-07 대설) | txt−1분 | — | −1분 | 전부 :30 전후(예 2007-10-09 01:11:28, 2015-01-06 01:20:32, 2020-12-07 01:09:29) | 반올림 경계. 24기 표 채택, 정확도 판정 대상 아님 |

**손관리 4행 처분** (2026-05-14 `c8b850b`에서 출처 없이 들어온 값):

| 행 | 손관리 값 | 24기 표 | astronomia | 처분 |
| --- | --- | --- | --- | --- |
| 1989-12-07 대설 | 17:22 | **12:21** | 12:20:58 | 손관리 값 오류(5h 01m). 폐기 |
| 1990-01-05 소한 | 23:33 | 23:33 | — | 일치. 표 값으로 대체 |
| 1990-02-04 입춘 | 11:14 | 11:14 | — | 일치. 표 값으로 대체 |
| 1999-12-07 대설 | 22:48 | **22:47** | 22:47:28 | 반올림 경계이나 표가 맞음(28초). 폐기 |

`LEGACY_BOUNDARIES`/`LEGACY_IPCHUN`은 생성기에서 삭제됐다. 1990-01-01 골든 픽스처는 두 대설 값 모두 12-07이라 영향이 없다.

**3자 검증** (`node scripts/verify_solar_terms_astronomia.mjs`, 12절 2,172행): ≤2030년 1,332행 **100% ≤ 60초**(최대 33.8초, 평균 15.2초) · 1950~1999년 600행 100%(최대 31.5초) · 24기 전체로는 1950~1999년 1,200행 100%(최대 32.7초, 분 단위 불일치 1.9%) · 2031~2100년 840행은 ΔT 예측 모델 차이로 2052년부터 60초 초과(최대 172초, 2090년대) — 게이트 아님.

**롤백 경로.** 저작권 협의가 부정이면 `python scripts/generate_solar_terms_module.py --source docs/fixtures/kasi-special-days-solar-terms-2000-2028.json`으로 2000-01-06~2028-12-06 표(348행)를 다시 생성한다. 생성기 코드 변경은 없다. 되돌아가는 것은 데이터와, 범위를 1920/2100에 고정한 테스트 4건·계산 범위 카피 1건·이 문서의 범위 문구뿐이다. 손관리 1989~1999 행은 출처가 없으므로 되살리지 않는다.

## Scope

Included:
- embedded `Asia/Seoul` solar-term boundary minutes used by `packages/saju-core/src/solar-terms.ts`.
- fixture and boundary-test coverage that currently depends on those minutes.
- source-status language for beta and paid-readiness documentation.

Not included:
- broad solar-term table ingestion.
- date-range expansion.
- algorithm replacement.
- 23:00 Ja-hour day-pillar rollover changes.
- checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, analytics, subscription, or PDF-library work.

## Source Status Terms

| Status | Meaning | May claim beta-ready KASI verification? |
| --- | --- | --- |
| `fixture-limited` | Embedded only for the dates needed by current fixtures and regression tests. | No |
| `public-table fixed` | Fixed from public solar-term table references or public almanac cross-checks, but not directly revalidated from KASI source data in this repository. | No |
| `needs KASI revalidation` | Must be checked against KASI source data before broader public beta or wider date-range support. | No |
| `KASI revalidated` | Checked against KASI source data with source name, access date, timezone, and minute-rounding policy recorded. | Yes, only for the checked rows |
| `KASI mismatch` | Direct KASI source comparison found a minute value that differs from the embedded table. Requires a separate calculation-data decision before it can be treated as revalidated. | No |

Current project status: KASI revalidated for the embedded 2024 matrix and 2025 upper-boundary guards after Phase 4U mismatch resolution. Phase 4V replaces the abandoned web-image/OCR path with the data.go.kr `get24DivisionsInfo` collection script documented in `docs/PUBLIC_DATA_SOLAR_TERM_COLLECTION.md`. The generated 2000-2016 API fixture revalidates embedded rows in that available range; 1989-1999 still need a separate approved source because the API returns no records for those years.

## Embedded Boundary Inventory

These are the boundary minutes currently embedded in the calculation core.

| Term | Starts at (KST) | Solar year | Month ordinal | Current use | Current source status |
| --- | --- | --- | --- | --- | --- |
| 대설 | 1989-12-07 17:22 | 1989 | 10 | 1990 fixture lower month boundary | fixture-limited; needs KASI revalidation |
| 소한 | 1990-01-05 23:33 | 1989 | 11 | 1990 fixture active month boundary | fixture-limited; needs KASI revalidation |
| 입춘 | 1990-02-04 11:14 | 1990 | 0 | 1990 fixture upper month boundary and year boundary | fixture-limited; needs KASI revalidation |
| 대설 | 1999-12-07 22:48 | 1999 | 10 | 2000 fixture lower month boundary | fixture-limited; needs KASI revalidation |
| 소한 | 2000-01-06 10:01 | 1999 | 11 | 2000 fixture active month boundary | KASI revalidated for this row |
| 입춘 | 2000-02-04 21:40 | 2000 | 0 | 2000 fixture upper month boundary and year boundary | KASI revalidated for this row |
| 입춘 | 2010-02-04 07:48 | 2010 | 0 | 2010 year boundary | KASI revalidated for this row |
| 망종 | 2010-06-06 03:49 | 2010 | 4 | 2010 fixture active month boundary | KASI revalidated for this row |
| 소서 | 2010-07-07 14:02 | 2010 | 5 | 2010 fixture upper month boundary | KASI revalidated for this row |
| 입춘 | 2015-02-04 12:58 | 2015 | 0 | 2015 year boundary | KASI revalidated for this row |
| 대설 | 2015-12-07 19:53 | 2015 | 10 | 2015 fixture active month boundary | KASI revalidated for this row |
| 소한 | 2016-01-06 07:08 | 2015 | 11 | 2015 fixture upper month boundary | KASI revalidated for this row |
| 소한 | 2024-01-06 05:49 | 2023 | 11 | 2024 Ipchun lower month boundary | KASI revalidated for this row |
| 입춘 | 2024-02-04 17:27 | 2024 | 0 | 2024 year/month boundary tests | KASI revalidated for this row |
| 경칩 | 2024-03-05 11:23 | 2024 | 1 | 2024 month boundary tests | KASI revalidated for this row |
| 청명 | 2024-04-04 16:02 | 2024 | 2 | 2024 month boundary tests | KASI revalidated for this row |
| 입하 | 2024-05-05 09:10 | 2024 | 3 | 2024 month boundary tests | KASI revalidated for this row |
| 망종 | 2024-06-05 13:10 | 2024 | 4 | 2024 month boundary tests | KASI revalidated for this row |
| 소서 | 2024-07-06 23:20 | 2024 | 5 | 2024 month boundary tests | KASI revalidated for this row |
| 입추 | 2024-08-07 09:09 | 2024 | 6 | 2024 month boundary tests | KASI revalidated for this row |
| 백로 | 2024-09-07 12:11 | 2024 | 7 | 2024 month boundary tests | KASI revalidated for this row |
| 한로 | 2024-10-08 04:00 | 2024 | 8 | 2024 month boundary tests | KASI revalidated for this row |
| 입동 | 2024-11-07 07:20 | 2024 | 9 | 2024 month boundary tests | KASI revalidated for this row |
| 대설 | 2024-12-07 00:17 | 2024 | 10 | 2024 month boundary tests | KASI revalidated for this row |
| 소한 | 2025-01-05 11:33 | 2024 | 11 | 2024 upper month boundary guard | KASI revalidated for this row |
| 입춘 | 2025-02-03 23:10 | 2025 | 0 | 2025 upper range guard and year boundary | KASI revalidated for this row |

## Current Test Coverage

The current automated tests cover:
- 2024 입춘 before, exact, and after minute behavior.
- 2024 경칩 before, exact, and after minute behavior.
- 2024 청명 through 대설 before, exact, and after minute behavior.
- 2025 소한 before, exact, and after minute behavior for the 2024 upper-boundary guard.
- date-only rejection on 2024 solar-month boundary dates and the 2025 소한 upper-boundary date.
- unsupported upper-range protection when no safe next boundary exists.
- current MVP policy that 23:00 자시 does not roll the day pillar to the next civil date.

The current automated tests do not prove:
- direct KASI source agreement for older fixture-limited rows outside the 2024 matrix and 2025 upper-boundary guards.
- broad date-range correctness.
- alternative school behavior for 23:00 자시 rollover.
- support for timezones other than `Asia/Seoul`.

## KASI Revalidation Checklist

Before broader public beta or wider date-range support, record:

1. KASI source page or dataset name.
2. Access date.
3. Whether times are shown in KST or require conversion.
4. Whether the source provides seconds and how the app rounds to minutes.
5. One row per embedded boundary showing expected KASI time, current embedded time, and match status.
6. Any discrepancy resolution, including whether code, tests, or docs changed.
7. Regression test evidence after updates.

Until those items exist, keep the external-source gate open.

Phase 4V note: use `python scripts/collect_public_data_solar_terms.py` after configuring a data.go.kr service key. Do not use KASI almanac image OCR as source evidence for historical fixture rows. The approved API currently supports fixture generation for 2000-2016; 1989-1999 remains an open source gap.
