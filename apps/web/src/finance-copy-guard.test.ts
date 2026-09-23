import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { calculatePillars, financeSolicitationFindings, generatePaidReportV1, generateReportV1 } from "@saju-lab/saju-core";
import { describe, expect, it } from "vitest";
import { buildFreeReportHtml, buildPaidReportHtml } from "./export-html.js";

const HERE = dirname(fileURLToPath(import.meta.url));

// 웹이 직접 들고 있는 한국어 카피 소스 전부 — 한글이 들어 있는 비테스트 .ts/.tsx를 자동 열거한다(새 카피 파일이 조용히 빠지지 않게).
const COPY_SOURCES = readdirSync(HERE).filter((name) => /\.tsx?$/.test(name) && !name.endsWith(".test.ts") && /[가-힣]/.test(readFileSync(resolve(HERE, name), "utf8")));

describe("한국어 투자권유 어휘 가드 — 웹 재무 카피 0건 (MEETING-2026-0923-saju-away A1)", () => {
  it("web copy sources carry no buy/sell, pick, guarantee, timing, leverage or windfall wording", () => {
    expect(COPY_SOURCES).toEqual(expect.arrayContaining(["main.tsx", "export-html.ts", "policy-pages.ts"]));
    const sources = Object.fromEntries(COPY_SOURCES.map((name) => [name, readFileSync(resolve(HERE, name), "utf8")]));
    expect(financeSolicitationFindings(sources)).toEqual([]);
  });

  it("saved free and paid report HTML carry none", () => {
    const input = { birthDate: "1990-01-01", birthTime: "10:30", timezone: "Asia/Seoul", sex: "other" as const };
    const pillars = calculatePillars(input);
    const reportInput = { input, pillars, generatedAt: "2026-09-24T00:00:00+09:00" };
    const texts = {
      "free.html": buildFreeReportHtml(generateReportV1(reportInput)),
      "paid.html": buildPaidReportHtml(generatePaidReportV1(reportInput))
    };
    expect(financeSolicitationFindings(texts)).toEqual([]);
  });
});
