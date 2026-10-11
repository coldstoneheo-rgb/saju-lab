# DESIGN — saju 게이트웨이(+baby) Gemini 유지 + Claude 추가 (설계 단계)

> 발주: LC `handoffs/HO-2026-1011-saju-baby-dualllm-design.md` (origin: user, 사용자 원문 인용 있음) · 전략 정본 LC `docs/PLAN-2026-1011-dual-llm-provider-eval.md`(P1–P6).
> 지위: **설계 v2 (2026-10-11, LC 판정 반영)** — 사용자 sign-off 전 구현 금지(P6). 코드·스키마·PR 0.
> 기준 커밋: saju-lab `61f1ddb` · baby-naming-ai `f2aa508` · life-coordinator `20af385`.
> Claude API 사실 출처: Claude Code 번들 `claude-api` 스킬(모델표 캐시 2026-10-06) — 아래 «[스킬]» 표기. 구현 전 스파이크(§7-3)로 실측 재확인한다.

## 0. 완료 조건 체크리스트 (발주서 번호 = 절 번호)

| # | 항목 | 상태 | 절 |
|---|---|---|---|
| 1 | 심 설계(provider 위치·기본 gemini 무변경) | 초안 완료 | §1 |
| 2 | 구조화 출력 매핑(순서·개수·한국어 / 편지 1:1) | 완료 — LC 수용(F1·F2, 10-11) | §2 |
| 3 | 응답 역변환 매핑표(baby 파서·cleanJson 무변경) | 초안 완료 | §3 |
| 4 | 키 공급(서버 env·크레딧) | 초안 완료 | §4 |
| 5 | 토글 UI 설계 + 지금/뒤로 권고 | 초안 완료 — 권고: 2단계·디버그 한정 | §5 |
| 6 | Gemini 무변경 회귀 증명 방법 | 초안 완료 | §6 |
| 7 | 리스크·대안·평가 고정세트 비용 | 초안 완료 | §7 |
| — | 사용자 결정 D2–D4 (D1·D5는 LC 판정으로 확정, D5도 sign-off에 포함) | 대기 | §8 |

---

## 1. 심(seam) 설계

### 1-1. 결론
LC 안(게이트웨이 1곳, 요청 본문의 `provider` 필드)을 **수용**한다. 단, P1을 지키려면 두 군데의 **위치**가 중요하다.

| 층 | 위치 | 규칙 |
|---|---|---|
| 게이트웨이 입력 | `api/_lib/gemini-request.ts` `validateGenerateContentRequest()` (:168) | 최상위 `provider`를 읽어 **`ValidationOutcome`의 형제 필드**로 돌려준다: `{ ok: true, request, provider }`. **`ProxyRequest` 안에 넣지 않는다** — 핸들러가 `JSON.stringify(validation.request)`(:95)를 그대로 Gemini에 보내므로, 안에 넣으면 Gemini 요청 바이트가 바뀐다. |
| 값 규칙 | 같은 함수 | 부재 → `"gemini"` · `"gemini"` → `"gemini"` · `"claude"` → `"claude"` · 그 밖(대소문자 다름, 비문자열 포함) → `400 INVALID_BODY`. 오타가 조용히 Gemini로 가면 평가 데이터가 오염되므로 거부한다. (현재 앱은 `provider`를 보내지 않으므로 기존 호출에는 영향이 없다.) |
| 게이트웨이 분기 | `api/app/gemini-generate.ts` handler, **검증 성공 직후(:81 다음)·`const model =`(:83) 앞** 1곳 | `if (validation.provider === "claude") { await handleClaude(validation.request, res); return; }`. :83–130의 Gemini 본문은 **줄 단위로 무변경**이다(P2: 분기문이 Gemini 본문에 흩어지지 않음). |
| Claude 어댑터 | 신규 `api/_lib/claude-adapter.ts` (순수 함수) + `api/app/claude-call.ts` 또는 핸들러 내부 함수 `handleClaude` | 번역(§2)·호출·역변환(§3)·오류 매핑을 전부 여기에 둔다. |
| 앱(2단계) | baby `GeminiApi.kt` `GenerateContentRequest`에 `@Json(name = "provider") val provider: String? = null` | **`NamingInput`에는 넣지 않는다** — `inputAdapter.toJson(input.forPrompt())`(NamingRepository.kt:487)가 사용자 블록 본문이 되므로, 넣는 순간 Gemini 프롬프트 바이트가 바뀐다. Moshi는 기본적으로 null을 직렬화하지 않으므로 `provider = null`이면 앱이 보내는 바이트도 지금과 같다. Gemini 선택 시에는 `"gemini"`가 아니라 **null**을 보낸다. |

### 1-2. 무변경 보장 방식 (요약 — 증명은 §6)
- Gemini 경로는 (a) 같은 `request` 객체, (b) 같은 URL·헤더·본문 직렬화, (c) 같은 응답 pass-through(:123)를 유지한다. 바뀌는 것은 `validateGenerateContentRequest`의 **반환 객체에 필드 하나가 붙는 것**뿐이다.
- 오류 순서도 보존한다. `GEMINI_API_KEY` 검사(:55)는 그대로 맨 앞에 둔다. `ANTHROPIC_API_KEY` 검사는 Claude 분기 **안**에서 한다(없으면 `503 UPSTREAM_NOT_CONFIGURED`). 부작용: Claude 요청도 `GEMINI_API_KEY`가 있어야 통과한다 — 운영에는 항상 있으므로 수용하고, Gemini 오류 순서를 바꾸지 않는 쪽을 택한다.
- 레이트리밋은 공유한다(같은 `limiter`, IP당 20회/5분). 남용 표면이 Gemini와 같아야 하기 때문이다. 대신 평가 러너는 속도를 조절해야 한다(§7-4).
- 라우트 이름 `gemini-generate`는 그대로 둔다(배포된 앱의 계약이다). 응답 계약 이름도 `app-gemini-generate-v1`을 유지한다.

