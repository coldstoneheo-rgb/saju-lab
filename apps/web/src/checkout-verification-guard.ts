export const checkoutVerificationGuard = {
  allowedSessionFields: [
    "product SKU",
    "price",
    "currency",
    "order ID",
    "checkout/session ID",
    "return URL",
    "cancel URL",
    "locale"
  ],
  allowedVerificationFields: [
    "provider session ID",
    "payment status",
    "provider event ID",
    "amount",
    "currency",
    "product SKU",
    "order ID",
    "timestamps",
    "refund/support status"
  ],
  forbiddenCheckoutPayload: [
    "birth date",
    "birth time",
    "sex",
    "timezone",
    "calculated pillars",
    "free report body",
    "paid report body",
    "PDF-ready HTML"
  ],
  states: [
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
  ],
  liveCheckoutEnabled: false
} as const;
