import { describe, expect, it } from "vitest";
import { toFriendlyError } from "./friendly-error.js";

describe("friendly error mapping", () => {
  it("maps solar-term boundary errors to Korean correction copy", () => {
    expect(toFriendlyError(new Error("birthTime is required on solar-term boundary dates."))).toBe(
      "절기 경계일에는 출생시간이 필요합니다. 현재 MVP에서는 이 날짜를 시간 미상으로 계산할 수 없으니, 가능한 정확한 시간을 입력해 주세요."
    );
  });

  it("maps calculation range and validation errors without exposing internals", () => {
    expect(toFriendlyError(new Error("No upper solar month boundary is available for the given date."))).toContain("현재 MVP 계산 범위");
    expect(toFriendlyError(new Error("Expected a valid Gregorian date."))).toContain("실제 존재하는 양력 날짜");
    expect(toFriendlyError(new Error("birthTime must use HH:mm format."))).toContain("00:00부터 23:59");
    expect(toFriendlyError(new Error("Only Asia/Seoul timezone is supported."))).toContain("Asia/Seoul");
  });

  it("falls back to a generic user-facing correction", () => {
    expect(toFriendlyError(new Error("Unexpected internal error"))).toBe("리포트를 생성하지 못했습니다. 입력값을 다시 확인해 주세요.");
  });
});