### 1-3. 호출 방식
- **`@anthropic-ai/sdk`**(TypeScript 공식 SDK)를 쓴다(LC 판정 10-11 D5 수용 — Claude 분기에만 격리, Gemini 경로는 raw fetch 그대로) — [스킬] 규칙상 TS 프로젝트에서 raw fetch를 쓰지 않는다. Gemini 쪽이 fetch인 것은 공식 SDK를 들이지 않은 기존 선택이므로 그대로 둔다.
- `new Anthropic({ apiKey, maxRetries: 0, timeout: UPSTREAM_TIMEOUT_MS })`. 재시도는 0으로 둔다 — baby가 이미 1회 재시도(`fetchNamingOutputWithRetry`)하므로, SDK 기본 2회와 겹치면 벽시계가 최대 3배(×180s)로 늘어난다.
- 비스트리밍 `messages.create`를 쓰고, `max_tokens: 16000`([스킬] 비스트리밍 기본)으로 둔다. 실측 지연이 길면 `stream().finalMessage()`로 바꾼다(§7-3 스파이크 판정).
- `npm run verify`의 `npm audit --audit-level=moderate` 게이트를 의존성 추가 PR에서 통과해야 한다.

---

## 2. 구조화 출력 매핑 (P4)

### 2-1. LC 안에 대한 사실 반박 (§6-3: 실측이 위계를 이긴다)
- **F1 — «tool-use + 강제 단일 tool 호출»은 주력 후보 모델에서 400이다.** `tool_choice: {type:"any"|"tool"}`은 Claude Opus 5.5·Sonnet 5.5(및 Fable 5.1)에서 `400 tool_choice: type "tool" and "any" are not supported for this model`이다([스킬] tool-use-concepts.md:106). Haiku 5.5는 강제 호출을 받지만, 그 경우 thinking 없이 바로 tool 호출로 시작한다(model-migration.md:2289). `auto` + 프롬프트 지시는 호출 자체를 보증하지 않는다.
- **대안(채택 제안): 구조화 출력 `output_config.format`(JSON schema).** Haiku 5.5·Sonnet 5.5·Opus 5.5를 모두 지원한다(tool-use-concepts.md:533). 응답은 `text` 블록 안의 스키마 적합 JSON이므로, tool input을 꺼내 문자열로 다시 만드는 단계가 없어 역변환이 더 단순하다.
- **F2 — Claude 구조화 출력은 개수 제약(«complex array constraints»)을 지원하지 않는다**(tool-use-concepts.md:537–554). `minItems/maxItems`만으로는 FREE 3 / PREMIUM 10을 **문법 수준에서 보증할 수 없다.** 이 값은 Gemini에서 «스키마가 프롬프트를 이긴다»(HO-2026-0803 §2.6)는 근거로 넣은 핵심 장치이므로, 아래 §2-3의 대체 장치가 필요하다.

### 2-2. 스키마 번역표 (Gemini `responseSchema` → JSON Schema, `claude-adapter.ts` `toJsonSchema()`)
입력은 이미 `narrowSchema()`로 허용목록 11키만 남은 상태다.

| Gemini 키 | JSON Schema 변환 | 비고 |
|---|---|---|
| `type: OBJECT/ARRAY/STRING/INTEGER/NUMBER/BOOLEAN` | 소문자 `object/array/string/integer/number/boolean` | 모르는 type이면 400(조용히 넘기지 않음) |
| `properties` | `properties` — **`propertyOrdering` 순서로 삽입**(없으면 원래 순서) | 생성 순서 유도(§2-4) |
| `required` | `required` 그대로 | |
| `propertyOrdering` | 출력 스키마에서 제거, 순서 정보로만 사용 | 응답 재직렬화에도 쓴다(§3) |
| `minItems`/`maxItems` | **같은 값 N(1≤N≤20)이면 «펼침»(§2-3)**, 아니면 제거하고 사후검증 | |
| `enum` | `enum` 그대로 | |
| `nullable: true` | `anyOf: [<schema>, {type:"null"}]` | |
| `format` | 지원 목록(`date-time, time, date, duration, email, hostname, uri, ipv4, ipv6, uuid`)이면 유지, 아니면 제거 | |
| `description` | 그대로 | **한국어 지시가 실린 곳**(§2-5) |
| (모든 object) | `additionalProperties: false` 추가 | 구조화 출력 필수 조건 |

