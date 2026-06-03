import { describe, expect, it } from "vitest";
import { aiInterpretationGuard } from "./ai-interpretation-guard.js";

describe("AI interpretation guard", () => {
  it("keeps AI disabled by default and requires rules-only fallback", () => {
    expect(aiInterpretationGuard.enabledByDefault).toBe(false);
    expect(aiInterpretationGuard.fallbackRequired).toBe(true);
    expect(aiInterpretationGuard.calculationSourceOfTruth).toContain("saju-core");
  });

  it("prevents client-side API key exposure and client-controlled prompts", () => {
    expect(aiInterpretationGuard.clientApiKeyExposureAllowed).toBe(false);
    expect(aiInterpretationGuard.serverTrustsClientPrompt).toBe(false);
    expect(aiInterpretationGuard.promptSource).toContain("server-side");
    expect(aiInterpretationGuard.promptSource).toContain("saju-core");
  });

  it("excludes raw birth input and direct PII from LLM payloads", () => {
    expect(aiInterpretationGuard.allowedPromptPayload).toContain("calculated pillars");
    expect(aiInterpretationGuard.allowedPromptPayload).toContain("rules-only report section summaries");

    expect(aiInterpretationGuard.forbiddenPromptPayload).toEqual([
      "raw birth date",
      "raw birth time",
      "sex",
      "name",
      "email",
      "phone number",
      "direct PII",
      "client-supplied prompt text",
      "client-supplied report summary"
    ]);
  });

  it("requires disclosure, safety claims, and fallback UI states", () => {
    expect(aiInterpretationGuard.disclosureLabel).toBe("AI 보조 해석");
    expect(aiInterpretationGuard.requiredUiStates).toEqual([
      "ai_disabled",
      "loading",
      "success",
      "failed",
      "rules_only_fallback"
    ]);

    expect(aiInterpretationGuard.forbiddenOutputClaims).toContain("guaranteed profit");
    expect(aiInterpretationGuard.forbiddenOutputClaims).toContain("medical diagnosis");
    expect(aiInterpretationGuard.forbiddenOutputClaims).toContain("investment recommendation");
  });
});
