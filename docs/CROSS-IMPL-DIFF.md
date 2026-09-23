# 교차 구현 차분 테스트 — saju-core ↔ lunar-typescript

HO-2026-0923-saju-cross-impl-diff-01. 같은 규칙 표로 다시 계산하는 검산은 **표 자체의 오류**를 못 잡는다. 그래서 절기 원천·음력 원천·구현이 모두 다른 오픈소스 만세력과 대량으로 대조한다.
목표는 「일치」가 아니라 **불일치 하나하나에 원인을 대는 것**이다. CI 게이트는 `unexplained === 0`.

## 1. 실행

```
npm run diff:cross-impl                      # = node scripts/diff_cross_impl.mjs, 종료코드 0 = unexplained 0
node scripts/diff_cross_impl.mjs --seed 1 --json out.json   # 시드·건수 변경, 전체 결과 JSON
node scripts/diff_cross_impl.mjs --lunar-month-diffs        # 한·중 음력 월 시작일이 다른 달 전수 목록(§4)
```

- CI: `.github/workflows/ci.yml`의 **별도 스텝** 「Cross-implementation diff」(`npm run verify`에는 넣지 않았다). 로컬 실행 시간 39~70초(5,550건 + 음력 1,000건).
- saju-core는 TypeScript다. 스크립트가 esbuild(vite를 통해 이미 설치됨)로 `packages/saju-core/src`를 임시 ESM으로 묶어 plain node에서 돌린다. **코어 코드 변경 0.**

## 2. 교차 구현 (C1)

| 항목 | 값 |
| --- | --- |
| 패키지 | `lunar-typescript` **1.8.6** (6tail, `git+https://github.com/6tail/lunar-typescript.git`), root `devDependencies`에 정확한 버전으로 고정. 런타임 번들에는 들어가지 않는다 |
| 라이선스 | **MIT** (`npm view lunar-typescript license`, 2026-09-23) |
| 의존 | **0** (`npm view … dependencies` 비어 있음) |
| 오프라인 | `dist`에 `fetch`·`XMLHttpRequest`·`http(s)` import 없음(grep 0건). 절기·삭망을 자체 천문식(寿星万年历 계열)으로 계산 |
| 절기 원천 | 천문 계산, **UTC+8(중국 표준시) 벽시계, 초 단위**. saju-core = KASI 24기 표(KST, 분 단위 반올림) |
| 음력 원천 | 중국 농력(UTC+8 삭 시각). saju-core = 한국 음력(KASI 계열, UTC+9) |

## 3. 정책 맞춤 (불일치로 세지 않게 먼저 맞춘 것)

| 항목 | saju-core 기본 | lunar-typescript 기본 | 맞춘 방법 |
| --- | --- | --- | --- |
| 절기 시계 | KST | UTC+8 | 연·월주는 **KST−60분** 시각으로 lunar-typescript를 읽는다 |
| 일·시주 | KST 벽시계 | 입력 벽시계 | 일·시주는 **KST 그대로** 읽는다 |
| 23시 일주 | 야자시 `late` = 당일 유지 | sect 2 = 당일 유지 | 같음. 단 **시간(時干)은 lunar-typescript가 다음 날 일간으로 잡는다** → `ja-hour-policy`로 분류 |
| 한국 시간대 이력(1954~61 +8:30, DST) | tzdb 이력으로 KST 정규화 | 이력 없음 | 코어가 정규화한 KST(`resolveBirthKst`)를 두 쪽에 넣는다. 그래서 **정규화 자체는 이 차분이 검증하지 않는다**(tzdb 픽스처 테스트 몫). 분류기에 `tz-normalization`이 없는 이유 |
| 진태양시 | 기본 미적용 | 미지원 | 미적용으로 비교(골든 행의 `옵션`·`출생지`는 떼고 넣는다) |
| 지장간 | 기본 `yeonhae` | 자평 표(子=癸만) | **`japyeong`** 학파와 비교. 12지 표를 한 번 대조해 **차이 0**(그래서 `hidden-stem-table` 분류는 0건) |
| 대운 거리 | 분 단위, D÷4320 | sect 2: 1년=4320분·1달=360분·1일=12분·1시간=0.5분 | lunar-typescript의 (년,월,일,시)를 분으로 되돌려 비교 |

## 4. 결과 (시드 20260923, main `79299e9`, 2026-09-23) (C2·C3·C4)

**표본** 5,550건 = 무작위 5,000(1920-01-06~2100-12-07, 분 균등, 성별 균등) + 골든 50 전 건 + 경계 집중 500(절입 ±3분 300 · 23:00/00:00 ±2분 100 · DST 전이 ±2시간 60 · UTC+8:30 구간 40). 코어 거부 0건. 여기에 음력→양력 1,000건(1901~2049, 윤달 15%)을 따로 대조했다.

### 4-1. 명식 4주

| | 비교 | 일치 | 비율 |
| --- | --- | --- | --- |
| 연·월·일·시 필드 | 22,197 | 21,897 | 98.648% |

나머지 300필드는 모두 설명된다(§4-4). **일주 불일치 0**(60갑자 일수 세기는 전 구간 일치).

