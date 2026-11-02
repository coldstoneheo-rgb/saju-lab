# CLOUD-2026-1102-saju-keyless-i5 — REPORT

- 발주: life-coordinator `handoffs/CLOUD-2026-1102-wave2-07-10.md` §8 (origin: lc, HO). 클라우드 8건째.
- 워커: saju-lab 클라우드 세션. effort는 세션 기본값 그대로이고, 올린 곳은 없다.
- 분기: origin/main **6517af7** → 브랜치 `cloud/saju-keyless-i5`. 세션이 자동 지정한 `claude/*` 브랜치는 쓰지 않았다(발주 규약 7).
- 하지 않은 것: 배포·env 0 · 외부 API 호출 0 · 유료·AI 해석 코드 0 · 골든 md 변경 0 · `AGENT_STATUS.json` 변경 0 · 사용자 확인 목록 3건 손대지 않음.

## 체크리스트 (완료 조건 번호)

- [x] 1. keyless 면 처방 ① **파생** + 집합 일치 테스트 4건 + 임시 블록 끝-끝 테스트 3건.
- [x] 2. I2 기본 응답 바이트 스냅샷 PASS(변경 0) · 코어 `INVALID_OPTIONS` 목록 변경 0 · I3 테스트 PASS.
- [x] 3. I5: **이미 main에 있다.** #125 `e2c3f58`로 머지됐다. 그래서 새 PR은 없다. 골든 테스트는 PASS이고 골든 md diff는 0이다.
- [x] 4. 모델 상수 대조표 → 아래. 값 변경 0.
- [x] 5. `npm run verify` EXIT 0 · api 118→**125**(+7) · core 1057 · web 49 · audit 0건. CI는 PR 본문에 기록한다.
- [x] 6. PR `[cloud]` 접두 · 본문 = 이 REPORT. 머지 금지.
- [x] 7. 이 파일.

## 한 일

### 1. keyless fail-closed (`api/_lib/saju-pillars.ts`)

- 바꾸기 전: `KEYLESS_DENIED_INCLUDES`가 거절 **리터럴** 4개였다. 새 블록을 `INCLUDE_BLOCKS`에 넣으면 keyless에서 자동으로 열렸다.
- 바꾼 뒤: **허용 목록** `KEYLESS_INCLUDE_BLOCKS`(hiddenStems·tenGods·interactions·daeun)를 두고, 거절 목록은 `keylessDeniedIncludes()` = `INCLUDE_BLOCKS` − 허용 목록으로 파생한다. 새 블록은 기본으로 거절되고, keyless에 열려면 허용 목록에 명시적으로 넣어야 한다.
- 호출부 `api/saju-pillars.ts:51`·`api/app/saju-pillars.ts:46`는 그대로다. 같은 이름의 export를 쓴다.
- 테스트:
  - `api/_lib/keyless-includes.test.ts`: 집합 일치(허용 ∪ 거절 = INCLUDE_BLOCKS, 교집합 0) · 허용 목록 고정 · 거절 목록이 이전 리터럴과 같은 값·순서인지(라우트 오류 메시지 불변) · 임의 블록 추가 시 자동 추종.
  - `api/_lib/keyless-includes.probe.test.ts`: `vi.mock`으로 **테스트 안에서만** `INCLUDE_BLOCKS`에 `probeBlock`을 더한다. 결과는 세 가지다. 키가 걸린 키 라우트는 200이다(코어가 정말 받아들인다). keyless 앱 라우트는 라우트 단계에서 `INVALID_OPTIONS`로 거절한다. 키 미설정 키 라우트도 마찬가지로 거절한다.
- 문서: `docs/SAJU_PILLARS_API_V1.md` 9단계 절에 1문장을 더했다(허용 목록 + 파생 = fail-closed).

### 검증 (명령 · 결과)

| 명령 | 결과 |
| --- | --- |
| `npm test` 베이스라인(origin/main 6517af7) | EXIT 0 · api 118 · core 1057 · web 49 |
| `npx vitest run api`(변경 후) | 10 files · **125** passed |
| 변이: 거절 목록을 옛 리터럴로 되돌림 | probe 테스트 **2 fail**(«거절 목록이 probeBlock 포함» · «keyless 거절»). fail-open이 재현되고, 처방이 그것을 닫는다는 것을 보였다. 원복함 |
| `npx vitest run` golden-strength-factors · golden-l2-derived · strength-readings(I2 바이트 스냅샷) · include-gate(I1·I3) | 4 files · 305 passed |
| `npm run verify` | **EXIT 0** · api 125 · core 1057 · web 49 · `found 0 vulnerabilities` |
| `git diff --stat origin/main -- docs/golden/` | 비어 있음(0) |

## 발견

