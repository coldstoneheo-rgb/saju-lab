# Solar Term Source Audit

Date: 2026-05-25

This audit records the current source status of Saju Lab's embedded solar-term boundary table. It prepares the project for KASI source revalidation without claiming that revalidation is complete.

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

Current project status: partially compared against KASI source data for the 2024 matrix and 2025 upper-boundary guards, with mismatch rows still open. See `docs/KASI_SOLAR_TERM_REVALIDATION_2026-05-25.md`.

## Embedded Boundary Inventory

These are the boundary minutes currently embedded in the calculation core.

| Term | Starts at (KST) | Solar year | Month ordinal | Current use | Current source status |
| --- | --- | --- | --- | --- | --- |
| 대설 | 1989-12-07 17:22 | 1989 | 10 | 1990 fixture lower month boundary | fixture-limited; needs KASI revalidation |
| 소한 | 1990-01-05 23:33 | 1989 | 11 | 1990 fixture active month boundary | fixture-limited; needs KASI revalidation |
| 입춘 | 1990-02-04 11:14 | 1990 | 0 | 1990 fixture upper month boundary and year boundary | fixture-limited; needs KASI revalidation |
| 대설 | 1999-12-07 22:48 | 1999 | 10 | 2000 fixture lower month boundary | fixture-limited; needs KASI revalidation |
| 소한 | 2000-01-06 09:00 | 1999 | 11 | 2000 fixture active month boundary | fixture-limited; needs KASI revalidation |
| 입춘 | 2000-02-04 21:40 | 2000 | 0 | 2000 fixture upper month boundary and year boundary | fixture-limited; needs KASI revalidation |
| 입춘 | 2010-02-04 07:48 | 2010 | 0 | 2010 year boundary | fixture-limited; needs KASI revalidation |
| 망종 | 2010-06-06 03:49 | 2010 | 4 | 2010 fixture active month boundary | fixture-limited; needs KASI revalidation |
| 소서 | 2010-07-07 14:03 | 2010 | 5 | 2010 fixture upper month boundary | fixture-limited; needs KASI revalidation |
| 입춘 | 2015-02-04 12:58 | 2015 | 0 | 2015 year boundary | fixture-limited; needs KASI revalidation |
| 대설 | 2015-12-07 19:53 | 2015 | 10 | 2015 fixture active month boundary | fixture-limited; needs KASI revalidation |
| 소한 | 2016-01-06 07:08 | 2015 | 11 | 2015 fixture upper month boundary | fixture-limited; needs KASI revalidation |
| 소한 | 2024-01-06 05:49 | 2023 | 11 | 2024 Ipchun lower month boundary | KASI revalidated for this row |
| 입춘 | 2024-02-04 17:27 | 2024 | 0 | 2024 year/month boundary tests | KASI revalidated for this row |
| 경칩 | 2024-03-05 11:22 | 2024 | 1 | 2024 month boundary tests | KASI mismatch: 2024 almanac lists 11:23 |
| 청명 | 2024-04-04 16:02 | 2024 | 2 | 2024 month boundary tests | KASI revalidated for this row |
| 입하 | 2024-05-05 09:10 | 2024 | 3 | 2024 month boundary tests | KASI revalidated for this row |
| 망종 | 2024-06-05 13:09 | 2024 | 4 | 2024 month boundary tests | KASI mismatch: 2024 almanac lists 13:10 |
| 소서 | 2024-07-06 23:20 | 2024 | 5 | 2024 month boundary tests | KASI revalidated for this row |
| 입추 | 2024-08-07 09:09 | 2024 | 6 | 2024 month boundary tests | KASI revalidated for this row |
| 백로 | 2024-09-07 12:11 | 2024 | 7 | 2024 month boundary tests | KASI revalidated for this row |
| 한로 | 2024-10-08 03:59 | 2024 | 8 | 2024 month boundary tests | KASI mismatch: 2024 almanac lists 04:00 |
| 입동 | 2024-11-07 07:20 | 2024 | 9 | 2024 month boundary tests | KASI revalidated for this row |
| 대설 | 2024-12-07 00:17 | 2024 | 10 | 2024 month boundary tests | KASI revalidated for this row |
| 소한 | 2025-01-05 11:32 | 2024 | 11 | 2024 upper month boundary guard | KASI mismatch: 2025 almanac lists 11:33 |
| 입춘 | 2025-02-03 23:10 | 2025 | 0 | 2025 upper range guard and year boundary | KASI revalidated for this row |

## Current Test Coverage

The current automated tests cover:
- 2024 입춘 before, exact, and after minute behavior.
- 2024 경칩 before, exact, and after minute behavior.
- 2024 청명 through 대설 before, exact, and after minute behavior.
- date-only rejection on 2024 solar-month boundary dates.
- unsupported upper-range protection when no safe next boundary exists.
- current MVP policy that 23:00 자시 does not roll the day pillar to the next civil date.

The current automated tests do not prove:
- full direct KASI source agreement for mismatch rows recorded in `docs/KASI_SOLAR_TERM_REVALIDATION_2026-05-25.md`.
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
