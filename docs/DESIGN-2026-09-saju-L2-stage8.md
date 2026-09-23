# DESIGN — L2 8단계: 일간 강약 팩터 · 강약 판독 · 용신 후보 (초안)

- **상태: 초안(설계만).** 구현 착수 금지 — 사용자 G2-3 결정 전(LC HO 2026-09-23, 규약 §6-4). 저자 = saju-lab 워커(Claude Opus 5.5), 2026-09-23. 검수 = LC(목표·전략 정렬).
- **목표(LC 발주 원문 요지):** 일간 강약 판정 + 용신 «후보»(추천 아님) 산출. 입력 재료 = VERIFY 2본 말미 표(십신 집계 2벌 · 투간 · 득령·득지·득세 · 사령 · `dayStemCombined` · `monthBranchClashed` · 化 재료).
- **제약:** saju-pillars-v1 공개 계약 불변 · 매수/매도식 «추천» 어휘 금지 · G3 게이트. **반박 가능: 전부.**
- **읽은 정본:** 회의록 `life-coordinator/docs/MEETING-2026-0922-saju-council-minutes.md` A2-4·7-2(확정) · `PLAN-2026-0922-saju-capability-v1.md` §2-1·2-4·§6(단계표) · `ACTION-PLAN-2026-0922-saju-quality-gates.md` G2-3 · `VERIFY-2026-0922-golden-tengods.md`·`-interactions.md` 말미 표 · saju-lab `docs/rules/HIDDEN-STEMS.md`·`INTERACTIONS.md`·`DAEUN.md` · `SAJU_PILLARS_API_V1.md`.

---

## 0. 한 문단 요약

8단계를 **두 층**으로 나눈다. **8a 강약 팩터**는 명식 글자와 절입 거리만으로 정해지는 결정론 사실이다(십신 집계, 투간, 통근, 득령·득지·득세, 사령, 합충 파생 불리언, 化 재료, 조후 원재료). 이 층은 LC 독립 재계산으로 골든 `confirmed`까지 닫을 수 있다. **8b 판독·후보**는 md 규칙표를 실행한 결과다. 코어는 이름 붙은 규칙 세트(억부·조후)를 **실행만** 하고, 어느 세트를 채택할지와 최종 용신은 관점층이 정한다. 8b 골든은 「규칙 실행이 표대로인가」(재계산으로 닫힘)와 「그 표가 명리학적으로 맞는가」(G2-3 전에는 닫히지 않음)를 **서로 다른 두 상태 축**으로 기록한다. 공개 API(`include` 블록)는 9단계에서 붙인다.

---

## 1. LC 안에 대한 수용 · 반박 · 대안 (§6-4)

