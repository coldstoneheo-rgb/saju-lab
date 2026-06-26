// Import the core via a relative path rather than the "@saju-lab/saju-core"
// workspace specifier. Vercel's serverless bundler traces and compiles the
// referenced source into the function, but does NOT recreate the node_modules
// symlink for the workspace package — so a bare specifier throws
// "Cannot find module" at module load (FUNCTION_INVOCATION_FAILED). A relative
// import is bundled and resolves at runtime with no node_modules. No engine
// logic changes here; same public contract builder.
import { buildSajuPillarsV1Response } from "../packages/saju-core/src/index.js";
import crypto from "node:crypto";

// Minimal request/response shape compatible with Vercel's Node serverless runtime.
// Kept local so the handler needs no extra dependency and stays portable.
interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
}

function header(req: ApiRequest, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

// Constant-time API key check. Hashing both sides to a fixed length lets
// timingSafeEqual run even when the lengths differ, avoiding a length side-channel.
function apiKeyMatches(expected: string, provided: string | undefined): boolean {
  if (!provided) {
    return false;
  }
  const a = crypto.createHash("sha256").update(expected).digest();
  const b = crypto.createHash("sha256").update(provided).digest();
  return crypto.timingSafeEqual(a, b);
}

/**
 * saju-pillars-v1 HTTP endpoint (hosted as a Vercel serverless function alongside
 * apps/web). Thin adapter: method + optional API-key gate, then delegate to the
 * pure contract builder. No engine logic here.
 *
 * Auth: if SAJU_API_KEY is set in the environment, callers must send a matching
 * `x-api-key` header; otherwise the endpoint is open (local/PoC). Rate limiting is
 * delegated to the hosting platform / gateway — v1 adds none at the app layer.
 */
export default function handler(req: ApiRequest, res: ApiResponse): void {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json({
      contract: "saju-pillars-v1",
      error: { code: "METHOD_NOT_ALLOWED", message: "Use POST with a JSON body." }
    });
    return;
  }

  const requiredKey = process.env.SAJU_API_KEY;
  if (requiredKey && !apiKeyMatches(requiredKey, header(req, "x-api-key"))) {
    res.status(401).json({
      contract: "saju-pillars-v1",
      error: { code: "UNAUTHORIZED", message: "Missing or invalid x-api-key." }
    });
    return;
  }

  let body: unknown = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({
        contract: "saju-pillars-v1",
        error: { code: "INVALID_BODY", message: "Request body must be valid JSON." }
      });
      return;
    }
  }

  // Narrow via the "data" property rather than the `ok` boolean discriminant:
  // Vercel's serverless TypeScript pass type-checks without strictNullChecks,
  // where boolean-discriminant narrowing fails to resolve the union. Property
  // narrowing works under both strict and non-strict, keeping the build clean.
  const result = buildSajuPillarsV1Response(body);
  if ("data" in result) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json(result.error);
  }
}
