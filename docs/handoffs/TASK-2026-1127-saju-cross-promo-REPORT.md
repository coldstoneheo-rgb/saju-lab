# TASK-2026-1127 saju 교차 안내(첫이름 · 팩폭관상) — REPORT

발주서: life-coordinator `handoffs/TASK-2026-1127-saju-cross-promo-baby-facefate.md` (origin: lc) · 작성 2026-11-26(KST) · 워커 saju-lab-b6
시작 main = `bb118023b4af860bfae9d92970157876219df000` (발주서 «이미 결정된 것» 2와 같음 · 열린 PR 0)

## 0. 문장 후보와 워커 권고 (LC가 사용자에게 올림 · 11-26 LC 보정 반영본)

화면 구역 제목(고지 1회): **같은 곳에서 만든 다른 서비스**

| 줄 | 후보 | 문장 (얻는 것 → 서비스 이름 · 괄호 표기) |
|---|---|---|
| 첫이름 | **D (권고 · PR에 들어간 문장)** | 작명소에 가기 전에, 아기 이름을 사주로 지어 보고 싶다면 **첫이름** (안드로이드 앱) |
| 첫이름 | E | 부족한 오행을 채운 한자 이름을 찾고 있다면 **첫이름** (안드로이드 앱) |
| 첫이름 | ~~A~~ (버림) | ~~아기 이름 후보를 사주와 나란히 놓고 비교해 보고 싶다면~~ — 까닭은 아래 |
| 팩폭관상 | **A (권고 · PR에 들어간 문장)** | 얼굴을 30초 스캔해 관상을 세 줄로 받아 보고 싶다면 **팩폭관상** (토스 앱에서 열림 · 세 줄 총평 무료 · 상세 풀이 1,980원) |
| 팩폭관상 | B | 사주 다음엔 관상도 — 얼굴 스캔 한 번으로 세 줄 총평 받기 **팩폭관상** (토스 앱에서 열림 · 세 줄 총평 무료 · 상세 풀이 1,980원) |
| 팩폭관상 | C | 관상을 돌려 말하지 않고 세 줄로 받아 보기 — **팩폭관상** (토스 앱에서 열림 · 세 줄 총평 무료 · 상세 풀이 1,980원) |

- **첫이름 A를 버린 판정:** Play 공개 페이지(`curl` 11-26 20:5x · hl=ko)의 설명은 «작명소에 가기 전에, 사주로 짓는 아기 이름. 부족한 오행을 채운 한자 작명과 탄생 별자리.»이다. 본문에 «후보를 만듭니다» · «후보를 먼저 추려보고 싶은 분»은 있지만 «비교»는 0회다. A의 «나란히 놓고 비교»는 공개 페이지로 확인되지 않아 버리고 D로 바꿨다. 시험이 «비교» 0회를 지킨다.
- **팩폭관상 괄호 보정:** «· 1,980원»만 적으면 세 줄 관상이 1,980원으로 읽힌다. 실제로는 30초 스캔 · 초상 · 세 줄 총평까지 무료이고, 1,980원은 상세 풀이 값이다(LC 11-26 보정 · 토스 안 공개 화면 기준). 이 사실은 **LC가 준 것이고 워커는 기기가 없어 직접 보지 못했다** — 머지 전 사용자 폰 확인 항목에 함께 둔다.
- 문장은 이 레포에서 새로 썼다. 비공개 레포의 글은 열지도 옮기지도 않았다(D · E의 낱말은 Play 공개 설명에서 왔다).

## 체크리스트 (발주서 완료 조건)

