import { describe, expect, it } from "vitest";
import { INCLUDE_BLOCKS } from "../../packages/saju-core/src/index.js";
import { KEYLESS_DENIED_INCLUDES, KEYLESS_INCLUDE_BLOCKS, keylessDeniedIncludes } from "./saju-pillars.js";

/**
 * keyless 면 fail-closed(#126 LC 관찰 ① · CLOUD-2026-1102-saju-keyless-i5 완료 조건 1).
 * 거절 목록은 리터럴이 아니라 `INCLUDE_BLOCKS` − 허용 목록이다. 새 블록은 손대지 않아도 keyless에서 거절된다.
 */
describe("keyless include 노출 — 허용 목록에서 파생", () => {
  it("집합 일치: 허용 ∪ 거절 = INCLUDE_BLOCKS, 교집합 0", () => {
    expect([...KEYLESS_INCLUDE_BLOCKS, ...KEYLESS_DENIED_INCLUDES].sort()).toEqual([...INCLUDE_BLOCKS].sort());
    expect(KEYLESS_DENIED_INCLUDES.filter((block) => (KEYLESS_INCLUDE_BLOCKS as readonly string[]).includes(block))).toEqual([]);
  });

  it("허용 목록 = 5~7단계 명식 사실 4블록(9단계 판독 블록은 keyless에 0)", () => {
    expect(KEYLESS_INCLUDE_BLOCKS).toEqual(["hiddenStems", "tenGods", "interactions", "daeun"]);
  });

  it("현재 거절 목록은 이전 리터럴과 같은 값·순서(라우트 오류 메시지 불변)", () => {
    expect(KEYLESS_DENIED_INCLUDES).toEqual(["strengthReadings", "yongsinCandidates", "gyeokguk", "sinsal"]);
  });

  it("새 블록 id를 INCLUDE_BLOCKS에 더하면 거절 목록이 자동으로 따라간다", () => {
    expect(keylessDeniedIncludes([...INCLUDE_BLOCKS, "probeBlock"])).toEqual([...KEYLESS_DENIED_INCLUDES, "probeBlock"]);
  });
});
