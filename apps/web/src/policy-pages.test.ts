import { describe, expect, it } from "vitest";
import { policyLinkGuard } from "./policy-link-guard.js";
import { findPolicyPage, policyPages } from "./policy-pages.js";

describe("policy pages", () => {
  it("provides a user-facing draft page for every planned policy path", () => {
    expect(policyPages.map((page) => page.path)).toEqual(policyLinkGuard.userFacingPolicyPaths);

    for (const path of policyLinkGuard.userFacingPolicyPaths) {
      const page = findPolicyPage(path);

      expect(page).toBeDefined();
      expect(page?.title).toMatch(/초안/);
      expect(page?.statusNote).toContain("전");
      expect(page?.sections.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps draft policy copy out of live checkout and placeholder support exposure", () => {
    const copy = JSON.stringify(policyPages);

    expect(copy).not.toContain(policyLinkGuard.placeholderSupportContact);
    expect(copy).not.toContain("지금 구매");
    expect(copy).not.toContain("바로 결제");
    expect(copy).not.toContain("결제하기");
    expect(copy).not.toContain("결제 완료");
  });

  it("keeps usage guidance non-deterministic and outside professional advice", () => {
    const usagePage = findPolicyPage("/policies/usage-caution");
    const copy = JSON.stringify(usagePage);

    expect(copy).toContain("확정된 미래를 예언하지 않습니다");
    expect(copy).toContain("전문 투자, 의료, 법률 자문을 제공하지 않으며");
    expect(copy).toContain("특정 결과를 보장하지 않습니다");
  });
});
