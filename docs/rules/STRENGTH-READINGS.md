# 일간 강약 판독(8b-1) — 정본

`packages/saju-core/src/l2/strength-readings.ts`의 규칙 세트 상수는 이 문서의 표와 같아야 하며 `l2/strength-readings.test.ts`가 md를 직접 파싱해 동일성을 강제한다(열 이름 매핑). 설계 = `docs/design/8b-strength-judgment.md`, 상위 설계 = `docs/DESIGN-2026-09-saju-L2-stage8.md` §3-1.

- **판독은 규칙 실행 결과다.** 입력 = 8a 팩터(`docs/rules/STRENGTH.md`)의 득령·득지·득세·월지충 불리언과 득령·득지·득세 중 참의 개수(`triadCount`). 점수·가중 산식·순위는 없다.
- **기본 세트는 없다.** 코어는 아래 세트를 전부 실행해 `ruleSetId` 순으로 나란히 돌려준다. 어느 세트를 인용할지는 관점층이 고른다.
- 세트마다 조건 행을 `순서`대로 평가하고 **첫 일치**에서 멈춘다. 결과 = `verdict`(`strong` · `weak` · `indeterminate`) + 발화 조건 id.
- 레코드마다 `doctrine: "unreviewed"`를 싣는다. 이 표의 명리학적 타당성은 G2-3(실제 역술가 대조) 전에는 검토되지 않았다.
- 시각 미상이면 판독은 그대로 계산하고 8a의 `precision: "time-unknown"`을 복사한다(득세가 기둥 3으로 세어진다).

## 표 1 — 조건 토큰

| 토큰 | 뜻 |
| --- | --- |
| triadCount>=2 | 득령·득지·득세 중 참이 2개 이상 |
| triadCount<=1 | 참이 1개 이하 |
| monthBranchClashed | 월지가 충 당사자 |
| deukryeong | 득령 참 |
| deukji&deukse | 득지와 득세가 모두 참 |
| else | 앞 조건이 모두 거짓 |

## 표 2 — 규칙 세트

| ruleSetId | 순서 | conditionId | 조건 | verdict |
| --- | --- | --- | --- | --- |
| strength.month-first | 1 | month-first.month-clashed | monthBranchClashed | indeterminate |
| strength.month-first | 2 | month-first.deukryeong | deukryeong | strong |
| strength.month-first | 3 | month-first.ji-and-se | deukji&deukse | strong |
| strength.month-first | 4 | month-first.otherwise | else | weak |
| strength.triad-majority | 1 | triad-majority.two-or-more | triadCount>=2 | strong |
| strength.triad-majority | 2 | triad-majority.one-or-less | triadCount<=1 | weak |

## 표 3 — 세트 출처와 학설 상태

| ruleSetId | 관점 | doctrine |
| --- | --- | --- |
| strength.month-first | 월령 우선(자평 계열): 월령을 먼저 보고, 월령이 충으로 흔들리면 판단을 유보한다 | unreviewed |
| strength.triad-majority | 삼득 다수결(통용 교재): 득령·득지·득세 중 둘 이상 | unreviewed |

**갈림 기록:** 월지충을 `indeterminate`로 두는 것은 월령 우선 세트의 정의다. 「충이 있어도 월령은 월령」으로 보는 입장도 있다 — 채택안을 정하지 않고 `unreviewed`로 둔다.

## 학파 차분 (골든 50 실측 2026-10-25)

지장간 학파를 `japyeong`으로 바꾸면 득지가 8행에서 바뀌고(`STRENGTH.md` 차분 표), 그중 판독이 바뀌는 행은 아래 1행이다.

| id | yeonhae | japyeong | 원인 |
| --- | --- | --- | --- |
| g-1923-10-05-0840 | triad strong · month-first strong | triad **weak** · month-first strong | 辛亥일 — yeonhae 亥 여기 戊(정인) → 득지 Y / japyeong 亥 = 甲·壬 → 득지 N |

## 쓰지 않는 말

코어 필드 · 이 문서 · 테스트 문자열에 추천 · 권장 · 최적 · 길흉 단정 · 반드시 · 좋은/나쁜 오행 · 「부족하니 채워야」를 쓰지 않는다. 판독은 사람 대면 문장이 아니다.