### 2-3. 개수 보증: «배열 펼침» + 사후검증 (이중)
1. **펼침(문법 보증).** `type: ARRAY`, `minItems == maxItems == N`이면 Claude에 보내는 스키마에서 그 노드를 `{type:"object", properties:{item_1: <items>, …, item_N: <items>}, required:[item_1…item_N], additionalProperties:false}`로 바꾼다. 필수 속성 N개 + 추가 속성 금지이므로 **정확히 N개가 문법으로 보증된다.** 응답에서는 `item_1…item_N` 순서로 다시 배열로 접는다(§3).
   - 작명 스키마에서는 `recommended_names`(FREE 3 / PREMIUM 10) 한 곳만 해당한다(NamingRepository.kt:303).
   - 규칙은 일반적이다(작명 전용 하드코딩 아님). 상한 20은 스키마 폭주 방지용이다(`LIMITS.maxSchemaNodes` 300 안).
2. **사후검증(방어 심층).** 접은 뒤 게이트웨이가 원래 Gemini 스키마의 `minItems/maxItems`·`required`로 다시 검사한다. 어긋나면 `502 UPSTREAM_ERROR`를 돌려주고 로그 `[app/gemini-generate] claude schema-violation`을 남긴다. 그러면 앱의 기존 1회 재시도가 받는다(앱 무변경). 이 로그 건수가 평가 지표 «구조 실패율»의 1차 소스다.
3. 프롬프트의 `countText`("$nameCount distinct names")는 앱이 이미 보내므로 그대로 함께 작동한다.
- 펼침의 품질 영향(이름 사이 «서로 다른 이름» 감각이 배열보다 약해질 가능성)은 스파이크(§7-3)에서 펼침 ON/OFF를 각 10회 돌려 비교한다. 문법 보증이 실측에서 이기면 ON을 확정한다.

### 2-4. 필드 순서 보증
- **응답 키 순서는 코드가 결정적으로 보증한다.** 게이트웨이가 Claude JSON을 파싱한 뒤 원래 스키마의 `propertyOrdering`을 따라 재직렬화한다(§3). 그래서 앱이 받는 텍스트의 키 순서는 Gemini 계약과 같다. (참고: baby 파서 Moshi는 키 순서와 무관하다.)
- **생성 순서**(요약 `saju_analysis_summary` → `recommended_names`, 이름 안에서는 한글 → 한자 → 뜻 → 감명)는 품질 요인이다. 두 겹으로 유도한다.
  1. **가정:** 스키마 `properties` 선언 순서를 `propertyOrdering`대로 맞추면 구조화 출력이 그 순서로 생성한다(문서로 확인하지 못한 가정).
  2. **안전판(가정에 의존하지 않음):** 스키마 요청일 때 게이트웨이가 Claude 경로에서만 `system` 끝에 텍스트 블록 1개를 덧붙인다 — 루트 `propertyOrdering`에서 생성한 «JSON 필드를 이 순서로 작성하라: saju_analysis_summary → recommended_names (각 이름 안: name_korean → name_hanja → hanja_meanings → structural_check)». 일반 규칙(스키마에서 파생)이라 작명 전용 하드코딩이 아니며, Gemini 요청과 앱은 무변경이다.
  - 가정이 맞는지는 구현 단계의 스파이크(§7-3)에서 확인한다. 설계는 그 결과에 의존하지 않는다.

### 2-5. 한국어 출력 보증
- 언어 지시가 실린 세 곳을 그대로 옮긴다. ① `systemInstruction`(→ `system`, `LANGUAGE_MANDATE` 포함), ② 스키마 `description`(«한국어로 작성… 영어 단어를 쓰지 말 것», NamingRepository.kt:225–318 `buildRecommendedNamesSchema`), ③ 사용자 블록.
- HO-2026-0811(«구조화 출력 모드에서 description이 없으면 영어로 샌다»)의 교훈이 Claude에도 같은 장치로 적용된다. description을 지우는 번역은 금지한다(번역표에서 유지).
- **판정은 실측으로 한다**: baby `LiveKoreanOutputVerification`(PREMIUM 10회 + FREE 5회, `languagePass` = 영문 혼입 0·절단 0·오행 설명 길이 상한)을 Claude 경로로 15/15 통과해야 한다(§6-4, §7).

### 2-6. 생성 파라미터 매핑

| Gemini (`ProxyRequest`) | Claude Messages | 비고 |
|---|---|---|
| `systemInstruction.parts[i].text` | `system: [{type:"text", text}]` (part 1개 ↔ 블록 1개) | 이어붙이지 않고 1:1로 옮김 |
| `contents[j].parts[i].text` | `messages: [{role:"user", content:[{type:"text", text}…]}]` (content 1개 ↔ user 메시지 1개) | 게이트웨이가 role을 버리므로 전부 user다(Gemini 기본 role과 같다). 연속 user 메시지는 API가 합친다 |
| `generationConfig.temperature` (0.8 / 0.9) | **보내지 않는다** | Haiku 5.5·Sonnet 5.5는 기본값이 아니면 400, Opus 5.5는 400이다([스킬] 사고 표). → **다양성 패리티 차이**로 평가 시트에 명시한다 |
| `responseMimeType: application/json` + `responseSchema` | `output_config.format` = JSON schema (§2-2·2-3) | |
| `responseMimeType: application/json`, 스키마 없음 | format 없음(평문). `cleanJson`이 코드펜스를 벗긴다 | baby는 이 조합을 쓰지 않는다 |
| `text/plain` 또는 부재 (편지) | format 없음 → 평문 | **generateLetter 1:1**(§2-7) |
| (없음) | `model` = 서버 env `CLAUDE_MODEL`(§4, D1) | 호출자는 모델을 고를 수 없다(기존 원칙 유지) |
| (없음) | `max_tokens: 16000` | |
| (없음) | `thinking` 생략(= adaptive, 세 모델 모두 기본 on) · `output_config.effort` **명시**(기본값: Haiku/Opus 5.5 = medium, Sonnet 5.5 = high — 모델마다 다르므로 명시해 비교를 공정하게) | 초기값 `medium`, 스파이크에서 지연 보고 확정 |
| (없음) | `fallbacks` **미사용** | [스킬] 기본 권고는 켜는 것이지만, 평가 중 거절 시 다른 모델이 대신 답하면 «어느 모델 품질인가»가 오염된다. 거절은 502 + 로그로 세어 지표로 쓴다. 배포 결정 단계에서 재검토한다 |

