import { describe, expect, it } from "vitest";
import { checkoutVerificationGuard } from "./checkout-verification-guard.js";
import { paidReadinessCopy } from "./paid-readiness-copy.js";
import { policyLinkGuard } from "./policy-link-guard.js";
import { policyPages } from "./policy-pages.js";

const forbiddenLiveLaunchCopy = [
  "지금 구매",
  "바로 결제",
  "결제하기",
  "결제 완료",
  "구매 완료",
  "checkout is live",
  "payment is available"
] as const;

const forbiddenStorageClaims = [
  "로그인으로 저장",
  "계정 만들기",
  "계정에 저장",
  "리포트 보관함",
  "서버에 저장됩니다",
  "서버에 보관합니다",
  "saved report library"
] as const;

describe("beta launch guard", () => {
  it("keeps user-facing readiness copy out of live checkout language", () => {
    const copy = [
      paidReadinessCopy.headline,
      ...paidReadinessCopy.items,
      JSON.stringify(policyPages)
    ].join(" ");

    for (const phrase of forbiddenLiveLaunchCopy) {
      expect(copy).not.toContain(phrase);
    }
  });

  it("keeps placeholder support contact and account storage claims out of user-facing copy", () => {
    const copy = [
      paidReadinessCopy.headline,
      ...paidReadinessCopy.items,
      JSON.stringify(policyPages)
    ].join(" ");

    expect(copy).not.toContain(policyLinkGuard.placeholderSupportContact);

    for (const phrase of forbiddenStorageClaims) {
      expect(copy).not.toContain(phrase);
    }
  });

  it("keeps checkout verification metadata-only while live checkout is disabled", () => {
    expect(checkoutVerificationGuard.liveCheckoutEnabled).toBe(false);
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
});
