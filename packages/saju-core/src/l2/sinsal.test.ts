import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { goldenCase } from "../golden-pillars.load.js";
import { calculatePillars } from "../pillars.js";
import { buildSajuPillarsV1Response } from "../saju-pillars-v1.js";
import type { PillarsResult } from "../types.js";
import { sinsalOf, type SinsalHit } from "./sinsal.js";
import { SINSAL_VARIANTS } from "./sinsal.data.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const markdown = readFileSync(resolve(HERE, "../../../../docs/rules/SINSAL.md"), "utf8");

/** `"gyeong-jin im-sul ..."` (연 월 일 [시]) → PillarsResult. */
function chart(text: string): PillarsResult {
  const [year, month, day, time] = text.split(" ").map((pair) => {
    const [stem, branch] = pair.split("-");
    return { stem: stem as string, branch: branch as string };
  });
  return { year: year!, month: month!, day: day!, ...(time ? { time } : {}) };
}

/** `variantId → "basisPillar:at,at"` joined by `;` when a variant has several hits. */
function summary(hits: SinsalHit[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const hit of hits) {
    const cell = `${hit.basis.pillar}:${hit.at.join(",")}`;
    out[hit.variantId] = out[hit.variantId] ? `${out[hit.variantId]};${cell}` : cell;
  }
  return out;
}
const of = (text: string) => summary(sinsalOf(chart(text)));

describe("sinsalOf — 손 계산 명식", () => {
  it("g-1988-10-09-0230 戊辰 壬戌 丁酉 辛丑: 손 유도(SINSAL.md 표만)와 같다, 실명 입력 경유", () => {
    // 丁 → 천을 亥酉(A=B) → 일지 酉 · 연지 辰(申子辰) → 도화 酉(일) · 역마 寅 없음 · 화개 辰(연 자기 제외) 없음
    // 일지 酉(巳酉丑) → 도화 午 없음 · 역마 亥 없음 · 화개 丑(시) · 丁 양인 없음(양간만)
    // 괴강: 일주 丁酉 아님 · 네 기둥 = 월 壬戌 · 백호 = 연 戊辰 · 월 壬戌
    const expected = {
      "cheoneul.a": "day:day",
      "cheoneul.b": "day:day",
      "dohwa.year-basis": "year:day",
      "hwagae.day-basis": "day:time",
      "goegang.four-pillars": "month:month",
      baekho: "year:year;month:month"
    };
    expect(of("mu-jin im-sul jeong-yu sin-chuk")).toEqual(expected);
    expect(summary(sinsalOf(calculatePillars(goldenCase("g-1988-10-09-0230").input)))).toEqual(expected);
  });

  it("출력 순서 = 표 1 변형 순 · 기둥 연→시, 같은 입력 같은 출력", () => {
    const hits = sinsalOf(chart("mu-jin im-sul jeong-yu sin-chuk"));
    const order = SINSAL_VARIANTS.map((variant) => variant.variantId as string);
    const indices = hits.map((hit) => order.indexOf(hit.variantId));
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
    expect(sinsalOf(chart("mu-jin im-sul jeong-yu sin-chuk"))).toEqual(hits);
  });
});

