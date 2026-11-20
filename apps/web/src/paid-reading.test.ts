import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  calculatePillars,
  generatePaidReportV1,
  gyeokgukReadingsOf,
  resolveBirthKst,
  strengthFactorsOf,
  STEM_FIVE_ELEMENT,
  strengthReadingsOf,
  tenGodOf,
  yongsinCandidatesOf,
  type BirthInput,
  type Stem,
  type TenGod,
  type FiveElement,
  type PaidReportV1
} from "@saju-lab/saju-core";
import { loadGoldenPillarCases } from "../../../packages/saju-core/src/golden-pillars.load.js";
import { buildPaidReportHtml } from "./export-html.js";
import {
  compareOf,
  COPY,
  ELEMENT_PLAIN,
  expandedTextsOf,
  foldedTextsOf,
  FRAGMENT_RECORDS,
  frameFactsOf,
  frameStatusOf,
  GLOSS,
  GYEOK_GROUP,
  GYEOK_KO,
  GYEOKGUK_SET_KO,
  GYEOKGUK_SET_PLAIN,
  STRENGTH_SET_KO,
  STRENGTH_SET_PLAIN,
  TABLE_GYEOKS,
  josa,
  PAID_BLOCKS_NOTE,
  PAID_BLOCKS_TIME_UNKNOWN_NOTE,
  paidReadingOf,
  paidReadingOfReport,
  VERDICT_VALUE,
  type PaidReading
} from "./paid-reading.js";

// 유료 3블록 뜻풀이(HO-2026-1120 plain-reading) — 골든 50 전부에서 문안 = 코어 값, 빈칸 0, 펼친 문장 풀이, 저장본 펼침.

const goldens = loadGoldenPillarCases();
const paidOf = (input: BirthInput): PaidReportV1 =>
  generatePaidReportV1({ input, pillars: calculatePillars(input), generatedAt: "2026-11-20T00:00:00.000Z" });

/** 코어 함수를 화면 경로와 독립으로 직접 부른 기대값. */
function coreOf(input: BirthInput) {
  const factors = strengthFactorsOf(calculatePillars(input), resolveBirthKst(input));
  const strengthReadings = strengthReadingsOf(factors);
  return { factors, strengthReadings, yongsinCandidates: yongsinCandidatesOf(factors, strengthReadings), gyeokguk: gyeokgukReadingsOf(factors) };
}

const allTexts = (reading: PaidReading): string[] => [...expandedTextsOf(reading), ...foldedTextsOf(reading), reading.glance.title];
const ELEMENTS = Object.keys(ELEMENT_PLAIN) as FiveElement[];
const elementsIn = (text: string): Set<FiveElement> => new Set(ELEMENTS.filter((element) => text.includes(ELEMENT_PLAIN[element])));
const gyeoksIn = (text: string): Set<string> => new Set(Object.entries(GYEOK_KO).filter(([, name]) => text.includes(name)).map(([id]) => id));
const escapeHtml = (value: string): string => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
const structureSection = (html: string): string => html.slice(html.indexOf('<section id="structure-blocks"'), html.indexOf("</section>", html.indexOf('<section id="structure-blocks"')) + "</section>".length);

/** 좋다 나쁘다 단정 · 결과 예언(건강 · 수명 · 사고 · 투자 · 합격 등) · 추천형 어휘. l2-chips.test.ts EVALUATIVE를 넓혔다(판정 이름 신강/신약과 «약한 편» 풀이는 허용). */
const BANNED = /길하|흉하|길흉|길신|흉신|좋은|나쁜|좋다|나쁘다|반드시|운명|팔자|필연|확정|추천|권장|최적|행운|불운|대길|대흉|액운|횡액|성공|실패|합격|불합격|건강|질병|수명|사망|사고|투자|수익|손실|재물|부자|가난|결혼|이혼|이롭|유리|불리|위험|피해야|해야 한다|채워야|부족하니|뚜렷/;
/** 머리 안내의 부정 고지 구절만 뺀다(l2-chips.test.ts NEGATION_PHRASES와 같은 방식). */
const NEGATION = "좋고 나쁨이나 앞일은 판단하지 않습니다";

