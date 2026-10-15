import type { ApiRequest, ApiResponse } from "../_lib/http.js";
import { clientIp, parseJsonBody } from "../_lib/http.js";
import { createRateLimiter } from "../_lib/rate-limit.js";
import { type ClaudeEffort, type ProxyRequest, validateGenerateContentRequest } from "../_lib/gemini-request.js";
import { type EngineOutcome, errorBody, sendOutcome } from "../_lib/engine-outcome.js";
import { type Engine, createRoutingResolver } from "../_lib/llm-routing.js";

/**
 * App-facing Gemini gateway (`/api/app/gemini-generate`).
 *
 * Exists so the Android client can stop shipping `GEMINI_API_KEY`: the key lived in
 * BuildConfig, which R8 does not strip, so `grep -a` over the release dex printed it
 * in plaintext (baby-naming-ai `docs/SECURITY-AUDIT-vc11.md`). The key now lives only
 * in this project's environment.
 *
 * The route takes **no client secret** — a bundled proxy token would be extractable
 * exactly like the key it replaced. What bounds abuse instead: the request is rebuilt
 * from an allowlist (`validateGenerateContentRequest`), the model is chosen here and
 * not by the caller, and callers are rate limited per IP. The remaining ceiling is the
 * upstream provider's quota cap, which is set in the GCP console, not in code.
 */

const DEFAULT_MODEL = "gemini-3.5-flash";
const UPSTREAM_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * One naming session costs 1 list call (+1 retry at most) and up to 10 letter calls,
 * so a real user can legitimately reach ~13 calls in a few minutes. 20 per 5 minutes
 * clears that with room and still halves what a single hammering client can spend.
 */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 5 * 60 * 1000;

/**
 * Upstream ceiling. A heavy PREMIUM run was measured at 68.7s (baby-naming-ai
 * `GeminiApi.kt` — its own read timeout is 92s), so this must clear that by a margin
 * while staying below the function's maxDuration in vercel.json.
 */
const UPSTREAM_TIMEOUT_MS = 180_000;

/**
 * Routed calls only (an opted-in request with a sub engine configured). Measured on the
 * 75-set evaluation: PREMIUM max 44.3s on either engine, none over 60s; letters p95 ≤13.2s.
 *   - list main: cut at 60s so the app's retry (attempt 2) still reaches the sub engine;
 *   - letter main 30s → sub 55s: both inside one app call, under its 92s read timeout.
 */
const ROUTED_LIST_MAIN_TIMEOUT_MS = 60_000;
const ROUTED_LETTER_MAIN_TIMEOUT_MS = 30_000;
const ROUTED_LETTER_SUB_TIMEOUT_MS = 55_000;

/**
 * Effort for Claude reached by routing (the app sends no `claudeEffort` then). The
 * evaluation passed at low; the explicit-provider default (medium, #100) is untouched.
 */
const ROUTED_CLAUDE_EFFORT: ClaudeEffort = "low";

// Module scope: warm instances reuse the window. Cold starts begin with an empty one,
// which is the documented weakness of the in-memory approach.
const limiter = createRateLimiter(RATE_LIMIT, RATE_WINDOW_MS);
const routing = createRoutingResolver({ fetch: (input, init) => fetch(input, init), now: () => Date.now(), env: () => process.env });

const UPSTREAM_ERROR = errorBody("UPSTREAM_ERROR", "Generation failed upstream.");

/** The Gemini call, held. Status table, log lines and pass-through are the pre-routing code's (P1). */
async function runGemini(request: ProxyRequest, timeoutMs: number = UPSTREAM_TIMEOUT_MS): Promise<EngineOutcome> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      body: errorBody("UPSTREAM_NOT_CONFIGURED", "Generation is temporarily unavailable."),
      headers: {},
      failClass: "not_configured"
    };
  }

  const model = process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Header rather than ?key=: the URL shows up in logs and error strings.
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      // The upstream error body can carry project and quota details. Log it for us,
      // return a shape-stable error to the client.
      console.error(`[app/gemini-generate] upstream ${upstream.status}: ${text.slice(0, 500)}`);
      const rateLimited = upstream.status === 429;
      return {
        ok: false,
        status: rateLimited ? 429 : 502,
        body: UPSTREAM_ERROR,
        headers: {},
        failClass: rateLimited ? "rate_limited" : "upstream"
      };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      console.error("[app/gemini-generate] upstream returned non-JSON body");
      return { ok: false, status: 502, body: UPSTREAM_ERROR, headers: {}, failClass: "unusable" };
    }

    // Verbatim pass-through of the success body: the client parses the standard
    // `generateContent` response, so changing its shape here would be a silent
    // contract break in an app that is already published.
    return { ok: true, status: 200, body: payload, headers: {} };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error(`[app/gemini-generate] ${aborted ? "upstream timeout" : "upstream call failed"}`);
    return {
      ok: false,
      status: aborted ? 504 : 502,
      body: UPSTREAM_ERROR,
      headers: {},
      failClass: aborted ? "timeout" : "upstream"
    };
  } finally {
    clearTimeout(timer);
  }
}

