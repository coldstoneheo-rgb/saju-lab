import {
  EOKBU_RULES,
  GYEOKGUK_RULE_SETS,
  JOHU_RULES,
  STEM_FIVE_ELEMENT,
  STRENGTH_RULE_SETS,
  TEN_GOD_LABELS,
  tenGodOf,
  type FiveElement,
  type GyeokId,
  type GyeokgukReading,
  type PaidReportV1,
  type PillarKey,
  type Season,
  type Stem,
  type StrengthFactors,
  type StrengthReading,
  type StrengthVerdict,
  type YongsinCandidate
} from "@saju-lab/saju-core";

// 유료 3블록 뜻풀이(HO-2026-1120 plain-reading, 설계 = REPORT §0). React와 무관한 순수 모듈 — 입력 = structure + timeKnown, 출력 = 순수 객체.
// 칸은 셋: conclusion(결론 1문장) · meaning(그래서 무슨 뜻, 펼침) · basis(근거 · 방식 풀이 · 갈리는 까닭, 화면은 접고 HTML은 펼침).
// 문장은 조각(값별 Record · 발화 조건별 Record · 잇는 문장)으로만 짠다. 코어에 새 값·조건이 생기면 Record 타입이 깨져 잡힌다.
// 조각 id ↔ 근거 규칙 ↔ 출처 = docs/rules/PAID-3BLOCKS-READING.md 표 1(테스트가 대조). 학설은 고르지 않는다(코어에 기본 방식이 없다).

type Group = "비겁" | "식상" | "재성" | "관성" | "인성";
type StrengthRuleSetId = StrengthReading["ruleSetId"];
type GyeokgukRuleSetId = GyeokgukReading["ruleSetId"];
type StrengthConditionId = (typeof STRENGTH_RULE_SETS)[StrengthRuleSetId][number]["conditionId"];
type GyeokgukConditionId = (typeof GYEOKGUK_RULE_SETS)[GyeokgukRuleSetId][number]["conditionId"];
type EokbuRuleId = Exclude<(typeof EOKBU_RULES)[number]["ruleId"], "indeterminate">;
type JohuSeason = (typeof JOHU_RULES)[number]["season"];
type Unavailable = NonNullable<GyeokgukReading["unavailable"]>;

// ───────── 낱말 조각 ─────────

