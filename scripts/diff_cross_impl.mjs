#!/usr/bin/env node
// Cross-implementation differential test: saju-core ↔ lunar-typescript (6tail, MIT, zero deps, offline).
// HO-2026-0923-saju-cross-impl-diff-01. The goal is not agreement but an explanation for every disagreement:
// the gate is `unexplained === 0`. Results and the policy alignment are documented in docs/CROSS-IMPL-DIFF.md.
//
// Usage: node scripts/diff_cross_impl.mjs [--seed 20260923] [--random 5000] [--boundary 500] [--lunar 1000] [--json <path>]
//
// saju-core is TypeScript; esbuild (already a devDependency via vite) bundles the needed entry points into a
// temporary ESM file so this script runs on plain node without a TS runner.

import { build } from "esbuild";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { LunarUtil, Lunar, Solar } from "lunar-typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));
const SEED = Number(args.seed ?? 20260923);
const N_RANDOM = Number(args.random ?? 5000);
const N_BOUNDARY = Number(args.boundary ?? 500);
const N_LUNAR = Number(args.lunar ?? 1000);
/** A disagreement on which side of a 절 an instant falls is explained when the two 절 instants are this close. */
const TERM_TOLERANCE_MIN = 3;
const REFERENCE_DATE = "2026-09-23";
/**
 * Korean lunar months whose start (solar date) KARI getSolCalInfo confirmed where lunar-typescript (Chinese calendar,
 * UTC+8 new moon) disagrees — the recorded lookup in scripts/cross-impl-kari-lunar-months.json. A lunar→solar
 * difference in such a month, or in the month before it (whose length then differs), is `lunar-table`; any other
 * difference is unexplained.
 */
const KARI_CONFIRMED_KOREAN_MONTH_STARTS = new Set(
  JSON.parse(readFileSync(join(ROOT, "scripts/cross-impl-kari-lunar-months.json"), "utf8"))
    .months.filter((row) => row.kari === row.koreanMonthStart)
    .map((row) => row.koreanMonthStart)
);

const started = Date.now();
const core = await loadCore();

