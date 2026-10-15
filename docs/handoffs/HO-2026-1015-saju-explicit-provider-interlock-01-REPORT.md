# REPORT — HO-2026-1015-saju-explicit-provider-interlock-01

> 발주: LC `life-coordinator-39` · 발주서 life-coordinator `handoffs/HO-2026-1015-saju-explicit-provider-interlock-01.md` · 등급 [HO] origin:lc
> 수신: saju-lab 창 (Opus 5.5) · 2026-10-15

## 완료 조건 체크리스트 (발주서 §3)
- [x] 1. `CLAUDE_ROUTING_ENABLED !== "1"`이면 명시 `{provider:"claude"}` → `403 PROVIDER_NOT_ENABLED`, `generateWithClaude` 미도달 — 테스트 `gemini-generate.routing.test.ts` «provider claude without CLAUDE_ROUTING_ENABLED» (값 부재·`"0"`·`"true"` × 작명/편지+옵트인, Anthropic 클라이언트 생성 0 · `create` 0 · Gemini fetch 0)
- [x] 2. `CLAUDE_ROUTING_ENABLED === "1"`이면 기존대로 Claude 직행(라우팅 읽기·폴백 없음) — 테스트 «provider claude with CLAUDE_ROUTING_ENABLED=1»
- [x] 3. P1 회귀: `npm run verify` exit 0 (api 111 · core 740 · web 49) · regression 스냅샷 내용 diff 0(`git diff --ignore-cr-at-eol` — Windows EOL 재기록만, 원복) · 변경 파일 = `api/app/gemini-generate.ts`·테스트 2·문서 2·이 REPORT
- [x] 4. 문서: `docs/DESIGN-dualllm-saju-baby.md` §1-1 개정 1줄 · `docs/APP_GATEWAY.md` env 표 `CLAUDE_ROUTING_ENABLED` 행 + Claude 경로 절 «인터록» 1줄. baby 레포 문서는 건드리지 않음(아래 이관)
- [ ] 5. verifier(effort high) PASS → PR → LC 게이트 → 머지 → 프로덕션 스모크 2회
- [ ] 6. 이 REPORT 완결

## 설계 메모
- 가드 위치: `api/app/gemini-generate.ts` 명시 분기 안, `import("../_lib/claude-generate.js")` **이전**. 그래서 막힌 요청은 SDK 모듈 로드도 하지 않는다.
- 응답: `403` + 기존 `errorBody("PROVIDER_NOT_ENABLED", "The requested provider is not enabled on this deployment.")`. 403을 고른 이유 — 요청 형식은 맞고(400 아님) 이 배포가 그 엔진을 허용하지 않는다는 뜻. Gemini 폴백 없음(DESIGN §1, 평가 오염 방지).
- 순서: 인터록 검사가 `ANTHROPIC_API_KEY` 부재 503보다 먼저다. ENABLED=1·키 없음이면 기존대로 503.
- 픽스처 변경 1건: `api/_lib/claude-generate.test.ts` `beforeEach`에 `CLAUDE_ROUTING_ENABLED="1"` 1줄. 이 파일의 Claude 경로 테스트들은 명시 `provider:"claude"`로 들어오므로 인터록을 켜야 기존 동작을 그대로 검증한다. **단언(expect)은 하나도 바꾸지 않았다**(LC 허용 조건).

## 이관
- baby 레포: 디버그 토글(D2)·평가 하네스 문서에 «프로덕션 별칭에서는 명시 Claude가 403 — `CLAUDE_ROUTING_ENABLED=1`인 Preview/로컬에서 돌릴 것» 1줄 갱신 필요.

## effort
- 구현: 세션 medium (범위 분명한 구현).
- verifier: high (REF §3 «critic·검수» 행). `.claude/agents/verifier.md`에는 아직 `effort:` frontmatter가 없어(설정 TASK는 사용자 직접 입력 대기) 호출 시 effort high를 지정했다.

## 결과
- verifier(effort high): **PASS** — 우회 경로 없음(`generateWithClaude` 호출처는 핸들러 2곳뿐, 라우팅은 `llm-routing.ts:159`), 기존 expect 무변경 확인. 권고 반영: `APP_GATEWAY.md` `ANTHROPIC_API_KEY` 행에 «ENABLED=1인 배포에서» 한정어.
(PR·SHA·스모크 — 진행하며 채움)