| # | LC 안 | 판단 | 근거 · 대안 |
| --- | --- | --- | --- |
| 1 | 「일간 강약 **판정**」을 코어가 산출 | **부분 반박** | 회의 확정 A2-4·7-2: 「코어 = 득령·득지·득세 3요소 판정 + 후보 나열, **강약 판정→용신 규칙은 관점 데이터(억부표·조후표), 코어는 룰 실행기**, 점수 산식 없음」. 코어가 단일 「신강/신약」 판결을 내면 그 확정을 뒤집는다. **대안:** 코어는 md에 이름 붙은 규칙 세트(예 `strength.triad-majority`)를 실행해 **세트별 판독**(`strong`·`weak`·`balanced`·`indeterminate` + 발화 조건 추적)을 돌려준다. 기본 채택 세트는 없다. 관점 md가 세트를 고른다. |
| 2 | 완료 조건에 「골든 50행 pending 생성」 | **반박(구조)** | pending만으로 끝내면 ① pending 상한 20%(#81 C) 테스트에 걸리고 ② G2-3 전에는 영원히 confirmed가 못 된다. 명리 타당성은 페르소나 자기채점으로 못 닫는다(ACTION-PLAN G2-3). **대안:** 8b 골든에 **두 축**을 둔다 — `실행`(규칙표대로 계산했나: LC 재계산으로 `confirmed`) · `학설`(표 자체의 타당성: `unreviewed` → G2-3 결과로 `reviewed`). 상한은 `실행` 축에만 건다. |
| 3 | 구현 전면 금지(G2-3 전) | **대안 제시(결정은 사용자·LC)** | 8a는 산식 논쟁이 없는 순수 사실(글자 세기·표 조회·절입 거리)이다. 8a를 G2-3과 분리하면 9단계(API)·11단계(L3 후보 생성) 준비가 막히지 않는다. **제안:** 8a는 G2-3과 무관하게 착수 허용, 8b만 G2-3 뒤. 결정 전까지는 이 문서대로 설계만 둔다. |
| 4 | 재료에 「지장간 가중 분포」(회의 A2-4 문구) | **반박(내부 모순 해소)** | 같은 회의 §2-1은 「지장간 일수는 데이터 필드, **가중 산식 없음**」. 두 문장이 충돌한다. **대안:** 코어는 층별 **개수**(천간 / 지지 정기 / 지장간 전체)와 **일수 필드 원본**만 낸다. 가중치(예 정기 1·중기 0.5)는 관점 데이터가 쓰면 된다. |
| 5 | 재료에 「사령(當令) 지장간」 | **수용 + 제약 명시** | 사령은 지장간 **일수**가 있어야 정해진다. 일수는 `yeonhae` 표에만 있다(`japyeong`은 일수 없음, HIDDEN-STEMS.md 표 2). → 사령은 `yeonhae` 전용 필드. `japyeong` 호출에서는 `null` + 사유. 절입 뒤 경과일이 경계 ±1일이면 `nearThreshold`, 시각 미상이면 정오 기준 + `precision: "day"`. |
| 6 | 「化 재료」 | **수용(판정 제외)** | 회의 §2-3·VERIFY 합충 표: 化는 해석층. 코어는 간합 쌍마다 **월령 오행 == 화기 오행 여부**와 **화기 오행 천간 투출 여부** 두 불리언만 동봉한다. `transformed` 같은 판정 필드는 만들지 않는다. |
| 7 | 산출 이름 「용신」 | **수용 + 어휘 규칙** | 필드명 `yongsinCandidates`(회의 A2-4 용어 유지). 후보에 **순위·주·점수 없음**, 순서 = 규칙 id 순. 「추천·권장·최적·반드시·~해야」 금지(§6). baby `supplementPriority`는 **바꾸지 않는다**(회의 B-1: 결핍 보완 ≠ 용신 보완 — 작명 쪽 학파 결정으로 남김). |

---

## 2. 8a — 강약 팩터 (`strengthFactors`, 결정론)

입력 = `PillarsResult`(+ 시각 미상이면 시주 없음) · 학파(`hiddenStemSchool`) · 정규화 KST 출생 순간(사령용). 전부 기존 코어 재료로 계산된다(새 외부 데이터 0).

| 필드 | 정의 | 학파 영향 | 시각 미상 |
| --- | --- | --- | --- |
| `tenGodCounts.surface` | 일간을 뺀 천간 3 + 지지 정기 4(시주 없으면 2+3)의 십신별 개수 | 없음 | 기둥 3 |
| `tenGodCounts.withHidden` | 천간 3 + 지장간 전체의 십신별 개수 | **있음**(장간 목록) | 기둥 3 |
| `elementCounts` | 같은 두 층의 오행별 개수 + 층 원본(`stems`·`branchPrimary`·`hiddenStems`) | withHidden만 | 기둥 3 |
| `exposed` (투간·透干) | 지지마다 장간 각각이 천간 4개(일간 포함) 중에 있는지 + 어느 기둥에 투출됐는지. `monthExposed` = 월지 장간 투출 목록 | **있음** | 시간 없음 |
| `roots` (통근) | 일간과 같은 오행 장간을 가진 지지 목록(기둥·장간 위치 여기/중기/정기) | **있음** | 기둥 3 |
| `deukryeong` (득령) | 월지 **정기** 오행이 일간을 돕는가(비겁 또는 인성) — 정의 id `deukryeong.primary-support` | 없음(정기는 두 학파 같음) | 무관 |
| `deukji` (득지) | 일지 장간 중 비겁·인성이 있는가 — `deukji.day-branch-support` | **있음** | 무관 |
| `deukse` (득세) | 월지 외 글자 중 비겁+인성 수 ≥ 식상+재성+관성 수 — `deukse.surface-majority`(표층 기준) | 없음(표층) | 기둥 3 |
| `saryeong` (사령) | 월 절입 뒤 경과일로 월지 장간 일수(여기→중기→정기 누적)에서 지금 맡은 천간 + 경과일 + `nearThreshold` | **`yeonhae` 전용** | 정오 기준, `precision: "day"` |
| `dayStemCombined` | 일간이 간합 당사자인가 + 상대 기둥 목록 | 없음 | — |
| `monthBranchClashed` | 월지가 충 당사자인가 + 상대 기둥 | 없음 | — |
| `dayBranchInteractions` | 일지가 당사자인 합·충·형 id 목록 | 없음 | — |
| `transformationMaterials` | 간합 쌍마다 `{ganhapId, potentialElement, monthElementMatches, potentialElementExposed}` — **판정 없음** | 없음 | — |
| `climate` (조후 원재료) | 월지 계절(`winter`·`summer`·`spring`·`autumn`) + 표층 火·水 개수 | 없음 | — |

**정의 id:** 득령·득지·득세처럼 교재마다 기준이 다른 항목은 필드마다 `definitionId`를 붙인다. 대안 정의(예 득령 = 월지 비겁만, 득세 = 지장간 포함 세트)는 `docs/rules/STRENGTH.md`의 표에 **대안 행**으로 적는다. 선택 파라미터로 열지는 8b 규칙 세트가 요구할 때만 정한다(§7).

**8a는 점수·등급·판정을 내지 않는다.** 불리언과 개수와 원본만 낸다.

## 3. 8b — 강약 판독과 용신 후보 (규칙표 실행)

### 3-1. 강약 판독 `strengthReadings[]`

`docs/rules/STRENGTH.md`의 **규칙 세트**를 실행한다. 세트 = 이름 · 조건 행(팩터 불리언·개수 비교만, 가중 산식 금지) · 결과(`strong`·`weak`·`balanced`·`indeterminate`) · 출처(서지).

v1 후보 세트(초안 — 저작·검수는 10단계 관점 md와 함께):

| 세트 id | 규칙 | 출처 후보 |
| --- | --- | --- |
| `strength.triad-majority` | 득령·득지·득세 중 2개 이상 참 = `strong`, 1개 이하 = `weak`. 동률 구조 없음 | 통용 교재(삼득 다수결) |
| `strength.month-first` | 득령 참이면 `strong` 쪽, 거짓이면 득지·득세 둘 다 참일 때만 `strong`. 월지 충(`monthBranchClashed`)이면 `indeterminate` | 월령 우선(자평 계열) |

출력 = `{ruleSetId, verdict, firedConditions[], factorRefs[]}`. **기본 세트 없음 — 모든 세트를 실행해 나란히 돌려준다.** 관점 md가 어느 세트를 인용할지 고른다(담천 = 월령 우선, 한소율 = 다수결, 안).

### 3-2. 용신 후보 `yongsinCandidates[]`

`docs/rules/YONGSIN-CANDIDATES.md`의 규칙을 실행한다. 후보 = `{candidateId, element, method, ruleId, basis: {readingRef?, factorRefs[]}, note}`.

| method | 규칙(초안) | 필요 입력 |
| --- | --- | --- |
| `eokbu` 억부 | 판독이 `strong` → 식상·재성·관성 오행 각각 후보 / `weak` → 인성·비겁 오행 각각 후보 / `balanced`·`indeterminate` → 후보 없음 + 사유 | 3-1 판독(세트별) |
| `johu` 조후 | 월지 `winter`(亥子丑) → 火 후보 · `summer`(巳午未) → 水 후보 · 봄·가을 → 없음 | `climate` |
| (보류) `tonggwan` 통관 | 대립 두 오행 사이 매개 오행 — 대립 정의가 산식을 요구해 v1 제외 | — |

- 억부 후보는 **판독 세트마다 따로** 나온다(세트 2개면 후보 묶음도 2개). 같은 오행이 여러 규칙에서 나오면 **합치지 않고** 규칙마다 1건.
- 순서 = `method` → `ruleId` → 오행 고정 순서(木火土金水). **순위가 아니다.** 필드에 `rank`·`primary`·`score`를 두지 않는다.

## 4. 골든 설계

| 표 | 행 | 셀 | 상태 축 | confirmed 경로 |
| --- | --- | --- | --- | --- |
| `GOLDEN-STRENGTH-FACTORS.md` | 50(명식) | §2 필드 전부(학파 영향 필드는 `yeonhae` 고정, `japyeong` 차분은 md 유도 테스트 — 5단계 십신 20/92셀 패턴) | `상태` 1축 | LC 독립 재계산(규칙 md·KASI만) → confirmed |
| `GOLDEN-STRENGTH-READINGS.md` | 50 × 세트 수 | verdict · firedConditions | `실행` + `학설` | 실행 = LC 재계산 / 학설 = G2-3 |
| `GOLDEN-YONGSIN-CANDIDATES.md` | 50 | 후보 목록(세트·방법별) | `실행` + `학설` | 같음 |

- pending 상한 20%는 `상태`·`실행` 축에만 적용. `학설: unreviewed`는 상한 대상이 아니다(G2-3 전 정상 상태). 이 축이 `reviewed`가 되려면 G2-3 ⓐ(실제 역술가)의 기록 문서가 출처로 필요 — 페르소나 라운드 문서로는 `reviewed` 금지(파서가 출처 문서 종류를 검사).
- 50명식 분포는 이미 9범주 + 합충 구조를 덮는다. **추가 필요 사례**(설계 단계에서 표시만): 득령·득지·득세 8조합 중 골든에 없는 조합, 월지 충 명식(`strength.month-first` indeterminate 분기), 사령 `nearThreshold`, 조후 봄·가을(후보 0) — 8단계 착수 시 골든 50에서 먼저 실측하고 빈 칸만 보강한다.
- 오라클: 8a 기대값은 **md 규칙표 + 골든 명식에서 유도**(5·6단계 A5 패턴 — 코드 표 미참조). 8b는 규칙 세트 md를 파싱해 팩터 셀에 적용한 결과와 대조.

## 5. 학파 선택 항목

| 항목 | 선택지 | 기본(안) | 코어 표현 |
| --- | --- | --- | --- |
| 지장간 학파 | `yeonhae` / `japyeong` | `yeonhae`(기존) | `hiddenStemSchool` — withHidden·투간·통근·득지에 영향 |
| 사령 일수 | 연해자평 월률분야 / 삼명통회(巳 5·9·16) | 연해자평 | `yeonhae`만 계산, 巳 대안은 HIDDEN-STEMS 갈림 표 그대로(파라미터화는 요구 생길 때) |
| 득령 정의 | 월지 정기 비겁·인성 / 비겁만 / 월령 旺相 | 비겁·인성 | `definitionId` 표기, 대안은 md 대안 행 |
| 득지 정의 | 일지 장간 / 일지 정기만 / 지지 전체 통근 | 일지 장간 | 같음 |
| 득세 정의 | 표층 다수 / 지장간 포함 다수 | 표층 | 같음 |
| 강약 규칙 세트 | 삼득 다수결 / 월령 우선 / (관점이 추가) | **없음 — 전부 실행** | `strengthReadings[]` |
| 용신 방법 | 억부 / 조후 / 통관(보류) | 전부 실행 | `method` |
| 야자시·진태양시 | 기존 옵션 | 기존 | 팩터는 **주 명식에만** 계산. `alternates` 명식의 팩터는 v1 제외(9단계에서 필요 여부 판단) |

## 6. 어휘 · 도메인 규칙

- 코어 필드·md·골든 비고에 쓰지 않는 말: 추천 · 권장 · 최적 · 길/흉 단정 · 반드시 · 좋은/나쁜 오행 · 부족하니 채워야. 쓰는 말: 후보 · 규칙 · 판독 · 근거 · 조건 발화.
- `note` 필드는 규칙 정체성만 적는다(예 「억부 규칙 `eokbu.weak-support`: 판독 `weak`에서 인성·비겁 오행을 후보로 나열」). 사람 대면 문장은 10·11단계(관점 md·L3)와 `saju-domain` 스킬 몫.
- 리포트 면책·confidence: 8단계는 리포트를 만들지 않는다. 9단계 API 블록에 `precision`(시각 미상)·`school` 라벨만 싣고, 사람 대면 고지는 11·13단계.

## 7. 9단계(API additive) 접점

- 8단계는 `saju-pillars-v1` 요청·응답을 **바꾸지 않는다**(LC 제약). 5~7단계는 같은 단계에서 `include` 블록을 붙였지만 8단계는 붙이지 않는다 — 9단계의 「선행 게이트 테스트」(골든 confirmed 여부로 블록 노출을 막는 테스트)와 같이 가야 하기 때문.
- 9단계 제안: `options.include`에 `strengthFactors` · `strengthReadings` · `yongsinCandidates` 3블록(따로 요청 가능). 선행 게이트 = `GOLDEN-STRENGTH-FACTORS` 전 행 confirmed가 아니면 `strengthFactors` 블록 테스트 실패 / 8b 블록은 응답에 `doctrine: "unreviewed"` 라벨을 싣는다(G2-3 전).
- 새 에러 코드 없음. `hiddenStemSchool: "japyeong"`에서 사령은 `null` + `saryeongUnavailable: "no-day-counts"`.
- baby: 소비 필드 불변(`supplementPriority` 그대로). `yongsinCandidates`를 읽지 않는다(회의 B-1).
- 11단계 L3 계약(`saju-insight-v1`)은 후보 id(`candidateId`·`ruleSetId`·`definitionId`)를 evidence로 인용한다 — 8단계 id 체계를 그 입력으로 설계했다.

## 8. 완료 조건 (8단계, 제안)

| # | 조건 | 층 |
| --- | --- | --- |
| C1 | `docs/rules/STRENGTH.md`(팩터 정의 + 대안 행 + 규칙 세트 2) · `docs/rules/YONGSIN-CANDIDATES.md`(억부·조후) md 정본 ↔ 코드 데이터 동일성 파서 테스트 | 8a·8b |
| C2 | `l2/strength-factors.ts` · `l2/strength-readings.ts` · `l2/yongsin-candidates.ts` 순수 함수, 공개 계약 diff 0, `index.ts` 추가 export만 | 8a·8b |
| C3 | 골든 3표 50명식 생성. 팩터 표 = LC 재계산 뒤 confirmed. 판독·후보 표 = `실행` confirmed · `학설` unreviewed | 8a·8b |
| C4 | 학파 선택 항목(§5) md 명시 + `japyeong` 차분 셀 수를 md에서 유도해 고정 | 8a |
| C5 | 어휘 가드 테스트: 규칙 md·골든·코드 문자열에 §6 금지어 0 | 8b |
| C6 | 9단계 접점 문서(§7)를 `SAJU_PILLARS_API_V1.md` 예정 절로 초안 | — |
| C7 | G3: verify exit 0 · verifier PASS · REPORT에 「테스트가 실행한 분기」 표 · LC 판정 | 전부 |
| C8 | 교차 구현: lunar-typescript는 강약·용신을 제공하지 않는다 → 차분 대상 아님(CROSS-IMPL-DIFF §6 한계에 추기) | — |

**단계 분할 제안:** 8a(C1 일부·C2 일부·C3 팩터 표·C4) → 8b(나머지). 8a 공수 1일, 8b 1일(로드맵 8단계 2일과 같음).

## 9. 리스크

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| 득령·득지·득세 정의가 교재마다 다름 | 골든이 한 정의에 묶임 | `definitionId` + 대안 행. 정의를 바꾸면 id가 바뀌고 골든 재생성 |
| 사령 경계 ±1일 | 시각 미상·절입 근처에서 사령 갈림 | `nearThreshold`·`precision` 필드, 골든에 경계 사례 |
| 판독 세트가 관점과 어긋남 | 관점 문장이 틀린 세트 인용 | 10단계 관점 md가 세트 id를 명시 인용, 파서 검증 |
| 「후보」가 사실상 추천으로 읽힘 | 도메인 불변 규칙 위반 | 순위 필드 금지 · 금지어 테스트 · UI 고지는 13단계 |
| G2-3 미결 지속 | 8b 학설 축이 계속 unreviewed | 두 축 설계로 상한과 분리. 9단계 블록에 `doctrine` 라벨 |
| baby 쪽 「보완 오행 = 용신」 용어 오류 | 작명 앱에서 용어 혼동 | 8단계 범위 밖 — baby U-2 학파 결정 1건으로 LC 전달 |

## 10. LC에 묻는 것 / LC 판단 중 틀렸다고 보는 것

1. §1-1: 「코어가 강약을 판정」은 회의 확정(A2-4)과 충돌한다고 본다. 세트별 판독 병렬 반환으로 바꾸는 데 동의하는가.
2. §1-2: 골든 「pending 생성」을 두 축(실행·학설)으로 바꾸는 데 동의하는가.
3. §1-3: 8a를 G2-3과 분리해 착수 허용할지 — 사용자 결정 사항으로 올려 달라.
4. §1-4: 회의 A2-4의 「지장간 가중 분포」 문구는 §2-1 「가중 산식 없음」과 모순이다. 가중 없는 층별 개수로 정리하는 데 동의하는가.
