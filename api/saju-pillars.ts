import { buildSajuPillarsV1Response } from "@saju-lab/saju-core";
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

  const result = buildSajuPillarsV1Response(body);
  if (result.ok) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json(result.error);
  }
}
