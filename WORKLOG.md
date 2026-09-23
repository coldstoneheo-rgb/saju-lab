# WORKLOG — saju-lab

> 오케스트레이터(Life Coordinator) `/project-scan`용 요약+신호 로그. 최신이 맨 위(append-only).
> 규약 전문: life-coordinator `docs/WORKLOG_PROTOCOL.md`. 상세 세션로그는 `docs/PROGRESS.md`.

---
date: 2026-09-23
project: saju-lab
agent: claude-code (Opus 5.5, TASK L2 39행 confirmed)
summary: 골든 십신·합충·대운 39·39·43행 pending → confirmed(LC 검산 1,042셀 불일치 0) + OPEN_REVIEW_ROUND 삭제(pending 상한 전면 복귀) + 머리말 모호점 2건 정정
status: on_track
progress: "골든 4표 전 행 confirmed(명식 50 · 십신 50 · 합충 50 · 대운 59) — G1-3 충족 (근거: npm run verify exit 0, life-coordinator/docs/VERIFY-2026-0923-golden-l2-39.md)"
changes:
  - "golden/l2-39-confirmed PR — docs(golden): L2 3표 39행 confirmed"
next: "LC 판정 → 머지. 8단계 HO는 사용자 G2-3 결정 뒤"
blockers: "#83·#84 브랜치·worktree 정리 = 분류기 allow 대기"
---
## 의미
골든이 50명식 전부 confirmed가 되어 8단계(강약·용신) 착수 조건 중 «골든 ≥ 50 confirmed»와 «차분 unexplained 0»이 모두 채워졌다. 남은 조건은 사용자 G2-3 결정뿐이다.

---
date: 2026-09-23
project: saju-lab
agent: claude-code (Opus 5.5, HO-2026-0923-saju-cross-impl-diff-01)
summary: 교차 구현 차분 테스트 — saju-core ↔ lunar-typescript 5,550건(골든 50 포함)+음력 1,000건, unexplained 0 CI 게이트(별도 스텝). PR 오픈, LC 판정 대기
status: on_track
progress: "unexplained 0(시드 3종) · 변이 시험(입춘 +10분)에서 unexplained 577로 게이트 실패 확인 · 코어 변경 0 (근거: npm run diff:cross-impl exit 0, npm run verify exit 0, verifier PASS, docs/CROSS-IMPL-DIFF.md)"
changes:
  - "#84 test(cross-impl): saju-core ↔ lunar-typescript 차분 게이트"
next: "LC 판정 → 머지 · #83 뒷정리(분류기 allow 뒤) · LC 검산 라운드 뒤 L2 39행 confirmed TASK"
blockers: "#83 브랜치·worktree 삭제 = auto-mode 분류기 차단, 사용자 allow 규칙 대기"
learning_need: "rebase 전 실행 수치(시드 1·42)를 REPORT에 그대로 적었다가 verifier가 잡았다 — 기준 커밋이 바뀌면 문서 수치는 전부 다시 돌린다."
---
## 의미
처음으로 **다른 원천·다른 구현**과 대량 대조가 붙었다. 명식 4주·십신·지장간·충·대운 순역·대운 간지는 불일치가 전부 원인별로 설명되고(절입 초 단위 차·23시 시간 학파·한중 음력 차), 음력 차이 66개월은 KARI로 한국 쪽이 맞음을 확인했다. 표 자체의 오류를 잡는 장치가 CI에 들어갔다.

---
date: 2026-09-23
project: saju-lab
agent: claude-code (Opus 5.5, TASK-2026-0923-golden-39)
summary: 골든 명식 11 → 50행(일진 API 34/34·윤달 KARI 4/4 교차, 코어 = 설계표 39/39) + 십신·합충·대운 골든 39행분 pending 재생성 — PR 오픈, LC 판정 대기
status: on_track
progress: "골든 50행(G1-3 범주 최소치 테스트로 고정) · 테스트 388→675 · 코어 코드 변경 0 (근거: npm run verify exit 0, verifier PASS, docs/handoffs/TASK-2026-0923-golden-39-REPORT.md)"
changes:
  - "#83 docs(golden): 골든 명식 11→50행 + L2 골든 39행분 pending"
next: "LC 판정 「머지 가」 뒤 머지 → LC 검산 라운드 뒤 L2 세 표 confirmed PR(OPEN_REVIEW_ROUND 삭제) · 병행: 교차 구현 차분 HO"
blockers: "머지 = LC 판정 대기(HANDOFF §9) · L2 39행 confirmed = LC 검산 라운드"
learning_need: "설계표의 규칙 서술 1건(B6 酉酉 자형 아님)이 규칙표와 어긋났다 — 행 값은 맞고 비고만 틀렸다. 설계표 비고도 md 규칙표 오라클로 한 번 돌리면 잡힌다."
---
## 의미
골든이 50건이 되어 1920~2100 연대·9범주(진태양시·시간미상·윤달·DST·UTC+8:30·절기경계·23시대·기본·합충)를 전부 덮는다. 일주는 전 건 외부 API 인용이라 «자기정합» 단계를 벗어났고, 8단계 HO의 G1-3 발신 조건(골든 ≥ 50)을 기계 테스트로 판정할 수 있게 됐다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, 세션 마감 2차)
summary: 세션 마감 — 하루 2차분 PR #77~#81 5건 착지(십신 confirmed·합충 v1·합충 confirmed·대운 v1·소급 보정), 골든 4표 전부 confirmed, 마감 인계서 작성
status: shipped
progress: "main 392d794 · CI 초록 · 테스트 285→388 · L2 게이지 4/8 (근거: docs/handoffs/2026-09-22-l2-stage567-close-handoff.md §1 표, origin 실측 대조)"
changes:
  - "docs(handoffs): 2026-09-22 L2 5·6·7단계 + 소급 보정 세션 마감 인계서(2차)"
