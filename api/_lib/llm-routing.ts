/**
 * Operator-switchable main/sub routing for `/api/app/gemini-generate`
 * (baby-naming-ai `docs/handoffs/HO-2026-1015-baby-dualllm-design-REPLY.md` §①②, 3rd revision).
 *
 * The route answers with one engine (main). When a caller opts in, a failed list call
 * may be retried on the other engine (sub), and a failed letter call falls back inside
 * the gateway. Which engine is main is a remote value (Vercel Global Config item
 * `llm_routing`) so the operator can switch without a redeploy.
 *
 * Claude is reachable through routing only when **all three** hold:
 *   1. the request carries `claudeRoutingOptIn: true` (release apps send nothing — their
 *      privacy policy names Google only until the operator publishes the Anthropic clause),
 *   2. the server has `CLAUDE_ROUTING_ENABLED=1` (a deliberate redeploy after publication),
 *   3. the remote value names Claude.
 * Any request missing (1) or (2) is answered exactly as before this module existed and
 * never reads the remote value.
 */

export type Engine = "gemini" | "claude";

export interface Routing {
  main: Engine;
  sub: Engine | null;
}

export const DEFAULT_ROUTING: Readonly<Routing> = Object.freeze({ main: "gemini", sub: null });

export const ROUTING_ITEM_KEY = "llm_routing";
/** Same remote value is reused this long — failures included, so an outage cannot multiply reads. */
export const ROUTING_CACHE_MS = 60_000;
/** A transport failure may keep the last good value this long; past it the default wins. */
export const LAST_GOOD_MAX_MS = 10 * 60_000;
/** The read sits in front of every opted-in generation call; it must never cost more than this. */
export const ROUTING_READ_TIMEOUT_MS = 400;

const ENGINES: ReadonlySet<string> = new Set(["gemini", "claude"]);

/** `{"main":"gemini","sub":"none"}` → Routing. Anything else → null (callers fall back to the default). */
export function parseRouting(value: unknown): Routing | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const main = record["main"];
  const sub = record["sub"];
  if (typeof main !== "string" || !ENGINES.has(main)) {
    return null;
  }
  if (sub !== "none" && (typeof sub !== "string" || !ENGINES.has(sub) || sub === main)) {
    return null;
  }
  return { main: main as Engine, sub: sub === "none" ? null : (sub as Engine) };
}

export function mentionsClaude(routing: Routing): boolean {
  return routing.main === "claude" || routing.sub === "claude";
}

type ReadResult =
  | { kind: "value"; routing: Routing }
  /** The store answered definitively: no item, or an item that is not a valid routing. */
  | { kind: "absent" }
  /** The store could not be asked (no answer, timeout, 5xx). */
  | { kind: "error" };

interface Env {
  [key: string]: string | undefined;
}

export interface RoutingDeps {
  fetch: typeof fetch;
  now: () => number;
  /** Read per call — tests and runtime may replace process.env. */
  env: () => Env;
}

/** Item URL + token from a Global Config connection string (`https://global-config.vercel.com/<id>?token=<t>`). */
export function itemEndpoint(connection: string | undefined): { url: string; token: string } | null {
  if (!connection) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(connection);
  } catch {
    return null;
  }
  const token = parsed.searchParams.get("token");
  const id = parsed.pathname.replace(/^\/+|\/+$/g, "");
  if (!token || !id || parsed.protocol !== "https:") {
    return null;
  }
  return { url: `${parsed.origin}/${id}/item/${ROUTING_ITEM_KEY}`, token };
}

async function readRemote(deps: RoutingDeps): Promise<ReadResult> {
  // GLOBAL_CONFIG is the name Vercel creates when a store is connected; EDGE_CONFIG is the pre-rename name.
  const endpoint = itemEndpoint(deps.env()["GLOBAL_CONFIG"] ?? deps.env()["EDGE_CONFIG"]);
  if (endpoint === null) {
    // Not set up yet (the store is created by the operator) — that is a definite "no value".
    return { kind: "absent" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ROUTING_READ_TIMEOUT_MS);
  try {
    const response = await deps.fetch(endpoint.url, {
      headers: { Authorization: `Bearer ${endpoint.token}` },
      signal: controller.signal
    });
    if (response.status === 404) {
      return { kind: "absent" };
    }
    if (!response.ok) {
      return { kind: "error" };
    }
    const text = await response.text();
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      return { kind: "absent" };
    }
    // An item may be stored as an object or as a JSON string holding one.
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        return { kind: "absent" };
      }
    }
    const routing = parseRouting(value);
    return routing === null ? { kind: "absent" } : { kind: "value", routing };
  } catch {
    return { kind: "error" };
  } finally {
    clearTimeout(timer);
  }
}

export interface RoutingResolver {
  /** The routing that applies to one request. */
  resolve(claudeRoutingOptIn: boolean): Promise<Routing>;
}

export function createRoutingResolver(deps: RoutingDeps): RoutingResolver {
  let cached: { routing: Routing; at: number } | null = null;
  let lastGood: { routing: Routing; at: number } | null = null;

  return {
    async resolve(claudeRoutingOptIn: boolean): Promise<Routing> {
      // Order matters: every cheap "no" comes before the read, so a request that cannot
      // reach Claude never depends on the remote store (design 3rd rev., critic r2 #3).
      if (!claudeRoutingOptIn) {
        return DEFAULT_ROUTING;
      }
      if (deps.env()["LLM_ROUTING_DISABLED"] === "1") {
        return DEFAULT_ROUTING;
      }
      if (deps.env()["CLAUDE_ROUTING_ENABLED"] !== "1") {
        return DEFAULT_ROUTING;
      }

      const override = deps.env()["LLM_ROUTING_OVERRIDE"];
      if (override !== undefined && override !== "") {
        let value: unknown = null;
        try {
          value = JSON.parse(override);
        } catch {
          value = null;
        }
        return parseRouting(value) ?? DEFAULT_ROUTING;
      }

      const now = deps.now();
      if (cached !== null && now - cached.at < ROUTING_CACHE_MS) {
        return cached.routing;
      }

      const read = await readRemote(deps);
      let routing: Routing;
      let cacheAt = now;
      if (read.kind === "value") {
        routing = read.routing;
        lastGood = { routing, at: now };
      } else if (read.kind === "absent") {
        // A definite answer resets lastGood too: deleting the item is a rollback, and a
        // later transport error must not resurrect the value it replaced (critic r3 #1).
        routing = DEFAULT_ROUTING;
        lastGood = { routing, at: now };
      } else {
        const fresh = lastGood !== null && now - lastGood.at <= LAST_GOOD_MAX_MS;
        routing = fresh && lastGood !== null ? lastGood.routing : DEFAULT_ROUTING;
        if (fresh && lastGood !== null) {
          // Cache only until the last good value itself expires, so it is never served past
          // LAST_GOOD_MAX_MS in total (saju #102 critic #3: cache would otherwise add up to 60s).
          cacheAt = Math.min(now, lastGood.at + LAST_GOOD_MAX_MS - ROUTING_CACHE_MS);
        }
        console.error("[app/gemini-generate] routing read failed; using " + (fresh ? "last good" : "default"));
      }
      cached = { routing, at: cacheAt };
      return routing;
    }
  };
}
