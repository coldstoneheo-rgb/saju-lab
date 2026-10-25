# HO-2026-1026-saju-8b2-gyeokguk-01 — REPORT

발주 = `life-coordinator/handoffs/HO-2026-1026-saju-8b2-gyeokguk-01.md`. 워커 = saju-lab 창(Claude Opus 5.5). 2026-10-26 01:5x~ KST, 사용자 취침, LC 하네스. 배포 0 · AI 해석 코드 0 · 역술가 비용 0 · worktree 0(순차 브랜치 — junction 위험 0).

## 체크리스트 (완료 조건 번호)

- [x] 1. 계획 REPLY — 반박 2건(8b-1 골든 표 부재 → md 셀 유도 대조 / PR 분할 «코드+경계» vs «골든») LC 수용
- [x] 2. 8b-2 `yongsinCandidatesOf` + 테스트 50(픽스처 합성 34 + 실명식 6 + 골든 50 유도) → #113 **d32c347**
- [x] 3. 격국 K1·K2·K4·K5 → #114 **0237f8d** · K3 골든 50 유도 + 보강 6 → #115 **1d7475f**
- [x] 4. 계약 테스트 — 기본 응답 바이트 스냅샷 유지(`strength-readings.test.ts`) + `include: ["yongsinCandidates"]`·`["gyeokguk"]` → `INVALID_OPTIONS` + 코어 출력 키 집합 고정(include 개방은 9단계)
- [x] 5. Audit TASK → #112 **0661a83** (advisory 4 → 0, 테스트 수 불변)
- [x] 6. 테스트 증가분 green — core 774 → **868**(+94) · api 115 · web 49, PR마다 `npm run verify` 포그라운드 1회 EXIT 0
- [x] 7. 인계 블록(이 REPORT · AGENT_STATUS · WORKLOG) → 이 PR

## 한 일

| PR | 범위 | critic (verifier, high) | LC 게이트 | 머지 |
| --- | --- | --- | --- | --- |
| #112 | `npm audit fix` — vitest/@vitest/mocker 4.1.11→4.1.12 · vite 7.3.5→7.3.7 · esbuild 0.27.7→0.28.2, lockfile만 | 생략(LC 허용) | PASS | 0661a83 |
| #113 | 8b-2 `l2/yongsin-candidates.ts` · `docs/rules/YONGSIN-CANDIDATES.md` · 테스트 50 | PASS · 관찰 5 | PASS · 관찰 4 | d32c347 |
| #114 | 격국 K1·K2·K4·K5 `l2/gyeokguk.ts` · `docs/rules/GEOKGUK.md` · 테스트 31 | PASS · 관찰 7 | PASS · 관찰 5 | 0237f8d |
| #115 | 격국 K3 `l2/golden-gyeokguk.test.ts` 13 · 설계서·CROSS-IMPL-DIFF 문서 | PASS · 관찰 2(양인 5→4행 정정 반영) | PASS · 관찰 4 | 1d7475f |

critic 판정 전문은 각 PR 코멘트.

## 검증 (명령 · 결과)