1. **I5는 이미 집행됐다.** 설계 채택 기록은 `docs/design/l2-include-design.md:81`(«기본값 **안 A**»)과 `:44`이다. 구현은 #125 `e2c3f58`이 했다(`strength-factors.ts:54` `monthBranch: Branch`, `strength-factors.ts:227`). 레포 안에 `monthBranchOf`는 코드에서 0건이고, `AGENT_STATUS.json:65` next_actions 문구 1건만 남았다. 그래서 두 번째 브랜치 `cloud/saju-i5-monthbranch`와 두 번째 PR은 만들지 않았다. 발주서가 #125 머지 전 상태를 기준으로 쓰인 것으로 보인다.
2. **`AGENT_STATUS.json` next_actions가 낡았다.** `:62` 9단계 착수, `:63` SINSAL·GYEOKGUK confirmed, `:65` monthBranch가 이미 완료된 항목이다(#123~#126). 발주 규약 7에 따라 건드리지 않았다. LC가 갱신해야 한다.
3. **테스트 수 기준 차이.** 발주서는 «이전 806 기준»이지만, 실측 베이스라인은 api 118 + core 1057 + web 49 = **1224**다. 증가분은 +7(api)이다.
4. **처방 ①을 택했고 ②로 내려가지 않았다.** 기본 응답 바이트(strength-readings «baby 공급 계약» 스냅샷)와 코어 INVALID_OPTIONS 목록(include-gate I3)은 그대로다. 라우트 거절 메시지 값·순서도 이전 리터럴과 같다(테스트로 고정).
5. **허용 목록과 include-gate `UNGATED`의 관계.** 두 목록은 현재 같은 4블록이지만 의미가 다르다. `UNGATED`는 «골든 게이트 없음», 허용 목록은 «keyless 노출»이다. 그래서 합치지 않았다. 새 비판독 블록(게이트 없음)도 keyless에서는 기본 거절이다. 의도한 fail-closed다.
6. **audit 선존재 결함 없음.** 이번 verify에서는 `found 0 vulnerabilities`였다.

## 모델 상수 대조표 (레포 안만 · prod env 미조회 · 값 변경 0)

| 대상 | 코드 기본값 | 문서 기본값 | 테스트 상수 | 비고 |
| --- | --- | --- | --- | --- |
| Gemini (`GEMINI_MODEL`) | `gemini-3.5-flash` — `api/app/gemini-generate.ts:23`(사용 `:77`) | `gemini-3.5-flash` — `docs/APP_GATEWAY.md:31`, `:44` | `gemini-3.5-flash` — `api/_lib/gemini-generate.regression.test.ts:53`, `__snapshots__/gemini-generate.regression.test.ts.snap:198·210·222`, `gemini-generate.routing.test.ts:103` | 레포 안에서는 **일치**. 다만 prod 응답 `modelVersion`은 `gemini-3.6-flash`로 관찰됐다(`docs/handoffs/HO-2026-1015-saju-explicit-provider-interlock-01-REPORT.md:35`, `AGENT_STATUS.json:69`). prod env `GEMINI_MODEL` 값으로 추정되며 미확인이다 |
| Claude (`CLAUDE_MODEL`) | `claude-sonnet-5-5` — `api/_lib/claude-generate.ts:18`(사용 `:54`) | `claude-sonnet-5-5` — `docs/APP_GATEWAY.md:47`, `docs/DESIGN-dualllm-saju-baby.md:148`, `:279`(D1) | `claude-sonnet-5-5` — `claude-adapter.test.ts:22·29·182·285`, `claude-generate.test.ts:77·178`, `gemini-generate.routing.test.ts:76`. env 덮어쓰기 테스트 `claude-opus-5-5` — `claude-generate.test.ts:210–214` | **일치** |

- 불일치 후보는 Gemini 1건(레포 3.5 대 prod 관찰 3.6)이다. 정본 후보는 두 가지다. ⓐ 레포 기본값 3.5: 코드·문서·테스트가 일치하고 D1 가격 비교의 근거다(`DESIGN-dualllm-saju-baby.md:267`, `:279`). ⓑ prod env 3.6: 의도적으로 올렸다면 문서 `APP_GATEWAY.md:44`에 «prod 값» 1줄을 추가하는 쪽이다. 판정은 LC·사용자가 한다(Vercel env 확인은 사용자 몫).

## LC·사용자에게 필요한 것

- LC: 이 PR 게이트. `AGENT_STATUS.json` next_actions `:62`·`:63`·`:65` 낡은 항목 정리(발견 2).
- 사용자: Gemini 모델 정본 결정(ⓐ 레포 3.5 유지 / ⓑ prod 3.6을 문서에 반영). 막는 항목은 아니다.
- 사용자: 머지 1줄(LC 게이트 뒤).

총 경과: 약 25분 · 사용 모델: Claude Opus 5.5 (claude-opus-5-5, 세션 설정 기준)