next: "새 세션 첫 동작 = 인계서 §4 (pull·verify·LC 핑·골든 보강 TASK 대기)"
blockers: "골든 보강 TASK·차분 테스트 HO 발주(LC) · 만세력 교차 3건·KASI 회신(사용자) — 전부 사람/LC 손"
learning_need: "머지 게이트(LC 판정 전 머지 금지)가 #80·#81에 처음 적용됐고 판정 SLO 1시간 안에 두 번 다 회신이 왔다. 판정이 조건부일 때 조건을 같은 PR에 커밋·CI·머지까지 한 번에 끝내는 흐름이 잡혔다. 검수의 결론은 «값 결함 0, 잡아내는 장치 부족»이었고 그 장치(md 오라클·pending 상한·에러표 파서·미검증 분기 10)를 오늘 채웠다."
---
## 의미
L2 결정론 3블록(십신·합충·대운)이 전부 골든 confirmed로 고정됐고 소급 검수까지 닫혔다. 다음 세션은 코어 신설이 아니라 «골든 50건 보강 + 교차 구현 차분»으로 고정력을 먼저 올린 뒤 8단계에 들어간다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, TASK-2026-0922-retro-review-fixes)
summary: 7단계 대운 PR #80 머지(786a214) + 소급 코드 검수 보정 PR(A1~A15·B1~B4·C·D1~D5·P2, 골든 대운표 16행 confirmed) 오픈 — LC 판정 대기
status: on_track
progress: "L2 게이지 4/8(대운 머지) · main 786a214 · 테스트 358→388 · 명식·십신·합충·대운 값 변경 0 (근거: npm run verify exit 0, docs/handoffs/TASK-2026-0922-retro-review-fixes-REPORT.md 항목표)"
changes:
  - "786a214 feat(saju-core): L2 대운 v1 (#80)"
  - "fix(saju-core): 소급 검수 보정 — MISSING_BIRTH_TIME 매핑·kstDate·dayMidnight 34·본문 키 대소문자 400·골든 오라클·shared=id·에러표 파서·골든 파서 lunar/출생지/옵션·DST 결번 dst·대운 절단 클램프 (PR, 머지 대기)"
next: "LC 「머지 가」 → 보정 PR 머지 → 라이브 A1·A3·A4 curl(LC) · 09-23 골든 보강 TASK(39건)·차분 테스트 HO 대기"
learning_need: "리뷰 지적 15건 중 값 결함 0, 전부 에러 코드·메타데이터·테스트 고정력 층이었다. 골든 파서가 «같은 함수로 기대값 생성»(동어반복)이던 곳을 md 오라클로 바꾼 것이 가장 큰 고정력 개선 — 다음 단계부터 골든 파서는 처음부터 md 규칙표 오라클로 쓴다."
---
## 의미
값은 맞았고 «틀렸을 때 잡아내는 장치»가 약했다는 것이 소급 검수의 결론이었다. 이번 PR은 그 장치(에러 코드 정확성·골든 오라클·pending 상한·미검증 분기 10건)를 채운 것이라, 내일 골든 39건 보강이 들어올 때 파서(윤달·출생지·옵션)와 게이트가 준비된 상태가 된다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L2-stage7-daeun-01)
summary: 골든 합충표 confirmed(PR #79) + L2 7단계 대운 v1(12절·정규화 KST·분 소수·순역 4조합·10주+십신·절단·current) PR 오픈 — 새 머지 게이트로 LC 판정 대기
status: on_track
progress: "L2 게이지 4/8(7단계 PR 열림, 미머지) · main 60bc06c · 테스트 325→358 (근거: npm run verify exit 0, verifier PASS, docs/handoffs/HO-2026-0922-saju-L2-stage7-daeun-01-REPORT.md)"
changes:
  - "60bc06c docs(golden): 골든 합충표 11행 confirmed 기입 + 합성 케이스 3건 (#79)"
  - "feat(saju-core): L2 대운 v1 — DAEUN.md ↔ 상수, daeunOf, include daeun + referenceDate, 골든 대운표 16행 pending, 웹 대운 행 (PR 7단계, 머지 대기)"
next: "LC 「머지 가」 회신 → #7단계 스쿼시 머지 · 병행: 소급 검수 보정 PR(A1~A15·C·P2) 별도 브랜치"
blockers: "머지 게이트(09-22 18:3x 사용자): LC 코드 검수 판정 전 머지 금지 — 7단계 PR 대기 중"
learning_need: "발주서 사실 주장(1920-01-06~02-04 역행 = null)이 실측과 달랐다(소한이 표 첫 행). 발주서의 경계 사례는 반드시 코어로 한 번 돌려 REPORT에 정정을 남긴다."
---
## 의미
대운이 «분 단위 소수 그대로»로 나와 반올림 정책을 관점층에 넘겼다 — 「대운수 N」 하나를 정답으로 못 박지 않는다는 회의 원칙이 코드에 들어간 첫 사례. 이 시점부터 머지는 LC 코드 검수 판정을 거친다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L2-stage6-interactions-01)
summary: 골든 십신표 11건 confirmed 기입(PR #77) + L2 6단계 합충형 v1(간합·육합·삼합·방합·충·형) 결정론·API include·골든 합충표 pending·웹 칩
status: shipped
progress: "L2 게이지 3/8 · main 4000671(#77) + PR 6단계 · 테스트 285→322 (근거: npm run verify exit 0, docs/handoffs/HO-2026-0922-saju-L2-stage6-interactions-01-REPORT.md C1~C6)"
changes:
  - "4000671 docs(golden): 골든 십신표 11행 confirmed 기입 + 학파 고정 머리말 + 야자시 비고 (#77)"
  - "feat(saju-core): L2 합충형 v1 — INTERACTIONS.md 정본 ↔ interactions.data.ts, interactionsOfChart, options.include interactions, 골든 합충표 pending, 웹 칩+접힘 (PR 6단계)"
next: "골든 합충표 11건 LC 페르소나 검산 → confirmed 기입 PR · 7단계(대운) HO 대기"
learning_need: "LC 지시의 «학파 토글 15셀»은 구현 학파와 md 기록용 대안을 섞어 센 값이었고, 실측(20셀)으로 §6-3 반박 → 즉시 수용. 발주서 숫자는 코어로 한 번 돌려보고 기입한다."
---
## 의미
십신표가 confirmed로 고정돼 L2 첫 블록이 «검산 완료» 상태가 됐고, 합충이 규칙 ID 단위 데이터로 나오기 시작했다(관점층이 규칙 ID로 발화할 원천). 파·해·化·가중은 전부 범위 밖으로 못 박아 결정론 코어가 해석으로 새는 것을 막았다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, 세션 마감)
summary: 사주 회의 세션 마감 — 하루에 PR #66~#74 9건 착지(L1 로드맵 스파이크·1·2·3·4 + L2 5단계), 마감 인계서 작성
status: shipped
progress: "main ecd0bda · CI 초록 · 프로덕션 ecd0bda · 테스트 22→285 (근거: docs/handoffs/2026-09-22-l1-l2-close-handoff.md §1 표, 각 HO REPORT 5본)"
changes:
  - "docs(handoffs): 2026-09-22 L1·L2 세션 마감 인계서"
