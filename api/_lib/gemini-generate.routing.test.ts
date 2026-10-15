import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiRequest, ApiResponse } from "./http.js";
import { babyLetterRequest, babyNamingRequest } from "./baby-request-fixtures.js";

/**
 * Routing and fallback at the handler (baby-naming-ai HO-2026-1015 design REPLY 3rd rev. §②⑤).
 * The remote value is driven through `LLM_ROUTING_OVERRIDE` so these tests never touch the
 * module-level read cache; the read itself is covered in llm-routing.test.ts.
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
  const constructed: { timeout?: number }[] = [];
  class FakeAnthropic {
    static APIError = APIError;
    static APIConnectionTimeoutError = APIConnectionTimeoutError;
    messages = { create };
    constructor(options: { timeout?: number }) {
      constructed.push(options);
    }
  }
  return { FakeAnthropic, APIError, create, constructed };
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
  return { method: "POST", headers: { "x-forwarded-for": `10.7.${Math.floor(ipCounter / 200)}.${ipCounter % 200}` }, body };
}

function claudeText(text: string) {
  return {
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-5-5",
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
    stop_details: null,
    stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 50 }
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

function geminiReply(text: string) {
  return { candidates: [{ content: { parts: [{ text }], role: "model" }, finishReason: "STOP" }], modelVersion: "gemini-3.5-flash" };
}

type FetchReply = { status: number; payload?: unknown } | Error;

/** Gemini upstream stub. Replies in order; records each upstream body. */
function stubGemini(...replies: FetchReply[]) {
  const bodies: string[] = [];
  const fetchMock = vi.fn(async (_url: string, init: { body: string }) => {
    bodies.push(init.body);
    const next = replies.shift() ?? { status: 200, payload: geminiReply("{}") };
    if (next instanceof Error) {
      throw next;
    }
    return { ok: next.status === 200, status: next.status, text: async () => JSON.stringify(next.payload ?? {}) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, bodies };
}

function route(main: string, sub: string) {
  process.env["CLAUDE_ROUTING_ENABLED"] = "1";
  process.env["LLM_ROUTING_OVERRIDE"] = JSON.stringify({ main, sub });
}

const OPT_IN = { claudeRoutingOptIn: true };

async function call(body: unknown) {
  const { res, captured } = makeRes();
  await handler(makeReq(body), res);
  return captured;
}

const savedEnv = { ...process.env };

beforeEach(() => {
  process.env["GEMINI_API_KEY"] = "test-gemini-key";
  process.env["ANTHROPIC_API_KEY"] = "test-anthropic-key";
  delete process.env["CLAUDE_ROUTING_ENABLED"];
  delete process.env["LLM_ROUTING_OVERRIDE"];
  delete process.env["LLM_ROUTING_DISABLED"];
  delete process.env["GLOBAL_CONFIG"];
  delete process.env["EDGE_CONFIG"];
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

describe("release-shaped requests (no opt-in) are never routed", () => {
  it("Claude-naming remote value + enabled server: still Gemini only, no SDK, same headers", async () => {
    route("claude", "gemini");
    const gemini = stubGemini();
    for (const body of [babyNamingRequest("FREE"), babyNamingRequest("PREMIUM"), babyLetterRequest(), { ...babyNamingRequest("FREE"), attempt: 2 }]) {
      const captured = await call(body);
      expect(captured.status).toBe(200);
      expect(captured.headers).toEqual({ "Content-Type": "application/json; charset=utf-8" });
    }
    expect(gemini.fetchMock).toHaveBeenCalledTimes(4);
    expect(sdk.constructed).toHaveLength(0);
  });

  it("opt-in without CLAUDE_ROUTING_ENABLED: Gemini only", async () => {
    process.env["LLM_ROUTING_OVERRIDE"] = JSON.stringify({ main: "claude", sub: "gemini" });
    const gemini = stubGemini();
    const captured = await call({ ...babyNamingRequest("FREE"), ...OPT_IN });
    expect(captured.status).toBe(200);
    expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
    expect(sdk.constructed).toHaveLength(0);
  });

  it("kill switch: Gemini only", async () => {
    route("claude", "gemini");
    process.env["LLM_ROUTING_DISABLED"] = "1";
    const gemini = stubGemini();
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN });
    expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
    expect(sdk.constructed).toHaveLength(0);
  });
});

describe("list calls (app retry decides when, gateway decides where)", () => {
  it("main claude: attempt 1 goes to Claude at low effort, 60s cap when a sub exists", async () => {
    route("claude", "gemini");
    const gemini = stubGemini();
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    const captured = await call({ ...babyNamingRequest("FREE"), ...OPT_IN });
    expect(captured.status).toBe(200);
    expect(captured.headers["x-llm-provider"]).toBe("claude");
    expect(gemini.fetchMock).not.toHaveBeenCalled();
    expect(sdk.constructed).toEqual([expect.objectContaining({ timeout: 60_000 })]);
    const params = sdk.create.mock.calls[0]?.[0] as { output_config?: { effort?: unknown } };
    expect(params.output_config?.effort).toBe("low");
  });

  it("attempt 2 goes to the sub engine", async () => {
    route("gemini", "claude");
    const gemini = stubGemini();
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    const captured = await call({ ...babyNamingRequest("FREE"), ...OPT_IN, attempt: 2 });
    expect(captured.status).toBe(200);
    expect(gemini.fetchMock).not.toHaveBeenCalled();
    expect(sdk.create).toHaveBeenCalledTimes(1);
    expect(sdk.constructed).toEqual([expect.objectContaining({ timeout: 180_000 })]);
  });

  it("no sub: both attempts go to main at the full ceiling (rollback value)", async () => {
    route("claude", "none");
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    stubGemini();
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN });
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN, attempt: 2 });
    expect(sdk.create).toHaveBeenCalledTimes(2);
    expect(sdk.constructed.map((o) => o.timeout)).toEqual([180_000, 180_000]);
  });

  it("gemini/none with opt-in: exactly one Gemini call per attempt, upstream bytes = the plain request", async () => {
    route("gemini", "none");
    const plain = stubGemini();
    await call(babyNamingRequest("PREMIUM"));
    const plainBody = plain.bodies[0];
    vi.unstubAllGlobals();
    const routed = stubGemini();
    await call({ ...babyNamingRequest("PREMIUM"), ...OPT_IN });
    await call({ ...babyNamingRequest("PREMIUM"), ...OPT_IN, attempt: 2 });
    expect(routed.bodies).toEqual([plainBody, plainBody]);
    expect(sdk.constructed).toHaveLength(0);
  });

  it("a failing list main is answered as before (502) — the app's retry carries it to the sub", async () => {
    route("gemini", "claude");
    stubGemini({ status: 500, payload: { error: "boom" } });
    const captured = await call({ ...babyNamingRequest("FREE"), ...OPT_IN });
    expect(captured.status).toBe(502);
    expect(sdk.create).not.toHaveBeenCalled();
  });
});

