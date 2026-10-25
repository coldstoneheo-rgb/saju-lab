# 격국 취격(取格) — 정본

`packages/saju-core/src/l2/gyeokguk.ts`의 상수는 이 문서의 표와 같아야 하며 `l2/gyeokguk.test.ts`가 md를 직접 파싱해 동일성을 강제한다(열 이름 매핑). 설계 = `docs/design/gyeokguk-design.md`.

- **취격만 한다.** 월지와 그 장간이 천간에 투출됐는지를 보고 「어느 십신의 격으로 읽는가」를 표로 조회한다. 성격·파격(成敗)·상신(相神)·외격(종격·화격·일행득기)은 v1에서 제외한다.
- **입력 = 8a 팩터만**(`docs/rules/STRENGTH.md`): 일간 · 월지 장간(`layers.hiddenStems`, pillar = month) · 일간 밖 천간(`layers.stems`) · 사령(`saryeong`·`saryeongUnavailable`) · 월지충(`monthBranchClashed.value`). 8b 판독·용신 후보는 읽지 않는다.
- **기본 세트는 없다.** 세 세트를 전부 실행해 `ruleSetId` 순으로 나란히 돌려준다. 어느 세트를 인용할지는 관점층이 고른다.
- 세트마다 조건 행을 `순서`대로 평가하고 **첫 일치**에서 멈춘다.
- **투출** = 월지 장간과 같은 천간이 연·월·시 천간에 있다. 일간은 격의 주체라 투출 위치에서 뺀다. 시각 미상이면 시간이 없어 시간 투출도 없다(`precision: "time-unknown"`을 복사).
- **비겁 장간은 투출 판정에서 뺀다.** 월지 중기·여기가 일간의 비견·겁재이면 투출돼도 격 후보가 아니다.
- **월지 비겁 판정**에 쓰는 월지는 월지 장간 목록(학파별 지장간 표)에서 되찾는다. 12지의 장간 목록은 학파마다 서로 다르다(테스트가 확인).
- 레코드마다 `doctrine: "unreviewed"`를 싣는다. 이 표의 명리학적 타당성은 G2-3(실제 역술가 대조) 전에는 검토되지 않았다.
- **출력 레코드** = `{ruleSetId, candidates[{gyeok, stem, role, exposedIn}], ambiguous, unavailable?, firedConditions[1], monthBranchClashed, agreesAcrossSets, school, precision, doctrine}` — 설계 §3 + `firedConditions`(8b-1과 같은 첫 일치 조건 id, 설계 §3에 더한 필드). `candidates` 순서 = 정기 → 중기 → 여기(자리 순), 순위 아님. `monthBranchClashed`는 표시용 복사이고 판정에 쓰지 않는다.
- **세트 간 일치 `agreesAcrossSets`** = `unavailable`이 없는 세트들의 `candidates` 격 집합이 모두 같다(비교 대상이 1개 이하면 true). 레코드마다 같은 값.

## 표 1 — 월지 비겁 표 (세 세트 공통)

| 격 | 일간 | 월지 | 비고 |
| --- | --- | --- | --- |
| geonrok | gap | in | 록 |
| geonrok | eul | myo | 록 |
| geonrok | byeong | sa | 록 |
| geonrok | jeong | o | 록 |
| geonrok | mu | sa | 록 — 巳 정기 丙은 戊에게 편인이지만 록 표가 이긴다 |
| geonrok | gi | o | 록 — 午 정기 丁은 己에게 편인 |
| geonrok | gyeong | sin | 록 |
| geonrok | sin | yu | 록 |
| geonrok | im | hae | 록 |
| geonrok | gye | ja | 록 |
| yangin | gap | myo | 양인(양간만) |
| yangin | byeong | o | 양인 |
| yangin | mu | o | 양인 — 午 정기 丁은 戊에게 정인 |
| yangin | gyeong | yu | 양인 |
| yangin | im | ja | 양인 |
| wolgeop | eul | in | 월겁 — 음간, 월지 정기가 겁재 |
| wolgeop | jeong | sa | 월겁 |
| wolgeop | sin | sin | 월겁 — 辛 일간 申월 |
| wolgeop | gye | hae | 월겁 |

- 월겁은 「음간 일간의 월지 정기가 겁재」다. 己 일간의 辰·戌월(정기 戊 = 겁재)은 토 일간 고지(辰戌丑未) 처리를 따라 이 표에 넣지 않는다(설계 §2 「토 일간 고지 월지」). 그래서 이 표 밖의 정기 비겁 월지는 戊·己 일간의 辰·戌·丑·未월뿐이다.
- `candidates`는 1개 = `{gyeok, stem: 월지 정기, role: "primary", exposedIn}`.

## 표 2 — 조건 토큰

