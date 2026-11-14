# TASK-2026-1115 saju-lab — 배포 동결 전 사실표 · baby vc24 게이트웨이 요구 · 가장 작은 PR — REPORT

> **시작 값(완료 조건 1)**: `origin/main` = `9fdb5b6`(11-15 07:0x `git rev-parse origin/main`) · 프로덕션 배포 SHA = `9fdb5b6`(GitHub deployment 7674030188 · Production · `success` · 2026-11-10 05:01Z) → **일치** · `npm run verify` **EXIT 0**(107초 · @`e8c7947` = main + 테스트 21 → main 환산 **api 125 · core 1074 · web 63** · audit 0)

> 발주: `life-coordinator/handoffs/TASK-2026-1115-saju-pre-freeze-facts-smallest-pr.md`(`[TASK] origin:lc`, 사용자 원문 11-15 03:0x «mlp, saju도 게이트 끝나면 머지해.» 인용 있음). 워커 = saju-lab 창(Claude Opus 5.5). 라이브 LLM 호출 0 · 프로덕션 env/시크릿/Vercel 콘솔 0 · baby 레포 쓰기 0(`git show origin/main:`·`fetch`만).

## 체크리스트(완료 조건)
- [x] 1. 시작 값 — origin/main · 프로덕션 SHA 일치 · verify EXIT 0
- [x] 2. 사실표 (가)~(라) — 아래
- [x] 3. 가장 작은 PR — **#143** 구조 계약 테스트(프로덕션 동작 변경 0). #142(원문 복사)는 LC 게이트 차단으로 닫음 — 아래 «공개 레포 노출»
- [x] 4. #143 squash 머지 `cc39fff`(LC PASS-관찰 @`2b60544` · critic PASS · CI verify pass) → Production 배포 7794801202 **success**(2026-11-14T22:25:12Z) · 배포 SHA = main SHA · 첫 화면 `https://saju-lab-phi.vercel.app/` **200**(443B) · 게이트웨이 GET 405(정상, LLM 호출 0) · 런타임 변경 0 → 화면 차이 없음(캡처 없음)
- [x] 5. critic 2회(#142 PASS 9 · #143 PASS 9) · WORKLOG · AGENT_STATUS(head 정리) · 아침 손 · 컨텍스트 약 45%(추정)

## 사실표

### (가) 프로덕션 · PR · 원격 가지
| 항목 | 값 | 근거 |
|---|---|---|
| 프로덕션 SHA | `9fdb5b6` = main | `gh api …/deployments?environment=Production` 최신 3건: 9fdb5b6(11-10 05:01Z) · 35899d1 · 56410de, 상태 `success` |
| 열린 PR(시작) | 0 | `gh pr list --state open` 빈 출력 |
| 원격 가지 | **2개**(발주서 «5»와 다름) | `git ls-remote --heads origin` |
| └ `main` | 살아 있음 | — |
| └ `cloud/saju-8a-monthbranch` | **머지됨(잔재)** — PR #132 MERGED 11-05, squash라 main 조상 아님 | `gh pr list --head … --state all` |
| (이 과제 뒤) `test/baby-hanja-p5-contract` | PR #142 닫음 · 원격 가지 삭제(로컬 유지) | `gh pr close` · `gh api -X DELETE …/refs/heads/…` |
| (이 과제 뒤) `test/gateway-hanja-contract-masked` | PR #143 | — |

### (나) PLAN §4 8b-1 · 8b-2
| 단계 | 상태 | 근거 |
|---|---|---|
| 8b 설계서 | 머지 | #108 `a719d90` |
| 8b-1 강약 판독 `strengthReadingsOf` | 코어 구현 머지 | #109 `9cf9be8` |
| 8b-2 용신 후보 `yongsinCandidatesOf` · 격국 K1~K5 | 코어 구현 머지 | #113 `d32c347` · #114 `0237f8d` · #115 `1d7475f` |
| API include 개방 | 8a `strengthFactors` 개방 + L2 블록 5종 계약 | #130 `cfdeef8` · #131 |
| 프로덕션 화면 | **무료 L2 칩 2종(강약 팩터 요약 · 신살 이름)만** 노출 | #138 `56410de`(11-10 배포 success, 캡처 `docs/captures/2026-11-10-prod-138/`) |
| 유료 3블록(강약 판독 · 용신 후보 · 격국) 화면 | 미착수 — F3 «지금대로»(LC 가정 C) · 13단계 문안 뒤 | AGENT_STATUS.json next_actions · TASK-2026-1110 REPORT |
| 학설 축 | 골든 `pending`(역술가 대조 미완, `doctrine: unreviewed`) | HO-2026-1025 REPORT 체크 1 |

### (다) baby vc24(hanja-p5)가 게이트웨이에 요구하는 것 — **결론: 그대로 지남 · 변경 필요 0**
입력 = baby `da0ed41` `app/src/test/resources/hanja-p5/request-*.json` 4개(읽기만 — 이 레포에는 구조만 가린 사본, #143). release는 Moshi 기본(널 생략, `GeminiApi.kt:153`)이라 `provider`·`claudeEffort`·`claudeRoutingOptIn`이 본문에 없다.

| 항목 | 판정 | 근거 |
|---|---|---|
| 경로 | 그대로 됨 | 같은 `GeminiApiService` → `/api/app/gemini-generate` |
| 인증 | 그대로 됨(**인증 없음** — 아래 ①) | `gemini-generate.ts:16-20` |
| 스키마 검증 | 그대로 됨 — 축소 0 | 키 전부 허용목록 `gemini-request.ts:83-95`, 깊이 4 ≤ 8, 노드 ≤ 15 ≤ 300, description ≤ 2,000자. PR #143 테스트가 «되돌린 요청 = 앱 본문»(구조) 단언 |
| 모델/provider | 그대로 됨 | provider 없음 → gemini, providerExplicit false(`gemini-request.ts:197-202`), 모델은 서버 고정 `GEMINI_MODEL`/`gemini-3.5-flash`(`gemini-generate.ts:23,77`) |
| 요청 크기 | 그대로 됨 | 시스템 ≈0.7~1.0천 자 ≤ 24,000 · 사용자 ≈0.2~0.35천 자 ≤ 12,000 · 전체 ≪ 96KiB(`gemini-request.ts:13-27`) |
| 응답 크기 · 스키마 전달 | 그대로 됨 | `responseSchema` 그대로 상류 전달, 성공 본문 원문 통과(`gemini-generate.ts:117-120`). 서버 쪽 응답 크기 제한 없음 |
| 레이트 리밋 | 그대로 됨(관찰 — 아래 ①②) | 20회/5분/IP/인스턴스(`gemini-generate.ts:31-32`, `rate-limit.ts:4-12`) |
| attempt=2 | 그대로 됨 | 허용(`gemini-request.ts:206-209`). release는 sub=null(`llm-routing.ts:26`) → 같은 Gemini, 타임아웃 180s(`gemini-generate.ts:219,231`) |
| 타임아웃 | 그대로 됨 | 상류 180s(`:39`) < maxDuration 300s(`vercel.json`). baby read 92s가 먼저 끊는다 — 이 요청은 기존 프리미엄 목록(실측 68.7s)보다 작다 |
| 라우팅(debug 옵트인) | 그대로 됨(release 해당 없음) | `responseSchema` 있음 → list 취급(`:218`), Claude 어댑터는 minItems=maxItems 배열을 고정 키로 바꿈(`claude-adapter.ts:12,75-76`) |
| 응답 품질 · 생각 토큰 | **확인 불가**(라이브 필요) | baby REPORT «아침 확인» — 5회 ≈$0.15 상한(추정, baby 쪽 산정). saju 쪽 추가 라이브 0 |

① **인증 없음 = 기기당 하루 10회 상한은 서버에서 강제되지 않는다.** 서버 쪽 제한은 IP별 · 서버리스 인스턴스별 메모리 창 20회/5분**뿐**이다(`gemini-generate.ts:31-32,59,176-180`). 인스턴스가 여럿이면 실효 상한은 20 × 동시 인스턴스, 콜드 스타트마다 창이 빈다(`rate-limit.ts:8-12`). 금액의 최종 상한은 GCP 콘솔의 Gemini 쿼터다(코드 밖). 하루 상한 · 기기 식별은 서버에 없다.
② **호출 수 대비 20회/5분**: hanja 1회 생성 = 최대 2호출(실패 → attempt=2 1회, 또는 프리미엄 편지 빠짐 → 같은 요청 1회; `HanjaMeaningPrompt.kt:358-388`) → 하루 10회 전부 재시도해도 20 = 한도와 같다. 이름 추천 프리미엄 1회 = 목록 1 (+재시도 1) + 카드별 편지 최대 10(편지 재시도 없음, `NamingRepository.kt:655-690,706-`) = **최대 12호출**. 같은 IP · 같은 인스턴스에서 5분 안에 이름 추천 프리미엄 1회(12) + hanja 4회 이상(8+)을 섞으면 21번째부터 429(`Retry-After` 포함). 쿼터 · 결제 소비는 성공 뒤라(baby 설계서 §1-2) 사용자 손실은 없고 실패 안내가 뜬다. 통신사 CGNAT로 여러 사용자가 한 IP를 나누면 더 빨리 닿는다(현 사용자 규모에선 관측 없음).

### (라) 동결 전 프로덕션에 넣을 값이 있는 후보 3개
| # | 무엇 | 왜 동결 전 | 견적 | 위험 | 화면 |
|---|---|---|---|---|---|
| 1 | **한자 뜻 요청 구조 계약 테스트**(PR #143) | 동결 중 baby vc24가 이 경로를 쓰므로, 동결 해제 전 게이트웨이 수정이 계약을 깨면 CI에서 막는다. 프로덕션 동작 불변 | 30분(완료) | 없음(테스트만) | 없음 |
| 2 | 레이트 리밋 상수 조정(예: 20→30회/5분) 또는 hanja 경로 별도 창 | ② 경계가 한도와 같음. 동결 중엔 못 바꾼다 | 30~45분 + 테스트 | 남용 상한 1.5배 ↑(쿼터 캡이 최종선) | 없음 |
| 3 | 서버 쪽 일일 상한(기기 식별 없이 IP 하루 N회, 메모리 창) | ① 하루 10회가 클라이언트에서만 강제됨 | 2~3시간(인스턴스별이라 효과 제한 · 공유 저장소면 계정·의존성 추가) | 정상 사용자 오탐 · 무상태 서버리스에서 효과 약함 | 없음 |
- 권고: 1만 동결 전 머지. 2 · 3은 실측(429 로그) 없이 바꿀 근거가 약하다 → «아침 손».

## 검증
| 명령 | 결과 |
|---|---|
| `npx vitest run api/_lib/baby-hanja-p5.contract.test.ts` | 21 passed · EXIT 0 |
| `npx tsc -p api/tsconfig.json` | EXIT 0 |
| `npm run verify` @`e8c7947`(LC «무거움 가» 뒤 포그라운드 · 시작 여유 RAM 4.62GB · java 0) | **EXIT 0** · 107초 · api 146 · core 1074 · web 63 · audit 0 vulnerabilities |
| 권고 반영 `0bcdd3e`(테스트 단언만) | `npx vitest run api/` 146/146 · `tsc -p api` 0 · `git diff --check` 0 |

## critic
- #143(`verifier`, 원본에 마스킹 스크립트 재실행 → 픽스처 `cmp` 바이트 동일 · 누출 스캔 0 · api 149 × 3회 반복 통과): **PASS 9/10** · must-fix 0. 권고(비차단): 모델 고정 단언 없음 · shape 확인 스크립트 미포함.
- #142 1회차(`verifier` 서브에이전트, 정적 + 변이 테스트, @`e8c7947`): **PASS 9/10** · must-fix 0. 변이: `SCHEMA_KEYS`에서 minItems/maxItems 각각 제거 → 17/21 실패(잠금 실효 확인). 권고 1(개수 단언이 undefined면 통과) → `0bcdd3e` 반영(무료 4 · 프리미엄 9 직접 단언).
- effort: 세션 medium 유지 · critic은 `verifier` 정의 그대로(올린 곳 없음).

## 공개 레포 노출(#142) — 사실
- saju-lab = PUBLIC · baby-naming-ai = PRIVATE(`gh repo view --json visibility`). 워커가 공개 범위를 확인하지 않고 baby 요청 스냅샷 4개를 바이트 그대로 복사했다(LC 안이 복사 여부를 워커에 맡김 — LC도 확인 누락을 인정).
- 노출: 가지 push ≈2026-11-14T22:10Z → PR 생성 22:11:29Z → 닫음 22:17:49Z(약 7분). 파일 4개(2,812 · 2,809 · 3,891 · 3,837 B). 비밀값 0(키 · 토큰 · URL 패턴 0줄) · 개인정보 = 테스트 견본 이름 1개 외 0.
- 남은 것: `refs/pull/142/head`와 커밋 2개는 GitHub에 남는다 — 완전 삭제는 GitHub 지원 요청(사용자 결정). force-push · 이력 재작성 0.
- 이미 main에 있던 baby 유래 문구(git grep 키워드 5개 기준 · 필드 이름 포함): `api/_lib/baby-request-fixtures.ts` 9 · `__snapshots__/gemini-generate.regression.test.ts.snap` 6 · `claude-adapter.test.ts` 6 · `claude-generate.test.ts` 2 · `claude-adapter.ts` 1(모두 10-11 `347a465` #98) · `gemini-generate.routing.test.ts` 2(10-15 `a26ec5e`) · `gemini-request.test.ts` 1(08-21 `9e0f476`) · `docs/DESIGN-dualllm-saju-baby.md` 1 · `docs/eval/2026-10-16-claude-list-prompt-ab.md` 7(10-16 `7902785`) · `WORKLOG.md` 1. 이번 과제에서 손대지 않음.

## 아침 손(사용자 · 기본값)
1. 후보 2(레이트 리밋 조정): 기본값 **안 함** — 동결 기간 Vercel 로그에서 `RATE_LIMITED` 429가 관측되면 해제 뒤 재검토.
2. 후보 3(서버 일일 상한): 기본값 **안 함** — GCP 쿼터 캡이 금액 상한. 쿼터 캡 값이 현재 몇인지는 사용자 콘솔 확인 필요(코드 밖).
3. 원격 가지 `cloud/saju-8a-monthbranch`(PR #132 머지 잔재) 삭제: 기본값 **삭제**(남의 세션 가지라 이 창은 안 지움 — 승인 시 `gh api -X DELETE repos/coldstoneheo-rgb/saju-lab/git/refs/heads/cloud/saju-8a-monthbranch`).
4. hanja-p5 라이브 품질 확인 5회(≈$0.15, baby 산정): baby 쪽 아침 목록과 같은 항목 — saju 쪽 추가 호출 0.
5. 11-20 전 배포 창에 넣을 것: #143 외 **없음**(기본값).
6. #142 완전 삭제(GitHub 지원 요청으로 PR 142 · 커밋 `e8c7947` `0bcdd3e` 제거) 여부 — 사용자 결정(기본값 없음). 사실: 공개 약 7분(22:10Z~22:17:49Z) · 파일 4개 · 비밀값 0.
7. 10-11부터 main에 있는 baby 유래 문구(위 «공개 레포 노출» 목록: 파일 10개 · 최초 커밋 08-21 ~ 10-16) 정리 여부 — 사용자 결정(기본값 없음). 정리해도 git 이력엔 남는다.
8. saju-lab 레포를 비공개로 돌릴지 — 사용자 결정(기본값 없음). 사실: 현재 PUBLIC(`gh repo view` 11-15). 비공개 전환 시 Vercel 연동 · Actions 분 과금 영향은 이 창에서 확인하지 않음(확인 불가).

## 한 일 / 발견 / LC · 사용자에게 필요한 것
- 한 일: (다) 정적 대조 · 계약 테스트 PR #142(닫음) → #143 · 사실표.
- 발견: 원격 가지 2개(발주서 5와 다름) · AGENT_STATUS head `56410de`는 낡음(실제 `9fdb5b6`) · 레이트 리밋 경계 = hanja 최악 호출 수와 같음.
- 필요한 것: LC 게이트(#143) · 아침 손 6·7(노출 처리).