describe("letter calls fall back inside the gateway", () => {
  const letter = { ...babyLetterRequest(), ...OPT_IN };

  it("main ok: one call, no sub", async () => {
    route("gemini", "claude");
    const gemini = stubGemini({ status: 200, payload: geminiReply("편지 본문") });
    const captured = await call(letter);
    expect(captured.status).toBe(200);
    expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
    expect(sdk.create).not.toHaveBeenCalled();
  });

  for (const [label, reply] of [
    ["5xx", { status: 503, payload: {} }],
    ["429", { status: 429, payload: {} }],
    ["network", new Error("socket hang up")],
    ["blank text", { status: 200, payload: geminiReply("   ") }]
  ] as [string, FetchReply][]) {
    it(`main ${label}: one sub call, its answer is sent`, async () => {
      route("gemini", "claude");
      const gemini = stubGemini(reply);
      sdk.create.mockResolvedValue(claudeText("클로드 편지"));
      const captured = await call(letter);
      expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
      expect(sdk.create).toHaveBeenCalledTimes(1);
      expect(sdk.constructed).toEqual([expect.objectContaining({ timeout: 55_000 })]);
      expect(captured.status).toBe(200);
      expect(captured.headers["x-llm-provider"]).toBe("claude");
    });
  }

  it("main timeout (Claude main at 30s): falls to the Gemini sub", async () => {
    route("claude", "gemini");
    sdk.create.mockRejectedValue(new (sdk.FakeAnthropic.APIConnectionTimeoutError as unknown as new () => Error)());
    const gemini = stubGemini({ status: 200, payload: geminiReply("제미나이 편지") });
    const captured = await call(letter);
    expect(sdk.constructed).toEqual([expect.objectContaining({ timeout: 30_000 })]);
    expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
    expect(captured.status).toBe(200);
    expect(captured.headers["x-llm-provider"]).toBeUndefined();
  });

  it("both fail: the sub's error is sent (same shape the app already handles)", async () => {
    route("gemini", "claude");
    stubGemini({ status: 500, payload: {} });
    sdk.create.mockRejectedValue(new sdk.APIError(500));
    const captured = await call(letter);
    expect(captured.status).toBe(502);
    expect(captured.body).toEqual({ contract: "app-gemini-generate-v1", error: { code: "UPSTREAM_ERROR", message: "Generation failed upstream." } });
  });

  it("no sub: a failing main is not retried", async () => {
    route("gemini", "none");
    const gemini = stubGemini({ status: 500, payload: {} });
    const captured = await call(letter);
    expect(captured.status).toBe(502);
    expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
    expect(sdk.constructed).toHaveLength(0);
  });
});