next: "새 세션 첫 동작 = 인계서 §4 (pull·verify·LC 핑·6단계 HO 대기)"
blockers: "KASI 저작권 회신(D10)·골든 십신표 검산·잔재 브랜치 삭제 허락 — 전부 사용자/LC 손"
learning_need: "하루 9 PR이 가능했던 조건은 «발주서 → 첫 회신에 §6 반박 → 수용 → 착수» 왕복이 매번 10분 안에 끝났고, 완료 조건이 전부 기계 판정(명령+숫자)이었다는 것. 반박이 없던 발주는 하나도 없었고(예시 오류·게이트 정의·경로), 그 반박이 재작업을 0으로 만들었다. 다만 컨텍스트 게이지가 창에 안 보이면 «60% 규칙»을 실측으로 지킬 수 없다 — 다음 세션은 상태줄을 켜고 시작할 것."
---
## 의미
회의가 요구한 «L1 명식 정확성»이 하루 만에 검증된 데이터(KASI 절기·tzdb·KARI 음력·data.go.kr 일진)로 닫혔고, L2가 십신에서 시작됐다. 다음 세션은 코드보다 «검산(역술가)·저작권 회신·6단계 발주»라는 사람 손의 입력을 기다리는 상태다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L2-stage5-tengods-01)
summary: L2 첫 단계 — 지장간 표(연해자평/자평진전 두 학파, md 정본↔ts 동일성 강제) + 십신 결정론(100조합 표 테스트), API include 블록, 골든 11건 십신표(검산 대기), 웹 카드 십신 라벨·지장간 접힘
status: on_track
progress: "5단계 C1·C2·C3·C5·C6 완료, C4는 머지·배포 후 keyless 실측(근거: docs/handoffs/HO-2026-0922-saju-L2-stage5-tengods-01-REPORT.md · verify exit 0 테스트 285 · 스크린샷 2장). L2 게이지 2/8."
changes:
  - "feat(saju-core): L2 지장간 표 + 십신 결정론 + options.include 블록 + 웹 라벨 (HO-2026-0922-saju-L2-stage5-tengods-01)"
next: "골든 십신표 검산(LC 페르소나) → confirmed 기입 PR · 6단계(합충) HO 대기"
learning_need: "십신처럼 «표 함수»인 것은 검산 라운드보다 «규칙 문장을 먼저 고정»하는 게 핵심이었다 — 동음양=비견/식신/편재/편관/편인 다섯 줄이 코드·문서·골든표를 한 번에 결정했고, 100조합 표는 그 문장의 전개일 뿐이다. 반면 지장간은 표 자체가 학파로 갈리므로 «칸별 불리언»이 아니라 «이름 있는 학파»로 노출해야 관점층이 고를 수 있다."
---
## 의미
회의 A2-1·F3 «코어는 천간·순서만, 일수는 데이터, 가중 없음»이 코드가 됐고, 사용자 화면이 처음으로 명식 너머의 구조(십신)를 «계산 층 라벨»로 보여 준다 — 해석은 아직 없다(A2-6 경계). 골든 십신표 11건은 역술가 검산의 착지점이며, 이 검산이 L2의 첫 외부 검증이다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L1-stage4-lunar-01 파트 B)
summary: 음력 입력을 saju-core로 승격 — baby의 KARI 음양력 표(1900~2050)를 TS로 이식(전수 대조 54,779일 불일치 0), calendar:"lunar"+isLeapMonth 계약, 없는 날짜는 INVALID_LUNAR_DATE, 웹 음력/윤달 입력
status: shipped
progress: "4단계 파트 B 완료(근거: docs/handoffs/HO-2026-0922-saju-L1-stage4-lunar-01-REPORT.md B1~B5 · verify exit 0 테스트 262 · 공유 골든 50건 통과 · 표 sha 두 레포 동일). L1 로드맵 스파이크·1·2·3·4 전부 착지."
changes:
  - "feat(saju-core): 음력 입력 승격 — KARI 표 TS 이식 + calendar:lunar/isLeapMonth 계약 + 웹 입력 (HO-2026-0922-saju-L1-stage4-lunar-01)"
next: "다음 HO 대기(L2). baby는 변경 요구 0(계속 로컬 변환)"
synergy: "baby-naming-ai의 Kotlin 표를 스크립트로 옮기고 같은 정의의 SHA-256(3507414e…5107)을 두 레포가 상수로 들고 있어, 어느 쪽이 표를 바꾸면 테스트가 어긋남을 잡는다. baby의 getLunCalInfo 교차 요청 6건을 이 세션이 대신 조회해 1건(2028 평5/15) 정정."
learning_need: "«이식»의 신뢰는 코드 리뷰가 아니라 원본 라이브러리와의 전수 대조(54,779일)와 지문(sha) 공유에서 온다. 표는 손으로 옮기지 않고 스크립트로 뽑았고, 골든은 baby가 만든 파일을 그대로 로드한다 — 두 레포가 같은 데이터를 다른 언어로 들고 있을 때 어긋남을 잡는 장치는 «같은 정의의 해시 상수»뿐이다."
---
## 의미
1970~80년대생이 흔히 음력으로 기억하는 생일을 사주 코어가 직접 받는다. 회의 A1-5 «baby 변환기 TS 이식»이 끝나 두 앱이 같은 음력 표를 쓰고, 윤달(2025 윤6월 같은)도 웹에서 입력할 수 있다. 라이브 검증 포인트: 2025-08-08 일주 기유·2025-07-09 기묘가 data.go.kr 일진과 일치.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L1-stage3-01 PR 2)
summary: 웹 명식 아래 「계산 규칙」 1줄 — 표준시 이력·진태양시·일주 경계를 resolution에서 조립, 경계 명식일 때만 시·도 선택 → 로컬 재계산, 23시대 접힘 참고 명식 표 + 로컬 열람 카운터
status: shipped
progress: "3단계(PR 1·2) 완료(근거: docs/handoffs/HO-2026-0922-saju-L1-stage3-01-REPORT.md · `npm run verify` exit 0 테스트 239 · 스크린샷 4장 docs/evidence/2026-09-22-stage3-web). 회의 로드맵 스파이크·1·2·3단계 전부 착지."
changes:
  - "feat(web): 명식 아래 계산 규칙 1줄 + 경계 시 시·도 선택 + 23시대 참고 명식 (HO-2026-0922-saju-L1-stage3-01 PR 2)"
