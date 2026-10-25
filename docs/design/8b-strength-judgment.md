# DESIGN — 8b 강약 판독(8b-1)과 용신 후보 연결(8b-2)

- **상태: 초안 → LC 게이트 대상.** 저자 = saju-lab 워커(Claude Opus 5.5), 2026-10-25. 발주 = LC `HO-2026-1025-saju-8b-design-01` 완료 조건 2.
- **상위 설계:** `docs/DESIGN-2026-09-saju-L2-stage8.md` §3·§4·§7(LC 채택 2026-09-23). 이 문서는 그 §3-1을 구현 가능한 규칙표로 내리고 §3-2의 연결 인터페이스를 고정한다. 상위 설계와 충돌하면 상위 설계가 이긴다.
- **이미 결정된 것(다시 묻지 않음):** E1-1 분리(8b 실행 축을 역술가 대조 G2-3과 분리, `doctrine: unreviewed` 병기) · 순서 안A(8b → 격국 → 신살) · include-only(기본 응답 바이트 불변) · 단일 학파 단정 0.
- **반박 가능:** 규칙 세트 수 · 조건 토큰 · 픽스처 수 · 골든 분기.

## 0. 요약

8b-1은 8a 팩터(`StrengthFactors`)를 받아 **이름 붙은 규칙 세트 2개를 전부 실행**하고, 세트마다 판독 1건을 돌려준다. 기본 세트는 없다. 판독은 `strong` · `weak` · `indeterminate` 중 하나와, 발화한 조건 id, 그 조건이 읽은 입력 스냅샷이다. 점수·가중치·순위는 없다. 레코드마다 `doctrine: "unreviewed"`가 붙는다. 실행 축(규칙표대로 계산했는가)은 골든으로 닫고, 학설 축(그 표가 명리학적으로 맞는가)은 G2-3 전까지 열려 있다. 8b-1은 공개 API에 붙지 않는다(9단계).

## 1. 입력 — 8a 요소

| 판독 입력 | 8a 원천 필드 | 정의 id | 학파 영향 | 시각 미상 |
| --- | --- | --- | --- | --- |
| `deukryeong` | `factors.deukryeong.value` | `deukryeong.primary-support` | 없음 | 무관 |
| `deukji` | `factors.deukji.value` | `deukji.day-branch-support` | 있음 | 무관 |
| `deukse` | `factors.deukse.value` | `deukse.surface-majority-ge` | 없음 | 기둥 3으로 셈 |
| `monthBranchClashed` | `factors.monthBranchClashed.value` | (합충표 `chung.*`) | 없음 | 시지 충이 빠짐 |
| `triadCount` | 위 셋 중 참의 개수(0~3) | — | 득지 경유 | 득세 경유 |

판독은 이 다섯 값만 읽는다. 십신 개수·사령·조후·化 재료는 8b-1이 읽지 않는다(8b-2·격국 몫).

## 2. 출력 — `StrengthReading`

```ts
type StrengthVerdict = "strong" | "weak" | "indeterminate";

interface StrengthReading {
  ruleSetId: "strength.triad-majority" | "strength.month-first";
  verdict: StrengthVerdict;
  /** 첫 일치 조건 1개. 규칙표 순서대로 평가한다. */
  firedConditions: [string];
  /** 판독이 읽은 입력 스냅샷 + 각 불리언의 definitionId. */
  inputs: { deukryeong: boolean; deukji: boolean; deukse: boolean; monthBranchClashed: boolean; triadCount: number };
  definitionIds: { deukryeong: string; deukji: string; deukse: string };
  school: HiddenStemSchool;        // 8a에서 복사
  precision: StrengthPrecision;    // 8a에서 복사 — "time-unknown"이면 소비 측 confidence를 낮춘다
  doctrine: "unreviewed";          // G2-3 ⓐ 기록 전까지 고정
}

function strengthReadingsOf(factors: StrengthFactors): StrengthReading[]; // 규칙 세트 id 순, 항상 2건
```

- **점수 아님:** `triadCount`는 입력 스냅샷이고 출력 등급이 아니다. `score`·`rank`·`primary` 필드를 두지 않는다.
- **`balanced` 없음:** v1 세트 둘 다 `balanced`를 내지 않는다. 낼 세트가 생기면 열거값을 추가한다(additive).
- **시각 미상:** 판독은 그대로 계산하고 `precision`만 복사한다. 득세가 기둥 3으로 세어져 뒤집힐 수 있다는 점은 소비 측(9·11단계) 고지 몫이다. 판독을 `indeterminate`로 바꾸지 않는다 — 그건 학설 결정이다.
- 순서 = `ruleSetId` 사전순. 순위가 아니다.
- **상위 설계 §3-1과의 의도적 차이:** 상위의 `factorRefs[]` 대신 `inputs`(값 스냅샷)·`definitionIds`를 싣는다 — 참조만으로는 재계산 시 값을 다시 찾아야 해서다. `firedConditions`는 첫 일치 평가라 항상 1개다(배열 형태는 상위와 같다). 상위 설계 §3-1의 출력 줄은 이 문서로 대체된다.

