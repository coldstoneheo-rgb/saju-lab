import { policyLinkGuard } from "./policy-link-guard.js";

export interface PolicyPageSection {
  title: string;
  items: string[];
}

export interface PolicyPage {
  path: (typeof policyLinkGuard.userFacingPolicyPaths)[number];
  title: string;
  summary: string;
  statusNote: string;
  sections: PolicyPageSection[];
}

export const policyPages: PolicyPage[] = [
  {
    path: "/policies/privacy",
    title: "개인정보 처리 안내 초안",
    summary: "Saju Lab은 첫 유료 상세 리포트를 계정 저장 없이 로컬 다운로드 중심으로 설계하고 있습니다.",
    statusNote: "이 문서는 결제 오픈 전 사용자 안내 구조를 확인하기 위한 초안이며, 최종 법적 검토 전입니다.",
    sections: [
      {
        title: "현재 MVP에서 처리하는 정보",
        items: [
          "생년월일, 출생시간, 성별, 타임존은 리포트 생성을 위해 이 브라우저에서 사용됩니다.",
          "현재 MVP는 로그인, 계정 저장, 서버 동기화, 저장된 리포트 목록을 제공하지 않습니다.",
          "무료 HTML 저장과 PDF-ready 상세 리포트 저장물은 사용자의 기기에서 생성되는 다운로드 파일입니다."
        ]
      },
      {
        title: "첫 유료 상품의 데이터 경계",
        items: [
          "출생정보, 계산된 사주 구조, 리포트 본문, PDF-ready HTML은 결제 제공자에게 보내지 않는 방향입니다.",
          "결제나 환불 처리를 위해 필요한 주문 식별자, 상품명, 가격, 통화, 결제 상태 같은 최소 정보만 별도 기록 후보입니다.",
          "정확한 보관 기간과 삭제 요청 방식은 실제 결제 오픈 전 최종 정책에서 확정해야 합니다."
        ]
      }
    ]
  },
  {
    path: "/policies/refund-support",
    title: "환불 및 지원 안내 초안",
    summary: "결제 실패, 중복 결제, 다운로드 실패처럼 유료 상세 리포트에서 생길 수 있는 상황을 미리 정리합니다.",
    statusNote: "실제 지원 이메일 또는 지원 폼은 아직 확정되지 않았으며, 결제 오픈 전 반드시 교체해야 합니다.",
    sections: [
      {
        title: "지원 요청 원칙",
        items: [
          "지원 문의에는 주문 또는 결제 식별자 중심으로 대응하는 구조를 우선합니다.",
          "생년월일, 출생시간, 계산된 사주 구조, 리포트 본문, PDF-ready HTML은 지원 문의에 포함하지 않도록 안내합니다.",
          "사용자가 민감한 리포트 내용을 임의로 보낸 경우, 지원 처리에 꼭 필요하지 않은 내용은 보관하지 않는 방향입니다."
        ]
      },
      {
        title: "환불 검토가 필요한 경우",
        items: [
          "중복 결제, 결제 성공 후 다운로드 실패, 제공자 장애로 인한 미전달 상황은 환불 또는 재전달 검토 대상입니다.",
          "단순 해석 선호 차이만으로 환불 가능 여부를 단정하지 않으며, 최종 기준은 결제 오픈 전 정책에서 확정합니다.",
          "응답 예상 시간, 환불 가능 기간, 처리 방식은 실제 지원 채널과 결제 제공자가 정해진 뒤 확정합니다."
        ]
      }
    ]
  },
  {
    path: "/policies/usage-caution",
    title: "이용 유의사항 초안",
    summary: "Saju Lab 리포트는 자기 이해와 의사결정 점검을 돕는 설명형 참고 자료입니다.",
    statusNote: "이 문서는 사용자 안내 고지 문구의 초안이며, 결제 오픈 전 최종 검토가 필요합니다.",
    sections: [
      {
        title: "해석 범위",
        items: [
          "리포트는 경향, 주의점, 점검 질문을 설명하며 확정된 미래를 예언하지 않습니다.",
          "출생시간을 모르는 경우 일부 해석의 신뢰도는 낮아지며, 리포트 안에서 그 영향을 표시합니다.",
          "전통 명리 해석을 현대적인 설명 문장으로 풀어 쓰되, 사용자가 현실 자료와 함께 판단하도록 안내합니다."
        ]
      },
      {
        title: "중요한 결정 전 확인",
        items: [
          "커리어, 재무, 관계, 건강과 관련된 결정은 계약서, 예산, 전문가 의견, 실제 상황을 함께 확인해야 합니다.",
          "Saju Lab은 전문 투자, 의료, 법률 자문을 제공하지 않으며 특정 결과를 보장하지 않습니다.",
          "불안이나 부담을 키우는 방식으로 리포트를 해석하지 않도록, 문장은 가능성과 점검 방향 중심으로 제공합니다."
        ]
      }
    ]
  }
];

export function findPolicyPage(pathname: string): PolicyPage | undefined {
  return policyPages.find((page) => page.path === pathname);
}