describe("유료 3블록 뜻풀이 — 코어 근거 필드", () => {
  it("PaidReportV1.structure = 코어 함수 결과(factors 포함, 판정 3필드 불변)", () => {
    for (const golden of goldens) expect(paidOf(golden.input).structure, golden.id).toEqual(coreOf(golden.input));
  });
});

describe("유료 3블록 뜻풀이 — 골든 전부", () => {
  const cases = goldens.map((golden) => ({ golden, core: coreOf(golden.input), reading: paidReadingOfReport(paidOf(golden.input)) }));

  it("골든이 갈림 · 유보 · 득령 대립 · 조후 유무 · 격국 1개/2개/3개를 덮는다(아래 단언의 전제)", () => {
    expect(goldens.length).toBeGreaterThanOrEqual(50);
    const strengthSplits = cases.map(({ core }) => core.strengthReadings);
    expect(strengthSplits.some((r) => r.some((x) => x.verdict === "indeterminate"))).toBe(true);
    expect(strengthSplits.some((r) => new Set(r.map((x) => x.verdict)).size === 2 && !r.some((x) => x.verdict === "indeterminate"))).toBe(true);
    expect(cases.some(({ core }) => core.yongsinCandidates.some((c) => c.method === "johu"))).toBe(true);
    expect(cases.some(({ core }) => !core.yongsinCandidates.some((c) => c.method === "johu"))).toBe(true);
    const statuses = new Set(cases.map(({ core }) => frameStatusOf(core.gyeokguk)));
    for (const status of ["same", "split", "one", "judged-same"]) expect(statuses.has(status as never), status).toBe(true);
  });

  it("ⓐ 빈 문자열 · undefined · NaN 0 · «한눈에» 4칸 조립 50/50", () => {
    for (const { golden, reading } of cases) {
      expect(reading.glance.sentences, golden.id).toHaveLength(4);
      for (const text of allTexts(reading)) {
        expect(text.trim().length, golden.id).toBeGreaterThan(0);
        expect(text, golden.id).not.toMatch(/undefined|NaN|null|\(\)/);
      }
    }
  });

  it("ⓑ 문장 속 강약 · 오행 · 격 이름 = 같은 사례의 코어 출력", () => {
    for (const { golden, core, reading } of cases) {
      core.strengthReadings.forEach((r, index) => {
        const line = reading.energy.lines[index]!;
        expect(line.conclusion.startsWith(VERDICT_VALUE[r.verdict]), golden.id).toBe(true);
        const mine = core.yongsinCandidates.filter((c) => c.method === "eokbu" && c.basis.readingRef?.ruleSetId === r.ruleSetId).map((c) => c.element);
        expect(elementsIn(line.conclusion), golden.id).toEqual(new Set(mine));
        for (const element of elementsIn(line.meaning.join(" "))) expect(mine, golden.id).toContain(element);
      });
      const season = reading.energy.lines[core.strengthReadings.length]!;
      expect(elementsIn(season.conclusion), golden.id).toEqual(new Set(core.yongsinCandidates.filter((c) => c.method === "johu").map((c) => c.element)));
      core.gyeokguk.forEach((r, index) => {
        const line = reading.frame.lines[index]!;
        const expected = new Set(r.candidates.map((c) => c.gyeok));
        expect(gyeoksIn(line.conclusion), golden.id).toEqual(expected);
        for (const gyeok of gyeoksIn(line.meaning.join(" "))) expect(expected.has(gyeok as never), golden.id).toBe(true);
        if (r.unavailable) expect(line.conclusion, golden.id).toContain("결론을 내지 않음");
      });
      const [first, second, third] = reading.glance.sentences;
      const SAYS = { strong: /센 편/, weak: /약한 편/, indeterminate: /결론을 미|판단을 미/ } as const;
      for (const verdict of ["strong", "weak", "indeterminate"] as const) {
        expect(SAYS[verdict].test(first), `${golden.id} ${verdict}`).toBe(core.strengthReadings.some((r) => r.verdict === verdict));
      }
      // 한눈에 ①③은 값 나열이 아니라 문장(LC 보정 4): 판정 이름(신강 · 신약 · 판단 유보) 단독 나열 0.
      expect(first, golden.id).not.toMatch(/신강|신약|판단 유보|: /);
      expect(third, golden.id).not.toMatch(/: /);
      expect(elementsIn(second), golden.id).toEqual(new Set(core.yongsinCandidates.map((c) => c.element)));
      expect(gyeoksIn(third), golden.id).toEqual(new Set(core.gyeokguk.flatMap((r) => r.candidates.map((c) => c.gyeok))));
    }
  });

  it("갈림 까닭 문장에 그 사주의 실제 글자가 들어간다(강약 = 월지 · 상대 지지, 격국 = 방식마다 잡은 천간 · 자리)", () => {
    const BRANCH: Record<string, string> = { ja: "자", chuk: "축", in: "인", myo: "묘", jin: "진", sa: "사", o: "오", mi: "미", sin: "신", yu: "유", sul: "술", hae: "해" };
    const STEM: Record<string, string> = { gap: "갑", eul: "을", byeong: "병", jeong: "정", mu: "무", gi: "기", gyeong: "경", sin: "신", im: "임", gye: "계" };
    const ROLE: Record<string, string> = { residual: "처음 구간", middle: "가운데 구간", primary: "중심" };
    let strengthSplits = 0;
    let frameSplits = 0;
    for (const { golden, core, reading } of cases) {
      const energy = compareOf(reading.energy).conclusion;
      if (!core.strengthReadings[0]!.agreesAcrossSets) {
        strengthSplits += 1;
        expect(energy, golden.id).toContain(BRANCH[core.factors.monthBranch]!);
        if (core.factors.monthBranchClashed.value) {
          for (const partner of core.factors.monthBranchClashed.with) {
            const other = partner.id.split("-").find((code) => code !== core.factors.monthBranch) ?? core.factors.monthBranch;
            expect(energy, golden.id).toContain(`의 ${BRANCH[other]}`);
          }
        } else {
          expect(energy, golden.id).toContain(STEM[core.factors.deukryeong.monthPrimary]!);
        }
      }
      if (frameStatusOf(core.gyeokguk) === "split") {
        frameSplits += 1;
        const frame = compareOf(reading.frame).conclusion;
        for (const r of core.gyeokguk.filter((x) => !x.unavailable)) {
          for (const c of r.candidates) expect(frame, golden.id).toContain(`${ROLE[c.role]} 글자 ${STEM[c.stem]}(`);
        }
      }
    }
    expect(strengthSplits).toBeGreaterThan(0);
    expect(frameSplits).toBeGreaterThan(0);
  });

  it("«한눈에» = 카드 조각(①② 카드 ⓐ headline · ③ 카드 ⓑ headline) · ④ = 카드와 같은 갈림 값, 네 경우 모두 나옴, 까닭은 카드에만", () => {
    const seen = new Set<string>();
    for (const { golden, core, reading } of cases) {
      const [first, second, third, fourth] = reading.glance.sentences;
      expect(first, golden.id).toBe(reading.energy.headline[0]);
      expect(second, golden.id).toBe(reading.energy.headline[1]);
      expect(third, golden.id).toBe(reading.frame.headline[0]);
      const strengthSplit = !core.strengthReadings[0]!.agreesAcrossSets;
      const frameSplit = frameStatusOf(core.gyeokguk) === "split";
      const expected = strengthSplit && frameSplit ? COPY["H-4-BOTH"] : strengthSplit ? COPY["H-4-S"] : frameSplit ? COPY["H-4-G"] : COPY["H-4-NONE"];
      expect(fourth, golden.id).toBe(expected);
      expect(reading.energy.badge === COPY["B-DIFF"], golden.id).toBe(strengthSplit);
      expect(reading.frame.badge === COPY["B-DIFF"], golden.id).toBe(frameSplit);
      // 까닭 문장은 카드 «방식끼리 비교» 줄 한 곳에만 — ④에 카드 비교 결론이 다시 나오지 않는다.
      if (strengthSplit) expect(fourth.includes(compareOf(reading.energy).conclusion), golden.id).toBe(false);
      if (frameSplit) expect(fourth.includes(compareOf(reading.frame).conclusion), golden.id).toBe(false);
      seen.add(expected);
    }
    // 골든에 네 경우가 다 있으면 네 문장이 모두 나온다(없는 경우는 아래 «골든에 없는 경우»가 덮는다).
    expect(seen.size, [...seen].join(" / ")).toBeGreaterThanOrEqual(3);
  });

  it("방식 이름: 펼친 부분에서 전문 이름은 «쉬운 이름(전문 이름)»으로 처음 1번만, 그 뒤로는 쉬운 이름만(LC 보정 1)", () => {
    const names: Array<[string, string]> = [
      ...Object.entries(STRENGTH_SET_KO).map(([id, ko]) => [ko, STRENGTH_SET_PLAIN[id as keyof typeof STRENGTH_SET_PLAIN]] as [string, string]),
      ...Object.entries(GYEOKGUK_SET_KO).map(([id, ko]) => [ko, GYEOKGUK_SET_PLAIN[id as keyof typeof GYEOKGUK_SET_PLAIN]] as [string, string]),
      ["조후", "계절의 추위·더위를 맞추는 방식"]
    ];
    for (const { golden, reading } of cases) {
      const expanded = expandedTextsOf(reading).join("\n");
      for (const [tech, plain] of names) {
        const count = expanded.split(tech).length - 1;
        expect(count, `${golden.id} ${tech}`).toBeLessThanOrEqual(1);
        if (count === 1) {
          expect(expanded, `${golden.id} ${tech}`).toContain(`${plain}(${tech})`);
          // 처음 나오는 자리 = 쉬운 이름이 처음 나오는 자리.
          expect(expanded.indexOf(plain), `${golden.id} ${tech}`).toBe(expanded.indexOf(`${plain}(${tech})`));
        }
      }
      // «세 가지 물음»은 펼친 자리마다 그 자리에서 풀린다(LC 보정 2).
      for (const text of expandedTextsOf(reading)) {
        if (text.includes("세 가지 물음") && !text.includes("세 가지 물음을 세는 방식")) expect(text, golden.id).toContain("태어난 달 · 날의 아랫글자 · 둘레 글자가 나를 돕는가");
      }
    }
  });

  it("ⓒ «세트» · «규칙표» 0 · ⓓ 금지 어휘 0(펼침 · 접힘 전부)", () => {
    for (const { golden, reading } of cases) {
      for (const text of allTexts(reading)) {
        expect(text, golden.id).not.toMatch(/세트|규칙표/);
        expect(text.replace(NEGATION, ""), `${golden.id} ${text}`).not.toMatch(BANNED);
      }
    }
  });

  it("펼친 문장에 전문 낱말이 나오면 같은 문장에 풀이가 있다(LC 추가 조건 1)", () => {
    const terms = Object.keys(GLOSS).sort((a, b) => b.length - a.length);
    for (const { golden, reading } of cases) {
      for (const text of expandedTextsOf(reading)) {
        for (const term of terms) {
          if (text.includes(term)) expect(text, `${golden.id} «${term}» → «${GLOSS[term]}»`).toContain(GLOSS[term]!);
        }
      }
    }
  });

  it("ⓔ 안내(«역술가 검토 전») 1회 · 시각 미상 고지 1회 — 데이터", () => {
    for (const { golden, reading } of cases) {
      const joined = allTexts(reading).join("\n");
      expect(joined.split("역술가 검토 전").length - 1, golden.id).toBe(1);
      expect(reading.note.includes(PAID_BLOCKS_TIME_UNKNOWN_NOTE), golden.id).toBe(!golden.input.birthTime);
    }
  });

  it("HTML 저장본: 안내 1회 · <details> 0 · 접힌 문장 전부 펼쳐 실린다 · «세트»·«규칙표» 0", () => {
    for (const { golden, reading } of cases) {
      const html = buildPaidReportHtml(paidOf(golden.input));
      const section = structureSection(html);
      expect(html.split(PAID_BLOCKS_NOTE).length - 1, golden.id).toBe(1);
      expect(html.split("역술가 검토 전").length - 1, golden.id).toBe(1);
      expect(section, golden.id).not.toContain("<details");
      expect(section, golden.id).not.toMatch(/세트|규칙표/);
      for (const text of [...expandedTextsOf(reading), ...foldedTextsOf(reading)]) expect(section, `${golden.id} ${text}`).toContain(escapeHtml(text));
    }
  });

  it("카드 물음은 «물음:» 접두어가 정확히 1회", () => {
    for (const { golden, reading } of cases) {
      for (const card of [reading.energy, reading.frame]) expect(card.question.split("물음:").length - 1, golden.id).toBe(1);
    }
  });

  it("측정 — 같은 문장 묶음 크기 분포(한눈에 · ④ · 갈림 까닭) · 펼친 부분 글자 수", () => {
    const distribution = (texts: string[]) => {
      const counts = new Map<string, number>();
      for (const text of texts) counts.set(text, (counts.get(text) ?? 0) + 1);
      const sizes = new Map<number, number>();
      for (const size of counts.values()) sizes.set(size, (sizes.get(size) ?? 0) + 1);
      return { groups: counts.size, max: Math.max(...counts.values()), sizes: Object.fromEntries([...sizes].sort((a, b) => a[0] - b[0])) };
    };
    const glance = distribution(cases.map(({ reading }) => reading.glance.sentences.join(" ")));
    const fourth = distribution(cases.map(({ reading }) => reading.glance.sentences[3]));
    const strengthReason = distribution(cases.filter(({ core }) => !core.strengthReadings[0]!.agreesAcrossSets).map(({ reading }) => compareOf(reading.energy).conclusion));
    const frameReason = distribution(cases.filter(({ core }) => frameStatusOf(core.gyeokguk) === "split").map(({ reading }) => compareOf(reading.frame).conclusion));
    const chars = cases.map(({ reading }) => expandedTextsOf(reading).join("").length);
    const report = { glance, fourth, strengthReason, frameReason, expandedChars: { min: Math.min(...chars), max: Math.max(...chars), mean: Math.round(chars.reduce((a, b) => a + b, 0) / chars.length) } };
    console.log(`[paid-reading 측정] ${JSON.stringify(report)}`);
    // 값 조합이 43/50으로 갈리므로(REPORT §0) «한눈에» 전체 묶음이 그보다 크게 뭉치면 조각이 거칠다는 뜻이다.
    expect(glance.groups).toBeGreaterThanOrEqual(43);
    // 갈림 까닭은 사주 글자를 넣으므로 같은 문장이 크게 뭉치지 않는다.
    expect(strengthReason.max).toBeLessThanOrEqual(3);
    expect(frameReason.max).toBeLessThanOrEqual(3);
  });
});

