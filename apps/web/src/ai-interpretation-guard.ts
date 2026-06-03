export const aiInterpretationGuard = {
  enabledByDefault: false,
  disclosureLabel: "AI 보조 해석",
  calculationSourceOfTruth: "saju-core rules-only calculation",
  fallbackRequired: true,
  clientApiKeyExposureAllowed: false,
  serverStoresReportData: false,
  serverTrustsClientPrompt: false,
  promptSource: "server-side saju-core generated report",
  allowedPromptPayload: [
    "calculated pillars",
    "rules-only report section summaries",
    "confidence level",
    "missing-data notes",
    "transparency notes",
    "safety disclaimers"
  ],
  forbiddenPromptPayload: [
    "raw birth date",
    "raw birth time",
    "sex",
    "name",
    "email",
    "phone number",
    "direct PII",
    "client-supplied prompt text",
    "client-supplied report summary"
  ],
  forbiddenOutputClaims: [
    "guaranteed success",
    "guaranteed profit",
    "medical diagnosis",
    "legal certainty",
    "investment recommendation",
    "unavoidable failure"
  ],
  requiredUiStates: ["ai_disabled", "loading", "success", "failed", "rules_only_fallback"]
} as const;
