#!/usr/bin/env python3
"""Collect KASI 24 solar-term records from data.go.kr Special Day API."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


ENDPOINT = "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService"
OPERATION = "get24DivisionsInfo"
DEFAULT_OUTPUT = Path("docs/fixtures/kasi-special-days-solar-terms-2000-2016.json")
DEFAULT_EMBEDDED_TABLE = Path("packages/saju-core/src/solar-terms.ts")
SERVICE_KEY_ENV_NAMES = (
    "KASI_SPECIAL_DAYS_SERVICE_KEY",
    "PUBLIC_DATA_API_KEY",
    "DATA_GO_KR_API_KEY",
    "SERVICE_KEY",
    "SPCDE_API_KEY",
)

TERM_BY_KOREAN_NAME = {
    "소한": "sohan",
    "대한": "daehan",
    "입춘": "ipchun",
    "우수": "usu",
    "경칩": "gyeongchip",
    "춘분": "chunbun",
    "청명": "cheongmyeong",
    "곡우": "gogu",
    "입하": "ipha",
    "소만": "soman",
    "망종": "mangjong",
    "하지": "haji",
    "소서": "soseo",
    "대서": "daeseo",
    "입추": "ipchu",
    "처서": "cheoseo",
    "백로": "baengno",
    "추분": "chubun",
    "한로": "hallo",
    "상강": "sanggang",
    "입동": "ipdong",
    "소설": "soseol",
    "대설": "daeseol",
    "동지": "dongji",
}

TERM_BY_MONTH_SLOT = {
    1: (("sohan", "소한"), ("daehan", "대한")),
    2: (("ipchun", "입춘"), ("usu", "우수")),
    3: (("gyeongchip", "경칩"), ("chunbun", "춘분")),
    4: (("cheongmyeong", "청명"), ("gogu", "곡우")),
    5: (("ipha", "입하"), ("soman", "소만")),
    6: (("mangjong", "망종"), ("haji", "하지")),
    7: (("soseo", "소서"), ("daeseo", "대서")),
    8: (("ipchu", "입추"), ("cheoseo", "처서")),
    9: (("baengno", "백로"), ("chubun", "추분")),
    10: (("hallo", "한로"), ("sanggang", "상강")),
    11: (("ipdong", "입동"), ("soseol", "소설")),
    12: (("daeseol", "대설"), ("dongji", "동지")),
}


@dataclass(frozen=True)
class SolarTermRecord:
    term: str
    nameKo: str
    startsAt: str
    locdate: str
    kst: str
    sunLongitude: str
    termSource: str
    sourceOperation: str
    raw: dict[str, str]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Collect 24 solar-term records from data.go.kr KASI Special Day API."
    )
    parser.add_argument("--start-year", type=int, default=2000)
    parser.add_argument("--end-year", type=int, default=2016)
    parser.add_argument("--endpoint", default=ENDPOINT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--embedded-table", type=Path, default=DEFAULT_EMBEDDED_TABLE)
    parser.add_argument("--service-key-env", default="")
    parser.add_argument("--service-key-file", type=Path)
    parser.add_argument("--dry-run", action="store_true", help="Fetch and compare without writing output.")
    args = parser.parse_args()

    if args.start_year > args.end_year:
        raise SystemExit("--start-year must be less than or equal to --end-year.")

    service_key = resolve_service_key(args.service_key_env, args.service_key_file)
    records = collect_records(args.endpoint, service_key, args.start_year, args.end_year)
    completeness = validate_completeness(records, args.start_year, args.end_year)
    embedded = read_embedded_boundaries(args.embedded_table)
    comparison = compare_embedded(records, embedded, args.start_year, args.end_year)
    payload = {
        "metadata": {
            "source": "data.go.kr 한국천문연구원_특일 정보",
            "endpoint": args.endpoint,
            "operation": OPERATION,
            "startYear": args.start_year,
            "endYear": args.end_year,
            "accessedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "timezone": "KST, as returned by the API kst field",
            "serviceKeyEnvNames": list(SERVICE_KEY_ENV_NAMES),
            "recordCount": len(records),
            "expectedRecordCount": 24 * (args.end_year - args.start_year + 1),
        },
        "records": [asdict(record) for record in records],
        "completeness": completeness,
        "embeddedComparison": comparison,
    }

    mismatches = [row for row in comparison if row["status"] != "match"]
    print(f"Collected {len(records)} solar-term records for {args.start_year}-{args.end_year}.")
    print(f"Compared {len(comparison)} embedded month-boundary rows.")
    if mismatches:
        print("Embedded comparison found non-matching rows:")
        for row in mismatches:
            print(f"- {row['term']} {row['embeddedStartsAt']}: {row['status']} ({row.get('apiStartsAt', 'missing')})")
    else:
        print("Embedded comparison: all rows match.")

    if not args.dry_run:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {args.output}")

    return 1 if mismatches else 0


def resolve_service_key(env_name: str, service_key_file: Path | None) -> str:
    if service_key_file is not None:
        key = service_key_file.read_text(encoding="utf-8").strip()
        if key:
            return key

    env_names = (env_name,) if env_name else SERVICE_KEY_ENV_NAMES
    for name in env_names:
        key = os.environ.get(name)
        if key:
            return key

    env_list = ", ".join(SERVICE_KEY_ENV_NAMES)
    raise SystemExit(f"Missing data.go.kr service key. Set one of: {env_list}.")


def collect_records(endpoint: str, service_key: str, start_year: int, end_year: int) -> list[SolarTermRecord]:
    records: list[SolarTermRecord] = []

    for year in range(start_year, end_year + 1):
        for month in range(1, 13):
            records.extend(fetch_month(endpoint, service_key, year, month))

    return sorted(records, key=lambda row: row.startsAt)


def fetch_month(endpoint: str, service_key: str, year: int, month: int) -> list[SolarTermRecord]:
    query = urllib.parse.urlencode({
        "solYear": f"{year:04d}",
        "solMonth": f"{month:02d}",
        "ServiceKey": service_key,
        "numOfRows": "10",
    }, safe="%")
    url = f"{endpoint.rstrip('/')}/{OPERATION}?{query}"

    with urllib.request.urlopen(url, timeout=30) as response:
        xml = response.read()

    root = ET.fromstring(xml)
    result_code = root.findtext("./header/resultCode")
    result_msg = root.findtext("./header/resultMsg")
    if result_code != "00":
        raise RuntimeError(f"API error for {year:04d}-{month:02d}: {result_code} {result_msg}")

    items = sorted(
        root.findall("./body/items/item"),
        key=lambda item: (
            item.findtext("locdate") or "",
            (item.findtext("kst") or "").strip().zfill(4),
        ),
    )

    return [normalize_item(item, month, index) for index, item in enumerate(items)]


def validate_completeness(records: list[SolarTermRecord], start_year: int, end_year: int) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    expected_terms = set(TERM_BY_KOREAN_NAME.values())

    for year in range(start_year, end_year + 1):
        year_records = [record for record in records if record.startsAt.startswith(f"{year:04d}-")]
        year_terms = {record.term for record in year_records}
        missing_terms = sorted(expected_terms - year_terms)
        duplicate_terms = sorted(
            term
            for term in year_terms
            if sum(1 for record in year_records if record.term == term) > 1
        )
        status = "complete" if len(year_records) == 24 and not missing_terms and not duplicate_terms else "incomplete"

        rows.append({
            "year": str(year),
            "recordCount": str(len(year_records)),
            "expectedRecordCount": "24",
            "status": status,
            "missingTerms": ", ".join(missing_terms),
            "duplicateTerms": ", ".join(duplicate_terms),
        })

    incomplete = [row for row in rows if row["status"] != "complete"]
    if incomplete:
        details = "; ".join(
            f"{row['year']} count={row['recordCount']} missing={row['missingTerms'] or '-'} duplicates={row['duplicateTerms'] or '-'}"
            for row in incomplete
        )
        raise RuntimeError(f"Incomplete solar-term collection: {details}")

    return rows


def normalize_item(item: ET.Element, month: int, index: int) -> SolarTermRecord:
    raw = {child.tag: (child.text or "").strip() for child in item}
    name_ko = raw.get("dateName", "").replace(" ", "")
    term = TERM_BY_KOREAN_NAME.get(name_ko)
    term_source = "dateName"

    expected_slots = TERM_BY_MONTH_SLOT.get(month, ())
    expected_term = expected_slots[index] if index < len(expected_slots) else None
    if expected_term is not None and term != expected_term[0]:
        raw["normalizedDateName"] = expected_term[1]
        raw["normalizationReason"] = "dateName did not match the expected 24-term month slot"
        term = expected_term[0]
        name_ko = expected_term[1]
        term_source = "monthSlotFallback"

    if term is None:
        raise RuntimeError(f"Unknown solar term name from API: {raw.get('dateName')!r}")

    locdate = require_digits(raw.get("locdate", ""), 8, "locdate")
    kst = require_digits(raw.get("kst", "").zfill(4), 4, "kst")
    starts_at = f"{locdate[:4]}-{locdate[4:6]}-{locdate[6:8]}T{kst[:2]}:{kst[2:]}"

    return SolarTermRecord(
        term=term,
        nameKo=name_ko,
        startsAt=starts_at,
        locdate=locdate,
        kst=kst,
        sunLongitude=raw.get("sunLongitude", ""),
        termSource=term_source,
        sourceOperation=OPERATION,
        raw=raw,
    )


def require_digits(value: str, length: int, field: str) -> str:
    if not re.fullmatch(rf"\d{{{length}}}", value):
        raise RuntimeError(f"Invalid {field} from API: {value!r}")
    return value


def read_embedded_boundaries(path: Path) -> list[dict[str, str]]:
    text = path.read_text(encoding="utf-8")
    rows: list[dict[str, str]] = []
    pattern = re.compile(r'\{\s*term:\s*"(?P<term>[^"]+)".*?startsAt:\s*"(?P<startsAt>[^"]+)"', re.DOTALL)

    for match in pattern.finditer(text):
        rows.append(match.groupdict())

    return rows


def compare_embedded(
    records: Iterable[SolarTermRecord],
    embedded: Iterable[dict[str, str]],
    start_year: int,
    end_year: int,
) -> list[dict[str, str]]:
    api_by_term_and_date = {
        (record.term, record.startsAt[:10]): record
        for record in records
    }
    comparison: list[dict[str, str]] = []

    for boundary in embedded:
        embedded_starts_at = boundary["startsAt"]
        embedded_year = int(embedded_starts_at[:4])
        if embedded_year < start_year or embedded_year > end_year:
            continue

        key = (boundary["term"], embedded_starts_at[:10])
        api_record = api_by_term_and_date.get(key)

        if api_record is None:
            comparison.append({
                "term": boundary["term"],
                "embeddedStartsAt": embedded_starts_at,
                "status": "missing-api-row",
            })
            continue

        comparison.append({
            "term": boundary["term"],
            "nameKo": api_record.nameKo,
            "embeddedStartsAt": embedded_starts_at,
            "apiStartsAt": api_record.startsAt,
            "status": "match" if embedded_starts_at == api_record.startsAt else "mismatch",
        })

    return comparison


if __name__ == "__main__":
    sys.exit(main())
