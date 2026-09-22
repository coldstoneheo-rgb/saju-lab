#!/usr/bin/env python3
"""Generate the embedded solar-term data module from the KASI 24-solar-term table.

The source is the official 한국천문연구원 24기 입기 시각 download
(astro.kasi.re.kr/kor/almanac/solarTerms/download), kept verbatim under
docs/fixtures/. This script turns the 12 month-boundary terms (절) of that
table into packages/saju-core/src/solar-terms.data.ts. 중기 rows are read but
never emitted; the month pillar only depends on the 12 절.

Sub-commands:
  (default)        write the data module from the txt
  --check          fail if the committed data module is stale
  --cross-check J  compare the txt against a data.go.kr API fixture JSON
                   (docs/fixtures/kasi-special-days-solar-terms-*.json) and
                   print every minute-level difference; evidence for the
                   source audit, not a gate
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_SOURCE = REPO_ROOT / "docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt"
DEFAULT_OUTPUT = REPO_ROOT / "packages/saju-core/src/solar-terms.data.ts"
SOURCE_URL = "https://astro.kasi.re.kr/kor/almanac/solarTerms/download"

# The 12 절 that open a solar month, in month order starting at 입춘.
# docs/algorithms/SOLAR_TERM_SPEC.md: 월주는 이 12개 절기를 기준으로 한다.
MONTH_BOUNDARY_TERMS = (
    "ipchun",
    "gyeongchip",
    "cheongmyeong",
    "ipha",
    "mangjong",
    "soseo",
    "ipchu",
    "baengno",
    "hallo",
    "ipdong",
    "daeseol",
    "sohan",
)
MONTH_ORDINAL_BY_TERM = {term: index for index, term in enumerate(MONTH_BOUNDARY_TERMS)}

# KASI numbers the 24 terms 1..24 starting at 입춘; the odd ones are the 12 절.
KASI_INDEX_BY_TERM = {term: 1 + 2 * ordinal for term, ordinal in MONTH_ORDINAL_BY_TERM.items()}
TERM_BY_KASI_INDEX = {index: term for term, index in KASI_INDEX_BY_TERM.items()}

# 구분, 년, 월, 일, 시, 분 — whitespace after the commas varies.
ROW_PATTERN = re.compile(r"^\s*(\d+),\s*(\d{4}),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*$")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE,
                        help="KASI 24기 txt, or a data.go.kr API fixture JSON (rollback path)")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true", help="Fail if the output is stale instead of writing it.")
    parser.add_argument("--cross-check", type=Path, metavar="FIXTURE_JSON",
                        help="Compare the txt against a data.go.kr API fixture and print the differences.")
    args = parser.parse_args()

    records = parse_source(args.source)
    boundaries = build_boundaries(records)
    ipchun = build_ipchun(boundaries)

    if args.cross_check:
        return cross_check(records, args.cross_check)

    rendered = render_module(args.source, boundaries, ipchun)

    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(f"{args.output} is stale; re-run scripts/generate_solar_terms_module.py.")
            return 1
        print(f"{args.output} is up to date ({len(boundaries)} boundaries).")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")
    print(f"Wrote {args.output} with {len(boundaries)} month boundaries ({boundaries[0].starts_at} .. {boundaries[-1].starts_at}).")
    return 0


class Record:
    """One KASI row. `starts_at` is the normalised wall-clock minute, `raw` the file's own text."""

    __slots__ = ("kasi_index", "starts_at", "raw")

    def __init__(self, kasi_index: int, starts_at: str, raw: str) -> None:
        self.kasi_index = kasi_index
        self.starts_at = starts_at
        self.raw = raw

    @property
    def term(self) -> str | None:
        return TERM_BY_KASI_INDEX.get(self.kasi_index)


class Boundary:
    __slots__ = ("term", "starts_at", "solar_year", "ordinal", "raw")

    def __init__(self, term: str, starts_at: str, solar_year: int, ordinal: int, raw: str) -> None:
        self.term = term
        self.starts_at = starts_at
        self.solar_year = solar_year
        self.ordinal = ordinal
        self.raw = raw


def parse_source(path: Path) -> list[Record]:
    """The txt is the normal source; the API fixture JSON stays readable so the
    2000-2028 table can be regenerated without code changes if the txt has to go."""
    if path.suffix.lower() == ".json":
        return parse_api_fixture_json(path)
    return parse_kasi_txt(path)


