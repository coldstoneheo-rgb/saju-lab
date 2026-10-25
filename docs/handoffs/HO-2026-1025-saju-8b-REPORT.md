# HO-2026-1025-saju-8b-design-01 — REPORT (작성 중)

발주 = `life-coordinator/handoffs/HO-2026-1025-saju-8b-design-01.md`. 워커 = saju-lab 창(Claude Opus 5.5). 착수 2026-10-25.

## 체크리스트 (완료 조건 번호)

- [x] 1. 계획 REPLY — 8a 골든 실측: `| pending |` 50 · `| confirmed |` 0, 마지막 갱신 a253f08(#90)·팩 54230cb(#93) → 완료 조건 3은 **(b) 분기**
- [ ] 2. 8b 설계서 `docs/design/8b-strength-judgment.md` → PR·머지
- [ ] 3. 8b-1 구현(판정 함수 + 픽스처 ≥20) · (b) 골든 보류 표기 · 8a 재계산 LC 채무 1줄 → PR·머지
- [ ] 4. 격국·신살 설계서 2장 → PR·머지
- [ ] 5. baby 공급 계약 테스트(기본 응답 바이트 동일) + include-only 1절
- [ ] 6. 테스트 증가분 green · verify · verifier PASS → LC 게이트 → 머지
- [ ] 7. 인계 블록(REPORT·AGENT_STATUS·WORKLOG) → PR·머지

## PR

| PR | 범위 | 상태 |
| --- | --- | --- |
| A | 설계서 + 이 REPORT 초안 | 작성 |
| B | 8b-1 `l2/strength-readings.ts` + `docs/rules/STRENGTH-READINGS.md` + 테스트 + 계약 테스트 | — |
| C | 격국·신살 설계서 | — |
| D | 인계 블록 | — |

## effort

- 세션 medium · verifier high 핀 **있음** — `.claude/settings.json:35` · `.claude/agents/verifier.md:6`. 별도 PR 불필요.

## LC 채무

- 8a 골든 52행(골든 50 + YNY 후보 2) 독립 재계산 → confirmed PR(`OPEN_REVIEW_ROUND` 삭제). 09-24부터 미해소. 이게 풀려야 8b-1 골든 READINGS 표를 만든다.
