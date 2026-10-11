import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiRequest, ApiResponse } from "./http.js";
import { babyLetterRequest, babyNamingRequest } from "./baby-request-fixtures.js";

/**
 * Handler-level tests for the Claude branch. The SDK is replaced with a fake that
 * records construction and calls, so the Gemini path can also be shown to never
 * touch it.
 */

const sdk = vi.hoisted(() => {
  class APIError extends Error {
    constructor(
      readonly status: number | undefined,
      readonly requestID: string | null = "req_test"
    ) {
      super(`status ${String(status)}`);
    }
  }
  class APIConnectionTimeoutError extends APIError {
    constructor() {
      super(undefined);
    }
  }
  const create = vi.fn();
  const constructed: unknown[] = [];
  class FakeAnthropic {
    static APIError = APIError;
    static APIConnectionTimeoutError = APIConnectionTimeoutError;
    messages = { create };
    constructor(options: unknown) {
      constructed.push(options);
    }
  }
  return { FakeAnthropic, APIError, APIConnectionTimeoutError, create, constructed };
});

vi.mock("@anthropic-ai/sdk", () => ({ default: sdk.FakeAnthropic }));

const { default: handler } = await import("../app/gemini-generate.js");

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
function makeReq(body: unknown): ApiRequest {
  ipCounter += 1;
  return { method: "POST", headers: { "x-forwarded-for": `10.9.0.${ipCounter}` }, body };
}

function claudeReply(text: string, overrides: Record<string, unknown> = {}) {
  return {
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-5-5",
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
    stop_details: null,
    stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 50 },
    ...overrides
  };
}

function freeAnswer(): string {
  const item = (i: number) => ({
    name_korean: `김하${i}`,
    name_hanja: "金河",
    hanja_meanings: "강(河)처럼 넉넉하다",
    structural_check: {
      pronunciation_ohaeng: "목수 (木水) - 상생 흐름",
      jawon_ohaeng: "수 (水) - 물을 채움",
      stroke_yinyang: "8획(음) - 9획(양) - 음양의 균형"
    }
  });
  return JSON.stringify({
    saju_analysis_summary: { birth_eight_characters: "丙午年", lacking_element: "水", remedy_strategy: "물의 기운을 더했습니다." },
    recommended_names: { item_1: item(1), item_2: item(2), item_3: item(3) }
  });
}

const savedEnv = { ...process.env };

beforeEach(() => {
  process.env["GEMINI_API_KEY"] = "test-gemini-key";
  process.env["ANTHROPIC_API_KEY"] = "test-anthropic-key";
  delete process.env["CLAUDE_MODEL"];
  sdk.create.mockReset();
  sdk.constructed.length = 0;
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = { ...savedEnv };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("provider routing", () => {
  it("never constructs the Anthropic client on the Gemini path (absent or explicit)", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, text: async () => '{"candidates":[]}' }));
    vi.stubGlobal("fetch", fetchMock);
    for (const body of [babyNamingRequest("FREE"), { ...babyNamingRequest("FREE"), provider: "gemini" }]) {
      const { res, captured } = makeRes();
      await handler(makeReq(body), res);
      expect(captured.status).toBe(200);
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sdk.constructed).toHaveLength(0);
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it("never calls Gemini on the Claude path", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    sdk.create.mockResolvedValue(claudeReply(freeAnswer()));
    const { res, captured } = makeRes();
    await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude" }), res);
    expect(captured.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown provider instead of defaulting it", async () => {
    for (const provider of ["Claude", "openai", 1, null]) {
      const { res, captured } = makeRes();
      await handler(makeReq({ ...babyNamingRequest("FREE"), provider }), res);
      expect(captured.status).toBe(400);
    }
    expect(sdk.create).not.toHaveBeenCalled();
  });
});

