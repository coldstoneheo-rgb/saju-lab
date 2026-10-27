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

// 9단계 L2 판독 블록(2026-10-27)은 키 라우트에만 연다. 무료/유료 층 노출은 사용자 결정 전이라
// keyless 공개면은 그대로 둔다(docs/design/l2-include-design.md §4 · HO-2026-1026-l2-include).
export const APP_DENIED_INCLUDES = ["strengthReadings", "yongsinCandidates", "gyeokguk", "sinsal"] as const;

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

  respondSajuPillars(req.body, res, APP_DENIED_INCLUDES);
}