next: "다음 HO 대기(4단계 음력·L2 등). 선택: HTML 내보내기에 resolution 포함"
learning_need: "카피를 계산 결과(resolution)에서만 생성하면 «화면이 거짓말할 수 없다»는 성질이 공짜로 따라온다 — 문구 상수를 두고 조건문으로 고르는 대신 값에서 문장을 만들었더니 테스트 5건이 곧 문구 명세가 됐다. 경계 창 규칙대로면 23:30은 23:00 시지 경계 안이라 «23시대 접힘 표»와 «경계 안내»가 함께 뜬다 — 사용자에겐 두 질문이 동시에 오는 셈이라 UI 단계에서 우선순위를 정할 재료."
---
## 의미
회의 F1이 화면에서 성립한다: 사용자는 «어느 규칙으로 계산했는지»를 항상 보고, 경계 명식일 때만 출생지를 묻는다. 비경계 사용자는 아무것도 보지 않는다. 다음 단계(질문 3개·카드 UI)는 이 1줄과 접힘 표를 카드 안으로 옮기는 일이다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L1-stage3-01 PR 1)
summary: 시주 옵션 도입 — 진태양시(경도 보정만, 균시차 미적용)·23시 정책·일주 경계 학파 옵션, 반대쪽 명식 alternates 상시 계산, 경계 명식 플래그 3종, 17 시·도 경도표
status: on_track
progress: "3단계 PR 1 완료(근거: docs/handoffs/HO-2026-0922-saju-L1-stage3-01-REPORT.md C1~C3·C6 · `npm run verify` exit 0 테스트 234 · 회의 사례 13:10 서울 未→午 고정). PR 2 웹 1줄 남음."
changes:
  - "feat(saju-core): 시주 옵션 — 진태양시(경도 보정)·23시 정책·alternates·nearBoundary (HO-2026-0922-saju-L1-stage3-01 PR 1)"
next: "PR 2 웹: resolution 기반 「계산 규칙」 1줄 + 경계일 때 시·도 선택 → 로컬 재계산 + 23시대 접힘 참고 명식 + 스크린샷 3장"
learning_need: "«기본값 ON/OFF» 논쟁은 두 명식을 항상 계산하고 반대쪽을 응답에 싣는 순간 사라진다 — 결정을 코어가 아니라 화면(경계일 때만 묻기)으로 미룰 수 있기 때문이다. 경계 창은 «보정 크기»가 아니라 «보정이 경계를 넘길 수 있는 벽시계 구간»으로 정의해야 한다(회의 표기 −32~+10은 방향이 뒤집혀 있었고 실측으로 [B−10, B+34]로 정정)."
---
## 의미
회의 F1 «어느 규칙으로 계산했는지 항상 응답»과 F2 «두 명식 상시 계산»이 API에서 성립한다. 서울 13:10 출생처럼 −32분 보정으로 시지가 바뀌는 사례(전체 출생의 약 1/4이 창 안)가 «경계 명식»으로 드러나고, 웹(PR 2)은 그때만 출생지를 묻는다. 균시차는 회의 결정으로 뺐고 문서에 명문화했다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L1-stage12-01 PR 1)
summary: 골든 명식 표를 md 정본으로 — 11건 전부 출처(KASI 24기 표 + data.go.kr 일진) 명기, 테스트가 md를 직접 파싱, 출처 없는 fixtures.ts 폐기
status: on_track
progress: "HO stage12 PR 1·2 완료(근거: docs/handoffs/HO-2026-0922-saju-L1-stage12-01-REPORT.md · `npm run verify` exit 0 테스트 217 · 일진 API 8/8 코어 일치). 다음 = 3단계 HO."
changes:
  - "feat(golden): 골든 명식 표 정본 + md 직접 파싱 테스트, fixtures.ts 폐기 (HO-2026-0922-saju-L1-stage12-01 PR 1)"
next: "3단계 HO(분 단위 시주+진태양시·23시 두 명식·경계 플래그·UI 1줄) 수신 시 착수"
learning_need: "골든의 «출처»는 값이 어디서 왔는지가 아니라 **값을 다시 만들 수 있는 경로**여야 한다. 연·월주는 KASI 표 행, 일주는 data.go.kr 일진 URL, 시주는 결정론 규칙 — 세 기둥의 출처가 각각 다르고, 같은 API의 lunSecha/lunWolgeon은 음력 기준이라 사주 연·월주 출처로 쓰면 틀린다(LC FYI). 이 구분을 표 머리말에 박아 두지 않으면 다음 사람이 잘못 채운다."
---
## 의미
회의 A5-3 «표가 정본, 테스트가 파싱»의 첫 구현이며, 역술가·사용자가 케이스를 보태는 착지점이 생겼다. 1990-01-01 병인일 앵커가 KASI 일진과 8/8 일치한 것은 일주 계산의 첫 외부 검증이다. 다음 3단계(진태양시·23시 정책)는 이 표에 «진태양시경계»·«23시대» 행을 추가하는 것으로 검증한다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L1-stage12-01 PR 2)
summary: 한국 시간대 이력 정규화 — 1908~1961 UTC+8:30 구간과 서머타임 12연도 출생의 시계값을 KST로 환산해 절입·일주·시주 계산, 응답에 resolution(적용 오프셋·플래그) 추가
status: on_track
progress: "PR 2 완료(근거: docs/handoffs/HO-2026-0922-saju-L1-stage12-01-REPORT.md C2~C6 · `npm run verify` exit 0, 테스트 180 · 28전이 Intl 대조 통과 · 선행 게이트 3건 값 불변). PR 1(골든 표)은 일주 출처 API 활성화 대기."
changes:
  - "feat(saju-core): 한국 시간대 이력 정규화 — UTC+8:30·서머타임 환산 + resolution 응답 (HO-2026-0922-saju-L1-stage12-01 PR 2)"
