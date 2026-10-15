# Claude 목록용 system 프롬프트 레이어 — 24쌍 A/B (v2 → v3)

> 발주 LC `handoffs/HO-2026-1016-saju-claude-list-prompt-ab-01.md`(DEC-2026-1015 §3-B). 결정 정본은 LC·사용자 DEC다. 이 문서는 판정 재료와 권고 1줄만 담는다.
> 비교 기준선: baby `docs/eval/2026-10-15-dualllm-judge.md`(2판, 이하 «2판»). 원자료 v2 = `C:/Users/colds/AI/eval75-out/v2/`, 심판 v2 = `…/judge/`.

## 0. 무엇을 바꿨나 — 레이어
- **위치:** `api/_lib/claude-adapter.ts` `toAnthropicParams`. 요청에 `responseSchema`가 있을 때(=목록 FREE·PREMIUM)만 system 블록 1개(`LIST_PROMPT_LAYER`)를 순서 hint 뒤에 붙인다. 편지는 스키마가 없어 적용되지 않는다. 기존 블록(앱 systemInstruction, 순서 hint)은 바꾸지 않는다.
- **off 스위치:** env `CLAUDE_LIST_LAYER=off` → 레이어 없음 = v2 요청 바이트(`api/_lib/claude-generate.ts`).
- **후처리 필터와의 관계: 병행.** 앱 `ClaudeOutputFilter`(baby, 읽기 중복 재시도·오행 설명 30자 clamp)는 그대로 둔다. 레이어는 그 필터가 다루지 않는 정확성 유형을 맡는다(코드 주석 `claude-adapter.ts` `LIST_PROMPT_LAYER` 위 1줄).
- **개수 보증·순서 안전판 무영향:** DESIGN §2-3의 펼침(`item_N`)과 사후검증, 순서 hint는 코드상 변경이 없다. 기존 테스트(`toJsonSchema — count guarantee`, `rejects nine names`, `orders the hint`)가 수정 없이 통과한다. 한 가지 달라진 점: hint는 이제 system의 **마지막** 블록이 아니다(바로 뒤에 레이어가 온다). 개수 위반은 0건이었다(§2 표).

### 0-1. 레이어 문장 ↔ 2판 지적 유형 매핑
| 2판 지적 유형(§1-4 근거 쌍) | 레이어 지시(1문장) | 출처 |
|---|---|---|
| 독음 불일치(g3-PREMIUM 라엘 燁 등 · g10-PREMIUM 韓以燈 «이든») | name_korean 각 음절 = 같은 자리 한자의 표준 독음, 아니면 한자 교체 | 코드에 독음 표 없음 — 규칙 문장만 |
| 성씨 발음오행 오기(g3-PREMIUM «최(ㅊ)»를 토로 일괄) | 성씨 음절 포함 모든 음절을 초성으로 판정 + 초성표 | 초성표는 baby `NamingRepository.kt:225` 원문 그대로 복사(테스트 `copies the initial-consonant table verbatim`) |
| 자원오행 설명↔한자 불일치(g4-FREE 木 부족인데 «부족한 금», 3번 이름에 木 없음) | 실제 자원오행을 적고, 부족 오행은 입력값 그대로, 그 오행 한자가 실제 있을 때만 «보완» | — |
| 획수음양 억지 «조화»(2판 §1-5 g7-PREMIUM o1) | 음양이 치우치면 «조화»라 쓰지 않음 | — |
| «완벽하게» 과장(g3-PREMIUM C o0) | «완벽하게»·«반드시»·«최고의» 등 단정·과장 금지 | — |

