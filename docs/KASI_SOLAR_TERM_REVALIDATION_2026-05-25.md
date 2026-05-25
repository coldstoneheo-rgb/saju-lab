# KASI Solar-Term Revalidation Evidence

Date: 2026-05-25

This note records a direct evidence pass against Korean Astronomy and Space Science Institute (KASI) almanac PDFs for the embedded 2024 solar-month boundary matrix and the 2025 upper-boundary guard records.

This is not a calculation-data update. The pass found one-minute mismatches, so Saju Lab must not claim that the embedded solar-term table is fully KASI revalidated yet.

## Scope

Included:
- 2024 monthly solar-term boundaries currently embedded in `packages/saju-core/src/solar-terms.ts`.
- 2025 `소한` and `입춘` records used as upper-boundary guards for the 2024 fixture range.
- Source, access date, timezone, and row-level match status.

Not included:
- changing embedded solar-term values.
- changing boundary tests.
- broad solar-term table ingestion.
- date-range expansion.
- 23:00 자시 day-pillar rollover changes.
- checkout, payment SDK, webhook, login, account storage, server report storage, AI interpretation, analytics, subscription, or PDF-library work.

## Sources

| Year | Source | URL | Evidence used |
| --- | --- | --- | --- |
| 2024 | KASI, `2024 역서` PDF | https://astro.kasi.re.kr/file/astro_almanac_pdf/20231023135218580.pdf | 24-term table and monthly February page |
| 2025 | KASI, `2025 역서` PDF | https://astro.kasi.re.kr/file/astro_almanac_pdf/20241230141333862.pdf | 24-term table and monthly February page |

Access date: 2026-05-25.

Extraction method:
- Downloaded the official PDFs to a temporary local directory.
- Extracted text with PyMuPDF.
- Compared the `24기` table rows against the embedded minute values.
- Used the monthly February pages only as supporting evidence for the `입춘` rows.

Timezone evidence:
- The 24-term tables label the times as `한국표준시`.
- The 2024 almanac explanation section states that Korea uses KST, UTC+9.

## Result Summary

Status: BLOCKED for full KASI revalidation.

The evidence pass confirms several rows, but four embedded rows differ from the KASI almanac by one minute. Because these rows affect exact-boundary behavior, calculation data and boundary tests should be updated only in a separate calculation-data PR after the owner accepts the source change.

## 2024 Embedded Boundary Comparison

| Term | Embedded KST | KASI 2024 KST | Status |
| --- | --- | --- | --- |
| 소한 | 2024-01-06 05:49 | 2024-01-06 05:49 | Match |
| 입춘 | 2024-02-04 17:27 | 2024-02-04 17:27 | Match |
| 경칩 | 2024-03-05 11:22 | 2024-03-05 11:23 | KASI mismatch: +1 minute |
| 청명 | 2024-04-04 16:02 | 2024-04-04 16:02 | Match |
| 입하 | 2024-05-05 09:10 | 2024-05-05 09:10 | Match |
| 망종 | 2024-06-05 13:09 | 2024-06-05 13:10 | KASI mismatch: +1 minute |
| 소서 | 2024-07-06 23:20 | 2024-07-06 23:20 | Match |
| 입추 | 2024-08-07 09:09 | 2024-08-07 09:09 | Match |
| 백로 | 2024-09-07 12:11 | 2024-09-07 12:11 | Match |
| 한로 | 2024-10-08 03:59 | 2024-10-08 04:00 | KASI mismatch: +1 minute |
| 입동 | 2024-11-07 07:20 | 2024-11-07 07:20 | Match |
| 대설 | 2024-12-07 00:17 | 2024-12-07 00:17 | Match |

## 2025 Upper-Boundary Guard Comparison

| Term | Embedded KST | KASI 2025 KST | Status |
| --- | --- | --- | --- |
| 소한 | 2025-01-05 11:32 | 2025-01-05 11:33 | KASI mismatch: +1 minute |
| 입춘 | 2025-02-03 23:10 | 2025-02-03 23:10 | Match |

## Evidence Notes

- The 2024 KASI 24-term table lists `경칩` as March 5 at 11:23, `망종` as June 5 at 13:10, and `한로` as October 8 at 04:00.
- The 2025 KASI 24-term table lists `소한` as January 5 at 11:33 and `입춘` as February 3 at 23:10.
- The 2024 and 2025 monthly February pages independently support the `입춘` rows used by the current fixture range.

## Required Follow-Up

Before broader public beta or wider date-range support:

1. Decide whether Saju Lab should adopt the KASI minute values for the four mismatch rows.
2. If adopting them, update `packages/saju-core/src/solar-terms.ts` and the affected boundary tests in the same PR.
3. Re-run before, exact, and after boundary tests for every changed row.
4. Keep the current 23:00 자시 day-pillar policy unchanged unless that policy is separately approved.
5. Update `docs/SOLAR_TERM_SOURCE_AUDIT_2026-05-25.md` after mismatch resolution.
