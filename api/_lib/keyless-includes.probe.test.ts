import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * 끝-끝 증명: 테스트 안에서만 `INCLUDE_BLOCKS`에 새 블록 id를 하나 더한다(커밋되는 블록 추가 0).
 * 코어는 그 이름을 받아들이지만(키 라우트 200), keyless 두 면은 라우트에서 거절한다 — 거절 목록을 고치지 않고도.
 */
vi.mock("../../packages/saju-core/src/types.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../packages/saju-core/src/types.js")>();
  return { ...actual, INCLUDE_BLOCKS: [...actual.INCLUDE_BLOCKS, "probeBlock"] };
});

const { default: appHandler } = await import("../app/saju-pillars.js");
const { default: keyedHandler } = await import("../saju-pillars.js");
const { KEYLESS_DENIED_INCLUDES } = await import("./saju-pillars.js");
type Handler = typeof appHandler;

function call(handler: Handler, body: unknown, headers: Record<string, string> = {}) {
  const out: { status?: number; payload?: Record<string, unknown> } = {};
  const res = {
    status(code: number) {
      out.status = code;
      return res;
    },
    json(payload: unknown) {
      out.payload = payload as Record<string, unknown>;
    },
    setHeader() {}
  };
  handler({ method: "POST", headers, body }, res);
  return out as { status: number; payload: Record<string, unknown> };
}

const body = { birthDate: "1988-10-09", birthTime: "02:30", calendar: "solar", sex: "other", options: { include: ["probeBlock"] } };
const routeDenial = (payload: Record<string, unknown>) => (payload.error as { code: string; message: string });

describe("keyless 면 fail-closed — 임시 블록 probeBlock", () => {
  afterEach(() => {
    delete process.env.SAJU_API_KEY;
  });

  it("거절 목록이 probeBlock을 자동으로 포함", () => {
    expect(KEYLESS_DENIED_INCLUDES).toContain("probeBlock");
  });

  it("키가 걸린 키 라우트: 코어가 probeBlock을 받아들인다(200) — 블록이 정말 «열린» 상태", () => {
    process.env.SAJU_API_KEY = "test-key";
    expect(call(keyedHandler, body, { "x-api-key": "test-key" }).status).toBe(200);
  });

  it("keyless 앱 라우트와 키 미설정 키 라우트: 라우트에서 INVALID_OPTIONS로 거절", () => {
    for (const out of [call(appHandler, body, { "x-forwarded-for": "10.9.0.1" }), call(keyedHandler, body)]) {
      expect(out.status).toBe(400);
      expect(routeDenial(out.payload).code).toBe("INVALID_OPTIONS");
      expect(routeDenial(out.payload).message).toContain("This route does not serve the include blocks");
      expect(routeDenial(out.payload).message).toContain("probeBlock");
    }
  });
});