next: "PR 1 골든 표 정본화 — 파서·네거티브 테스트 먼저, data.go.kr 음양력 API 활성화 통보 뒤 출처 열 채움"
blockers: "골든 일주(日柱) 출처 — data.go.kr 음양력 API는 현재 키에 미등록(사용자 활용신청 중). KASI 24기 표 저작권 회신도 대기."
learning_need: "«시간대 = Asia/Seoul»이라는 한 단어가 1908~1988년엔 5개의 서로 다른 시계를 뜻했다. 절기표(UTC+9 고정)와 출생 기록(그날의 시계)은 같은 문자열을 써도 같은 시각이 아니다. 특히 1955~1960년 여름은 UTC+9:30이라 30분+60분이 겹치고, 서머타임 종료일 밤 11시는 두 번 있었다 — «첫 번째 채택 + 플래그»처럼 규칙을 고정하고 응답에 남겨야 나중에 실측으로 되짚을 수 있다."
---
## 의미
1954~1961년생(현재 65~72세)과 1987·88년 여름 출생의 사주가 처음으로 «그날 시계»가 아니라 «절기표의 시계»로 계산된다. 1955-02-04 22:50 같은 경계 사례는 연주·월주가 통째로 바뀐다. `resolution` 필드는 회의 F1 «어느 규칙으로 계산했는지 항상 응답»의 첫 구현이며, 3단계(진태양시·23시 정책)의 옵션도 같은 자리에 쌓인다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, HO-2026-0922-saju-L1-spike-kasi-01)
summary: 절기 소스를 KASI 24기 표(1920~2100)로 교체 — 계산 범위 2000-2028 → 1920-01-06~2100-12-07, 출처 없는 손관리 5행 폐기, 2011-11-08 입동 5시간 51분 오류 수정, 독립 천문 계산으로 3자 검증
status: on_track
progress: "HO C1~C9 전부 충족(근거: docs/handoffs/HO-2026-0922-saju-L1-spike-kasi-01-REPORT.md · `npm run verify` exit 0 · astronomia ≤2030 1,332행 100% ≤60 s · cross-check 348행 판정 완료 · 테스트 162 유니크). PR feat/l1-solar-terms-kasi-1920-2100."
changes:
  - "feat(saju-core): 절기표를 KASI 24기 입기 시각 표 1920-2100에서 생성 (HO-2026-0922-saju-L1-spike-kasi-01)"
next: "KASI 저작권 사전 협의 회신 대기(사용자 발송) → 다음 HO(시간대 이력 정규화·분 단위 시지·23시 정책)"
blockers: "KASI 24기 표는 공공누리 미표시 자료 — 저작권정책상 «사전 협의» 대상. 사용자 결정으로 출처 표시 후 머지, 문의 병행. 부정 회신 시 롤백 1명령(REPORT 참조)."
synergy: "baby-naming-ai 소비 계약(saju-pillars-v1)은 필드·산식 불변, 범위만 넓어짐. 2011-11-08 03:35~09:25 출생은 라이브 API 월주가 바뀌므로 소비 앱 캐시가 있다면 무효화 대상."
learning_need: "**같은 기관의 두 산출물도 갈린다** — data.go.kr API와 KASI 24기 표는 348행 중 20행이 달랐고 1행은 6시간 차였다. «공식 출처»라는 라벨은 검증을 대체하지 못한다. 제3의 독립 계산(천문 엔진)이 있어야 둘 중 어느 쪽이 맞는지 판정할 수 있었다. 반대로 2031년 이후는 엔진끼리도 ΔT 예측으로 갈리므로 «불일치 0»을 게이트로 걸면 미래 데이터는 영원히 통과 못 한다 — 게이트는 측정 가능한 구간에만."
---
## 의미
회의 A1-1의 «L1 명식 정확성»이 처음으로 «검증된 범위 = 쓰이는 범위»가 됐다. 1950~1999년생(현재 성인 대부분)이 그동안 400을 받던 것이 사라졌고, 2011년 11월 8일 오전 출생의 월주 오류처럼 «공식 API를 믿었기 때문에 틀린» 결과를 독립 계산으로 잡아냈다. 다음 HO(시간대 이력)는 이 표가 UTC+9 고정이라는 전제 위에서 1954~1961년·서머타임 출생을 바로잡는 단계다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, 회의 D9 1단계)
summary: package-lock.json만 갱신해 #64(08-21) 이후 처음으로 npm audit 게이트·CI verify를 초록으로 복구 — 코드·의존성 범위 변경 0
status: on_track
progress: "CI 게이트 복구 완료(근거: `npm audit fix --package-lock-only` → `npm ci` exit 0 · `npm audit --audit-level=moderate` exit 0(esbuild low 1건 잔류) · `npm run verify` exit 0 · PR chore/lockfile-audit-refresh). 회의 라운드 1·3 실측 REPORT 2건 LC 송신."
changes:
  - "chore(deps): package-lock을 npm audit fix로 갱신해 moderate 이상 취약점 0 (lockfile only)"