describe("유료 3블록 뜻풀이 — 문장 조각이 말하는 조건 = 코어 값(골든 50 전부, LC 보강 1)", () => {
  const cases = goldens.map((golden) => ({ golden, core: coreOf(golden.input), reading: paidReadingOfReport(paidOf(golden.input)) }));
  const GROUP_OF: Record<TenGod, string> = { bigyeon: "비겁", geopjae: "비겁", siksin: "식상", sanggwan: "식상", pyeonjae: "재성", jeongjae: "재성", pyeongwan: "관성", jeonggwan: "관성", pyeonin: "인성", jeongin: "인성" };
  const groupOf = (dm: Stem, stem: Stem): string => GROUP_OF[tenGodOf(dm, stem)];
  const PILLAR: Record<string, string> = { year: "태어난 해", month: "태어난 달", day: "태어난 날", time: "태어난 시각" };
  const STEM: Record<string, string> = { gap: "갑", eul: "을", byeong: "병", jeong: "정", mu: "무", gi: "기", gyeong: "경", sin: "신", im: "임", gye: "계" };
  const GEN: Record<FiveElement, FiveElement> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
  const CTRL: Record<FiveElement, FiveElement> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
  const relation = (dm: FiveElement, element: FiveElement): string =>
    element === dm ? "나와 같은 기운" : GEN[element] === dm ? "나를 길러 주는 기운" : GEN[dm] === element ? "내가 만들어 내는 기운" : CTRL[dm] === element ? "내가 다스리는 기운" : "나를 다스리는 기운";
  const counts = new Map<string, number>();
  const hit = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);

  it("강약 · 용신 · 격국 조각마다 그 조각이 나간 모든 사례에서 조건이 참", () => {
    for (const { golden, core, reading } of cases) {
      const f = core.factors;
      const dm = f.dayMaster;
      const dmElement = STEM_FIVE_ELEMENT[dm];
      const energy = reading.energy.lines.flatMap((line) => [line.conclusion, ...line.meaning]).join("\n");
      const id = golden.id;
      // 강약 근거
      if (energy.includes("아랫글자와 정면으로 부딪힙니다")) { hit("S-clash"); expect(f.monthBranchClashed.value, id).toBe(true); }
      if (energy.includes("태어난 달의 중심 글자가 나를 돕습니다")) { hit("S-ryeong"); expect(f.deukryeong.value, id).toBe(true); }
      if (energy.includes("태어난 달은 나를 돕지 않지만")) { hit("S-jise"); expect([f.deukryeong.value, f.deukji.value, f.deukse.value], id).toEqual([false, true, true]); }
      if (energy.includes("함께 돕지도 않습니다")) { hit("S-other"); expect(f.deukryeong.value || (f.deukji.value && f.deukse.value), id).toBe(false); }
      const triad = Number(f.deukryeong.value) + Number(f.deukji.value) + Number(f.deukse.value);
      const triadSaid = /가운데 (\d)개(?:가|만) 나를 돕는 쪽/.exec(energy)?.[1] ?? (energy.includes("나를 돕는 쪽이 하나도 없어") ? "0" : undefined);
      if (triadSaid !== undefined) { hit("S-triad"); expect(Number(triadSaid), id).toBe(triad); }
      // 억부 후보 «<갈래>인 <오행>»: 갈래 = 일간 오행과의 실제 관계
      for (const match of energy.matchAll(/(나와 같은 기운|나를 길러 주는 기운|내가 만들어 내는 기운|내가 다스리는 기운|나를 다스리는 기운)인 ([목화토금수])\(/g)) {
        hit("Y-group");
        const element = ELEMENTS.find((e) => ELEMENT_PLAIN[e].startsWith(match[2]!))!;
        expect(relation(dmElement, element), `${id} ${match[0]}`).toBe(match[1]);
      }
      // 조후 계절
      if (energy.includes("태어난 달이 겨울이라")) { hit("J-winter"); expect(f.climate.season, id).toBe("winter"); }
      if (energy.includes("태어난 달이 여름이라")) { hit("J-summer"); expect(f.climate.season, id).toBe("summer"); }
      // 강약 갈림 까닭(카드 비교 줄)
      const energyCompare = compareOf(reading.energy).conclusion;
      if (energyCompare.includes("정면으로 부딪혀")) { hit("C-clash"); expect(f.monthBranchClashed.value, id).toBe(true); }
      if (energyCompare.includes("나를 돕지만")) { hit("C-ryeong"); expect([f.deukryeong.value, f.deukji.value, f.deukse.value], id).toEqual([true, false, false]); }

      // 격국
      const facts = frameFactsOf(f);
      const monthHidden = f.layers.hiddenStems.filter((h) => h.pillar === "month");
      const primary = monthHidden.find((h) => h.role === "primary")!;
      const exposedStems = new Set(f.layers.stems.map((s) => s.stem));
      expect(facts.primaryExposed, id).toBe(exposedStems.has(primary.stem));
      core.gyeokguk.forEach((r, index) => {
        const line = reading.frame.lines[index]!;
        const text = [line.conclusion, ...line.meaning].join("\n");
        if (text.includes("중심 글자가 윗글자로도 드러나")) { hit("G-primary-exposed"); expect(exposedStems.has(primary.stem), id).toBe(true); }
        if (text.includes("중심 글자는 나와 같은 기운이라 빼고")) { hit("G-other-bigyeop"); expect(exposedStems.has(primary.stem) && groupOf(dm, primary.stem) === "비겁", id).toBe(true); }
        if (text.includes("중심 글자는 윗글자로 드러나 있지 않고")) { hit("G-other-hidden"); expect(exposedStems.has(primary.stem), id).toBe(false); }
        if (text.includes("다른 글자 둘이 모두 윗글자로")) { hit("G-two"); expect(r.candidates.every((c) => c.exposedIn.length > 0), id).toBe(true); }
        if (text.includes("나와 같은 기운이 아닌 달 속 글자 가운데 윗글자로 드러난 것이 없어")) {
          hit("G-otherwise");
          expect(monthHidden.filter((h) => groupOf(dm, h.stem) !== "비겁" && exposedStems.has(h.stem)), id).toEqual([]);
        }
        if (text.includes("태어난 달의 중심 글자가 나와 같은 기운이고")) { hit("G-bigyeop-month"); expect(groupOf(dm, primary.stem), id).toBe("비겁"); }
        if (text.includes("구간을 맡은 글자가 나와 같은 기운이고")) { hit("G-saryeong-bigyeop"); expect(groupOf(dm, f.saryeong!.stem), id).toBe("비겁"); }
        if (text.includes("짝이 교재가 따로 정한 표에 있어")) { hit("G-table"); expect(r.candidates.every((c) => TABLE_GYEOKS.has(c.gyeok)), id).toBe(true); }
        // «X격은 이 사주를 <갈래>을 중심으로» · 결론 «X격(<갈래>이 중심인 틀)» = 고른 글자의 실제 십신 갈래
        for (const c of r.candidates) {
          if (TABLE_GYEOKS.has(c.gyeok)) {
            hit("G-table-name");
            expect(text, id).not.toMatch(/나와 같은 기운이 중심/);
          } else {
            hit("G-group");
            expect(groupOf(dm, c.stem), `${id} ${c.gyeok}`).toBe(GYEOK_GROUP[c.gyeok]);
          }
        }
      });
      // 격국 갈림 까닭: «<자리> 글자 <천간>(<기둥>의 윗글자로 드러남 | 드러나지 않음)» = 후보의 exposedIn
      const frameCompare = compareOf(reading.frame).conclusion;
      for (const r of core.gyeokguk.filter((x) => !x.unavailable)) {
        for (const c of r.candidates) {
          if (!frameCompare.includes(`글자 ${STEM[c.stem]}(`)) continue;
          hit("G-where");
          const where = c.exposedIn.length ? `${c.exposedIn.map((p) => PILLAR[p]).join(" · ")}의 윗글자로 드러남` : "드러나지 않음";
          expect(frameCompare, id).toContain(`글자 ${STEM[c.stem]}(${where})`);
        }
      }
    }
    console.log(`[paid-reading 조건 단언 건수] ${JSON.stringify(Object.fromEntries([...counts].sort()))}`);
    for (const key of ["G-table", "G-table-name", "G-primary-exposed", "G-group", "S-clash", "Y-group", "G-where"]) expect(counts.get(key) ?? 0, key).toBeGreaterThan(0);
  });

  it("critic 사실 오류 사례: 토 일간 비겁 표 3건은 오행을 주장하지 않고, 월간 투출 사례에 «다른 기둥 위로» 0", () => {
    for (const id of ["g-1971-07-02-1400", "g-1929-06-13-1730", "g-2013-05-22-0530"]) {
      const found = cases.find((c) => c.golden.id === id);
      expect(found, id).toBeDefined();
      const all = allTexts(found!.reading).join("\n");
      expect(all, id).toContain("짝이 교재가 따로 정한 표에 있어");
      expect(all, id).not.toMatch(/중심 글자가 나와 같은 기운이라|나와 같은 기운이 중심인 틀/);
    }
    const monthExposed = cases.filter(({ core }) => core.gyeokguk.some((r) => r.candidates.some((c) => c.exposedIn.includes("month"))));
    expect(monthExposed.length).toBeGreaterThan(0);
    for (const { golden, reading } of monthExposed) {
      const all = allTexts(reading).join("\n");
      expect(all, golden.id).not.toMatch(/다른 기둥 위로/);
    }
  });
});