### 4-2. 절입 시각 차이 (lunar-typescript − KASI, 분)

| 대상 | n | 최대 절대 | 평균 절대 | 평균(부호) |
| --- | --- | --- | --- | --- |
| 12절 전부(1920~2100) | 2,172 | 2.517 | 0.489 | −0.313 |
| 경계 집중 표본의 절 | 300 | 2.517 | 0.484 | −0.331 |

차이가 가장 큰 쪽은 2090년대(ΔT 외삽 차이). 분류 임계 `TERM_TOLERANCE_MIN = 3`분은 이 최대값 위에 둔 값이다.

### 4-3. L2

| 항목 | 비교 | 일치 | 비고 |
| --- | --- | --- | --- |
| 천간 십신(연·월·시간) | 15,759 | **100%** | lunar-typescript `LunarUtil.SHI_SHEN` 표 |
| 지장간 십신(japyeong) | 21,013 | **100%** | `ZHI_HIDE_GAN`, 순서 무시 집합 비교 |
| 지지 충(전 쌍) | 5,254 | **100%** | `LunarUtil.CHONG` |
| 간합·육합·삼합·방합·형 | — | 미제공 | lunar-typescript에 명식 단위 합·형 판정이 없다(`HE_*` 표 없음) |
| 대운 순역 | 7,013 | **100%** | other = 두 방향 |
| 대운 10주 간지(앞 8주) | 7,013 | **100%** | |
| 대운 거리(분) | 7,013 | 39.84% 정확 일치 | 나머지는 전부 그 절의 두 시각 차이로 설명(§4-4). 차이 최대 3분, 평균 절대 0.762분 |

### 4-4. 분류

| 분류 | 건수 | 근거(건마다 JSON에 기록) |
| --- | --- | --- |
| `solar-term-minute` | 4,241 | 연·월주: 출생 시각이 KASI 절입과 lunar-typescript 절입 **사이**에 있고 두 절입 차 ≤ 3분. 대운 거리: 차이 − (그 절의 두 시각 차) 가 1분 미만(lunar-typescript는 분 미만을 버린다) |
| `ja-hour-policy` | 274 | 23시대 子시에서 코어 시간 = 당일 일간 오서둔, lunar-typescript 시간 = 다음 날 일간 오서둔 |
| `lunar-table` | 44 | 한국 음력과 중국 농력의 월 시작일이 다른 달(또는 그 전달, 월 길이 차이). 해당 달 66개 전부를 **KARI `getSolCalInfo`로 확인해 66/66 코어와 일치** — `scripts/cross-impl-kari-lunar-months.json`에 조회 쿼리와 함께 기록 |
| `hidden-stem-table` | 0 | japyeong 표와 lunar-typescript 표가 12지 모두 같다 |
| **`unexplained`** | **0** | |

골든 50 중 설명이 필요했던 행은 25개다(전부 위 분류). 눈여겨볼 3개: `g-2024-02-04-1727` · `g-1975-02-04-1959` · `g-1936-03-06-0249`는 **KASI 분과 정확히 같은 시각**의 행이다. lunar-typescript의 절입은 초 단위로 0.1~0.2분 늦어서 이전 절로 본다. 코어의 「동시각 = 새 절」 규칙은 KASI 분 표기를 따른 것이라 결함이 아니다.

### 4-5. 음력→양력

1,000건 중 956 일치(95.6%). 44건은 `lunar-table`(§4-4). 예: 2012년 한국 윤3월은 중국에서 윤4월이라 lunar-typescript가 `wrong lunar year 2012 month -3`을 던진다.

## 5. 게이트가 실제로 떨어지는지 (변이 시험)

`solar-terms.data.ts`의 입춘 181개를 모두 +10분 옮긴 사본으로 실행 → **`unexplained` 577, 종료코드 1**(대운 거리 560 · 월주 16 · 연주 1). 파일은 원복했다. 시드 1·42로도 실행해 둘 다 `unexplained` 0.

## 6. 한계

- 교차 구현이 없는 항목은 이 차분이 검증하지 않는다: 한국 시간대 이력 정규화, 진태양시, 간합·육합·삼합·방합·형, 대운 시작일(날짜 환산 규칙이 서로 다름).
- 절기 원천이 둘 다 천문 계산 계열이라 **3분 안쪽의 공통 오류**는 이 방법으로 잡히지 않는다. KASI 표 자체는 `scripts/verify_solar_terms_astronomia.mjs`와 기존 픽스처 검증이 맡는다.
- 천간·지지의 한자↔로마자 대응은 saju-core의 `STEMS`·`BRANCHES` 순서를 그대로 쓴다. 그 순서 자체가 틀리면 이 차분도 같은 오류를 물려받는다(순서는 골든 표·단위 테스트가 고정한다).
- 음력 설명(`lunar-table`)은 2026-09-23 KARI 조회에 묶여 있다. 코어 음력 표를 바꾸면 `--lunar-month-diffs`로 목록을 다시 뽑고 KARI로 다시 확인해야 한다.