### 2-7. generateLetter (스키마 없는 평문)
- 요청: `systemInstruction` 1블록 + 사용자 블록 1개 + `temperature 0.9` → `system` 1블록 + user 1메시지, temperature 제거, format 없음.
- 응답: `text` 블록들을 순서대로 이어붙인 문자열을 그대로 `parts[0].text`에 넣는다(재직렬화 없음). `cleanJson`(NamingRepository.kt:703)은 앞뒤 공백과 코드펜스만 벗기므로 평문은 그대로 통과한다.

---

## 3. 응답 역변환 매핑표 (Anthropic → Gemini 모양)

| Anthropic `Message` | → Gemini `generateContent` 응답 | 규칙 |
|---|---|---|
| `content[]` 중 `type:"text"` 블록 | `candidates[0].content.parts[0].text` | 텍스트 블록을 순서대로 이어붙인다. **`thinking` 블록은 버린다**(adaptive라 생길 수 있다). 스키마 요청이면 JSON.parse → 펼침 되접기(§2-3) → 사후검증 → `propertyOrdering` 순서로 `JSON.stringify` |
| (고정) | `candidates[0].content.role = "model"` | |
| `stop_reason: "end_turn"` | `candidates[0].finishReason = "STOP"`, HTTP 200 | |
| `stop_reason: "max_tokens"` | **HTTP 502** `UPSTREAM_ERROR` + 로그 | JSON이 잘린다 — 앱 재시도로 넘긴다 |
| `stop_reason: "refusal"` | **HTTP 502** + 로그(`stop_details.category`) | 거절률 지표 |
| 그 밖(`tool_use`·`pause_turn` — 도구를 안 주므로 이론상 없음) | HTTP 502 + 로그 | |
| 텍스트 빈 문자열 / JSON 파싱 실패 / 사후검증 실패 | HTTP 502 + 로그 | |
| `model` | `modelVersion` | 디버그 BODY 로그에서 provider·모델 식별용 |
| `usage.input_tokens / output_tokens` | `usageMetadata.promptTokenCount / candidatesTokenCount / totalTokenCount` | 평가 비용 집계용. 함수 로그에도 1줄(`claude usage in=… out=… ms=…`, 본문 없음) |
| `id` | `responseId` | |
| (헤더) | Claude 분기에만 `x-llm-provider: claude` | Gemini 경로의 응답 헤더는 무변경 |

**오류 매핑**(본문 형태는 기존 `errorBody` 그대로): SDK `RateLimitError`(429) → 429 · `APIConnectionTimeoutError` → 504 · 그 밖 `APIError`(400/401/403/5xx/529) → 502. 로그에는 `status`·`request_id`만 남기고 상류 본문은 남기지 않는다(기존 :104 원칙과 같다).

**baby 파서 무변경 확인**
- Moshi `GenerateContentResponse`는 `candidates`만 선언한다(GeminiApi.kt:69–71). 추가 필드(`modelVersion`·`usageMetadata`·`responseId`)는 Moshi 기본 동작으로 무시된다(구현 때 단위 테스트로 확인).
- :596 `candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text` → 위 표대로 채워진다.
- :599 `cleanJson` → 코드펜스가 없는 JSON이므로 trim만 한다. :600 `outputAdapter.fromJson` → 키는 같고 순서도 같다. `easy_explanation`은 스키마에 없고 기본값 `""`(BabyNamingModels.kt:47)이므로 Gemini와 같다.
- :689 편지 → 평문 그대로.
- 502/504 → Retrofit `HttpException` → :613·:616 재시도 → 실패 시 한국어 안내(`GENERATION_FAILED_MESSAGE`). Gemini 실패와 같은 UX다.

---

## 4. 키 공급

| 이름 | 위치 | 필수 | 비고 |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | saju-lab **Vercel 프로젝트 env** (Preview + Production) | Claude 경로만 | 없으면 Claude 요청만 503. **이것이 킬스위치다** — 값을 지우면 Claude 경로가 꺼지고 Gemini는 영향이 없다 |
| `CLAUDE_MODEL` | 같은 곳 | — | 기본 `claude-sonnet-5-5`(D1). 평가 라운드별 모델 교체는 이 값 + 재배포(또는 Preview 배포를 모델별로 따로)로 한다 |
| 로컬 `vercel dev` | saju-lab `.env.local` | — | `.gitignore` :13 `.env*`로 제외된다. **전역 `setx`/User 변수는 금지**(REF-2026-1010 §2: Claude Code 구독 인증을 가로채 과금됨) |