const STEM_KO: Record<Stem, string> = { gap: "갑", eul: "을", byeong: "병", jeong: "정", mu: "무", gi: "기", gyeong: "경", sin: "신", im: "임", gye: "계" };
const BRANCH_KO: Record<string, string> = { ja: "자", chuk: "축", in: "인", myo: "묘", jin: "진", sa: "사", o: "오", mi: "미", sin: "신", yu: "유", sul: "술", hae: "해" };
const PILLAR_KO: Record<PillarKey, string> = { year: "태어난 해", month: "태어난 달", day: "태어난 날", time: "태어난 시각" };
const ROLE_KO: Record<string, string> = { residual: "처음 구간", middle: "가운데 구간", primary: "중심" };
const SEASON_KO: Record<Season, string> = { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" };
const TERM_KO: Record<string, string> = {
  ipchun: "입춘", gyeongchip: "경칩", cheongmyeong: "청명", ipha: "입하", mangjong: "망종", soseo: "소서",
  ipchu: "입추", baengno: "백로", hallo: "한로", ipdong: "입동", daeseol: "대설", sohan: "소한"
};

/** 오행 이름 + 한자 뜻(木火土金水). 화면에는 늘 이 꼴로만 쓴다. */
export const ELEMENT_PLAIN: Record<FiveElement, string> = { wood: "목(나무)", fire: "화(불)", earth: "토(흙)", metal: "금(쇠)", water: "수(물)" };

/** 나 기준 다섯 갈래(GOLDEN-TENGODS.md:9 · YONGSIN-CANDIDATES.md 표 1 비고). */
export const GROUP_GLOSS: Record<Group, string> = {
  비겁: "나와 같은 기운",
  식상: "내가 만들어 내는 기운",
  재성: "내가 다스리는 기운",
  관성: "나를 다스리는 기운",
  인성: "나를 길러 주는 기운"
};

const EOKBU_GROUP: Record<EokbuRuleId, Group> = {
  "strong.siksang": "식상",
  "strong.jaeseong": "재성",
  "strong.gwanseong": "관성",
  "weak.inseong": "인성",
  "weak.bigyeop": "비겁"
};

export const STRENGTH_SET_KO: Record<StrengthRuleSetId, string> = { "strength.month-first": "월령 우선", "strength.triad-majority": "삼득 다수결" };
/** 펼친 문장에서 방식을 부를 때 쓰는 쉬운 이름(전문 낱말 없음). 처음 나오는 자리(줄 이름)만 «쉬운 이름(전문 이름)», 그 뒤로는 쉬운 이름만(LC 보정 1). */
export const STRENGTH_SET_PLAIN: Record<StrengthRuleSetId, string> = { "strength.month-first": "태어난 달을 먼저 보는 방식", "strength.triad-majority": "세 가지 물음을 세는 방식" };
const STRENGTH_SET_LABEL: Record<StrengthRuleSetId, string> = {
  "strength.month-first": `${STRENGTH_SET_PLAIN["strength.month-first"]}(${STRENGTH_SET_KO["strength.month-first"]})`,
  "strength.triad-majority": `${STRENGTH_SET_PLAIN["strength.triad-majority"]}(${STRENGTH_SET_KO["strength.triad-majority"]})`
};
/** «세 가지 물음»을 그 자리에서 푸는 한 구(LC 보정 2). */
export const TRIAD_PLAIN = "세 가지 물음(태어난 달 · 날의 아랫글자 · 둘레 글자가 나를 돕는가)";

export const VERDICT_KO: Record<StrengthVerdict, string> = { strong: "신강", weak: "신약", indeterminate: "판단 유보" };
/** 값별 뜻 — 강약 판정 이름 + 풀이. */
export const VERDICT_VALUE: Record<StrengthVerdict, string> = {
  strong: "신강(내 기운이 센 편)",
  weak: "신약(내 기운이 약한 편)",
  indeterminate: "판단 유보(결론을 내지 않음)"
};
/** 값별 뜻 — 판정이 억부(세기를 맞추는 쪽) 후보로 이어지는 방향 + 그래서 이 사주를 어떻게 읽는가(LC 보정 3). */
const VERDICT_DIRECTION: Record<StrengthVerdict, (list: string) => string> = {
  strong: (list) => `그래서 이 방식은 이 사주를, 센 기운을 덜어 낼 때 균형에 가까워지는 사주로 읽습니다. 덜어 내는 쪽으로 꼽히는 기운은 ${list}입니다.`,
  weak: (list) => `그래서 이 방식은 이 사주를, 나를 돕는 기운이 보태질 때 균형에 가까워지는 사주로 읽습니다. 돕는 쪽으로 꼽히는 기운은 ${list}입니다.`,
  indeterminate: () => "그래서 덜지 도울지 방향이 없어, 이 방식에서는 후보를 내지 않습니다."
};
/** 한눈에 ① — 판정을 문장 꼴로(이어 쓰는 꼴 · 끝맺는 꼴). LC 보정 4. */
const VERDICT_CLAUSE: Record<StrengthVerdict, [string, string]> = {
  strong: ["센 편으로 읽고", "센 편으로 읽습니다"],
  weak: ["약한 편으로 읽고", "약한 편으로 읽습니다"],
  indeterminate: ["결론을 미루고", "결론을 미룹니다"]
};
export const VERDICT_PLAIN: Record<Exclude<StrengthVerdict, "indeterminate">, string> = { strong: "센 편", weak: "약한 편" };

export const GYEOKGUK_SET_KO: Record<GyeokgukRuleSetId, string> = { "gyeokguk.exposed-first": "투출 우선", "gyeokguk.primary-only": "월지 정기", "gyeokguk.saryeong": "사령" };
/** 투출 = 달 속 글자가 연 · 월 · 시의 윗글자(천간)로 나옴(월간 포함 — GEOKGUK.md:9). «다른 기둥 위로»는 쓰지 않는다(critic 사실 오류 2). */
export const GYEOKGUK_SET_PLAIN: Record<GyeokgukRuleSetId, string> = { "gyeokguk.exposed-first": "윗글자로 드러난 글자를 먼저 보는 방식", "gyeokguk.primary-only": "태어난 달의 중심 글자만 보는 방식", "gyeokguk.saryeong": "날짜 구간을 보는 방식" };
const GYEOKGUK_SET_LABEL: Record<GyeokgukRuleSetId, string> = {
  "gyeokguk.exposed-first": `${GYEOKGUK_SET_PLAIN["gyeokguk.exposed-first"]}(${GYEOKGUK_SET_KO["gyeokguk.exposed-first"]})`,
  "gyeokguk.primary-only": `${GYEOKGUK_SET_PLAIN["gyeokguk.primary-only"]}(${GYEOKGUK_SET_KO["gyeokguk.primary-only"]})`,
  "gyeokguk.saryeong": `${GYEOKGUK_SET_PLAIN["gyeokguk.saryeong"]}(${GYEOKGUK_SET_KO["gyeokguk.saryeong"]})`
};

export const GYEOK_KO: Record<GyeokId, string> = {
  jeonggwan: "정관격", pyeongwan: "편관격", jeongjae: "정재격", pyeonjae: "편재격", siksin: "식신격", sanggwan: "상관격",
  jeongin: "정인격", pyeonin: "편인격", geonrok: "건록격", yangin: "양인격", wolgeop: "월겁격"
};
export const GYEOK_GROUP: Record<GyeokId, Group> = {
  jeonggwan: "관성", pyeongwan: "관성", jeongjae: "재성", pyeonjae: "재성", siksin: "식상", sanggwan: "식상",
  jeongin: "인성", pyeonin: "인성", geonrok: "비겁", yangin: "비겁", wolgeop: "비겁"
};
/** 일간 · 월지 짝의 표로 붙는 격(GEOKGUK.md 표 1). 그룹 풀이 대신 TABLE_GYEOK_GLOSS를 쓴다. */
export const TABLE_GYEOKS: ReadonlySet<GyeokId> = new Set<GyeokId>(["geonrok", "yangin", "wolgeop"]);
const TABLE_GYEOK_GLOSS = "나와 태어난 달의 짝으로 교재 표가 정한";

/**
 * 펼친 문장의 전문 낱말 → 같은 문장에 함께 나와야 하는 풀이 말(LC 추가 조건 1). 테스트가 이 사전으로 단언한다.
 * 긴 낱말(월령 우선 등)의 풀이는 짧은 낱말(월령)의 풀이를 품게 맞췄다.
 */
export const GLOSS: Record<string, string> = {
  월령: "태어난 달",
  삼득: "세 가지 물음",
  억부: "덜고",
  조후: "추위·더위",
  비겁: GROUP_GLOSS.비겁,
  식상: GROUP_GLOSS.식상,
  재성: GROUP_GLOSS.재성,
  관성: GROUP_GLOSS.관성,
  인성: GROUP_GLOSS.인성,
  투출: "드러난",
  사령: "구간",
  신강: "센 편",
  신약: "약한 편",
  득령: "나를 돕",
  득지: "나를 돕",
  득세: "나를 돕",
  월지: "태어난 달",
  정기: "중심 글자",
  일간: "나를 나타내는 글자",
  지장간: "속",
  용신: "보태",
  격국: "큰 틀",
  ...Object.fromEntries((Object.keys(GYEOK_KO) as GyeokId[]).map((id) => [GYEOK_KO[id], TABLE_GYEOKS.has(id) ? TABLE_GYEOK_GLOSS : GROUP_GLOSS[GYEOK_GROUP[id]]]))
};

/**
 * 값별 뜻 — 격 이름 + 풀이. 건록 · 양인 · 월겁은 일간 · 월지 짝의 표(GEOKGUK.md 표 1)로 붙는 이름이라 «나와 같은 기운이 중심»이라 쓰지 않는다:
 * 무-사 · 기-오 록과 무-오 양인은 월지 정기가 화라 토 일간과 같은 기운이 아니다(critic 사실 오류 1, GEOKGUK.md:24-25,32).
 */
export const gyeokValue = (gyeok: GyeokId): string => `${GYEOK_KO[gyeok]}(${TABLE_GYEOKS.has(gyeok) ? TABLE_GYEOK_GLOSS : `${GROUP_GLOSS[GYEOK_GROUP[gyeok]]}이 중심인`} 틀)`;
const stemNote = (dayMaster: Stem, stem: Stem): string => `${STEM_KO[stem]}(${TEN_GOD_LABELS[tenGodOf(dayMaster, stem)].ko})`;
/** 받침 유무로 조사를 고른다(이/가 · 은/는 · 을/를 · 과/와). */
export function josa(word: string, pair: "이/가" | "은/는" | "을/를" | "과/와"): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const final = code >= 0 && code <= 11171 ? code % 28 !== 0 : false;
  const [withFinal, without] = pair.split("/") as [string, string];
  return `${word}${final ? withFinal : without}`;
}
/** «화(불)를» — 조사는 괄호 앞 오행 이름에 맞춘다. */
const elementObject = (element: FiveElement | undefined): string => {
  if (!element) return "";
  const plain = ELEMENT_PLAIN[element];
  const name = plain.slice(0, 1);
  return `${plain}${josa(name, "을/를").slice(name.length)}`;
};
const elementsOf = (elements: FiveElement[]): string => elements.map((element) => ELEMENT_PLAIN[element]).join(" · ");

// ───────── 문장 조각 ─────────

/** 근거 조각 — 강약 발화 조건마다 1~2문장(왜 그 결과인가, 결론이 없으면 왜 없는가). */
const STRENGTH_REASON: Record<StrengthConditionId, (inputs: StrengthReading["inputs"]) => string[]> = {
  "month-first.month-clashed": () => ["태어난 달의 아랫글자가 다른 기둥의 아랫글자와 정면으로 부딪힙니다.", "이 방식은 그럴 때 태어난 달의 힘이 흔들린다고 보고 결론을 미룹니다."],
  "month-first.deukryeong": () => ["태어난 달의 중심 글자가 나를 돕습니다.", "이 방식은 태어난 달을 가장 무겁게 보므로 그것만으로 센 편이라고 읽습니다."],
  "month-first.ji-and-se": () => ["태어난 달은 나를 돕지 않지만, 날의 아랫글자와 나머지 글자 수가 모두 나를 돕습니다.", "이 방식은 그 둘이 함께 맞으면 센 편이라고 읽습니다."],
  "month-first.otherwise": () => ["태어난 달의 중심 글자가 나를 돕지 않고, 날의 아랫글자와 글자 수가 함께 돕지도 않습니다."],
  "triad-majority.two-or-more": (inputs) => [`${TRIAD_PLAIN} 가운데 ${inputs.triadCount}개가 나를 돕는 쪽이라, 둘 이상이면 센 편으로 읽습니다.`],
  "triad-majority.one-or-less": (inputs) => [inputs.triadCount === 0
    ? `${TRIAD_PLAIN} 가운데 나를 돕는 쪽이 하나도 없어, 이 방식은 약한 편으로 읽습니다.`
    : `${TRIAD_PLAIN} 가운데 ${inputs.triadCount}개만 나를 돕는 쪽이라, 하나 이하면 약한 편으로 읽습니다.`]
};

