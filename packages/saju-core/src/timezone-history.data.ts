// Korean civil-time history used to bring a birth wall clock onto the KST
// (UTC+9, no DST) wall clock that the KASI solar-term table is written in.
//
// Source: IANA tzdb 2026d `asia` — Zone Asia/Seoul + Rule ROK. Each row quotes
// the tzdb line it comes from; transition instants were also checked against
// Node 22 / ICU 77 (tz 2025b) `Intl.DateTimeFormat("Asia/Seoul")` in
// timezone-history.test.ts. tzdb rule times without a suffix are wall-clock
// times, so a DST end at "24:00" means the clocks went from 24:00 DST back to
// 23:00 standard, and 23:00-23:59 of that date happened twice.

export type KoreaOffsetKind = "std" | "dst";

export interface KoreaOffsetInterval {
  /** First instant of the interval (UTC, inclusive), ISO minute. */
  fromUtc: string;
  /** First instant after the interval (UTC, exclusive); null = open-ended. */
  toUtc: string | null;
  /** UTC offset in minutes that civil clocks showed during the interval. */
  offsetMinutes: number;
  kind: KoreaOffsetKind;
  /** The wall-clock transition as people experienced it. */
  wallClock: string;
  /** tzdb 2026d line(s) the row is derived from. */
  source: string;
}

/** Civil time before this instant is LMT (8:27:52) and is not supported. */
export const KOREA_OFFSET_HISTORY_START_UTC = "1908-03-31T15:33";

export const KST_OFFSET_MINUTES = 540;

// Standard-time intervals. 1945-09-08 (JST → KST label) changed no offset and
// therefore has no row. The +8:30 periods are why 1954-1961 births need care.
const STANDARD: KoreaOffsetInterval[] = [
  {
    fromUtc: "1908-03-31T15:33",
    toUtc: "1911-12-31T15:30",
    offsetMinutes: 510,
    kind: "std",
    wallClock: "1908-04-01 00:00 LMT → KST +08:30",
    source: "Zone Asia/Seoul 8:27:52 - LMT 1908 Apr 1 / 8:30 - KST 1912 Jan 1"
  },
  {
    fromUtc: "1911-12-31T15:30",
    toUtc: "1954-03-20T15:00",
    offsetMinutes: 540,
    kind: "std",
    wallClock: "1912-01-01 00:00 +08:30 → 00:30 +09:00",
    source: "Zone Asia/Seoul 9:00 - JST 1945 Sep 8 / 9:00 ROK K%sT 1954 Mar 21"
  },
  {
    fromUtc: "1954-03-20T15:00",
    toUtc: "1961-08-09T15:30",
    offsetMinutes: 510,
    kind: "std",
    wallClock: "1954-03-21 00:00 +09:00 → 03-20 23:30 +08:30",
    source: "Zone Asia/Seoul 8:30 ROK K%sT 1961 Aug 10"
  },
  {
    fromUtc: "1961-08-09T15:30",
    toUtc: null,
    offsetMinutes: 540,
    kind: "std",
    wallClock: "1961-08-10 00:00 +08:30 → 00:30 +09:00",
    source: "Zone Asia/Seoul 9:00 ROK K%sT"
  }
];

