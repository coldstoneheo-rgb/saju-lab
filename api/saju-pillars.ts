import crypto from "node:crypto";
import type { ApiRequest, ApiResponse } from "./_lib/http.js";
import { header } from "./_lib/http.js";
import { respondSajuPillars } from "./_lib/saju-pillars.js";

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
 *
 * The Android client does NOT use this route any more; it calls the keyless,
 * rate-limited `/api/app/saju-pillars` so that no key has to ship in its bundle.
 * This route keeps its key gate for server-to-server consumers.
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

  respondSajuPillars(req.body, res);
}