/** 격국 근거 조각이 고르는 사실(코어 값에서 계산 — 문장이 참인지 테스트가 같은 값으로 단언한다). */
export interface FrameFacts {
  /** 월지 정기가 연 · 월 · 시 윗글자로 나왔는가(일간 제외). */
  primaryExposed: boolean;
}
const BIGYEOP_MONTH_REASON = "태어난 달의 중심 글자가 나와 같은 기운이고, 이 방식은 그럴 때 태어난 달에서 틀을 읽지 않아 결론을 내지 않습니다.";
/** 비겁 표 — 일간 · 월지 짝만 말한다(오행을 주장하지 않음, critic 사실 오류 1). */
const TABLE_REASON = "나(태어난 날의 윗글자)와 태어난 달의 짝이 교재가 따로 정한 표에 있어, 그 표에 따라 이 틀로 읽습니다.";

/** 근거 조각 — 격국 발화 조건마다(결론이 없으면 왜 없는가). */
const GYEOKGUK_REASON: Record<GyeokgukConditionId, (facts: FrameFacts) => string> = {
  "exposed-first.bigyeop-table": () => TABLE_REASON,
  "primary-only.bigyeop-table": () => TABLE_REASON,
  "saryeong.bigyeop-table": () => TABLE_REASON,
  "exposed-first.primary-exposed": () => "태어난 달의 중심 글자가 윗글자로도 드러나 있어, 그 글자로 틀을 읽습니다.",
  "exposed-first.one-other-exposed": (facts) => facts.primaryExposed
    ? "태어난 달의 중심 글자는 나와 같은 기운이라 빼고, 윗글자로 드러난 달 속의 다른 글자 하나로 틀을 읽습니다."
    : "태어난 달의 중심 글자는 윗글자로 드러나 있지 않고, 달 속의 다른 글자 하나가 드러나 있어 그 글자로 틀을 읽습니다.",
  "exposed-first.two-others-exposed": () => "달 속의 다른 글자 둘이 모두 윗글자로 드러나 있고, 어느 쪽이 더 센지는 교재마다 기준이 달라 둘 다 후보로 둡니다.",
  "exposed-first.bigyeop-month": () => BIGYEOP_MONTH_REASON,
  "exposed-first.otherwise": () => "나와 같은 기운이 아닌 달 속 글자 가운데 윗글자로 드러난 것이 없어, 태어난 달의 중심 글자로 틀을 읽습니다.",
  "primary-only.bigyeop-month": () => BIGYEOP_MONTH_REASON,
  "primary-only.otherwise": () => "드러났는지와 상관없이 태어난 달의 중심 글자로 틀을 읽습니다.",
  "saryeong.unavailable": () => "",
  "saryeong.bigyeop": () => "태어난 날이 든 구간을 맡은 글자가 나와 같은 기운이고, 이 방식은 그럴 때 틀을 읽지 않아 결론을 내지 않습니다.",
  "saryeong.otherwise": () => "태어난 날이 그 달의 어느 구간에 드는지 보고, 그 구간을 맡은 글자로 틀을 읽습니다."
};

/** 값별 뜻 — 격국 결론이 없는 까닭(saryeong.unavailable은 이 값으로 갈린다). */
const UNAVAILABLE_REASON: Record<Unavailable, string> = {
  "bigyeop-month": BIGYEOP_MONTH_REASON,
  "no-day-counts": "이 방식에 필요한 날짜 구간 표가 없어 결론을 내지 않습니다.",
  "month-term-mismatch": "태어난 달과 절기 날짜 표가 서로 맞지 않아 결론을 내지 않습니다."
};
const UNAVAILABLE_VALUE: Record<Unavailable, string> = {
  "bigyeop-month": "해당 격 없음(결론을 내지 않음)",
  "no-day-counts": "판정 불가(결론을 내지 않음)",
  "month-term-mismatch": "판정 불가(결론을 내지 않음)"
};

/** 값별 뜻 — 조후 계절. 겨울·여름만 후보가 있다(YONGSIN-CANDIDATES.md 표 2). */
const JOHU_MEANING: Record<JohuSeason, (element: FiveElement | undefined) => string> = {
  winter: (element) => `태어난 달이 겨울이라 차가운 쪽으로 기운다고 보고, 데우는 쪽인 ${elementObject(element)} 꼽습니다.`,
  summer: (element) => `태어난 달이 여름이라 더운 쪽으로 기운다고 보고, 식히는 쪽인 ${elementObject(element)} 꼽습니다.`,
  spring: () => "태어난 달이 봄이라, 이 방식은 후보를 꼽지 않습니다(겨울과 여름에만 꼽습니다).",
  autumn: () => "태어난 달이 가을이라, 이 방식은 후보를 꼽지 않습니다(겨울과 여름에만 꼽습니다)."
};