async function runEngine(
  engine: Engine,
  request: ProxyRequest,
  timeoutMs: number,
  claudeEffort?: ClaudeEffort
): Promise<EngineOutcome> {
  if (engine === "claude") {
    // Loaded only on this branch — the Gemini path never imports the Anthropic SDK.
    const { runClaude } = await import("../_lib/claude-generate.js");
    return runClaude(request, claudeEffort, timeoutMs);
  }
  return runGemini(request, timeoutMs);
}

/** A letter answer the app can use: 200 with a non-blank first text part. */
function usableLetter(outcome: EngineOutcome): boolean {
  if (!outcome.ok) {
    return false;
  }
  const body = outcome.body as { candidates?: { content?: { parts?: { text?: unknown }[] } }[] } | null;
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === "string" && text.trim() !== "";
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json(errorBody("METHOD_NOT_ALLOWED", "Use POST with a JSON body."));
    return;
  }

  // Configuration fault, not a caller fault — say so without naming the variable's value.
  // Only when **no** engine is configured: with routing, a missing Gemini key must not
  // also block the Claude sub (the per-engine check lives in runGemini / runClaude).
  if (!process.env["GEMINI_API_KEY"] && !process.env["ANTHROPIC_API_KEY"]) {
    res.status(503).json(errorBody("UPSTREAM_NOT_CONFIGURED", "Generation is temporarily unavailable."));
    return;
  }

  const decision = limiter.check(clientIp(req));
  if (!decision.allowed) {
    res.setHeader("Retry-After", String(decision.retryAfterSeconds));
    res.status(429).json(errorBody("RATE_LIMITED", "Too many requests. Try again shortly."));
    return;
  }

  const parsed = parseJsonBody(req.body);
  if (!parsed.ok) {
    res.status(400).json(errorBody("INVALID_BODY", "Request body must be valid JSON."));
    return;
  }

  const validation = validateGenerateContentRequest(parsed.value);
  if (!validation.ok) {
    res.status(validation.code === "PAYLOAD_TOO_LARGE" ? 413 : 400).json(
      errorBody(validation.code, validation.message)
    );
    return;
  }

  // A named provider (debug toggle, evaluation harness) is answered by that engine, as before
  // routing existed — no remote value, no fallback (docs/DESIGN-dualllm-saju-baby.md §1).
  if (validation.providerExplicit) {
    if (validation.provider === "claude") {
      // Same interlock as routing: this route is unauthenticated, so only a deployment that sets
      // CLAUDE_ROUTING_ENABLED=1 may spend the Anthropic key. Refuse rather than answer with Gemini.
      if (process.env["CLAUDE_ROUTING_ENABLED"] !== "1") {
        res.status(403).json(errorBody("PROVIDER_NOT_ENABLED", "The requested provider is not enabled on this deployment."));
        return;
      }
      const { generateWithClaude } = await import("../_lib/claude-generate.js");
      await generateWithClaude(validation.request, res, validation.claudeEffort);
      return;
    }
    sendOutcome(res, await runGemini(validation.request));
    return;
  }

  const route = await routing.resolve(validation.claudeRoutingOptIn);
  // The list request is the only one that carries a response schema (baby NamingRepository: list sets
  // `responseSchema`, the letter does not). An empty `{}` schema still counts as a list (routing test).
  const isList = validation.request.generationConfig?.responseSchema !== undefined;
  const engine = isList && validation.attempt === 2 && route.sub !== null ? route.sub : route.main;

  if (validation.claudeRoutingOptIn) {
    // Values and engine names only — never the body or the caller's address. Release-shaped
    // requests (no opt-in) log nothing here, exactly as before routing existed.
    console.info(
      `[app/gemini-generate] route main=${route.main} sub=${route.sub ?? "none"} engine=${engine} ` +
        `kind=${isList ? "list" : "letter"} attempt=${validation.attempt ?? 1}`
    );
  }

  if (isList) {
    const timeoutMs = route.sub !== null && validation.attempt !== 2 ? ROUTED_LIST_MAIN_TIMEOUT_MS : UPSTREAM_TIMEOUT_MS;
    sendOutcome(res, await runEngine(engine, validation.request, timeoutMs, ROUTED_CLAUDE_EFFORT));
    return;
  }

  if (route.sub === null) {
    sendOutcome(res, await runEngine(route.main, validation.request, UPSTREAM_TIMEOUT_MS, ROUTED_CLAUDE_EFFORT));
    return;
  }

  const first = await runEngine(route.main, validation.request, ROUTED_LETTER_MAIN_TIMEOUT_MS, ROUTED_CLAUDE_EFFORT);
  if (usableLetter(first)) {
    sendOutcome(res, first);
    return;
  }
  console.error(
    `[app/gemini-generate] fallback letter main=${route.main} sub=${route.sub} reason=${first.failClass ?? "empty"}`
  );
  sendOutcome(res, await runEngine(route.sub, validation.request, ROUTED_LETTER_SUB_TIMEOUT_MS, ROUTED_CLAUDE_EFFORT));
}