if (args["lunar-month-diffs"]) {
  // Every Korean lunar month (saju-core table, 1900-2050) whose first day lunar-typescript places elsewhere or cannot
  // build — the list scripts/cross-impl-kari-lunar-months.json is checked against KARI for.
  const rows = [];
  for (let year = core.LUNAR_MIN_YEAR; year <= core.LUNAR_MAX_YEAR; year += 1) {
    const leap = core.leapMonth(year);
    for (let month = 1; month <= 12; month += 1) {
      for (const isLeap of leap === month ? [false, true] : [false]) {
        const ours = core.lunarToSolar(year, month, 1, isLeap);
        if (!ours) continue;
        let theirs;
        try {
          const s = Lunar.fromYmd(year, isLeap ? -month : month, 1).getSolar();
          theirs = `${s.getYear()}-${String(s.getMonth()).padStart(2, "0")}-${String(s.getDay()).padStart(2, "0")}`;
        } catch (error) {
          theirs = `throws: ${error.message}`;
        }
        const oursStr = `${ours.year}-${String(ours.month).padStart(2, "0")}-${String(ours.day).padStart(2, "0")}`;
        if (oursStr !== theirs) rows.push({ lunarYear: year, lunarMonth: month, isLeapMonth: isLeap, koreanMonthStart: oursStr, lunarTypescript: theirs });
      }
    }
  }
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

// ------------------------------------------------------------------ labels & time helpers
const STEM_H = "甲乙丙丁戊己庚辛壬癸";
const BRANCH_H = "子丑寅卯辰巳午未申酉戌亥";
const TEN_GOD_H = { 比肩: "bigyeon", 劫财: "geopjae", 食神: "siksin", 伤官: "sanggwan", 偏财: "pyeonjae", 正财: "jeongjae", 七杀: "pyeongwan", 正官: "jeonggwan", 偏印: "pyeonin", 正印: "jeongin" };
const TERM_H = { ipchun: "立春", gyeongchip: "惊蛰", cheongmyeong: "清明", ipha: "立夏", mangjong: "芒种", soseo: "小暑", ipchu: "立秋", baengno: "白露", hallo: "寒露", ipdong: "立冬", daeseol: "大雪", sohan: "小寒" };
const TERM_ALIAS = { 小寒: "XIAO_HAN", 立春: "LI_CHUN", 惊蛰: "JING_ZHE", 大雪: "DA_XUE" };

const stemOf = (h) => core.STEMS[STEM_H.indexOf(h)];
const branchOf = (h) => core.BRANCHES[BRANCH_H.indexOf(h)];
const pillarOf = (ganZhi) => `${stemOf(ganZhi[0])}-${branchOf(ganZhi[1])}`;
const label = (p) => (p ? `${p.stem}-${p.branch}` : "-");

/** Wall-clock minutes since 1970 (the wall clock is treated as UTC for arithmetic only). */
const toMin = (y, mo, d, h = 0, mi = 0, s = 0) => Date.UTC(y, mo - 1, d, h, mi, s) / 60000;
const fromMin = (m) => {
  const t = new Date(Math.round(m) * 60000);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate(), hour: t.getUTCHours(), minute: t.getUTCMinutes() };
};
const isoMin = (s) => toMin(+s.slice(0, 4), +s.slice(5, 7), +s.slice(8, 10), +s.slice(11, 13), +s.slice(14, 16));
const pad = (n) => String(n).padStart(2, "0");
const dateStr = (p) => `${p.year}-${pad(p.month)}-${pad(p.day)}`;
const timeStr = (p) => `${pad(p.hour)}:${pad(p.minute)}`;
const solarMin = (s) => toMin(s.getYear(), s.getMonth(), s.getDay(), s.getHour(), s.getMinute(), s.getSecond());

// ------------------------------------------------------------------ samples
const rand = mulberry32(SEED);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const SEXES = ["male", "female", "other"];
const samples = [];

const RANGE_FROM = toMin(1920, 1, 6);
const RANGE_TO = toMin(2100, 12, 7, 23, 59);
for (let i = 0; i < N_RANDOM; i += 1) {
  const p = fromMin(RANGE_FROM + Math.floor(rand() * (RANGE_TO - RANGE_FROM + 1)));
  samples.push({ group: "random", input: { birthDate: dateStr(p), birthTime: timeStr(p), timezone: "Asia/Seoul", sex: pick(SEXES) } });
}

for (const golden of core.parseGoldenPillarsMarkdown(readFileSync(join(ROOT, "docs/golden/GOLDEN-PILLARS.md"), "utf8"))) {
  const { options: _options, birthPlace: _place, ...input } = golden.input; // default policy on both sides (HO §2-1)
  samples.push({ group: "golden", id: golden.id, input });
}

