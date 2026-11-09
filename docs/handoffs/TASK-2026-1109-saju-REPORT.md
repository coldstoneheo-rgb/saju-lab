# TASK-2026-1109 — L2 층 노출 결정 기록 · 반영 계획 · 11-20 배포 묶음 (saju-lab REPORT)

- 발주: LC `life-coordinator/handoffs/TASK-2026-1109-saju-l2-layer-exposure.md` (origin:user — 사용자 원문 «둘다 권고대로.»)
- 워커: claude-code (Opus 5.5), 2026-11-09. effort: 세션 medium. 서브에이전트 verifier 3회(#137 critic · #138 verifier · #138 critic)는 정의 기본값으로 돌렸고 올린 곳은 없다.
- 상태: **[HOLD-대기]** — #138 머지(= 프로덕션 배포)는 사용자 직접 승인 대기.

## 체크리스트 (발주서 완료 조건)

- [x] (a) 미커밋 스냅샷 원인 — 3파일(LC 실측 2 + `l2/strength-readings` 1)이고 내용 변경은 0이다(blob 해시 HEAD=작업트리 3/3). 11-07 00:40 #134 작업 중 vitest가 LF로 다시 쓰면서 생긴 stat-dirty였다. LC 수용 → `git add`로 정규화, staged 0줄·status 빈칸.
- [x] 1) 결정 기록 — #137 1420c44 → critic PASS 9.5 + LC PASS → squash **5722e03**, 브랜치 정리.
- [x] 2) 반영 계획 REPLY — LC 판정: A안 «가», B·C 수용, F1·F2 반박 수용.
- [x] 3) 수용 범위 구현 — #138(무료 칩 2종, apps/web만). verify EXIT 0 · verifier PASS(비차단 N1~N4 반영 950d8a6) · critic 1차 FAIL 7/10(B1 강약 칩 값 대조 없음) → 8a8be2a·3fa596b 보정 → 재critic → LC 게이트 요청. **머지 0**(F2: 사용자 직접 승인).
- [x] 4) 배포 묶음 표 (아래)
- [x] 5) REPORT · AGENT_STATUS · WORKLOG → [HOLD-대기]

## 한 일

| PR | 내용 | 상태 |
| --- | --- | --- |
| #137 | 설계서 §4 «결정» 열 6행 + §6 1번 상태 줄 (문서만) | 머지 5722e03 |
| #138 | 무료 화면 강약 팩터 요약 칩 · 신살 한글 이름 칩 + 안내 문구, `l2-chips.test.ts`, 한자 서브셋 가드 확장, 캡처 6장 | 게이트 → 사용자 머지 승인 대기 |
| (이 PR) | REPORT · AGENT_STATUS · WORKLOG | 기록 |

