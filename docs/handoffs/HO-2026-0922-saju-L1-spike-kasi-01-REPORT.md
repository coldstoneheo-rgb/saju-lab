# HO-2026-0922-saju-L1-spike-kasi-01 — REPORT

- 발주서: life-coordinator `handoffs/HO-2026-0922-saju-L1-spike-kasi-01.md` (LC main `4873a1e`)
- 워커: saju-lab 세션 (Claude Opus 5), 2026-09-22
- 브랜치 `feat/l1-solar-terms-kasi-1920-2100` → PR 1개. 착수 시점 main `e864713`.
- 사용자 결정 반영: KOGL [ASK] = ⓒ 「문의 병행, 머지는 지금」(09-22 12:5x). §6 반박 3건 수용(C2 게이트 ≤2030 · 24:00 파서 테스트 · REPORT 경로 `docs/handoffs/`).

## 요약

한국천문연구원 24기 입기 시각 표(1920~2100)를 유일한 절기 소스로 채택했다. 계산 가능 범위가
**2000-02-04~2028-12-06(+1990년 30일 창)** 에서 **1920-01-06 소한 ~ 2100-12-07 대설 직전**으로 넓어졌고,
출처 없는 손관리 5행은 폐기됐다. 기존 표와 새 표의 불일치 22행은 독립 천문 계산으로 판정했고,
그중 **2011-11-08 입동(09:26 → 03:35)** 은 실제 사용자 결과(월주)를 바꾸는 수정이다.

## KOGL / 출처

| 항목 | 값 |
| --- | --- |
| 원문 | `https://astro.kasi.re.kr/kor/almanac/solarTerms/download` — 이 세션에서 재다운로드, sha256 `508761248c7d18eb1ca1bcb1fcace2ba29f3f511d085321ae1e633c74d8e9e34` = LC 사본과 바이트 동일 |
| 저장 | `docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt` (4,360행 = 헤더 16 + 데이터 4,344, UTF-8) |
| 공공누리 | 파일·다운로드 페이지에 표시 없음. 사이트 푸터 → `https://www.kasi.re.kr/kor/pageView/134` 「저작권정책」: 공공누리 제1유형(출처표시) 원칙, **「공공누리가 표시되지 않은 자료는 사전에 협의한 이후에 이용」** |
| 조치 | 사용자 결정 ⓒ: 출처 3요소(파일명·URL·다운로드일 2026-09-22)를 `solar-terms.data.ts` 헤더와 `SOLAR_TERM_SOURCE_AUDIT_2026-05-25.md` «2026-09-22 판정»에 표기하고 머지. 사전 협의 문의는 사용자가 발송, 회신은 LC가 후속 통보 |

**롤백 경로(부정 회신 시).** `python scripts/generate_solar_terms_module.py --source docs/fixtures/kasi-special-days-solar-terms-2000-2028.json` 한 명령으로 2000-01-06~2028-12-06 표(348행)가 재생성된다 — 이 세션에서 scratch로 실행해 348행·헤더 `dataset: data.go.kr …` 출력을 확인했다(생성기가 JSON 입력을 계속 받는다, 코드 변경 0). 데이터 외에 되돌릴 것은 범위를 1920/2100에 고정한 테스트 4건(`index.test.ts` 2, `saju-pillars-v1.test.ts` 2), `calculation-coverage-copy.ts` 카피 1건과 그 가드 테스트, 문서 범위 문구다. 손관리 1989~1999 행은 출처가 없어 되살리지 않는다(1990년 30일 창은 사라진다).

## C1 — cross-check 348행 (`python scripts/generate_solar_terms_module.py --cross-check docs/fixtures/kasi-special-days-solar-terms-2000-2028.json`)

| 구분 | 건수 |
| --- | --- |
| 동일 | 328 |
| \|Δ\| ≤ 1분 | 19 (전부 API = txt − 1분) |
| \|Δ\| > 1분 | **1** (2011-11-08 입동, +351분) |
| txt에 없음 | 0 |

판정 규칙: ≤1분은 집계만, txt 채택. >1분은 astronomia 값을 제3 증거로.

| 행 | API 픽스처 | KASI txt | astronomia (KST) | 판정 |
| --- | --- | --- | --- | --- |
| 2011-11-08 입동 | 09:26 | **03:35** | 03:34:55 (Δ −4.8 s vs txt) | **txt.** API 값은 어느 계산과도 5h 51m 어긋남 |
| 1989-12-07 대설 (손관리) | 17:22 | **12:21** | 12:20:58 (Δ −1.7 s) | **txt.** 손관리 값 5h 01m 오류 |
| 1999-12-07 대설 (손관리) | 22:48 | **22:47** | 22:47:28 | txt (반올림 경계, 28 s) |
| 1분 차 19행 | txt−1 | txt | 전부 :30 전후 (2007-10-09 01:11:28 · 2015-01-06 01:20:32 · 2020-12-07 01:09:29 …) | 반올림 경계 노이즈. txt 채택, 정확도 판정 대상 아님 |