const boundaries = core.SOLAR_MONTH_BOUNDARIES;
const wall = (m, sex = pick(SEXES)) => ({ birthDate: dateStr(fromMin(m)), birthTime: timeStr(fromMin(m)), timezone: "Asia/Seoul", sex });
const nTerm = Math.round(N_BOUNDARY * 0.6);
const nMidnight = Math.round(N_BOUNDARY * 0.2);
const nDst = Math.round(N_BOUNDARY * 0.12);
const nHalf = N_BOUNDARY - nTerm - nMidnight - nDst;
for (let i = 0; i < nTerm; i += 1) {
  const b = boundaries[1 + Math.floor(rand() * (boundaries.length - 1))];
  samples.push({ group: "boundary:term", input: wall(isoMin(b.startsAt) + Math.floor(rand() * 7) - 3) });
}
for (let i = 0; i < nMidnight; i += 1) {
  const day = toMin(1920, 2, 6) + Math.floor(rand() * ((RANGE_TO - toMin(1920, 2, 6)) / 1440)) * 1440;
  const anchor = rand() < 0.5 ? day + 23 * 60 : day + 24 * 60;
  samples.push({ group: "boundary:midnight", input: wall(anchor + Math.floor(rand() * 5) - 2) });
}
const transitions = core.KOREA_OFFSET_INTERVALS.filter((row) => row.kind === "dst" && row.fromUtc >= "1920").flatMap((row) => [
  isoMin(row.fromUtc) + 540,
  ...(row.toUtc ? [isoMin(row.toUtc) + 540] : [])
]);
for (let i = 0; i < nDst; i += 1) samples.push({ group: "boundary:dst", input: wall(pick(transitions) + Math.floor(rand() * 241) - 120) });
const halfFrom = toMin(1954, 3, 21, 1);
const halfTo = toMin(1961, 8, 9, 23, 59);
for (let i = 0; i < nHalf; i += 1) samples.push({ group: "boundary:utc+8:30", input: wall(halfFrom + Math.floor(rand() * (halfTo - halfFrom))) });

// ------------------------------------------------------------------ comparison
const counts = { samples: 0, coreRejects: 0, pillarFields: 0, pillarMatch: 0 };
const classes = { "solar-term-minute": 0, "ja-hour-policy": 0, "lunar-table": 0, "hidden-stem-table": 0, unexplained: 0 };
const unexplained = [];
const explainedExamples = {};
const goldenExplained = [];
const coreRejects = {};
const l2 = { tenGodStems: [0, 0], hiddenStems: [0, 0], chung: [0, 0], daeunDirection: [0, 0], daeunDistance: [0, 0], daeunSequence: [0, 0] };
const daeunDistanceDiffs = [];

// Hidden-stem tables compared once: lunar-typescript uses the 자평 table (子 = 癸 only), so compare it to saju-core's japyeong school.
const hiddenStemTableDiff = {};
for (const branch of core.BRANCHES) {
  const ours = core.hiddenStemList(branch, "japyeong").map((entry) => entry.stem).sort().join(" ");
  const theirs = LunarUtil.ZHI_HIDE_GAN[BRANCH_H[core.BRANCHES.indexOf(branch)]].map(stemOf).sort().join(" ");
  if (ours !== theirs) hiddenStemTableDiff[branch] = { japyeong: ours, lunarTypescript: theirs };
}

function explain(kind, sample, detail) {
  classes[kind] += 1;
  if (kind === "unexplained") unexplained.push({ group: sample.group, id: sample.id, input: sample.input, ...detail });
  else if (sample.group === "golden") goldenExplained.push({ id: sample.id, kind, ...detail });
  else if (!explainedExamples[kind] || explainedExamples[kind].length < 5) (explainedExamples[kind] ??= []).push({ input: sample.input, ...detail });
}

function nearestBoundary(minute) {
  let lo = 0;
  let hi = boundaries.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (isoMin(boundaries[mid].startsAt) <= minute) lo = mid;
    else hi = mid;
  }
  const a = boundaries[lo];
  const b = boundaries[hi];
  return Math.abs(isoMin(a.startsAt) - minute) <= Math.abs(isoMin(b.startsAt) - minute) ? a : b;
}

/** lunar-typescript's instant for the same 절, converted from its UTC+8 clock to KST (seconds kept as a fraction). */
function lunarTermKst(boundary) {
  const at = isoMin(boundary.startsAt);
  const p = fromMin(at);
  const table = Solar.fromYmdHms(p.year, p.month, p.day, 12, 0, 0).getLunar().getJieQiTable();
  const name = TERM_H[boundary.term];
  let best;
  for (const [key, solar] of Object.entries(table)) {
    if (key !== name && key !== TERM_ALIAS[name]) continue;
    const kst = solarMin(solar) + 60;
    if (best === undefined || Math.abs(kst - at) < Math.abs(best - at)) best = kst;
  }
  return best;
}