| 명령 | 결과 |
| --- | --- |
| `npm audit` (#112 전/후) | 4 vulnerabilities(low 1 · moderate 2 · high 1) → **0** |
| `npm run verify` #112 | EXIT 0 · api 115 · core 774 · web 49 (불변) |
| `npm run verify` #113 | EXIT 0 · core **824** (+50) |
| `npm run verify` #114 | EXIT 0 · core **855** (+31) |
| `npm run verify` #115 | EXIT 0 · core **868** (+13) |
| CI `verify` #112·#113·#114 | pass (Audit 단계 포함 — 10-25 빨강 해소) |
| 변이 검사 | 8b-2 재성 step 2→3 → 16 fail · 여름 조후 水→火 → 4 fail / 격국 일간을 투출 위치에 넣음 → 1 fail (전부 원복) |

## 발견

1. **격국 설계서 §2 내부 충돌** — «음간 일간의 월지가 겁재 정기면 월겁»을 문자대로 쓰면 己 辰·戌월이 월겁인데, 같은 §2의 «토 일간 고지 월지 → 록·양인 표에 없으면 세트 규칙»과 부딪힌다. 고지 규칙을 우선해 월겁을 乙寅 丁巳 辛申 癸亥 4행으로 고정했다. 그 결과 «표 밖 정기 비겁 = 戊·己의 辰戌丑未 8칸뿐»이 두 학파 전수로 성립한다(테스트 고정). 학설 판단이라 `unreviewed` + 사용자 확인 목록 5번.
2. **8a `StrengthFactors`에 월지가 없다** — 록·양인 표는 월지로 찾는데 8a 출력에 월지 필드가 없다. 8a를 바꾸지 않고 월지 장간 목록에서 되찾았다(12지 목록이 두 학파 모두 유일 — 테스트 고정, 아니면 throw). 9단계에서 8a에 `monthBranch`를 더할지 정하면 이 우회를 걷을 수 있다.
3. **골든 50 격국 분포(yeonhae)** — 세 세트 일치 29/50 · 투출 다중 ambiguous 1행(g-1927-08-20-0915) · 정기 고정 bigyeop-month 2 · 사령 bigyeop-month 6 · 건록 7 · 양인 4 · 월겁 0(→ 보강 2). japyeong으로 바꿔도 투출 우선·정기 고정 결과는 50행 모두 같고, 사령 세트는 전부 `no-day-counts`.
4. **8b-2 골든 50 분포** — 억부 240(strong 판독 58 × 3 + weak 33 × 2) · 조후 27(겨울 13 · 여름 14) · 총 267.
5. **상위 설계 드리프트** — `docs/DESIGN-2026-09-saju-L2-stage8.md` §3-2에 `balanced` 판독이 남아 있으나 8b-1 열거에는 없다(LC #113 관찰 ②). 상위 설계는 «구현 정본이 따로 있음» 초안이라 이번엔 손대지 않았다.
6. **테스트 실행 뒤 스냅샷 `.snap`이 `git status`에 M** — `git diff --quiet` exit 0, `core.autocrlf=true` 작업 사본 CRLF를 vitest가 LF로 다시 쓰는 줄끝 차이. 커밋 대상 아님(매번 `git checkout --`로 정리).
7. **«4행» 두 뜻(LC #115 관찰 ④)** — 설계서 §2 «월겁 4행»은 월지 비겁 표의 행 수(乙寅 丁巳 辛申 癸亥), §4 «양인 4행»은 골든 50 중 양인 판정 행 수. 설계서 두 곳에 구분 문구를 넣었다(이 PR).
8. **워커 실수 1건** — K3 보강 명식을 찾으려고 만든 스크래치 테스트(`src/l2/zz-search.test.ts`, 미추적)가 #114 critic 실행과 겹쳐 그 실행에서 1 fail·tsc 4 오류를 냈다. 커밋에는 들어가지 않았고 바로 지웠다. 이후 critic 지시에 «src 안 스크래치 금지»를 넣었다.

## 테스트가 실행한 분기

| 대상 | 분기 | 테스트 |
| --- | --- | --- |
| 8b-2 | 일간 10 × verdict 3(손 기재 관계표) · 계절 4 · 세트 갈림 · 같은 오행 미병합 · japyeong 차분 · 월지충 indeterminate · 시각 미상 · Pick 입력 | `yongsin-candidates.test.ts` |
| 격국 | md↔상수(표 1~5) · 월지 되찾기 유일성 · ambiguous 4 · 건록/양인/월겁 · 戊巳 건록·戊午 양인·己午 건록·己巳 정인 · 토 고지 잡기·무투출 · 사령 unavailable(japyeong·month-term-mismatch)·비겁·nearThreshold 갈림 · 시각 미상·시간 투출 소실·일간 제외·비겁 장간 제외 · 일치·모양 · 어휘 · 계약 | `gyeokguk.test.ts` |
| 격국 K3 | 골든 50 md 셀 유도 = 코어 · 분포 · 월지충 복사 · 보강 6(실명 입력, 기둥 문자열 고정) · 불변식 전수 · japyeong · firedConditions | `golden-gyeokguk.test.ts` |

## LC 채무

- **8a 골든 50행(+ YNY 후보 2 = 52행) 독립 재계산 → confirmed PR**(09-24부터 미해소). 풀리면 같은 유도로 생성할 표: ① `GOLDEN-STRENGTH-READINGS.md` 50행(8b-1) ② `GOLDEN-YONGSIN-CANDIDATES.md` 50행(8b-2, 후보 267건) ③ `GOLDEN-GYEOKGUK.md` 50 + 보강 6 = 56행. 전부 `실행: pending`으로 시작 → LC 재계산 → confirmed. **재계산 대상 합계 = 8a 52 + 파생 156행.**

## LC·사용자에게 필요한 것

- LC: #114·#115 게이트(이 REPORT 작성 시점 상태는 위 표).
- 사용자: 아래 확인 목록(전부 기본값으로 진행 중, 막는 것 없음).

## 사용자 확인 목록 (기본값으로 진행 중, 결정 시 바꾼다)

1. 월지충 → 월령 우선 세트 `indeterminate` 유지(8b) — 기본값 유지. (10-25부터)
2. 격국 외격 포함 — 기본값 **제외**.
3. 격국 투출 다중 — 기본값 **둘 다 후보 + ambiguous**.
4. 음간 양인 — 기본값 **양간만**(음간은 월겁).
5. **(신규)** 己 일간 辰·戌월 — 기본값 **월겁 아님**(토 고지 규칙 우선 → 투출 우선 잡기 / 나머지 후보 0).
6. **(신규)** 8b-2 억부 묶음 — 기본값 **신강 = 식상·재성·관성 셋 다, 신약 = 인성·비겁 둘 다**(하나를 앞세우는 교재 입장은 병기만). 조후는 월지 계절 3개월 전부(火·水 개수 미사용).

## 다음 (우선순위)

1. LC 8a 52행 재계산 → 파생 골든 표 3장 생성 PR.
2. 신살 S1~S6 착수 HO(괴강 서지 확인 선행).
3. 9단계 include 개방 설계(`strengthReadings`·`yongsinCandidates`·`gyeokguk`) — 8a `monthBranch` 필드 여부 함께.
