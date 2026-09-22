#!/usr/bin/env python3
"""Exhaustive cross-check of the embedded Korean lunar table against the upstream library.

Re-implements the bit rules of packages/saju-core/src/lunar-calendar.data.ts
(the same rules as lunar-calendar.ts) in Python, converts every lunar day
1900..2049 — regular and leap months — and compares the Gregorian result with
`korean_lunar_calendar` (usingsky, 0.4.0, MIT), the library the table was
extracted from. Also prints the canonical table SHA-256 so it can be compared
with LUNAR_TABLE_SHA256 and baby-naming-ai's docs/golden/lunar-table.sha256.

    pip install korean_lunar_calendar==0.4.0
    python scripts/verify_lunar_table.py

This runs outside CI (network install); the result is recorded in the HO REPORT.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import re
import sys
from pathlib import Path

from korean_lunar_calendar import KoreanLunarCalendar

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_TS = REPO_ROOT / "packages/saju-core/src/lunar-calendar.data.ts"

MIN_YEAR, MAX_YEAR = 1900, 2050
ANCHOR = dt.date(1900, 1, 31)


def load_table() -> tuple[list[int], str]:
    text = DATA_TS.read_text(encoding="utf-8")
    body = text[text.index("LUNAR_YEAR_DATA"):]
    values = [int(v, 16) for v in re.findall(r"0x[0-9A-Fa-f]{7}", body)]
    declared = re.search(r'LUNAR_TABLE_SHA256 = "([0-9a-f]{64})"', text)
    return values, declared.group(1) if declared else ""


def canonical_sha256(values: list[int]) -> str:
    canon = "\n".join(f"0x{v:07X}" for v in values) + "\n"
    return hashlib.sha256(canon.encode("utf-8")).hexdigest()


def leap_month(v: int) -> int:
    return (v >> 12) & 0xF


def year_days(v: int) -> int:
    return (v >> 17) & 0x1FF


def month_days(v: int, month: int, is_leap: bool) -> int:
    if is_leap:
        return 30 if (v >> 16) & 1 else 29
    return 30 if (v >> (12 - month)) & 1 else 29


def to_solar(table: list[int], year: int, month: int, day: int, is_leap: bool) -> dt.date | None:
    v = table[year - MIN_YEAR]
    if is_leap and leap_month(v) != month:
        return None
    if not 1 <= day <= month_days(v, month, is_leap):
        return None
    days = sum(year_days(table[y - MIN_YEAR]) for y in range(MIN_YEAR, year))
    days += sum(month_days(v, m, False) for m in range(1, month))
    leap = leap_month(v)
    if leap and leap < month:
        days += month_days(v, leap, True)
    if is_leap:
        days += month_days(v, month, False)
    days += day - 1
    return ANCHOR + dt.timedelta(days=days)


def main() -> int:
    table, declared = load_table()
    sha = canonical_sha256(table)
    print(f"table values: {len(table)}  canonical sha256: {sha}  declared: {declared}  {'MATCH' if sha == declared else 'MISMATCH'}")

    upstream = KoreanLunarCalendar()
    compared = mismatches = 0
    first_bad: list[str] = []
    for year in range(MIN_YEAR, 2050):  # 2050 itself has no following anchor in the upstream data
        v = table[year - MIN_YEAR]
        leap = leap_month(v)
        for month in range(1, 13):
            for is_leap in ([False, True] if leap == month else [False]):
                for day in range(1, month_days(v, month, is_leap) + 1):
                    ours = to_solar(table, year, month, day, is_leap)
                    ok = upstream.setLunarDate(year, month, day, is_leap)
                    theirs = upstream.SolarIsoFormat() if ok else None
                    compared += 1
                    if ours is None or theirs is None or ours.isoformat() != theirs:
                        mismatches += 1
                        if len(first_bad) < 10:
                            first_bad.append(f"{year}-{month:02d}-{day:02d}{'L' if is_leap else ''} ours={ours} upstream={theirs}")
    print(f"compared lunar days 1900..2049: {compared}  mismatches: {mismatches}")
    for line in first_bad:
        print("  ", line)
    return 0 if mismatches == 0 and sha == declared else 1


if __name__ == "__main__":
    sys.exit(main())
