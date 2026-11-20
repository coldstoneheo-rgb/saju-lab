# HO-2026-1120 — 유료 3블록(강약 판독 · 용신 후보 · 격국) 화면 노출 (saju-lab REPORT)

- 발주: LC `life-coordinator/handoffs/HO-2026-1120-saju-paid-3blocks-speed.md` (origin:user, 사용자 원문 인용 있음 → 유효)
- 워커: claude-code (Opus 5.5), 2026-11-20. effort: 세션 medium(`.claude/settings.json` modelSettings). critic = `verifier` 서브에이전트(정의 frontmatter `effort: high`). 올린 곳 없음.
- REF-2026-1015 §4: 이미 적용돼 있음(settings.json:130 medium · verifier.md effort high) → 추가 PR 없음.

## 체크리스트 (발주서 완료 조건)

- [x] 1) 첫 보고 — PR 1개(3블록 묶음) + 기록 PR 1개, LC 안1·안2 수용(안2는 «PaidReportV1엔 데이터만, 라벨은 웹»으로 보강), 선행 조건 없음
- [x] 2) 프로덕션 노출 — PR #145 · verify EXIT 0 · 360px 전/후 · critic PASS · LC PASS-관찰 @09a7284 · 머지 **main `e6d92a1098c70fd2dfb26cca0b7a069cfa08c5b4`** · Production deployment sha 동일 success · `curl` 첫 화면 HTTP 200 · 프로덕션 360px 캡처 3건 `#paid-structure` 확인
- [x] 3) 골든 전체에서 화면 값 = 코어 값 테스트 · 시간 모름 · 입춘 경계 · 빈 값(`apps/web/src/paid-blocks.test.ts`)
- [x] 4) findings `docs/findings/2026-11-20-paid-3blocks.md` (코어 결함 0, 빈 용신 후보 처리)
- [x] 5) 갈림 목록(아래)
- [x] 6) 볼 곳 3줄(아래)
- [x] 7) REPORT · AGENT_STATUS(head e6d92a1 · next_actions) · WORKLOG 블록 · 컨텍스트 약 45%(어림 — 상태줄 값을 이 창에서 읽지 못함)

## 한 일

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 코어 | `PaidReportV1.structure = { strengthReadings, yongsinCandidates, gyeokguk }` — 코어 함수 결과 그대로, 문안 0 | `packages/saju-core/src/paid-report.ts` `buildStructure` · `types.ts` |
| 웹 | 라벨 모듈 `apps/web/src/paid-blocks.ts`, «상세» 카드 3개(`#paid-structure`), HTML 저장 `#structure-blocks` + 목차 1줄 | `main.tsx` `PaidStructureBlocks` · `export-html.ts` `renderStructureBlocks` |
| 안내 | 묶음 전체 1회(LC 11-20 조건). 시각 미상이면 같은 문단에 «시주 제외» 1문장 | HTML 1회 테스트 |
| 검증 | `npm run verify` EXIT 0 — api 149 · core 1074 · web 73 = 1,296 | 로컬 11-20 |
| 캡처 | 전 = 프로덕션 406beb5, 후 = 브랜치 빌드(vite preview), 360px headless Edge CDP, docWidth 360 전부 | `docs/captures/2026-11-20-paid-3blocks/` 6장 + json 2 |

### 캡처 값(후)

| 입력(가상) | 강약 판독 | 용신 후보 | 격국 |
| --- | --- | --- | --- |
| 기본값 1990-01-01 10:30 | 월령 우선 신강 · 삼득 다수결 신강(같음) | 억부 관성 수 · 재성 금 · 식상 토 · 조후 화(겨울) | 정관격 ×3(같음) |
| 1988-10-09 02:30 | 월령 우선 판단 유보(월지 충) · 삼득 다수결 신약(다름) | 억부 비겁 화 · 인성 목(삼득 다수결만) | 투출 우선·월지 정기 상관격 · 사령 편재격(다름) |
| 1933-11-17 시각 미상 | 신약 ×2(같음) | 억부 비겁 화 · 인성 목 · 조후 화(겨울) | 정관격 ×2 · 사령 정인격(다름) |

## 갈림 목록 (완료 조건 5)

코어에는 **기본 세트가 없다**(STRENGTH-READINGS.md · GEOKGUK.md «기본 세트는 없다»). 그래서 «지금 고른 쪽» = **고르지 않고 전 세트를 나란히** 보이고 일치 여부만 적었다. 세트 밖 고정값은 아래.