- [x] 1 계획 REPLY: 설계 5항 수용 + 대안 2(face-fate «토스 앱에서 열림» 표기 · 수 세기는 baby만) · 주소 실측. LC 11-26 REPLY에서 수용.
- [x] 2 무료 결과 본문 끝(투명성 노트 다음 · 유료 미리보기 앞) 두 줄 · 360px scrollWidth 360 = innerWidth · 전/후 캡처 `docs/captures/2026-11-27-cross-promo/` (PC 1280 포함)
- [x] 3 두 주소 실측 (§2) · 죽은 링크 0 (PC에서 face-fate는 토스 첫 화면 — 아래 미확인 항목 참조)
- [x] 4 문장 후보 + 권고 (§0)
- [x] 5 수 세기: baby = Play referrer UTM · face-fate = 잴 수 없음 + 까닭 (§3)
- [x] 6 export-html 판단 (§4)
- [x] 7 verify EXIT 0 (api 149 · core 1074 · web 94 = 1317) · 시험 `cross-promo.test.tsx` 5건 · CI → PR 본문에 기록
- [ ] 8 PR #149 → critic PASS → LC 게이트 요청 (머지 0) — critic 1차 PASS 9/10 @aafee6b, LC 보정 뒤 새 head로 재검토 중
- [ ] 9 (사용자 확인 + LC «머지 허용 · origin:user» 뒤) 머지 → 프로덕션 SHA · 200 · 360px 캡처 → 마감

## 1. 바꾼 것 (apps/web만)

- `apps/web/src/cross-promo.tsx` — 문장 · 주소 상수와 `<CrossPromo />` (`<aside aria-label>` · `ul` 두 줄 · `target=_blank rel=noopener`)
- `apps/web/src/main.tsx` — `ReportView`에서 무료 본문이 끝나는 투명성 노트(`#transparency`) 바로 다음, 유료 미리보기(`PaidReportPrototype`) 앞에 `<CrossPromo />` 한 줄(+ import). 처음에는 `PaidRoadmap` 뒤 맨 끝이었다. LC 자리 안을 받아들여 옮겼다: 그 자리는 «프리미엄 확장 모델» 긴 구역 아래라 무료 결과를 읽은 사람이 닿기 전에 떠난다. 본문 사이 끼워 넣기가 아니라 본문이 끝난 경계다.
- `apps/web/src/styles.css` — `.crossPromo` 작은 글씨(13px) · 위쪽 구분선만 (배너 · 팝업 · 깜박임 0)
- `apps/web/src/cross-promo.test.tsx` — 두 줄 · 고지 1회 · 주소 2개 고정(Play 패키지+UTM · 대문자 I) · 괄호 «토스 앱에서 열림 · 세 줄 총평 무료 · 상세 풀이 1,980원» 전문 · 1,980원 1회 · «비교» 0 · 단정 어휘 0 · 자리(투명성 노트 다음 · 유료 미리보기 앞 1곳) · export-html에 주소 0
- 코어 · API · 유료 3블록 · 결제 · 처리방침: 변경 0

## 2. 주소 실측 (curl · 2026-11-26 20:2x KST · UA별)

| 주소 | PC (Windows Chrome UA) | 안드로이드 (토스 없음, UA) | 아이폰 (UA) | 토스 깔린 폰 |
|---|---|---|---|---|
| `https://play.google.com/store/apps/details?id=com.aistudio.babynaming.fkwypc` (+ `&referrer=…` 붙여도 200) | 200 · 웹 스토어 화면 (제목 «첫이름 - 사주로 짓는 아기 이름») | 200 (실기기에선 Play 앱으로 넘어감 — UA로는 웹 응답만 확인) | 200 · 웹 스토어 화면 (아이폰에선 설치 불가 — 줄에 «안드로이드 앱» 표기) | 해당 없음 |
| `https://minion.toss.im/vKTBQIwh` | 302 → og.toss.im → 최종 200 **`https://toss.im/` (토스 첫 화면 · 미니앱 아님)** | 302 → og.toss.im → toss.onelink.me → 301 `market://details/?id=viva.republica.toss` (토스 설치 화면) | 302 → og.toss.im → onelink 200 (JS 페이지) | **미확인** (기기 없음) |

