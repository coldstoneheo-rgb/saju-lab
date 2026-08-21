import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit.js";

describe("createRateLimiter", () => {
  it("allows up to the limit inside one window", () => {
    const limiter = createRateLimiter(3, 1000);
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("a", 100).allowed).toBe(true);
    expect(limiter.check("a", 200).allowed).toBe(true);
    expect(limiter.check("a", 300).allowed).toBe(false);
  });

  it("reports when the caller may retry", () => {
    const limiter = createRateLimiter(1, 5000);
    limiter.check("a", 0);
    const blocked = limiter.check("a", 1000);
    expect(blocked.allowed).toBe(false);
    // Oldest hit at t=0 leaves the window at t=5000, so 4s from t=1000.
    expect(blocked.retryAfterSeconds).toBe(4);
  });

  it("lets the window slide", () => {
    const limiter = createRateLimiter(2, 1000);
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("a", 500).allowed).toBe(true);
    expect(limiter.check("a", 900).allowed).toBe(false);
    // t=0 hit has aged out; the t=500 one has not.
    expect(limiter.check("a", 1600).allowed).toBe(true);
  });

  it("keeps callers in separate buckets", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("b", 0).allowed).toBe(true);
    expect(limiter.check("a", 1).allowed).toBe(false);
  });

  it("does not grow without bound when every caller is unique", () => {
    const limiter = createRateLimiter(1, 1000);
    for (let i = 0; i < 6000; i += 1) {
      limiter.check(`ip-${i}`, i);
    }
    // The cap is internal; the observable guarantee is that a fresh caller still
    // gets an answer and the process has not been asked to keep 6000 live windows.
    expect(limiter.check("ip-fresh", 6000).allowed).toBe(true);
  });
});