/** 잇는 문장 · 고정 문장. 키 = 문장 id(docs/rules/PAID-3BLOCKS-READING.md 표 1과 1:1). */
export const COPY = {
  "N-HEAD": "아래는 명리 교재마다 다른 여러 보는 방식을 이 사주에 그대로 적용한 결과입니다. 방식마다 결과를 하나로 고르지 않고 나란히 보입니다. 실제 역술가 검토 전이라 참고용이며, 좋고 나쁨이나 앞일은 판단하지 않습니다.",
  "N-TIME-UNKNOWN": "출생 시간이 없어 태어난 시각의 기둥(시주)은 빼고 셌습니다.",
  "H-TITLE": "한눈에",
  "H-1-SAME": (value: string) => `어느 방식으로 봐도 내 기운은 ${value}으로 읽힙니다.`,
  "H-1-SPLIT": (clauses: string) => `내 기운의 세기는 보는 방식에 따라 갈립니다. ${clauses}.`,
  "H-1-NONE": "내 기운의 세기는 이 사주에서 판단을 미룹니다.",
  "H-2-EOKBU": (elements: string) => `그래서 보탬이 되는 기운의 후보는 ${elements}입니다.`,
  "H-2-BOTH": (elements: string, season: string) => `그래서 보탬이 되는 기운의 후보는 ${elements}이고, 계절로 보면 ${season}입니다.`,
  "H-2-JOHU": (season: string) => `세기로 정한 후보는 없고, 계절로 보면 보탬이 되는 기운은 ${season}입니다.`,
  "H-2-NONE": "보탬이 되는 기운은 이 사주에서 정하지 않습니다.",
  "H-3-SAME": (clause: string) => `큰 틀(격국)은 기운의 세기와 따로 봅니다. 어느 방식으로 봐도 ${clause}.`,
  "H-3-JUDGED-SAME": (clause: string) => `큰 틀(격국)은 기운의 세기와 따로 봅니다. 결론을 낸 방식은 모두 ${clause}, 나머지 방식은 결론을 미룹니다.`,
  "H-3-SPLIT": (clauses: string) => `큰 틀(격국)은 기운의 세기와 따로 봅니다. 보는 방식에 따라 갈려, ${clauses}.`,
  "H-3-ONE": (clause: string) => `큰 틀(격국)은 기운의 세기와 따로 봅니다. 한 방식만 ${clause}, 나머지 방식은 결론을 미룹니다.`,
  "H-3-NONE": "큰 틀(격국)은 이 사주에서 정하지 않습니다.",
  "H-3-READ": (value: string, final: boolean) => `${value}로 ${final ? "읽습니다" : "읽고"}`,
  "H-3-READ-BOTH": (values: string, final: boolean) => `${values} 둘 다 후보로 ${final ? "둡니다" : "두고"}`,
  "H-3-COUNT": (count: number) => `${["", "한", "두", "세"][count] ?? String(count)} 방식은`,
  "H-4-NONE": "보는 방식에 따라 결과가 갈리는 곳은 없습니다.",
  "H-4-S": "기운의 세기가 보는 방식에 따라 갈립니다. 까닭은 아래 카드에 있습니다.",
  "H-4-G": "큰 틀이 보는 방식에 따라 갈립니다. 까닭은 아래 카드에 있습니다.",
  "H-4-BOTH": "기운의 세기와 큰 틀이 모두 보는 방식에 따라 갈립니다. 까닭은 아래 카드에 있습니다.",
  "H-4-S-SAME": "기운의 세기는 어느 방식으로 봐도 같은 결과입니다.",
  "H-4-S-CLASH": (month: string, partners: string, method: string) => `기운의 세기는 태어난 달의 ${josa(month, "이/가")} ${josa(partners, "과/와")} 정면으로 부딪혀 ${method}만 결론을 미루므로, 보는 방식에 따라 갈립니다.`,
  "H-4-S-RYEONG": (month: string, stem: string, dayList: string, support: number, other: number) => `기운의 세기는 태어난 달 ${month}의 중심 글자 ${josa(stem, "이/가")} 나를 돕지만, 날의 아랫글자 속 ${josa(dayList, "은/는")} 돕지 않고 겉 글자도 돕는 쪽 ${support}개 · 나머지 ${other}개라서, 무엇을 기준에 두느냐로 정반대가 나옵니다.`,
  "H-4-S-OTHER": (values: string) => `기운의 세기는 방식마다 앞세우는 물음이 달라 갈립니다: ${values}.`,
  "H-4-G-SAME": "큰 틀은 어느 방식으로 봐도 같은 결과입니다.",
  "H-4-G-JUDGED-SAME": "큰 틀은 결론을 낸 방식끼리 같은 결과입니다.",
  "H-4-G-SPLIT": (picks: string) => `큰 틀은 ${picks} 잡아, 보는 방식에 따라 갈립니다.`,
  "H-4-G-PICK": (methods: string, chosen: string, lastStem: string) => `${josa(methods, "이/가")} ${chosen}${josa(lastStem, "을/를").slice(lastStem.length)}`,
  "H-4-G-ONE": "큰 틀은 한 방식에서만 정해집니다.",
  "H-4-G-NONE": "큰 틀은 어느 방식에서도 정해지지 않습니다.",
  "H-4-WHERE": (pillars: string) => `${pillars}의 윗글자로 드러남`,
  "H-4-NOT-EXPOSED": "드러나지 않음",
  // 카드 ⓐ 기운의 세기와 보탬이 되는 기운
  "C-ENERGY-TITLE": "기운의 세기와 보탬이 되는 기운",
  "Q-ENERGY": "이 칸의 물음: 내 기운(태어난 날의 윗글자)은 센 편인가 약한 편인가, 그래서 어떤 기운이 보태지면 균형에 가까워지는가(이 기운을 용신이라 부릅니다)?",
  "L-CHAIN": (verdict: string, elements: string) => `${verdict} → 보탬이 되는 기운 ${elements}`,
  "L-CHAIN-NONE": (verdict: string) => `${verdict} → 이 방식에서 나온 후보 없음`,
  "L-EOKBU-ITEM": (group: Group, element: string) => `${GROUP_GLOSS[group]}인 ${element}`,
  "L-SEASON-LABEL": "계절의 추위·더위를 맞추는 방식(조후)",
  "L-SEASON": (element: string) => `보탬이 되는 기운 ${element}`,
  "L-SEASON-NONE": (season: string) => `계절로 정하는 후보 없음(${season})`,
  "L-SEASON-DIFFER": "계절로 꼽은 기운은 세기로 꼽은 후보와 다릅니다. 한쪽은 기운의 세기를, 다른 쪽은 태어난 계절을 보기 때문입니다.",
  "L-SEASON-MEET": "계절로 꼽은 기운이 세기로 꼽은 후보와 겹칩니다.",
  "L-COMPARE-LABEL": "방식끼리 비교",
  "L-Y-SPLIT": "그래서 덜어 내는 쪽 후보와 돕는 쪽 후보가 함께 나왔습니다.",
  "T-MONTH-FIRST": "월령 우선: 월령(태어난 달)을 먼저 봅니다. 태어난 달이 다른 글자와 부딪히면(월지 충) 결론을 미루고, 태어난 달의 중심 글자가 나를 도우면 센 편, 아니면 득지와 득세가 둘 다 맞을 때만 센 편으로 봅니다. 자평 계열 교재의 관점입니다.",
  "T-TRIAD": "삼득 다수결: 득령 · 득지 · 득세 세 물음을 같은 무게로 세어 둘 이상이면 센 편, 하나 이하면 약한 편으로 봅니다. 통용 교재에서 흔히 쓰는 관점입니다.",
  "T-DEUKRYEONG": "득령(달을 얻음): 태어난 달의 중심 글자(월지 정기)가 나를 돕는 글자인가.",
  "T-DEUKJI": "득지(자리를 얻음): 태어난 날의 아랫글자 속에 든 글자(지장간) 가운데 나를 돕는 글자가 하나라도 있는가.",
  "T-DEUKSE": "득세(무리를 얻음): 태어난 달을 뺀 겉 글자(나를 뺀 윗글자와, 나머지 아랫글자의 중심 글자) 가운데 나를 돕는 글자가 나머지보다 적지 않은가(같은 수면 돕는 쪽으로 셉니다).",
  "T-SUPPORT": "나를 돕는 글자: 나와 같은 기운(비겁)과 나를 길러 주는 기운(인성)입니다.",
  "T-EOKBU": "억부: 내 기운이 센 편이면 덜어 내는 쪽(내가 만들어 내는 기운 · 내가 다스리는 기운 · 나를 다스리는 기운)을, 약한 편이면 돕는 쪽(나를 길러 주는 기운 · 나와 같은 기운)을 꼽습니다.",
  "T-JOHU": "조후: 겨울(해 · 자 · 축월)에 태어나면 데우는 화(불)를, 여름(사 · 오 · 미월)에 태어나면 식히는 수(물)를 꼽습니다. 봄 · 가을에는 꼽지 않습니다. 기운의 세기와 상관없이 계절만 봅니다.",
  "T-GROUPS": "다섯 갈래는 나(태어난 날의 윗글자)를 기준으로 나눕니다: 비겁 = 나와 같은 기운 · 식상 = 내가 만들어 내는 기운 · 재성 = 내가 다스리는 기운 · 관성 = 나를 다스리는 기운 · 인성 = 나를 길러 주는 기운.",
  "T-CYCLE": "만들어 내는 차례는 목(나무) → 화(불) → 토(흙) → 금(쇠) → 수(물) → 목이고, 다스리는 차례는 한 칸씩 건너뜁니다(목 → 토 → 수 → 화 → 금 → 목).",
  "E-DAYMASTER": (stem: string, element: string) => `나를 나타내는 글자(일간): ${stem} — ${element}`,
  "E-RYEONG": (mark: string, branch: string, stem: string) => `득령 ${mark}: 태어난 달 ${branch}의 중심 글자 → ${stem}`,
  "E-JI": (mark: string, list: string, support: string) => `득지 ${mark}: 태어난 날 아랫글자 속 글자 ${list} → 나를 돕는 글자 ${support}`,
  "E-SE": (mark: string, total: number, support: number, other: number) => `득세 ${mark}: 태어난 달을 뺀 겉 글자 ${total}개 가운데 나를 돕는 글자 ${support}개 · 나머지 ${other}개`,
  "E-CLASH": (month: string, list: string) => `월지 충 있음: 태어난 달(${month}) ↔ ${list}`,
  "E-NO-CLASH": "월지 충 없음: 태어난 달과 정면으로 부딪히는 아랫글자가 없습니다.",
  "E-NO-TIME": "(시주를 빼고 셈)",
  "E-Y-EOKBU": (group: Group, element: string, sets: string) => `${group} ${element} ← ${sets}`,
  "E-Y-SEASON": (branch: string, season: string) => `태어난 달: ${branch} — ${season}`,
  "D-S-CLASH": "갈리는 까닭: 태어난 달을 먼저 보는 방식은 태어난 달이 부딪히면 결론을 미루지만, 세 가지 물음을 세는 방식은 부딪힘을 따지지 않고 세 물음만 셉니다. «부딪혀도 태어난 달의 힘은 그대로»라고 보는 입장도 있어 어느 쪽이 맞는지 정하지 않았습니다.",
  "D-S-RYEONG": "갈리는 까닭: 득령은 있지만 득지와 득세가 없습니다. 태어난 달을 먼저 보는 방식은 득령 하나로 센 편이라고 보고, 세 가지 물음을 세는 방식은 둘 이상을 요구해 약한 편이라고 봅니다.",
  "D-S-OTHER": "갈리는 까닭: 두 방식이 앞세우는 물음이 달라 결과가 갈렸습니다.",
  "D-Y-ORDER": "억부와 조후 가운데 무엇을 앞세울지는 교재마다 다릅니다(『궁통보감』 계열은 조후를 앞세웁니다). 여기서는 고르지 않고 함께 보입니다.",
  "D-Y-WEAK": "약한 편일 때 나를 길러 주는 기운만, 또는 나와 같은 기운만 꼽는 교재도 있습니다.",
  "D-Y-STRONG": "센 편일 때 덜어 내는 세 갈래 가운데 하나를 앞세우는 교재도 있습니다.",
  // 카드 ⓑ 큰 틀(격국)
  "C-FRAME-TITLE": "큰 틀(격국)",
  "Q-FRAME": "이 칸의 물음: 이 사주의 큰 틀은 어떤 기운을 중심으로 짜였는가(교재는 이 틀을 격국이라 부릅니다)?",
  "N-FRAME-INDEPENDENT": "이 칸은 위 칸의 기운 세기와 따로 정합니다. 태어난 달 속 글자와, 그 글자가 윗글자로 드러났는지, 태어난 날이 그 달의 어느 구간인지를 봅니다.",
  "G-MEANING": (gyeok: GyeokId) => `${GYEOK_KO[gyeok]}은 이 사주를 ${GROUP_GLOSS[GYEOK_GROUP[gyeok]]}을 중심으로 짜인 틀로 읽는다는 뜻입니다.`,
  "G-MEANING-TABLE": (gyeok: GyeokId) => `${GYEOK_KO[gyeok]}은 나와 태어난 달의 짝으로 교재 표가 정한 이름이라, 다섯 갈래 가운데 어느 기운이 중심인지는 이 이름만으로 말하지 않습니다.`,
  "G-BOTH": "(둘 다 후보)",
  "L-G-REST": "나머지 방식은 위에 적은 까닭으로 결론을 내지 않았습니다.",
  "T-EXPOSED": "투출 우선: 태어난 달의 중심 글자가 연 · 월 · 시의 윗글자(천간)로 드러나 있으면 그 글자, 아니면 드러난 다른 달 속 글자, 아무것도 없으면 중심 글자로 틀을 고릅니다. 『자평진전』의 관점입니다.",
  "T-PRIMARY": "월지 정기: 드러났는지와 상관없이 태어난 달의 중심 글자(정기)로 고릅니다. 통용 교재의 단순한 방식입니다.",
  "T-SARYEONG": "사령: 한 달을 절기 날부터 날짜 구간(처음 · 가운데 · 중심)으로 나누고, 태어난 순간이 든 구간을 맡은 글자로 고릅니다. 『연해자평』 월률분야의 관점입니다.",
  "T-HIDDEN": "달 속 글자: 아랫글자(지지) 하나에는 윗글자(천간) 둘이나 셋이 들어 있다고 보고, 처음 구간(여기) · 가운데 구간(중기) · 중심(정기)으로 나눕니다.",
  "T-NAMES": "같은 갈래 안에서 이름이 둘로 나뉩니다. 나와 음양이 같으면 편재 · 편관 · 편인 · 식신, 다르면 정재 · 정관 · 정인 · 상관입니다. 건록격 · 양인격 · 월겁격은 나와 태어난 달의 짝이 교재가 따로 정한 표에 있을 때 붙이는 이름입니다.",
  "E-G-MONTH": (branch: string, list: string) => `태어난 달 ${branch} 속 글자: ${list}`,
  "E-G-EXPOSED": (list: string) => `윗글자(천간)로 드러난 달 속 글자: ${list}`,
  "E-G-SARYEONG": (term: string, days: string, boundaries: string, role: string, stem: string) => `사령: ${term} 절입 뒤 ${days}일 · 구간 경계 ${boundaries}일 → ${role} 글자 ${stem}`,
  "E-G-NEAR": "태어난 순간이 구간 경계와 하루 이내라, 출생 시각이 조금만 달라도 맡은 글자가 바뀔 수 있습니다.",
  "E-G-NOON": "출생 시간이 없어 사령은 정오(12:00)로 놓고 셌습니다.",
  "E-G-NO-SARYEONG": "사령: 날짜 구간을 셀 수 없음",
  "E-G-PICK": (set: string, picks: string) => `${set} → ${picks}`,
  "D-G-WHY": "갈리는 까닭: 『자평진전』은 드러난 글자를, 『연해자평』 월률분야는 태어난 무렵을 맡은 글자를, 통용 교재의 단순한 방식은 중심 글자를 앞세웁니다. 어느 쪽이 맞는지는 정하지 않았습니다.",
  // 배지 · 접기
  "B-SAME": "어느 방식으로 봐도 같음",
  "B-DIFF": "보는 방식에 따라 갈림",
  "B-JUDGED-NONE": "결론 낸 방식 없음",
  "B-JUDGED-ONE": "결론 낸 방식 1개",
  "B-JUDGED-SAME": "결론 낸 방식끼리 같음",
  "W-SUMMARY": "왜 이렇게 봤나"
} as const;