describe("explicit provider bypasses routing", () => {
  it("provider claude keeps the #100 default effort and full ceiling even when opted in", async () => {
    route("gemini", "none");
    stubGemini();
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN, provider: "claude" });
    const params = sdk.create.mock.calls[0]?.[0] as { output_config?: { effort?: unknown } };
    expect(params.output_config?.effort).toBe("medium");
    expect(sdk.constructed).toEqual([expect.objectContaining({ timeout: 180_000 })]);
  });

  it("provider claude without CLAUDE_ROUTING_ENABLED: 403, no Anthropic client, no Gemini", async () => {
    for (const flag of [undefined, "0", "true"]) {
      if (flag === undefined) {
        delete process.env["CLAUDE_ROUTING_ENABLED"];
      } else {
        process.env["CLAUDE_ROUTING_ENABLED"] = flag;
      }
      const gemini = stubGemini();
      for (const body of [{ ...babyNamingRequest("FREE"), provider: "claude" }, { ...babyLetterRequest(), ...OPT_IN, provider: "claude" }]) {
        const captured = await call(body);
        expect(captured.status).toBe(403);
        expect(captured.body).toEqual({
          contract: "app-gemini-generate-v1",
          error: { code: "PROVIDER_NOT_ENABLED", message: "The requested provider is not enabled on this deployment." }
        });
      }
      expect(gemini.fetchMock).not.toHaveBeenCalled();
    }
    expect(sdk.constructed).toHaveLength(0);
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it("provider claude with CLAUDE_ROUTING_ENABLED=1 goes straight to Claude, no routing read", async () => {
    process.env["CLAUDE_ROUTING_ENABLED"] = "1";
    const gemini = stubGemini();
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    const captured = await call({ ...babyNamingRequest("FREE"), provider: "claude" });
    expect(captured.status).toBe(200);
    expect(captured.headers["x-llm-provider"]).toBe("claude");
    expect(gemini.fetchMock).not.toHaveBeenCalled();
    expect(sdk.constructed).toEqual([expect.objectContaining({ timeout: 180_000 })]);
  });

  it("provider gemini ignores a Claude routing value", async () => {
    route("claude", "gemini");
    const gemini = stubGemini();
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN, provider: "gemini", attempt: 2 });
    expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
    expect(sdk.constructed).toHaveLength(0);
  });
});

