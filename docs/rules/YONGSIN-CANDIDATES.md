# 용신 후보(8b-2) — 정본

`packages/saju-core/src/l2/yongsin-candidates.ts`의 규칙 상수는 이 문서의 표와 같아야 하며 `l2/yongsin-candidates.test.ts`가 md를 직접 파싱해 동일성을 강제한다(열 이름 매핑). 설계 = `docs/design/8b-strength-judgment.md` §6, 상위 설계 = `docs/DESIGN-2026-09-saju-L2-stage8.md` §3-2.

- **후보는 규칙 실행 결과다.** 입력 = 8a 팩터의 일간(`dayMaster`)·계절(`climate.season`)과 8b-1 판독(`docs/rules/STRENGTH-READINGS.md`)의 `ruleSetId`·`verdict`. 판독의 다른 필드는 읽지 않는다. 점수·가중·순위는 없다.
- **용신을 하나로 정하지 않는다.** 억부·조후 두 방법의 후보를 전부 나란히 돌려준다. 어느 후보를 인용할지는 관점층이 고른다.
- **억부는 판독마다 따로** 낸다. 판독 세트가 2개면 묶음이 2개이고, 같은 오행이 두 묶음에 나와도 합치지 않는다.
- **조후는 판독과 무관**하다(계절만 읽는다).
- 레코드마다 `doctrine: "unreviewed"`를 싣는다. 이 표의 명리학적 타당성은 G2-3(실제 역술가 대조) 전에는 검토되지 않았다.
- **출력 레코드** = `{candidateId, element, method, ruleId, basis: {readingRef?, factorRefs}, note, doctrine}` — 필드 정의는 설계 §6.
- **`candidateId`** = `${method}.${ruleId}.${element}`(설계 §6). 억부는 판독 세트마다 같은 id가 나오므로 `@${ruleSetId}`를 덧붙여 응답 안에서 유일하게 한다(설계 §6과의 의도적 차이, 「합치지 않는다」를 id까지 지킨다).
- **순서** = `method` → `ruleId`(문자열 순) → 오행 고정 순(木火土金水) → 판독 `ruleSetId`. 순위가 아니다.
- 시각 미상은 이 단계에서 따로 다루지 않는다. 판독이 시각 미상 팩터로 계산됐다는 사실은 판독의 `precision`에 있고, 소비 측(9·11단계)이 함께 고지한다.

## 표 1 — 억부(抑扶) 규칙

`step` = 일간 오행에서 상생 순환(木→火→土→金→水→木)으로 몇 칸 뒤인가. 0 비겁 · 1 식상 · 2 재성 · 3 관성 · 4 인성.

| ruleId | verdict | 십신 묶음 | step | 비고 |
| --- | --- | --- | --- | --- |
| strong.siksang | strong | 식상 | 1 | 일간이 생하는 오행 |
| strong.jaeseong | strong | 재성 | 2 | 일간이 극하는 오행 |
| strong.gwanseong | strong | 관성 | 3 | 일간을 극하는 오행 |
| weak.inseong | weak | 인성 | 4 | 일간을 생하는 오행 |
| weak.bigyeop | weak | 비겁 | 0 | 일간과 같은 오행 |
| indeterminate | indeterminate | - | - | 후보 0 — 판독이 유보돼 억부 방향이 없다 |

## 표 2 — 조후(調候) 규칙

| ruleId | 계절 | 오행 | 비고 |
| --- | --- | --- | --- |
| winter | winter | fire | 겨울(亥子丑월) |
| summer | summer | water | 여름(巳午未월) |
| spring | spring | - | 후보 0 |
| autumn | autumn | - | 후보 0 |

계절 = 8a `climate.season`(월지 기준, `docs/rules/STRENGTH.md`). 원국의 火·水 개수(`climate.fire`·`climate.water`)는 읽지 않는다.

## 표 3 — 방법 출처와 학설 상태

| method | 관점 | doctrine |
| --- | --- | --- |
| eokbu | 억부: 강하면 덜어 내는 쪽(식상·재성·관성), 약하면 돕는 쪽(인성·비겁)의 오행 | unreviewed |
| johu | 조후: 한랭한 겨울은 火, 조열한 여름은 水 | unreviewed |

## 갈림 기록 (채택안을 정하지 않고 병기, 전부 `unreviewed`)

| 항목 | 이 표의 처리 | 다른 입장 |
| --- | --- | --- |
| 신강 억부 묶음 | 식상·재성·관성 셋 다 후보 | 관성 우선 · 재성 우선 · 식상 우선 등 교재마다 하나를 앞세움 |
| 신약 억부 묶음 | 인성·비겁 둘 다 후보 | 인성만 · 비겁만 |
| 조후 계절 경계 | 월지 계절 3개월 전부 | 子·午 등 한겨울·한여름 월만, 또는 원국 火·水 개수로 조후 필요 여부를 판단 |
| 억부 vs 조후 | 둘 다 실행, 순서는 정렬일 뿐 | 조후 우선(궁통보감 계열) · 억부 우선 |
| 판독 세트 갈림 | 세트별 묶음을 따로 냄 | 한 세트만 채택 |

## 쓰지 않는 말

코어 필드 · 이 문서 · 테스트 문자열에 추천 · 권장 · 최적 · 길흉 단정 · 반드시 · 좋은/나쁜 오행 · 「부족하니 채워야」를 쓰지 않는다. 후보는 사람 대면 문장이 아니다.
