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

The collection path generated `docs/fixtures/kasi-special-days-solar-terms-2000-2016.json` on 2026-05-26. Embedded rows covered by the 2000-2016 API fixture may be marked `KASI revalidated` when the comparison reports `match`.

The 1989-1999 rows remain open external-source gates because the approved API returns no records for those years.
