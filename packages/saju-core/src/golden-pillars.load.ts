import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parseGoldenPillarsMarkdown, type GoldenPillarCase } from "./golden-pillars.js";

// Test-side loader for docs/golden/GOLDEN-PILLARS.md. Not exported from
// index.ts: it reads the filesystem and the browser bundle must not pull it in.

export const GOLDEN_PILLARS_MD = resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/golden/GOLDEN-PILLARS.md");

export function loadGoldenPillarCases(): GoldenPillarCase[] {
  return parseGoldenPillarsMarkdown(readFileSync(GOLDEN_PILLARS_MD, "utf8"));
}

export function goldenCase(id: string): GoldenPillarCase {
  const found = loadGoldenPillarCases().find((goldenCase) => goldenCase.id === id);
  if (!found) {
    throw new Error(`GOLDEN-PILLARS.md has no row with id ${id}.`);
  }
  return found;
}
