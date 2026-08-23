# Public Data Solar-Term Collection

Date: 2026-05-26

This document records the approved replacement for the abandoned KASI web-image/OCR path. Historical solar-term verification should use the data.go.kr Open API, not scraped almanac images.

## Source

- Provider: 한국천문연구원
- Dataset: 한국천문연구원_특일 정보
- Endpoint: `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService`
- Operation: `get24DivisionsInfo`
- Purpose: collect 24절기 records with `dateName`, `locdate`, `kst`, and `sunLongitude`.

The service key must not be committed. The collection script accepts these environment variables, in priority order:

1. `KASI_SPECIAL_DAYS_SERVICE_KEY`
2. `PUBLIC_DATA_API_KEY`
3. `DATA_GO_KR_API_KEY`
4. `SERVICE_KEY`
5. `SPCDE_API_KEY`

Alternatively, store the key in an ignored local file such as `.secrets/data-go-kr-service-key.txt` and pass `--service-key-file`.

## Collection Command

```powershell
python scripts/collect_public_data_solar_terms.py
```

The default output is:

```text
docs/fixtures/kasi-special-days-solar-terms-2000-2016.json
```

The generated JSON is intended to become the local source fixture for historical solar-term revalidation. It includes:

- metadata about the data source, endpoint, operation, access time, and year range.
- normalized solar-term records in `YYYY-MM-DDTHH:mm` KST format.
- per-year completeness checks requiring all 24 solar terms before the fixture is written.
- a comparison between the generated records and the embedded `SOLAR_MONTH_BOUNDARIES` table.

## Source Limitations Found On 2026-05-26

The approved data.go.kr endpoint returns normal successful responses but no 24절기 records for 1989-1999. For example, `get24DivisionsInfo?solYear=1989&solMonth=02` returns `resultCode=00` with `totalCount=0`.

The 2000-2016 range returns complete 24절기 records. One source-data defect was observed in February 2000: the second February row has the correct date/time for 우수 but repeats `dateName=입춘`. The collector preserves the raw row and marks the normalized term with `termSource=monthSlotFallback`.

Use this command only as an availability probe, not as a fixture-generation command:

```powershell
python scripts/collect_public_data_solar_terms.py --start-year 1989 --end-year 2016
```

It should fail the completeness check until a separate pre-2000 source is approved.

## Revalidation Policy

Rows may be marked `KASI revalidated` only after the generated fixture exists in the repository and the embedded comparison reports `match` for those rows.

If the API result differs from the embedded table, update calculation data and boundary tests in the same PR as the evidence fixture. Do not widen supported date coverage in this step.

## Current Status

The 2026-05-26 run generated `docs/fixtures/kasi-special-days-solar-terms-2000-2016.json`.

The 2026-08-23 run widened the range to the API's full coverage and generated
`docs/fixtures/kasi-special-days-solar-terms-2000-2028.json` (696 records = 24 x 29 years,
per-year completeness check passed). That fixture is now the source of the embedded table:
`scripts/generate_solar_terms_module.py` renders `packages/saju-core/src/solar-terms.data.ts`
from its 12 month-boundary terms.

Evidence from the 2026-08-23 run:

- `embeddedComparison`: all 22 embedded rows dated 2000 or later report `match`. The
  hand-verified 2024/2025 boundaries were reproduced by the API independently.
- The 2000-2016 records are identical to the 2026-05-26 fixture (408/408, no differences).
- The February 2000 source defect recorded above (`dateName=입춘` repeated for 우수) is no
  longer present; the API now returns 우수 directly and the new fixture has zero
  `termSource=monthSlotFallback` rows.

Range probes run on 2026-08-23 (`totalCount` from `get24DivisionsInfo`):

| Year | Result |
|---|---|
| 1989-1999 | 0 records (unchanged from 2026-05-26) |
| 2000-2028 | complete, 24 terms per year |
| 2029 and later | 0 records (probed 2029, 2030, 2035, 2040, 2045) |

Because the API serves no 2029 소한, the embedded table ends at 2028-12-06 대설 and dates after
it raise `No upper solar month boundary`. Re-run the collector when data.go.kr publishes 2029+.

## Regeneration

```powershell
python scripts/collect_public_data_solar_terms.py --start-year 2000 --end-year 2028 --output docs/fixtures/kasi-special-days-solar-terms-2000-2028.json
python scripts/generate_solar_terms_module.py
npm run verify
```

`generate_solar_terms_module.py --check` fails when the committed module is stale relative to
the fixture. The pre-2000 rows the API does not serve stay hand-maintained in that script's
`LEGACY_BOUNDARIES`.