/** 조각 Record 이름(문서 표 1에 행으로 남는다). */
export const FRAGMENT_RECORDS = ["ELEMENT_PLAIN", "GROUP_GLOSS", "EOKBU_GROUP", "VERDICT_VALUE", "VERDICT_DIRECTION", "VERDICT_CLAUSE", "VERDICT_PLAIN", "TRIAD_PLAIN", "TABLE_GYEOKS", "STRENGTH_SET_LABEL", "STRENGTH_SET_PLAIN", "GYEOKGUK_SET_LABEL", "GYEOKGUK_SET_PLAIN", "GYEOK_KO", "GYEOK_GROUP", "STRENGTH_REASON", "GYEOKGUK_REASON", "UNAVAILABLE_REASON", "UNAVAILABLE_VALUE", "JOHU_MEANING"] as const;

export const PAID_BLOCKS_NOTE = COPY["N-HEAD"];
export const PAID_BLOCKS_TIME_UNKNOWN_NOTE = COPY["N-TIME-UNKNOWN"];
export const WHY_SUMMARY = COPY["W-SUMMARY"];

// ───────── 출력 ─────────

export interface ReadingLine {
  /** 방식 이름(풀이 포함). */
  label: string;
  /** 결론 1문장 — 펼침. */
  conclusion: string;
  /** 그래서 무슨 뜻인가 — 펼침. */
  meaning: string[];
  /** 근거 · 방식 풀이 · 갈리는 까닭 — 화면은 접고 HTML은 펼친다. */
  basis: string[];
  /** true = 화면 · 저장본의 펼친 부분에 찍지 않는다(일치 사례의 «방식끼리 비교» — 카드 배지와 같은 말). «한눈에» ④는 그대로 쓴다. */
  quiet?: boolean;
}

export interface ReadingCard {
  title: string;
  question: string;
  badge: string;
  /** 카드의 요약 결론 — «한눈에»가 그대로 다시 쓴다(화면에는 «한눈에»에서 1번만 보인다). */
  headline: string[];
  /** 카드 머리 펼친 문장(격국 «강약과 따로»). */
  notes: string[];
  lines: ReadingLine[];
  /** 카드 공통 근거·풀이(접힘). */
  basis: string[];
}

