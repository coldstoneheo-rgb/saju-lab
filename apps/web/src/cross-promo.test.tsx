import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import mainSource from "./main.tsx?raw";
import exportHtmlSource from "./export-html.ts?raw";
import {
  BABY_PLAY_URL,
  CROSS_PROMO_LINES,
  CROSS_PROMO_TITLE,
  CrossPromo,
  FACE_FATE_URL
} from "./cross-promo.js";

// 교차 안내 구역(TASK-2026-1127): 두 줄 · 고지 1회 · 공개 주소만 · 무료 본문 끝 한 곳 · 저장 HTML 0.
// 재무 어휘 가드는 finance-copy-guard.test.ts가 cross-promo.tsx까지 자동으로 본다.

const textOf = (html: string): string => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&");

describe("교차 안내 구역", () => {
  it("두 줄, 고지 «같은 곳에서 만든» 1회, 링크는 정한 공개 주소 2개만", () => {
    const html = renderToStaticMarkup(<CrossPromo />);
    expect(html.match(/<li/g)?.length).toBe(2);
    expect(html.split("같은 곳에서 만든").length - 1).toBe(2); // aria-label + 보이는 제목, 문장으로는 1회
    expect(textOf(html).split("같은 곳에서 만든").length - 1).toBe(1);
    expect(html).toContain(`<aside class="crossPromo" aria-label="${CROSS_PROMO_TITLE}">`);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => (m[1] ?? "").replace(/&amp;/g, "&"));
    expect(hrefs).toEqual([BABY_PLAY_URL, FACE_FATE_URL]);
    expect(html.match(/target="_blank"/g)?.length).toBe(2);
    expect(html.match(/rel="noopener"/g)?.length).toBe(2);
  });

  it("주소 모양: Play는 패키지 + referrer UTM, 팩폭관상은 대문자 I 단축 주소", () => {
    const play = new URL(BABY_PLAY_URL);
    expect(play.origin + play.pathname).toBe("https://play.google.com/store/apps/details");
    expect(play.searchParams.get("id")).toBe("com.aistudio.babynaming.fkwypc");
    expect(new URLSearchParams(play.searchParams.get("referrer") ?? "").get("utm_source")).toBe("saju-lab");
    expect(FACE_FATE_URL).toBe("https://minion.toss.im/vKTBQIwh");
    for (const line of CROSS_PROMO_LINES) expect(line.href.startsWith("https://")).toBe(true);
  });

  it("문장: 얻는 것이 먼저 · 유료와 열리는 곳을 숨기지 않음 · 단정/빈말 0", () => {
    const text = textOf(renderToStaticMarkup(<CrossPromo />));
    for (const line of CROSS_PROMO_LINES) {
      expect(text.indexOf(line.lead)).toBeLessThan(text.indexOf(line.name));
    }
    // 1,980원은 세 줄 총평 뒤 상세 풀이 값 — 무료 범위와 함께 적어 세 줄 관상 값으로 읽히지 않게 한다.
    expect(text).toContain("토스 앱에서 열림 · 세 줄 총평 무료 · 상세 풀이 1,980원");
    expect(text.split("1,980원").length - 1).toBe(1);
    // 첫이름 줄은 Play 공개 설명(«작명소에 가기 전에, 사주로 짓는 아기 이름») 밖의 기능을 말하지 않는다.
    expect(text).not.toContain("비교");
    expect(text).toContain("안드로이드 앱");
    expect(text).not.toMatch(/반드시|필연|확실히|100%|AI가|정확한|무료로|최고/);
  });

  it("자리: 무료 본문 끝(투명성 노트 바로 다음 · 유료 미리보기 앞) 한 곳에만", () => {
    expect(mainSource.split("<CrossPromo />").length - 1).toBe(1);
    expect(mainSource).toMatch(/id="transparency"[^\n]*\/>\r?\n\s*<CrossPromo \/>\r?\n\s*<PaidReportPrototype /);
    expect(CROSS_PROMO_TITLE).toBe("같은 곳에서 만든 다른 서비스");
  });

  it("저장(내보낸) HTML에는 넣지 않는다", () => {
    expect(exportHtmlSource).not.toContain("cross-promo");
    expect(exportHtmlSource).not.toContain("play.google.com");
    expect(exportHtmlSource).not.toContain("minion.toss.im");
  });
});