- **값은 사용자 손으로 넣는다**(Vercel 대시보드 또는 `vercel env add` — 외부 쓰기이므로 구현 단계에서 사용자가 직접 실행). 코드·로그·커밋에 값을 출력하지 않는다.
- **크레딧(1줄):** Max 플랜에 연결된 **콘솔 조직**에서 발급한 키면 그 조직의 모든 키가 같은 월 $200 포함 크레딧에서 먼저 차감된다(REF-2026-1010 §1 «조직 연결»). 개인 별도 조직 키면 적용되지 않는다.
- 권고: 콘솔에서 **전용 워크스페이스(`saju-gateway`) + 월 지출 한도**를 두고 그 안에서 키를 발급한다. 무비밀 공개 라우트라 남용 상한을 콘솔에 두기 위해서다(Gemini의 «GCP 할당량 상한»과 같은 층). 워크스페이스 지출 한도 기능의 현재 UI는 구현 전에 사용자 화면으로 실측 확인한다.
- `docs/APP_GATEWAY.md` 환경변수 표에 2행 추가가 구현 범위에 들어간다.

---

## 5. 토글 UI (baby) — 설계만

### 5-1. 권고: «지금 설계, 구현은 2단계, 디버그/내부 빌드 한정»
- **1단계(게이트웨이 PR):** 앱 변경 0. 평가 하네스(`LiveKoreanOutputVerification`에 provider 파라미터)와 재생 스크립트로 구조·한국어·지연을 먼저 검증한다. 게이트웨이에서 실패하면 앱 작업이 헛수고가 되므로 순서를 이렇게 둔다.
- **2단계(baby PR):** 토글을 추가하되 **`BuildConfig.SHOW_LLM_TOGGLE`이 true인 빌드(debug·내부 테스트)에만** 보인다. release에서는 provider를 GEMINI로 고정한다(저장된 값 무시).
  - 근거 1(사용자 요구): «최종 사용자 화면(사용자는 나)에서 선택» → 사용자 기기의 디버그/내부 빌드로 충족한다. 평가 전에 완료한다.
  - 근거 2(§7-1 개인정보): baby 개인정보처리방침(`docs/privacy-policy-proposed-2026-09-11.html` :128·:153)에는 외부 처리자로 **Google Gemini만** 적혀 있다. 릴리스 사용자의 입력(성·생년월일시·형제 이름)이 Anthropic으로 가면 방침 개정이 선행되어야 한다 → 배포 결정(병행/전환) 시점의 **별도 HO + 사용자 직접 승인** 사항이다.

### 5-2. 상태·전달 경로 (`generationTier` 패턴 복제)
| 층 | 설계 |
|---|---|
| ViewModel | `var llmProvider = MutableStateFlow(savedStateHandle[KEY_LLM_PROVIDER] ?: "GEMINI") // "GEMINI" or "CLAUDE"` — `generationTier`(:73)와 같은 모양. `persistFormState()`에 키를 추가한다 |
| 실행 | `executeGeneration()` → `repository.generateNames(input, provider = if (SHOW_LLM_TOGGLE) llmProvider.value else "GEMINI")`. **`NamingInput` 무변경**(§1-1) |
| Repository | `GenerateContentRequest(…, provider = if (provider == "CLAUDE") "claude" else null)`. Gemini이면 null → 직렬화 바이트 동일 |
| 세션 기록 | `NamingSessionEntity.llmProvider: String = "GEMINI"` 컬럼 + `MIGRATION_2_3`(`ALTER TABLE naming_sessions ADD COLUMN llmProvider TEXT NOT NULL DEFAULT 'GEMINI'`), DB version 3. NamingDatabase.kt:14 경고(마이그레이션 누락 = 저장 이름 전부 삭제)를 따라 마이그레이션 테스트를 함께 둔다 |
| 편지 | `generateLetter(nameId)`는 **그 세션의 `llmProvider`**를 쓴다(지금 토글 값이 아님). 목록과 편지를 다른 모델이 쓰면 평가가 섞이기 때문이다 |
| `GeminiApiService` | 무변경(같은 엔드포인트, 같은 메서드) |

- 컬럼 대안(인메모리 `sessionId → provider` 맵)은 프로세스가 죽으면 기록이 사라져 나란히 비교할 수 없으므로 채택하지 않는다.

### 5-3. 위치·모양
- MainActivity FREE/PREMIUM 카드 Row(:795–~905) **바로 아래**, 디버그에서만 렌더링한다: 라벨 «AI 엔진 (개발용)» + 2칸 세그먼트 «Gemini | Claude», `testTag("llm_gemini"/"llm_claude")`, 최소 높이 48dp.
- 기록 탭 세션 카드(:1963 티어 배지 옆)에 `CLAUDE` 세션만 작은 배지를 단다(디버그 한정) → 같은 아기·같은 입력의 두 결과를 나란히 찾기 위해서다.
- 카피는 개발용이라 i18n·톤 가드 대상 밖이지만 한국어로 쓴다. 릴리스 문구는 0줄 변경한다.
- 주의: 평가 중 FREE 생성이 기기의 무료 횟수(`freeRemaining`)를 소진한다 — 평가는 PREMIUM 테스트 결제 또는 1단계 하네스로 돌리는 것을 기본으로 한다.

---

## 6. Gemini 무변경 회귀 증명 (P1)

원칙: **증명 테스트를 기능 변경보다 먼저 main에 넣는다**(기능 PR 이전 커밋에서 초록 → 기능 PR 이후에도 초록 = 바이트 동일). 스냅샷은 기능 변경 전 코드로 기록한다.