- `vKTBQlwh`(소문자 l)는 404 재현 → 시험이 대문자 I를 고정한다.
- 코드가 고정 주소인지(콘솔 «다시 만들기»에서 바뀌는지): **미확인**.
- **머지 전 사용자 폰 확인 항목(LC 11-26 REPLY):** ① 토스 깔린 폰에서 팩폭관상 미니앱이 바로 열리는지 ② 이 코드가 고정 주소인지.
- PC에서 팩폭관상 줄을 누르면 토스 첫 화면으로 간다(죽은 링크는 아니지만 미니앱은 아님). 이 때문에 줄에 «토스 앱에서 열림»을 표기했다.

## 3. 넘어간 수 세기 (완료 조건 5)

- **첫이름: Play referrer UTM.** 주소에 `referrer=utm_source=saju-lab&utm_medium=web&utm_campaign=cross_promo`를 붙였다. 볼 곳은 Play Console → 사용자 확보 보고서의 UTM(캠페인) 갈래다. 새 스크립트 · 새 수집 · 처리방침 변경은 0이다. 숫자가 작으면 Play가 문턱값 아래로 가릴 수 있다.
- **팩폭관상: 이 사이트에서는 잴 수 없음.** 까닭: ① minion 단축 주소에 붙인 매개변수는 다음 주소로 넘어가지 않는다(`?utm_source=sajulab`을 붙였을 때 redirect 안에 0건). ② 주소 안의 `af_adset=share_link_20261016`은 콘솔 공유 링크가 함께 쓰는 값이라 다른 유입과 섞인다. ③ 클릭 이벤트(`@vercel/analytics`의 `track`)는 새 수집이고, `betaShareGuard.forbiddenBeforeApproval`에 analytics가 들어 있어 쓰지 않았다.

## 4. 내보낸 HTML (완료 조건 6)

넣지 않는다. 저장 HTML은 그 사람의 리포트 기록물(오프라인 열람 · 인쇄)이라 안내는 화면에서만 보인다. `export-html.ts`에 주소가 0건인지는 시험이 지킨다.

## 5. 검증

- `npm run verify` EXIT 0 — api 149 · core 1074 · web 94 (= 1317) · audit 0 vulnerabilities · `git diff --check` 통과
  - 도중 1회 FAIL: `finance-copy-guard.test.ts`는 `.test.tsx`까지 읽는다. 새 시험의 금지어 정규식과 주석에 넣었던 재무 어휘가 걸렸다. 그 어휘를 빼서 해결했다(가드 변경 0).
- 캡처 (headless Edge CDP · scratchpad `cap.mjs` · `#transparency` 위 끝부터 `#paid-preview` 위 끝 + 160px까지 — 새 자리 기준으로 전/후를 다시 찍음):

| 파일 | 대상 | 폭 | scrollWidth | 가로 넘침 |
|---|---|---|---|---|
| `before-prod-360.png` | 프로덕션 https://saju-lab-phi.vercel.app/ (e66b052 배포) | 360 | 360 | 없음 |
| `before-prod-1280.png` | 프로덕션 | 1280 | 1265 | 없음 |
| `after-branch-360.png` | 브랜치 빌드 `vite preview` | 360 | 360 | 없음 |
| `after-branch-1280.png` | 브랜치 빌드 | 1280 | 1265 | 없음 |

  수치 json: `before-prod-capture.json` · `after-branch-capture.json` (링크 href · target · rel · 오른쪽 끝 좌표 포함, 360폭 구역 right 344 · 링크 right ≤ 328).
- critic(verifier · high) 1차 @aafee6b: **PASS 9/10**. 지적 2(감점 사유 · 코드 수정 요구 아님): ① 자리 시험 정규식이 줄 형식에 의존함 ② aria-label 문자열을 직접 단언하지 않음. ②는 보정본에서 aria-label 문자열 단언을 더했다. ①은 의도한 고정이라 그대로 둔다 — 자리를 옮기면 일부러 실패하게 만든 시험이다.

## 6. effort

세션 medium · critic(verifier 서브에이전트) high — 발주서 §6 표대로(critic = high).
