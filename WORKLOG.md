# WORKLOG — saju-lab

> 오케스트레이터(Life Coordinator) `/project-scan`용 요약+신호 로그. 최신이 맨 위(append-only).
> 규약 전문: life-coordinator `docs/WORKLOG_PROTOCOL.md`. 상세 세션로그는 `docs/PROGRESS.md`.

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
