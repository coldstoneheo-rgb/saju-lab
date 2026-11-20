import type { GyeokId, GyeokgukReading, PaidReportV1, StrengthReading, YongsinCandidate } from "@saju-lab/saju-core";

// 유료 3블록(강약 판독 · 용신 후보 · 격국) 화면 라벨(HO-2026-1120). 코어 결과를 이름으로만 옮긴다 — 뜻풀이·길흉 없음.
// 코어에 기본 세트가 없으므로(STRENGTH-READINGS.md · GEOKGUK.md) 세트를 모두 나란히 보이고 일치 여부를 적는다.

const ELEMENT_KO: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };

export const STRENGTH_SET_KO: Record<StrengthReading["ruleSetId"], string> = {
  "strength.month-first": "월령 우선",
  "strength.triad-majority": "삼득 다수결"
};

export const VERDICT_KO: Record<StrengthReading["verdict"], string> = {
  strong: "신강",
  weak: "신약",
  indeterminate: "판단 유보(월지 충)"
};

export const GYEOKGUK_SET_KO: Record<GyeokgukReading["ruleSetId"], string> = {
  "gyeokguk.exposed-first": "투출 우선",
  "gyeokguk.primary-only": "월지 정기",
  "gyeokguk.saryeong": "사령"
};

export const GYEOK_KO: Record<GyeokId, string> = {
  jeonggwan: "정관격",
  pyeongwan: "편관격",
  jeongjae: "정재격",
  pyeonjae: "편재격",
  siksin: "식신격",
  sanggwan: "상관격",
  jeongin: "정인격",
  pyeonin: "편인격",
  geonrok: "건록격",
  yangin: "양인격",
  wolgeop: "월겁격"
};

const UNAVAILABLE_KO: Record<NonNullable<GyeokgukReading["unavailable"]>, string> = {
  "bigyeop-month": "해당 격 없음(월지 비겁)",
  "no-day-counts": "판정 불가(절입 후 일수 없음)",
  "month-term-mismatch": "판정 불가(월지·절기 불일치)"
};

const EOKBU_KO: Record<string, string> = {
  "strong.siksang": "식상",
  "strong.jaeseong": "재성",
  "strong.gwanseong": "관성",
  "weak.inseong": "인성",
  "weak.bigyeop": "비겁"
};

const JOHU_KO: Record<string, string> = { winter: "겨울", summer: "여름", spring: "봄", autumn: "가을" };

/** 3블록 묶음 전체에 한 번만 붙는 안내(LC 11-20: 블록·카드마다 반복 0). */
export const PAID_BLOCKS_NOTE = "세 블록은 학설별 규칙표를 세트마다 돌린 결과를 나란히 보입니다. 실제 역술가 검토 전이며, 뜻풀이와 좋고 나쁨은 아직 붙이지 않았습니다.";
export const PAID_BLOCKS_TIME_UNKNOWN_NOTE = "출생 시간이 없어 시주를 빼고 셌습니다.";
export const YONGSIN_EMPTY = "규칙표에 해당하는 후보 없음";

export interface PaidBlockRow {
  label: string;
  value: string;
}

export interface PaidBlocksView {
  strength: { rows: PaidBlockRow[]; agrees: boolean };
  yongsin: PaidBlockRow[];
  /** partial = 판정 불가 세트가 있다(코어 agreesAcrossSets는 그 세트를 빼고 비교한다). */
  gyeokguk: { rows: PaidBlockRow[]; agrees: boolean; partial: boolean };
  note: string;
}

function strengthRow(reading: StrengthReading): PaidBlockRow {
  return { label: STRENGTH_SET_KO[reading.ruleSetId], value: VERDICT_KO[reading.verdict] };
}

/** 오행별로 묶는다. 억부는 근거 세트 이름을, 조후는 계절을 괄호에 적는다. 순서 = 코어 정렬(방법 → 규칙 → 오행). */
function yongsinRows(candidates: YongsinCandidate[]): PaidBlockRow[] {
  type Draft = { label: string; element: string; sets: string[] } | PaidBlockRow;
  const rows: Draft[] = [];
  const seen = new Map<string, { label: string; element: string; sets: string[] }>();
  for (const candidate of candidates) {
    const element = ELEMENT_KO[candidate.element] ?? candidate.element;
    const key = `${candidate.method}.${candidate.ruleId}`;
    const existing = seen.get(key);
    if (candidate.method === "eokbu") {
      const set = candidate.basis.readingRef ? STRENGTH_SET_KO[candidate.basis.readingRef.ruleSetId as StrengthReading["ruleSetId"]] : undefined;
      if (existing) {
        if (set) existing.sets.push(set);
        continue;
      }
      const row = { label: `억부 · ${EOKBU_KO[candidate.ruleId] ?? candidate.ruleId}`, element, sets: set ? [set] : [] };
      seen.set(key, row);
      rows.push(row);
    } else {
      rows.push({ label: "조후", value: `${element} (${JOHU_KO[candidate.ruleId] ?? candidate.ruleId})` });
    }
  }
  // 근거 세트가 없으면 빈 괄호 대신 괄호를 생략한다(LC 게이트 #145 관찰 ③).
  return rows.map((row) => ("value" in row ? row : { label: row.label, value: row.sets.length ? `${row.element} (${row.sets.join("·")})` : row.element }));
}

function gyeokgukRow(reading: GyeokgukReading): PaidBlockRow {
  const value = reading.unavailable
    ? UNAVAILABLE_KO[reading.unavailable]
    : reading.candidates.map((candidate) => GYEOK_KO[candidate.gyeok]).join(" / ") + (reading.ambiguous ? " (둘 다 후보)" : "");
  return { label: GYEOKGUK_SET_KO[reading.ruleSetId], value };
}

export function paidBlocksViewOf(paidReport: Pick<PaidReportV1, "structure" | "meta">): PaidBlocksView {
  const { strengthReadings, yongsinCandidates, gyeokguk } = paidReport.structure;
  return {
    strength: { rows: strengthReadings.map(strengthRow), agrees: strengthReadings[0]?.agreesAcrossSets ?? true },
    yongsin: yongsinRows(yongsinCandidates),
    gyeokguk: { rows: gyeokguk.map(gyeokgukRow), agrees: gyeokguk[0]?.agreesAcrossSets ?? true, partial: gyeokguk.some((reading) => reading.unavailable !== undefined) },
    note: paidReport.meta.timeKnown ? PAID_BLOCKS_NOTE : `${PAID_BLOCKS_NOTE} ${PAID_BLOCKS_TIME_UNKNOWN_NOTE}`
  };
}

export function agreementLabel(agrees: boolean): string {
  return agrees ? "세트 결과 같음" : "세트마다 다름";
}

/** 격국: 판정 불가 세트가 있으면 «같음»을 판정된 세트끼리로 좁혀 적는다(LC 게이트 #145 관찰 ①). */
export function gyeokgukAgreementLabel(gyeokguk: PaidBlocksView["gyeokguk"]): string {
  return gyeokguk.agrees && gyeokguk.partial ? "판정된 세트끼리 같음" : agreementLabel(gyeokguk.agrees);
}
