# HO-2026-1025-saju-8b-design-01 — REPORT

발주 = `life-coordinator/handoffs/HO-2026-1025-saju-8b-design-01.md`. 워커 = saju-lab 창(Claude Opus 5.5). 2026-10-25 17:5x~19:4x KST, 사용자 외출 중, LC 하네스. 배포 0 · AI 해석 코드 0 · 역술가 비용 0.

## 체크리스트 (완료 조건 번호)

- [x] 1. 계획 REPLY — 8a 골든 실측: `| pending |` 50 · `| confirmed |` 0, 마지막 갱신 a253f08(#90)·팩 54230cb(#93) → 완료 조건 3은 **(b) 분기**
- [x] 2. 8b 설계서 `docs/design/8b-strength-judgment.md` → #108 **a719d90**
- [x] 3. 8b-1 구현(판정 함수 + 픽스처 24 + 골든 50 md 유도 대조) · (b) READINGS 골든 표 보류 · 8a 재계산 LC 채무 1줄 → #109 **9cf9be8**
- [x] 4. 격국·신살 설계서 2장 → #110 **8fe4a04**
- [x] 5. baby 공급 계약 테스트(기본 응답 바이트 스냅샷 + `strengthReadings` include 미개방 → `INVALID_OPTIONS`) + include-only 1절(`SAJU_PILLARS_API_V1.md`) → #109
- [x] 6. 테스트 증가분 green · verify(Audit 선존재 fail 표기) · verifier PASS ×3 · LC 게이트 ×3 → 머지
- [x] 7. 인계 블록(이 REPORT · AGENT_STATUS · WORKLOG) → 이 PR

## 한 일

| PR | 범위 | verifier | LC 게이트 | 머지 |
| --- | --- | --- | --- | --- |
| #108 | 8b 설계서 + REPORT 초안 | PASS(high) — 골든 50 분포 독립 재계산 일치 | 차단 0 · 관찰 5 | a719d90 |
| #109 | `l2/strength-readings.ts` · `docs/rules/STRENGTH-READINGS.md` · 테스트 34 · 계약 테스트 · API include-only 1절 · `agreesAcrossSets` | PASS(high) — core 774/774, 기본 응답 671B main 실측 일치 · 델타 재검증 | 판정 반영 | 9cf9be8 |
| #110 | 격국 취격·신살 설계서 2장(코드 0) | 조건부 PASS(high) — 명리 사실 틀린 칸 0, 권고 6 반영 | 차단 0 · 관찰 6 | 8fe4a04 |

## 검증 (명령 · 결과)

| 명령 | 결과 |
| --- | --- |
| `npm run verify` (#109 브랜치, `agreesAcrossSets` 전) | typecheck OK · api **115** · core **774**(기준선 740, +34) · web **49** · build OK · **Audit fail**(아래) → EXIT 1 |
| `npx vitest run src` + `npx tsc --noEmit` (core, `agreesAcrossSets` 뒤) | 774/774 · tsc OK · root `npm run typecheck` OK · `git diff --check` OK |
| CI `verify` (#108·#109·#110) | Audit 단계만 failure, 나머지 step success |
| `npx vitest run src/index.test.ts src/saju-pillars-v1.test.ts` (core, 첫 커밋 직후) | **238** — LC 보고의 «core 238»은 이 두 파일 분할만의 수다(core 전체 774와 다른 집계) |

**Audit 선존재 결함 4건:** `npm audit --audit-level=moderate` → 4 vulnerabilities(low 1 · moderate 2 · high 1), vitest / `@vitest/mocker` 계열(로그: «Depends on vulnerable versions of @vitest/mocker»), `npm audit fix` 가능 표시. main 마지막 CI(10-15 #107)는 green이었으므로 그 뒤 공개된 advisory다. 이 HO 변경과 무관하다. **권고:** 의존성 업그레이드 TASK 1건 별도(vitest 메이저 여부 확인 → verify 전체 재실행).

## 테스트가 실행한 분기 (8b-1)

| 분기 | 테스트 |
| --- | --- |
| 득령·득지·득세 8조합 × 월지충 2 | 합성 16 (기대값 손 기재, 코드 미참조) |
| triadCount 1↔2 경계 · 충 우선순위 | 합성 2 |
| 득세 동률 `≥` (3:3) | g-2024-02-04-1727 |
| 세트 갈림 · `agreesAcrossSets` false/true | g-2013-05-22-0530 · g-2015-12-22-0030 |
| 월지충 → month-first `indeterminate` | g-2011-11-08-0925 |
| YYY · NNN | g-2015-12-22-0030 · g-2005-04-22-0130 |
| 시각 미상 `precision` 복사 | g-1972-03-14-xxxx |
| `japyeong` 판독 차분 | 골든 50 전체 → 1행(md 「학파 차분」 표와 대조) |
| 골든 50 md 셀 유도 = 코어 · 분포 고정 | triad 29/21/0 · month-first 29/12/9 · 갈림 10 = `agreesAcrossSets` false 10 |
| 규칙 md ↔ 코드 | 표 1 토큰 · 표 2 규칙 · 표 3 doctrine |
| 계약 | 기본 응답 바이트 스냅샷 · include 미개방 거절 |

## 발견

1. **japyeong 판독 차분 1/50** — g-1923-10-05-0840 辛亥일: yeonhae 亥 여기 戊(정인) → 득지 Y(YYN, triad strong) / japyeong 亥 = 甲·壬 → 득지 N(YNN, triad weak). 지장간 학파 선택이 강약 판독까지 바꾸는 실제 사례. `docs/rules/STRENGTH-READINGS.md` 「학파 차분」에 고정.
2. **회의 1003 E3 «세트 간 일치 필드»** 가 첫 구현에서 빠졌다가 추가됐다(`agreesAcrossSets`, #109 859936b). 격국 설계서에도 같은 이름으로 명시.
3. **월지 비겁 처리 = 범위 확대** — 회의 E2 «정격 8격만» 대비 격국 설계에 건록·양인·월겁 3 id를 더했다. 사용자 확인 목록 5번.
4. **lunar-typescript 1.8.6** — 격국 API 없음, 신살 계열은 택일용(`getDayJiShen`·`getDayXiongSha`·`getDaySha`·`getTianShen*`). 둘 다 명식 교차 차분 대상 아님.
5. **괴강 판본** — 「庚辰 庚戌 壬辰 戊戌(壬戌 제외)」 판본 존재 가능(verifier 기억, 서지 미확인). 신살 착수 HO에서 서지 확인.

## 사고 기록 — 워크트리 정리 중 메인 작업 트리 삭제 (복구 완료)

- **무엇:** #109 머지 뒤 `git worktree remove --force ../saju-8b1`이 워크트리 안의 NTFS junction(`node_modules` → 메인 repo `node_modules`, `apps/web/node_modules` → 메인 `apps/web/node_modules`)을 따라가 메인 repo의 `node_modules`와 `apps/web`·`packages/saju-core` 추적 파일 90개를 지웠다. 직전 junction 해제(`rmdir`)는 경로 이스케이프 오류로 실패했는데, 그걸 확인하지 않고 `--force`로 진행했다.
- **피해:** 추적 파일 90개(전부 커밋된 상태) · 의존성 · 빌드 산출물. `.env.local`·`.vercel`·`.claude/settings.local.json`은 남아 있었다. 원격·커밋 영향 0.
- **복구:** `git restore -- apps packages` → 삭제 90 → 0 · `npm ci` · main에서 typecheck OK · test api115·core774·web49 · build OK · `git status` clean.
- **재발 방지:** 워크트리에 junction을 걸었으면 제거 전에 `cmd /c rmdir <junction>` 성공을 확인하고, `--force` 없이 `git worktree remove`를 쓴다. 남은 복사본 `C:\Users\colds\saju-8b1`은 `rm -rf`가 권한 거부돼 그대로 두었다(내용 = 추적 파일 복사본, junction 없음 확인).

## LC 채무

- **8a 골든 52행(골든 50 + YNY 후보 2) 독립 재계산 → confirmed PR**(`OPEN_REVIEW_ROUND` 삭제). 09-24부터 미해소. 풀려야 ① 8b-1 READINGS 골든 표(`실행: pending`) ② 격국 골든이 생긴다. 신살 골든은 8a와 무관.

## 착수 HO로 넘기는 것

- 8b-2 `yongsinCandidatesOf` — 인터페이스는 설계서 §6 고정, 구현은 다음 회차(`note` 필드 포함).
- 격국 K1~K6 + LC 관찰: `exposed` 일간 투출 필터 경계 테스트(K4) · 골든 50 격국 분포 표.
- 신살 S1~S6 + 괴강 서지 확인.

## 사용자 확인 목록 (기본값으로 진행 중, 결정 시 바꾼다)

1. 월지충 → 월령 우선 세트 `indeterminate` 유지(8b) — 기본값 유지.
2. 격국 외격 포함 — 기본값 **제외**.
3. 격국 투출 다중 — 기본값 **둘 다 후보 + ambiguous**.
4. 음간 양인(격국·신살 공통) — 기본값 **양간만**.
5. 건록·양인·월겁 3격 추가(회의는 정격 8격) — 기본값 **추가**.
6. 신살 N종 — 기본값 **7종**(12신살 제외) · 기준 기둥 **연지·일지 둘 다**.

## effort

- 세션 medium · verifier high 핀 **있음** — `.claude/settings.json:35` · `.claude/agents/verifier.md:6`. 별도 PR 불필요. 이번 HO에서 올린 곳 없음(verifier는 정의대로 high).

## LC·사용자에게 필요한 것

- LC: 8a 52행 재계산(채무) · Audit 의존성 TASK 발주 여부 · 다음 HO(8b-2 + 격국 착수) 순서.
- 사용자: 위 확인 목록 6건(급하지 않음 — 기본값으로 막힘 없음).
