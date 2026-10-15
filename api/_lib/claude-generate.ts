import Anthropic from "@anthropic-ai/sdk";
import type { ApiResponse } from "./http.js";
import type { ClaudeEffort, ProxyRequest } from "./gemini-request.js";
import { SchemaTranslationError, fromAnthropicMessage, toAnthropicParams } from "./claude-adapter.js";
import { type EngineOutcome, errorBody, sendOutcome } from "./engine-outcome.js";

/**
 * Claude branch of `/api/app/gemini-generate`, reached only when the caller sends
 * `provider: "claude"` (docs/DESIGN-dualllm-saju-baby.md). The Gemini path does not
 * import this module's behaviour — keeping the SDK here is what keeps that path's
 * bytes unchanged.
 *
 * The response is reshaped into Gemini's `generateContent` form so the published app
 * parses it without a code change. Anything that is not a clean, schema-valid answer
 * becomes a 502, which the app already answers with its single retry.
 */

const DEFAULT_MODEL = "claude-sonnet-5-5";

/** Same ceiling as the Gemini path (gemini-generate.ts), under vercel.json maxDuration 300. */
const UPSTREAM_TIMEOUT_MS = 180_000;

/** Non-streaming ceiling; a PREMIUM list is a few thousand tokens. */
const MAX_TOKENS = 16_000;

/**
 * Set explicitly: the default differs by model (medium on Opus/Haiku 5.5, high on Sonnet 5.5).
 * A caller may ask for "low" (`claudeEffort`) — the PREMIUM list ran past the app's 92s
 * read timeout at medium in the baby evaluation (design §7-1 R3).
 */
const DEFAULT_EFFORT: ClaudeEffort = "medium";

export { UPSTREAM_TIMEOUT_MS as CLAUDE_UPSTREAM_TIMEOUT_MS };

const UPSTREAM_ERROR = errorBody("UPSTREAM_ERROR", "Generation failed upstream.");

/** Claude call → held outcome. Same status table as before the split (502 / 504 / 429 / 503). */
export async function runClaude(
  request: ProxyRequest,
  effort: ClaudeEffort = DEFAULT_EFFORT,
  timeoutMs: number = UPSTREAM_TIMEOUT_MS
): Promise<EngineOutcome> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      body: errorBody("UPSTREAM_NOT_CONFIGURED", "Generation is temporarily unavailable."),
      headers: {},
      failClass: "not_configured"
    };
  }

  const model = process.env["CLAUDE_MODEL"] || DEFAULT_MODEL;
  let params: Anthropic.MessageCreateParamsNonStreaming;
  try {
    // CLAUDE_LIST_LAYER=off reproduces the v2 evaluation request (no list layer).
    const listLayer = process.env["CLAUDE_LIST_LAYER"] !== "off";
    params = toAnthropicParams(request, { model, effort, maxTokens: MAX_TOKENS, listLayer });
  } catch (error) {
    if (error instanceof SchemaTranslationError) {
      return {
        ok: false,
        status: 400,
        body: errorBody("INVALID_BODY", "`responseSchema` is not a supported schema shape."),
        headers: {},
        failClass: "unusable"
      };
    }
    throw error;
  }

  // Retries stay with the app (one retry per list call); SDK retries on top would
  // multiply the wall clock past the app's read timeout.
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: timeoutMs });
  const started = Date.now();

  try {
    const message = await client.messages.create(params);
    const elapsed = Date.now() - started;
    const translated = fromAnthropicMessage(message, request);
    // Usage only — never the body: it carries the caller's birth data and names.
    console.info(
      `[app/gemini-generate] claude model=${message.model} effort=${effort} in=${message.usage.input_tokens} ` +
        `out=${message.usage.output_tokens} ms=${elapsed} ok=${translated.ok}`
    );
    if (!translated.ok) {
      console.error(`[app/gemini-generate] claude unusable response: ${translated.reason}`);
      return { ok: false, status: 502, body: UPSTREAM_ERROR, headers: {}, failClass: "unusable" };
    }
    return { ok: true, status: 200, body: translated.body, headers: { "x-llm-provider": "claude" } };
  } catch (error) {
    if (error instanceof Anthropic.APIConnectionTimeoutError) {
      console.error("[app/gemini-generate] claude upstream timeout");
      return { ok: false, status: 504, body: UPSTREAM_ERROR, headers: {}, failClass: "timeout" };
    }
    if (error instanceof Anthropic.APIError) {
      // Status and request id only: the error body can name the organisation.
      console.error(`[app/gemini-generate] claude upstream ${String(error.status)} request_id=${String(error.requestID)}`);
      const rateLimited = error.status === 429;
      return {
        ok: false,
        status: rateLimited ? 429 : 502,
        body: UPSTREAM_ERROR,
        headers: {},
        failClass: rateLimited ? "rate_limited" : "upstream"
      };
    }
    console.error("[app/gemini-generate] claude upstream call failed");
    return { ok: false, status: 502, body: UPSTREAM_ERROR, headers: {}, failClass: "upstream" };
  }
}

export async function generateWithClaude(
  request: ProxyRequest,
  res: ApiResponse,
  effort: ClaudeEffort = DEFAULT_EFFORT
): Promise<void> {
  sendOutcome(res, await runClaude(request, effort));
}