for (const sample of samples) {
  counts.samples += 1;
  let result;
  let kst;
  try {
    result = core.calculatePillarsWithResolution(sample.input);
    kst = core.resolveBirthKst(sample.input);
  } catch (error) {
    counts.coreRejects += 1;
    const key = String(error.message).replace(/\d{4}/g, "YYYY");
    coreRejects[key] = (coreRejects[key] ?? 0) + 1;
    continue;
  }
  const known = kst.hour !== undefined;
  const at = toMin(kst.year, kst.month, kst.day, known ? kst.hour : 12, known ? kst.minute : 0);
  // Policy alignment (HO §2-1): lunar-typescript computes 절 instants on the UTC+8 clock, so year/month are read at
  // KST−60; day/hour are wall-clock quantities and are read at KST. Its default sect 2 keeps the day at 23:xx (= late).
  const ymP = fromMin(at - 60);
  const ym = Solar.fromYmdHms(ymP.year, ymP.month, ymP.day, ymP.hour, ymP.minute, 0).getLunar().getEightChar();
  const dt = Solar.fromYmdHms(kst.year, kst.month, kst.day, known ? kst.hour : 12, known ? kst.minute : 0, 0).getLunar().getEightChar();
  const ours = result.pillars;
  const theirs = { year: pillarOf(ym.getYear()), month: pillarOf(ym.getMonth()), day: pillarOf(dt.getDay()), time: known ? pillarOf(dt.getTime()) : "-" };

  let allMatch = true;
  let termExplained = false;
  for (const field of ["year", "month", "day", "time"]) {
    if (field === "time" && !known) continue;
    counts.pillarFields += 1;
    if (label(ours[field]) === theirs[field]) {
      counts.pillarMatch += 1;
      continue;
    }
    allMatch = false;
    const detail = { field, ours: label(ours[field]), theirs: theirs[field] };
    if (field === "year" || field === "month") {
      if (termExplained) continue; // year and month flip together at 입춘 — one explanation covers both
      const b = nearestBoundary(at);
      const coreAt = isoMin(b.startsAt);
      const lunarAt = lunarTermKst(b);
      const between = lunarAt !== undefined && at >= Math.min(coreAt, lunarAt) && at <= Math.max(coreAt, lunarAt);
      if (between && Math.abs(lunarAt - coreAt) <= TERM_TOLERANCE_MIN) {
        termExplained = true;
        explain("solar-term-minute", sample, { ...detail, term: b.term, coreAt: b.startsAt, lunarMinusCoreMin: +(lunarAt - coreAt).toFixed(2) });
      } else {
        explain("unexplained", sample, { ...detail, term: b.term, coreAt: b.startsAt, lunarMinusCoreMin: lunarAt === undefined ? null : +(lunarAt - coreAt).toFixed(2) });
      }
    } else if (field === "time" && kst.hour === 23 && ours.time.branch === "ja" && theirs.time.endsWith("-ja")) {
      // 23:xx 子시: saju-core takes the hour stem from the same day's stem (야자시); lunar-typescript sect 2 keeps the
      // day pillar but starts the hour stem from the next day's stem.
      const hourStem = (dayStem) => core.STEMS[((core.STEMS.indexOf(dayStem) % 5) * 2) % 10];
      const nextDayStem = core.STEMS[(core.STEMS.indexOf(ours.day.stem) + 1) % 10];
      if (ours.time.stem === hourStem(ours.day.stem) && theirs.time.startsWith(`${hourStem(nextDayStem)}-`)) explain("ja-hour-policy", sample, detail);
      else explain("unexplained", sample, detail);
    } else {
      explain("unexplained", sample, detail);
    }
  }

  // ---- L2, only where the pillars agree (a disagreement upstream is already classified above)
  if (!allMatch) continue;
  // 십신 from lunar-typescript's own tables (LunarUtil.SHI_SHEN / ZHI_HIDE_GAN) keyed on the agreed day stem — its
  // EightChar objects cannot be used directly because the year/month instance is read at KST−60 (another day at 00:xx).
  const dayH = STEM_H[core.STEMS.indexOf(ours.day.stem)];
  const tenGodH = (stem) => TEN_GOD_H[LunarUtil.SHI_SHEN[dayH + STEM_H[core.STEMS.indexOf(stem)]]];
  const tg = core.tenGodsOfChart(ours);
  const keys = known ? ["year", "month", "day", "time"] : ["year", "month", "day"];
  for (const key of keys.filter((k) => k !== "day")) {
    l2.tenGodStems[1] += 1;
    if (tg[key].stem === tenGodH(ours[key].stem)) l2.tenGodStems[0] += 1;
    else explain("unexplained", sample, { field: `tenGod.${key}.stem`, ours: tg[key].stem, theirs: tenGodH(ours[key].stem) });
  }
  const tgj = core.tenGodsOfChart(ours, "japyeong");
  for (const key of keys) {
    l2.hiddenStems[1] += 1;
    const oursList = tgj[key].branchAll.map((entry) => `${entry.stem}=${entry.tenGod}`).sort().join(" ");
    const theirsList = LunarUtil.ZHI_HIDE_GAN[BRANCH_H[core.BRANCHES.indexOf(ours[key].branch)]].map((stem) => `${stemOf(stem)}=${tenGodH(stemOf(stem))}`).sort().join(" ");
    if (oursList === theirsList) l2.hiddenStems[0] += 1;
    else if (hiddenStemTableDiff[ours[key].branch]) explain("hidden-stem-table", sample, { field: `hiddenStems.${key}`, ours: oursList, theirs: theirsList });
    else explain("unexplained", sample, { field: `hiddenStems.${key}`, ours: oursList, theirs: theirsList });
  }

  const theirsChung = [];
  for (let i = 0; i < keys.length; i += 1) {
    for (let j = i + 1; j < keys.length; j += 1) {
      const a = ours[keys[i]].branch;
      const b = ours[keys[j]].branch;
      if (LunarUtil.CHONG[BRANCH_H.indexOf(BRANCH_H[core.BRANCHES.indexOf(a)])] === BRANCH_H[core.BRANCHES.indexOf(b)]) theirsChung.push(`${keys[i]}-${keys[j]}`);
    }
  }
  const oursChung = core.interactionsOfChart(ours).branches.filter((entry) => entry.kind === "chung").map((entry) => entry.pillars.join("-"));
  l2.chung[1] += 1;
  if (theirsChung.sort().join() === oursChung.sort().join()) l2.chung[0] += 1;
  else explain("unexplained", sample, { field: "chung", ours: oursChung.join(" "), theirs: theirsChung.join(" ") });

  if (!known) continue;
  const block = core.daeunOf(ours, kst, sample.input.sex, { referenceDate: REFERENCE_DATE });
  if (core.isDaeunUnavailable(block)) continue;
  for (const direction of ["forward", "backward"]) {
    const reading = block[direction];
    if (!reading) continue;
    const genders = sample.input.sex === "male" ? [1] : sample.input.sex === "female" ? [0] : [1, 0];
    const yun = genders.map((gender) => ym.getYun(gender, 2)).find((candidate) => candidate.isForward() === (direction === "forward"));
    l2.daeunDirection[1] += 1;
    if (!yun) {
      explain("unexplained", sample, { field: "daeun.direction", ours: direction, theirs: "none" });
      continue;
    }
    l2.daeunDirection[0] += 1;
    // sect 2 decomposes the minute distance as 1년 = 4320분, 1달 = 360분, 1일 = 12분, 1시간 = 0.5분 → exact minutes.
    const theirsMinutes = yun.getStartYear() * 4320 + yun.getStartMonth() * 360 + yun.getStartDay() * 12 + yun.getStartHour() / 2;
    const diff = theirsMinutes - reading.distanceMinutes;
    daeunDistanceDiffs.push(diff);
    l2.daeunDistance[1] += 1;
    // The two distances are measured to two instants of the same 절 (KASI minute vs lunar-typescript seconds);
    // what remains after removing that gap must be under one minute (lunar-typescript floors to whole minutes).
    const refAt = isoMin(reading.referenceTerm.at);
    const lunarRefAt = lunarTermKst({ term: reading.referenceTerm.term, startsAt: reading.referenceTerm.at });
    const termGap = lunarRefAt === undefined ? NaN : (direction === "forward" ? 1 : -1) * (lunarRefAt - refAt);
    const residual = diff - termGap;
    const detail = { field: "daeun.distanceMinutes", ours: reading.distanceMinutes, theirs: theirsMinutes, term: reading.referenceTerm.term, termGapMin: +termGap.toFixed(2) };
    if (diff === 0) l2.daeunDistance[0] += 1;
    else if (Math.abs(residual) < 1 && Math.abs(termGap) <= TERM_TOLERANCE_MIN) explain("solar-term-minute", sample, detail);
    else explain("unexplained", sample, detail);
    const n = Math.min(8, reading.periods.length);
    const oursSeq = reading.periods.slice(0, n).map(label).join(" ");
    const theirsSeq = yun.getDaYun(n + 1).slice(1).map((period) => pillarOf(period.getGanZhi())).join(" ");
    l2.daeunSequence[1] += 1;
    if (oursSeq === theirsSeq) l2.daeunSequence[0] += 1;
    else explain("unexplained", sample, { field: "daeun.periods", ours: oursSeq, theirs: theirsSeq });
  }
}

