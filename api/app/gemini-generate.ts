import type { ApiRequest, ApiResponse } from "../_lib/http.js";
import { clientIp, parseJsonBody } from "../_lib/http.js";
import { createRateLimiter } from "../_lib/rate-limit.js";
import { validateGenerateContentRequest } from "../_lib/gemini-request.js";

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

// Module scope: warm instances reuse the window. Cold starts begin with an empty one,
// which is the documented weakness of the in-memory approach.
const limiter = createRateLimiter(RATE_LIMIT, RATE_WINDOW_MS);

function errorBody(code: string, message: string): Record<string, unknown> {
  return { contract: "app-gemini-generate-v1", error: { code, message } };
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json(errorBody("METHOD_NOT_ALLOWED", "Use POST with a JSON body."));
    return;
  }

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    // Configuration fault, not a caller fault — say so without naming the variable's value.
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

  const model = process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Header rather than ?key=: the URL shows up in logs and error strings.
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(validation.request),
      signal: controller.signal
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      // The upstream error body can carry project and quota details. Log it for us,
      // return a shape-stable error to the client.
      console.error(`[app/gemini-generate] upstream ${upstream.status}: ${text.slice(0, 500)}`);
      res.status(upstream.status === 429 ? 429 : 502).json(
        errorBody("UPSTREAM_ERROR", "Generation failed upstream.")
      );
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      console.error("[app/gemini-generate] upstream returned non-JSON body");
      res.status(502).json(errorBody("UPSTREAM_ERROR", "Generation failed upstream."));
      return;
    }

    // Verbatim pass-through of the success body: the client parses the standard
    // `generateContent` response, so changing its shape here would be a silent
    // contract break in an app that is already published.
    res.status(200).json(payload);
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error(`[app/gemini-generate] ${aborted ? "upstream timeout" : "upstream call failed"}`);
    res.status(aborted ? 504 : 502).json(errorBody("UPSTREAM_ERROR", "Generation failed upstream."));
  } finally {
    clearTimeout(timer);
  }
}
