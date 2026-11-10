# TASK-2026-1110 — #138 머지 · 후속 2건 · F3 사실표 (saju-lab REPORT)

- 발주: LC `life-coordinator/handoffs/TASK-2026-1110-saju-138-followup.md` (origin:user+lc)
- 워커: claude-code (Opus 5.5), 2026-11-10. effort: 세션 medium. 서브에이전트 verifier 1회(#140 critic)는 정의 기본값 그대로 돌렸고, 올린 곳은 없다.
- #138 머지 근거: 자기 레포 CLAUDE.md «머지 위임(상시)»과 life-coordinator `docs/DEC-2026-1110-rule-pruning.md` §2-B B1(사용자 «기본값», 11-10 11:4x). B1은 «화면 변경 PR도 위임 포함 · 전/후 캡처 첨부 · LC 사후 감사 · 되돌림은 revert PR»이고, 근거 칸에 #138이 직접 적혀 있다.

## 체크리스트 (발주서 완료 조건)

- [x] 1) #138 **[MERGED] main `56410deb55db895244e52f1bb83d56c4c78c0d9d`**. 프로덕션 배포 SHA도 같다(success). 프로덕션 360px 전/후 캡처를 남겼고, 가지 정리도 했다.
- [x] 2) 후속 PR #140 — 신살 한자 서브셋과 `*.snap text eol=lf`. verify EXIT 0, 1,262건. 머지 결과는 아래 «한 일» 표에 있다.
- [x] 3) `vercel env ls production`의 SAJU_API_KEY 이름 — **있음**(Production, 생성 136일 전, 값 Encrypted). 워커 Bash는 권한 거부였고, 우회 없이 사용자가 직접 `! vercel env ls production`을 실행했다(11-10). 같은 목록: ANTHROPIC_API_KEY(Production) · GEMINI_API_KEY(Preview·Production).
- [x] 4) F3 사실표 (아래 절). 구현은 하지 않았다.
- [x] 5) REPORT · AGENT_STATUS · WORKLOG → 기록 PR

## 한 일

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| #138 머지 | squash **56410de** | `gh pr merge 138 --squash --match-head-commit 3fa596b…` → `state MERGED`. 머지 직전 상태: mergeStateStatus CLEAN, checks 3/3 pass(verify · Vercel · Vercel Preview Comments) |
| 프로덕션 배포 | sha 56410de · state success | `gh api repos/coldstoneheo-rgb/saju-lab/deployments?environment=Production&per_page=1` → 상태 조회. 번들이 `index-DBwDy39-.js`에서 `index-vpdK0R7e.js`로 바뀌었다 |
| 가지 정리 | 원격 `feat/web-l2-free-chips` 삭제(`gh api -X DELETE …/git/refs/heads/…`) · 로컬 `git branch -d` | `git ls-remote --heads origin` → 2개(main · `cloud/saju-8a-monthbranch` = 남의 가지) |
| #140 | 신살 한자 15자 서브셋 · 재생성 스크립트 · cmap 가드 · `.gitattributes` | 아래 «#140» 참고 |

### 프로덕션 캡처 (DEC-1110 B1 «전/후 첨부»)

입력은 1988-10-09 02:30(신살 5개 사례)이다. 360px 화면을 headless Edge CDP로 찍었다(스크립트는 세션 scratchpad에 두었고, 끝난 뒤 9333 포트 리슨 0을 확인했다).