// ------------------------------------------------------------------ lunar → solar
const lunarStats = { compared: 0, match: 0 };
for (let i = 0; i < N_LUNAR; i += 1) {
  const year = core.LUNAR_MIN_YEAR + 1 + Math.floor(rand() * (core.LUNAR_MAX_YEAR - core.LUNAR_MIN_YEAR - 1));
  const leap = core.leapMonth(year);
  const isLeap = leap > 0 && rand() < 0.15;
  const month = isLeap ? leap : 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * core.daysInLunarMonth(year, month, isLeap));
  const ours = core.lunarToSolar(year, month, day, isLeap);
  if (!ours) continue;
  lunarStats.compared += 1;
  const oursStr = `${ours.year}-${pad(ours.month)}-${pad(ours.day)}`;
  let theirsStr;
  try {
    const s = Lunar.fromYmd(year, isLeap ? -month : month, day).getSolar();
    theirsStr = `${s.getYear()}-${pad(s.getMonth())}-${pad(s.getDay())}`;
  } catch (error) {
    theirsStr = `throws: ${error.message}`;
  }
  const sample = { group: "lunar", input: { lunar: `${year}-${pad(month)}-${pad(day)}${isLeap ? " (윤)" : ""}` } };
  if (oursStr === theirsStr) lunarStats.match += 1;
  else {
    const start = koreanMonthStart(year, month, isLeap);
    const next = addDays(start, core.daysInLunarMonth(year, month, isLeap));
    const detail = { field: "solarDate", ours: oursStr, theirs: theirsStr, koreanMonthStart: start, nextKoreanMonthStart: next };
    if (KARI_CONFIRMED_KOREAN_MONTH_STARTS.has(start) || KARI_CONFIRMED_KOREAN_MONTH_STARTS.has(next)) explain("lunar-table", sample, detail);
    else explain("unexplained", sample, detail);
  }
}

