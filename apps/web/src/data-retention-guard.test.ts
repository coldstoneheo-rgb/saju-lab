import { describe, expect, it } from "vitest";
import { dataRetentionGuard } from "./data-retention-guard.js";

describe("data retention decision guard", () => {
  it("keeps report data out of server-stored payment records", () => {
    expect(dataRetentionGuard.forbiddenServerStoredPayload).toEqual([
      "birth date",
      "birth time",
      "sex",
      "timezone",
      "calculated pillars",
      "free report body",
      "paid report body",
      "PDF-ready HTML"
    ]);

    expect(dataRetentionGuard.allowedOrderRecord).toEqual([
      "order ID",
      "checkout/session ID",
      "product SKU",
      "price",
      "currency",
      "payment status",
      "provider event ID",
      "timestamps",
      "refund/support status"
    ]);

    expect(dataRetentionGuard.redactedSupportPayload).toEqual([
      "birth input",
      "calculated pillars",
      "report body",
      "PDF-ready HTML"
    ]);
  });
});