describe("Claude path", () => {
  it("503 when ANTHROPIC_API_KEY is not configured", async () => {
    delete process.env["ANTHROPIC_API_KEY"];
    const { res, captured } = makeRes();
    await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude" }), res);
    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({
      contract: "app-gemini-generate-v1",
      error: { code: "UPSTREAM_NOT_CONFIGURED", message: "Generation is temporarily unavailable." }
    });
  });

  it("calls Sonnet 5.5 by default with no SDK retries and answers in the Gemini shape", async () => {
    sdk.create.mockResolvedValue(claudeReply(freeAnswer()));
    const { res, captured } = makeRes();
    await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude" }), res);

    expect(sdk.constructed).toEqual([{ apiKey: "test-anthropic-key", maxRetries: 0, timeout: 180_000 }]);
    const params = sdk.create.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(params["model"]).toBe("claude-sonnet-5-5");
    expect(params).not.toHaveProperty("temperature");

    expect(captured.status).toBe(200);
    expect(captured.headers["x-llm-provider"]).toBe("claude");
    const body = captured.body as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
    const names = (JSON.parse(body.candidates[0]?.content.parts[0]?.text ?? "{}") as { recommended_names: unknown[] })
      .recommended_names;
    expect(names).toHaveLength(3);
  });

  it("uses CLAUDE_MODEL when set", async () => {
    process.env["CLAUDE_MODEL"] = "claude-opus-5-5";
    sdk.create.mockResolvedValue(claudeReply("편지 본문", { model: "claude-opus-5-5" }));
    const { res, captured } = makeRes();
    await handler(makeReq({ ...babyLetterRequest(), provider: "claude" }), res);
    expect((sdk.create.mock.calls[0]?.[0] as Record<string, unknown>)["model"]).toBe("claude-opus-5-5");
    expect(captured.status).toBe(200);
  });

  it("502 for a refusal, a truncated answer or a schema violation", async () => {
    const replies = [
      claudeReply("", { stop_reason: "refusal", content: [] }),
      claudeReply('{"saju', { stop_reason: "max_tokens" }),
      claudeReply(JSON.stringify({ saju_analysis_summary: {}, recommended_names: {} }))
    ];
    for (const reply of replies) {
      sdk.create.mockResolvedValueOnce(reply);
      const { res, captured } = makeRes();
      await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude" }), res);
      expect(captured.status).toBe(502);
      expect(captured.body).toEqual({
        contract: "app-gemini-generate-v1",
        error: { code: "UPSTREAM_ERROR", message: "Generation failed upstream." }
      });
    }
  });

  it("maps upstream errors: 429 stays 429, timeout 504, others 502", async () => {
    const cases: Array<[unknown, number]> = [
      [new sdk.APIError(429), 429],
      [new sdk.APIConnectionTimeoutError(), 504],
      [new sdk.APIError(529), 502],
      [new sdk.APIError(400), 502],
      [new Error("socket hang up"), 502]
    ];
    for (const [error, status] of cases) {
      sdk.create.mockRejectedValueOnce(error);
      const { res, captured } = makeRes();
      await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude" }), res);
      expect(captured.status).toBe(status);
    }
  });
});

describe("claudeEffort opt-in (design §7-1 R3)", () => {
  function sentEffort(): unknown {
    const params = sdk.create.mock.calls[0]?.[0] as { output_config?: { effort?: unknown } };
    return params.output_config?.effort;
  }

  it("defaults to medium and honours low", async () => {
    sdk.create.mockResolvedValue(claudeReply(freeAnswer()));
    await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude" }), makeRes().res);
    expect(sentEffort()).toBe("medium");

    sdk.create.mockClear();
    const { res, captured } = makeRes();
    await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude", claudeEffort: "low" }), res);
    expect(sentEffort()).toBe("low");
    expect(captured.status).toBe(200);
  });

  it("refuses anything that could raise spend", async () => {
    for (const claudeEffort of ["high", "xhigh", "max", "LOW", 1, null]) {
      const { res, captured } = makeRes();
      await handler(makeReq({ ...babyNamingRequest("FREE"), provider: "claude", claudeEffort }), res);
      expect(captured.status).toBe(400);
    }
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it("is ignored on the Gemini path: same upstream bytes, no SDK", async () => {
    const bodies: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: { body: unknown }) => {
        bodies.push(init.body);
        return { ok: true, status: 200, text: async () => '{"candidates":[]}' };
      })
    );
    for (const extra of [{}, { claudeEffort: "low" }, { claudeEffort: "high" }]) {
      const { res, captured } = makeRes();
      await handler(makeReq({ ...babyNamingRequest("PREMIUM"), ...extra }), res);
      expect(captured.status).toBe(200);
    }
    expect(new Set(bodies).size).toBe(1);
    expect(sdk.constructed).toHaveLength(0);
  });
});
