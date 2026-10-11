import Anthropic from "@anthropic-ai/sdk";
import type { ApiResponse } from "./http.js";
import type { ProxyRequest } from "./gemini-request.js";
import { SchemaTranslationError, fromAnthropicMessage, toAnthropicParams } from "./claude-adapter.js";

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

/** Set explicitly: the default differs by model (medium on Opus/Haiku 5.5, high on Sonnet 5.5). */
const EFFORT = "medium";

function errorBody(code: string, message: string): Record<string, unknown> {
  return { contract: "app-gemini-generate-v1", error: { code, message } };
}

export async function generateWithClaude(request: ProxyRequest, res: ApiResponse): Promise<void> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    res.status(503).json(errorBody("UPSTREAM_NOT_CONFIGURED", "Generation is temporarily unavailable."));
    return;
  }

  const model = process.env["CLAUDE_MODEL"] || DEFAULT_MODEL;
  let params: Anthropic.MessageCreateParamsNonStreaming;
  try {
    params = toAnthropicParams(request, { model, effort: EFFORT, maxTokens: MAX_TOKENS });
  } catch (error) {
    if (error instanceof SchemaTranslationError) {
      res.status(400).json(errorBody("INVALID_BODY", "`responseSchema` is not a supported schema shape."));
      return;
    }
    throw error;
  }

  // Retries stay with the app (one retry per list call); SDK retries on top would
  // multiply the wall clock past the app's read timeout.
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: UPSTREAM_TIMEOUT_MS });
  const started = Date.now();

  try {
    const message = await client.messages.create(params);
    const elapsed = Date.now() - started;
    const translated = fromAnthropicMessage(message, request);
    // Usage only — never the body: it carries the caller's birth data and names.
    console.info(
      `[app/gemini-generate] claude model=${message.model} in=${message.usage.input_tokens} ` +
        `out=${message.usage.output_tokens} ms=${elapsed} ok=${translated.ok}`
    );
    if (!translated.ok) {
      console.error(`[app/gemini-generate] claude unusable response: ${translated.reason}`);
      res.status(502).json(errorBody("UPSTREAM_ERROR", "Generation failed upstream."));
      return;
    }
    res.setHeader("x-llm-provider", "claude");
    res.status(200).json(translated.body);
  } catch (error) {
    if (error instanceof Anthropic.APIConnectionTimeoutError) {
      console.error("[app/gemini-generate] claude upstream timeout");
      res.status(504).json(errorBody("UPSTREAM_ERROR", "Generation failed upstream."));
      return;
    }
    if (error instanceof Anthropic.APIError) {
      // Status and request id only: the error body can name the organisation.
      console.error(`[app/gemini-generate] claude upstream ${String(error.status)} request_id=${String(error.requestID)}`);
      res.status(error.status === 429 ? 429 : 502).json(errorBody("UPSTREAM_ERROR", "Generation failed upstream."));
      return;
    }
    console.error("[app/gemini-generate] claude upstream call failed");
    res.status(502).json(errorBody("UPSTREAM_ERROR", "Generation failed upstream."));
  }
}
