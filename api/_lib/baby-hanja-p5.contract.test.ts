import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiRequest, ApiResponse } from "./http.js";
import { LIMITS, validateGenerateContentRequest } from "./gemini-request.js";

/**
 * Contract: baby-naming-ai «정한 이름에 한자» (P5) request bodies pass this gateway unchanged.
 *
 * The four fixtures are byte copies of baby `app/src/test/resources/hanja-p5/request-*.json`
 * at baby `da0ed41` (git blob ids below). They are the release shape: Moshi drops the null
 * `provider` / `claudeEffort` / `claudeRoutingOptIn`, so no routing field is present.
 * When baby changes its builder, refresh with
 *   git -C <baby> show origin/main:app/src/test/resources/hanja-p5/<name>.json > api/_lib/__fixtures__/baby-hanja-p5/<name>.json
 * and update BLOB_IDS — a failing blob check here means the copy drifted from what was reviewed.
 */

const FIXTURES = {
  "request-free": "454bf2cc215b6503a2112dfff8d1349176732f8c",
  "request-free-fallback": "7e89310597cbc3e3d376d7ff237beaf81a4a7ab5",
  "request-premium": "a6b1b7e6ddf853abcfc992bcb0c0098e43d6282f",
  "request-premium-fallback": "400c80ac74c4d338d27c4193e5c9899517fe4ee8"
} as const;

type FixtureName = keyof typeof FIXTURES;
const NAMES = Object.keys(FIXTURES) as FixtureName[];

function raw(name: FixtureName): string {
  return readFileSync(fileURLToPath(new URL(`./__fixtures__/baby-hanja-p5/${name}.json`, import.meta.url)), "utf8");
}

function body(name: FixtureName): Record<string, unknown> {
  return JSON.parse(raw(name)) as Record<string, unknown>;
}

describe("baby hanja-p5 fixtures", () => {
  it.each(NAMES)("%s is the reviewed byte copy (git blob id)", async (name) => {
    const { createHash } = await import("node:crypto");
    const bytes = Buffer.from(raw(name), "utf8");
    const blob = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
    expect(blob).toBe(FIXTURES[name]);
  });
});

describe("validateGenerateContentRequest × baby hanja-p5", () => {
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

  it("keeps the meanings count lock (minItems = maxItems) and the premium letter field", () => {
    for (const name of NAMES) {
      const outcome = validateGenerateContentRequest(body(name));
      if (!outcome.ok) throw new Error(name);
      const schema = outcome.request.generationConfig?.responseSchema as {
        properties: Record<string, { minItems?: number; maxItems?: number }>;
        required: string[];
      };
      const meanings = schema.properties["meanings"];
      expect(meanings?.minItems).toBe(meanings?.maxItems);
      expect(schema.required.includes("letter")).toBe(name.startsWith("request-premium"));
    }
  });
});

// ---- Route: release-shaped calls reach Gemini once, with the app's bytes, answered verbatim ----

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

describe("/api/app/gemini-generate × baby hanja-p5 (release shape)", () => {
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