function koreanMonthStart(year, month, isLeap) {
  const first = core.lunarToSolar(year, month, 1, isLeap);
  return `${first.year}-${pad(first.month)}-${pad(first.day)}`;
}

function addDays(date, days) {
  return dateStr(fromMin(isoMin(`${date}T00:00`) + days * 1440));
}

// ------------------------------------------------------------------ 절 instants: KASI (core) vs lunar-typescript, every 12절
const termDiffs = boundaries.map((b) => lunarTermKst(b) - isoMin(b.startsAt)).filter((d) => Number.isFinite(d));
const boundaryTermDiffs = samples.filter((s) => s.group === "boundary:term").map((s) => {
  const at = isoMin(`${s.input.birthDate}T${s.input.birthTime}`);
  const b = nearestBoundary(at);
  return lunarTermKst(b) - isoMin(b.startsAt);
});

const summary = {
  tool: "scripts/diff_cross_impl.mjs",
  crossImplementation: "lunar-typescript@1.8.6 (6tail, MIT)",
  seed: SEED,
  groups: Object.fromEntries(["random", "golden", "boundary:term", "boundary:midnight", "boundary:dst", "boundary:utc+8:30"].map((g) => [g, samples.filter((s) => s.group === g).length])),
  samples: counts.samples,
  coreRejects: { total: counts.coreRejects, byMessage: coreRejects },
  pillars: { compared: counts.pillarFields, match: counts.pillarMatch, rate: ratio(counts.pillarMatch, counts.pillarFields) },
  lunarToSolar: { ...lunarStats, rate: ratio(lunarStats.match, lunarStats.compared) },
  l2: Object.fromEntries(Object.entries(l2).map(([key, [match, total]]) => [key, { match, total, rate: ratio(match, total) }])),
  classes,
  termInstantKasiVsLunar: { allBoundaries: stats(termDiffs), boundarySamples: stats(boundaryTermDiffs) },
  daeunDistanceLunarMinusCore: stats(daeunDistanceDiffs),
  hiddenStemTableDiff,
  goldenExplained,
  explainedExamples,
  unexplained,
  elapsedSeconds: +((Date.now() - started) / 1000).toFixed(1)
};