export interface PaidReading {
  note: string;
  glance: { title: string; sentences: [string, string, string, string] };
  energy: ReadingCard;
  frame: ReadingCard;
}

/** 입력 = structure + timeKnown. 서버로 옮겨도 그대로 돈다. */
export interface PaidReadingInput {
  structure: PaidReportV1["structure"];
  timeKnown: boolean;
}

const mark = (value: boolean): string => (value ? "해당" : "해당 없음");

function dayMasterLine(factors: StrengthFactors): string {
  return COPY["E-DAYMASTER"](STEM_KO[factors.dayMaster], ELEMENT_PLAIN[STEM_FIVE_ELEMENT[factors.dayMaster]]);
}

function eokbuOf(candidates: YongsinCandidate[], ruleSetId: StrengthRuleSetId): YongsinCandidate[] {
  return candidates.filter((c) => c.method === "eokbu" && c.basis.readingRef?.ruleSetId === ruleSetId);
}

type StrengthSplit = "same" | "clash" | "ryeong" | "other";
function strengthSplitOf(readings: StrengthReading[]): StrengthSplit {
  if (readings[0]?.agreesAcrossSets ?? true) return "same";
  if (readings.some((r) => r.verdict === "indeterminate")) return "clash";
  if (readings.some((r) => r.firedConditions[0] === "month-first.deukryeong")) return "ryeong";
  return "other";
}

function strengthBasis(reading: StrengthReading, factors: StrengthFactors, noTime: string): string[] {
  const dm = factors.dayMaster;
  const dayHidden = factors.layers.hiddenStems.filter((entry) => entry.pillar === "day");
  const supporting = factors.deukji.supporting.map((entry) => stemNote(dm, entry.stem));
  const ryeong = COPY["E-RYEONG"](mark(factors.deukryeong.value), BRANCH_KO[factors.monthBranch] ?? factors.monthBranch, stemNote(dm, factors.deukryeong.monthPrimary));
  const ji = COPY["E-JI"](mark(factors.deukji.value), dayHidden.map((entry) => stemNote(dm, entry.stem)).join(" · "), supporting.length ? supporting.join(" · ") : "없음");
  const se = COPY["E-SE"](mark(factors.deukse.value), factors.deukse.support + factors.deukse.other, factors.deukse.support, factors.deukse.other) + noTime;
  const clash = factors.monthBranchClashed.value
    ? COPY["E-CLASH"](BRANCH_KO[factors.monthBranch] ?? factors.monthBranch, factors.monthBranchClashed.with.map((entry) => `${PILLAR_KO[entry.pillar]}(${partnerBranch(entry.id, factors.monthBranch)})`).join(" · "))
    : COPY["E-NO-CLASH"];
  return reading.ruleSetId === "strength.month-first" ? [COPY["T-MONTH-FIRST"], clash, ryeong, ji, se] : [COPY["T-TRIAD"], ryeong, ji, se];
}

/** 충 규칙 id(`jin-sul`)에서 월지가 아닌 쪽 지지. */
function partnerBranch(id: string, monthBranch: string): string {
  const parts = id.split("-");
  const other = parts[0] === monthBranch ? parts[1] : parts[0];
  return BRANCH_KO[other ?? ""] ?? "";
}

/** ① 기운의 세기 요약(카드 ⓐ 머리 = 한눈에 ①). */
function strengthHeadline(readings: StrengthReading[]): string {
  const verdicts = [...new Set(readings.map((r) => r.verdict))];
  if (verdicts.length === 1 && verdicts[0] === "indeterminate") return COPY["H-1-NONE"];
  if (strengthSplitOf(readings) === "same") return COPY["H-1-SAME"](VERDICT_PLAIN[verdicts[0] as Exclude<StrengthVerdict, "indeterminate">]);
  // «한 방식은 약한 편으로 읽고, 다른 방식은 결론을 미룹니다» — 방식 이름 없이 문장 꼴로(LC 보정 4).
  const clauses = readings.map((r, index) => `${index === 0 ? "한 방식은" : index === 1 ? "다른 방식은" : "또 한 방식은"} ${VERDICT_CLAUSE[r.verdict][index === readings.length - 1 ? 1 : 0]}`);
  return COPY["H-1-SPLIT"](clauses.join(", "));
}

const FIVE_ORDER: FiveElement[] = ["wood", "fire", "earth", "metal", "water"];

/** ② 보탬이 되는 기운 요약(카드 ⓐ 머리 = 한눈에 ②). */
function yongsinHeadline(candidates: YongsinCandidate[]): string {
  const unique = (list: FiveElement[]) => FIVE_ORDER.filter((element) => list.includes(element));
  const eokbu = unique(candidates.filter((c) => c.method === "eokbu").map((c) => c.element));
  const johu = unique(candidates.filter((c) => c.method === "johu").map((c) => c.element));
  if (eokbu.length && johu.length) return COPY["H-2-BOTH"](elementsOf(eokbu), elementsOf(johu));
  if (eokbu.length) return COPY["H-2-EOKBU"](elementsOf(eokbu));
  if (johu.length) return COPY["H-2-JOHU"](elementsOf(johu));
  return COPY["H-2-NONE"];
}

/** ④ 앞 절반 — 강약 갈림 까닭(그 사주의 실제 글자를 넣는다). 카드 ⓐ «방식끼리 비교» 결론과 같은 문장. */
function strengthCompare(readings: StrengthReading[], factors: StrengthFactors): string {
  const split = strengthSplitOf(readings);
  if (split === "same") return COPY["H-4-S-SAME"];
  if (split === "clash") {
    const month = BRANCH_KO[factors.monthBranch] ?? factors.monthBranch;
    const partners = factors.monthBranchClashed.with.map((entry) => `${PILLAR_KO[entry.pillar]}의 ${partnerBranch(entry.id, factors.monthBranch)}`).join(" · ");
    const method = readings.filter((r) => r.verdict === "indeterminate").map((r) => STRENGTH_SET_PLAIN[r.ruleSetId]).join(" · ");
    return COPY["H-4-S-CLASH"](month, partners, method);
  }
  if (split === "ryeong") {
    const dm = factors.dayMaster;
    const dayList = factors.layers.hiddenStems.filter((entry) => entry.pillar === "day").map((entry) => STEM_KO[entry.stem]).join(" · ");
    return COPY["H-4-S-RYEONG"](BRANCH_KO[factors.monthBranch] ?? factors.monthBranch, stemNote(dm, factors.deukryeong.monthPrimary), dayList, factors.deukse.support, factors.deukse.other);
  }
  return COPY["H-4-S-OTHER"](readings.map((r) => `${STRENGTH_SET_PLAIN[r.ruleSetId]} ${VERDICT_VALUE[r.verdict]}`).join(" · "));
}

