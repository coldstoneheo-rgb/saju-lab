#!/usr/bin/env node
/**
 * 8a 강약 팩터 검증 팩 생성기 — LC 독립 재계산용 한 파일.
 *
 *   node scripts/strength_verify_pack.mjs            # docs/golden/STRENGTH-FACTORS-VERIFY-PACK.md 생성
 *   node scripts/strength_verify_pack.mjs --check    # 파일을 쓰지 않고 골든 셀 대조만(불일치 = exit 1)
 *
 * 행마다 입력(GOLDEN-PILLARS) · 정규화 KST · 명식 · 층 원본(천간/지지 정기/지장간) · 팩터별 값과 유도 근거 ·
 * 골든 셀(GOLDEN-STRENGTH-FACTORS) 대조 결과를 적는다. 골든 50행 + REPORT §2 YNY 보강 후보 2행(명식 KASI 미검증).
 * 판결(신강/신약)은 없다 — 8a는 사실 층이다.
 */
import { build } from "esbuild";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs/golden/STRENGTH-FACTORS-VERIFY-PACK.md");
const GOLDEN_STRENGTH = join(ROOT, "docs/golden/GOLDEN-STRENGTH-FACTORS.md");
const GOLDEN_PILLARS = join(ROOT, "docs/golden/GOLDEN-PILLARS.md");
const CHECK_ONLY = process.argv.includes("--check");

/** REPORT HO-2026-0923-saju-L2-stage8a-01 §2 — 득령Y·득지N·득세Y 보강 후보(LC 채택). 명식은 코어 산출, 일진·절입 KASI 대조 전. */
const CANDIDATES = [
  { id: "S-YNY-1", input: { birthDate: "1995-02-15", birthTime: "12:00", timezone: "Asia/Seoul", sex: "female" } },
  { id: "S-YNY-2", input: { birthDate: "1995-11-10", birthTime: "12:00", timezone: "Asia/Seoul", sex: "female" } }
];

const core = await loadCore();

const STEM_H = { gap: "甲", eul: "乙", byeong: "丙", jeong: "丁", mu: "戊", gi: "己", gyeong: "庚", sin: "辛", im: "壬", gye: "癸" };
const BRANCH_H = { ja: "子", chuk: "丑", in: "寅", myo: "卯", jin: "辰", sa: "巳", o: "午", mi: "未", sin: "申", yu: "酉", sul: "戌", hae: "亥" };
const ELEMENT_H = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };
const ROLE_KO = { residual: "여기", middle: "중기", primary: "정기" };
const PILLAR_KO = { year: "연", month: "월", day: "일", time: "시" };
const SEASON_KO = { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" };
const TERM_KO = { ipchun: "입춘", gyeongchip: "경칩", cheongmyeong: "청명", ipha: "입하", mangjong: "망종", soseo: "소서", ipchu: "입추", baengno: "백로", hallo: "한로", ipdong: "입동", daeseol: "대설", sohan: "소한" };
const SUPPORT = new Set(core.SUPPORT_TEN_GODS);
const COMBOS = ["YYY", "YYN", "YNY", "YNN", "NYY", "NYN", "NNY", "NNN"];

const god = (code) => `${core.TEN_GOD_LABELS[code].ko}(${code})`;
const godKo = (code) => core.TEN_GOD_LABELS[code].ko;
const stemH = (stem) => `${STEM_H[stem]}${stem}`;
const pillarH = (pillar) => (pillar ? `${STEM_H[pillar.stem]}${BRANCH_H[pillar.branch]}(${pillar.stem}-${pillar.branch})` : "미상");
const yn = (value) => (value ? "Y" : "N");
const pad2 = (n) => String(n).padStart(2, "0");
const kstText = (kst) => `${kst.year}-${pad2(kst.month)}-${pad2(kst.day)}${kst.hour === undefined ? " 시각 미상(12:00 대체)" : `T${pad2(kst.hour)}:${pad2(kst.minute)}`}`;
const optionsText = (input) => {
  const parts = [];
  if (input.calendar === "lunar") parts.push(`lunar${input.isLeapMonth ? " 윤달" : ""}`);
  if (input.birthPlace) parts.push(`출생지 ${input.birthPlace}`);
  const o = input.options ?? {};
  if (o.trueSolarTime) parts.push("trueSolarTime");
  if (o.jaHourPolicy) parts.push(`jaHourPolicy=${o.jaHourPolicy}`);
  if (o.dayBoundary) parts.push(`dayBoundary=${o.dayBoundary}`);
  return parts.length > 0 ? parts.join(" · ") : "-";
};

function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

/** GOLDEN-STRENGTH-FACTORS.md 「| id |」 표 → id → { status, cells } */
function loadGoldenCells() {
  const lines = readFileSync(GOLDEN_STRENGTH, "utf8").split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("| id |"));
  if (headerIndex === -1) throw new Error("GOLDEN-STRENGTH-FACTORS.md: header not found");
  const columns = splitRow(lines[headerIndex]);
  const rows = new Map();
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith("|")) break;
    const cells = splitRow(line);
    const at = (name) => cells[columns.indexOf(name)] ?? "";
    rows.set(at("id"), { status: at("상태"), cells: Object.fromEntries(core.STRENGTH_GOLDEN_COLUMNS.map((name) => [name, at(name)])) });
  }
  return rows;
}

