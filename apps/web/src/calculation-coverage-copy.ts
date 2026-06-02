export const calculationCoverageCopy = {
  headline: "현재 MVP 계산 범위",
  summary:
    "Saju Lab은 검증된 절기 데이터가 있는 입력부터 안정적으로 계산합니다. 일부 과거 연도는 아직 외부 출처 확인이 남아 있어 지원 범위를 단계적으로 넓히는 중입니다.",
  items: [
    "data.go.kr 한국천문연구원 특일 정보 API로 2000-2016년 24절기 fixture를 수집해 검토했습니다.",
    "1989-1999년 절기 기록은 같은 API에서 제공되지 않아 별도 승인된 출처가 필요합니다.",
    "지원 범위를 벗어난 날짜는 결과를 억지로 만들지 않고 MVP 계산 범위 안내로 표시합니다."
  ]
} as const;
