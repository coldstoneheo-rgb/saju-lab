/**
 * Fixed-cost, in-memory sliding-window rate limiter.
 *
 * Why in-memory and not a shared store: the app-facing routes carry **no client
 * secret** (see docs/APP_GATEWAY.md), so this is the one abuse layer in front of a
 * paid upstream. A shared store (KV/Redis) would be strictly better, but it adds an
 * account, a dependency and a failure mode for a v1 whose job is to bound a
 * 15-tester exposure window. The honest limitation: serverless instances each keep
 * their own window, so the effective ceiling is `limit x concurrent instances`.
 * It throttles a single hammering client (which reuses a warm instance) and does
 * nothing against a distributed one — the hard financial ceiling stays where it
 * belongs, on the upstream provider's quota cap.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry. 0 when allowed. */
  retryAfterSeconds: number;
  /** Requests still available in the current window. */
  remaining: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
}

/** Beyond this many tracked keys the oldest are dropped, so a spray of unique IPs cannot grow memory without bound. */
const MAX_TRACKED_KEYS = 5000;

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();

  function prune(now: number): void {
    if (hits.size <= MAX_TRACKED_KEYS) {
      return;
    }
    for (const [key, timestamps] of hits) {
      const live = timestamps.filter((t) => now - t < windowMs);
      if (live.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, live);
      }
    }
    // Still oversized after dropping expired keys: evict in insertion order
    // (Map preserves it) until back under the cap.
    for (const key of hits.keys()) {
      if (hits.size <= MAX_TRACKED_KEYS) {
        break;
      }
      hits.delete(key);
    }
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      prune(now);
      const windowStart = now - windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

      if (recent.length >= limit) {
        const oldest = recent[0] ?? now;
        const retryAfterMs = Math.max(0, oldest + windowMs - now);
        hits.set(key, recent);
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
          remaining: 0
        };
      }

      recent.push(now);
      hits.set(key, recent);
      return { allowed: true, retryAfterSeconds: 0, remaining: limit - recent.length };
    }
  };
}
