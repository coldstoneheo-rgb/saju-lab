# 일간 강약 팩터(8a) — 정본

`packages/saju-core/src/l2/strength-factors.ts`의 상수(정의 id·돕는 십신·계절·사령 경계 폭)는 이 문서의 표와 같아야 하며 `l2/strength-factors.test.ts`가 md를 직접 파싱해 동일성을 강제한다(열 이름 매핑). 설계 = `docs/DESIGN-2026-09-saju-L2-stage8.md` §2(LC 채택 2026-09-23).

- **8a는 사실만 낸다.** 글자 세기 · 표 조회 · 절입 거리. 점수 · 등급 · 강약 판결(신강/신약) · 가중 산식은 없다(회의 2026-09-22 A2-4 · PLAN §2-1). 판독은 8b 규칙 세트가, 채택은 관점층이 한다.
- 득령·득지·득세처럼 교재마다 기준이 다른 항목은 결과에 `definitionId`를 싣는다. 정의를 바꾸면 id가 바뀌고 골든을 다시 만든다.
- 천간·지지 라벨은 `docs/rules/HIDDEN-STEMS.md`와 같다. 지장간 학파는 `options.school`(기본 `yeonhae`).
- 팩터는 **주 명식에만** 계산한다. `alternates`(23시대 참고 명식 등)의 팩터는 v1 범위 밖.

## 표 1 — 정의

`채택` 열이 `yes`인 행이 코어가 계산하는 정의다. `no` 행은 대안 기록(코어 미구현, 8b 규칙 세트가 요구하면 파라미터로 연다).

| 팩터 | definitionId | 정의 | 채택 |
| --- | --- | --- | --- |
| 득령 | deukryeong.primary-support | 월지 **정기** 천간의 십신이 표 2의 돕는 십신(비겁·인성)이다 | yes |
| 득령 | deukryeong.primary-bigeop | 월지 정기 천간의 십신이 비견·겁재다 | no |
| 득령 | deukryeong.wangsang | 월령 기준 일간 오행이 旺·相이다 | no |
| 득지 | deukji.day-branch-support | 일지 **지장간**(선택 학파) 중 하나 이상이 돕는 십신이다 | yes |
| 득지 | deukji.day-branch-primary | 일지 정기 천간만 본다 | no |
| 득지 | deukji.any-root | 네 지지 어디든 통근이 있다 | no |
| 득세 | deukse.surface-majority-ge | 월지를 뺀 표층 글자(일간 외 천간 + 월지 외 지지 정기) 중 돕는 십신 수 **≥** 나머지 십신 수. **동률이면 득세로 본다** | yes |
| 득세 | deukse.surface-majority-gt | 같은 글자, 돕는 십신 수 **>** 나머지(동률 = 득세 아님) | no |
| 득세 | deukse.hidden-majority-ge | 지장간 전체를 포함해 센다 | no |

## 표 2 — 돕는 십신

| 십신 | 묶음 |
| --- | --- |
| bigyeon | 비겁 |
| geopjae | 비겁 |
| pyeonin | 인성 |
| jeongin | 인성 |

나머지 여섯(식신·상관·편재·정재·편관·정관)은 「나머지 십신」이다.

## 표 3 — 월지 계절 (조후 원재료)

| 월지 | 계절 |
| --- | --- |
| in | spring |
| myo | spring |
| jin | spring |
| sa | summer |
| o | summer |
| mi | summer |
| sin | autumn |
| yu | autumn |
| sul | autumn |
| hae | winter |
| ja | winter |
| chuk | winter |

## 표 4 — 사령(司令) 경계

| 항목 | 값 |
| --- | --- |
| 경계 근접 폭(일) | 1 |
| 시각 미상 대체 시각 | 12:00 |

## 팩터 정의 (필드별)