describe("validation and key pre-check", () => {
  it("rejects malformed routing fields", async () => {
    stubGemini();
    for (const extra of [{ attempt: 3 }, { attempt: "2" }, { claudeRoutingOptIn: "true" }, { claudeRoutingOptIn: 1 }]) {
      const captured = await call({ ...babyNamingRequest("FREE"), ...extra });
      expect(captured.status).toBe(400);
    }
  });

  it("only when no engine key exists is the 503 sent before anything else", async () => {
    delete process.env["GEMINI_API_KEY"];
    delete process.env["ANTHROPIC_API_KEY"];
    expect((await call("not json")).status).toBe(503);
  });

  it("Gemini key missing, Anthropic key present: request is validated first, then the Gemini 503", async () => {
    delete process.env["GEMINI_API_KEY"];
    expect((await call("not json")).status).toBe(400);
    stubGemini();
    const captured = await call(babyNamingRequest("FREE"));
    expect(captured.status).toBe(503);
  });

  it("Gemini key missing: an opted-in retry still reaches the Claude sub", async () => {
    delete process.env["GEMINI_API_KEY"];
    route("gemini", "claude");
    stubGemini();
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    const captured = await call({ ...babyNamingRequest("FREE"), ...OPT_IN, attempt: 2 });
    expect(captured.status).toBe(200);
  });
});

describe("timeouts and logs (saju #102 critic r1 #1·#5·#6)", () => {
  function geminiTimers(spy: { mock: { calls: unknown[][] } }): unknown[] {
    // runGemini arms exactly one abort timer per upstream call; the delay is the call's ceiling.
    return spy.mock.calls.map((c) => c[1]);
  }

  it("release-shaped requests keep the 180s Gemini ceiling on list and letter", async () => {
    route("gemini", "claude");
    stubGemini();
    const spy = vi.spyOn(globalThis, "setTimeout");
    await call(babyNamingRequest("PREMIUM"));
    await call({ ...babyNamingRequest("PREMIUM"), attempt: 2 });
    await call(babyLetterRequest());
    expect(geminiTimers(spy)).toEqual([180_000, 180_000, 180_000]);
  });

  it("routed Gemini ceilings: list main 60s with a sub, retry 180s, letter main 30s, no-sub 180s", async () => {
    route("gemini", "claude");
    stubGemini({ status: 200, payload: geminiReply("{}") }, { status: 200, payload: geminiReply("편지") });
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    const spy = vi.spyOn(globalThis, "setTimeout");
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN });
    await call({ ...babyLetterRequest(), ...OPT_IN });
    expect(geminiTimers(spy)).toEqual([60_000, 30_000]);

    spy.mockClear();
    route("gemini", "none");
    stubGemini();
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN });
    await call({ ...babyNamingRequest("FREE"), ...OPT_IN, attempt: 2 });
    expect(geminiTimers(spy)).toEqual([180_000, 180_000]);
  });

  it("no opt-in: no route log line at all; opt-in: one line naming the engine actually called", async () => {
    route("gemini", "claude");
    stubGemini();
    sdk.create.mockResolvedValue(claudeText(freeAnswer()));
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    await call(babyNamingRequest("FREE"));
    expect(info.mock.calls.filter((c) => String(c[0]).includes("route main="))).toHaveLength(0);

    await call({ ...babyNamingRequest("FREE"), ...OPT_IN, attempt: 2 });
    const lines = info.mock.calls.map((c) => String(c[0])).filter((l) => l.includes("route main="));
    expect(lines).toEqual(["[app/gemini-generate] route main=gemini sub=claude engine=claude kind=list attempt=2"]);
  });

  it("an empty responseSchema still counts as a list (classification boundary)", async () => {
    route("gemini", "claude");
    const body = { ...babyLetterRequest(), ...OPT_IN, generationConfig: { responseSchema: {} } };
    const gemini = stubGemini({ status: 500, payload: {} });
    const captured = await call(body);
    // A list main failure is answered as-is (no in-gateway fallback) — a letter would have tried the sub.
    expect(captured.status).toBe(502);
    expect(gemini.fetchMock).toHaveBeenCalledTimes(1);
    expect(sdk.create).not.toHaveBeenCalled();
  });
});
