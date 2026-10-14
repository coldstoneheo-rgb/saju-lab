import type { ApiResponse } from "./http.js";

/**
 * One upstream engine's answer, held instead of written so the route can decide
 * whether to send it or try the other engine (letter fallback, llm-routing.ts).
 * `ok` is true only for a usable 200 — the route's fallback test, nothing else.
 */
export interface EngineOutcome {
  ok: boolean;
  status: number;
  body: unknown;
  headers: Record<string, string>;
  /** Why it failed, for the one log line a fallback writes. Never the body. */
  failClass?: "not_configured" | "timeout" | "upstream" | "rate_limited" | "unusable";
}

export function errorBody(code: string, message: string): Record<string, unknown> {
  return { contract: "app-gemini-generate-v1", error: { code, message } };
}

export function sendOutcome(res: ApiResponse, outcome: EngineOutcome): void {
  for (const [name, value] of Object.entries(outcome.headers)) {
    res.setHeader(name, value);
  }
  res.status(outcome.status).json(outcome.body);
}