| 필드 | 정의 | 학파 영향 | 시각 미상 |
| --- | --- | --- | --- |
| `tenGodCounts.surface` | 일간을 뺀 천간 3 + 지지 정기 4의 십신별 개수 | 없음 | 천간 2 + 지지 3 |
| `tenGodCounts.withHidden` | 일간을 뺀 천간 3 + 지장간 전체의 십신별 개수 | 있음 | 기둥 3 |
| `elementCounts.surface` · `.withHidden` | 같은 두 층(일간 제외)의 오행별 개수. 층 원본은 `layers`(`stems` · `branchPrimary` · `hiddenStems`, 일수 원본 포함) | withHidden만 | 기둥 3 |
| `exposed` | 지지마다 장간 각각이 네 천간(일간 포함) 중 어느 기둥에 투출됐는지. 투출 없는 장간은 싣지 않는다 | 있음 | 시주 없음 |
| `roots` | 일간과 같은 오행의 장간(통근) — 기둥 · 자리(여기/중기/정기) · 천간 | 있음 | 기둥 3 |
| `deukryeong` · `deukji` · `deukse` | 표 1 채택 정의. 결과 = `value` 불리언 + `definitionId` + 근거 글자 | 득지만 | 득세 = 기둥 3 |
| `saryeong` | 월 절입 뒤 경과 분(整數) ÷ 1440 = 경과일. 월지 장간을 여기 → 중기 → 정기 순으로 일수 누적 구간에 놓고, 경과일이 속한 구간의 천간. 구간은 `[누적 시작, 누적 끝)`, 정기 구간은 월 끝까지. `nearThreshold` = 내부 경계(여기 끝, 중기 끝)와 경과일의 거리가 표 4 폭 **이하** | **`yeonhae` 전용** — `japyeong`은 `null` + `saryeongUnavailable: "no-day-counts"` | 표 4 시각으로 계산, `precision: "time-unknown"` |
| `dayStemCombined` | 일간이 당사자인 천간합 — 상대 기둥 · 규칙 id | 없음 | — |
| `monthBranchClashed` | 월지가 당사자인 충 — 상대 기둥 · 규칙 id | 없음 | — |
| `dayBranchInteractions` | 일지가 당사자인 육합·삼합·방합·충·형 — `kind` · 규칙 id · 기둥(합충표 순서, 같은 id가 기둥 조합별로 여러 번 나올 수 있다) | 없음 | — |
| `transformationMaterials` | 천간합마다 `{ganhapId, pillars, potentialElement, monthElementMatches, potentialElementExposed}`. `monthElementMatches` = 월지 오행(`BRANCH_FIVE_ELEMENT`) == 화기 오행. `potentialElementExposed` = **합의 두 천간을 뺀** 다른 천간 중 화기 오행 천간이 있다. **化 판정 필드는 없다** | 없음 | 시간 제외 |
| `climate` | 표 3 계절 + 표층(일간 **포함** 천간 + 지지 정기)의 火·水 개수 | 없음 | 기둥 3 |

## 학파 선택 항목

| 항목 | 기본 | 코어 표현 |
| --- | --- | --- |
| 지장간 학파 | `yeonhae` | `options.school` — `withHidden` · `exposed` · `roots` · `deukji` · `saryeong`에 영향 |
| 사령 일수 | 『연해자평』 월률분야(HIDDEN-STEMS 표 1) | `yeonhae`만 계산. 巳 5·9·16(『삼명통회』)은 HIDDEN-STEMS 갈림 표 기록만 |
| 득령 · 득지 · 득세 정의 | 표 1 `채택: yes` | `definitionId` |

**`japyeong` 차분(골든 50 실측 2026-09-23):** 학파를 `japyeong`으로 바꾸면 값이 바뀌는 골든 행 수는 아래와 같다. `strength-factors.test.ts`가 이 표와 코어 차분을 대조한다.

| 필드 | 바뀌는 행 |
| --- | --- |
| tenGodCounts.withHidden | 45 |
| exposed | 19 |
| roots | 14 |
| deukji | 8 |
| saryeong | 50 |

## 쓰지 않는 말

코어 필드 · 이 문서 · 골든 비고에 추천 · 권장 · 최적 · 길흉 단정 · 반드시 · 좋은/나쁜 오행 · 「부족하니 채워야」를 쓰지 않는다. 8a 결과는 사람 대면 문장이 아니다(사람 대면 고지는 11·13단계).

출처: 설계 `docs/DESIGN-2026-09-saju-L2-stage8.md` §2·§5(LC 채택 `life-coordinator/docs/DESIGN-REVIEW-2026-0923-saju-stage8.md`, 개선 1 = 득세 `≥` 고정) · 회의록 2026-09-22 A2-4 · 『연해자평』 월률분야 · 『자평진전』.