## 1. 방법
- **생성(v3, 10-16 03:2x–03:58 KST):** baby `LiveDualLlmEvaluation`(골든 12 × FREE→PREMIUM, 같은 아기의 FREE 뒤 PREMIUM에 «이전 이름 제외» 블록 — v2와 같은 흐름)을 `-DevalProviders=claude -DevalKinds=FREE,PREMIUM -DliveClaudeEffort=low -DliveGatewayBase=http://localhost:3011`로 돌렸다. 게이트웨이는 이 브랜치의 로컬 `vercel dev`(`CLAUDE_ROUTING_ENABLED=1`, `CLAUDE_LIST_LAYER` 미설정 = 레이어 on)다. **프로덕션 호출 0.** 모델 `claude-sonnet-5-5`, effort low — v2와 같다. `-DevalKinds`는 baby PR #187.
- **Anthropic 키:** saju `.env.local`에 키가 없어서 baby `.env.local`의 `JUDGE_ANTHROPIC_API_KEY`를 dev 서버 프로세스 env로만 넣었다(파일 복사 0, LC 계획 수용).
- **Gemini 24행:** 다시 생성하지 않았다. `v2/eval-raw.json`·`eval-calls.json`의 FREE·PREMIUM 행을 그대로 복사했고, 각 행에 `copiedFrom: "v2"`를 표시했다(`v3/eval-meta.json` `geminiRows`).
- **산출:** `C:/Users/colds/AI/eval75-out/v3/`(`eval-raw.json`·`eval-calls.json`·`eval-meta.json`·`eval-outputs.json`, v2와 같은 스키마). Claude 호출 행에는 `upstreamMs`(서버 로그의 Anthropic 호출 시간)를 덧붙였다.
- **심판:** baby `scripts/dualllm-judge.py`를 수정 없이 썼다. 시드 20261015로 v2와 같은 A/B 배정이다. Claude `claude-opus-5-5`는 Batch, effort high다. Gemini는 `gemini-pro-latest`다. 산출은 `…/judge-v3/`다.
- **결정적 지표(심판과 독립):** 발음오행은 `name_korean` 각 음절의 초성을 앱 초성표(baby `NamingRepository.kt:225`)로 바꾼 값과 `pronunciation_ohaeng` 속성 값을 대조했다. 과장어는 `완벽|반드시|최고의|틀림없|100%` 출현 수다. 스크립트는 v2 원자료로 2판 수치(Claude 심판 15–5–4 · Gemini 심판 7–8–9 · κ 0.271 · 정면 갈림 3)를 그대로 재현하는지 먼저 확인했다.

## 2. 생성 (24쌍, Claude v2 ↔ v3, Gemini 고정)
| 지표 | Claude v2 (레이어 없음) | **Claude v3 (레이어)** | Gemini (v2 고정) |
|---|---|---|---|
| 호출 / 비200 | 24 / 0 | **24 / 0** | 25 / 1 (502 → 앱 재시도 성공) |
| 성공 출력 | 24/24 | **24/24** | 24/24 |
| 개수 정확(FREE 3 / PREMIUM 10) | 24/24 | **24/24** | 24/24 |
| 읽기 중복 | 0 | **0** | 0 |
| 언어(영문 3자+ 없음) | 24/24 | **24/24** | 23/24 |
| **발음오행 ≠ 초성표 (이름 수)** | 12/156 | **0/156** | 15/156 |
| └ 그중 성씨 음절 오기 | 10/156 | **0/156** | 0/156 |
| 과장어 출현 | 0 | **0** | 16 |
| FREE 평균 토큰 in / out | 5888 / 2153 | **6361 / 2740** | 1557 / 3516 |
| PREMIUM 평균 토큰 in / out | 6321 / 3798 | **6794 / 5620** | 1790 / 5783 |
| USD(목록 호출 합) | $1.007 | **$1.319** | $1.153 |

### 2-1. 지연 — 상류와 로컬 dev 오버헤드 분리
v2는 프로덕션 게이트웨이를 거쳐 클라이언트에서 쟀다. v3는 로컬 `vercel dev`를 거쳤는데, 이 경로는 호출마다 12~30s의 오버헤드가 붙는다(함수 재빌드로 추정, 미실측). 그래서 v3는 서버 로그의 Anthropic 호출 시간(`upstreamMs`)을 주 비교값으로 쓴다. v2 클라이언트 값에는 프로덕션 게이트웨이 오버헤드도 들어 있으므로, 이 비교는 v3에 약간 유리하다.

