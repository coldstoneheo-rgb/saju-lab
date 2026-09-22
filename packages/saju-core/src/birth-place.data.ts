// Representative longitudes for the 17 시·도, used only for the true-solar-time
// option: the KST meridian is 135°E, so a birth at longitude λ reads a sun clock
// that is (λ − 135) × 4 minutes behind KST. Korea lies entirely west of 135°E,
// so every correction is negative. The equation of time is deliberately not
// applied (회의 2026-09-22 A1-3 ⑤: 균시차 미적용).
//
// Coordinates are the provincial/metropolitan government buildings as recorded
// on Wikidata (property P625), fetched 2026-09-22 and rounded to 4 decimals.

export interface BirthPlace {
  code: string;
  nameKo: string;
  longitude: number;
  /** Wikidata item of the government building the longitude was read from. */
  source: string;
}

export const KST_MERIDIAN = 135;

export const BIRTH_PLACES: readonly BirthPlace[] = [
  { code: "seoul", nameKo: "서울특별시", longitude: 126.9778, source: "https://www.wikidata.org/wiki/Q623908" },
  { code: "busan", nameKo: "부산광역시", longitude: 129.075, source: "https://www.wikidata.org/wiki/Q16097618" },
  { code: "daegu", nameKo: "대구광역시", longitude: 128.6018, source: "https://www.wikidata.org/wiki/Q16095354" },
  { code: "incheon", nameKo: "인천광역시", longitude: 126.7059, source: "https://www.wikidata.org/wiki/Q12613488" },
  { code: "gwangju", nameKo: "광주광역시", longitude: 126.8524, source: "https://www.wikidata.org/wiki/Q12585108" },
  { code: "daejeon", nameKo: "대전광역시", longitude: 127.3847, source: "https://www.wikidata.org/wiki/Q16095517" },
  { code: "ulsan", nameKo: "울산광역시", longitude: 129.3115, source: "https://www.wikidata.org/wiki/Q16099053" },
  { code: "sejong", nameKo: "세종특별자치시", longitude: 127.289, source: "https://www.wikidata.org/wiki/Q16097915" },
  { code: "gyeonggi", nameKo: "경기도", longitude: 127.0094, source: "https://www.wikidata.org/wiki/Q12583547" },
  { code: "gangwon", nameKo: "강원특별자치도", longitude: 127.7302, source: "https://www.wikidata.org/wiki/Q12583023" },
  { code: "chungbuk", nameKo: "충청북도", longitude: 127.4914, source: "https://www.wikidata.org/wiki/Q12620207" },
  { code: "chungnam", nameKo: "충청남도", longitude: 126.6728, source: "https://www.wikidata.org/wiki/Q12620195" },
  { code: "jeonbuk", nameKo: "전북특별자치도", longitude: 127.1087, source: "https://www.wikidata.org/wiki/Q12615114" },
  { code: "jeonnam", nameKo: "전라남도", longitude: 126.4629, source: "https://www.wikidata.org/wiki/Q12615100" },
  { code: "gyeongbuk", nameKo: "경상북도", longitude: 128.5058, source: "https://www.wikidata.org/wiki/Q12583737" },
  { code: "gyeongnam", nameKo: "경상남도", longitude: 128.6904, source: "https://www.wikidata.org/wiki/Q16093739" },
  { code: "jeju", nameKo: "제주특별자치도", longitude: 126.4981, source: "https://www.wikidata.org/wiki/Q12616502" }
];

export const DEFAULT_BIRTH_PLACE = "seoul";

/** Whole minutes to add to a KST wall clock to get local mean solar time (always ≤ 0 in Korea). */
export function trueSolarOffsetMinutes(longitude: number): number {
  return Math.round((longitude - KST_MERIDIAN) * 4);
}

export function findBirthPlace(code: string): BirthPlace | undefined {
  return BIRTH_PLACES.find((place) => place.code === code);
}
