# 2026-09-22 세션 마감 인계 (2차) — L2 5단계 confirmed → 6단계 합충 → 7단계 대운 → 소급 검수 보정

- **마감 SHA(콘텐츠) = origin/main `392d794`**(PR #81 머지, CI 초록). 이 인계서 자체의 PR이 그 뒤에 머지되므로 다음 세션의 origin/main은 문서만 더한 SHA다 — `git log --oneline -2`로 `392d794`가 바로 아래에 있으면 정상.
- 작업트리 clean · 로컬 브랜치 `main`만 · 원격 브랜치 `origin/main`만(머지 브랜치 5개 전부 삭제·prune) · 이 세션이 띄운 vite dev 서버 종료(포트 5173 LISTEN 0), vitest 잔류 0.
- 세션 컨텍스트: 약 45~50%(추정, 상태줄 미노출). 1차 마감 인계서(`2026-09-22-l1-l2-close-handoff.md`, main `ecd0bda`~`1348a5d`)의 후속이며 그 문서의 §5 도구·규약은 그대로 유효.
- 발신·검수는 LC `life-coordinator-52`(HANDOFF §8). 이 레포 정본 기록 = `WORKLOG.md`(09-22 블록 +4) · `docs/PROGRESS.md` · `AGENT_STATUS.json` · REPORT 4본.

## 1. 오늘(2차) 착지한 PR — 전부 squash 머지, CI 초록, origin 실측 대조

| PR | 내용 | 머지 SHA | REPORT |
| --- | --- | --- | --- |
| #77 | 골든 십신표 11행 `confirmed`(LC 검산 194셀 일치) + 학파 고정 머리말(japyeong 토글 실측 20셀·대안 15셀 병기, LC 「15셀」 정정 수용) + 야자시 비고 | `4000671` | — (TASK, WORKLOG 블록) |
| #78 | L2 6단계 합충형 v1: `docs/rules/INTERACTIONS.md` ↔ `l2/interactions.data.ts`, `interactionsOfChart`(간합 5·육합 6·삼합 4·방합 4·충 6·형 4, 인접 비억제·중복 나열·shared·포섭), `include: interactions`, 골든 합충표 pending, 웹 칩+접힘 | `24bccc0` | `HO-2026-0922-saju-L2-stage6-interactions-01-REPORT.md` |
| #79 | 골든 합충표 11행 `confirmed`(LC 3자 일치) + 글자 순서 머리말 + 합성 케이스 3건(丑戌未 완전 삼형·子卯 상형·辰辰 2기둥) | `60bc06c` | — (TASK) |
| #80 | L2 7단계 대운 v1: `docs/rules/DAEUN.md`(순역 4조합·12절) ↔ `l2/daeun.ts`, `daeunOf`(정규화 KST·정오 대체·엄격히 뒤/이하·D÷4320 소수·10주+십신·절단·current·other 두 벌), `resolveBirthKst`, `include: daeun` + `referenceDate`, 골든 대운표 16행, 웹 대운 행. **첫 머지 게이트 적용 PR**(LC 판정 「머지 가」 뒤 머지) | `786a214` | `HO-2026-0922-saju-L2-stage7-daeun-01-REPORT.md` |
| #81 | 소급 코드 검수 보정: A1 `MISSING_BIRTH_TIME`·A2 `kstDate`·A3 dayMidnight [−10,+34]·A4 본문 키 대소문자 400·A5 골든 합충 md 오라클·A6 에러표=유니언 파서·A7~A11·A12 골든 lunar(윤달)·P2 출생지·옵션 열·A13~A15·B1~B4·C(동어반복 4·pending 20%·미검증 6)·D1~D5·대운 미검증 4·**골든 대운표 16행 confirmed**. LC 조건부 판정 → 조건 4건 반영 후 머지 | `392d794` | `TASK-2026-0922-retro-review-fixes-REPORT.md` |

테스트 285 → **388**(api 17 + saju-core 334 + web 37). 명식·십신·합충·대운 **값 변경 0**(골든 4표 = GOLDEN-PILLARS 11 · GOLDEN-TENGODS 11 · GOLDEN-INTERACTIONS 11 · GOLDEN-DAEUN 16, 전부 `confirmed`).

## 2. 현재 엔진 상태
- L1: 1차 인계서 그대로 + `resolution.calendar.kstDate`(additive) · dayMidnight 창 [−10,+34] · DST 결번 시각 `dst`+`nonexistent` · 절기 경계일×timeUnknown → `MISSING_BIRTH_TIME`.
- L2: 지장간(2학파) · 십신 · **합충형 v1**(파·해·천간충·化·가중 제외) · **대운 v1**(세운·반올림·대운↔원국 합충 제외). **없음**: 강약·용신(8), 격국·신살.
- 계약 `saju-pillars-v1`: `options.include` = `hiddenStems | tenGods | interactions | daeun`, `options.referenceDate`. 에러 코드 유니언 = `SAJU_PILLARS_V1_ERROR_CODES`(문서 표와 파서 테스트로 1:1, `UNSUPPORTED_CALENDAR` 제거). baby 소비 필드 불변. `include` 없이 부르면 4단계 응답 + `kstDate` 1키.
- 골든 파서: 달력 열 `lunar`/`lunar(윤달)`, 선택 열 `출생지`·`옵션` 지원(내일 39건 보강의 P1·P2 선결 완료). 골든 3표(십신·합충·대운)는 md 규칙표 오라클 + pending 상한 20%.

## 3. 대기·미결
| 항목 | 상태 | 담당 |
| --- | --- | --- |
| **골든 보강 TASK(39건 → 50)** | 설계표 `life-coordinator/docs/GOLDEN-CANDIDATES-2026-0923.md`. 일진 API 34일 조회 + 행 추가 + 십신·합충·대운 골든 재생성. **지시 도착 시 착수** — 파서는 준비됨. §6 D3·Q4 현행 동작은 #81 REPORT에 답함(설계 결정 LC) | LC 발주 → 워커 |
| **교차 구현 차분 테스트 HO**(lunar-typescript) | 예고만. 발주서 대기 | LC |
| **8단계(강약·용신 후보) HO** | 보정 머지 + 골든 보강 + 차분 테스트 뒤. **그 전 착수 금지**(십신 개수 집계·투간·득령득지득세·월령 사령·파생 불리언·化 재료·공협 전부 미구현 유지) | LC |
| 라이브 A1·A3·A4 재현 curl | `392d794` 배포 뒤 LC가 3건(`1958-02-04 timeUnknown` → `MISSING_BIRTH_TIME` · `1990-06-15 00:33 jeonnam trueSolarTime+trueSolar` → `dayMidnight` 경고 · `"birthplace":"jeju"` → `INVALID_BODY`) | LC |
| 시중 만세력 대운수 교차 3건 | 사용자 표본 대기 → `GOLDEN-DAEUN.md` 비고 「교차: …」 | 사용자 |
| KASI 24기 표 저작권(D10) | 회신 대기(1차 인계서 §3 롤백 절차 유효) | 사용자 |
| 머지 게이트 | 09-22 18:3x 사용자 지시(정본 `life-coordinator/docs/ACTION-PLAN-2026-0922-saju-quality-gates.md` §G3): PR 열기·CI·verify·verifier PASS → REPORT(draft) → LC 판정 → 「머지 가」 뒤 머지. #80·#81에 적용됨. **계속 적용** | 워커 |
| pending 상한 운영 규칙 | 새 골든표는 100% pending으로 시작하므로 `MAX_PENDING_RATIO`는 confirmed 기입 PR에서 켠다(#81 REPORT §6) | 워커 |

## 4. 다음 세션 첫 동작
1. `git fetch` → `git pull --ff-only origin main` → `git log --oneline -2`에 `392d794` 확인 → `npm ci` → `npm run verify`(기대 388 tests, exit 0).
2. LC 창(`life-coordinator-*`, `ListAgents`로 확인)에 `[REPORT] origin:lc — 세션 재개 · HEAD · 모델 · 컨텍스트 %` 핑.
3. 골든 보강 TASK 발주서 대기. 도착하면 P1·P2 열을 써서 행 추가 → `GOLDEN-*` 3표 재생성(pending, 상한은 confirmed PR에서) → PR → REPORT(draft) → LC 판정.
4. 라이브 실측은 keyless `POST https://saju-lab-phi.vercel.app/api/app/saju-pillars`. 스크린샷은 `npm run dev --workspace @saju-lab/web` + Chrome MCP(React 제어 입력은 `form_input`이 아니라 native setter + input 이벤트 JS로 넣는다) → `docs/evidence/<날짜-단계>/`.

## 5. 이 세션에서 만든 도구·규약
- 테스트 측 md 규칙표 로더: `l2/interactions-rules.load.ts` · `l2/hidden-stems-rules.load.ts`(index.ts 미export). 골든 파서는 코드 표 대신 이 오라클로 기대값을 유도한다(A5 패턴) — 8단계 골든표도 같은 패턴으로.
- `retro-review-2026-0922.test.ts`: 검수 항목별 고정 테스트 파일. 다음 검수 보정도 같은 형식(항목 번호 = describe 이름).
- `resolveBirthKst(input)`: 정규화 KST 벽시계(대운 등 「출생 순간」이 필요한 블록용).
- 실측 정정 기록 5건(REPORT §6): 학파 토글 15→20셀 · 1920 역행 null 미도달 · A9 kind/id 동치 · D4 십신은 일간 종속 · 발주서 예시 g-2011-0334 실제 산출. **발주서의 숫자·경계 사례는 코어로 한 번 돌려 REPORT에 정정을 남긴다.**
- 작업 위생: Bash 히어독 안에 아포스트로피(`'s`)가 있으면 도구가 실패한다 → 스크립트는 파일로 써서 실행. 셸 리다이렉트 오타로 생긴 0바이트 파일(`0`, `8`, `dateValue(...)`)이 두 번 섞였다 → 커밋 전 `git status --short`의 `??`를 반드시 본다.