// Summer time (+1h on the standard offset of the day). Wall-clock start/end
// from Rule ROK; fromUtc = start − standard offset, toUtc = end − DST offset.
const DST: KoreaOffsetInterval[] = [
  dst("1948-05-31T15:00", "1948-09-12T14:00", 600, "1948-06-01 00:00 → 01:00; 1948-09-12 24:00 → 23:00",
    "Rule ROK 1948 only - Jun 1 0:00 1:00 D / Sep 12 24:00 0 S"),
  dst("1949-04-02T15:00", "1949-09-10T14:00", 600, "1949-04-03 00:00 → 01:00; 1949-09-10 24:00 → 23:00",
    "Rule ROK 1949 only - Apr 3 0:00 1:00 D / 1949-1951 Sep Sat>=7 24:00 0 S"),
  dst("1950-03-31T15:00", "1950-09-09T14:00", 600, "1950-04-01 00:00 → 01:00; 1950-09-09 24:00 → 23:00",
    "Rule ROK 1950 only - Apr 1 0:00 1:00 D / 1949-1951 Sep Sat>=7 24:00 0 S"),
  dst("1951-05-05T15:00", "1951-09-08T14:00", 600, "1951-05-06 00:00 → 01:00; 1951-09-08 24:00 → 23:00",
    "Rule ROK 1951 only - May 6 0:00 1:00 D / 1949-1951 Sep Sat>=7 24:00 0 S"),
  dst("1955-05-04T15:30", "1955-09-08T14:30", 570, "1955-05-05 00:00 → 01:00; 1955-09-08 24:00 → 23:00",
    "Rule ROK 1955 only - May 5 0:00 1:00 D / Sep 8 24:00 0 S"),
  dst("1956-05-19T15:30", "1956-09-29T14:30", 570, "1956-05-20 00:00 → 01:00; 1956-09-29 24:00 → 23:00",
    "Rule ROK 1956 only - May 20 0:00 1:00 D / Sep 29 24:00 0 S"),
  dst("1957-05-04T15:30", "1957-09-21T14:30", 570, "1957-05-05 00:00 → 01:00; 1957-09-21 24:00 → 23:00",
    "Rule ROK 1957-1960 May Sun>=1 0:00 1:00 D / Sep Sat>=17 24:00 0 S"),
  dst("1958-05-03T15:30", "1958-09-20T14:30", 570, "1958-05-04 00:00 → 01:00; 1958-09-20 24:00 → 23:00",
    "Rule ROK 1957-1960 May Sun>=1 0:00 1:00 D / Sep Sat>=17 24:00 0 S"),
  dst("1959-05-02T15:30", "1959-09-19T14:30", 570, "1959-05-03 00:00 → 01:00; 1959-09-19 24:00 → 23:00",
    "Rule ROK 1957-1960 May Sun>=1 0:00 1:00 D / Sep Sat>=17 24:00 0 S"),
  dst("1960-04-30T15:30", "1960-09-17T14:30", 570, "1960-05-01 00:00 → 01:00; 1960-09-17 24:00 → 23:00",
    "Rule ROK 1957-1960 May Sun>=1 0:00 1:00 D / Sep Sat>=17 24:00 0 S"),
  dst("1987-05-09T17:00", "1987-10-10T17:00", 600, "1987-05-10 02:00 → 03:00; 1987-10-11 03:00 → 02:00",
    "Rule ROK 1987-1988 May Sun>=8 2:00 1:00 D / Oct Sun>=8 3:00 0 S"),
  dst("1988-05-07T17:00", "1988-10-08T17:00", 600, "1988-05-08 02:00 → 03:00; 1988-10-09 03:00 → 02:00",
    "Rule ROK 1987-1988 May Sun>=8 2:00 1:00 D / Oct Sun>=8 3:00 0 S")
];

function dst(fromUtc: string, toUtc: string, offsetMinutes: number, wallClock: string, source: string): KoreaOffsetInterval {
  return { fromUtc, toUtc, offsetMinutes, kind: "dst", wallClock, source };
}

/**
 * Every interval during which one UTC offset was in force, sorted by start.
 * Standard intervals are split around the summer-time intervals so the list
 * partitions the timeline from 1908-04-01 onward.
 */
export const KOREA_OFFSET_INTERVALS: readonly KoreaOffsetInterval[] = partition(STANDARD, DST);

function partition(standard: KoreaOffsetInterval[], summer: KoreaOffsetInterval[]): KoreaOffsetInterval[] {
  const rows: KoreaOffsetInterval[] = [];
  for (const std of standard) {
    let cursor = std.fromUtc;
    const inside = summer
      .filter((row) => row.fromUtc >= std.fromUtc && (std.toUtc === null || row.fromUtc < std.toUtc))
      .sort((a, b) => a.fromUtc.localeCompare(b.fromUtc));

    for (const row of inside) {
      if (cursor < row.fromUtc) {
        rows.push({ ...std, fromUtc: cursor, toUtc: row.fromUtc });
      }
      rows.push(row);
      cursor = row.toUtc as string;
    }
    if (std.toUtc === null || cursor < std.toUtc) {
      rows.push({ ...std, fromUtc: cursor });
    }
  }
  return rows;
}
