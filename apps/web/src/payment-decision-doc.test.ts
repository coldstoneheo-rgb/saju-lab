import { describe, expect, it } from "vitest";
import { paymentDecisionGuard } from "./payment-decision-guard.js";

describe("payment provider decision doc", () => {
  it("documents candidates, failure states, and birth-data boundaries", () => {
    for (const candidate of paymentDecisionGuard.candidates) {
      expect(candidate.length).toBeGreaterThan(4);
    }

    for (const failureState of paymentDecisionGuard.failureStates) {
      expect(failureState).toMatch(/Payment|Duplicate|User|Webhook|Provider/);
    }

    expect(paymentDecisionGuard.forbiddenProviderPayload).toEqual([
      "birth date",
      "birth time",
      "sex",
      "timezone",
      "calculated pillars",
      "report body",
      "PDF-ready HTML"
    ]);
  });
});