function factorsFor(input) {
  const pillars = core.calculatePillars(input);
  const kst = core.resolveBirthKst(input);
  return { pillars, kst, factors: core.strengthFactorsOf(pillars, kst) };
}

function section({ id, input, expected, golden, candidate }) {
  const { pillars, kst, factors: f } = factorsFor(input);
  const rendered = core.renderStrengthFactors(f);
  const combo = [f.deukryeong.value, f.deukji.value, f.deukse.value].map(yn).join("");
  const keys = ["year", "month", "day", "time"];
  const lines = [];
  lines.push(`### ${id} — 일간 ${stemH(f.dayMaster)} · 득령득지득세 ${combo}${golden ? ` · ${golden.status}` : " · 후보(골든 아님)"}`);
  lines.push("");
  lines.push(`- 입력: ${input.birthDate} ${input.birthTime ?? "시각 모름"} · ${input.calendar ?? "solar"} · ${input.sex} · 옵션 ${optionsText(input)}`);
  lines.push(`- 정규화 KST(월주·사령 기준, 진태양시 미적용): ${kstText(kst)} · precision ${f.precision} · 학파 ${f.school}`);
  lines.push(`- 명식: ${keys.map((key) => `${PILLAR_KO[key]} ${pillarH(pillars[key])}`).join(" · ")}${expected ? " — GOLDEN-PILLARS confirmed" : " — **코어 산출, 일진·절입 KASI 대조 전**"}`);
  if (expected) {
    const same = keys.every((key) => JSON.stringify(pillars[key] ?? null) === JSON.stringify(expected[key] ?? null));
    if (!same) lines.push(`- **명식 불일치**: 골든 ${keys.map((key) => pillarH(expected[key])).join(" ")}`);
  }
  lines.push(`- 층 원본 (일간 제외 천간): ${f.layers.stems.map((e) => `${PILLAR_KO[e.pillar]} ${stemH(e.stem)}=${god(core.tenGodOf(f.dayMaster, e.stem))}`).join(", ")}`);
  lines.push(`- 층 원본 (지지 정기): ${f.layers.branchPrimary.map((e) => `${PILLAR_KO[e.pillar]} ${BRANCH_H[pillars[e.pillar].branch]}→${stemH(e.stem)}=${god(core.tenGodOf(f.dayMaster, e.stem))}`).join(", ")}`);
  const hiddenByPillar = keys.filter((key) => pillars[key]).map((key) => {
    const entries = f.layers.hiddenStems.filter((e) => e.pillar === key);
    return `${PILLAR_KO[key]} ${BRANCH_H[pillars[key].branch]}[${entries.map((e) => `${STEM_H[e.stem]}${e.days ?? "-"}`).join(" ")}]`;
  });
  lines.push(`- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): ${hiddenByPillar.join(" · ")}`);
  lines.push(`- 표층십신 ${rendered["표층십신"]} · 장간십신 ${rendered["장간십신"]} · 표층오행 ${rendered["표층오행"]} · 장간오행 ${rendered["장간오행"]} (일간 제외)`);
  lines.push(`- 득령 **${yn(f.deukryeong.value)}** — 월지 ${BRANCH_H[pillars.month.branch]} 정기 ${stemH(f.deukryeong.monthPrimary)} → ${god(f.deukryeong.tenGod)} ${SUPPORT.has(f.deukryeong.tenGod) ? "∈" : "∉"} 돕는 십신(비겁·인성) [${f.deukryeong.definitionId}]`);
  const dayHidden = core.hiddenStemList(pillars.day.branch, f.school).map((e) => `${STEM_H[e.stem]}=${god(core.tenGodOf(f.dayMaster, e.stem))}`);
  lines.push(`- 득지 **${yn(f.deukji.value)}** — 일지 ${BRANCH_H[pillars.day.branch]} 장간 ${dayHidden.join(" ")} → 돕는 것 ${f.deukji.supporting.length > 0 ? f.deukji.supporting.map((e) => STEM_H[e.stem]).join(" ") : "없음"} [${f.deukji.definitionId}]`);
  const outside = [
    ...f.layers.stems.map((e) => `${PILLAR_KO[e.pillar]}간 ${STEM_H[e.stem]}=${godKo(core.tenGodOf(f.dayMaster, e.stem))}`),
    ...f.layers.branchPrimary.filter((e) => e.pillar !== "month").map((e) => `${PILLAR_KO[e.pillar]}지정기 ${STEM_H[e.stem]}=${godKo(core.tenGodOf(f.dayMaster, e.stem))}`)
  ];
  lines.push(`- 득세 **${yn(f.deukse.value)}** ${f.deukse.support}:${f.deukse.other} — 월지 제외 표층 [${outside.join(", ")}] → 돕는 ${f.deukse.support} ${f.deukse.support >= f.deukse.other ? "≥" : "<"} 나머지 ${f.deukse.other}${f.deukse.support === f.deukse.other ? " (동률 = 득세)" : ""} [${f.deukse.definitionId}]`);
  lines.push(`- 투간: ${f.exposed.length > 0 ? f.exposed.map((e) => `${PILLAR_KO[e.pillar]}지 ${ROLE_KO[e.role]} ${STEM_H[e.stem]} → ${e.in.map((p) => `${PILLAR_KO[p]}간`).join(",")}`).join(" · ") : "없음"} (일간 포함 천간에 같은 글자)`);
  lines.push(`- 통근: ${f.roots.length > 0 ? f.roots.map((e) => `${PILLAR_KO[e.pillar]}지 ${ROLE_KO[e.role]} ${STEM_H[e.stem]}`).join(" · ") : "없음"} (일간 오행 ${ELEMENT_H[core.STEM_FIVE_ELEMENT[f.dayMaster]]} 장간)`);
  if (f.saryeong) {
    const s = f.saryeong;
    const elapsedDays = s.elapsedMinutes / 1440;
    const nearest = s.boundaries.map((mark) => Math.abs(elapsedDays - mark).toFixed(3));
    lines.push(`- 사령: ${TERM_KO[s.term.code]}(${s.term.code}) ${s.term.at} KST → 출생 ${kstText(kst)} = ${s.elapsedMinutes}분 = ${elapsedDays.toFixed(3)}일 · 경계 [${s.boundaries.join(", ")}]일 → **${STEM_H[s.stem]} ${ROLE_KO[s.role]}** · 경계와 거리 [${nearest.join(", ")}]일 → 사령경계 ${yn(s.nearThreshold)} (≤ ${core.SARYEONG_NEAR_THRESHOLD_DAYS}일)`);
  } else {
    lines.push(`- 사령: 없음 (${f.saryeongUnavailable})`);
  }
  lines.push(`- 일간합 ${rendered["일간합"]} · 월지충 ${rendered["월지충"]} · 일지관계 ${rendered["일지관계"]} · 化재료 ${rendered["化재료"]}`);
  lines.push(`- 조후: ${SEASON_KO[f.climate.season]}(${f.climate.season}) fire=${f.climate.fire} water=${f.climate.water} (일간 **포함** 표층)`);
  let mismatches = [];
  if (golden) {
    mismatches = core.STRENGTH_GOLDEN_COLUMNS.filter((name) => rendered[name] !== golden.cells[name]);
    lines.push(mismatches.length === 0
      ? `- 골든 셀 대조: 일치 ${core.STRENGTH_GOLDEN_COLUMNS.length}/${core.STRENGTH_GOLDEN_COLUMNS.length}`
      : `- **골든 셀 불일치**: ${mismatches.map((name) => `${name} 엔진「${rendered[name]}」 골든「${golden.cells[name]}」`).join(" · ")}`);
  }
  if (candidate) lines.push("- 근거: REPORT HO-2026-0923-saju-L2-stage8a-01 §2 YNY 보강 후보. 골든 편입 = GOLDEN-PILLARS 선등록 + 일진·절입 KASI 대조 뒤.");
  lines.push("");
  return { text: lines.join("\n"), combo, mismatches };
}

