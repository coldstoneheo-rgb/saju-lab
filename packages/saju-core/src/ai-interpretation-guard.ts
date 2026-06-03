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
    "transparency notes after input echo scrub",
    "safety disclaimers",
    "time-known status",
    "locale"
  ],
  forbiddenPromptPayload: [
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
  ],
  forbiddenOutputClaims: [
    "guaranteed success",
    "guaranteed profit",
    "guaranteed loss",
    "medical diagnosis",
    "medical treatment",
    "legal certainty",
    "investment recommendation",
    "unavoidable failure",
    "fear-based pressure"
  ],
  requiredUiStates: ["ai_disabled", "loading", "success", "failed", "rules_only_fallback"]
} as const;
