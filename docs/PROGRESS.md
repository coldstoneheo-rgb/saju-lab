# PROGRESS — 세션 진행 상태 파일

> 루프 하네스의 ⑥ 상태 파일. 매 세션 끝에 갱신한다. 거버넌스 규칙은 `AGENTS.md`, 작업 지침은 `CLAUDE.md`.

## 현재 위치
- 단계: **회의(2026-09-22) 로드맵 — L1 전부 + L2 5·6·7단계(십신·합충·대운, 골든 4표 confirmed) + 소급 코드 검수 보정 머지 완료**. 마감 인계 `docs/handoffs/2026-09-22-l2-stage567-close-handoff.md`. 다음 = 09-23 골든 보강(39건→50)·교차 구현 차분 HO · 그 뒤 8단계 HO. 마감 인계 `docs/handoffs/2026-09-22-l1-l2-close-handoff.md`. 병행: **Phase 6 — AI 해석** 도입. 병행: **사주 × 작명 번들** 가치사슬 — 오행 프리미티브(HO-A, PR #57) → 소비 계약 API(HO-API, PR #58) → 라이브 배포 복구(deploy-fix, PR #60) → 소비측 통합(HO-B) **완료 확인**. 전 구간 엔드투엔드 연결.
- 브랜치: `main`(392d794). 대기 PR 없음.
- 직전 작업: HO-B(baby-naming-ai 소비측 통합)가 별도 세션(AI Studio)에서 이미 구현·머지돼 있었으나 미기록 상태였던 것을 발견 → 라이브 API 교차검증으로 완료 확정, 양쪽 저장소 WORKLOG에 기록.
- 라이브: `https://saju-lab-phi.vercel.app/api/saju-pillars` `SAJU_API_KEY` 주입 완료(2026-07-02 확인, API 키 미포함 호출→401). baby-naming-ai 로컬 `.env`의 키로 골든 케이스(1990-01-01·10:30·male → `supplementPriority[0]=="metal"`, `absent==["metal"]`) 재현 확인.
- 기반 상태: rules-only 리포트 + 픽스처 절기 계산 + 오행 분포/부족/보완(HO-A) + `POST /api/saju-pillars` 계약(HO-API) + baby-naming-ai 소비측 통합(HO-B, `baby-naming-ai` 커밋 `5ec49a0`/`22b3585`).

## 다음 후보
- HO-B 후속: baby-naming-ai에 캐싱(birthDate+time+sex 키를 통한 동일 입력 재호출 방지) 추가, `GEMINI_API_KEY` 로컬 주입 후 `generateNames()` 풀 플로우 실기기 검증. (saju-lab 소관 아님 — baby-naming-ai 레포에서 진행)
- 지장간 가중(hidden-stem) 확장: 현재 본기-only 카운트를 가중 분포로 교체(매핑 상수 스왑 지점 마련됨).
- v1 운영화: `SAJU_API_KEY` 환경 주입, 플랫폼 레이트리밋 설정.
- AI 프롬프트 계약(`docs/AI_PROMPT_CONTRACT.md`)을 실제 해석 경로에 연결 (rules-only 보조 위치 유지).
- `packages/saju-core/src/ai-interpretation-guard.ts` 가드 범위 확장 + 테스트.
- 절기 픽스처 검증 범위 확대 (KASI 재검증 문서 참조).
- 잔여 esbuild low 권고(GHSA-g7r4-m6w7-qqqr): moderate 게이트 미만이라 비차단. 패치 버전 esbuild 0.28.1은 vite 7.3.5의 `^0.27.0` 범위 밖이라 `overrides` 강제 시 빌드 호환성 위험 → vite 업데이트로 자연 해소 대기.

## 작업 로그
| 날짜 | 내용 | 검증 |
|------|------|------|
| 2026-06-20 | 클로드코드 하네스 구조 도입(CLAUDE.md, .claude/agents·skills·commands, settings, 본 상태 파일) — PR #52 | `npm run verify` 통과 |
| 2026-06-20 | PR #52 리뷰 반영: Bash 권한 규칙 `:*`→`+공백 와일드카드`(제품 생성 settings.local.json 근거 검증), vite 7.3.3→7.3.5(audit high 권고 해소) | CI green, 리뷰 스레드 resolved |
| 2026-06-20 | PR #52 머지(main `9c6fcf7`), 원격·로컬 브랜치 정리, 구식 `codex/phase6a` 로컬 브랜치 삭제, main 동기화 | — |
| 2026-06-20 | PR #53: 본 PROGRESS에 하네스 세션 결과 기록. 리뷰봇 esbuild `overrides` 제안은 vite `^0.27.0` 범위 충돌로 검증 후 기각(근거 문서화) | CI green, 머지(main `52c0bdf`) |
| 2026-06-20 | PR #54: CLAUDE.md 하네스 섹션에 PR 프로세스 한 줄 추가. 리뷰봇 문체 일관성 제안 검증 후 반영 | CI green, 머지(main `79b4d2b`) |
| 2026-06-20 | PR #55: AGENTS.md Source Of Truth에 CLAUDE.md 링크 추가. 리뷰봇 지적 없음 | CI green, 머지(main `e1401ab`) |
| 2026-06-20 | PR #56: PROGRESS에 #53–#55 후속 기록. 리뷰봇 지적 없음 | CI green, 머지(main `48ac7ae`) |
| 2026-06-20 | devlog 자동 기록 훅(Stop→`Write-DevLog.ps1`) 설치·검증. 헤드리스 `-p`는 미발화, **인터랙티브 세션에서 정상 발화 확인**(`devlog/saju-lab/YYYY-MM-DD.md`). 설정은 gitignore된 `settings.local.json`이라 커밋 코드 변경 없음 | 사용자 인터랙티브 세션에서 자동 기록 확인 |
| 2026-06-21 | HO-2026-0620-saju-ohaeng-01: saju-core에 오행(목화토금수) 프리미티브 추가 — 간지→오행 매핑(천간/지지 분리 키잉), 분포 카운트(본기-only), 부족/과다·보완 우선순위 랭킹. `analyzeFiveElements` 등 export, 타입 types.ts 추가. 골든테스트(1990→金부재, 2024→水부재). 리뷰봇 string-파라미터 제안 검증 후 반영 | `npm run verify` 통과, 머지(main `d810742`) |
| 2026-06-21 | HO-2026-0620-saju-api-01: `saju-pillars-v1` 소비 계약 노출 — 순수 빌더 `buildSajuPillarsV1Response`(saju-core) + 얇은 Vercel 함수 `/api/saju-pillars`(apps/web 동거) + 문서 `docs/SAJU_PILLARS_API_V1.md` + 실HTTP PoC(`scripts/poc-saju-pillars.mjs`). solar만 지원·lunar 명시 에러, 선택적 x-api-key. PoC 출력이 1990 골든(金 부재)과 값 일치. 리뷰봇 4건 검증 — 날짜유효성(HIGH, 전제 거짓이나 에러코드 정확화 반영), 타임존(제안 부적절→`UNSUPPORTED_TIMEZONE`로 개선), 타이밍안전 키비교(반영) | `npm run verify` 통과, 머지(main `585cbba`) |
| 2026-06-21 | HO-B 소비측 통합 핸드오프 작성 — `docs/handoffs/HO-2026-0620-naming-consume-01.md`(baby-naming-ai 안드로이드용: Retrofit DTO·매핑·검증·골든 교차검증·Kotlin 스니펫) | 문서만, `git diff --check` 통과 |
| 2026-06-26 | HO-2026-0626-saju-deploy-fix-01: 프로덕션 `/api/saju-pillars` 500 복구. 실측 원인=`@vercel/node`가 워크스페이스 소스는 번들에 컴파일해도 `node_modules/@saju-lab/saju-core` 심링크를 재생성 안 함 → bare specifier 런타임 모듈로드 실패(`FUNCTION_INVOCATION_FAILED`, GET 포함 전부 500). 수정(배포 전용): import를 상대경로(`../packages/saju-core/src/index.js`)로, union 내로잉을 `("data" in result)`로(@vercel/node는 non-strict 타입체크 → 불리언 판별자 내로잉 실패), `@types/node`+`api/tsconfig.json` 추가, `.vercel/` gitignore. 라이브 스모크 200+골든·GET 405 확인 — PR #60 | `npm run verify` 통과, `vercel build` 클린 번들, 라이브 프로덕션 200 |
| 2026-07-02 | HO-B(HO-2026-0620-naming-consume-01) 완료 확인. 실제 구현은 baby-naming-ai 별도 세션(AI Studio, 커밋 `5ec49a0`/`22b3585`)에서 이미 끝나 있었으나 어느 WORKLOG에도 기록되지 않아 본 문서엔 "다음 후보"로 남아 있던 것을 발견. `SAJU_API_KEY`가 이미 프로덕션에 주입됐음(API 키 미포함 호출 401)을 확인하고, baby-naming-ai 로컬 키로 라이브 API를 직접 호출해 핸드오프 골든 교차검증(1990-01-01·10:30·male → `supplementPriority[0]=="metal"`, `absent==["metal"]`) 재현. 양쪽 저장소 WORKLOG에 기록(baby-naming-ai `ceff283`) | 라이브 프로덕션 API 직접 호출로 재현·확인, `git diff --check` 통과 |
| 2026-08-23 | 월 경계 절기표를 KASI 공공데이터 생성물로 교체 — data.go.kr `get24DivisionsInfo`에서 2000-2028 **696건(24×29)** 수집(`docs/fixtures/kasi-special-days-solar-terms-2000-2028.json`), `scripts/generate_solar_terms_module.py`가 12개 월 경계 절기만 뽑아 `packages/saju-core/src/solar-terms.data.ts`(352행) 생성. `solar-terms.ts`는 로직만 보유. API 미제공 구간(1989-1999)의 4행은 생성기 `LEGACY_BOUNDARIES`로 보존. 계산 범위 2024년 1년 → **2000-02-04 ~ 2028-12-06**. 교차검증: 내장 22행 전부 `match`, 2000-2016이 2026-05-26 픽스처와 408/408 일치. 회귀 테스트에 소비 앱 실입력값(2026-06-06) 추가 | `typecheck`/`test`(255건)/`build`/`git diff --check` 전부 통과. `npm audit`은 main `9e0f476`에서도 동일 실패(선존재, 의존성 0개 추가) |
| 2026-09-22 | 사주 회의 전 세션 정비(LC TASK, 사용자 승인) — devlog Stop 훅 재설치(settings.local.json, 06-20 설치분이 유실돼 있었음), CLAUDE.md 「단일 창 지시 체계(§8)」 절 + 하네스 파이프라인 줄, `AGENT_STATUS.json` 신설(LC 스펙 v1.2), `.claude/skills/harness-loop-engine/SKILL.md` 복제(baby-naming-ai 동형). 제품 코드 변경 없음 | `npm run verify` 게이트, `python -c json.load` 통과, hooks.Stop 1건 실측 |
| 2026-09-22 | 회의 D9 1단계: `npm audit fix --package-lock-only`로 package-lock.json만 갱신(vitest 4.1.8→4.1.11 계열 8, postcss 8.5.14→8.5.28, nanoid 3.3.12→3.3.19, tinyrainbow·sourcemap-codec 패치) — 전부 선언 범위 내, package.json·코드 변경 0. #64(08-21)부터 빨갛던 CI verify 복구 | `npm ci` 0 · `npm audit --audit-level=moderate` 0(esbuild low 1건) · `npm run verify` 0 |
| 2026-09-22 | HO-2026-0922-saju-L1-spike-kasi-01: 절기 소스를 KASI 24기 입기 시각 표(1920~2100, `docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`)로 교체. 생성기에 txt 파서·`--cross-check`·24:00 정규화·JSON 롤백 입력, LEGACY 손관리 행 삭제. cross-check 348행(≤1분 19·>1분 1) 판정 + astronomia 3자 검증(≤2030 1,332행 100% ≤60 s, 1950-99 1,200건 100%). **2011-11-08 입동 09:26→03:35 수정**(03:35~09:25 출생 월주 무술→기해). 범위 핀 테스트 3건 재작성 + 신규 5건, saju-core `vitest run src`(dist 중복 제거), CI에 `--check`+파서 unittest 스텝, 계산 범위 카피·SPEC·AUDIT·API 문서 갱신. 번들 gzip +19.9KB. REPORT `docs/handoffs/HO-2026-0922-saju-L1-spike-kasi-01-REPORT.md` | `npm run verify` exit 0(테스트 162), CI 초록 |
| 2026-09-22 | HO-2026-0922-saju-L1-stage12-01 PR 2: 한국 시간대 이력 정규화 — `timezone-history.data.ts`(tzdb 2026d Zone Asia/Seoul·Rule ROK, 표준 4구간+서머타임 12행 → 28전이) + `normalizeToKstWallClock`(ambiguous 첫 발생·nonexistent 전이 전 유지) + `calculatePillarsWithResolution` + v1 응답 `resolution` + 경계일 인접일 판정. 선행 게이트(응답 3건 값 고정) 첫 커밋. 예제 1955-02-04 22:50 → 을미·무인 고정 | `npm run verify` exit 0(테스트 180), 28전이 Intl(tz 2025b) 대조 통과 |
| 2026-09-22 | HO-2026-0922-saju-L1-stage12-01 PR 1: `docs/golden/GOLDEN-PILLARS.md` 정본 11건(연·월주 = KASI 24기 표 행, 일주 = data.go.kr `getLunCalInfo` `lunIljin` 8/8 일치, 시주 = 오자둔 규칙) + `golden-pillars.ts` 파서(열 이름 매핑, 출처 빈칸·«commonly listed» = 실패) + 네거티브 6건 + `scripts/fetch_golden_day_pillars.py`. `fixtures.ts` 폐기, 테스트 3파일은 `golden-pillars.load.ts` 공유 | `npm run verify` exit 0(테스트 217) |
| 2026-09-22 | HO-2026-0922-saju-L1-stage3-01 PR 1: `options.trueSolarTime`(경도 보정만, 균시차 미적용)+`birthPlace`(17 시·도, `birth-place.data.ts` Wikidata P625 출처, 서울 −32분)·`jaHourPolicy`(late/early)·`dayBoundary`(midnight/trueSolar) — `calculatePillarsWithResolution`이 반대쪽 명식 `alternates`와 `resolution.nearBoundary`(시지 [B−10,B+34]·자정 ±32·절입 ±60) 반환. v1 요청 검증 코드 2개 추가. 회의 사례 13:10 서울 未→午 고정. `hourBranchIndexAtMinute` 분 단위 경로 | `npm run verify` exit 0(테스트 234), 옵션 미지정 기존 필드 불변(게이트 3건·골든 11건) |
| 2026-09-22 | HO-2026-0922-saju-L1-stage3-01 PR 2: 웹 `CalculationRuleLine` — `describeCalculationRule`(resolution→1줄), 경계(`nearBoundary.hourBranch`) 시 17 시·도 select → `trueSolarTime:true` 로컬 재계산, `alternates.jaHourPolicy` 접힘 표 + localStorage 열람 카운터. 스크린샷 4장 `docs/evidence/2026-09-22-stage3-web/` | `npm run verify` exit 0(테스트 239) |
| 2026-09-22 | HO-2026-0922-saju-L1-stage4-lunar-01 파트 B: `lunar-calendar.data.ts`(151 int, Kotlin 원본에서 스크립트 추출, sha 3507414e…5107)+`lunar-calendar.ts`(null 계약) · `BirthInput.calendar/isLeapMonth` · `resolution.calendar` · v1 `INVALID_LUNAR_DATE` · `:110` 반전 · `scripts/verify_lunar_table.py` 54,779일 0 불일치 · 공유 골든 50건 · 웹 음력/윤달 입력 + 스크린샷 3장 `docs/evidence/2026-09-22-stage4-lunar/` | `npm run verify` exit 0(테스트 262) |
| 2026-09-22 | HO-2026-0922-saju-L2-stage5-tengods-01: `docs/rules/HIDDEN-STEMS.md` 정본(연해자평 일수 / 자평진전 인원용사) ↔ `l2/hidden-stems.data.ts` 동일성 테스트, `l2/ten-gods.ts`(100조합 표), v1 `options.include`/`hiddenStemSchool` + `hiddenStems`/`tenGods` 블록, `docs/golden/GOLDEN-TENGODS.md` 11건 pending + 파서, 웹 십신 라벨·지장간 접힘, 스크린샷 2장 | `npm run verify` exit 0(테스트 285) |
| 2026-09-22 | 골든 십신표 confirmed 기입 PR #77(4000671): 11행 confirmed·출처 인용, 학파 고정 머리말(japyeong 토글 실측 20셀·대안 15셀 병기), 야자시 비고, 테스트 «japyeong 산출은 표와 대조 안 함·정확히 20셀 다름» | `npm run verify` exit 0(테스트 287) · CI 초록 |
| 2026-09-22 | HO-2026-0922-saju-L2-stage6-interactions-01: `docs/rules/INTERACTIONS.md` 정본(간합 5·육합 6·삼합 4·방합 4·충 6·형 4) ↔ `l2/interactions.data.ts` 동일성 테스트, `l2/interactions.ts`(규칙 층 + 명식 층, 인접 비억제·포섭·shared·자형 쌍별), 전수 테스트(10×10·12×12·220), v1 `options.include: interactions`, `docs/golden/GOLDEN-INTERACTIONS.md` 11건 pending + 파서, 웹 합충 칩+접힘 상세, API 문서 「합충 블록」, 스크린샷 3장 | `npm run verify` exit 0(테스트 322) |
| 2026-09-22 | 골든 합충표 confirmed PR #79(60bc06c): 11행 confirmed·shared 비고 삭제·글자 순서 머리말, 합성 케이스 3건 추가 | `npm run verify` exit 0(테스트 325) · CI 초록 |
| 2026-09-22 | HO-2026-0922-saju-L2-stage7-daeun-01: `docs/rules/DAEUN.md` 정본(순역 4조합·12절) ↔ `l2/daeun.ts` 파서 테스트, `daeunOf`(정규화 KST·정오 대체·엄격히 뒤/이하·D÷4320 소수·10주+십신·2100 절단·current), `resolveBirthKst`, v1 `include: daeun` + `referenceDate`, `docs/golden/GOLDEN-DAEUN.md` 16행 pending + 파서, 웹 대운 행+규칙 접힘, API 문서, 스크린샷 3장. PR 오픈 — 머지 게이트(LC 판정) 대기 | `npm run verify` exit 0(테스트 358) · verifier PASS |
| 2026-09-22 | 7단계 대운 v1 PR #80 머지(786a214, LC 판정 「머지 가」 뒤) | CI 초록 · verify 358 |
| 2026-09-22 | TASK-2026-0922-retro-review-fixes: A1 `BirthTimeRequiredError`→`MISSING_BIRTH_TIME` · A2 `kstDate` · A3 dayMidnight [−10,+34] · A4 본문 키 대소문자 변형 400+timeUnknown 타입 · A5 골든 합충 md 오라클(전 필드·정렬 집합) · A6 에러표=유니언 파서 테스트 · A7 복사 반환 · A8 kind 비교 · A9 shared=id(불변식) · A10 throw · A11 정규식 · A12 골든 lunar(윤달) · P2 출생지·옵션 열 · A13 중복 id · A14/B2/B4 문서 · A15 결번 dst · B1 죽은 항목 제거 · B3 삼명통회 출처 · C 동어반복 4+pending 20%+미검증 6 · D1~D5+미검증 4 · 골든 대운표 16행 confirmed. PR 오픈, LC 판정 대기 | `npm run verify` exit 0(테스트 388) · 골든 4표 값 불변 |
| 2026-09-22 | 보정 PR #81 머지(392d794, LC 조건부 판정 → 조건 4건 반영) · 세션 마감(2차) 인계서 `docs/handoffs/2026-09-22-l2-stage567-close-handoff.md`(SHA·PR·경로 origin 실측 대조, 정정 0) · 브랜치 main만·프로세스 0 | `npm run verify` exit 0(테스트 388) |

## 세션 종료 체크
- [x] `npm run verify` 통과
- [x] 도메인 불변 규칙 위반 없음 (문서/설정 변경만, verifier 체크리스트 해당 없음)
- [x] 본 파일의 "현재 위치 / 다음 후보 / 작업 로그" 갱신
