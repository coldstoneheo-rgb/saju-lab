import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../app/gemini-generate.js";
import type { ApiRequest, ApiResponse } from "./http.js";
import { validateGenerateContentRequest } from "./gemini-request.js";
import { babyLetterRequest, babyNamingRequest } from "./baby-request-fixtures.js";

/**
 * P1 regression lock for the Gemini path (docs/DESIGN-dualllm-saju-baby.md §6-1).
 *
 * These tests were committed **before** the Claude path existed and must pass,
 * unedited, after it. The snapshot file is the byte-level record of what the
 * gateway sent to Gemini and returned to the app at that point; any diff to it in
 * a later commit is a P1 violation, not a snapshot to update.
 */

interface Captured {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

function makeRes(): { res: ApiResponse; captured: Captured } {
  const captured: Captured = { status: 0, headers: {}, body: undefined };
  const res: ApiResponse = {
    status(code: number) {
      captured.status = code;
      return res;
    },
    json(payload: unknown) {
      captured.body = payload;
    },
    setHeader(name: string, value: string) {
      captured.headers[name] = value;
    }
  };
  return { res, captured };
}

let ipCounter = 0;
function makeReq(body: unknown, method = "POST", ip?: string): ApiRequest {
  ipCounter += 1;
  return { method, headers: { "x-forwarded-for": ip ?? `10.0.0.${ipCounter}` }, body };
}

const GEMINI_SUCCESS = {
  candidates: [
    {
      content: { parts: [{ text: '{"saju_analysis_summary":{},"recommended_names":[]}' }], role: "model" },
      finishReason: "STOP"
    }
  ],
  usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
  modelVersion: "gemini-3.5-flash"
};

function upstreamOk(payload: unknown) {
  return vi.fn(async () => ({ ok: true, status: 200, text: async () => JSON.stringify(payload) }));
}

const savedEnv = { ...process.env };

beforeEach(() => {
  process.env["GEMINI_API_KEY"] = "test-gemini-key";
  delete process.env["GEMINI_MODEL"];
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = { ...savedEnv };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const FIXTURES = {
  free: babyNamingRequest("FREE"),
  premium: babyNamingRequest("PREMIUM"),
  letter: babyLetterRequest()
} as const;

describe("Gemini path — request bytes (P1)", () => {
  for (const [name, body] of Object.entries(FIXTURES)) {
    it(`narrowed request for the ${name} body serializes to the recorded bytes`, () => {
      const outcome = validateGenerateContentRequest(body);
      expect(outcome.ok).toBe(true);
      if (outcome.ok) {
        expect(JSON.stringify(outcome.request)).toMatchSnapshot();
      }
    });

    it(`an explicit provider "gemini" on the ${name} body changes nothing`, () => {
      const plain = validateGenerateContentRequest(body);
      const tagged = validateGenerateContentRequest({ ...body, provider: "gemini" });
      expect(plain.ok && tagged.ok).toBe(true);
      if (plain.ok && tagged.ok) {
        expect(JSON.stringify(tagged.request)).toBe(JSON.stringify(plain.request));
      }
    });
  }
});

describe("Gemini path — upstream egress (P1)", () => {
  for (const [name, body] of Object.entries(FIXTURES)) {
    it(`sends the recorded URL, headers and body for the ${name} request`, async () => {
      const fetchMock = upstreamOk(GEMINI_SUCCESS);
      vi.stubGlobal("fetch", fetchMock);
      const { res, captured } = makeRes();

      await handler(makeReq(body), res);

      expect(captured.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect({ url, method: init.method, headers: init.headers, body: init.body }).toMatchSnapshot();
    });
  }

  it("passes the upstream success body through unchanged", async () => {
    vi.stubGlobal("fetch", upstreamOk(GEMINI_SUCCESS));
    const { res, captured } = makeRes();

    await handler(makeReq(FIXTURES.premium), res);

    expect(captured.status).toBe(200);
    expect(captured.body).toEqual(GEMINI_SUCCESS);
    expect(captured.headers).toEqual({ "Content-Type": "application/json; charset=utf-8" });
  });
});

describe("Gemini path — error table (P1)", () => {
  it("405 for a non-POST method", async () => {
    const { res, captured } = makeRes();
    await handler(makeReq(undefined, "GET"), res);
    expect(captured).toMatchSnapshot();
  });

  it("503 when the Gemini key is missing, before anything else", async () => {
    delete process.env["GEMINI_API_KEY"];
    const { res, captured } = makeRes();
    await handler(makeReq("not json"), res);
    expect(captured).toMatchSnapshot();
  });

  it("400 for a body that is not JSON", async () => {
    const { res, captured } = makeRes();
    await handler(makeReq("{not json"), res);
    expect(captured).toMatchSnapshot();
  });

  it("400 for a body that fails the allowlist", async () => {
    const { res, captured } = makeRes();
    await handler(makeReq({ contents: [] }), res);
    expect(captured).toMatchSnapshot();
  });

  it("413 for an oversized payload", async () => {
    const big = "가".repeat(11_000);
    const body = {
      contents: [1, 2, 3, 4].map(() => ({ parts: [{ text: big }] })),
      systemInstruction: { parts: [{ text: "x".repeat(20_000) }] }
    };
    const { res, captured } = makeRes();
    await handler(makeReq(body), res);
    expect(captured).toMatchSnapshot();
  });

  it("429 from upstream stays 429, other upstream failures become 502", async () => {
    const rows: Captured[] = [];
    for (const status of [429, 400, 500]) {
      vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status, text: async () => "upstream detail" })));
      const { res, captured } = makeRes();
      await handler(makeReq(FIXTURES.free), res);
      rows.push(captured);
    }
    expect(rows).toMatchSnapshot();
  });

  it("502 for a non-JSON upstream success body", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, text: async () => "<html>" })));
    const { res, captured } = makeRes();
    await handler(makeReq(FIXTURES.free), res);
    expect(captured).toMatchSnapshot();
  });

  it("504 on upstream timeout, 502 on any other network failure", async () => {
    const rows: Captured[] = [];
    for (const error of [Object.assign(new Error("aborted"), { name: "AbortError" }), new Error("ECONNRESET")]) {
      vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(error)));
      const { res, captured } = makeRes();
      await handler(makeReq(FIXTURES.free), res);
      rows.push(captured);
    }
    expect(rows).toMatchSnapshot();
  });

  it("429 with Retry-After once a caller passes the per-IP limit", async () => {
    vi.stubGlobal("fetch", upstreamOk(GEMINI_SUCCESS));
    const ip = "192.0.2.77";
    let last: Captured | undefined;
    for (let i = 0; i < 21; i += 1) {
      const { res, captured } = makeRes();
      await handler(makeReq(FIXTURES.free, "POST", ip), res);
      last = captured;
    }
    expect(last?.status).toBe(429);
    expect(last?.headers["Retry-After"]).toMatch(/^\d+$/);
    expect(last?.body).toMatchSnapshot();
  });
});