describe("S4 경계", () => {
  it("시각 미상: 시지·시주는 대상이 아니다, precision time-unknown, 일간·일지 기준은 그대로", () => {
    // 庚 일간 · 시 丁丑 → 천을 A 丑(시) / 시각 미상이면 사라짐
    const known = of("gap-in byeong-in gyeong-o jeong-chuk");
    expect(known["cheoneul.a"]).toBe("day:time");
    const unknown = sinsalOf(chart("gap-in byeong-in gyeong-o"));
    expect(summary(unknown)["cheoneul.a"]).toBeUndefined();
    expect(summary(unknown)["cheoneul.b"]).toBe("day:year,month,day");
    expect(unknown.every((hit) => hit.precision === "time-unknown" && !hit.at.includes("time") && hit.basis.pillar !== "time")).toBe(true);
    expect(sinsalOf(chart("gap-in byeong-in gyeong-o jeong-chuk")).every((hit) => hit.precision === "exact")).toBe(true);
  });

  it("기준 기둥 자기 제외: 연지 戌(寅午戌) 화개 = 戌 — 연주는 빼고 다른 戌만", () => {
    expect(of("byeong-sul gi-hae gap-ja gap-sul")["hwagae.year-basis"]).toBe("year:time");
    expect(of("byeong-sul gi-hae gap-ja gap-ja")["hwagae.year-basis"]).toBeUndefined();
    // 일지 기준도 같다: 일지 辰(申子辰) 화개 辰 → 일주 제외, 연지 辰만
    expect(of("gap-jin gi-hae gap-jin gap-ja")["hwagae.day-basis"]).toBe("day:year");
  });

  it("천을귀인 A/B 갈림: 庚 일간 — A 丑未 · B 寅午", () => {
    const split = of("gi-chuk mu-in gyeong-o gye-mi");
    expect(split["cheoneul.a"]).toBe("day:year,time");
    expect(split["cheoneul.b"]).toBe("day:month,day");
    // 庚 밖 일간은 A·B가 같다
    const same = of("gi-chuk mu-in gap-o gye-mi");
    expect(same["cheoneul.a"]).toBe(same["cheoneul.b"]);
  });

  it("괴강 戊戌: 일주 戊戌은 day-mu-sul만 · 연주 戊戌은 괴강 0 · 壬辰 연주는 four-pillars만", () => {
    const musul = of("gap-ja byeong-in mu-sul gap-ja");
    expect(musul["goegang.day-mu-sul"]).toBe("day:day");
    expect(musul["goegang.day-four"]).toBeUndefined();
    expect(musul["goegang.four-pillars"]).toBeUndefined();
    const yearMusul = of("mu-sul byeong-in gap-ja gap-ja");
    expect(Object.keys(yearMusul).filter((id) => id.startsWith("goegang"))).toEqual([]);
    const imjin = of("im-jin byeong-in gap-ja gap-ja");
    expect(imjin["goegang.four-pillars"]).toBe("year:year");
    expect(imjin["goegang.day-four"]).toBeUndefined();
    const dayFour = of("gap-ja byeong-in gyeong-sul gap-ja");
    expect([dayFour["goegang.day-four"], dayFour["goegang.day-mu-sul"], dayFour["goegang.four-pillars"]]).toEqual(["day:day", "day:day", "day:day"]);
  });

  it("양인 양간만: 甲 일간 卯 → 적중 · 乙 일간 辰(음간 판본)은 실행 안 함", () => {
    expect(of("gap-ja jeong-myo gap-o gap-ja")["yangin.yang-only"]).toBe("day:month");
    expect(of("gap-ja byeong-jin eul-hae gap-ja")["yangin.yang-only"]).toBeUndefined();
  });
});

describe("S2 모양 · S5 어휘·계약", () => {
  it("키 집합 고정 · doctrine unreviewed · at 비어 있지 않음 · 길흉/점수 필드 없음", () => {
    const hits = sinsalOf(chart("mu-jin im-sul jeong-yu sin-chuk"));
    for (const hit of hits) {
      expect(Object.keys(hit).sort()).toEqual(["at", "basis", "doctrine", "precision", "sinsalId", "variantId"]);
      expect(hit.doctrine).toBe("unreviewed");
      expect(hit.at.length).toBeGreaterThan(0);
    }
    expect(JSON.stringify(hits)).not.toMatch(/"(good|bad|score|rank|weight|lucky|strength)"/);
  });

  it("어휘 가드: SINSAL.md 본문(「쓰지 않는 말」 밖)·sinsal.ts·sinsal.data.ts에 길흉 단정·권고어 0", () => {
    const banned = /추천|권장|최적|반드시|길하|흉하|길신|흉신|흉살|좋은|나쁜|조심|주의/;
    expect(markdown.split("## 쓰지 않는 말")[0]).not.toMatch(banned);
    expect(readFileSync(resolve(HERE, "sinsal.ts"), "utf8")).not.toMatch(banned);
    expect(readFileSync(resolve(HERE, "sinsal.data.ts"), "utf8")).not.toMatch(banned);
  });

  const base = { birthDate: "1990-01-01", birthTime: "10:30", calendar: "solar" as const, sex: "other" as const };
  // 1990-01-01 10:30에는 신살 적중이 없다(골든 g-1990-01-01-1030 전부 `-`) → 적중 있는 g-1988-10-09-0230으로 본다.
  const hitBase = { birthDate: "1988-10-09", birthTime: "02:30", calendar: "solar" as const, sex: "other" as const };
  it("9단계 개방: include [\"sinsal\"] → data.sinsal = 코어 직접 호출 · 기존 키 그대로 + sinsal 한 키만(의존 블록 자동 포함 없음) · doctrine unreviewed · 기본 응답엔 키 0", () => {
    const asked = buildSajuPillarsV1Response({ ...hitBase, options: { include: ["sinsal"] } });
    const plain = buildSajuPillarsV1Response(hitBase);
    expect(JSON.stringify(buildSajuPillarsV1Response(base))).not.toMatch(/sinsal|doctrine/i);
    expect(asked.ok && plain.ok).toBe(true);
    if (!asked.ok || !plain.ok) return;
    const { sinsal: block, ...rest } = asked.data;
    expect(rest).toEqual(plain.data);
    expect(Object.keys(asked.data).filter((key) => !(key in plain.data))).toEqual(["sinsal"]);
    expect(block).toEqual(sinsalOf(calculatePillars(goldenCase("g-1988-10-09-0230").input)));
    expect(block!.length).toBeGreaterThan(0);
    expect(block!.every((record) => record.doctrine === "unreviewed")).toBe(true);
    expect(JSON.stringify(plain.data)).not.toMatch(/sinsal|cheoneul|dohwa|yeokma|hwagae|goegang|baekho|doctrine/i);
  });
});
