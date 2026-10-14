import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_ROUTING,
  LAST_GOOD_MAX_MS,
  ROUTING_CACHE_MS,
  createRoutingResolver,
  itemEndpoint,
  parseRouting
} from "./llm-routing.js";

const CONNECTION = "https://global-config.vercel.com/gcfg_test?token=tok_test";
const ENABLED = { CLAUDE_ROUTING_ENABLED: "1", GLOBAL_CONFIG: CONNECTION };

function reply(status: number, value?: unknown) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(value) } as unknown as Response;
}

function harness(env: Record<string, string | undefined>, responses: (Response | Error)[]) {
  let now = 1_000_000;
  const fetchMock = vi.fn(async () => {
    const next = responses.shift();
    if (next === undefined) {
      throw new Error("unexpected read");
    }
    if (next instanceof Error) {
      throw next;
    }
    return next;
  });
  const resolver = createRoutingResolver({ fetch: fetchMock as unknown as typeof fetch, now: () => now, env: () => env });
  return {
    resolver,
    fetchMock,
    advance(ms: number) {
      now += ms;
    }
  };
}

describe("parseRouting", () => {
  it("accepts the three operator values", () => {
    expect(parseRouting({ main: "gemini", sub: "none" })).toEqual({ main: "gemini", sub: null });
    expect(parseRouting({ main: "gemini", sub: "claude" })).toEqual({ main: "gemini", sub: "claude" });
    expect(parseRouting({ main: "claude", sub: "gemini" })).toEqual({ main: "claude", sub: "gemini" });
  });

  it("rejects anything else", () => {
    for (const value of [
      null,
      "gemini",
      [],
      {},
      { main: "gemini" },
      { main: "Gemini", sub: "none" },
      { main: "gemini", sub: "gemini" },
      { main: "openai", sub: "none" },
      { main: "gemini", sub: null }
    ]) {
      expect(parseRouting(value)).toBeNull();
    }
  });
});

describe("itemEndpoint", () => {
  it("builds the item URL and token from a connection string", () => {
    expect(itemEndpoint(CONNECTION)).toEqual({
      url: "https://global-config.vercel.com/gcfg_test/item/llm_routing",
      token: "tok_test"
    });
  });

  it("returns null for a missing or malformed connection string", () => {
    for (const value of [undefined, "", "not a url", "https://global-config.vercel.com/gcfg_test", "http://x/y?token=t"]) {
      expect(itemEndpoint(value)).toBeNull();
    }
  });
});