| | 파일 | 실측 |
| --- | --- | --- |
| 전 (main 0aed6d3) | `docs/captures/2026-11-10-prod-138/prod-before-138-360-1988-10-09-0230.png` (원본 `D:\사진\saju-lab\` 같은 이름) | 합충 줄 아래 칩 없음 · docWidth 360 |
| 후 (main 56410de) | `docs/captures/2026-11-10-prod-138/prod-after-138-360-1988-10-09-0230.png` | 강약 팩터 «득령/득지/득세 해당 없음 · 연해자평 지장간» + 신살 «천을귀인(일) · 도화(일) · 화개(시) · 괴강(월) · 백호(연·월)» · docWidth 360. #138 PR 캡처(`docs/captures/2026-11-09-l2-chips/capture-report.json`) 값과 같다 |

되돌리기: `git revert 56410de`로 PR을 만들어 머지하면 프로덕션에 자동 배포된다. 급하면 Vercel Instant Rollback으로 0aed6d3 배포를 되살린다.

### #140 — 신살 한자 서브셋 · `*.snap` LF

- 빠진 글자는 **13자가 아니라 15자**였다(天貴人桃花驛馬華蓋羊刃魁罡白虎). 乙만 원래 들어 있었다. 11-09 REPORT 발견 4의 «13자»는 잘못 센 것이다.
- 원본은 notofonts/noto-cjk `Serif/SubsetOTF/KR/NotoSerifKR-SemiBold.otf` 2.003이다. 기존 서브셋의 name ID 3·5와 같은 판이다. `pyftsubset --layout-features=* --flavor=woff2`를 쓰면 기존 59자 파일이 **바이트 동일**하게 다시 나온다(sha256 `1964424…`). 그래서 이 옵션을 `apps/web/scripts/subset-hanja-font.py`에 고정했다.
- 결과는 74자, 14,944B → 19,120B(+4,176B)다. 화면 변경은 0이다. 새 글자를 렌더하는 곳이 아직 없다(신살 칩은 한글 이름으로 나간다).
- `hanja-subset.test.ts`에 신살 7종 한자 이름 가드와 글자 수 74를 넣었다. 변이 시험: 옛 woff2로 바꾸면 새 테스트 1건이 실패하고, 복원하면 통과한다.
- `.gitattributes`에 `*.snap text eol=lf`를 넣었다. 인덱스의 .snap 3개는 이미 LF라 재정규화 diff는 0이다. verify 전후 모두 `git ls-files --eol` 결과가 i/lf w/lf였다(stat-dirty 0).
- verify: `npm run verify` EXIT 0, api 125 · core 1074 · web 63 = **1,262**. audit 0.

## F3 사실표 — 유료 리포트가 결제 없이 보이는 문제 (구현 0, 결정은 사용자·LC)

**현재 상태** (main 56410de 줄 번호)
- `generatePaidReportV1`은 브라우저에서 규칙만으로 돈다(`apps/web/src/main.tsx:1043`, Gemini 0). 결과는 두 곳에 나간다.
  - 무료 화면 `<PaidReportPrototype>`: 렌더 `:479`, 섹션 `:895` `id="paid-preview"`, 상단 «상세» 링크 `:395`
  - «PDF 저장용 HTML» 버튼: `:903-910` `downloadPaidReportHtml`
- 문서 정책상 이 노출은 **현재 허용된 상태**다. `docs/PAID_CHECKOUT_READINESS.md:40`은 «게이트가 끝나기 전에는 유료 상세 리포트 미리보기와 준비 안내를 보여 줄 수 있으나, 실제 구매 버튼은 보이지 않는다»고 적는다. 문제가 되는 경우는 하나다. «유료만» 내용(strengthReadings · yongsinCandidates · gyeokguk)을 PaidReportV1에 넣으면 그 순간 무료로 공개된다.
- `main.tsx`의 유료 미리보기가 DOM에 있는지 확인하는 테스트는 0이다(`grep paid-preview|PaidReportPrototype apps/web/src/*.test.ts` → 0). `export-html.test.ts`·`finance-copy-guard.test.ts`·`paid-readiness-copy.test.ts`는 HTML 빌더와 문구만 본다.

| 안 | 바뀌는 파일 | 예상 공수 | 사용자에게 보이는 차이 | 되돌리기 |
| --- | --- | --- | --- | --- |
| **A. 결제 게이트** | `main.tsx`(`:479` 렌더 · `:395` 링크 · `:903-910` 버튼을 결제 확인 상태로 조건부 처리) · 결제 클라이언트 모듈 신설 · `api/` 체크아웃 세션 생성 + 결제 확인(webhook 또는 세션 조회) 엔드포인트 신설 · 결제사 키 env · 정책 페이지 확정(`PAID_CHECKOUT_READINESS.md` 게이트: 지원 연락처 · 환불 · 데이터 보관) · 테스트 | 코드 600~1,200분. 결제사 가입·심사·정책 확정은 외부 일정이라 일 단위이고 이 숫자에 넣지 않았다 | 구매 버튼이 생긴다. 결제 전에는 잠긴 미리보기만 보이고, 결제 뒤 상세 화면과 HTML 저장이 열린다 | 코드는 revert PR. 다만 **실제 결제가 일어난 뒤에는 환불·정산 처리가 남아 완전 가역이 아니다**(§7-7 과금 → HO 필수) |
| **B. #paid-preview 비노출** | `main.tsx` 2줄(`:395` «상세» 링크 · `:479` `<PaidReportPrototype …/>`)을 빼거나 플래그 뒤로 둔다. 번들에서도 빼려면 `:1043` 생성 1줄을 같이 뺀다. 비노출 가드 테스트 1건을 추가한다. `PaidRoadmap`(`:480`, 준비 안내)은 남는다 | 30~60분(전/후 캡처 포함) | «상세» 탭과 유료 미리보기 카드, «PDF 저장용 HTML» 버튼이 사라진다. 준비 안내 패널은 남는다 | revert PR(머지 = 자동 배포) 또는 Vercel Instant Rollback. 데이터·과금 영향 0 |
| **C. 지금대로** | 0 | 0분 | 변화 0 | 해당 없음. 대신 제약이 생긴다: 이 상태에서는 «유료만» 3블록을 PaidReportV1에 넣지 않는다 |

**LC 가정 C(지금대로, 11-10):** 결제 오픈 발주 때 A를 다시 연다. 그때까지 «유료만» 3블록은 PaidReportV1에 넣지 않는다. 사용자가 바꾸면 LC가 다시 알린다.

**사실 메모** (권고가 아니라 판단 재료)
- A의 게이트를 프런트에만 두면 우회할 수 있다. 유료 생성 코드(`generatePaidReportV1`)가 무료 번들에 들어 있기 때문이다. 게이트가 실효를 가지려면 유료 생성을 서버로 옮겨야 한다. 그런데 이는 `docs/PAYMENT_PROVIDER_DECISION.md:91`(«data-retention 결정을 다시 열지 않는 한 리포트 생성은 브라우저에서»)을 다시 여는 결정이다.
- B는 A로 가는 길을 막지 않는다. A를 할 때 같은 줄을 조건부로 바꾸면 된다.

## LC·사용자에게 필요한 것

- **사용자:** F3 A·B·C 중 하나를 고릅니다. (SAJU_API_KEY 확인은 끝났다.)
- **LC:** #138 사후 감사(DEC-1110 B1)와 #140 게이트.
