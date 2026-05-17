import { describe, expect, it } from "vitest";
import { checkoutVerificationGuard } from "./checkout-verification-guard.js";

describe("checkout verification guard", () => {
  it("allows only payment/session metadata before checkout implementation", () => {
    expect(checkoutVerificationGuard.allowedSessionFields).toEqual([
      "product SKU",
      "price",
      "currency",
      "order ID",
      "checkout/session ID",
      "return URL",
      "cancel URL",
      "locale"
    ]);

    expect(checkoutVerificationGuard.allowedVerificationFields).toEqual([
      "provider session ID",
      "payment status",
      "provider event ID",
      "amount",
      "currency",
      "product SKU",
      "order ID",
      "timestamps",
      "refund/support status"
    ]);
  });

  it("keeps Saju report payload out of checkout/session verification", () => {
    expect(checkoutVerificationGuard.forbiddenCheckoutPayload).toEqual([
      "birth date",
      "birth time",
      "sex",
      "timezone",
      "calculated pillars",
      "free report body",
      "paid report body",
      "PDF-ready HTML"
    ]);
  });

  it("keeps live checkout disabled while the blueprint is still a gate", () => {
    expect(checkoutVerificationGuard.liveCheckoutEnabled).toBe(false);
    expect(checkoutVerificationGuard.states).toEqual([
      "draft",
      "session_created",
      "payment_pending",
      "payment_verified",
      "download_ready",
      "download_failed",
      "refund_requested",
      "refunded",
      "verification_failed",
      "expired"
    ]);
  });
});