function energyCard(input: PaidReadingInput): ReadingCard {
  const { factors, strengthReadings: readings, yongsinCandidates: candidates } = input.structure;
  const noTime = input.timeKnown ? "" : ` ${COPY["E-NO-TIME"]}`;
  const lines: ReadingLine[] = readings.map((reading) => {
    const hits = eokbuOf(candidates, reading.ruleSetId);
    const conclusion = hits.length
      ? COPY["L-CHAIN"](VERDICT_VALUE[reading.verdict], elementsOf(hits.map((c) => c.element)))
      : COPY["L-CHAIN-NONE"](VERDICT_VALUE[reading.verdict]);
    const meaning = [
      ...STRENGTH_REASON[reading.firedConditions[0] as StrengthConditionId](reading.inputs),
      VERDICT_DIRECTION[hits.length ? reading.verdict : "indeterminate"](hits.map((c) => COPY["L-EOKBU-ITEM"](EOKBU_GROUP[c.ruleId as EokbuRuleId], ELEMENT_PLAIN[c.element])).join(", "))
    ];
    const basis = [
      ...strengthBasis(reading, factors, noTime),
      ...hits.map((c) => COPY["E-Y-EOKBU"](EOKBU_GROUP[c.ruleId as EokbuRuleId], ELEMENT_PLAIN[c.element], `${STRENGTH_SET_KO[reading.ruleSetId]} ${VERDICT_KO[reading.verdict]}`))
    ];
    return { label: STRENGTH_SET_LABEL[reading.ruleSetId], conclusion, meaning, basis };
  });

  const season = factors.climate.season;
  const johu = candidates.filter((c) => c.method === "johu");
  const eokbu = candidates.filter((c) => c.method === "eokbu");
  const eokbuElements = new Set(eokbu.map((c) => c.element));
  const seasonLine: ReadingLine = {
    label: COPY["L-SEASON-LABEL"],
    conclusion: johu.length ? COPY["L-SEASON"](elementsOf(johu.map((c) => c.element))) : COPY["L-SEASON-NONE"](SEASON_KO[season]),
    // 후보 없음(봄 · 가을)은 결론 «계절로 정하는 후보 없음(…)»으로 충분하다 — 뜻 줄은 접힌 basis로 옮긴다(길이).
    meaning: [
      ...(johu.length ? [JOHU_MEANING[season](johu[0]?.element)] : []),
      ...(johu.length && eokbu.length ? [johu.some((c) => !eokbuElements.has(c.element)) ? COPY["L-SEASON-DIFFER"] : COPY["L-SEASON-MEET"]] : [])
    ],
    basis: [...(johu.length ? [] : [JOHU_MEANING[season](undefined)]), COPY["T-JOHU"], COPY["E-Y-SEASON"](BRANCH_KO[factors.monthBranch] ?? factors.monthBranch, SEASON_KO[season]), ...(johu.length && eokbu.length ? [COPY["D-Y-ORDER"]] : [])]
  };

  const split = strengthSplitOf(readings);
  const directions = new Set(eokbu.map((c) => c.ruleId.split(".")[0]));
  const compare: ReadingLine = {
    label: COPY["L-COMPARE-LABEL"],
    conclusion: strengthCompare(readings, factors),
    meaning: directions.size > 1 ? [COPY["L-Y-SPLIT"]] : [],
    basis: split === "same" ? [] : [{ clash: COPY["D-S-CLASH"], ryeong: COPY["D-S-RYEONG"], other: COPY["D-S-OTHER"] }[split]]
  };

  const basis = [
    dayMasterLine(factors),
    COPY["T-DEUKRYEONG"], COPY["T-DEUKJI"], COPY["T-DEUKSE"], COPY["T-SUPPORT"], COPY["T-EOKBU"], COPY["T-GROUPS"], COPY["T-CYCLE"],
    ...(eokbu.some((c) => c.ruleId.startsWith("weak.")) ? [COPY["D-Y-WEAK"]] : []),
    ...(eokbu.some((c) => c.ruleId.startsWith("strong.")) ? [COPY["D-Y-STRONG"]] : [])
  ];
  return {
    title: COPY["C-ENERGY-TITLE"],
    question: COPY["Q-ENERGY"],
    badge: agreementLabel(split === "same"),
    headline: [strengthHeadline(readings), yongsinHeadline(candidates)],
    notes: [],
    lines: dedupeMeaning([...lines, seasonLine, { ...compare, quiet: split === "same" }]),
    basis
  };
}

function gyeokgukConclusion(reading: GyeokgukReading): string {
  if (reading.unavailable) return UNAVAILABLE_VALUE[reading.unavailable];
  return reading.candidates.map((c) => gyeokValue(c.gyeok)).join(" / ") + (reading.ambiguous ? ` ${COPY["G-BOTH"]}` : "");
}

function gyeokgukReason(reading: GyeokgukReading, facts: FrameFacts): string {
  const fired = reading.firedConditions[0] as GyeokgukConditionId;
  if (fired === "saryeong.unavailable") return UNAVAILABLE_REASON[reading.unavailable ?? "no-day-counts"];
  return GYEOKGUK_REASON[fired](facts);
}

export type FrameStatus = "same" | "judged-same" | "split" | "one" | "none";
export function frameStatusOf(readings: GyeokgukReading[]): FrameStatus {
  const judged = readings.filter((r) => !r.unavailable).length;
  if (judged === 0) return "none";
  if (judged === 1) return "one";
  if (!(readings[0]?.agreesAcrossSets ?? true)) return "split";
  return judged === readings.length ? "same" : "judged-same";
}

/** ③ 큰 틀 요약(카드 ⓑ 머리 = 한눈에 ③). */
function frameHeadline(readings: GyeokgukReading[]): string {
  const status = frameStatusOf(readings);
  if (status === "none") return COPY["H-3-NONE"];
  // 같은 격 집합끼리 묶어 «두 방식은 X로 읽고, 한 방식은 Y로 읽습니다»(LC 보정 4).
  const groups = new Map<string, { count: number; reading: GyeokgukReading }>();
  for (const reading of readings.filter((r) => !r.unavailable)) {
    const key = reading.candidates.map((c) => c.gyeok).join("|");
    const group = groups.get(key) ?? { count: 0, reading };
    group.count += 1;
    groups.set(key, group);
  }
  const read = (reading: GyeokgukReading, final: boolean): string => {
    const values = reading.candidates.map((c) => gyeokValue(c.gyeok));
    return values.length > 1 ? COPY["H-3-READ-BOTH"](values.join(" · "), final) : COPY["H-3-READ"](values[0] as string, final);
  };
  const first = [...groups.values()][0] as { count: number; reading: GyeokgukReading };
  if (status === "one") return COPY["H-3-ONE"](read(first.reading, false));
  if (status === "judged-same") return COPY["H-3-JUDGED-SAME"](read(first.reading, false));
  if (status === "same") return COPY["H-3-SAME"](read(first.reading, true));
  const list = [...groups.values()];
  return COPY["H-3-SPLIT"](list.map((group, index) => `${COPY["H-3-COUNT"](group.count)} ${read(group.reading, index === list.length - 1)}`).join(", "));
}

/** ④ 뒤 절반 — 격국 갈림 까닭(방식마다 잡은 천간 · 자리 · 드러난 기둥). 카드 ⓑ «방식끼리 비교» 결론과 같은 문장. */
function frameCompare(readings: GyeokgukReading[]): string {
  const status = frameStatusOf(readings);
  if (status !== "split") return { same: COPY["H-4-G-SAME"], "judged-same": COPY["H-4-G-JUDGED-SAME"], one: COPY["H-4-G-ONE"], none: COPY["H-4-G-NONE"] }[status];
  const groups = new Map<string, { methods: string[]; picks: GyeokgukReading["candidates"] }>();
  for (const reading of readings.filter((r) => !r.unavailable)) {
    const key = reading.candidates.map((c) => `${c.stem}.${c.role}`).join("|");
    const group = groups.get(key) ?? { methods: [], picks: reading.candidates };
    group.methods.push(GYEOKGUK_SET_PLAIN[reading.ruleSetId]);
    groups.set(key, group);
  }
  const picks = [...groups.values()].map((group) => {
    const chosen = group.picks.map((c) => {
      const where = c.exposedIn.length ? COPY["H-4-WHERE"](c.exposedIn.map((pillar) => PILLAR_KO[pillar]).join(" · ")) : COPY["H-4-NOT-EXPOSED"];
      return `${ROLE_KO[c.role] ?? c.role} 글자 ${STEM_KO[c.stem]}(${where})`;
    });
    const last = group.picks[group.picks.length - 1] as GyeokgukReading["candidates"][number];
    return COPY["H-4-G-PICK"](group.methods.join(" · "), chosen.join(" · "), STEM_KO[last.stem]);
  });
  return COPY["H-4-G-SPLIT"](picks.join(", "));
}