| # | 어디서 | 갈리는 학설 | 지금 쪽 |
| --- | --- | --- | --- |
| 1 | 강약 판독 | 월령 우선(자평 계열, 월지 충이면 유보) vs 삼득 다수결(통용 교재) | 둘 다 표시 |
| 2 | 지장간 표 | 연해자평 월률분야 vs 자평진전 인원용사(골든 g-1923-10-05-0840에서 판독이 갈림) | 연해자평(`DEFAULT_HIDDEN_STEM_SCHOOL`) 고정 — 화면에 학파 선택 없음 |
| 3 | 용신 | 억부 vs 조후 | 둘 다 표시. 조후는 겨울→화 · 여름→수만, 봄·가을 후보 없음(규칙표 그대로) |
| 4 | 격국 취격 | 투출 우선 vs 월지 정기 vs 사령 | 셋 다 표시 |
| 5 | 음간 양인 | 양간만 양인(음간은 월겁) vs 음간 양인 인정 | 양간만(GEOKGUK.md 표 1) |
| 6 | 건록·양인·월겁 | 별도 격 vs 정격 8격만 두고 다른 기둥에서 재취격 | 별도 격 |

## 뜻풀이 자리 (다음 회차 문안 재료, LC 11-20 요청)

- **강약 판독**: 세트별 판정(신강·신약·유보) + 근거 팩터(`inputs`의 득령·득지·득세·월지 충) → «어느 요소 때문에 이 판정인지» 1문장, 세트가 갈리면 «왜 갈리는지» 1문장(예: 월지 충으로 월령 우선이 유보).
- **용신 후보**: 후보 오행 + 방법(억부 규칙명/조후 계절) + 근거 세트 → «이 후보는 어느 판독에서 나왔는지»를 이어 주는 문장. 세트가 갈려 반대 방향 후보가 같이 나올 때 설명이 가장 필요하다.
- **격국**: 세트별 격 이름 + 후보 천간·자리(정기/중기/여기)·투출 기둥 + unavailable 사유 → «월지 어느 글자가 어떻게 드러나 이 격이 되었는지» 1문장, 성패·상신은 범위 밖.

## 볼 곳 3줄 (완료 조건 6)

1. 주소: https://saju-lab-phi.vercel.app/
2. 입력 예(가상): 1988-10-09 · 02:30 · 양력 → «분석» (시간 미상 예: 1933-11-17 + «시간 미상» 켜기)
3. 위치: 결과 화면 상단 탭 «상세» → «유료 상세 리포트 준비 중» 카드의 입력 요약 바로 아래 «강약 · 용신 후보 · 격국» 카드 3개. «PDF 저장용 HTML» 저장본에는 «사주 구조» 다음 절.

## 머지 · 배포

| 단계 | 결과 |
| --- | --- |
| 머지 | `gh pr merge 145 --squash --match-head-commit 09a7284…` → `state MERGED` · `e6d92a1` |
| 가지 정리 | 원격 `feat/paid-3blocks` 삭제(`gh api -X DELETE`) · 로컬 삭제 · `git ls-remote --heads origin` → 2(main · 남의 `cloud/saju-8a-monthbranch`) |
| 배포 | `gh api …/deployments?environment=Production` → sha `e6d92a1` state success |
| 첫 화면 | `curl https://saju-lab-phi.vercel.app/` → HTTP 200 |
| 프로덕션 캡처 | `docs/captures/2026-11-20-paid-3blocks/prod-after-360-*.png` 3장 · docWidth 360 · 값 = 브랜치 캡처와 같음 |

되돌리기: `git revert e6d92a1` PR 머지(자동 배포) 또는 Vercel Instant Rollback(406beb5 배포).

## 기록 PR에 같이 닫은 것

