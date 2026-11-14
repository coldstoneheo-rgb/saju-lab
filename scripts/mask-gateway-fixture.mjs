#!/usr/bin/env node
/**
 * Masks a gateway request body so it can live in this PUBLIC repo as a test fixture.
 *
 * Callers' request bodies (e.g. a private app's prompts) must not be copied here. This keeps the
 * **structure** the gateway validates — keys, nesting, arrays, numbers, booleans, schema `type`,
 * `responseMimeType`, `format`, and the field names in `required` / `propertyOrdering` — and
 * replaces every other string with "x" repeated to the original's JSON-escaped UTF-8 byte length,
 * so the serialized size (the 96 KiB check) is unchanged.
 *
 * Usage: node scripts/mask-gateway-fixture.mjs <in.json> <out.json>
 * Prints the original and masked serialized byte lengths; exits 1 if they differ.
 */
import { readFileSync, writeFileSync } from "node:fs";

const KEEP_STRING_KEYS = new Set(["type", "responseMimeType", "format"]);
const KEEP_ARRAY_KEYS = new Set(["required", "propertyOrdering"]);

function fill(text) {
  const escaped = JSON.stringify(text);
  return "x".repeat(Buffer.byteLength(escaped, "utf8") - 2);
}

function mask(value, key) {
  if (typeof value === "string") {
    return KEEP_STRING_KEYS.has(key) ? value : fill(value);
  }
  if (Array.isArray(value)) {
    return KEEP_ARRAY_KEYS.has(key) ? value : value.map((entry) => mask(entry, undefined));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mask(v, k)]));
  }
  return value;
}

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/mask-gateway-fixture.mjs <in.json> <out.json>");
  process.exit(2);
}
const original = JSON.parse(readFileSync(input, "utf8"));
const masked = JSON.stringify(mask(original, undefined));
const before = Buffer.byteLength(JSON.stringify(original), "utf8");
const after = Buffer.byteLength(masked, "utf8");
writeFileSync(output, masked);
console.log(`${output}: serialized ${before} -> ${after} bytes`);
process.exit(before === after ? 0 : 1);
