import { afterEach, describe, expect, it } from "vitest";
import appHandler from "../app/saju-pillars.js";
import keyedHandler from "../saju-pillars.js";
import type { ApiRequest, ApiResponse } from "./http.js";

/** Captures what a handler answers. */
function call(handler: (req: ApiRequest, res: ApiResponse) => void, body: unknown, headers: ApiRequest["headers"] = {}) {
  const out: { status?: number; payload?: unknown } = {};
  const res: ApiResponse = {
    status(code) {
      out.status = code;
      return res;
    },
    json(payload) {
      out.payload = payload;
    },
    setHeader() {}
  };
  handler({ method: "POST", headers, body }, res);
  return out as { status: number; payload: Record<string, unknown> };
}

const base = { birthDate: "1988-10-09", birthTime: "02:30", calendar: "solar", sex: "other" };
const L2 = ["strengthReadings", "yongsinCandidates", "gyeokguk", "sinsal"];

describe("saju-pillars routes — 9단계 L2 블록 노출 (HO-2026-1026-l2-include)", () => {
  afterEach(() => {
    delete process.env.SAJU_API_KEY;
  });

  it("keyless /api/app/saju-pillars는 L2 판독 블록 include를 INVALID_OPTIONS로 거절, 기존 블록·기본 응답은 그대로", () => {
    for (const block of L2) {
      const denied = call(appHandler, { ...base, options: { include: ["hiddenStems", block] } }, { "x-forwarded-for": `10.0.0.${L2.indexOf(block)}` });
      expect(denied.status, block).toBe(400);
      expect((denied.payload.error as { code: string }).code).toBe("INVALID_OPTIONS");
    }
    const plain = call(appHandler, base, { "x-forwarded-for": "10.0.1.1" });
    const keyed = call(keyedHandler, base);
    expect(plain.status).toBe(200);
    expect(JSON.stringify(plain.payload)).toBe(JSON.stringify(keyed.payload));
    expect(call(appHandler, { ...base, options: { include: ["hiddenStems"] } }, { "x-forwarded-for": "10.0.1.2" }).status).toBe(200);
  });

  it("키 라우트도 SAJU_API_KEY 미설정(열린 상태)이면 L2 판독 블록을 거절, 기존 블록은 그대로", () => {
    delete process.env.SAJU_API_KEY;
    for (const block of L2) {
      const denied = call(keyedHandler, { ...base, options: { include: [block] } });
      expect(denied.status, block).toBe(400);
      expect((denied.payload.error as { code: string }).code).toBe("INVALID_OPTIONS");
    }
    expect(call(keyedHandler, { ...base, options: { include: ["hiddenStems", "daeun"] } }).status).toBe(200);
  });

  it("키 라우트 /api/saju-pillars는 맞는 x-api-key로 네 블록을 모두 싣는다", () => {
    process.env.SAJU_API_KEY = "test-key";
    expect(call(keyedHandler, { ...base, options: { include: L2 } }).status).toBe(401);
    const opened = call(keyedHandler, { ...base, options: { include: L2 } }, { "x-api-key": "test-key" });
    expect(opened.status).toBe(200);
    for (const block of L2) expect(Array.isArray(opened.payload[block]), block).toBe(true);
  });
});