next: "HO-2026-0922-saju-L1-spike-kasi(KASI txt 1920-2100 적재, 2~3일) — 발주서 도착 시 착수"
blockers: "내장 절기표 ↔ KASI txt(2026-09-01 계산) 불일치 22행. 특히 2011-11-08 입동 내장 09:26 vs txt 03:35(약 6시간) — 그 구간 출생의 월주가 틀릴 수 있어 정본 판정이 스파이크에 선행해야 한다."
learning_need: "CI 빨강의 원인은 의존성 충돌이 아니라 **lockfile 정체**였다(06-27 이후 node_modules만 앞서감). 「vite 범위 충돌 대기」라는 08-23 메모는 low 1건에만 해당했고 moderate 게이트를 막던 건 lock이 고정한 옛 버전이었다. 빨간 CI를 선례 삼아 머지하기 전에 `npm audit fix --dry-run --package-lock-only` 한 번이면 알 수 있었다."
---
## 의미
게이트가 빨간 채로 3개 PR(#64·#65·#66)이 머지되면서 «verify 통과 = 완료»라는 CLAUDE.md의 완료 정의가 로컬 4종으로 축소돼 있었다. 이 PR로 정의가 원래대로 돌아오고, 다음 스파이크(절기표 1920-2100 확장)의 완료 조건을 CI 초록으로 기계 판정할 수 있게 된다. 라운드 3 검증에서 나온 22행 불일치는 스파이크 발주서의 게이트 정의를 바꾼 근거다.

---
date: 2026-09-22
project: saju-lab
agent: claude-code (Opus 5, 회의 전 세션 정비)
summary: 사주 회의(09-22) 전 세션 정비 — devlog Stop 훅 재설치, CLAUDE.md에 단일 창 지시 체계(§8) 절, AGENT_STATUS.json 신설, harness-loop-engine 스킬 복제
status: on_track
progress: "정비 5건 완료(근거: PR chore/session-harness-0922 · `npm run verify` 게이트 · settings.local.json hooks.Stop 1건 실측 · AGENT_STATUS.json json.load 통과). 제품 코드 변경 0 — 엔진은 08869ff 그대로."
changes:
  - "chore(harness): 회의 전 세션 정비 — §8 지시 체계·AGENT_STATUS·harness-loop-engine 스킬"
next: "회의 라운드 1 실측 발표(절기 범위·시간대·시주·L2 갭·테스트·유료 경계) → 라운드 4 결정에 따라 L2 결정론 갭 구현 착수"
blockers: "1989-1999 절기 4행은 여전히 fixture-limited 손관리 값(KASI API totalCount=0). 회의에서 데이터 소스 결정 필요."
learning_need: "06-20에 설치했던 devlog Stop 훅이 settings.local.json에서 사라져 있었다(gitignore 파일이라 git이 지켜주지 않음). 로컬 전용 설정은 «설치했다»가 아니라 «지금 있다»를 매 세션 실측해야 한다."
---
## 의미
회의가 «실측이 이긴다»(HANDOFF §6) 규칙으로 돌아가므로 워커 세션이 LC와 같은 규약(§8 첫 줄 형식·origin 판정·피어 메시지 ≠ 승인)을 파일로 갖고 있어야 한다. 이번 정비로 saju-lab이 baby-naming-ai·log-to-contents와 같은 관제 층(AGENT_STATUS·devlog·WORKLOG)에 올라왔고, 회의 라운드 1은 이 세션이 레포 직독으로 발표한다.

---
date: 2026-08-23
project: saju-lab
agent: claude-code (Opus 5, 절기표 확장 세션)
summary: 사주 엔진이 2024년 한 해만 계산하던 것을 KASI 공공데이터로 2000~2028년으로 넓혔다 — 소비 앱의 실사용 입력이 그동안 전부 지원 범위 밖이었다
status: on_track
progress: "**월 경계 절기표 2024 1년 → 2000-02-04 ~ 2028-12-06 (352행).** 근거: `scripts/collect_public_data_solar_terms.py --start-year 2000 --end-year 2028`로 data.go.kr KASI `get24DivisionsInfo`에서 **696건(24×29) 수집, 연도별 완전성 검사 통과**. 교차검증 3중 — ① 내장 22행(2000·2010·2015·2016·2024·2025) 전부 `match`, ② 2000-2016 구간이 2026-05-26 픽스처와 **408/408 완전 일치**, ③ 2026-05-26에 기록된 2000-02 우수 오기(`dateName=입춘`)가 상류에서 교정되어 fallback 0건. 게이트: `npm run typecheck` 0, `npm test` **255건 전부 통과**(saju-core 206 + api 17 + web 32), `npm run build` 0, `git diff --check` 0. ⚠ `npm run verify`는 `npm audit`에서 실패하나 esbuild·nanoid·postcss 개발 의존성이고 **main `9e0f476`에서 동일하게 재현** — 이 변경과 무관한 선존재 결함(의존성 0개 추가)."
changes:
  - "feat(saju-core): 월 경계 절기표를 KASI 2000-2028 수집물에서 생성"
next: "baby-naming-ai 쪽 P1 — 그라운딩 폴백이 조용한 것을 고쳐 결정론 데이터 사용 여부를 결과 메타/로그에 남긴다"
blockers: "2029년 이후는 data.go.kr가 아직 레코드를 주지 않는다(2029·2030·2035·2040·2045 전부 `totalCount=0`). 1989-1999도 여전히 0건. 둘 다 코드가 아니라 데이터 공개 대기 — 공개되면 수집기 재실행만 하면 된다."
synergy: "이 결함은 saju-lab 자체 웹에서는 거의 안 보였고 **baby-naming-ai가 소비자가 된 뒤에야 드러났다**. 소비 앱의 입력 분포(=최근 태어난 아기)가 엔진의 검증 범위(=골든 픽스처가 있는 과거 연도)와 정반대였기 때문이다. 엔진을 남에게 팔면 그 순간 «검증한 범위»가 아니라 «상대가 실제로 넣는 범위»가 품질의 기준이 된다."
learning_need: "**«검증된 범위»와 «쓰이는 범위»가 어긋나면 테스트는 전부 초록인 채로 제품만 틀린다.** saju-core 테스트는 149건이 통과하고 있었고 골든 픽스처도 맞았다. 다만 그 픽스처가 1990·2010·2015·2024년이었고, 소비자가 넣는 값은 2026년이었다. 픽스처를 늘리는 것으로는 이걸 못 잡는다 — **소비자의 입력 분포를 픽스처에 넣어야** 잡힌다. 그래서 이번에 2026-06-06(baby-naming 라이브 검증 픽스처의 실제 값)을 회귀 테스트에 박아 넣었다."
---
## 의미
지금까지 이 엔진의 «지원 범위»는 골든 픽스처를 만든 연도의 부산물이었다. 2024년 matrix를 정성껏
검증했고(Phase 4T/4U), 그 검증이 좋았기 때문에 오히려 범위가 거기서 멈춰 있어도 아무도 이상하게
느끼지 않았다. 소비자가 생기고 나서야 그 범위가 **실사용과 교집합이 0**이라는 게 드러났다.

이번 변경의 핵심은 데이터가 늘어난 것이 아니라 **표를 손이 아니라 소스에서 생성하게 만든 것**이다.
`solar-terms.ts`는 이제 로직만 갖고, 값은 KASI 픽스처에서 생성한 `solar-terms.data.ts`에 있다.
2029년 데이터가 공개되면 수집기와 생성기를 다시 돌리는 것으로 끝나고, `--check` 모드가 커밋된
표와 픽스처가 어긋난 상태를 막는다. 손으로 절입 시각을 타이핑하는 단계가 사라졌다.

런타임에 공공 API를 부르는 선택지는 의도적으로 버렸다. 계산 코어는 결정론이어야 하고 같은 입력에
같은 값을 오프라인에서도 내야 하는데, 요청 시점에 외부 API를 부르면 가용성·지연·키 관리가 계산
결과의 전제가 된다. API는 생성 시점 소스로만 쓰고 근거 픽스처를 저장소에 함께 커밋했다.

남은 정직한 한계: 상한이 2028-12-06이고 1989-1999는 여전히 빈칸이다. 둘 다 조용히 틀린 값을
주는 것이 아니라 에러로 거부하므로, 다음 사람이 이걸 «해결됨»으로 오독할 여지는 없다.

---
date: 2026-08-19
project: saju-lab
agent: claude-code (Opus 5, 앱 게이트웨이 세션)
summary: baby-naming 앱이 들고 다니던 API 키 2개를 받아오기 위해 무비밀·레이트리밋 앱 경로 2개를 열었다
status: on_track
progress: "`/api/app/gemini-generate`·`/api/app/saju-pillars` 신설(PR #64). 근거: `npx tsc -p api/tsconfig.json` 클린, `npx vitest run api` **17/17**(레이트리밋 5 + 요청 검증 12), web 테스트 32건·build 통과, `git diff --check` 클린. ⚠ `npm run verify`는 `npm audit`에서 실패하나 esbuild·nanoid·postcss 전부 vite 개발 의존성이고 이 PR은 의존성을 0개 추가했다 — 선존재 결함."
changes:
  - "#64 feat(api): 앱용 무비밀 게이트웨이 — Gemini 키를 서버로 이관"
next: "PR #64 머지 + Vercel env `GEMINI_API_KEY`(Preview+Production) 등록 → baby-naming vc12 라이브 회귀로 프리뷰 URL 실검증"
blockers: "사용자 손 1건 — Vercel env `GEMINI_API_KEY` 미등록 상태에서는 `/api/app/gemini-generate`가 503."
synergy: "**소비 방향이 뒤집혔다.** 지금까지 saju-lab은 baby-naming에 «계산»을 팔았는데, 이제 «키 보관»과 «상류 호출»까지 맡는다 — 앱 쪽 비밀 0개가 그 대가로 얻은 것이다. 이 패턴(모바일 클라이언트용 무비밀 게이트웨이)은 앞으로 다른 앱이 유료 API를 쓸 때 그대로 재사용된다."
learning_need: "**클라이언트 비밀이 없으면 방어는 «모양»과 «속도»뿐이고, 그 둘은 남용을 0으로 못 만든다.** 그래서 이 층의 목표를 «막는다»가 아니라 «폭발 반경을 유한하게»로 적었다. 레이트리밋이 인메모리라 인스턴스별이라는 것, 호출자를 인증하지 않는다는 것을 `docs/APP_GATEWAY.md`에 숨기지 않고 적은 이유도 같다 — 방어의 한계를 적어두지 않으면 다음 사람이 이걸 «해결됨»으로 읽는다."
---
## 의미
baby-naming vc11 번들에서 API 키 2개가 dex 평문으로 나왔고(08-14 감사), 그중 하나는 유료 GCP 키였다.
앱 안에 키를 안전하게 넣는 방법은 없으므로 키가 갈 곳이 필요했고, 그 자리가 여기다.

설계에서 가장 중요한 선택은 **프록시 인증 토큰을 만들지 않은 것**이다. 앱 번들에 넣은 토큰은 방금 없앤
키와 똑같이 추출되므로, 그걸 «인증»으로 계산에 넣으면 08-14에 배운 착시(보안스러운 이름의 도구를
방어로 세는 것)를 그대로 반복하게 된다. 대신 요청을 전달하지 않고 **허용목록으로 재구성**한다 —
호출자는 모델·도구·파일·후보 개수·출력 토큰 상한을 고를 수 없다. 훔쳐도 «범용 LLM 프록시»가 아니라
«상한 걸린 작명용 텍스트 엔드포인트»라서, 훔칠 가치 자체가 낮아진다.

기존 `/api/saju-pillars`의 키 게이트는 건드리지 않았다. 발행된 v1 계약이고 다른 소비자가 있으므로
앱 하나를 위해 그쪽 인증 조건을 바꾸는 것은 계약 변경이다. 공통 로직만 `_lib/`로 뽑아 두 경로가 같은
계산기를 보게 했다.

---
date: 2026-07-02
project: saju-lab
agent: claude-code (Sonnet 5)
summary: 세션 종료 — baby-naming-ai의 HO-B 완료 기록이 로컬 커밋 상태로 남아 push 대기 중
status: blocked
progress: "HO-B 완료는 saju-lab 쪽 원격에 확정됨(PR #62 머지), baby-naming-ai 쪽 동일 기록은 로컬 커밋만 존재 (근거: baby-naming-ai 커밋 `ceff283`, `git log origin/main`에 미반영 확인)"
changes: []
next: 사용자가 baby-naming-ai에서 `git push`로 `ceff283`를 origin/main에 반영해야 오케스트레이터 cross-project 스캔에 HO-B 완료가 온전히 보인다
blockers: baby-naming-ai `WORKLOG.md`의 HO-B 완료 엔트리가 원격에 없음 — 해당 레포 관례(AI Studio main 직커밋 + 사용자 수동 push)상 에이전트가 대신 push하지 않음
synergy: 사주×작명 번들 가치사슬 완료 신호가 saju-lab 쪽에서는 완결됐으나 baby-naming-ai 쪽에서 아직 원격에 반영 안 됨
---
## 의미
HO-B(baby-naming-ai 소비측 통합) 완료를 오늘 두 저장소 WORKLOG에 기록했다. saju-lab 쪽은 PR #62로
머지돼 원격에 반영됐지만, baby-naming-ai는 "AI Studio가 main에 직접 커밋 후 사용자가 수동으로 push"하는
레포 관례 때문에 해당 커밋(`ceff283`)이 아직 로컬에만 있다. 사용자가 push하기 전까지 오케스트레이터의
`/project-scan`은 baby-naming-ai 쪽 완료 신호를 읽지 못하므로, 다음 브리핑에 "push 필요" 항목으로
노출되도록 이 블로커를 명시적으로 남긴다.

---
date: 2026-07-02
project: saju-lab
agent: claude-code (Sonnet 5)
summary: HO-B(baby-naming-ai 소비측 통합) 완료 확인 — 이미 구현돼 있던 걸 라이브 교차검증으로 확정, 양쪽 저장소 WORKLOG 갱신
status: shipped
progress: "사주×작명 가치사슬 전 구간(HO-A→HO-API→deploy-fix→HO-B) 완료 (근거: baby-naming-ai 커밋 `5efea26` 이전 `5ec49a0`/`22b3585`가 이미 통합 구현, 오늘 프로덕션 API를 baby-naming-ai 로컬 `SAJU_API_KEY`로 직접 호출해 골든 케이스 재현·확인)"
changes: ["docs/PROGRESS.md HO-B를 다음후보→완료로 갱신", "baby-naming-ai ceff283 docs(worklog): record HO-B saju API integration as complete"]
next: baby-naming-ai 쪽 후속(캐싱, `GEMINI_API_KEY` 로컬 주입 후 실기기 풀플로우 검증)은 saju-lab 소관 밖 — baby-naming-ai 레포에서 진행
synergy: 사주 엔진(saju-lab)과 작명앱(baby-naming-ai)의 API 연결이 실제로 살아있음을 라이브로 재확인 — 번들 가치사슬 첫 엔드투엔드 검증
---
## 의미
saju-lab이 발행한 HO-B 핸드오프가 이미 다른 세션(AI Studio, baby-naming-ai 레포)에서 구현·머지돼 있었는데
어느 WORKLOG에도 완료로 기록되지 않아 이 문서에는 "다음 후보"로 계속 남아 있었다. 오늘 세션에서 발견하고
프로덕션 `/api/saju-pillars`를 baby-naming-ai의 실제 키로 호출해 핸드오프의 골든 교차검증 기준을 재현함으로써
"코드는 있지만 완료로 인지되지 않은" 상태를 해소했다. 오케스트레이터가 더 이상 HO-B를 열린 작업으로 오인하지 않도록
양쪽 저장소 WORKLOG를 동시에 갱신했다.

---
date: 2026-07-01
project: saju-lab
agent: claude-opus-4-8 (Claude Code · Life Coordinator 오케스트레이터)
summary: 🧪 [시범] paused 엔트리 — HO-B(작명앱↔사주 API 통합)를 열린 루프로 표식. saju-lab 실코드 변경 없음
status: paused
progress: "Phase 6(AI 해석) 진행 중 · HO-B 미착수 상태 유지 (근거: git 최신 e970cba 2026-06-30 이후 saju-lab 코드 변경 없음 — 이 엔트리는 진척 보고가 아니라 '중단 표식'이다)"
changes: []
next: HO-B 실행 — baby-naming-ai 안드로이드가 POST /api/saju-pillars 호출 → supplementPriority로 보완 한자 작명
resume: "복귀 첫 액션 = baby-naming-ai 앱의 사주 API 호출부부터 착수. 열린 것: HO-B 지시서 미발행 · SAJU_API_KEY 미주입(개방모드)이라 통합 테스트 전 키 주입 필요. 미저장 결정: 없음(코드 미변경)."
synergy: baby-naming-ai가 이 사주 엔진의 소비측 — 사주×작명 번들 가치사슬의 다음 연결
---
## 의미
Life Coordinator의 새 열린-루프 파이프(WORKLOG `status: paused` → project-scan `open_loop` → 브리핑 `🔁 열린 루프`)를 saju-lab에서 시범 검증하기 위한 엔트리다. saju-lab 코드는 건드리지 않았고, 사주×작명 가치사슬의 다음 단계 HO-B가 "아직 시작 전이지만 오케스트레이터가 다른 작업으로 이동해 열어둔" 상태임을 기계가독 신호로 남긴다. 다음 `/project-scan`이 이 엔트리를 읽어 saju-lab 상태파일에 `open_loop`를 실으면, 아침 브리핑 "열린 루프" 섹션에 HO-B 복귀 지점이 자동 노출되는지 확인하는 것이 이 시범의 목적이다.

---
date: 2026-06-30
project: saju-lab
agent: claude-opus-4-8 (Claude Code)
summary: 프로덕션 /api/saju-pillars 500 복구 — saju-pillars-v1 서버리스 함수가 프로덕션에서 로드되도록 수정
status: shipped
progress: "Phase 6(AI 해석) 진행 중 · 사주×작명 가치사슬 HO-A(오행)→HO-API(소비계약)→deploy-fix 완료, 다음 HO-B (근거: PR #60 머지 5efea26, npm run verify 통과, 라이브 프로덕션 POST→200/GET→405 확인)"
changes: ["PR #60 fix(api): make saju-pillars-v1 serverless function load in production", "2cc159f fix(api) 프로덕션 모듈로드 복구", "8e6626b chore(api) nested api/**/*.ts tsconfig 포함"]
next: HO-B 실행 — baby-naming-ai 안드로이드가 POST /api/saju-pillars 호출 → supplementPriority로 보완 한자 작명 (핸드오프 docs/handoffs/HO-2026-0620-naming-consume-01.md)
synergy: baby-naming-ai 작명앱이 이 사주 엔진의 소비측 — 사주×작명 번들의 가치사슬
monetization: saju-pillars-v1 계약 API가 다운스트림 유료 작명 번들의 기반 인프라
learning_need: SAJU_API_KEY 환경 주입 + 플랫폼 레이트리밋 운영화 (현재 키 미설정=개방 상태)
---
## 의미
라이브 프로덕션의 `/api/saju-pillars`가 모든 요청에 500을 반환하던 상태(`@vercel/node`가 `@saju-lab/saju-core` 심링크를 번들에 재생성하지 않아 bare specifier 런타임 모듈로드 실패)를 복구했다. 이로써 사주×작명 번들의 핵심 연결 고리인 소비 계약 API가 실제로 호출 가능해져, 다음 단계인 HO-B(baby-naming-ai 안드로이드 통합)가 비로소 실행 가능한 상태가 되었다. 엔진 자체(rules-only 리포트·오행 분포·보완 우선순위)는 이미 동작하므로, 남은 잠금해제는 운영화(키 주입·레이트리밋)와 소비측 통합이다.
