# HO-2026-0922-saju-L2-stage7-daeun-01 — REPORT (draft — LC 코드 검수 판정 전, 머지 대기)

- 발주서: life-coordinator `handoffs/HO-2026-0922-saju-L2-stage7-daeun-01.md` (LC `6006eba`). origin: user(§0 사용자 원문 인용 있음 → 유효). 착수 시점 main `60bc06c`(골든 합충표 confirmed PR #79 머지 뒤). 브랜치 `feat/l2-stage7-daeun`, PR 1개. **머지 게이트(09-22 18:3x 사용자 지시)**: LC 「머지 가」 회신 전 머지하지 않음.
- 추정 1세션 → 실제 1세션. LLM 0, 의존 0(절기표·시간대 정규화·`tenGodOf`·지장간 표 재사용).

## 구현
| 파일 | 내용 |
| --- | --- |
| `docs/rules/DAEUN.md` (신규, 정본) | 표 1 순역행 4조합 · 표 2 12절(코드·월지) · 산식(D·startAgeExact·startsAt·years/months·10주·십신·절단·current) · v1 제외 사유 · 출처 |
| `packages/saju-core/src/l2/daeun.ts` (신규) | `DAEUN_DIRECTION_TABLE`·`DAEUN_TERMS` 상수, `daeunDirection`, `daeunOf(pillars, birthKst, sex, {school, referenceDate})`, `todayKst`, `isDaeunUnavailable`. 순수 함수(명식 + KST 출생 분) |
| `pillars.ts` | `resolveBirthKst(input)` 신설 — 음력→양력·UTC+8:30/DST 정규화까지만(진태양시 미적용) 한 KST 벽시계. 응답 필드 변경 0 |
| `l2/daeun.test.ts` (신규) | **C1** md 파싱 ↔ 상수 동일성(4조합·12절, 절기표 어휘와 일치, 절↔월지) · **C2** 절입 동시각(g-2024 순행 42,836분·역행 0)·순역 4조합 실명식·KST 정규화(1955 1분 전)·other 두 벌·time-unknown·십신 동봉+10년 간격+끝/시작 맞닿음·2100 절단(2010년생 9주)·`null` 함수 층+1920 초 역행 정상·referenceDate current 경계(전날/당일/다음날)·`todayKst` · v1 include 바이트 동일·학파·referenceDate 검증·timeUnknown |
| `docs/golden/GOLDEN-DAEUN.md` (신규) + `l2/golden-daeun.test.ts` | 골든 11건 → **16행**(other 5건 × 2 + male/female 6건), 열 = 성별·순역·기준 절·D(분)·startAgeExact(4자리 표기)·시작일·첫 대운·10주. 전부 `pending`(출처 「코어 산출 2026-09-22, 검산 대기」). 파서 = 십신·합충표 규칙 동일 + 행 구성(other 2행) 검사 |
| `types.ts` · `saju-pillars-v1.ts` · `index.ts` | `IncludeBlock`에 `"daeun"`, `options.referenceDate`(YYYY-MM-DD 형식+실존 날짜 검증, 아니면 `INVALID_OPTIONS`), 응답 `daeun?` / `daeun: null + daeunReason`. 공개 export |
| 웹 `main.tsx` · `styles.css` | 명식 아래 「대운」 행 10칸(나이 소수 1자리·간지·십신 라벨, `referenceDate` = 오늘 기준 현재 대운 강조) + 접힘 「대운 계산 규칙」(순역·기준 절·D·소수 그대로·반올림 없음 고지). 성별 「기타」는 순행·역행 두 줄. 시각 미상 「±0.17년」. 통변 0 |
| `docs/SAJU_PILLARS_API_V1.md` | 「대운 블록」 절 + 필드 정의 + 예시 |
| `l2/golden-tengods.test.ts` | 5단계 테스트가 「모르는 블록」 예시로 쓴 `"daeun"`을 `"sinsal"`로 교체(이제 daeun은 블록) |

## 응답 형태 (확정 — 발주서 §3-2 제안과의 차이: 블록 껍데기 한 겹 + `referenceTerm`·`referenceDate`)
```
daeun: {
  precision: "exact"|"time-unknown", school, direction: "forward"|"backward"|"both", referenceDate: "YYYY-MM-DD",
  forward?: Reading, backward?: Reading          // 남/여 = 해당 키 하나, other = 둘 다
}
Reading: { direction, distanceMinutes, startAgeExact, startsAt, years, months,
           terms: { from: {term, at}, to: {term, at} }, referenceTerm: {term, at},
           periods: [{ index, stem, branch, tenGods: {stem, branchPrimary}, startAge, startsAt, endsAt }],
           truncated, current: { index, startsAt, endsAt } | null }
daeun: null, daeunReason: "OUT_OF_SOLAR_TERM_TABLE"   // 기준 절이 표 밖(계산 범위 안 입력에서는 미도달)
```
- 발주서는 other를 `{ forward, backward }`, 남/여를 reading 그 자체로 제안했는데, 소비자가 두 형태를 분기해야 해서 **항상 같은 껍데기**(`direction` + 키 존재)로 통일했다(§6 ⑤).

## C1 — md ↔ 상수
`daeun.test.ts` 「DAEUN.md ↔ daeun.ts」: 표 1·2를 열 이름으로 파싱해 `toEqual`. 12절 코드 집합 = `solar-terms.data.ts` 어휘 집합(= KASI 표의 월 경계가 곧 12절), 각 절이 여는 월지(입춘=寅 …) 검사.

## C2 — 산식 (테스트가 실행한 분기)
| 분기 | 케이스명(`daeun.test.ts`) |
| --- | --- |
| 절입 동시각 순행 D = 다음 절(경칩 42,836분) / 역행 D = 0 | 「절입 동시각 g-2024-02-04-1727 …」 |
| 순역 4조합(甲午남 순·乙未남 역·辛卯여 순·甲辰여 역) + 남/여 단일 키 | 「순역 4조합 on real charts …」 |
| 정규화 KST(1955 UTC+8:30 → 23:17, 입춘 1분 전) | 「uses the normalized KST clock …」 |
| other 두 벌, D 6,543/35,889, y/m 1/6, 10주 간지 순·역 | 「sex other returns both readings …」 |
| time-unknown 정오 대체 + precision | 「time-unknown reads noon …」 |
| 십신 동봉(丁 일간 癸亥 = 편관·정관), startAge +10, endsAt+1일 = 다음 startsAt | 「periods carry 십신 …」 |
| 2100 절단(2010년생 9주, 1988년생 10주 비절단) | 「truncates periods …」 |
| `null + OUT_OF_SOLAR_TERM_TABLE`(함수 층) · 1920-01-10 역행은 소한 1920-01-06 기준으로 정상 | 「returns daeun null with reason …」 |
| current: 첫 주 전 null / 시작일 당일 index 0 / 종료일 index 0 / 다음날 index 1 / 기본 = todayKst | 「current follows referenceDate …」 |
| API: include 없이 바이트 동일 · 학파 japyeong · referenceDate 형식/실존 검증 · timeUnknown | 「saju-pillars-v1 — options.include daeun」 3건 |

**실측 정정 1건(§6-3)**: 발주서 §1 「첫 절부터 표 밖(1920-01-06~02-04 역행 출생 등)이면 `daeun:null`」 — 소한 1920-01-06 23:41이 표 첫 행이라 그 뒤 역행 출생은 정상 계산된다(테스트로 고정). `null`은 출생 분이 표 첫 행보다 앞일 때만이며 명식 계산이 먼저 `OUT_OF_SUPPORTED_RANGE`를 내므로 API에서는 도달하지 않는다. 함수 층 분기는 유지·테스트.

## C3 — 골든 대운표
16행 전부 코어 산출 = 표(파서 테스트). 앵커: g-2024 순행 42,836 / 역행 0 · g-1955-2247 D=1 · g-1955-2248 D=0 · g-2011-0334 D=1. 절단: 2010·2015·2024·2011년생 행은 8~9주(비고 표기). 시각 미상 명식은 골든에 없음(단위 테스트로 고정). **[ASK] 시중 만세력 대운수 3건 교차는 사용자 표본 대기** — 비고 「교차: …」 열 비워둠.

## C4 — 라이브(keyless, 머지·배포 후 실측 예정)
로컬 동형: `include:["daeun"]` → 블록 존재, 나머지 필드 JSON 문자열 바이트 동일(테스트). include 없이 → 키 없음. 라이브 curl은 머지·배포 뒤 LC 검수(발주서 §7).

## C5 — 웹 스크린샷 (`docs/evidence/2026-09-22-stage7-daeun/`)
| 파일 | 상태 |
| --- | --- |
| `1-daeun-forward-rule-open.jpg` | 1988-10-09 02:30 男(戊辰 壬戌 丁酉 辛丑) — 순행 · 시작 9.84세(1998-08-11), 10칸(9.8세 계해 편관·정관 … 99.8세 임신), 현재 을축(29.8세) 강조, 규칙 접힘 열림(입동 1988-11-07 13:49 · 42,499분 ÷ 4,320 = 9.8377…년) |
| `2-daeun-backward-rule-open.jpg` | 1990-01-01 10:30 男(己巳 丙子 丙寅 癸巳) — 역행 · 8.31세(1998-04-23), 을해 … 병인, 현재 계유(28.3세), 규칙(대설 1989-12-07 12:21 · 35,889분) |
| `3-daeun-other-both.jpg` | 1990-01-01 10:30 기타 — 순행·역행 두 줄 모두, 기본 없음 |

## C6 — 게이트 · 리뷰 지적·처리
- `npm run verify` exit 0 — test **358**(api 17 + saju-core 304 + web 37). include 없는 응답 바이트 동일(테스트). baby 소비 필드 불변(미소비 블록). `git diff --check` 0.
- **리뷰 지적·처리**: verifier 서브에이전트 — (아래 「검토」 절에 결과 기재) · 리뷰봇 코멘트 — PR 열린 뒤 기재 · LC 판정 — 대기.

## §6 반박 가능 — 채택/반박
| # | 항목 | 결정 |
| --- | --- | --- |
| ① | other 두 벌 vs 순행 기본 | **채택(두 벌)**. `direction: "both"`로 명시, 웹도 두 줄. 기본을 정하면 「정답 1개」가 되어 회의 원칙과 충돌 |
| ② | 절입 동시각의 순행 D | **채택(다음 절)**. 「엄격히 뒤」 정의를 코드·md·테스트에 고정. 역행은 0 |
| ③ | 개월 분해 버림 | **채택**. `years`/`months`는 데이터 필드, `startAgeExact`가 정본. 웹은 소수 표기(1자리·2자리)만 하고 「N세」로 확정하지 않음 |
| ④ | 10주 고정 vs 100세 | **채택(10주)** + 절기표 끝 절단. 100세 기준은 startAgeExact에 따라 9~10주가 되어 소비자가 길이를 예측하기 어려움 |
| ⑤ | 응답 필드명·형태 | **제안 + 변경 2**: (a) 남/여·other 모두 같은 껍데기(`direction` + `forward?`/`backward?`) (b) `referenceTerm`(거리를 잰 절)·`referenceDate`(current 기준일) 명시 — 소비자가 재계산·검산 가능 |
| ⑥ | `current` v1 포함 | **채택(포함)**. 웹 강조에 필요. 단 `referenceDate` 없이 요청하면 응답이 날짜 의존 — 문서에 고지. 결정론이 필요한 소비자는 `referenceDate`를 넣는다 |
| + | 절단 기준(추가) | 「주 `startsAt` > 절기표 끝」이면 그 주부터 제외. 발주서 문장은 「다음/이전 절이 표 밖」이었으나 D의 기준 절은 표 안에서만 나오므로(위 정정) 절단은 주(period) 층에만 의미가 있음. 되돌리기 = `readingFor`의 `TABLE_END_MINUTE` 비교 1줄 |

## 하지 않은 것
세운·월운 · 대운수 반올림/버림 · 대운↔원국 합충 · 절입 진태양시 · 강약·용신·격국 · 8단계 파생 플래그(dayStemCombined 등)·化 재료·공협(LC 지시대로 미구현).

## 검토 (verifier 서브에이전트) — PASS, 지적 1(위생)·처리 완료
- 도메인(순역 4조합·12절·3일=1년·엄격히 뒤/이하·월주 ±1·십신) PASS · 골든 2행 손검산 PASS(g-1990 순행 6,543분 · g-1988 순행 42,499분 — 검증자가 처음 02:30 원시 시각으로 계산해 42,439로 어긋났다가 DST 정규화(KST 01:30)를 반영해 일치 확인 → `resolveBirthKst`가 기존 정규화 경로를 재사용하므로 구조적으로 보장) · 로직(정규화·정오·절단·current 포함 경계·60갑자·365.2425·startAgeExact 무반올림) PASS · API additive PASS · 도메인 불변 PASS.
- 지적: 저장소 루트의 0바이트 미추적 파일 2개(`0`, `dateValue(period.startsAt)` — 앞선 셸 리다이렉션 사고) → **삭제 완료**(커밋 대상 아님). `distanceMinutes`의 `Math.round`는 부동소수 오차 보호(정수 분)이며 대운수 반올림과 다른 층위 — 인지.
- 리뷰봇 코멘트: PR 열린 뒤 확인(0이면 0으로 기재).