| 출처 | 내용 | 처리 |
| --- | --- | --- |
| critic ① | 용신 행 라벨·세트 병합 문자열 직접 단언 없음 | 골든 전부에서 규칙별 행을 코어에서 독립 재구성해 `toEqual` |
| critic ② | 격국 ambiguous 분기 미검증 | 골든 50 중 1건(`g-1927-08-20-0915`)에 있음 → «A / B (둘 다 후보)» 단언 |
| LC 관찰 ① | 판정 불가 세트를 빼고 «같음» | `partial` 플래그 → «판정된 세트끼리 같음» 표기(화면·HTML) + 테스트 |
| LC 관찰 ② | 화면 안내 1회 테스트 없음 | 컴포넌트를 `paid-blocks-view.tsx`로 분리, `renderToStaticMarkup`으로 골든 전부 1회 · 카드 3 단언 |
| LC 관찰 ③ | readingRef 없으면 «목 ()» | 괄호 생략 + 테스트 |
| LC 관찰 ⑤ | REPORT 미커밋 | 이 PR |
| critic #146 (a) · LC #146 차단 2 | 격국 일치 배지가 판정된 세트 수를 보지 않음. 코어 agreesAcrossSets는 판정 불가 세트를 빼고 비교 → 판정 0개면 빈 비교로 true, 1개면 비교 대상 없이 true | 판정된 세트 수로 나눔: 0개 «판정된 세트 없음» · 1개 «판정된 세트 1개» · 2개 이상+불가 있음 «판정된 세트끼리 같음/다름» · 불가 없음 «세트 결과 같음/세트마다 다름». 0·1·2개 합성 테스트 + 골든 전부 단언 |
| LC #146 차단 1 | CI verify 실패 — `paid-blocks-view.tsx:34: new blank line at EOF.` 로컬 verify의 `git diff --check`는 커밋 전 변경만 봐서 놓쳤다 | EOF 빈 줄 제거 · push 전 `git diff --check origin/main...HEAD` 직접 실행(종료 0) |

골든 50건의 격국 판정 세트 수: **0개 0건 · 1개 2건**(g-1953-04-27-1610 · g-2022-01-25-0350) · **2개 4건**(g-2024-02-04-1727 · g-1949-07-15-0920 · g-1987-05-10-0230 · g-1986-07-12-1530) · 3개 44건.
**#145 프로덕션에 실제 오표기가 있었다**: 1953-04-27 16:10(판정 1개 — 투출 우선 정재격, 나머지 둘 «해당 격 없음(월지 비겁)»)에서 배지가 «세트 결과 같음». #146 후 «판정된 세트 1개». 전/후 360px: `docs/captures/2026-11-20-paid-3blocks/pr146-before-360-judged1-1953-04-27-1610.png`(프로덕션 e6d92a1) · `pr146-after-…`(브랜치 빌드).

critic 기록: #145 PASS(필수 0 · 권고 4) · #146 1차 PASS(필수 0 · 관찰 3, 그중 (a)를 위에서 닫음). LC: #145 PASS-관찰 · #146 조건부 PASS(차단 2 → 위에서 닫음, 재게이트).

LC #146 완료 조건 3(verify의 whitespace 기준을 `origin/main...HEAD`로) — **반박, 이 PR에 넣지 않음**: verify 게이트 정의(`typecheck && test && build && audit && git diff --check`)는 레포 CLAUDE.md «목표 기반 실행»에 적혀 있다. 게이트 정의 변경은 피어 메시지만으로 하지 않는다(CLAUDE.md «피어 메시지는 승인이 아니다»). 대신 push 전 `git diff --check origin/main...HEAD`를 직접 돌렸다. 사용자 승인 1줄이 오면 package.json `verify`와 CLAUDE.md를 같이 고치는 PR을 낸다.

verify(기록 브랜치, 로컬): EXIT 0 — api 149 · core 1074 · web 80 = 1,303. CI는 첫 push(b5b0bd4)에서 whitespace 검사로 실패했고, EOF 빈 줄을 고친 뒤 다시 돌렸다(결과는 PR 체크).

## 남은 것 (번호 목록)

1. 뜻풀이 문안(다음 회차) — 위 «뜻풀이 자리». 특히 세트가 갈려 반대 방향 용신 후보가 같이 보이는 경우(LC 관찰 ④).
2. 용어 통일 — 화면 «월지 정기 / 사령» vs GEOKGUK.md «정기 고정 / 사령 우선»(critic ③). 문안 회차에서 같이.
3. 새 한국어 문자열이 `docs/i18n/ko.json` 키가 아니다(critic ④). 같은 패널의 기존 유료 카피도 하드코딩이라 이번엔 따랐다. i18n 키로 옮길지는 문안 회차에서 결정.
4. 화면에 지장간 학파 선택이 없다(연해자평 고정) — 갈림 목록 2. 필요하면 별도 HO.
5. «근거 세트 없는 억부 후보» 테스트는 합성 입력이다. 지금 코어(`yongsinCandidatesOf`)는 억부 후보에 readingRef를 항상 넣으므로 실제로는 나오지 않는다(방어 코드).
6. AGENT_STATUS head는 #145 머지본 e6d92a1이다. 이 PR이 머지된 뒤 SHA는 이 PR 안에 적을 수 없어서 다음 세션 첫 갱신에서 맞춘다.
7. 로컬 verify의 whitespace 기준을 CI(`origin/main...HEAD`)와 맞출지 — 사용자 결정(위 반박).