| 토큰 | 뜻 |
| --- | --- |
| bigyeop-table | 일간·월지가 표 1의 한 행 |
| primary-exposed&!primary-bigyeop | 월지 정기가 투출했고 정기가 비겁이 아니다 |
| one-other-exposed | 비겁이 아닌 중기·여기 중 정확히 1개가 투출 |
| two-others-exposed | 비겁이 아닌 중기·여기 둘 다 투출 |
| primary-bigyeop | 월지 정기가 일간의 비견·겁재 |
| saryeong-unavailable | 8a 사령이 없다(`no-day-counts` · `month-term-mismatch`) |
| saryeong-bigyeop | 사령 천간이 일간의 비견·겁재 |
| else | 앞 조건이 모두 거짓 |

## 표 3 — 결과 토큰

| 토큰 | candidates | ambiguous | unavailable |
| --- | --- | --- | --- |
| table | 표 1의 격 1개(월지 정기) | false | - |
| primary | 월지 정기 십신 격 1개 | false | - |
| other-exposed | 투출한 중기 또는 여기 1개 | false | - |
| others-exposed | 투출한 중기·여기 2개(정기 → 중기 → 여기 순) | true | - |
| saryeong | 사령 천간 십신 격 1개 | false | - |
| none-bigyeop | 0개 | false | bigyeop-month |
| none-saryeong | 0개 | false | 8a `saryeongUnavailable` 그대로 |

## 표 4 — 규칙 세트

| ruleSetId | 순서 | conditionId | 조건 | 결과 |
| --- | --- | --- | --- | --- |
| gyeokguk.exposed-first | 1 | exposed-first.bigyeop-table | bigyeop-table | table |
| gyeokguk.exposed-first | 2 | exposed-first.primary-exposed | primary-exposed&!primary-bigyeop | primary |
| gyeokguk.exposed-first | 3 | exposed-first.one-other-exposed | one-other-exposed | other-exposed |
| gyeokguk.exposed-first | 4 | exposed-first.two-others-exposed | two-others-exposed | others-exposed |
| gyeokguk.exposed-first | 5 | exposed-first.bigyeop-month | primary-bigyeop | none-bigyeop |
| gyeokguk.exposed-first | 6 | exposed-first.otherwise | else | primary |
| gyeokguk.primary-only | 1 | primary-only.bigyeop-table | bigyeop-table | table |
| gyeokguk.primary-only | 2 | primary-only.bigyeop-month | primary-bigyeop | none-bigyeop |
| gyeokguk.primary-only | 3 | primary-only.otherwise | else | primary |
| gyeokguk.saryeong | 1 | saryeong.unavailable | saryeong-unavailable | none-saryeong |
| gyeokguk.saryeong | 2 | saryeong.bigyeop-table | bigyeop-table | table |
| gyeokguk.saryeong | 3 | saryeong.bigyeop | saryeong-bigyeop | none-bigyeop |
| gyeokguk.saryeong | 4 | saryeong.otherwise | else | saryeong |

- 정격 8격 id = 십신 id 그대로: jeonggwan · pyeongwan · jeongjae · pyeonjae · siksin · sanggwan · jeongin · pyeonin.
- 사령 세트는 사령이 있어야 실행된다. `japyeong`(일수 없음)은 항상 `no-day-counts`다 — 표 1에 해당해도 1행이 먼저다.

## 표 5 — 세트 출처와 학설 상태

| ruleSetId | 관점 | doctrine |
| --- | --- | --- |
| gyeokguk.exposed-first | 투출 우선(『자평진전』 논용신): 정기 투출 → 정기, 아니면 투출한 중기·여기, 아무것도 없으면 정기 | unreviewed |
| gyeokguk.primary-only | 정기 고정(통용 교재 단순형): 투출과 무관하게 월지 정기 | unreviewed |
| gyeokguk.saryeong | 사령 우선(『연해자평』 월률분야): 출생 시점 사령 천간 | unreviewed |

## 갈림 기록 (채택안을 정하지 않고 병기, 전부 `unreviewed`)

| 항목 | 이 표의 처리 | 다른 입장 |
| --- | --- | --- |
| 중기·여기 둘 다 투출 | 둘 다 후보 + `ambiguous` | 힘이 큰 쪽 하나(교재마다 기준이 다름) |
| 음간 양인 | 양간만 양인, 음간은 월겁 | 음간 양인 인정 |
| 건록·양인·월겁 | 별도 격 id | 정격 8격만 두고 다른 기둥에서 격을 다시 찾음 |
| 토 일간 고지 월지 | 투출 우선 세트는 잡기 취격, 나머지는 후보 0 | 비겁격으로 표기 |
| 외격 | v1 제외 | 종격·화격·일행득기 포함 |
| 사령 세트의 록·양인 | 사령이 있으면 표 1이 먼저 | 사령 천간 그대로 |

## 쓰지 않는 말

코어 필드 · 이 문서 · 테스트 문자열에 추천 · 권장 · 최적 · 길흉 단정 · 반드시 · 성격 · 파격 · 귀격 · 천격 · 좋은/나쁜 격을 쓰지 않는다. 취격 결과는 사람 대면 문장이 아니다.
