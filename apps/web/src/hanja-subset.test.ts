import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { HYEONG_SUBTYPE_LABELS, INTERACTION_LABELS, TEN_GOD_LABELS } from "@saju-lab/saju-core";
import { describe, expect, it } from "vitest";

/**
 * 한자 서브셋 누락 검사 — 자가호스팅 woff2(public/fonts)의 cmap을 직접 읽어, 화면이 그릴 수 있는 한자가
 * 전부 들어 있는지 본다. `.hanja`는 unicode-range U+4E00-9FFF 전체를 이 폰트에 맡기므로, 서브셋에 없는 글자는
 * 시스템 세리프로 조용히 대체된다(깨지지 않아 눈으로는 못 잡는다). 서브셋을 다시 만들면 이 테스트가 잡는다.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const FONT = resolve(HERE, "../public/fonts/noto-serif-kr-hanja-600.woff2");
// 주석은 화면에 안 나온다 — 블록·줄 주석을 벗긴 뒤 남는 한자(STEM_HANJA·BRANCH_HANJA·化 …)만 요구한다.
const MAIN_TSX = readFileSync(resolve(HERE, "main.tsx"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const CJK = /[一-鿿]/g;

// WOFF2 known table tags (spec §5.2). Only the index of "cmap" (0) matters, but the whole directory must be walked.
const KNOWN_TAGS = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];

/** Code points the woff2's cmap maps to a real glyph (formats 0, 4 and 12). */
export function woff2CodePoints(file: Buffer): Set<number> {
  if (file.readUInt32BE(0) !== 0x774f4632) throw new Error("not a WOFF2 file");
  const numTables = file.readUInt16BE(12);
  const totalCompressedSize = file.readUInt32BE(20);
  let offset = 48;
  const readBase128 = (): number => {
    let value = 0;
    for (let index = 0; index < 5; index += 1) {
      const byte = file[offset] as number;
      offset += 1;
      value = value * 128 + (byte & 0x7f);
      if ((byte & 0x80) === 0) return value;
    }
    throw new Error("UIntBase128 overflow");
  };
  const tables: Array<{ tag: string; length: number }> = [];
  for (let index = 0; index < numTables; index += 1) {
    const flags = file[offset] as number;
    offset += 1;
    let tag: string;
    if ((flags & 0x3f) === 63) {
      tag = file.toString("latin1", offset, offset + 4);
      offset += 4;
    } else {
      tag = KNOWN_TAGS[flags & 0x3f] as string;
    }
    const transformVersion = (flags >> 6) & 3;
    const origLength = readBase128();
    const transformed = tag === "glyf" || tag === "loca" ? transformVersion === 0 : tag === "hmtx" && transformVersion === 1;
    const length = transformed ? readBase128() : origLength;
    tables.push({ tag, length });
  }
  const sfnt = brotliDecompressSync(file.subarray(offset, offset + totalCompressedSize));
  let tableOffset = 0;
  let cmap: Buffer | undefined;
  for (const table of tables) {
    if (table.tag === "cmap") cmap = sfnt.subarray(tableOffset, tableOffset + table.length);
    tableOffset += table.length;
  }
  if (!cmap) throw new Error("woff2 has no cmap table");
  return cmapCodePoints(cmap);
}

function cmapCodePoints(cmap: Buffer): Set<number> {
  const points = new Set<number>();
  const numSubtables = cmap.readUInt16BE(2);
  for (let index = 0; index < numSubtables; index += 1) {
    const subtable = cmap.readUInt32BE(4 + index * 8 + 4);
    const format = cmap.readUInt16BE(subtable);
    if (format === 0) {
      for (let code = 0; code < 256; code += 1) if (cmap[subtable + 6 + code] !== 0) points.add(code);
    } else if (format === 4) {
      const segCount = cmap.readUInt16BE(subtable + 6) / 2;
      const endCodes = subtable + 14;
      const startCodes = endCodes + segCount * 2 + 2;
      const idDeltas = startCodes + segCount * 2;
      const idRangeOffsets = idDeltas + segCount * 2;
      for (let segment = 0; segment < segCount; segment += 1) {
        const end = cmap.readUInt16BE(endCodes + segment * 2);
        const start = cmap.readUInt16BE(startCodes + segment * 2);
        const delta = cmap.readInt16BE(idDeltas + segment * 2);
        const rangeOffset = cmap.readUInt16BE(idRangeOffsets + segment * 2);
        for (let code = start; code <= end && code !== 0xffff; code += 1) {
          let glyph: number;
          if (rangeOffset === 0) {
            glyph = (code + delta) & 0xffff;
          } else {
            const address = idRangeOffsets + segment * 2 + rangeOffset + (code - start) * 2;
            glyph = cmap.readUInt16BE(address);
            if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
          }
          if (glyph !== 0) points.add(code);
        }
      }
    } else if (format === 12) {
      const numGroups = cmap.readUInt32BE(subtable + 12);
      for (let group = 0; group < numGroups; group += 1) {
        const at = subtable + 16 + group * 12;
        const start = cmap.readUInt32BE(at);
        const end = cmap.readUInt32BE(at + 4);
        for (let code = start; code <= end; code += 1) points.add(code);
      }
    }
  }
  return points;
}

const glyphs = woff2CodePoints(readFileSync(FONT));

function required(): Map<string, string> {
  const where = new Map<string, string>();
  const add = (text: string, source: string): void => {
    for (const char of text.match(CJK) ?? []) if (!where.has(char)) where.set(char, source);
  };
  add(MAIN_TSX, "main.tsx");
  for (const [key, label] of Object.entries(TEN_GOD_LABELS)) add(label.hanja, `TEN_GOD_LABELS.${key}`);
  for (const [key, label] of Object.entries(INTERACTION_LABELS)) add(label.hanja, `INTERACTION_LABELS.${key}`);
  for (const [key, label] of Object.entries(HYEONG_SUBTYPE_LABELS)) add(label.hanja, `HYEONG_SUBTYPE_LABELS.${key}`);
  return where;
}

describe("hanja subset — every CJK character the web can render is in the self-hosted woff2", () => {
  it("parses the woff2 cmap to a non-empty CJK set", () => {
    expect(glyphs.size).toBeGreaterThan(0);
    for (const code of glyphs) expect(code >= 0x4e00 && code <= 0x9fff, `U+${code.toString(16)}`).toBe(true);
  });

  it("covers 천간·지지·化 rendered by main.tsx and the ten-god / interaction / 형 subtype hanja labels from saju-core", () => {
    const missing = [...required()].filter(([char]) => !glyphs.has(char.codePointAt(0) as number)).map(([char, source]) => `${char} (U+${(char.codePointAt(0) as number).toString(16).toUpperCase()}, ${source})`);
    expect(missing, "서브셋에 없는 한자 — public/fonts 서브셋을 다시 만들 것").toEqual([]);
    expect(required().size).toBeGreaterThanOrEqual(22);
  });
});