| HTTP 200, 초 | Claude v2 (클라이언트, prod) | **Claude v3 상류** | Claude v3 클라이언트(로컬 dev, 참고) | Gemini v2 |
|---|---|---|---|---|
| FREE p50 / p95 / 최대 | 23.1 / 31.5 / 33.6 | **24.6 / 31.9 / 34.9** | 38.2 / 51.0 / 55.5 | 17.3 / 34.8 / 47.1 |
| PREMIUM p50 / p95 / 최대 | 35.2 / 44.6 / 48.2 | **44.9 / 57.5 / 58.0** | 58.0 / 71.0 / 72.1 | 27.0 / 41.4 / 43.1 |

- **PREMIUM 꼬리 악화:** 상류 p95가 44.6 → 57.5s(+13s), 최대가 48.2 → 58.0s다. Gemini(41.4 / 43.1s)와의 차이가 2판보다 벌어졌다. 앱 읽기 타임아웃 92s 안에는 든다. **그러나 라우팅의 목록 main 컷 `ROUTED_LIST_MAIN_TIMEOUT_MS = 60_000`(`api/app/gemini-generate.ts:47`)과는 여유가 2s뿐이다.** 이 컷은 «75세트 PREMIUM 최대 44.3s, 60s 초과 0»(같은 파일 :41)을 근거로 정한 값이다. v3 PREMIUM 상류 12건을 정렬하면 36.6 … 50.9, **57.1, 58.0s**다. 프로덕션 게이트웨이 오버헤드가 붙으면 Claude main PREMIUM 일부가 60s 컷에 걸려 sub로 넘어갈 수 있다(타임아웃 1회분 지연 + sub 호출).
- FREE는 상류 기준으로 거의 같다(p50 +1.5s).

### 2-2. 출력은 어디서 늘었나 (필드별 평균 글자 수, LC 보강 ①)
| 필드 | Claude v2 | Claude v3 | Gemini |
|---|---|---|---|
| remedyStrategy (출력당) | 251.5 | 276.1 | 151.1 |
| hanjaMeanings (이름당) | 37.6 | 39.3 | 38.5 |
| pronunciationOhaeng 설명부(« - » 뒤) | 15.4 | 15.6 | 16.7 |
| jawonOhaeng 설명부 | 20.0 | 23.4 | 19.5 |
| **strokeYinyang 설명부** | 24.5 | **30.6** | 27.8 |
| **strokeYinyang 설명부 > 30자 (이름 수 / 156)** | 2 | **61** | 34 |
| pronunciation / jawon 설명부 > 30자 | 0 / 0 | 0 / 0 | 0 / 0 |
| 출력당 총 글자 FREE / PREMIUM | 668 / 1500 | 712 / 1654 | 538 / 1493 |

- **눈에 보이는 글자는 출력당 +9~10%뿐**이다(PREMIUM 1500 → 1654자). 그런데 출력 토큰은 PREMIUM +48%(3798 → 5620)다. 늘어난 토큰 대부분은 화면에 나오지 않는 사고(adaptive thinking) 토큰으로 **추정**한다. 사고 토큰을 따로 실측하지는 않았다(`usage.output_tokens`가 둘을 합쳐 준다). 레이어의 검증형 지시(독음 대조·자원오행 대조)가 생성 전 확인 작업을 늘렸다는 해석과 맞는다.
- **strokeYinyang 설명부가 길어졌다**(30자 초과 2 → 61). 앱 `ClaudeOutputFilter`가 30자에서 자르므로(낱말 경계 + «…») 화면 넘침은 막힌다. 다만 잘린 설명이 61건 생기고, 심판 축 `ohaeng_length`에서는 불리할 수 있다(§3에서 교차 확인).