def parse_api_fixture_json(path: Path) -> list[Record]:
    """Rows collected by scripts/collect_public_data_solar_terms.py (term names, YYYY-MM-DDTHH:mm)."""
    fixture = json.loads(path.read_text(encoding="utf-8"))
    records: list[Record] = []
    for row in fixture["records"]:
        kasi_index = KASI_INDEX_BY_TERM.get(row["term"])
        if kasi_index is None:
            continue  # 중기 rows are named differently there and are not needed
        records.append(Record(kasi_index, row["startsAt"], row["startsAt"]))
    if not records:
        raise SystemExit(f"No 절 rows found in {path}.")
    return records


def parse_kasi_txt(path: Path) -> list[Record]:
    """Read every 24기 row. Header and separator lines are skipped by pattern."""
    records: list[Record] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        match = ROW_PATTERN.match(line)
        if not match:
            continue
        kasi_index, year, month, day, hour, minute = (int(value) for value in match.groups())
        if not 1 <= kasi_index <= 24:
            raise SystemExit(f"Unexpected 24기 index {kasi_index} in {path}: {line!r}")
        raw = f"{year:04d}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}"
        records.append(Record(kasi_index, normalize_wall_clock(year, month, day, hour, minute), raw))

    if not records:
        raise SystemExit(f"No 24기 rows found in {path}.")
    return records


def normalize_wall_clock(year: int, month: int, day: int, hour: int, minute: int) -> str:
    """KASI keeps the calendar date when rounding lands on midnight and writes 24:00.

    The engine compares YYYY-MM-DDTHH:mm strings and derives boundary *dates*
    from them, so 24:00 is folded into 00:00 of the next day here.
    """
    if hour == 24 and minute == 0:
        rolled = datetime(year, month, day) + timedelta(days=1)
        return rolled.strftime("%Y-%m-%dT00:00")
    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        raise SystemExit(f"Invalid time {hour:02d}:{minute:02d} on {year:04d}-{month:02d}-{day:02d}.")
    return f"{year:04d}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}"


def build_boundaries(records: list[Record]) -> list[Boundary]:
    """Return the 12-절 rows sorted by startsAt with their solar year and month ordinal."""
    rows = [
        Boundary(record.term, record.starts_at, solar_year_for(record.term, record.starts_at),
                 MONTH_ORDINAL_BY_TERM[record.term], record.raw)
        for record in records
        if record.term is not None
    ]
    rows.sort(key=lambda row: row.starts_at)
    assert_month_sequence(rows)
    return rows


def solar_year_for(term: str, starts_at: str) -> int:
    """The 절기 year runs 입춘 to 입춘, so a January 소한 belongs to the previous year."""
    calendar_year = int(starts_at[:4])
    return calendar_year - 1 if term == "sohan" else calendar_year


def assert_month_sequence(rows: list[Boundary]) -> None:
    """Every contiguous pair must advance the month ordinal by exactly one and sit 28-33 days apart."""
    for index in range(1, len(rows)):
        previous = rows[index - 1]
        current = rows[index]
        gap_days = (date_value(current.starts_at) - date_value(previous.starts_at)) / (24 * 60)

        expected_ordinal = (previous.ordinal + 1) % 12
        if current.ordinal != expected_ordinal:
            raise SystemExit(
                f"Month ordinal is not contiguous at {current.starts_at} ({current.term}): "
                f"expected {expected_ordinal} after {previous.starts_at} ({previous.term}), got {current.ordinal}."
            )
        if not 28 <= gap_days <= 33:
            raise SystemExit(
                f"Solar month span out of range at {current.starts_at} ({current.term}): "
                f"{gap_days:.2f} days after {previous.starts_at}."
            )


def build_ipchun(boundaries: list[Boundary]) -> list[tuple[str, str]]:
    return sorted((row.starts_at[:4], row.starts_at) for row in boundaries if row.term == "ipchun")


