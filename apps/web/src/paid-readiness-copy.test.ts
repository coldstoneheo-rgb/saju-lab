import { describe, expect, it } from "vitest";
import { paidReadinessCopy } from "./paid-readiness-copy.js";

describe("paid readiness copy", () => {
  it("keeps the paid panel framed as a readiness preview instead of live checkout", () => {
    const copy = [paidReadinessCopy.headline, ...paidReadinessCopy.items].join(" ");

    expect(copy).toContain("현재 화면은 구매 버튼이 아니라 상세 리포트 준비 방향을 보여줍니다.");
    expect(copy).toContain("개인정보, 환불/문의, 사용 고지 초안을 기준으로 checkout 전 점검을 진행합니다.");
    expect(copy).toContain("결제 제공자, 데이터 보관, 실제 지원 연락처가 확정된 뒤 결제를 엽니다.");
    expect(copy).toContain("첫 유료 상품은 계정 저장 없이 로컬 다운로드 중심으로 설계합니다.");
    expect(copy).not.toContain("지금 구매");
    expect(copy).not.toContain("바로 결제");
    expect(copy).not.toContain("결제하기");
  });
});