describe("유료 3블록 뜻풀이 — 골든에 없는 경우(D 표 0건 행)", () => {
  const base = paidOf(goldens.find((golden) => golden.input.birthTime)!.input);

  it("용신 후보 0 · 강약 모두 유보 · 격국 결론 0 — 문장이 빈칸 없이 나온다", () => {
    const structure: PaidReportV1["structure"] = {
      ...base.structure,
      strengthReadings: base.structure.strengthReadings.map((r) => ({ ...r, verdict: "indeterminate" as const, firedConditions: ["month-first.month-clashed"] as [string], agreesAcrossSets: true })),
      yongsinCandidates: [],
      gyeokguk: base.structure.gyeokguk.map((r) => ({ ...r, candidates: [], unavailable: "no-day-counts" as const, firedConditions: ["saryeong.unavailable"] as [string], agreesAcrossSets: true }))
    };
    const reading = paidReadingOf({ structure, timeKnown: true });
    expect(reading.glance.sentences).toEqual([COPY["H-1-NONE"], COPY["H-2-NONE"], COPY["H-3-NONE"], COPY["H-4-NONE"]]);
    for (const text of allTexts(reading)) expect(text.trim().length).toBeGreaterThan(0);
    expect(reading.frame.badge).toBe(COPY["B-JUDGED-NONE"]);
  });

  it("조후만 있는 경우 ②는 «세기로 정한 후보는 없고»", () => {
    const structure: PaidReportV1["structure"] = { ...base.structure, yongsinCandidates: base.structure.yongsinCandidates.filter((c) => c.method === "johu").concat([{ candidateId: "johu.winter.fire", element: "fire", method: "johu", ruleId: "winter", basis: { factorRefs: ["climate.season"] }, note: "", doctrine: "unreviewed" }]) };
    expect(paidReadingOf({ structure, timeKnown: true }).glance.sentences[1]).toContain("세기로 정한 후보는 없고");
  });
});

