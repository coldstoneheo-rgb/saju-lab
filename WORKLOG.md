# WORKLOG — saju-lab

> 오케스트레이터(Life Coordinator) `/project-scan`용 요약+신호 로그. 최신이 맨 위(append-only).
> 규약 전문: life-coordinator `docs/WORKLOG_PROTOCOL.md`. 상세 세션로그는 `docs/PROGRESS.md`.

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