describe("gates — no read unless all three can hold", () => {
  it("a request without the opt-in never reads and gets the default", async () => {
    const h = harness(ENABLED, []);
    expect(await h.resolver.resolve(false)).toEqual(DEFAULT_ROUTING);
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("CLAUDE_ROUTING_ENABLED off: default, zero reads, even if the store says claude", async () => {
    for (const flag of [undefined, "", "0", "true"]) {
      const h = harness({ GLOBAL_CONFIG: CONNECTION, CLAUDE_ROUTING_ENABLED: flag }, [reply(200, { main: "claude", sub: "gemini" })]);
      expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
      expect(h.fetchMock).not.toHaveBeenCalled();
    }
  });

  it("kill switch wins over everything", async () => {
    const h = harness({ ...ENABLED, LLM_ROUTING_DISABLED: "1", LLM_ROUTING_OVERRIDE: '{"main":"claude","sub":"gemini"}' }, []);
    expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("override env is used instead of the store; a bad override is the default", async () => {
    const good = harness({ ...ENABLED, LLM_ROUTING_OVERRIDE: '{"main":"claude","sub":"gemini"}' }, []);
    expect(await good.resolver.resolve(true)).toEqual({ main: "claude", sub: "gemini" });
    const bad = harness({ ...ENABLED, LLM_ROUTING_OVERRIDE: "{oops" }, []);
    expect(await bad.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    expect(good.fetchMock).not.toHaveBeenCalled();
    expect(bad.fetchMock).not.toHaveBeenCalled();
  });

  it("no connection string: definite default, no read", async () => {
    const h = harness({ CLAUDE_ROUTING_ENABLED: "1" }, []);
    expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    expect(h.fetchMock).not.toHaveBeenCalled();
  });
});

describe("remote value", () => {
  it("reads the item with a bearer token and caches it for the cache window", async () => {
    const h = harness(ENABLED, [reply(200, { main: "gemini", sub: "claude" }), reply(200, { main: "claude", sub: "gemini" })]);
    expect(await h.resolver.resolve(true)).toEqual({ main: "gemini", sub: "claude" });
    const [url, init] = h.fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://global-config.vercel.com/gcfg_test/item/llm_routing");
    expect(init.headers).toEqual({ Authorization: "Bearer tok_test" });

    h.advance(ROUTING_CACHE_MS - 1);
    expect(await h.resolver.resolve(true)).toEqual({ main: "gemini", sub: "claude" });
    expect(h.fetchMock).toHaveBeenCalledTimes(1);

    h.advance(1);
    expect(await h.resolver.resolve(true)).toEqual({ main: "claude", sub: "gemini" });
    expect(h.fetchMock).toHaveBeenCalledTimes(2);
  });

  it("accepts an item stored as a JSON string", async () => {
    const h = harness(ENABLED, [reply(200, JSON.stringify({ main: "claude", sub: "none" }))]);
    expect(await h.resolver.resolve(true)).toEqual({ main: "claude", sub: null });
  });

  it("missing item (404) and malformed item are an immediate default", async () => {
    for (const response of [reply(404), reply(200, { main: "claude" }), reply(200, "garbage")]) {
      const h = harness(ENABLED, [response]);
      expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    }
  });

  it("transport error keeps the last good value up to the limit, then the default", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const h = harness(ENABLED, [reply(200, { main: "claude", sub: "gemini" }), new Error("network"), reply(503), new Error("abort")]);
    expect(await h.resolver.resolve(true)).toEqual({ main: "claude", sub: "gemini" });

    h.advance(ROUTING_CACHE_MS);
    expect(await h.resolver.resolve(true)).toEqual({ main: "claude", sub: "gemini" });

    h.advance(ROUTING_CACHE_MS);
    expect(await h.resolver.resolve(true)).toEqual({ main: "claude", sub: "gemini" });

    h.advance(LAST_GOOD_MAX_MS);
    expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    vi.restoreAllMocks();
  });

  it("transport error with no last good value is the default", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const h = harness(ENABLED, [new Error("network")]);
    expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    vi.restoreAllMocks();
  });

  it("failures are cached too — an outage cannot multiply reads", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const h = harness(ENABLED, [new Error("network")]);
    await h.resolver.resolve(true);
    await h.resolver.resolve(true);
    await h.resolver.resolve(true);
    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it("rollback by deleting the item cannot be undone by a later transport error (critic r3 #1)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const h = harness(ENABLED, [reply(200, { main: "gemini", sub: "claude" }), reply(404), new Error("network")]);
    expect(await h.resolver.resolve(true)).toEqual({ main: "gemini", sub: "claude" });
    h.advance(ROUTING_CACHE_MS);
    expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    h.advance(ROUTING_CACHE_MS);
    expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    vi.restoreAllMocks();
  });
});

describe("read timeout and last-good ceiling (saju #102 critic r1 #2·#3)", () => {
  it("a store that never answers is abandoned after 400ms and the request gets the default", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const hanging = vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
          })
      );
      const resolver = createRoutingResolver({ fetch: hanging as unknown as typeof fetch, now: () => 0, env: () => ENABLED });
      let settled = false;
      const pending = resolver.resolve(true).then((r) => {
        settled = true;
        return r;
      });
      await vi.advanceTimersByTimeAsync(399);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await expect(pending).resolves.toEqual(DEFAULT_ROUTING);
    } finally {
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });

  it("a last good value is never served past LAST_GOOD_MAX_MS in total, cache included", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const errors = Array.from({ length: 20 }, () => new Error("network"));
    const h = harness(ENABLED, [reply(200, { main: "claude", sub: "gemini" }), ...errors]);
    expect(await h.resolver.resolve(true)).toEqual({ main: "claude", sub: "gemini" });
    // Step to just before the limit, failing every read: still the last good value.
    h.advance(LAST_GOOD_MAX_MS - 1);
    expect(await h.resolver.resolve(true)).toEqual({ main: "claude", sub: "gemini" });
    // One millisecond past the limit — even inside the cache window of that last read — it is the default.
    h.advance(2);
    expect(await h.resolver.resolve(true)).toEqual(DEFAULT_ROUTING);
    vi.restoreAllMocks();
  });
});