if (args.json) writeFileSync(resolve(args.json), JSON.stringify(summary, null, 2) + "\n");
const { explainedExamples: _e, unexplained: _u, goldenExplained: _g, ...headline } = summary;
console.log(JSON.stringify(headline, null, 2));
if (unexplained.length > 0) {
  console.error(`\nunexplained = ${unexplained.length} (first 20):`);
  for (const row of unexplained.slice(0, 20)) console.error(JSON.stringify(row));
}
console.log(`\nunexplained = ${unexplained.length} → ${unexplained.length === 0 ? "PASS" : "FAIL"} (${summary.elapsedSeconds}s)`);
process.exit(unexplained.length === 0 ? 0 : 1);

// ------------------------------------------------------------------ utilities
function ratio(a, b) {
  return b === 0 ? null : +((a / b) * 100).toFixed(3);
}

function stats(values) {
  if (values.length === 0) return { n: 0 };
  const abs = values.map(Math.abs);
  return { n: values.length, maxAbsMin: +Math.max(...abs).toFixed(3), meanAbsMin: +(abs.reduce((s, v) => s + v, 0) / abs.length).toFixed(3), meanSignedMin: +(values.reduce((s, v) => s + v, 0) / values.length).toFixed(3) };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") === false ? argv[++i] : "true";
  return out;
}

async function loadCore() {
  const dir = mkdtempSync(join(tmpdir(), "saju-diff-"));
  const outfile = join(dir, "core.mjs");
  const src = "./packages/saju-core/src";
  await build({
    stdin: {
      contents: [
        `export * from "${src}/index.ts";`,
        `export { parseGoldenPillarsMarkdown } from "${src}/golden-pillars.ts";`,
        `export { SOLAR_MONTH_BOUNDARIES } from "${src}/solar-terms.ts";`
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
