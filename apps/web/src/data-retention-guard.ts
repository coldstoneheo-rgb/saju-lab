export const dataRetentionGuard = {
  forbiddenServerStoredPayload: [
    "birth date",
    "birth time",
    "sex",
    "timezone",
    "calculated pillars",
    "free report body",
    "paid report body",
    "PDF-ready HTML"
  ],
  allowedOrderRecord: [
    "order ID",
    "checkout/session ID",
    "product SKU",
    "price",
    "currency",
    "payment status",
    "provider event ID",
    "timestamps",
    "refund/support status"
  ],
  redactedSupportPayload: [
    "birth input",
    "calculated pillars",
    "report body",
    "PDF-ready HTML"
  ]
} as const;
