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

  it("aligns allowed prompt payload with the contract", () => {
    expect(aiInterpretationGuard.allowedPromptPayload).toEqual([
      "calculated pillars",
      "rules-only report section summaries",
      "confidence level",
      "missing-data notes",
      "transparency notes after input echo scrub",
      "safety disclaimers",
      "time-known status",
      "locale"
    ]);
  });

  it("excludes raw birth input, direct PII, and local report bodies from LLM payloads", () => {
    expect(aiInterpretationGuard.forbiddenPromptPayload).toEqual([
      "raw birth date",
      "raw birth time",
      "sex",
      "timezone as raw user input",
      "name",
      "email",
      "phone number",
      "direct PII",
      "payment identifiers",
      "support messages",
      "local HTML or PDF-ready HTML body",
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

    expect(aiInterpretationGuard.forbiddenOutputClaims).toEqual([
      "guaranteed success",
      "guaranteed profit",
      "guaranteed loss",
      "medical diagnosis",
      "medical treatment",
      "legal certainty",
      "investment recommendation",
      "unavoidable failure",
      "fear-based pressure"
    ]);
  });
});
