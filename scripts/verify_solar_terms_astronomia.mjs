#!/usr/bin/env node
// Third-party check of the KASI 24기 table against an independent ephemeris.
//
// For every 절 row (the 12 month boundaries) in the KASI txt, find the instant
// when the apparent geocentric solar longitude reaches the term's longitude
// (입춘 = 315°, then +15° per term) with astronomia's VSOP87 solver, convert
// TT → UT with astronomia's ΔT model, add 9 h for KST, and compare with the
// KASI minute. KASI rounds to the minute, so a perfect match is within ±30 s;
// the review gate is |Δ| ≤ 60 s.
//
// Usage: node scripts/verify_solar_terms_astronomia.mjs [--source <txt>] [--json <out>]
// Exit 0 when every row up to 2030 is within 60 s; rows after 2030 are reported
// only (ΔT is a prediction there — the KASI header says the same).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { base, deltat, planetposition, solstice } from "astronomia";
import vsop87Bearth from "astronomia/data/vsop87Bearth";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const DEFAULT_SOURCE = resolve(REPO_ROOT, "docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt");

const GATE_LAST_YEAR = 2030; // ΔT is measured up to ~2023 and predicted a few years beyond
const TOLERANCE_SECONDS = 60;
const ROUNDING_EDGE_SECONDS = 5; // engine seconds within :30 ± 5 s → a minute flip is expected noise
const KST_OFFSET_HOURS = 9;

const TERM_NAMES = [
  "ipchun", "usu", "gyeongchip", "chunbun", "cheongmyeong", "gogu",
  "ipha", "soman", "mangjong", "haji", "soseo", "daeseo",
  "ipchu", "cheoseo", "baengno", "chubun", "hallo", "sanggang",
  "ipdong", "soseol", "daeseol", "dongji", "sohan", "daehan"
];
const ROW_PATTERN = /^\s*(\d+),\s*(\d{4}),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*$/;

function main() {
  const args = process.argv.slice(2);
  const sourcePath = argValue(args, "--source") ?? DEFAULT_SOURCE;
  const jsonOut = argValue(args, "--json");
  const includeMidTerms = args.includes("--all-terms");

  const earth = new planetposition.Planet(vsop87Bearth);
  const rows = parseKasiTxt(readFileSync(sourcePath, "utf8"))
    .filter((row) => includeMidTerms || row.kasiIndex % 2 === 1);

  const started = Date.now();
  const results = rows.map((row) => compareRow(row, earth));
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  const report = summarize(results);
  printReport(report, sourcePath, elapsed);
  if (jsonOut) {
    writeFileSync(jsonOut, JSON.stringify({ source: sourcePath, ...report, rows: results }, null, 2) + "\n");
  }
  process.exit(report.gate.failures === 0 ? 0 : 1);
}

function argValue(args, flag) {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function parseKasiTxt(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const match = ROW_PATTERN.exec(line);
    if (!match) continue;
    const [kasiIndex, year, month, day, hour, minute] = match.slice(1).map(Number);
    rows.push({ kasiIndex, term: TERM_NAMES[kasiIndex - 1], year, month, day, hour, minute });
  }
  return rows;
}

// KASI "24:00" keeps the calendar date; as seconds it is simply the next midnight.
function kasiSecondsUtc(row) {
  return Date.UTC(row.year, row.month - 1, row.day, row.hour, row.minute) / 1000 - KST_OFFSET_HOURS * 3600;
}

function compareRow(row, earth) {
  const longitudeDeg = (315 + (row.kasiIndex - 1) * 15) % 360;
  const longitudeRad = (longitudeDeg * Math.PI) / 180;
  const kasiUtc = kasiSecondsUtc(row);

  // solstice.longitude() seeds its iteration from the year's solstice/equinox
  // tables, so a January 소한 needs the previous year's December seed. Try the
  // neighbouring years and keep the solution nearest to the KASI instant.
  let best;
  for (const seedYear of [row.year - 1, row.year, row.year + 1]) {
    const jde = solstice.longitude(seedYear, earth, longitudeRad);
    const engineUtc = jdeToUtcSeconds(jde);
    const delta = engineUtc - kasiUtc;
    if (best === undefined || Math.abs(delta) < Math.abs(best.delta)) {
      best = { jde, engineUtc, delta };
    }
  }

  const engineKst = new Date((best.engineUtc + KST_OFFSET_HOURS * 3600) * 1000);
  const secondsIntoMinute = ((best.engineUtc % 60) + 60) % 60;
  return {
    term: row.term,
    kasi: `${row.year}-${pad(row.month)}-${pad(row.day)}T${pad(row.hour)}:${pad(row.minute)}`,
    engineKst: engineKst.toISOString().replace("Z", ""),
    deltaSeconds: Math.round(best.delta * 10) / 10,
    deltaT: Math.round(deltat.deltaT(decimalYear(best.jde)) * 100) / 100,
    roundingEdge: Math.abs(secondsIntoMinute - 30) <= ROUNDING_EDGE_SECONDS,
    minuteDiffers: Math.floor(best.engineUtc / 60 + 0.5) !== kasiUtc / 60,
    year: row.year
  };
}

