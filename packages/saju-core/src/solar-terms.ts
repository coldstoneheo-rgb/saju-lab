import { compareLocalMinute, type ParsedBirthDateTime } from "./datetime.js";

export interface SolarMonthBoundary {
  term: "ipchun" | "gyeongchip" | "cheongmyeong" | "ipha" | "mangjong" | "soseo" | "ipchu" | "baengno" | "hallo" | "ipdong" | "daeseol" | "sohan";
  startsAt: string;
  solarYear: number;
  monthOrdinal: number;
}

const IPCHUN_BY_YEAR: Record<number, string> = {
  1990: "1990-02-04T11:14",
  2000: "2000-02-04T21:40",
  2010: "2010-02-04T07:48",
  2015: "2015-02-04T12:58",
  2024: "2024-02-04T17:27"
};

const SOLAR_MONTH_BOUNDARIES: SolarMonthBoundary[] = [
  { term: "daeseol", startsAt: "1989-12-07T17:22", solarYear: 1989, monthOrdinal: 10 },
  { term: "sohan", startsAt: "1990-01-05T23:33", solarYear: 1989, monthOrdinal: 11 },
  { term: "ipchun", startsAt: "1990-02-04T11:14", solarYear: 1990, monthOrdinal: 0 },

  { term: "daeseol", startsAt: "1999-12-07T22:48", solarYear: 1999, monthOrdinal: 10 },
  { term: "sohan", startsAt: "2000-01-06T09:00", solarYear: 1999, monthOrdinal: 11 },
  { term: "ipchun", startsAt: "2000-02-04T21:40", solarYear: 2000, monthOrdinal: 0 },

  { term: "ipchun", startsAt: "2010-02-04T07:48", solarYear: 2010, monthOrdinal: 0 },
  { term: "mangjong", startsAt: "2010-06-06T03:49", solarYear: 2010, monthOrdinal: 4 },
  { term: "soseo", startsAt: "2010-07-07T14:03", solarYear: 2010, monthOrdinal: 5 },

  { term: "ipchun", startsAt: "2015-02-04T12:58", solarYear: 2015, monthOrdinal: 0 },
  { term: "daeseol", startsAt: "2015-12-07T19:53", solarYear: 2015, monthOrdinal: 10 },
  { term: "sohan", startsAt: "2016-01-06T07:08", solarYear: 2015, monthOrdinal: 11 },

  { term: "sohan", startsAt: "2024-01-06T05:49", solarYear: 2023, monthOrdinal: 11 },
  { term: "ipchun", startsAt: "2024-02-04T17:27", solarYear: 2024, monthOrdinal: 0 },
  { term: "gyeongchip", startsAt: "2024-03-05T11:22", solarYear: 2024, monthOrdinal: 1 }
];

export function effectiveSolarYear(dateTime: ParsedBirthDateTime): number {
  const ipchun = IPCHUN_BY_YEAR[dateTime.year];

  if (ipchun === undefined) {
    throw new Error(`No Ipchun boundary is available for ${dateTime.year}.`);
  }

  return compareLocalMinute(dateTime, ipchun) >= 0 ? dateTime.year : dateTime.year - 1;
}

export function solarMonthBoundary(dateTime: ParsedBirthDateTime): SolarMonthBoundary {
  const boundary = SOLAR_MONTH_BOUNDARIES
    .filter((candidate) => compareLocalMinute(dateTime, candidate.startsAt) >= 0)
    .at(-1);

  if (boundary === undefined) {
    throw new Error("No solar month boundary is available for the given date.");
  }

  return boundary;
}