## 3. 판정 규칙표 (정본 = `docs/rules/STRENGTH-READINGS.md`)

세트마다 조건 행을 **위에서부터** 평가하고 첫 일치에서 멈춘다. 조건은 아래 토큰 중 하나다(산식·가중 금지 — 불리언과 개수 비교만).

| 토큰 | 뜻 |
| --- | --- |
| `triadCount>=2` | 득령·득지·득세 중 참이 2개 이상 |
| `triadCount<=1` | 참이 1개 이하 |
| `monthBranchClashed` | 월지가 충 당사자 |
| `deukryeong` | 득령 참 |
| `deukji&deukse` | 득지와 득세가 모두 참 |
| `else` | 앞 조건이 모두 거짓 |

| ruleSetId | 순서 | conditionId | 조건 | verdict |
| --- | --- | --- | --- | --- |
| strength.month-first | 1 | month-first.month-clashed | monthBranchClashed | indeterminate |
| strength.month-first | 2 | month-first.deukryeong | deukryeong | strong |
| strength.month-first | 3 | month-first.ji-and-se | deukji&deukse | strong |
| strength.month-first | 4 | month-first.otherwise | else | weak |
| strength.triad-majority | 1 | triad-majority.two-or-more | triadCount>=2 | strong |
| strength.triad-majority | 2 | triad-majority.one-or-less | triadCount<=1 | weak |

**골든 50 기대 분포(8a REPORT §2 셀 + 월지충 열에서 손으로 유도, 8b-1 테스트가 고정):**

| 세트 | strong | weak | indeterminate |
| --- | --- | --- | --- |
| strength.triad-majority | 29 | 21 | 0 |
| strength.month-first | 29 | 12 | 9 |

두 세트가 다른 판독을 내는 행은 10행이다. 월지충 9행(month-first = `indeterminate`)과 g-2013-05-22-0530(득령만 참, 충 없음: triad = `weak`, month-first = `strong`)이다. 이 갈림이 세트를 나란히 돌려주는 이유다.

## 4. 학파 선택표

| 관점 | 강약 판단 방식 | v1 세트 | 채택 | doctrine |
| --- | --- | --- | --- | --- |
| 삼득(三得) 다수결 | 득령·득지·득세 중 둘 이상이면 신강 | `strength.triad-majority` | **실행**(기본 아님) | unreviewed |
| 월령 우선(자평 계열) | 월령이 일간을 돕는지를 먼저 보고, 월령을 못 얻으면 나머지가 모두 도와야 신강. 월령이 충으로 흔들리면 판단 유보 | `strength.month-first` | **실행**(기본 아님) | unreviewed |
| 통근·투간 종합(적천수 계열) | 뿌리 깊이·투출·세력을 종합 | 없음 | 미채택 — 가중 산식이 필요해 8a/8b 원칙(산식 0)과 충돌 | — |
| 점수제(현대 교재) | 자리별 점수 합으로 신강/신약 | 없음 | 미채택 — 점수 산식 금지(회의 A2-4) | — |
| 종격·화격 판단 | 극단 편중·化 성립 시 강약 판단 대체 | 없음 | 격국 설계서 몫(`docs/design/gyeokguk-design.md`) | — |

- **기본 세트를 정하지 않는다.** 어느 세트를 인용할지는 관점층(10단계 md)이 고른다. 단일 학파 단정 0.
- **채택안을 못 정한 항목:** 월지충을 `indeterminate`로 둘지(월령 우선 세트) — 교재마다 「충이 있어도 월령은 월령」이라는 입장이 있다. 세트 정의에 박아 두고 `unreviewed`로 둔다. 사용자 확인 목록(REPORT §LC·사용자)에 적재한다.

## 5. 실행/학설 2축 필드

