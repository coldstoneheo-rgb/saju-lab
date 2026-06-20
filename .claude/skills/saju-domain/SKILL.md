---
name: saju-domain
description: saju-lab의 사용자 대면 사주 리포트/UI 카피를 쓰거나 검토할 때 사용한다. 톤 정책과 도메인 가드레일(결정론적 점술 금지, 면책·confidence·불확실성 표현, KR-first i18n)을 적용한다. 리포트 문구, 안내 카피, 해석 텍스트 작업에 적용.
---

# saju-domain — 사주 카피/리포트 가드레일

saju-lab은 운세가 아니라 **설명형 리포트**다. 경향과 불확실성을 설명하되 단정하지 않는다.

## 작성 전 읽기
- 톤: `docs/TONE_GUIDE.md`
- 리포트 스키마: `docs/REPORT_SCHEMA_V1.md`
- AI 해석 정책/계약: `docs/AI_INTERPRETATION_POLICY.md`, `docs/AI_PROMPT_CONTRACT.md`
- i18n 키: `docs/i18n/KEYS.md`, 한국어 원문: `docs/i18n/ko.json`

## 불변 규칙
1. 결정론적 점술 표현 금지 — "반드시 성공/필연적 실패", 의료·재무·법률 확정.
2. 경향·가능성·조건부 어조를 쓴다 ("…하는 경향", "…일 수 있다").
3. 모든 리포트에 면책 + 투명성(추론 vs 확정, confidence)을 포함한다.
4. 출생 시각 등 소스 결손 시 confidence를 낮추고 영향을 설명한다.
5. AI 해석은 rules-only 결과를 보조할 뿐, 대체하지 않는다.
6. 한국어 카피가 기본. 영어는 같은 i18n 구조(키)로만 추가한다.

## 작성 후
- 새/변경 텍스트는 하드코딩하지 말고 i18n 키로 넣는다 (ko 우선).
- 사용자 대면 변경이면 `verifier` 서브에이전트나 `/verify`로 검토한다.