const goldenCells = loadGoldenCells();
const goldenCases = core.parseGoldenPillarsMarkdown(readFileSync(GOLDEN_PILLARS, "utf8"));
const sections = [];
const distribution = {};
let mismatchTotal = 0;
for (const golden of goldenCases) {
  const cellRow = goldenCells.get(golden.id);
  if (!cellRow) throw new Error(`GOLDEN-STRENGTH-FACTORS.md: ${golden.id} 행 없음`);
  const out = section({ id: golden.id, input: golden.input, expected: golden.expected, golden: cellRow });
  distribution[out.combo] = (distribution[out.combo] ?? 0) + 1;
  mismatchTotal += out.mismatches.length;
  sections.push(out.text);
}
const candidateSections = CANDIDATES.map((candidate) => section({ id: candidate.id, input: candidate.input, candidate: true }));

if (mismatchTotal > 0) {
  console.error(`골든 셀 불일치 ${mismatchTotal}건 — 팩을 쓰지 않는다.`);
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log(`골든 ${goldenCases.length}행 × ${core.STRENGTH_GOLDEN_COLUMNS.length}셀 일치, 후보 ${CANDIDATES.length}행 산출 OK`);
  process.exit(0);
}

const header = `# 8a 강약 팩터 검증 팩 (골든 ${goldenCases.length} + YNY 후보 ${CANDIDATES.length}) — LC 독립 재계산용

생성: \`node scripts/strength_verify_pack.mjs\` (코어 \`strengthFactorsOf\`, 학파 \`yeonhae\`). **손으로 고치지 않는다** — 재생성한다.
행마다 입력 → 정규화 KST → 명식 → 층 원본 → 팩터별 값과 유도 근거 → 골든 셀 대조를 적는다. 판결(신강/신약)은 없다.

## 재계산에 쓰는 정본

| 재료 | 파일 |
| --- | --- |
| 입력·명식(confirmed) | \`docs/golden/GOLDEN-PILLARS.md\` |
| 기대 셀(pending, 이 팩과 diff 0) | \`docs/golden/GOLDEN-STRENGTH-FACTORS.md\` |
| 팩터 정의 · 돕는 십신 · 계절 · 사령 경계 | \`docs/rules/STRENGTH.md\` 표 1~4 |
| 지장간 표(여기·중기·정기, 일수) | \`docs/rules/HIDDEN-STEMS.md\` |
| 합충 규칙 id | \`docs/rules/INTERACTIONS.md\` |
| 절입 시각(KST) | \`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt\` (코어 \`SOLAR_MONTH_BOUNDARIES\`) |
| 십신 | \`docs/golden/GOLDEN-TENGODS.md\` (confirmed — 득령·득지·득세의 독립 오라클) |

- 사령 경과분은 정규화 KST(시각 미상 = 12:00) 기준 **정수 분**이고 진태양시를 반영하지 않는다(STRENGTH.md \`saryeong\`).
- 득세 동률(n:n)은 득세로 본다(\`deukse.surface-majority-ge\`).
- 조후 fire/water는 일간을 **포함**한 표층, 십신·오행 개수는 일간 **제외**.

## 득령·득지·득세 8조합 × 골든 ${goldenCases.length}

| 조합 | 행 수 |
| --- | --- |
${COMBOS.map((combo) => `| ${combo} | ${distribution[combo] ?? 0} |`).join("\n")}

골든 셀 대조: ${goldenCases.length}행 × ${core.STRENGTH_GOLDEN_COLUMNS.length}셀 불일치 0.

## 골든 ${goldenCases.length}행

`;
const candidateHeader = `## YNY 보강 후보 ${CANDIDATES.length}행 (골든 아님)

REPORT HO-2026-0923-saju-L2-stage8a-01 §2. 명식은 코어 산출이며 GOLDEN-PILLARS에 없다 — 편입 전 일진·절입 KASI 대조가 필요하다. 두 행 모두 득세 동률(\`≥\`)이라 \`surface-majority-gt\` 대안에서는 YNN이 된다.

`;
writeFileSync(OUT, header + sections.join("\n") + "\n" + candidateHeader + candidateSections.map((s) => s.text).join("\n"));
console.log(`wrote ${OUT}: 골든 ${goldenCases.length}행(불일치 0) + 후보 ${CANDIDATES.length}행`);

async function loadCore() {
  const dir = mkdtempSync(join(tmpdir(), "saju-strength-pack-"));
  const outfile = join(dir, "core.mjs");
  const src = "./packages/saju-core/src";
  await build({
    stdin: {
      contents: [
        `export * from "${src}/index.ts";`,
        `export { parseGoldenPillarsMarkdown } from "${src}/golden-pillars.ts";`,
        `export { renderStrengthFactors, STRENGTH_GOLDEN_COLUMNS } from "${src}/l2/golden-strength-factors.render.ts";`
      ].join("\n"),
      resolveDir: ROOT,
      loader: "ts"
    },
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent"
  });
  try {
    return await import(pathToFileURL(outfile).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
