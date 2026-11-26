// 무료 결과 본문이 끝난 바로 뒤(투명성 노트 다음 · 유료 미리보기 앞) 교차 안내(TASK-2026-1127). 같은 곳에서 만든 서비스 두 개를 한 줄씩 가리킨다.
// 이 레포는 공개 — 문장은 여기서 새로 썼고, 주소는 누구나 열 수 있는 공개 주소만 쓴다.
// 넘어간 수: baby는 Play 주소의 referrer UTM(Play Console 사용자 확보 보고서)로 본다. face-fate 단축 주소는
// 붙인 매개변수를 다음 주소로 넘기지 않아(11-27 실측) 이 사이트에서는 잴 수 없다. 새 추적 스크립트는 쓰지 않는다.
// 저장(내보낸) HTML에는 넣지 않는다 — 저장본은 개인 기록물이고 안내는 화면에서만 보인다.

export const CROSS_PROMO_TITLE = "같은 곳에서 만든 다른 서비스";

export const BABY_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.aistudio.babynaming.fkwypc&referrer=utm_source%3Dsaju-lab%26utm_medium%3Dweb%26utm_campaign%3Dcross_promo";

// 다섯째 글자는 대문자 I(소문자 l이면 404).
export const FACE_FATE_URL = "https://minion.toss.im/vKTBQIwh";

export type CrossPromoLine = {
  lead: string;
  name: string;
  note: string;
  href: string;
};

export const CROSS_PROMO_LINES: readonly CrossPromoLine[] = [
  {
    lead: "작명소에 가기 전에, 아기 이름을 사주로 지어 보고 싶다면",
    name: "첫이름",
    note: "안드로이드 앱",
    href: BABY_PLAY_URL
  },
  {
    lead: "얼굴을 30초 스캔해 관상을 세 줄로 받아 보고 싶다면",
    name: "팩폭관상",
    note: "토스 앱에서 열림 · 세 줄 총평 무료 · 상세 풀이 1,980원",
    href: FACE_FATE_URL
  }
];

export function CrossPromo(): JSX.Element {
  return (
    <aside className="crossPromo" aria-label={CROSS_PROMO_TITLE}>
      <p className="crossPromoTitle">{CROSS_PROMO_TITLE}</p>
      <ul>
        {CROSS_PROMO_LINES.map((line) => (
          <li key={line.name}>
            <span>{line.lead}</span>{" "}
            <a href={line.href} rel="noopener" target="_blank">
              {line.name} <small>({line.note})</small>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