## 3. 심판 (96호출)
### 3-1. Gemini 심판 (`gemini-pro-latest`, 48/48 성공 · 실패 0)
표기: **Claude 승 – Gemini 승 – 동점** (쌍 단위, 두 순서 합의)

| 종류(쌍) | 정확 | 한국어 | 개수 | 중복 | 오행 길이 | **전체 선호** | v2 전체 선호 |
|---|---|---|---|---|---|---|---|
| FREE (12) | 2–3–7 | 1–4–7 | 0–0–12 | 0–1–11 | 0–4–8 | **2–6–4** | 3–4–5 |
| PREMIUM (12) | 7–0–5 | 6–0–6 | 0–0–12 | 0–0–12 | 0–0–12 | **7–0–5** | 4–4–4 |
| **목록 (24)** | 9–3–12 | 7–4–13 | 0–0–24 | 0–1–23 | 0–4–20 | **9–6–9** | 7–8–9 |

- **PREMIUM은 개선, FREE는 후퇴**다. PREMIUM은 4–4–4에서 7–0–5로 Gemini 승이 0이 됐다. FREE는 3–4–5에서 2–6–4가 됐다.
- **오행 길이 축에서 FREE 0–4**다. v2 Gemini 심판 FREE 오행 길이는 0–0–12였다. 같은 시기 strokeYinyang 설명부 30자 초과가 2 → 61건으로 늘었다(§2-2). 두 지표는 같은 방향이다.
- **중복 축 0–1:** 구조 지표상 읽기 중복은 0이다(§2). 2판 §1-1에서 지적한 심판 노이즈와 같은 종류로 본다.
- 순서 일관성(overall): 15/24로 v2와 같다.

### 3-2. Claude 심판 (`claude-opus-5-5`, Batch `msgbatch_01SviVeAQozNL5MJywXDYQM9`, 10-16 04:00 KST 제출)
<!-- 배치 회수 뒤 채움 -->

### 3-3. 지적 유형별 건수 (심판 사유 문장 키워드)
측정 방법: 사유를 문장으로 쪼갠다. A/B 표지를 엔진으로 바꾼 뒤, 그 엔진 문자가 들어간 문장에서 키워드(독음·발음오행 오류·자원오행 불일치·과장/완벽)가 나오면 1건으로 센다. **오른쪽 열은 Gemini 출력에 대한 지적이다. Gemini 출력은 v2와 v3에서 바이트까지 같으므로, 이 열의 변화는 심판 노이즈(비교 상대가 바뀐 영향 포함)의 기준선이다.**

| Gemini 심판 (행 48 → 48) | v2 → v3 Claude 출력 지적 | v2 → v3 Gemini 출력 지적(노이즈 기준선) |
|---|---|---|
| 독음 불일치 | 4 → **0** | 3 → 1 |
| 발음오행 오기 | 5 → **3** | 6 → 4 |
| 자원오행 불일치 | 7 → **2** | 5 → 5 |
| 과장 | 1 → 1 | 1 → 0 |
<!-- Claude 심판 표는 배치 회수 뒤 -->

결정적 지표(§2, 심판과 독립)가 더 강한 근거다. 발음오행 오기가 12 → 0/156이고, 그중 성씨 음절 오기가 10 → 0이다.

## 4. 목록 main 판정 재료
<!-- 채움 -->

## 5. 비용 실측
<!-- 채움 -->

## 체크리스트 (HO 완료 조건)
- [x] 1) 계획 REPLY (10-16, LC 수용 + 보강 2건)
- [x] 2) 레이어 구현·테스트 — `npm run verify` exit 0 (api 115 · core 740 · web 49), 커밋 4bd5802
- [ ] 3) 24쌍 재생성 → `eval75-out/v3/`
- [ ] 4) 심판 96호출 → `eval75-out/judge-v3/` + 변화표
- [ ] 5) 이 REPORT 채움
- [ ] 6) PR(구현+문서) · verifier · LC 게이트 · 머지
- [ ] 7) 완료 보고 + [IDLE]
