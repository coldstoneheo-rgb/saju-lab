import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiRequest, ApiResponse } from "./http.js";
import { LIMITS, validateGenerateContentRequest } from "./gemini-request.js";

/**
 * Contract: the app's "hanja meaning" requests (free / premium × saju known / fallback) pass
 * `/api/app/gemini-generate` unchanged.
 *
 * This repo is PUBLIC and the caller's prompts are not, so the fixtures carry **structure only**,
 * produced by `scripts/mask-gateway-fixture.mjs` from the caller's request snapshots (app commit
 * da0ed41): every human-readable string (system instruction, user block, schema descriptions)
 * is replaced by "x" of the same JSON-escaped UTF-8 byte length. Kept as-is: keys and nesting,
 * numbers (temperature, minItems/maxItems), schema `type`, `responseMimeType`, and the field
 * names in `required` / `propertyOrdering`. Release shape: no `provider` / `claudeEffort` /
 * `claudeRoutingOptIn` (the app's JSON adapter drops nulls).
 *
 * Structure match with the originals was checked when masking: a shape function (strings → one
 * placeholder, kept keys verbatim) gave equal output for all four, and the serialized byte length
 * is identical (SERIALIZED_BYTES below). Masked strings are longer in characters than the
 * originals (1 byte = 1 char), so the per-field character caps are checked more strictly here.
 * When the caller changes its builder, re-run the script on the new snapshots and update this table.
 */

const FIXTURES = {
  "request-free": { serializedBytes: 2812, meanings: 4, letter: false },
  "request-free-fallback": { serializedBytes: 2809, meanings: 4, letter: false },
  "request-premium": { serializedBytes: 3891, meanings: 9, letter: true },
  "request-premium-fallback": { serializedBytes: 3837, meanings: 9, letter: true }
} as const;

type FixtureName = keyof typeof FIXTURES;
const NAMES = Object.keys(FIXTURES) as FixtureName[];

function raw(name: FixtureName): string {
  return readFileSync(fileURLToPath(new URL(`./__fixtures__/gateway-hanja-contract/${name}.json`, import.meta.url)), "utf8");
}

function body(name: FixtureName): Record<string, unknown> {
  return JSON.parse(raw(name)) as Record<string, unknown>;
}

describe("gateway-hanja-contract fixtures", () => {
  it.each(NAMES)("%s is masked (ASCII only) and keeps the original serialized size", (name) => {
    expect(/[^\x20-\x7e]/.test(raw(name))).toBe(false);
    expect(Buffer.byteLength(JSON.stringify(body(name)), "utf8")).toBe(FIXTURES[name].serializedBytes);
  });
});

describe("validateGenerateContentRequest × hanja meaning requests", () => {
  it.each(NAMES)("%s passes with nothing dropped and no routing fields", (name) => {
    const outcome = validateGenerateContentRequest(body(name));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    // The narrowed request is what reaches Gemini: equal to the app's body means the allowlist drops nothing.
    expect(outcome.request).toEqual(body(name));
    expect(outcome.provider).toBe("gemini");
    expect(outcome.providerExplicit).toBe(false);
    expect(outcome.claudeRoutingOptIn).toBe(false);
    expect(outcome.attempt).toBeUndefined();
    expect(Buffer.byteLength(JSON.stringify(outcome.request), "utf8")).toBeLessThan(LIMITS.maxSerializedBytes);
  });

  it.each(NAMES)("%s with the app's failure retry marker (attempt 2) still passes unchanged", (name) => {
    const outcome = validateGenerateContentRequest({ ...body(name), attempt: 2 });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.attempt).toBe(2);
    expect(outcome.request).toEqual(body(name));
  });

  it.each(NAMES)("%s keeps the meanings count lock and the premium-only letter field", (name) => {
    const outcome = validateGenerateContentRequest(body(name));
    if (!outcome.ok) throw new Error(name);
    const schema = outcome.request.generationConfig?.responseSchema as {
      properties: Record<string, { minItems?: number; maxItems?: number }>;
      required: string[];
    };
    const meanings = schema.properties["meanings"];
    expect(meanings?.minItems).toBe(FIXTURES[name].meanings);
    expect(meanings?.maxItems).toBe(FIXTURES[name].meanings);
    expect(schema.required.includes("letter")).toBe(FIXTURES[name].letter);
  });
});

// ---- Route: release-shaped calls reach Gemini once, with the app's content, answered verbatim ----

const { default: handler } = await import("../app/gemini-generate.js");

interface Captured {
  status: number;
  body: unknown;
}

function makeRes(): { res: ApiResponse; captured: Captured } {
  const captured: Captured = { status: 0, body: undefined };
  const res: ApiResponse = {
    status(code: number) {
      captured.status = code;
      return res;
    },
    json(payload: unknown) {
      captured.body = payload;
    },
    setHeader() {}
  };
  return { res, captured };
}

let ipCounter = 0;
function makeReq(payload: unknown): ApiRequest {
  ipCounter += 1;
  return { method: "POST", headers: { "x-forwarded-for": `10.15.0.${ipCounter}` }, body: payload };
}

const geminiAnswer = { candidates: [{ content: { parts: [{ text: '{"meanings":[]}' }] } }] };
const savedEnv = { ...process.env };

beforeEach(() => {
  process.env["GEMINI_API_KEY"] = "test-gemini-key";
  delete process.env["ANTHROPIC_API_KEY"];
  delete process.env["CLAUDE_ROUTING_ENABLED"];
  delete process.env["LLM_ROUTING_OVERRIDE"];
  delete process.env["GLOBAL_CONFIG"];
  delete process.env["EDGE_CONFIG"];
});

afterEach(() => {
  process.env = { ...savedEnv };
  vi.unstubAllGlobals();
});

describe("/api/app/gemini-generate × hanja meaning requests (release shape)", () => {
  it.each([
    ...NAMES.map((name) => [name, undefined] as const),
    ...NAMES.map((name) => [name, 2] as const)
  ])("%s attempt=%s → one Gemini call with the app's content, 200 verbatim", async (name, attempt) => {
    const fetchMock = vi.fn(async (_url: string, _init: { body: string }) => new Response(JSON.stringify(geminiAnswer)));
    vi.stubGlobal("fetch", fetchMock);

    const { res, captured } = makeRes();
    await handler(makeReq(attempt === undefined ? body(name) : { ...body(name), attempt }), res);

    expect(captured.status).toBe(200);
    expect(captured.body).toEqual(geminiAnswer);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toContain("generativelanguage.googleapis.com");
    // Same content as the app sent (the rebuilt object orders top-level keys its own way, as for every caller).
    expect(JSON.parse(init.body)).toEqual(body(name));
  });
});
