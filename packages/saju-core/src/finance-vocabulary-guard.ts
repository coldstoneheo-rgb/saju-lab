/**
 * 한국어 투자권유 어휘 가드 (재무 섹션).
 *
 * 재무 카피(무료 `report.finance` · 유료 `financeDeepDive` · 웹 재무 문장)가 매수/매도 지시, 종목 지목,
 * 수익·원금 보장, 타이밍 권유, 레버리지 권유, 횡재 서사를 담지 않도록 **테스트 시점에** 검사한다.
 * 정본: LC MEETING-2026-0923-saju-away.md A1 — 「재무 탭은 한국어 매수/추천 어휘를 코드로 막는 가드가 없는 유일한 표면」.
 * CLAUDE.md 도메인 불변 규칙(재무 확정 표현 금지)과 같은 층이며 `aiInterpretationGuard.forbiddenOutputClaims`의
 * "investment recommendation"을 한국어 패턴으로 구체화한 것이다.
 *
 * 런타임 배선은 없다 — 카피는 전부 정적 문자열이므로 테스트 린트가 곧 가드다. 화면·DOM 변경 0.
 * 규칙은 «권유 형태»에만 걸리게 좁혔다: 「투자 판단을 대신하지 않으며」 같은 면책 문장은 통과해야 한다.
 */

export interface FinanceSolicitationRule {
  id: string;
  /** 검사용 패턴. 전역 플래그 없이 두고 `findFinanceSolicitation`이 복제한다. */
  pattern: RegExp;
  /** 이 규칙이 잡아야 하는 문장 — 테스트가 자기검증에 쓴다. */
  example: string;
}

export const FINANCE_SOLICITATION_RULES: readonly FinanceSolicitationRule[] = [
  {
    id: "trade-order",
    pattern: /매수|매도|사세요|파세요|사두세요|사 ?두세요|팔아 ?두세요|사야 ?(합니다|해요|한다)|팔아야 ?(합니다|해요|한다)|매입하세요|매입을 (권|추천)/,
    example: "지금 매수하세요"
  },
  {
    id: "instrument-pick",
    pattern: /종목|테마주|급등주|우량주|작전주|코인|비트코인|알트코인|ETF|펀드|선물 ?옵션|공모주|부동산 (매입|투자)|갭투자/,
    example: "이 종목을 담으세요"
  },
  {
    id: "return-guarantee",
    pattern: /수익(을|이|은)? ?(보장|확실|확정|약속)|원금 ?(보장|보전)|무조건 (오|올|수익|이익|번)|반드시 (오|올|수익|이익|번)|손실 ?(없|제로)|확실한 (수익|이익)|(상승|하락|폭등|폭락)(이|을|은)? ?(확정|확실)|무위험/,
    example: "원금 보장 수익"
  },
  {
    id: "timing-call",
    pattern: /지금 (사|팔|들어가|진입|투자)|(매수|매도|진입|투자) ?(타이밍|적기|기회)|저점 ?매수|고점 ?매도|물타기|몰빵|올인|불타기/,
    example: "지금이 투자 적기"
  },
  {
    id: "solicitation",
    pattern: /투자하세요|투자를 (권|추천)|투자 ?(추천|권유|권장)|투자하시(면|길)|(추천|권유) ?종목|돈을 넣으세요|넣어 ?두세요|불려 ?보세요|불릴 수 있/,
    example: "투자를 권합니다"
  },
  {
    id: "leverage",
    pattern: /대출(을|로)? ?받아|빚내서|빚을 내|레버리지|신용 ?(거래|매수)|미수/,
    example: "대출 받아 투자"
  },
  {
    id: "windfall",
    pattern: /대박|일확천금|떼돈|한몫|(금전운|재물운|재운)(이|은)? ?(터|온|열|들어)|횡재/,
    example: "재물운이 터집니다"
  }
];

export interface FinanceSolicitationHit {
  ruleId: string;
  match: string;
  index: number;
}

/**
 * 같은 문장 안에서 매치 뒤에 부정·면책 술어가 오면 권유가 아니라 «하지 않는다»는 고지다
 * (예: 「투자 추천, 의학적 판단 … 을 제공하지 않습니다」). 문장 경계(. ! ? 줄바꿈)를 넘지 않는다.
 */
const NEGATION_IN_SENTENCE = /^[^.!?\n]*?(않|아니|대신하지|제공하지|드리지|금지)/;

/** 텍스트 안의 투자권유 어휘를 전부 찾는다(위치 순). 빈 배열 = 통과. */
export function findFinanceSolicitation(text: string): FinanceSolicitationHit[] {
  const hits: FinanceSolicitationHit[] = [];
  for (const rule of FINANCE_SOLICITATION_RULES) {
    const pattern = new RegExp(rule.pattern.source, "g");
    for (const found of text.matchAll(pattern)) {
      const index = found.index ?? 0;
      if (NEGATION_IN_SENTENCE.test(text.slice(index + found[0].length))) continue;
      hits.push({ ruleId: rule.id, match: found[0], index });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

/** 이름 붙은 텍스트 묶음을 한 번에 검사해 «이름: 규칙 「매치」» 줄로 돌려준다. 빈 배열 = 전부 통과. */
export function financeSolicitationFindings(texts: Record<string, string>): string[] {
  const findings: string[] = [];
  for (const [name, text] of Object.entries(texts)) {
    for (const hit of findFinanceSolicitation(text)) findings.push(`${name}: ${hit.ruleId} 「${hit.match}」 @${hit.index}`);
  }
  return findings;
}