function jdeToUtcSeconds(jde) {
  // TT → UT: subtract ΔT (seconds). astronomia's deltaT wants a decimal year.
  const jdUt = jde - deltat.deltaT(decimalYear(jde)) / 86400;
  return (jdUt - 2440587.5) * 86400; // JD of 1970-01-01T00:00Z is 2440587.5
}

function decimalYear(jd) {
  return base.JDEToJulianYear(jd);
}

function summarize(results) {
  const byBand = (predicate) => {
    const rows = results.filter(predicate);
    const abs = rows.map((row) => Math.abs(row.deltaSeconds));
    return {
      rows: rows.length,
      within60s: rows.filter((row) => Math.abs(row.deltaSeconds) <= TOLERANCE_SECONDS).length,
      maxAbsSeconds: rows.length ? Math.max(...abs) : 0,
      meanAbsSeconds: rows.length ? Math.round((abs.reduce((a, b) => a + b, 0) / rows.length) * 10) / 10 : 0,
      minuteDiffers: rows.filter((row) => row.minuteDiffers).length,
      roundingEdge: rows.filter((row) => row.roundingEdge).length,
      over60s: rows.filter((row) => Math.abs(row.deltaSeconds) > TOLERANCE_SECONDS)
        .map(({ term, kasi, engineKst, deltaSeconds }) => ({ term, kasi, engineKst, deltaSeconds }))
    };
  };

  const gateBand = byBand((row) => row.year <= GATE_LAST_YEAR);
  return {
    tolerance: TOLERANCE_SECONDS,
    gate: { lastYear: GATE_LAST_YEAR, ...gateBand, failures: gateBand.rows - gateBand.within60s },
    all: byBand(() => true),
    band1950to1999: byBand((row) => row.year >= 1950 && row.year <= 1999),
    band2031to2100: byBand((row) => row.year > GATE_LAST_YEAR)
  };
}

function printReport(report, sourcePath, elapsed) {
  const line = (label, band) =>
    `${label.padEnd(14)} rows ${String(band.rows).padStart(5)}  ≤60s ${String(band.within60s).padStart(5)} ` +
    `(${band.rows ? ((100 * band.within60s) / band.rows).toFixed(1) : "0.0"}%)  max |Δ| ${band.maxAbsSeconds}s  ` +
    `mean |Δ| ${band.meanAbsSeconds}s  minute flips ${band.minuteDiffers}  rounding-edge ${band.roundingEdge}`;

  console.log(`astronomia 4.2.0 (VSOP87B earth, ΔT = astronomia/deltat) vs ${sourcePath}`);
  console.log(`elapsed ${elapsed}s, tolerance ${report.tolerance}s, gate = rows ≤ ${report.gate.lastYear}`);
  console.log(line("all", report.all));
  console.log(line(`≤${report.gate.lastYear} (gate)`, report.gate));
  console.log(line("1950-1999", report.band1950to1999));
  console.log(line(`${report.gate.lastYear + 1}-2100`, report.band2031to2100));
  for (const [label, band] of [["gate", report.gate], ["2031-2100", report.band2031to2100]]) {
    if (band.over60s.length) {
      console.log(`\n> ${TOLERANCE_SECONDS}s in ${label}:`);
      for (const row of band.over60s) {
        console.log(`  ${row.term.padEnd(12)} KASI ${row.kasi}  engine ${row.engineKst}  Δ ${row.deltaSeconds}s`);
      }
    }
  }
  console.log(`\ngate: ${report.gate.failures === 0 ? "PASS" : "FAIL"} (${report.gate.failures} rows over ${TOLERANCE_SECONDS}s up to ${report.gate.lastYear})`);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

main();