### 6-1. saju-lab (vitest, `npm run verify`에 포함)
1. **요청 바이트 스냅샷**: 실제 baby 요청 3종(FREE 목록·PREMIUM 목록·편지 — `GenerateContentRequest`를 Moshi로 직렬화한 문자열을 픽스처로 고정)에 대해 `JSON.stringify(validation.request)`가 기록값과 **문자열로 같다**. `provider` 부재 / `"gemini"` 두 입력이 같은 문자열을 낸다.
2. **egress 스냅샷**: 핸들러 테스트에서 `fetch`를 모킹해 Gemini 호출의 URL·메서드·헤더·본문을 캡처하고 기록값과 같은지 본다.
3. **응답 pass-through**: 상류 200 본문 X → `res.json` 인자가 X와 deep-equal이다(현재 :123 동작).
4. **오류 경로 표**: 405 / 503(GEMINI 키 없음) / 429(리밋) / 400(본문) / 413 / 상류 4xx·5xx / 타임아웃 504 — 상태코드·본문이 기능 전과 같다. 순서(키 검사 → 리밋 → 파싱 → 검증)도 같다.
5. **Claude 미호출**: Gemini 입력에서 Anthropic 클라이언트 모킹의 호출 수가 0이다.
6. **허용목록 유지**: 기존 `gemini-request.test.ts` 12건은 무수정으로 초록이어야 한다(`toEqual(namingRequest)` :31 포함).

### 6-2. baby (JVM 단위)
7. `GenerateContentRequest(provider = null)` Moshi 직렬화가 기능 전 문자열과 같다(FREE·PREMIUM·편지 3종).
8. `NamingInput` JSON(프롬프트 사용자 블록)이 기능 전과 같다 — provider가 섞이지 않았음을 증명한다.
9. release 빌드에서 `SHOW_LLM_TOGGLE == false`이고 provider가 GEMINI로 고정된다.
10. `MIGRATION_2_3` 마이그레이션 테스트: v2 DB 행이 보존되고 `llmProvider = 'GEMINI'`가 된다.

### 6-3. 라이브(사람이 켬, 실비)
11. Preview 배포(키 설정 상태)에서 `LiveKoreanOutputVerification -DliveGemini=true` 15/15 + `SajuGolden12Test -DliveSaju=true` 12/12 → Gemini 경로 품질 회귀 없음.
12. `git diff <base>..<feature> -- api/app/gemini-generate.ts`에서 :83–130(Gemini 본문)이 0줄 변경임을 PR 본문에 첨부한다.

### 6-4. Claude 경로 수용 기준 (같은 하네스)
- `-DliveGemini=true -DliveProvider=claude`(신규 스위치) 15/15 `languagePass` + 개수 정확 15/15 + 스키마 위반 로그 0. 미달이면 토글 단계로 가지 않는다.

---

## 7. 리스크·대안·비용

### 7-1. 리스크 (큰 순)
| # | 리스크 | 완화 |
|---|---|---|
| R1 | **작명 구조 보증 회귀**(개수·필드 누락) — Claude 문법에 개수 제약이 없다(F2) | 펼침(문법 보증) + 사후검증 502 + 앱 1회 재시도 + 라이브 15/15 게이트(§6-4) |
| R2 | 한국어 이탈(영문 혼입) | description·LANGUAGE_MANDATE 1:1 이식 + `languagePass` 15/15 |
| R3 | 지연 > baby read timeout 92s(GeminiApi.kt:99) — 세 모델 모두 adaptive thinking이 기본 on | 스파이크에서 모델×effort별 p95 측정. p95 > 80s면 effort를 낮추거나 스트리밍으로 바꾸거나 모델을 바꾼다. 앱 타임아웃 상향은 마지막 수단(별도 결정) |
| R4 | Gemini 경로 회귀 | §6 증명을 기능 PR보다 먼저 머지 |
| R5 | 공개 무비밀 라우트로 Claude 크레딧 남용 | 공유 레이트리밋 + 전용 워크스페이스 지출 한도 + 키 삭제 킬스위치 |
| R6 | 개인정보(처리자 미기재) | 토글 디버그 한정. 릴리스 노출 = 방침 개정 HO 선행 |
| R7 | 평가 오염(거절 폴백·provider 미기록) | fallbacks 미사용 · 세션 provider 컬럼 · `modelVersion`·로그 |
| R8 | temperature 패리티 부재(다양성 차이) | 평가 시트에 명시 · 같은 입력 반복 3회로 다양성 관찰 |
| R9 | 새 스키마의 첫 요청 컴파일 지연([스킬] 24h 캐시) | 스파이크 첫 호출을 따로 기록 |
| R10 | SDK 의존성 → `npm audit` 게이트 | 의존성 PR에서 verify 통과 확인 |

