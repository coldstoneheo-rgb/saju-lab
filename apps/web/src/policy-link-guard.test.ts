import { describe, expect, it } from "vitest";
import { policyLinkGuard } from "./policy-link-guard.js";

describe("policy link guard", () => {
  it("defines policy paths while keeping placeholder support contact gated", () => {
    expect(policyLinkGuard.userFacingPolicyPaths).toEqual([
      "/policies/privacy",
      "/policies/refund-support",
      "/policies/usage-caution"
    ]);
    expect(policyLinkGuard.placeholderSupportContact).toBe("support@example.com");
    expect(policyLinkGuard.replacementRequiredBeforeCheckout).toBe(true);
  });
});
