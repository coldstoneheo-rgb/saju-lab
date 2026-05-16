export const paymentDecisionGuard = {
  candidates: ["Stripe Checkout", "PortOne", "Toss Payments"],
  failureStates: [
    "Payment failed before authorization",
    "Payment succeeded but report generation failed",
    "Payment succeeded but download failed",
    "Duplicate payment",
    "User closes the page after payment",
    "Webhook or session verification failed",
    "Provider outage or timeout"
  ],
  forbiddenProviderPayload: [
    "birth date",
    "birth time",
    "sex",
    "timezone",
    "calculated pillars",
    "report body",
    "PDF-ready HTML"
  ]
} as const;
