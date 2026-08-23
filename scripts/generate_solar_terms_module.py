#!/usr/bin/env python3
"""Generate the embedded solar-term data module from a collected KASI fixture.

The fixture is produced by scripts/collect_public_data_solar_terms.py against the
data.go.kr 한국천문연구원_특일 정보 API. This script turns the 12 month-boundary
terms (절) of that fixture into packages/saju-core/src/solar-terms.data.ts.

Rows outside the API's coverage (1989-1999) are not available from that source, so
the pre-2000 boundaries stay hand-maintained and are re-emitted verbatim from
LEGACY_BOUNDARIES / LEGACY_IPCHUN below.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_FIXTURE = REPO_ROOT / "docs/fixtures/kasi-special-days-solar-terms-2000-2028.json"
DEFAULT_OUTPUT = REPO_ROOT / "packages/saju-core/src/solar-terms.data.ts"

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

# Pre-2000 rows the approved API does not serve (it returns totalCount=0 for
# 1989-1999). Kept verbatim from the hand-maintained table so the existing
# 1990 fixtures and boundary tests keep their data.
LEGACY_BOUNDARIES = (
    ("daeseol", "1989-12-07T17:22", 1989, 10),
    ("sohan", "1990-01-05T23:33", 1989, 11),
    ("ipchun", "1990-02-04T11:14", 1990, 0),
    ("daeseol", "1999-12-07T22:48", 1999, 10),
)
LEGACY_IPCHUN = (("1990", "1990-02-04T11:14"),)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true", help="Fail if the output is stale instead of writing it.")
    args = parser.parse_args()

    fixture = json.loads(args.fixture.read_text(encoding="utf-8"))
    boundaries = build_boundaries(fixture)
    ipchun = build_ipchun(boundaries)
    rendered = render_module(fixture["metadata"], args.fixture, boundaries, ipchun)

    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(f"{args.output} is stale; re-run scripts/generate_solar_terms_module.py.")
            return 1
        print(f"{args.output} is up to date ({len(boundaries)} boundaries).")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")
    print(f"Wrote {args.output} with {len(boundaries)} month boundaries ({boundaries[0][1]} .. {boundaries[-1][1]}).")
    return 0


def build_boundaries(fixture: dict) -> list[tuple[str, str, int, int]]:
    """Return (term, startsAt, solarYear, monthOrdinal) rows sorted by startsAt."""
    rows: list[tuple[str, str, int, int]] = list(LEGACY_BOUNDARIES)
    api_rows = sorted(
        (record for record in fixture["records"] if record["term"] in MONTH_ORDINAL_BY_TERM),
        key=lambda record: record["startsAt"],
    )

    for record in api_rows:
        term = record["term"]
        starts_at = record["startsAt"]
        rows.append((term, starts_at, solar_year_for(term, starts_at), MONTH_ORDINAL_BY_TERM[term]))

    rows.sort(key=lambda row: row[1])
    assert_month_sequence(rows)
    return rows


def solar_year_for(term: str, starts_at: str) -> int:
    """The 절기 year runs 입춘 to 입춘, so a January 소한 belongs to the previous year."""
    calendar_year = int(starts_at[:4])
    return calendar_year - 1 if term == "sohan" else calendar_year


def assert_month_sequence(rows: list[tuple[str, str, int, int]]) -> None:
    """Every contiguous pair must advance the month ordinal by exactly one."""
    for index in range(1, len(rows)):
        previous = rows[index - 1]
        current = rows[index]
        gap_days = (date_value(current[1]) - date_value(previous[1])) / (24 * 60)

        # Isolated legacy rows are allowed to sit far from their neighbours; the
        # engine's own 45-day span check refuses to interpolate across the gap.
        if gap_days > 45:
            continue

        expected_ordinal = (previous[3] + 1) % 12
        if current[3] != expected_ordinal:
            raise SystemExit(
                f"Month ordinal is not contiguous at {current[1]} ({current[0]}): "
                f"expected {expected_ordinal} after {previous[1]} ({previous[0]}), got {current[3]}."
            )


def date_value(starts_at: str) -> int:
    """Minutes since epoch, read as a wall-clock KST value (no timezone math)."""
    parsed = datetime.strptime(starts_at, "%Y-%m-%dT%H:%M")
    return int((parsed - datetime(1970, 1, 1)).total_seconds() // 60)


def build_ipchun(boundaries: list[tuple[str, str, int, int]]) -> list[tuple[str, str]]:
    rows = dict(LEGACY_IPCHUN)
    for term, starts_at, _solar_year, _ordinal in boundaries:
        if term == "ipchun":
            rows[starts_at[:4]] = starts_at
    return sorted(rows.items())


def render_module(
    metadata: dict,
    fixture_path: Path,
    boundaries: list[tuple[str, str, int, int]],
    ipchun: list[tuple[str, str]],
) -> str:
    fixture_name = fixture_path.name
    api_years = f"{metadata['startYear']}-{metadata['endYear']}"
    lines = [
        "// GENERATED FILE — do not edit by hand.",
        "// Source: scripts/generate_solar_terms_module.py",
        f"//   fixture: docs/fixtures/{fixture_name}",
        f"//   dataset: {metadata['source']} ({metadata['operation']}), KST",
        f"//   API-sourced years: {api_years}; pre-2000 rows are hand-maintained (the API serves none).",
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
    for index, (term, starts_at, solar_year, ordinal) in enumerate(boundaries):
        if previous_solar_year is not None and solar_year != previous_solar_year:
            lines.append("")
        previous_solar_year = solar_year
        comma = "," if index < len(boundaries) - 1 else ""
        lines.append(
            f'  {{ term: "{term}", startsAt: "{starts_at}", '
            f"solarYear: {solar_year}, monthOrdinal: {ordinal} }}{comma}"
        )

    lines += ["];", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    sys.exit(main())