### 7-2. 검토한 대안
| 대안 | 판정 | 이유 |
|---|---|---|
| A1 strict tool + `tool_choice: auto` + 프롬프트 | 기각 | 호출 자체가 보증되지 않음 → 재시도 비용. 강제 호출은 F1로 불가 |
| A2 앱 안 Claude 직결(BYO 키) | 기각 | 앱 키 금지(SECURITY-AUDIT-vc11). 게이트웨이를 만든 이유와 정면 충돌 |
| A3 별도 라우트 `/api/app/claude-generate` | **예비안** | 장점: Gemini 두 파일이 git diff 0이라 P1 증명이 가장 강하고, 레이트리밋이 분리되어 평가가 Gemini 버킷을 안 먹는다. 단점: 앱 인터페이스에 메서드가 하나 늘고, vercel.json 함수 항목이 추가된다. **LC 결정(본문 필드)을 따르되**, §6 증명을 LC가 부족하다고 보면 이 안으로 바꾼다(앱 2단계 설계는 거의 같다) |
| A4 SDK 대신 fetch | 기각 | [스킬] 규칙. 타입드 오류·타임아웃을 직접 구현해야 함 |
| A5 펼침 없이 사후검증만 | 예비안 | 단순하지만 개수 위반마다 앱 재시도 → 지연 2배. 스파이크에서 위반율 0/20이면 채택 가능 |

### 7-3. 스파이크 = 구현 단계 첫 작업 (sign-off + 사용자 키 공급 뒤, 실비 소액)
- **설계 단계에서는 실행하지 않는다**(새 키 요구 금지, LC 판정 10-11). 설계의 모든 결정은 스파이크 없이도 기본값이 정해져 있다: 펼침 ON · effort `medium` · 비스트리밍 · 순서 안전판 ON · `CLAUDE_MODEL=claude-sonnet-5-5`. 스파이크는 이 기본값을 **조정**만 한다.
- 내용: 로컬 스크립트(saju-lab `.env.local` 키, 자기 프로세스만)로 PREMIUM 요청 1종을 모델 3 × effort 2 × 펼침 ON/OFF로 각 5회 돌려 개수 정확률·키 생성 순서·p50/p95 지연·토큰을 기록한다. 스크립트·로그는 리포 밖 LC `logs/`(gitignore)에 둔다.

#### 7-3-1. Stage 1 스파이크 결과 (2026-10-11, Preview `7fb2be5`, LC 상한 2회)
- 경로: Preview 배포 → `/api/app/gemini-generate`에 `provider: "claude"`를 붙여 호출. 모델은 기본값 `claude-sonnet-5-5`, effort `medium`. 요청 본문은 `api/_lib/baby-request-fixtures.ts`(baby `f2aa508` 재구성)로 만들었다.

| 호출 | HTTP | 지연 | 입력/출력 토큰 | 비용(Sonnet 5.5 $2/$10) | 구조 | 한국어 |
|---|---|---|---|---|---|---|
| PREMIUM 10선 | 200 | **66.8s** | 5,232 / 6,737 | ≈$0.078 | 개수 10/10 · 키 순서 3층 전부 propertyOrdering 일치 · 이름 중복 0 · 사주 8자·부족 오행 그대로 반영 | 문자열 63개 중 라틴 단어 0 · 오행 설명 22자 초과 0 |
| 편지 | 200 | 10.7s | 663 / 1,028 | ≈$0.012 | 평문, 코드펜스 0, 마크다운 제목 0 | 943자, 라틴 단어 0, 금지어(천격·단명·고독) 0 |

- 판정:
  - 구조·한국어는 모두 PASS다.
  - 생성 순서 가정(§2-4)은 이 측정으로 판정하지 못했다. 응답 키 순서는 게이트웨이가 재직렬화로 보증하고, 원시 생성 순서는 본문을 로그에 남기지 않기 때문에(PII) 관측할 수 없다. 안전판 system 블록은 이미 켜져 있다.
- **R3 지연:** PREMIUM 66.8s는 앱 read timeout 92s 안이지만 여유는 25s다. Gemini가 측정된 적 있는 최대치(68.7s)와 같은 수준이다. 1회 측정이라 p95가 아니다 → Stage 2 평가(75회)에서 p95를 잰다. p95가 80s를 넘으면 effort `low`·스트리밍·모델 교체 중 하나로 대응한다(§7-1 R3).
- 출력 토큰 실측(6.7k)이 가정(5k)보다 1.35배 많다. §7-4의 Sonnet 세트 추정을 ≈$2.6에서 **≈$2.8–3.4**로 올린다(PREMIUM ≈$0.078/회 기준).
- 부작용: Preview가 Vercel 인증으로 보호돼 있어 `vercel curl`을 썼는데, CLI가 확인 없이 프로젝트에 Protection Bypass for Automation 시크릿을 만들었다. 사용자가 복귀한 뒤 콘솔에서 폐기하도록 LC 결정 큐에 올렸다. 앞으로 Preview 접근에 이 경로를 쓰지 않는다.

### 7-4. 평가 고정세트와 비용 추정
**고정세트(제안, D4):** baby 골든 12 입력(`saju/golden-12-2026-0923.json` 생년월일시 + 고정 바람·성) × {FREE, PREMIUM} = 목록 24회 + FREE 결과 이름당 편지(12×3=36회) + 구조 하네스 15회(PREMIUM 10·FREE 5). **모델 1종당 = PREMIUM 22 · FREE 17 · 편지 36 = 75회.** Gemini도 같은 세트를 1회 돌린다(비교 기준).

**호출당 토큰 가정(추정, 스파이크로 교체):** 목록 입력 ≈4k(시스템 ≈6k자 + 스키마 한국어 description + 사용자 블록) / PREMIUM 출력 ≈5k(이름 10 × ≈250 + 요약·JSON ≈700 + thinking ≈1.5k) / FREE 출력 ≈2.2k / 편지 입력 ≈0.8k·출력 ≈2k.

