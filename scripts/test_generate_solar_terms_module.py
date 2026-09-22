"""Unit tests for the KASI txt parser in generate_solar_terms_module.py.

Run: python -m unittest discover -s scripts -p "test_*.py"
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import generate_solar_terms_module as gen  # noqa: E402

SAMPLE = """[ 1920년-2100년 24기 입기 시각 ]
구분\t년도\t월\t일\t시\t분
------------------------------
23, 1950,  1,  6,  5, 39
24, 1950,  1, 20, 24,  0
 1, 1950,  2,  4, 17, 21
 2, 1950,  2, 19, 13, 18
"""


class ParseKasiTxtTest(unittest.TestCase):
    def setUp(self) -> None:
        self.path = Path(__file__).resolve().parent / "_sample_kasi.txt"
        self.path.write_text(SAMPLE, encoding="utf-8")

    def tearDown(self) -> None:
        self.path.unlink(missing_ok=True)

    def test_reads_all_rows_and_keeps_kasi_index(self) -> None:
        records = gen.parse_kasi_txt(self.path)
        self.assertEqual([record.kasi_index for record in records], [23, 24, 1, 2])
        self.assertEqual(records[0].starts_at, "1950-01-06T05:39")
        self.assertEqual(records[2].term, "ipchun")
        self.assertIsNone(records[1].term, "중기 rows carry no month-boundary term")

    def test_folds_24_00_into_next_day_midnight_and_keeps_raw(self) -> None:
        records = gen.parse_kasi_txt(self.path)
        daehan = records[1]
        self.assertEqual(daehan.starts_at, "1950-01-21T00:00")
        self.assertEqual(daehan.raw, "1950-01-20T24:00")

    def test_rejects_other_out_of_range_times(self) -> None:
        with self.assertRaises(SystemExit):
            gen.normalize_wall_clock(1950, 1, 20, 24, 1)
        with self.assertRaises(SystemExit):
            gen.normalize_wall_clock(1950, 1, 20, 25, 0)

    def test_only_the_twelve_jeol_become_boundaries(self) -> None:
        boundaries = gen.build_boundaries(gen.parse_kasi_txt(self.path))
        self.assertEqual([row.term for row in boundaries], ["sohan", "ipchun"])
        self.assertEqual([row.solar_year for row in boundaries], [1949, 1950])
        self.assertEqual([row.ordinal for row in boundaries], [11, 0])

    def test_month_sequence_must_be_contiguous(self) -> None:
        rows = [
            gen.Boundary("sohan", "1950-01-06T05:39", 1949, 11, "1950-01-06T05:39"),
            gen.Boundary("gyeongchip", "1950-03-06T11:35", 1950, 1, "1950-03-06T11:35"),
        ]
        with self.assertRaises(SystemExit):
            gen.assert_month_sequence(rows)

    def test_real_fixture_has_181_years_of_twelve_boundaries(self) -> None:
        boundaries = gen.build_boundaries(gen.parse_kasi_txt(gen.DEFAULT_SOURCE))
        self.assertEqual(len(boundaries), 12 * 181)
        self.assertEqual(boundaries[0].starts_at, "1920-01-06T23:41")
        self.assertEqual(boundaries[-1].starts_at, "2100-12-07T10:42")
        self.assertEqual(len(gen.build_ipchun(boundaries)), 181)
        # No emitted row needed 24:00 folding: all three 24:00 rows are 중기.
        self.assertEqual([row.raw for row in boundaries if row.raw != row.starts_at], [])


if __name__ == "__main__":
    unittest.main()
