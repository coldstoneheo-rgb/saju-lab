import type { ApiRequest, ApiResponse } from "../_lib/http.js";
import { clientIp } from "../_lib/http.js";
import { createRateLimiter } from "../_lib/rate-limit.js";
import { respondSajuPillars } from "../_lib/saju-pillars.js";

/**
 * App-facing saju-pillars gateway (`/api/app/saju-pillars`).
 *
 * Same contract as `/api/saju-pillars`, minus the `x-api-key` gate. The Android
 * client used to carry `SAJU_API_KEY` in BuildConfig, which put it in the release dex
 * in plaintext; a server-to-server key does not belong in a client that ships to
 * strangers. Since this endpoint is a pure CPU calculation with no paid upstream, the
 * cost of leaving it open is bounded — a rate limit is enough, and no client secret
 * has to exist.
 *
 * `/api/saju-pillars` keeps its key gate untouched: it is a published v1 contract with
 * other consumers, and loosening its auth to serve this app would change their terms.
 */

// A naming session makes exactly one pillars call. 30 per 5 minutes is far above any
// human pattern and still bounds a hammering client on a warm instance.
const limiter = createRateLimiter(30, 5 * 60 * 1000);

export default function handler(req: ApiRequest, res: ApiResponse): void {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json({
      contract: "saju-pillars-v1",
      error: { code: "METHOD_NOT_ALLOWED", message: "Use POST with a JSON body." }
    });
    return;
  }

  const decision = limiter.check(clientIp(req));
  if (!decision.allowed) {
    res.setHeader("Retry-After", String(decision.retryAfterSeconds));
    res.status(429).json({
      contract: "saju-pillars-v1",
      error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." }
    });
    return;
  }

  respondSajuPillars(req.body, res);
}
