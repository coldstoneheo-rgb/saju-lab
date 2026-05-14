import type { BirthInput, PillarsResult } from "./types.js";

export interface GoldenFixture {
  id: string;
  input: BirthInput;
  expected: PillarsResult;
  notes: string;
  source: string;
}

export const GOLDEN_FIXTURES: GoldenFixture[] = [
  {
    id: "fixture-1990-before-ipchun",
    input: {
      birthDate: "1990-01-01",
      birthTime: "10:30",
      timezone: "Asia/Seoul",
      sex: "other"
    },
    expected: {
      year: { stem: "gi", branch: "sa" },
      month: { stem: "byeong", branch: "ja" },
      day: { stem: "byeong", branch: "in" },
      time: { stem: "gye", branch: "sa" }
    },
    notes: "Before 1990 Ipchun, so the solar year remains 1989. 1990-01-01 is anchored as Bing Yin day.",
    source: "ChineseCalendarOnline lists 1990-01-01 as Ji Si year, Bing Zi month, Bing Yin day."
  },
  {
    id: "fixture-2000-before-ipchun",
    input: {
      birthDate: "2000-02-04",
      birthTime: "12:00",
      timezone: "Asia/Seoul",
      sex: "other"
    },
    expected: {
      year: { stem: "gi", branch: "myo" },
      month: { stem: "jeong", branch: "chuk" },
      day: { stem: "im", branch: "jin" },
      time: { stem: "byeong", branch: "o" }
    },
    notes: "Before the 2000 Ipchun boundary in the embedded Asia/Seoul table.",
    source: "Fixture table boundary record for 2000 Ipchun."
  },
  {
    id: "fixture-2010-mangjong-month",
    input: {
      birthDate: "2010-06-21",
      birthTime: "23:59",
      timezone: "Asia/Seoul",
      sex: "other"
    },
    expected: {
      year: { stem: "gyeong", branch: "in" },
      month: { stem: "im", branch: "o" },
      day: { stem: "im", branch: "in" },
      time: { stem: "gyeong", branch: "ja" }
    },
    notes: "After Mangjong and before Soseo, so it remains the Wu month branch.",
    source: "Fixture table boundary records for 2010 Mangjong and Soseo."
  },
  {
    id: "fixture-2015-daeseol-month",
    input: {
      birthDate: "2015-12-22",
      birthTime: "00:30",
      timezone: "Asia/Seoul",
      sex: "other"
    },
    expected: {
      year: { stem: "eul", branch: "mi" },
      month: { stem: "mu", branch: "ja" },
      day: { stem: "im", branch: "sin" },
      time: { stem: "gyeong", branch: "ja" }
    },
    notes: "After Daeseol, so the month branch is Zi. Dongji is not a month-pillar boundary.",
    source: "Fixture table boundary record for 2015 Daeseol."
  },
  {
    id: "fixture-2024-at-ipchun",
    input: {
      birthDate: "2024-02-04",
      birthTime: "17:27",
      timezone: "Asia/Seoul",
      sex: "other"
    },
    expected: {
      year: { stem: "gap", branch: "jin" },
      month: { stem: "byeong", branch: "in" },
      day: { stem: "mu", branch: "sul" },
      time: { stem: "sin", branch: "yu" }
    },
    notes: "At the Ipchun boundary; exact boundary minute applies the new solar year and month.",
    source: "2024 Ipchun time is commonly listed as 17:27 KST; 2024-02-04 is Wu Xu day in public almanacs."
  }
];
