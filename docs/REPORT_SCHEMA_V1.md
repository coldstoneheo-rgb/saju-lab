# Report Schema v1 (Detail)

## 목적
- 설명 중심의 보고서 구조를 표준화
- 각 섹션은 확정/추정 범위를 분리해 표시

## 섹션 구성

1) Overview
- 비신비적 톤, 쉬운 언어
- 오락/정보성 혼합
- 법적/의학적/재무적 비권고 고지 포함

2) Personality
- 강점/블라인드 스팟 분리
- 판단 근거는 투명성 섹션에 연결

3) Career & Finance
- 결정지원 강조(행동 제안 포함)
- 위험요인/리스크 관리 문구 포함

4) Yearly Outlook
- 2026년 중심, 확장 가능 구조
- 핵심 하이라이트와 주의사항 분리

5) Monthly Highlights
- 좋은 달/주의 달 표시
- 판단 근거는 텍스트로 설명

6) Action Suggestions
- 습관, 계획, 리스크 관리 항목으로 분리

7) Transparency
- 확정 정보 vs 추정 정보 구분
- 출생시간 미상 시 신뢰도 하향 및 설명

## 필수 Disclaimers
- 정보/오락 목적
- 투자/의학/법률 자문 아님

## Phase 3A Rules-Only 구현 메모
- MVP 기본 리포트는 AI 없이 deterministic rule 조합으로 생성한다.
- 룰은 계산된 기둥을 바탕으로 성향, 커리어, 재무, 연간/월간 흐름, 행동 제안, 투명성 문구를 채운다.
- 모든 섹션은 최소 1개 이상의 문장을 가져야 하며, disclaimer와 transparency는 누락될 수 없다.
- 문장은 확정 예언이 아니라 경향, 준비 방향, 리스크 관리 중심으로 작성한다.
