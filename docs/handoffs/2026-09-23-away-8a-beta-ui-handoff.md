# 2026-09-23 외출 모드 인계 — 8a 강약 팩터 머지 · 베타 UI 프리뷰(머지 보류)

> **갱신 2026-09-24 04:05** — #89 머지 `92cbd13`(프로덕션 반영, REPORT `HO-2026-0924-saju-web-beta-ui-merge-01-REPORT.md`) · 문서 #92 `d0b290a` · 새벽 PR #93·#94·#95 대기(verifier·LC 게이트 PASS, 머지 = 기상 후). 아래 §0~§3의 head·대기 항목은 그 시점 기준이다.

- 발주: LC `life-coordinator-c4`, AWAY-PLAN §2-1(`life-coordinator/docs/AWAY-PLAN-2026-0923.md`) · P1 회의 A1~A7(`MEETING-2026-0923-saju-away.md`). 이 세션 = saju-lab, Opus 5.5.
- main = `a253f08`(#90 squash). **프로덕션은 아직 `ad0f1f6`** — Vercel Hobby 배포 한도 초과(«Deployment rate limited — retry in 24 hours»)로 #90 배포가 생성되지 않았다. 화면 변화가 없는 머지라 영향은 0.
- 로컬 브랜치 `main` · `feat/web-beta-ui`(#89 대기). worktree = 메인 1개.

## 1. 착지 / 대기

| PR | 내용 | 상태 | 게이트 |
| --- | --- | --- | --- |
| #90 | 8a `strengthFactorsOf` + STRENGTH.md + 골든 50행 pending + REPORT + WORKLOG·PROGRESS | **머지 `a253f08`** | verify 788 · verifier PASS · LC 머지 가 |
| #89 | 베타 UI 1차(토큰·명식 카드 한자·오행 점·44px 접힘·대운 가로 카드·한자 서브셋) + supplementPriority 계약 1문장 | **머지 보류 — 사용자 승인 = 프로덕션** | verify 675 · CI·Vercel pass · verifier PASS · LC 머지 가(사용자 승인 전제) |

- #89 프리뷰: https://saju-hraz919bf-coldstoneheo-rgbs-projects.vercel.app (Deployment Protection ON → Vercel 로그인 필요, OFF 전환 안 함).
- 테스트 3케이스와 기대 표시 = #89 본문. 스크린샷 8장 = LC가 `life-coordinator/docs/design/saju-beta-ui-2026-0923/screenshots/`에 복사.

## 2. 다음 세션 첫 동작

1. `git fetch` → `git pull --ff-only origin main` → `npm ci` → `npm run verify`(기대 788).
2. **#89 머지(사용자 승인 뒤에만):** `feat/web-beta-ui`에 `origin/main`(#90 포함)을 머지 → verify → push → CI 확인 → squash 머지 → `state=MERGED` → pull. **Vercel 한도가 풀린 뒤**에 해야 프로덕션에 반영된다. 머지 후 `curl -s https://saju-lab-phi.vercel.app/ | grep -o 'assets/[^"]*\.js'`의 번들 해시가 로컬 빌드와 같은지 실측.
3. LC 재계산 결과가 오면: 골든 **52행**(50 + YNY 보강 S-YNY-1 1995-02-15 12:00 여 · S-YNY-2 1995-11-10 12:00 여 — LC 채택) confirmed PR. `OPEN_REVIEW_ROUND` 상수 삭제. S-YNY 두 행은 GOLDEN-PILLARS에 먼저 넣어야 하고 일진·절입 KASI 대조가 필요하다(골든 추가 규칙).

## 3. 사용자 손
- #89 프리뷰 확인 → 머지 승인(= 프로덕션 배포).
- G2-3(8b 착수 조건) — 변경 없음.
- (선택) Vercel 배포 한도: 지출 0 원칙이라 Pro 전환은 하지 않는다. 한도는 24시간 뒤 풀린다.

## 4. 배운 것
- **main 머지 = 프로덕션 자동 배포** — 번들 해시 대조로 실측(`index-SkXWXRk4.js`). UI 작업의 완료 조건은 «머지»가 아니라 «프리뷰 URL»으로 둔다.
- **Vercel Hobby 배포 한도**가 여러 세션의 push로 소진될 수 있다. 한도가 걸리면 체크가 «fail»로 뜨지만 코드 문제가 아니다 — `gh pr checks`의 URL(`upgradeToPro=build-rate-limit`)로 구분한다.
- 이 기기가 다른 세션 부하로 무거울 때는 Chrome 확장과 vite dev가 멈춘다 → `vite build` + `vite preview` + headless playwright(`math-learning-platform/node_modules/playwright-core`를 읽기 전용으로 사용)로 검증했다.
- 스크롤 컨테이너(`overflow-x: auto`)의 min-content가 그리드 부모를 넓힌다 → `min-width: 0`. 대운 10주가 360px 화면에서 712px 가로 오버플로를 만들었다.
- **git worktree + node_modules junction을 쓴 뒤 `worktree remove --force`를 하면 junction을 따라가 원본 node_modules를 지운다**(baby 세션 사고 18:19). 정리한 뒤에는 `npm install`로 «up to date»를 실측한다.