판정이 txt와 갈린 행: **0** → [ASK] 없음. 22행 전체 표는 `docs/SOLAR_TERM_SOURCE_AUDIT_2026-05-25.md` «2026-09-22 판정».

## C2 — astronomia 3자 검증 (`node scripts/verify_solar_terms_astronomia.mjs`)

방법: 각 절의 태양 황경(입춘 315° + 15°/기)에 도달하는 JDE를 `solstice.longitude`(VSOP87B earth, 1초 정확도)로 구하고
`deltat.deltaT`로 TT→UT 변환 후 +9h. 판정 `|엔진초 − KASI분×60| ≤ 60 s`. 반올림 경계 = 엔진 초가 :30±5 s.
devDependency `astronomia@4.2.0`(MIT, dependencies 0, 런타임 번들 0). 실행 13.5초.

| 구간 | 행 | ≤60 s | 최대 \|Δ\| | 평균 \|Δ\| | 분 불일치 | 반올림 경계 |
| --- | --- | --- | --- | --- | --- | --- |
| **≤2030 (게이트)** | 1,332 | **1,332 (100%)** | 33.8 s | 15.2 s | 40 | 223 |
| 1950~1999 (12절) | 600 | 600 (100%) | 31.5 s | 14.6 s | 7 | 94 |
| 1950~1999 (24기 전체, 회의 표 재게시) | 1,200 | 1,200 (100%) | 32.7 s | 14.7 s | 23 (1.9%) | 205 |
| 2031~2100 (게이트 아님) | 840 | 389 (46.3%) | 172 s | 70.9 s | 637 | 148 |
| 전체 12절 | 2,172 | 1,721 (79.2%) | 172 s | 36.8 s | 677 | 371 |

2031~2100 분포: 60 s 초과 첫 행 **2052-08-07 입추**, 연대별 최대 2030년대 47 s → 2040년대 57 s → 2050년대 75 s → 2060년대 101 s → 2070년대 127 s → 2080년대 146 s → 2090년대 172 s. Δ는 일관되게 음(엔진이 빠름) = astronomia의 ΔT 다항식(2050+: Espenak-Meeus)과 KASI 예측 모델의 차이. KASI 헤더 «미래로 갈수록 수 초~수 분 달라질 수 있음»과 정합 — 데이터 결함이 아니라 예측 불확실성. 게이트 `exit 0`.

24:00 3건(1950-01-20 대한, 2030-02-18 우수, 2053-01-19 대한): 엔진 23:59:38 / 23:59:54 / 23:58:55 — 전부 자정 직전 반올림, 전부 중기.

## C3 — `--check` CI 배선

`.github/workflows/ci.yml`에 스텝 1개(2줄): `python3 -m unittest discover -s scripts -p "test_*.py"` + `python3 scripts/generate_solar_terms_module.py --check`. 로컬 실행 `up to date (2172 boundaries)` exit 0. CI 결과는 PR 체크에서.

## C4 — 테스트

`npx vitest run src`(saju-core): **113 통과**(전 108 + 신규 5). 전체 `npm test`: api 17 + saju-core 113 + web 32 = **162**(dist 중복 100건 제거, 전 257).

| 변경 | 파일 | 내용 |
| --- | --- | --- |
| 핀 이동 (재작성) | `index.test.ts` «rejects dates beyond the embedded solar month table range» | 1990-03-01·2028-12-20·2029-03-01 → 1919-12-31·2100-12-20·2101-03-01 |
| 핀 이동 (재작성) | `index.test.ts` «carries all twelve month boundaries for every KASI-sourced solar year» | 2000~2028 → 1919(11만)~2100(10까지) + 2,172행·181입춘 |
| 핀 이동 (재작성) | `saju-pillars-v1.test.ts` «still refuses dates past the end…» | 2029-01-02 → 2101-01-02 |
| 신규 | `index.test.ts` «computes the first and last supported minutes of the KASI table» | 1920-01-06 23:41(기미·정축) / 23:40 throw / 2100-12-07 10:41(경신·정해) |
| 신규 | `index.test.ts` «applies the 1955 입춘 minute from the KASI table (23:18 KST)» | 23:17 갑오·정축 → 23:18 을미·무인 |
| 신규 (C9) | `index.test.ts` «uses the KASI 03:35 입동 minute for 2011-11-08…» | 03:34 무술 / 03:35 기해 / 09:25 기해 |
| 신규 | `saju-pillars-v1.test.ts` «refuses dates before the first KASI row (1919)» | 1919-06-15 → `OUT_OF_SUPPORTED_RANGE` |
| 신규 (C5) | `saju-pillars-v1.test.ts` «serves 200 spread-out 1950-1999 birth dates…» | 결정론 LCG로 연·월·일·시·분 분산 200건 → 실패 0 |
| Python | `scripts/test_generate_solar_terms_module.py` | 6건: 파싱·24:00 정규화·중기 제외·연속성·실픽스처 2,172/181 |