| 모델 ($/1M in·out, [스킬] 2026-10-06) | PREMIUM 1회 | FREE 1회 | 편지 1회 | **75회 세트** |
|---|---|---|---|---|
| Haiku 5.5 ($0.10 / $0.50) | ≈$0.003 | ≈$0.0015 | ≈$0.001 | **≈$0.13** |
| Sonnet 5.5 ($2 / $10) | ≈$0.058 | ≈$0.030 | ≈$0.022 | **≈$2.6** |
| Opus 5.5 ($4 / $20) | ≈$0.116 | ≈$0.060 | ≈$0.043 | **≈$5.1** |
| (참고) Gemini 3.5 flash ($1.50 / $9.00, baby TEST-LIVE-OPTIN 09-23 실측 단가) | ≈$0.051 | ≈$0.025 | ≈$0.020 | ≈$2.3 (**GCP 실비**, 크레딧 무관) |

- **Claude 3종 전부 + 스파이크(≈60회) + 재시도 여유 ×1.5 ≈ $15 이하** → 월 $200 크레딧 안이다(조직 키 전제, §4). 현 프로모션 만료 10-16(UTC)은 주기마다 갱신되므로 평가 일정을 서두를 이유가 아니다.
- 레이트리밋 20회/5분(IP) 때문에 75회 세트를 한 번에 돌리면 막힌다 → 러너가 호출 간 15초 이상 간격을 둔다(세트당 ≈20분).
- **평가 시트(제안 칼럼):** 입력 id · 티어 · provider · 모델 · effort · 개수 정확 · 스키마 위반 · `languagePass` · 사주 정합(그라운딩 값 일치) · 한자/훈 정확(사람) · 부적절 음·중복(사람) · 한국어 자연스러움 1–5(사람) · 지연 ms · in/out 토큰 · $ · 비고. 사람 채점 칸은 사용자가 맡는다.

---

## 8. 사용자 결정 대기 (LC 경유)

| # | 결정 | 워커 권고 |
|---|---|---|
| D1 | 평가 대상 Claude 모델 | **LC 판정 10-11: `CLAUDE_MODEL` 서버 env로 파라미터화, 기본 `claude-sonnet-5-5`**(Gemini 3.5 flash와 같은 가격대 $2/$10 대 $1.5/$9 → 공정 비교). Opus 5.5(품질 상한)·Haiku 5.5(비용 하한)는 env 교체로 바꾼다. 실제 평가 모델은 사용자가 평가 시점에 고른다(설계 비차단) |
| D5 | Claude 호출 수단: `@anthropic-ai/sdk` 대 raw fetch | 워커 권고는 SDK(§1-3: [스킬] 규칙, 타입드 오류, `maxRetries:0`·timeout 설정). LC는 «게이트웨이가 raw fetch라 `output_config` 직접 구성»이라고 적었다 — 둘 다 같은 와이어 형태(`output_config: {format: {type: "json_schema", schema}}`)를 보낸다. 의존성 0 원칙(http.ts:2–4)을 우선하면 fetch(A4)도 수용 가능하다. **LC 판정 10-11: SDK 수용** — Claude 분기에만 격리하고 Gemini 경로는 raw fetch를 그대로 둔다. 개수 보증은 SDK의 스키마 자동 처리에 맡기지 않고 펼침(§2-3)을 유지한다. 사용자 sign-off 항목 |
| D2 | 토글 단계화(1단계 게이트웨이 → 2단계 디버그 한정 토글) | 수용 권고(§5-1) |
| D3 | 전용 워크스페이스 월 지출 한도 금액 | 평가 기간 $20 (§7-4 추정 ×1.3) |
| D4 | 평가 고정세트 규모 | 골든 12 × 2 티어 + 편지 36 + 하네스 15 = 모델당 75회 |

## 9. 협의 이력
- 2026-10-11 v1 초안. LC에 REPLY(F1 tool_choice 강제 400 · F2 개수 제약 미지원 · F3 temperature 400 · F4 provider 위치 함정 2개 · F5 순서 보증 · F6 개인정보) 송신.
- 2026-10-11 LC 판정: F1–F6 전부 수용(LC가 스킬 문서로 직접 검증). HO의 «강제 단일 tool»은 LC가 철회했다. 보강 반영: refusal·max_tokens도 502/재시도 경로(§3), 생성 순서 프롬프트 안전판(§2-4), 스파이크는 구현 단계로(§7-3), D1 = 파라미터화 + 기본 Sonnet 5.5. D5(SDK 대 fetch)는 LC가 SDK로 판정했다(Claude 분기 격리, 개수 보증은 SDK와 무관하게 펼침 유지). 사용자 sign-off는 LC가 올린다.
- 다음 게이트: **사용자 sign-off**(§8 D2–D5) → 구현 1단계(§6 증명 PR 먼저 → 게이트웨이 PR) → 2단계(baby 토글 PR) → 평가.
- 2026-10-11 사용자 sign-off(D2–D5, LC 경유 «진행해»). Stage 1 구현: 브랜치 `feat/dualllm-claude-gateway` — P1 기준선 `46d583b` → 기능 `41387d9` → 문서 `7fb2be5` → verifier 지적 반영. P1은 스냅샷 diff 0, gemini-generate.ts는 삽입 8줄뿐이다. 스파이크 2회 결과는 §7-3-1. 머지·프로덕션 승격은 사용자 복귀 뒤.