/** 격국 근거 조각이 고르는 사실 — 월지 정기가 일간 밖 윗글자로 나왔는가. */
export function frameFactsOf(factors: StrengthFactors): FrameFacts {
  const primary = factors.layers.hiddenStems.find((entry) => entry.pillar === "month" && entry.role === "primary");
  return { primaryExposed: !!primary && factors.layers.stems.some((stem) => stem.pillar !== "day" && stem.stem === primary.stem) };
}

function frameCard(input: PaidReadingInput): ReadingCard {
  const { factors, gyeokguk: readings } = input.structure;
  const dm = factors.dayMaster;
  const noTime = input.timeKnown ? "" : ` ${COPY["E-NO-TIME"]}`;
  const facts = frameFactsOf(factors);
  const lines: ReadingLine[] = readings.map((reading) => ({
    label: GYEOKGUK_SET_LABEL[reading.ruleSetId],
    conclusion: gyeokgukConclusion(reading),
    meaning: [gyeokgukReason(reading, facts), ...reading.candidates.map((c) => (TABLE_GYEOKS.has(c.gyeok) ? COPY["G-MEANING-TABLE"](c.gyeok) : COPY["G-MEANING"](c.gyeok)))],
    basis: [
      { "gyeokguk.exposed-first": COPY["T-EXPOSED"], "gyeokguk.primary-only": COPY["T-PRIMARY"], "gyeokguk.saryeong": COPY["T-SARYEONG"] }[reading.ruleSetId],
      ...(reading.candidates.length ? [COPY["E-G-PICK"](GYEOKGUK_SET_KO[reading.ruleSetId], reading.candidates.map((c) => `${stemNote(dm, c.stem)} ${ROLE_KO[c.role]} 글자 → ${GYEOK_KO[c.gyeok]}`).join(" / "))] : [])
    ]
  }));
  const status = frameStatusOf(readings);
  const compare: ReadingLine = {
    label: COPY["L-COMPARE-LABEL"],
    conclusion: frameCompare(readings),
    meaning: status === "same" || status === "split" ? [] : [COPY["L-G-REST"]],
    basis: status === "split" ? [COPY["D-G-WHY"]] : []
  };
  const monthHidden = factors.layers.hiddenStems.filter((entry) => entry.pillar === "month");
  const exposed = monthHidden
    .map((entry) => ({ entry, at: factors.layers.stems.filter((stem) => stem.stem === entry.stem).map((stem) => PILLAR_KO[stem.pillar]) }))
    .filter((item) => item.at.length > 0)
    .map((item) => `${stemNote(dm, item.entry.stem)} — ${item.at.join(" · ")}`);
  const saryeong = factors.saryeong;
  const basis = [
    dayMasterLine(factors),
    COPY["E-G-MONTH"](BRANCH_KO[factors.monthBranch] ?? factors.monthBranch, monthHidden.map((entry) => `${stemNote(dm, entry.stem)} ${ROLE_KO[entry.role]}`).join(" · ")),
    COPY["E-G-EXPOSED"](exposed.length ? exposed.join(" · ") : "없음") + noTime,
    saryeong
      ? COPY["E-G-SARYEONG"](TERM_KO[saryeong.term.code] ?? saryeong.term.code, (saryeong.elapsedMinutes / 1440).toFixed(1), saryeong.boundaries.join(" · "), ROLE_KO[saryeong.role] ?? saryeong.role, stemNote(dm, saryeong.stem))
      : COPY["E-G-NO-SARYEONG"],
    ...(saryeong?.nearThreshold ? [COPY["E-G-NEAR"]] : []),
    ...(saryeong && !input.timeKnown ? [COPY["E-G-NOON"]] : []),
    COPY["T-HIDDEN"],
    COPY["T-NAMES"]
  ];
  return {
    title: COPY["C-FRAME-TITLE"],
    question: COPY["Q-FRAME"],
    badge: gyeokgukAgreementLabel(status),
    headline: [frameHeadline(readings)],
    notes: [COPY["N-FRAME-INDEPENDENT"]],
    lines: dedupeMeaning([...lines, { ...compare, quiet: status === "same" || status === "judged-same" }]),
    basis
  };
}

/** 같은 카드 안에서 앞 줄에 이미 나온 뜻 문장은 다시 찍지 않는다(방식끼리 결과가 같을 때 같은 문장이 되풀이된다 — 길이). */
function dedupeMeaning(lines: ReadingLine[]): ReadingLine[] {
  const seen = new Set<string>();
  return lines.map((line) => {
    const meaning = line.meaning.filter((sentence) => !seen.has(sentence));
    for (const sentence of line.meaning) seen.add(sentence);
    return { ...line, meaning };
  });
}

/** 한눈에 = 카드 조각 재사용(LC 조건 2): ①② = 카드 ⓐ 머리, ③ = 카드 ⓑ 머리, ④ = 두 카드 배지에서 «무엇이 갈리는가»만. */
function glanceOf(energy: ReadingCard, frame: ReadingCard): PaidReading["glance"] {
  return { title: COPY["H-TITLE"], sentences: [energy.headline[0] as string, energy.headline[1] as string, frame.headline[0] as string, glanceSplitOf(energy, frame)] };
}

/** ④ — 무엇이 갈리는지만 짧게(까닭은 카드의 «방식끼리 비교» 줄 한 곳, LC 보정 0). 카드 배지(B-DIFF)와 같은 값에서 나온다. */
function glanceSplitOf(energy: ReadingCard, frame: ReadingCard): string {
  const strength = energy.badge === COPY["B-DIFF"];
  const gyeok = frame.badge === COPY["B-DIFF"];
  if (strength && gyeok) return COPY["H-4-BOTH"];
  if (strength) return COPY["H-4-S"];
  if (gyeok) return COPY["H-4-G"];
  return COPY["H-4-NONE"];
}

/** 카드의 «방식끼리 비교» 줄(항상 마지막). */
export function compareOf(card: ReadingCard): ReadingLine {
  return card.lines[card.lines.length - 1] as ReadingLine;
}

export function paidReadingOf(input: PaidReadingInput): PaidReading {
  const energy = energyCard(input);
  const frame = frameCard(input);
  return {
    note: input.timeKnown ? PAID_BLOCKS_NOTE : `${PAID_BLOCKS_NOTE} ${PAID_BLOCKS_TIME_UNKNOWN_NOTE}`,
    glance: glanceOf(energy, frame),
    energy,
    frame
  };
}

export function paidReadingOfReport(paidReport: Pick<PaidReportV1, "structure" | "meta">): PaidReading {
  return paidReadingOf({ structure: paidReport.structure, timeKnown: paidReport.meta.timeKnown });
}

/** 펼친 문장 전부(안내 · 한눈에 · 카드 물음 · 배지 · 머리 · 줄의 이름·결론·뜻). */
export function expandedTextsOf(reading: PaidReading): string[] {
  return [
    reading.note,
    ...reading.glance.sentences,
    ...[reading.energy, reading.frame].flatMap((card) => [card.question, card.badge, ...card.notes, ...card.lines.filter((line) => !line.quiet).flatMap((line) => [line.label, line.conclusion, ...line.meaning])])
  ];
}

/** 접힌 문장 전부(«왜 이렇게 봤나»). */
export function foldedTextsOf(reading: PaidReading): string[] {
  return [reading.energy, reading.frame].flatMap((card) => [...card.lines.flatMap((line) => line.basis), ...card.basis]);
}

export function agreementLabel(agrees: boolean): string {
  return agrees ? COPY["B-SAME"] : COPY["B-DIFF"];
}

/** 격국 배지 — 코어 agreesAcrossSets는 결론 내지 않은 방식을 빼고 비교한다(gyeokguk.ts, LC #146 차단 2). */
export function gyeokgukAgreementLabel(status: FrameStatus): string {
  return { same: COPY["B-SAME"], "judged-same": COPY["B-JUDGED-SAME"], split: COPY["B-DIFF"], one: COPY["B-JUDGED-ONE"], none: COPY["B-JUDGED-NONE"] }[status];
}