발주서 「핀 이동 3 assert 재작성 외 무변경」 대비 실제: 재작성 **3 테스트**(index.test 2 + v1 test 1), 그 외 기존 테스트 무변경. 2024 인벤토리 테스트(`documented2024Boundaries` 14행)는 txt 값과 그대로 일치해 손대지 않았다.

## C5 — 1950~1999 200건

위 «serves 200 spread-out 1950-1999 birth dates» 테스트가 상시 게이트. 연 1950+(i mod 50), 월·일·시·분은 시드 20260922 Park-Miller LCG → `OUT_OF_SUPPORTED_RANGE` **0건**, 빈 월주 0건. 1919-06-15 → 400, 2101-01-02 → 400.

## C6 — 계약 불변

- API 골든 2건(`saju-pillars-v1.test.ts:33,53` 1990-01-01→金 부재, 2024→水 부재) 통과 — 값 불변.
- baby 소비 필드(`pillars.*.stem/branch`, `fiveElements.{distribution,absent,deficient,supplementPriority}`) 스키마·산식 변경 0. 응답 필드 추가 0.
- 1990-01-01 10:30 골든의 활성 경계는 1989-12-07 대설 — 17:22→12:21 변경이 같은 날이라 월주 동일(테스트로 확인).

## C7 — 크기

| 대상 | 전 | 후 | 증분 |
| --- | --- | --- | --- |
| `solar-terms.data.ts` 행 | 427 | **2,549** | +2,122 |
| 〃 raw | 32,460 B | 197,098 B | +164,638 B |
| 〃 gzip | 4,405 B | 22,934 B | +18,529 B |
| `apps/web/dist/assets/index-*.js` raw | 251,589 B | 391,430 B | +139,841 B (+56%) |
| 〃 gzip | 75,563 B | **95,485 B** | **+19,922 B (+26%)** |

전송 기준 +19.9 KB. 필요하면 후속으로 행을 `[epochMinute, ordinal]` 정수 배열로 압축하면 raw 1/4 수준이 되지만 이 HO 범위 밖(생성기 출력 형식 불변 조건).

## C8 — 게이트

`npm run verify` **exit 0** — typecheck 0 · test 162 통과 · build 0 · `npm audit --audit-level=moderate` 0(esbuild low 1건 잔류) · `git diff --check` 0. `npm ci` 후 실행.

## C9 — 2011-11-08 입동 (사용자 영향, L2C 재료)

이전 표는 data.go.kr 특일 정보 API가 준 **2011-11-08 09:26**을 입동으로 썼다. 한국천문연구원 24기 표는 **03:35**이고
독립 천문 계산(VSOP87)도 03:34:55로 표와 5초 안에서 일치한다 — API 값은 어느 계산과도 5시간 51분 어긋난 이상치다.
그 결과 **2011년 11월 8일 03:35~09:25(KST) 출생**은 지금까지 월주가 무술(戊戌, 술월)로 계산됐지만 실제로는
기해(己亥, 해월)다. 라이브 `/api/saju-pillars`와 웹 리포트 모두 해당 구간에서 월주와 그에 따른 오행 분포가
바뀐다. 회귀 테스트 «uses the KASI 03:35 입동 minute for 2011-11-08» 이 03:34/03:35/09:25 세 점의 월주를 고정한다.

## 변경 파일

- 데이터·생성: `docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`(신규) · `scripts/generate_solar_terms_module.py`(txt 파서·`--cross-check`·24:00 정규화·JSON 롤백 입력·LEGACY 삭제·45일 예외 삭제) · `scripts/test_generate_solar_terms_module.py`(신규) · `packages/saju-core/src/solar-terms.data.ts`(재생성)
- 검증: `scripts/verify_solar_terms_astronomia.mjs`(신규) · `package.json`/`package-lock.json`(devDependency `astronomia` 4.2.0 고정)
- 테스트: `packages/saju-core/src/index.test.ts` · `saju-pillars-v1.test.ts` · `packages/saju-core/package.json`(`vitest run src`) · `apps/web/src/beta-launch-guard.test.ts`
- CI: `.github/workflows/ci.yml`
- 문구·문서: `apps/web/src/calculation-coverage-copy.ts` · `docs/algorithms/SOLAR_TERM_SPEC.md` · `docs/SOLAR_TERM_SOURCE_AUDIT_2026-05-25.md` · `docs/SAJU_PILLARS_API_V1.md` · `docs/fixtures/GOLDEN_FIXTURES.md`
- 코어 로직(`solar-terms.ts`, `datetime.ts`, `cycle.ts`, `pillars.ts`) 변경 **0**.

## 하지 않은 것 (발주서 §2-10)

시간대 이력·진태양시·야자시·분 단위 시주 · 골든 케이스 수집 · 폴더 재배치 · eslint. 추가로 데이터 압축(C7)과 `--check`의 `npm run verify` 편입(CI만 배선)은 하지 않았다.
