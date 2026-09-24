import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 베타 UI 1차(#89) 정적 가드 — styles.css 토큰만으로 검사한다(브라우저 없음).
 * - 대비: WCAG 2.x 상대 휘도, 본문 기준 4.5:1. PR #89 본문 표와 같은 쌍.
 * - 다크 3블록 동기: `@media (prefers-color-scheme: dark)`의 `:root:not([data-theme])`와 수동 `:root[data-theme="dark"]`가 같은 값.
 * - 44px: 접힘 summary 5종·segmented 라디오의 `min-height`. 360px 실제 레이아웃 측정은 브라우저가 필요해 여기 없다.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(resolve(HERE, "styles.css"), "utf8");
const MAIN_TSX = readFileSync(resolve(HERE, "main.tsx"), "utf8");

const MIN_BODY_CONTRAST = 4.5;
const TAP_TARGET_PX = 44;
const FOREGROUNDS = ["text", "text-muted", "primary", "element-wood", "element-fire", "element-earth", "element-metal", "element-water"] as const;
const BACKGROUNDS = ["surface", "page"] as const;
const THEME_TOKENS = [...FOREGROUNDS, ...BACKGROUNDS, "primary-text"] as const;
const FOLD_SELECTORS = [".pillarTerms summary", ".hiddenStems summary", ".interactionDetails summary", ".alternatePillars summary", ".daeunRule summary"];

function blockAfter(css: string, opener: string): string {
  const start = css.indexOf(opener);
  if (start === -1) throw new Error(`styles.css: 「${opener}」 block not found`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, index);
    }
  }
  throw new Error(`styles.css: 「${opener}」 block never closes`);
}

function tokensOf(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const match of block.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) tokens[match[1] as string] = (match[2] as string).trim();
  return tokens;
}

function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`token is not a 6-digit hex color: ${hex}`);
  const value = Number.parseInt(match[1] as string, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

const light = tokensOf(blockAfter(CSS, "\n:root {"));
const mediaDark = tokensOf(blockAfter(CSS, ":root:not([data-theme]) {"));
const manualDark = tokensOf(blockAfter(CSS, ':root[data-theme="dark"] {'));

describe("design tokens — contrast (WCAG 4.5:1, 토큰 기준)", () => {
  it("defines every theme token in the light block and both dark blocks", () => {
    for (const token of THEME_TOKENS) {
      expect(light[token], `light --${token}`).toBeDefined();
      expect(mediaDark[token], `media dark --${token}`).toBeDefined();
      expect(manualDark[token], `manual dark --${token}`).toBeDefined();
    }
  });

  it.each([
    ["light", light],
    ["dark", mediaDark]
  ] as const)("%s: every foreground token reaches 4.5:1 on surface and on page", (_name, tokens) => {
    for (const foreground of FOREGROUNDS) {
      for (const background of BACKGROUNDS) {
        const ratio = contrastRatio(tokens[foreground] as string, tokens[background] as string);
        expect(ratio, `--${foreground} on --${background} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(MIN_BODY_CONTRAST);
      }
    }
    expect(contrastRatio(tokens["primary-text"] as string, tokens.primary as string)).toBeGreaterThanOrEqual(MIN_BODY_CONTRAST);
  });

  it("the manual dark block mirrors the media dark block (no drift between system dark and the toggle)", () => {
    for (const token of THEME_TOKENS) expect(manualDark[token], `--${token}`).toBe(mediaDark[token]);
  });
});

describe("tap targets — 44px static rule check (#89 접힘 = 44px 테두리 버튼)", () => {
  const minHeightOf = (block: string): number => {
    const match = /min-height\s*:\s*(\d+)px/.exec(block);
    if (!match) throw new Error("min-height not declared");
    return Number(match[1]);
  };

  it("the shared fold-summary rule lists all five collapsibles and sets min-height ≥ 44px", () => {
    const ruleStart = CSS.indexOf(FOLD_SELECTORS[0] as string);
    expect(ruleStart).toBeGreaterThan(-1);
    const selectorList = CSS.slice(ruleStart, CSS.indexOf("{", ruleStart));
    for (const selector of FOLD_SELECTORS) expect(selectorList).toContain(selector);
    expect(minHeightOf(blockAfter(CSS, FOLD_SELECTORS[0] as string))).toBeGreaterThanOrEqual(TAP_TARGET_PX);
  });

  it("segmented radio labels keep min-height ≥ 44px", () => {
    expect(minHeightOf(blockAfter(CSS, "\n.segmented span {"))).toBeGreaterThanOrEqual(TAP_TARGET_PX);
  });

  it("every guarded selector is actually rendered by main.tsx (no dead CSS behind the guard)", () => {
    for (const className of ["pillarTerms", "hiddenStems", "interactionDetails", "alternatePillars", "daeunRule", "segmented"]) {
      expect(MAIN_TSX, className).toMatch(new RegExp(`className="${className}[\\s"]`));
    }
  });
});

describe("hanja font — self-hosted subset wiring", () => {
  it("@font-face serves the local woff2 with the CJK unicode-range and .hanja uses it first", () => {
    const fontFace = blockAfter(CSS, "@font-face {");
    expect(fontFace).toMatch(/font-family:\s*"Saju Hanja"/);
    expect(fontFace).toMatch(/unicode-range:\s*U\+4E00-9FFF/);
    const src = /url\("([^"]+\.woff2)"\)/.exec(fontFace)?.[1];
    expect(src).toBeDefined();
    expect(existsSync(resolve(HERE, "../public", (src as string).replace(/^\//, "")))).toBe(true);
    expect(blockAfter(CSS, "\n.hanja {")).toMatch(/font-family:\s*"Saju Hanja"/);
  });
});