def date_value(starts_at: str) -> int:
    """Minutes since epoch, read as a wall-clock KST value (no timezone math)."""
    parsed = datetime.strptime(starts_at, "%Y-%m-%dT%H:%M")
    return int((parsed - datetime(1970, 1, 1)).total_seconds() // 60)


def cross_check(records: list[Record], fixture_path: Path) -> int:
    """Print every 절 row where the API fixture and the txt differ, with Δ in minutes."""
    fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
    by_key = {(record.term, record.starts_at[:10]): record.starts_at for record in records if record.term}

    compared = 0
    within_one = []
    over_one = []
    missing = []
    for api_row in sorted(fixture["records"], key=lambda row: row["startsAt"]):
        term = api_row["term"]
        if term not in MONTH_ORDINAL_BY_TERM:
            continue
        compared += 1
        api_at = api_row["startsAt"]
        txt_at = by_key.get((term, api_at[:10]))
        if txt_at is None:
            # A large gap can move the calendar date; look one day either side.
            for offset in (-1, 1):
                shifted = (datetime.strptime(api_at[:10], "%Y-%m-%d") + timedelta(days=offset)).strftime("%Y-%m-%d")
                txt_at = by_key.get((term, shifted))
                if txt_at:
                    break
        if txt_at is None:
            missing.append((term, api_at))
            continue
        delta = date_value(api_at) - date_value(txt_at)
        if delta == 0:
            continue
        (within_one if abs(delta) <= 1 else over_one).append((term, api_at, txt_at, delta))

    print(f"cross-check {fixture_path.name}: {compared} 절 rows compared against the txt")
    print(f"  identical: {compared - len(within_one) - len(over_one) - len(missing)}")
    print(f"  |Δ| ≤ 1 min: {len(within_one)}")
    print(f"  |Δ| > 1 min: {len(over_one)}")
    print(f"  missing in txt: {len(missing)}")
    print()
    print("| term | API fixture | KASI txt | Δ (API − txt, min) |")
    print("|---|---|---|---|")
    for term, api_at, txt_at, delta in within_one + over_one:
        print(f"| {term} | {api_at} | {txt_at} | {delta:+d} |")
    for term, api_at in missing:
        print(f"| {term} | {api_at} | — | missing |")
    return 2 if missing else 0


def dataset_label(source_path: Path) -> str:
    if source_path.suffix.lower() == ".json":
        return "data.go.kr 한국천문연구원_특일 정보 (get24DivisionsInfo), KST"
    return f"한국천문연구원 24기 입기 시각 ({SOURCE_URL}), KST(UTC+9 고정), downloaded 2026-09-22"


def render_module(source_path: Path, boundaries: list[Boundary], ipchun: list[tuple[str, str]]) -> str:
    digest = hashlib.sha256(source_path.read_bytes()).hexdigest()
    lines = [
        "// GENERATED FILE — do not edit by hand.",
        "// Source: scripts/generate_solar_terms_module.py",
        f"//   fixture: docs/fixtures/{source_path.name}",
        f"//   sha256:  {digest}",
        f"//   dataset: {dataset_label(source_path)}",
        f"//   coverage: {boundaries[0].starts_at} ({boundaries[0].term}) .. {boundaries[-1].starts_at} ({boundaries[-1].term})",
        "// Regenerate with: python scripts/generate_solar_terms_module.py",
        "",
        'import type { SolarMonthBoundary } from "./solar-terms.js";',
        "",
        "export const IPCHUN_BY_YEAR: Record<number, string> = {",
    ]

    for index, (year, starts_at) in enumerate(ipchun):
        comma = "," if index < len(ipchun) - 1 else ""
        lines.append(f'  {year}: "{starts_at}"{comma}')

    lines += [
        "};",
        "",
        "export const SOLAR_MONTH_BOUNDARIES: SolarMonthBoundary[] = [",
    ]

    previous_solar_year: int | None = None
    for index, row in enumerate(boundaries):
        if previous_solar_year is not None and row.solar_year != previous_solar_year:
            lines.append("")
        previous_solar_year = row.solar_year
        comma = "," if index < len(boundaries) - 1 else ""
        note = f" // KASI: {row.raw}" if row.raw != row.starts_at else ""
        lines.append(
            f'  {{ term: "{row.term}", startsAt: "{row.starts_at}", '
            f"solarYear: {row.solar_year}, monthOrdinal: {row.ordinal} }}{comma}{note}"
        )

    lines += ["];", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    sys.exit(main())