- #138 검증(head 3fa596b): `npm run verify` EXIT 0 — api 125 · core 1074 · web 62 = 1261 (web 49→62). critic B1 보정: 골든 전부 × 두 학파에서 강약 칩을 `strengthFactorsOf` 값과 정확히 대조하고, 손으로 적은 기대값 2건과 팩터별 참·거짓 존재를 단언한다. 안내 문구는 STRENGTH.md 16·19·22행 핵심어 7개로 고정했고, 시각 미상 고지 렌더 조건은 `freeL2NotesOf`로 옮겨 테스트한다. `packages/`·`api/` diff 0이므로 기본 응답 바이트 스냅샷과 `KEYLESS_INCLUDE_BLOCKS`가 그대로다.
- 캡처: `docs/captures/2026-11-09-l2-chips/`(#138)와 `D:\사진\saju-lab\l2-chips-360-*.png` 6장. 360px 라이트/다크로 신살 0개(1990-01-01 10:30)·5개(1988-10-09 02:30)·시각 미상(1933-11-17)을 찍었고, 세 경우 모두 docWidth 360(가로 넘침 0)이다. 도구는 `vite preview` + headless Edge CDP다. 서버는 끝난 뒤 내렸다(4173·9333 리슨 0).

## 발견

1. **«11-20 배포 묶음»의 런타임 PR은 이미 프로덕션에 있었다.** `gh api repos/coldstoneheo-rgb/saju-lab/deployments?environment=Production` 기준, 착수 시점(11-09) 최신은 `dec1078` 2026-11-06T16:36:47Z id=7605359301 `success`였다. 이후 #137 머지로 `5722e03` 2026-11-09T14:22:54Z id=7657151516이 자동 배포됐다(문서만). #126 839c3ba · #128 7a6a0bf · #130 cfdeef8 모두 origin/main의 조상이다.
2. **머지 = 프로덕션 배포.** Vercel Git 자동 배포이고 근거는 `vercel.json`, `docs/PROGRESS.md:67·70`이다. 화면이 바뀌는 PR은 머지 위임 밖이다(LC 수용).
3. **유료 리포트(F3)가 결제 없이 모두에게 보인다.** 줄 번호는 main `5722e03` 기준이고, #138 머지 뒤에는 +4~24줄 밀린다(395·479·895·1043). `generatePaidReportV1`은 브라우저에서 규칙만으로 생성된다(`apps/web/src/main.tsx:1019`, Gemini 0). 그 결과가 무료 화면 `PaidReportPrototype`(`main.tsx:474` 렌더, `:871` `id="paid-preview"`, `:391` «상세» 링크)과 HTML 내려받기로 노출된다. 사용자 결정 거리이며 가장 작은 변경 지점은 아래와 같다(구현 0).
   - **결제 게이트:** 결제 확인 상태가 생기기 전에는 `main.tsx:474` 렌더와 내려받기 버튼을 조건부로 둔다. 결제사 후보·실패 상태 정의는 이미 있다(`apps/web/src/payment-decision-guard.ts`, `checkout-verification-guard.ts`). 결제 연동 자체는 별도 HO(§7-7 과금).
   - **#paid-preview 비노출:** `main.tsx:474` `<PaidReportPrototype …/>` 1줄과 `:391` «상세» 링크 1줄을 빼거나 플래그 뒤에 둔다. 유료 3블록을 넣기 전 최소 조건이다.
   - **지금대로:** 변경 0. 이 경우 «유료만» 3블록은 PaidReportV1에 넣지 않는다(넣으면 무료 공개와 같아짐).
4. **신살 한자 13자가 자가호스팅 폰트 서브셋에 없다.** LC (a) 수용에 따라 한글 이름만 싣고 서브셋 재생성은 별 PR로 미룬다.

## 4) 배포 묶음 표

| PR | 런타임 영향 | 배포 순서·상태 | 되돌리기 | 사용자 손 |
| --- | --- | --- | --- | --- |
| #126 839c3ba · #128 7a6a0bf · #130 cfdeef8 | 키 라우트 include 5블록 · keyless fail-closed | 이미 프로덕션(dec1078 success, 이후 5722e03까지 success) | Vercel 대시보드 → Deployments → 직전 배포 «Instant Rollback», 또는 `git revert` PR | 없음 |
| #137 5722e03 · 이 기록 PR | 0(문서) | #137은 자동 배포됨(5722e03 success), 이 PR은 머지 시 자동 배포(위임 안) | `git revert` | 없음 |
| #138 | 무료 화면에 칩 2줄 + 안내(apps/web만, 코어·API 0) | 게이트 PASS 뒤 머지 1회 = 프로덕션 배포. 11-20 전 | `git revert <squash SHA>` PR 머지, 또는 Vercel Instant Rollback | 머지 승인 1줄. 머지는 워커가 `gh pr merge 138 --squash --match-head-commit <SHA>`로 하거나, 직접 하려면 PowerShell에서 `cd C:\Users\colds\saju-lab` 후 같은 명령 |

- 프로덕션 `SAJU_API_KEY` 존재 확인(값 없이): PowerShell에서 `cd C:\Users\colds\saju-lab` 후 `vercel env ls production`을 실행해 이름 목록에 `SAJU_API_KEY`가 있는지만 본다. 값은 출력되지 않는다. 미설정이면 키 라우트도 keyless 취급이다(#128).
- 배포 뒤 확인 1줄: 프로덕션 URL에서 1988-10-09 02:30 입력 → «강약 팩터» 칩 4개와 «신살» 칩 5개(천을귀인(일) 도화(일) 화개(시) 괴강(월) 백호(연·월))가 보이는지, `#paid-preview` 내용이 이전과 같은지 본다.

## 후속 (구현 0)

- 스냅샷 stat-dirty 재발: 보통 실행에서는 재발하지 않았다(strength-readings.test.ts 단독 34 passed, CR 0→0). 재발 경로는 `core.autocrlf=true`인 새 checkout에서 CRLF가 된 `.snap`을 vitest가 LF로 다시 쓸 때다. 가장 작은 예방은 `.gitattributes`에 `*.snap text eol=lf` 1줄을 넣는 것이다.
- 신살 한자 서브셋:
  - 빠진 13자: 天貴人桃花驛馬華蓋羊刃魁罡白虎 (`乙`은 이미 있음)
  - 필요한 재료: 원본 Noto Serif KR 600(OFL, `apps/web/public/fonts/OFL-NotoSerifKR.txt`), `pyftsubset`(fonttools) — 레포에 생성 스크립트 0
  - woff2 크기 변화 예상: 현재 14,944B, 획 많은 글자 13자로 +5~8KB 추정(실측 전)
- `api/_lib/saju-pillars.ts:14-15` 주석 «무료/유료 층 노출은 사용자 결정 전»이 낡았다(#137 critic 비차단). 다음 코드 PR에서 «결정 완료(11-09), 키 라우트 층 구분 없음»으로 고친다.
- #138 verifier N5: `<p aria-label>` 스크린리더 라벨은 기존 `InteractionsLine` 관행과 같다. 접근성 정리는 별건.

## LC·사용자에게 필요한 것

- LC: #138 게이트 판정. PASS면 사용자에게 캡처와 함께 «머지» 승인을 올린다.
- 사용자: #138 머지 승인(=프로덕션 배포) · F3 세 갈래 중 택1 · `SAJU_API_KEY` 존재 확인.
