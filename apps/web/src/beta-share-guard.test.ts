import { describe, expect, it } from "vitest";
import handoffNote from "../../../docs/BETA_TESTER_HANDOFF_2026-05-24.md?raw";
import shareChecklist from "../../../docs/BETA_SHARE_CHECKLIST.md?raw";
import { betaShareGuard } from "./beta-share-guard.js";
import { policyLinkGuard } from "./policy-link-guard.js";

describe("beta share guard", () => {
  it("keeps the tracked tester handoff as a placeholder template", () => {
    expect(handoffNote).toContain(betaShareGuard.operatorBuildPlaceholder);
    expect(handoffNote).toContain(betaShareGuard.feedbackChannelPlaceholder);
    expect(handoffNote).toContain("operator before sending");
    expect(handoffNote).toContain("피드백 채널");
  });

  it("keeps current MVP limits in the tester handoff before sharing", () => {
    for (const signal of betaShareGuard.requiredMvpLimitSignals) {
      expect(handoffNote).toContain(signal);
    }

    for (const check of betaShareGuard.requiredOperatorChecks) {
      expect(handoffNote).toContain(check);
    }
  });

  it("keeps the share checklist tied to operator-only values and forbidden scope", () => {
    expect(shareChecklist).toContain(betaShareGuard.operatorBuildPlaceholder);
    expect(shareChecklist).toContain(betaShareGuard.feedbackChannelPlaceholder);
    expect(shareChecklist).toContain(betaShareGuard.copiedMessageInstruction);
    expect(shareChecklist).toContain("Do not commit real beta URLs or private feedback channels");
    expect(shareChecklist).toContain(policyLinkGuard.placeholderSupportContact);

    for (const forbiddenScope of betaShareGuard.forbiddenBeforeApproval) {
      expect(shareChecklist).toContain(forbiddenScope);
    }
  });
});
