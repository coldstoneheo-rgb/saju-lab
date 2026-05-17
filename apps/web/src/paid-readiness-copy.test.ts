import { describe, expect, it } from "vitest";
import { paidReadinessCopy } from "./paid-readiness-copy.js";

describe("paid readiness copy", () => {
  it("keeps the paid panel framed as a readiness preview instead of live checkout", () => {
    const copy = [paidReadinessCopy.headline, ...paidReadinessCopy.items].join(" ");

    expect(copy).toContain("현재 화면은 구매 버튼이 아니라 상세 리포트 준비 방향을 보여줍니다.");
    expect(copy).toContain("개인정보, 환불/문의, 사용 고지 초안을 기준으로 checkout 전 점검을 진행합니다.");
    expect(copy).toContain("결제 실패, 다운로드 실패, 중복 결제 대응 기준을 checkout 전에 정리합니다.");
    expect(copy).toContain("출생정보와 리포트 본문은 결제 제공자에게 보내지 않고 서버에 보관하지 않는 방향입니다.");
    expect(copy).toContain("개인정보, 환불/지원, 사용 고지 링크 구조를 정하고 실제 지원 연락처 교체를 준비합니다.");
    expect(copy).toContain("정책 페이지는 결제 오픈 전 검토용 초안이며 최종 법적 문서가 아닙니다.");
    expect(copy).toContain("결제 성공 여부는 주문/세션 정보로만 검증하고 사주 리포트 데이터는 전송하지 않는 방향입니다.");
    expect(copy).toContain("최종 결제 제공자, 실제 지원 연락처, 사용자-facing 정책 페이지가 확정된 뒤 결제를 엽니다.");
    expect(copy).toContain("첫 유료 상품은 계정 저장 없이 로컬 다운로드 중심으로 설계합니다.");
    expect(copy).not.toContain("support@example.com");
    expect(copy).not.toContain("지금 구매");
    expect(copy).not.toContain("바로 결제");
    expect(copy).not.toContain("결제하기");
  });
});