| 축 | 어디에 | 값 | 닫는 경로 | pending 상한 |
| --- | --- | --- | --- | --- |
| 실행 `execution` | 골든 READINGS 표 `실행` 열 | `pending` → `confirmed` | LC 독립 재계산(규칙 md + 8a 골든 셀만) | 20%(#81 C) 적용 |
| 학설 `doctrine` | 판독 레코드 필드 + 골든 `학설` 열 | `unreviewed` → `reviewed` | G2-3 ⓐ 실제 역술가 기록 문서가 출처일 때만. 페르소나 라운드 문서 불가 | 미적용 |

- 레코드에는 `doctrine`만 싣는다. `execution`은 골든 표의 상태라 런타임 값이 아니다.
- **골든 분기(완료 조건 3):** 8a 골든이 50/50 `pending`(실측 2026-10-25, confirmed 0)이라 8b-1 골든 표 `GOLDEN-STRENGTH-READINGS.md`는 **보류**한다. 8a 셀 자체가 확정되지 않았는데 그 위에 판독 골든을 쌓으면 상한 예외를 한 겹 더 만든다. 대신 8b-1 테스트가 8a 골든 md 셀(득령·득지·득세·월지충 열)을 읽어 규칙표를 적용한 기대값과 코어를 대조한다. 8a가 confirmed가 되면 같은 유도로 READINGS 표를 `실행: pending`으로 생성한다.

## 6. 8b-2 용신 후보 연결 인터페이스 (구현은 다음 회차)

```ts
interface YongsinCandidate {
  candidateId: string;              // `${method}.${ruleId}.${element}`
  element: FiveElement;
  method: "eokbu" | "johu";
  ruleId: string;                   // docs/rules/YONGSIN-CANDIDATES.md 행 id
  basis: { readingRef?: { ruleSetId: string; verdict: StrengthVerdict }; factorRefs: string[] };
  /** 규칙 정체성만 적는다(상위 §6). 사람 대면 문장 아님. */
  note: string;
  doctrine: "unreviewed";
}

function yongsinCandidatesOf(factors: StrengthFactors, readings: StrengthReading[]): YongsinCandidate[];
```

| 연결 | 규칙(상위 설계 §3-2) |
| --- | --- |
| 억부 ← 판독 | 판독마다 따로. `strong` → 식상·재성·관성 오행 / `weak` → 인성·비겁 오행 / `indeterminate` → 후보 0 + 사유. 세트 2개면 묶음 2개, 같은 오행도 합치지 않는다 |
| 조후 ← `climate.season` | `winter` → 火 · `summer` → 水 · 봄·가을 → 0. 판독과 무관 |
| 순서 | `method` → `ruleId` → 오행 고정 순(木火土金水). 순위 아님 |

- 8b-2는 `StrengthReading`의 `ruleSetId`·`verdict`만 읽는다. 8b-1 출력에 필드를 더해도 8b-2 계약은 깨지지 않는다.
- baby `supplementPriority`는 바뀌지 않는다(회의 B-1). baby는 `yongsinCandidates`를 읽지 않는다.

## 7. 공개 계약 · baby 공급

- `strengthReadingsOf`는 `@saju-lab/saju-core` 패키지 export에만 추가한다. `saju-pillars-v1` 요청·응답은 바뀌지 않는다.
- `options.include`에 `strengthReadings`를 **아직 열지 않는다** — 넣으면 `INVALID_OPTIONS`(9단계에서 선행 게이트와 함께 연다).
- include-only 규칙 문서화와 기본 응답 바이트 고정 테스트는 8b-1 PR에 넣는다(완료 조건 5).

## 8. 8b-1 테스트 계획

| # | 테스트 | 판정 |
| --- | --- | --- |
| T1 | `STRENGTH-READINGS.md` 규칙표 ↔ 코드 상수 동일(열 이름 매핑 파서) | 행·순서·토큰·verdict 전부 |
| T2 | 합성 픽스처: 득령·득지·득세 8조합 × 월지충 2 = 16, 세트 2개 → 판독 32건 | 기대값은 표에서 손으로 적음(코드 미참조) |
| T3 | 경계: triadCount 1↔2, 충 우선순위(충+삼득 전부 참 → month-first `indeterminate`), 득세 동률(support==other → 득세 참 → 판독 반영) 실명식 | 개별 기대값 |
| T4 | 실명식 픽스처 ≥6: g-2013-05-22-0530(세트 갈림) · 충 1행 · YYY · NNN · 시각 미상 1행(`precision`) · `japyeong` 1행(득지 차분 행) | 개별 기대값 |
| T5 | 골든 50: 8a md 셀에서 유도한 기대 판독 = 코어. 분포 §3 표 고정 | 행 전부 |
| T6 | 어휘 가드: 규칙 md·코드 문자열에 금지어 0(추천·권장·최적·반드시 등) | 0건 |
| T7 | 계약: 기본 응답 바이트 스냅샷 고정 · `include: ["strengthReadings"]` → `INVALID_OPTIONS` · 응답에 `strength` 키 0 | 바이트 동일 |

픽스처 합계 = 합성 16 + 경계·실명식 ≥6 = **≥22**(완료 조건 3의 ≥20 충족).