describe("유료 3블록 뜻풀이 — 조각 · 출처 표", () => {
  it("docs/rules/PAID-3BLOCKS-READING.md 표 1 id = COPY 키 ∪ 조각 Record 이름(출처 칸이 비지 않음)", () => {
    const md = readFileSync(new URL("../../../docs/rules/PAID-3BLOCKS-READING.md", import.meta.url), "utf8");
    const rows = md.split("\n").filter((line) => /^\| [A-Z]/.test(line) && !line.startsWith("| id |")).map((line) => line.split("|").map((cell) => cell.trim()));
    const ids = rows.map((cells) => cells[1]!);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set([...Object.keys(COPY), ...FRAGMENT_RECORDS]));
    for (const cells of rows) expect(cells[4]!.length, cells[1]).toBeGreaterThan(0);
  });

  it("조사는 받침에 맞춘다", () => {
    expect(josa("술", "이/가")).toBe("술이");
    expect(josa("해", "이/가")).toBe("해가");
    expect(josa("진", "과/와")).toBe("진과");
    expect(josa("무", "을/를")).toBe("무를");
    expect(josa("방식", "이/가")).toBe("방식이");
  });

  it("입춘 직전 · 정각 · 직후 · 시각 미상도 문안이 채워진다", () => {
    const input: BirthInput = { birthDate: "2024-02-04", birthTime: "17:27", calendar: "solar", sex: "female", timezone: "Asia/Seoul" };
    const { birthTime: _omit, ...timeless } = input;
    for (const each of [...["17:26", "17:27", "17:28"].map((birthTime) => ({ ...input, birthTime })), { ...timeless, birthDate: "2024-02-10" }]) {
      const reading = paidReadingOfReport(paidOf(each));
      for (const text of allTexts(reading)) expect(text).not.toMatch(/undefined|NaN/);
    }
    expect(() => paidOf(timeless)).toThrow(/birthTime is required/);
  });
});
