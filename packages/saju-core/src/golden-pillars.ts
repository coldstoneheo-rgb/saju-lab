import { BRANCHES, STEMS } from "./cycle.js";
import type { BirthInput, Pillar, PillarsResult, Sex } from "./types.js";

/**
 * Parser for docs/golden/GOLDEN-PILLARS.md — the human-maintained table that
 * is the source of truth for expected pillars. Tests read the markdown
 * directly so the table never drifts from a code copy.
 *
 * Columns are matched by header name, not position. A row whose 출처 is empty
 * or hand-waved ("commonly listed" …) is a parse error on purpose: the table
 * exists so every expectation can be traced.
 */

export interface GoldenPillarCase {
  id: string;
  input: BirthInput;
  expected: PillarsResult;
  source: string;
  verifier: string;
  verifiedOn: string;
  categories: string[];
  notes: string;
}

export const GOLDEN_TABLE_COLUMNS = {
  id: "id",
  birthDate: "생년월일",
  birthTime: "시각",
  calendar: "달력",
  sex: "성별",
  year: "연주",
  month: "월주",
  day: "일주",
  time: "시주",
  source: "출처",
  verifier: "검증자",
  verifiedOn: "일자",
  categories: "범주",
  notes: "비고"
} as const;

const REQUIRED_COLUMNS = Object.values(GOLDEN_TABLE_COLUMNS);

/** Source wordings that name no document. Kept in sync with the rule in the markdown header. */
const HAND_WAVED_SOURCE = /commonly listed|widely listed|알려짐|알려져|잘 알려진|일반적으로|통상/i;

const SEXES: readonly Sex[] = ["male", "female", "other"];

export class GoldenTableError extends Error {}

export function parseGoldenPillarsMarkdown(markdown: string): GoldenPillarCase[] {
  const table = findTable(markdown);
  return table.rows.map((cells, index) => parseRow(table.columns, cells, index + 1));
}

function findTable(markdown: string): { columns: string[]; rows: string[][] } {
  const lines = markdown.split(/\r?\n/);

  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = lines[index] ?? "";
    const separator = lines[index + 1] ?? "";
    if (!header.trim().startsWith("|") || !/^\|?\s*:?-{3,}/.test(separator.trim())) {
      continue;
    }

    const columns = splitRow(header);
    const missing = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));
    if (missing.length > 0) {
      continue; // some other table (e.g. the category legend)
    }

    const rows: string[][] = [];
    for (let cursor = index + 2; cursor < lines.length; cursor += 1) {
      const line = (lines[cursor] ?? "").trim();
      if (!line.startsWith("|")) {
        break;
      }
      rows.push(splitRow(line));
    }
    return { columns, rows };
  }

  throw new GoldenTableError(`No table with the columns ${REQUIRED_COLUMNS.join(", ")} was found.`);
}

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function parseRow(columns: string[], cells: string[], rowNumber: number): GoldenPillarCase {
  const cell = (column: string): string => {
    const position = columns.indexOf(column);
    return position === -1 ? "" : (cells[position] ?? "");
  };
  const fail = (message: string): never => {
    throw new GoldenTableError(`GOLDEN-PILLARS.md row ${rowNumber} (${cell(GOLDEN_TABLE_COLUMNS.id) || "no id"}): ${message}`);
  };

  const id = cell(GOLDEN_TABLE_COLUMNS.id);
  if (!id) fail("id is required.");

  const source = cell(GOLDEN_TABLE_COLUMNS.source);
  if (!source || source === "-") fail("출처 is required — every expected value must be traceable.");
  if (HAND_WAVED_SOURCE.test(source)) fail(`출처 "${source}" names no document; cite a URL or a bibliographic reference.`);

  const verifier = cell(GOLDEN_TABLE_COLUMNS.verifier);
  const verifiedOn = cell(GOLDEN_TABLE_COLUMNS.verifiedOn);
  if (!verifier) fail("검증자 is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verifiedOn)) fail("일자 must be YYYY-MM-DD.");

  const birthDate = cell(GOLDEN_TABLE_COLUMNS.birthDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) fail("생년월일 must be YYYY-MM-DD.");

  const calendar = cell(GOLDEN_TABLE_COLUMNS.calendar);
  if (calendar !== "solar") fail(`달력 "${calendar}" is not supported by the calculation core yet (solar only).`);

  const sex = cell(GOLDEN_TABLE_COLUMNS.sex) as Sex;
  if (!SEXES.includes(sex)) fail(`성별 must be one of ${SEXES.join(", ")}.`);

  const birthTimeCell = cell(GOLDEN_TABLE_COLUMNS.birthTime);
  const timeKnown = birthTimeCell !== "" && birthTimeCell !== "-";
  if (timeKnown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTimeCell)) fail("시각 must be HH:mm or '-'.");

  const timeCell = cell(GOLDEN_TABLE_COLUMNS.time);
  if (timeKnown === (timeCell === "" || timeCell === "-")) {
    fail("시주 must be given exactly when 시각 is given.");
  }

  const expected: PillarsResult = {
    year: parsePillar(cell(GOLDEN_TABLE_COLUMNS.year), "연주", fail),
    month: parsePillar(cell(GOLDEN_TABLE_COLUMNS.month), "월주", fail),
    day: parsePillar(cell(GOLDEN_TABLE_COLUMNS.day), "일주", fail),
    ...(timeKnown ? { time: parsePillar(timeCell, "시주", fail) } : {})
  };

  return {
    id,
    input: {
      birthDate,
      ...(timeKnown ? { birthTime: birthTimeCell } : {}),
      timezone: "Asia/Seoul",
      sex
    },
    expected,
    source,
    verifier,
    verifiedOn,
    categories: cell(GOLDEN_TABLE_COLUMNS.categories).split(/[·,]/).map((value) => value.trim()).filter(Boolean),
    notes: cell(GOLDEN_TABLE_COLUMNS.notes)
  };
}

function parsePillar(value: string, column: string, fail: (message: string) => never): Pillar {
  const [stem, branch] = value.split("-");
  if (!stem || !branch || !(STEMS as readonly string[]).includes(stem) || !(BRANCHES as readonly string[]).includes(branch)) {
    fail(`${column} "${value}" must be <stem>-<branch> with romanised labels.`);
  }
  return { stem: stem as Pillar["stem"], branch: branch as Pillar["branch"] };
}
