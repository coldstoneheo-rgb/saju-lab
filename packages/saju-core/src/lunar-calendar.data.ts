// Korean lunar calendar table, 1900..2050 (151 years), for lunar → solar conversion.
//
// Source: 한국천문연구원(KARI) 음양력 data as packaged by usingsky/korean_lunar_calendar
// (Python 0.4.0, MIT — https://github.com/usingsky/korean_lunar_calendar_py); the
// 1900-2050 slice was extracted and masked to 26 bits in baby-naming-ai
// app/src/main/java/com/example/util/KoreanLunarCalendar.kt (2026-09-21), which
// is the direct origin of this file. Values are copied verbatim by script, not by hand.
//
// Bit layout of one year (see LUNAR_TABLE_SHA256 for the shared fingerprint):
//   bit 0..11  : month lengths, 12월..1월 — bit (12 − m) set ⇒ month m has 30 days, else 29
//   bit 12..15 : leap month number 1..12, 0 ⇒ no leap month that year
//   bit 16     : leap month length (1 ⇒ 30 days)
//   bit 17..25 : total days in the lunar year (354..385)
// Anchor: lunar 1900-01-01 = Gregorian 1900-01-31 (epoch day −25537).
//
// Verified upstream against the Python library for every lunar day 1900..2049
// (54,779 days, 0 mismatches) — see scripts/verify_lunar_table.py for the re-run.

export const LUNAR_MIN_YEAR = 1900;
export const LUNAR_MAX_YEAR = 2050;

/** Epoch day (1970-01-01 = 0) of Gregorian 1900-01-31, the first day of lunar 1900. */
export const LUNAR_ANCHOR_EPOCH_DAY = -25537;

/**
 * SHA-256 of the canonical table text: each value as `0x%07X`, one per line,
 * LF line endings, trailing LF, UTF-8. baby-naming-ai records the same value in
 * docs/golden/lunar-table.sha256 so both copies can be checked against each other.
 */
export const LUNAR_TABLE_SHA256 = "3507414e2d89d13e85ec02979772fc7f0a333fb6d97a575ccb953bda0d205107";

export const LUNAR_YEAR_DATA: readonly number[] = [
  0x30084BD, 0x2C404AE, 0x2C60A57, 0x2FE554D, 0x2C40D26, 0x2C60D95, 0x3014655, 0x2C4056A,
  0x2C609AD, 0x300255D, 0x2C404AE, 0x3006A5B, 0x2C40A4D, 0x2C40D25, 0x3005DA9, 0x2C60B55,
  0x2C4056A, 0x3002ADA, 0x2C6095D, 0x30074BB, 0x2C4049B, 0x2C40A4B, 0x3005B4B, 0x2C406A9,
  0x2C40AD4, 0x3024BB5, 0x2C402B6, 0x2C6095B, 0x3002537, 0x2C40497, 0x2FE6656, 0x2C40E4A,
  0x2C60EA5, 0x30156A9, 0x2C605B5, 0x2C402B6, 0x30138AE, 0x2C4092E, 0x3017C8D, 0x2C40C95,
  0x2C40D4A, 0x3016D8A, 0x2C60B69, 0x2C6056D, 0x301425B, 0x2C4025D, 0x2C4092D, 0x3002D2B,
  0x2C40A95, 0x3007D55, 0x2C40B4A, 0x2C60B55, 0x3015555, 0x2C604DB, 0x2C4025B, 0x3013857,
  0x2C4052B, 0x3008A9B, 0x2C40695, 0x2C406AA, 0x3006AEA, 0x2C60AB5, 0x2C404B6, 0x3004AAE,
  0x2C60A57, 0x2C40527, 0x2FE3726, 0x2C60D95, 0x30076B5, 0x2C4056A, 0x2C609AD, 0x30054DD,
  0x2C404AE, 0x2C40A4E, 0x3004D4D, 0x2C40D25, 0x3008D59, 0x2C40B54, 0x2C60D6A, 0x301695A,
  0x2C6095B, 0x2C4049B, 0x3004A9B, 0x2C40A4B, 0x300AB27, 0x2C406A5, 0x2C406D4, 0x3026B75,
  0x2C402B6, 0x2C6095B, 0x30054B7, 0x2C40497, 0x2C4064B, 0x2FE374A, 0x2C60EA5, 0x30086D9,
  0x2C605AD, 0x2C402B6, 0x300596E, 0x2C4092E, 0x2C40C96, 0x3004E95, 0x2C40D4A, 0x2C60DA5,
  0x3002755, 0x2C4056C, 0x3027ABB, 0x2C4025D, 0x2C4092D, 0x3005CAB, 0x2C40A95, 0x2C40B4A,
  0x3013B4A, 0x2C60B55, 0x300955D, 0x2C404BA, 0x2C60A5B, 0x3005557, 0x2C4052B, 0x2C40A95,
  0x3004B95, 0x2C406AA, 0x2C60AD5, 0x30026B5, 0x2C404B6, 0x3006A6E, 0x2C60A57, 0x2C40527,
  0x2FE56A6, 0x2C60D93, 0x2C405AA, 0x3003B6A, 0x2C6096D, 0x300B4AF, 0x2C404AE, 0x2C40A4D,
  0x3016D0D, 0x2C40D25, 0x2C40D52, 0x3005DD4, 0x2C60B6A, 0x2C6096D, 0x300255B, 0x2C4049B,
  0x3007A57, 0x2C40A4B, 0x2C40B25, 0x3015B25, 0x2C406D4, 0x2C60ADA, 0x30138B6,
];
