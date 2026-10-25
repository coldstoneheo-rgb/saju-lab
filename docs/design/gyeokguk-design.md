# DESIGN — L2 격국(格局) 취격 (설계만, 코드 0)

- **구현(2026-10-26, HO-2026-1026):** K1·K2·K4·K5 = `docs/rules/GEOKGUK.md` · `l2/gyeokguk.ts`. 설계 §3에 `firedConditions`를 더했고(8b-1과 같은 첫 일치 id), 월겁은 고지(辰戌丑未) 월지를 빼 「음간 + 정기 겁재 + 고지 밖」 4행으로 고정했다(§2 토 고지 규칙과의 충돌 해소). 사령 세트는 사령 unavailable이 월지 비겁 표보다 먼저다. 월지 중기·여기가 일간의 비견·겁재이면 투출해도 격 후보에서 뺀다(예: 甲 亥월 중기 甲).
- **상태: 초안 → LC 게이트 대상.** 저자 = saju-lab 워커(Claude Opus 5.5), 2026-10-25. 발주 = LC `HO-2026-1025-saju-8b-design-01` 완료 조건 4. 회의 `life-coordinator/docs/meetings/MEETING-2026-1003-saju-lab.md` E2·E3·Q1의 «설계서에서 확정» 항목을 이 문서가 받는다.
- **순서:** 안A(8b → **격국** → 신살, PLAN-2026-1003 §4 LC 판단 ②). 코드 착수는 8b-1 머지 뒤 별도 HO.
- **반박 가능:** 취격 세트 수 · 외격 범위 · 건록/양인 처리 · 골든 보강 명식 수.

## 0. 요약

격국 코어는 **취격(取格)만** 한다. 취격 = 월지와 그 장간이 천간에 투출됐는지를 보고 「어느 십신의 격으로 읽는가」를 정하는 표 조회다. 8a의 `layers`·`exposed`·`saryeong`·`deukryeong.tenGod`로 전부 계산되고 새 외부 데이터는 0이다. 학파마다 취격 순서가 달라서 강약과 같이 **이름 붙은 세트를 전부 실행**해 나란히 돌려준다. **성격·파격(成敗)·상신(相神)과 외격(종격·화격 등)은 v1에서 제외한다.** 이것들은 판단이 들어가서 결정론 사실이라 부를 수 없다.

## 1. 입력과 8b 출력 의존 관계

| 격국 입력 | 원천 | 비고 |
| --- | --- | --- |
| 월지 · 월지 장간(여기·중기·정기) | 8a `layers.hiddenStems`(pillar = month) | 학파 영향 있음 |
| 월지 장간의 투출 위치 | 8a `exposed` | 일간에 투출된 것은 제외(일간은 격의 주체) |
| 사령 천간 | 8a `saryeong.stem` | `yeonhae` 전용. `saryeong: null`이면 8a `saryeongUnavailable`(`no-day-counts` · `month-term-mismatch`)을 그대로 사령 세트 `unavailable`로 옮긴다 |
| 월지 정기 십신 | 8a `deukryeong.tenGod` | |
| 월지 충 | 8a `monthBranchClashed.value` | 격 «흔들림» 표시용 불리언(`.value`만 복사) — 판정에 쓰지 않는다 |

```
8a strengthFactors ──┬──> 8b-1 strengthReadings ──> 8b-2 yongsinCandidates
                     │
                     └──> 격국 gyeokgukReadings   (8b 출력에 의존하지 않는다)
                                │
                                └ v1.1 성패·상신 ── 8b-1 판독 + 8b-2 후보가 필요 (v1 제외)
```

- **v1 취격은 8b 출력을 읽지 않는다.** 8a만 있으면 된다. 그래서 8b-1 골든이 보류돼도 격국 코드는 막히지 않는다.
- 8b 의존이 생기는 지점은 **성패·상신**이다. 건록격·양인격에서 「재관을 쓰는가」는 강약 판독을 전제로 한다. v1.1 범위로 미루고 이 의존을 지금 고정한다.

## 2. 학파 선택표

| 항목 | 선택지 | 출처 계열 | v1 채택 |
| --- | --- | --- | --- |
| 취격 순서 | ① **투출 우선**: 월지 정기가 투출 → 정기 / 아니면 투출된 중기·여기 / 아무것도 투출 안 됨 → 정기 | 『자평진전』 논용신(月令 用神) | **실행** `gyeokguk.exposed-first` |
| | ② **사령 우선**: 출생 시점 사령 천간의 십신으로 격 | 『연해자평』 월률분야 | **실행** `gyeokguk.saryeong` (`yeonhae` 전용) |
| | ③ **정기 고정**: 투출과 무관하게 월지 정기 | 통용 교재 단순형 | **실행** `gyeokguk.primary-only` |
| 투출 여러 개 | 중기·여기가 둘 다 투출(정기 미투출) | 교재마다 «힘이 큰 쪽» — 판단 필요 | ①에서 **둘 다 후보로 싣고** `ambiguous: true` (선택 안 함) |
| 월지 비겁(건록·양인) | 건록격·양인격(월겁격)으로 별도 표기 / 다른 기둥에서 격을 다시 찾음 | 자평진전은 건록·월겁을 별도 격으로 둠 | **별도 표기** — 정의는 정기 십신이 아니라 **록·양인 표**(아래). 다른 기둥 재탐색은 판단이라 제외 |
| 양인 대상 일간 | 양간만 / 음간 포함 | 음간 양인은 학파 갈림 | **양간만** 양인. 음간 일간의 월지가 겁재 정기면 `wolgeop`(월겁) — 단 토 고지(辰戌丑未) 월지는 아래 행이 우선이라 己 辰·戌월은 월겁이 아니다(구현 2026-10-26: 월겁 표 = 乙寅 丁巳 辛申 癸亥 4행 — 아래 §4 «양인 4행(골든 50 중 양인 판정 행 수 — §2 월겁 표 4행과 다른 숫자)»은 골든 50 분포의 행 수로 다른 뜻) |
| 토(戊己) 일간 고지 월지(辰戌丑未 정기 = 비겁) | 잡기(雜氣)격으로 투출 장간 취격 / 비겁격 | 자평진전 잡기 재관 | 록·양인 표에 없으면 ①②③ 세트 규칙 그대로(정기 비겁이면 `bigyeop-month` 사유로 후보 0) |

| 외격(종격·화격·일행득기 등) | 포함 / 제외 | 성립 판단이 化·從 판단을 요구 | **v1 제외**(회의 Q1 기본값) — 사용자 확인 목록 |
| 성격·파격·상신 | 포함 / 제외 | 판단 | **v1 제외** |
| 지장간 학파 | `yeonhae` / `japyeong` | HIDDEN-STEMS 표 1·2 | 기존 `options.school` |

**록(祿)·양인(羊刃) 표(v1 정의):** 록 = 甲寅 乙卯 丙巳 丁午 戊巳 己午 庚申 辛酉 壬亥 癸子 · 양인(양간만) = 甲卯 丙午 戊午 庚酉 壬子. 월지가 일간의 록이면 `geonrok`, 양인이면 `yangin`. 戊·己는 정기 십신이 아니라 이 표로 정한다(戊 일간 巳월 = 건록, 巳 정기 丙은 편인).

**정기 비겁(록·양인 표 밖) 세트별 처리:** ① 투출 우선 — 정기 비겁은 건너뛰고 투출된 중기·여기로 취격(잡기 취격), 투출 없으면 후보 0 + `unavailable: "bigyeop-month"` / ② 사령 — 사령 천간이 비겁이면 후보 0 + `bigyeop-month`, 아니면 그 천간 / ③ 정기 고정 — 항상 후보 0 + `bigyeop-month`.

- **기본 세트 없음.** 세 세트를 모두 실행한다. 관점층이 세트 id를 인용한다(담천 = `exposed-first` 예상).
- **채택안을 못 정한 항목**(양쪽 병기 + `unreviewed`): 투출 여러 개의 우선순위 · 음간 양인 · 외격 포함 여부.

## 3. 출력 초안

```ts
type GyeokId =
  | "jeonggwan" | "pyeongwan" | "jeongjae" | "pyeonjae" | "siksin" | "sanggwan" | "jeongin" | "pyeonin" // 정격 8격 = 월지 장간 십신
  | "geonrok" | "yangin" | "wolgeop";                                                              // 월지 비겁

interface GyeokgukReading {
  ruleSetId: "gyeokguk.exposed-first" | "gyeokguk.primary-only" | "gyeokguk.saryeong";
  candidates: Array<{ gyeok: GyeokId; stem: Stem; role: HiddenRole; exposedIn: PillarKey[] }>; // 보통 1개, ambiguous면 2개
  ambiguous: boolean;
  unavailable?: "no-day-counts" | "month-term-mismatch" | "bigyeop-month"; // 앞 둘 = 8a saryeongUnavailable 그대로(사령 세트) / 정기 비겁
  monthBranchClashed: boolean;        // 8a monthBranchClashed.value, 판정에 쓰지 않음
  agreesAcrossSets: boolean;          // 8b-1과 같은 정의: 세 세트의 candidates gyeok 집합이 모두 같으면 true (unavailable 세트는 비교에서 뺀다)
  school: HiddenStemSchool;
  precision: StrengthPrecision;       // 시각 미상이면 시간 투출이 빠진다
  doctrine: "unreviewed";
}
```

- 점수·성패·순위 필드 없음. `candidates` 순서 = 정기 → 중기 → 여기(자리 순), 순위 아님.
- 세트 간 일치 필드 `agreesAcrossSets`: 8b-1 `StrengthReading.agreesAcrossSets`와 같은 이름·의미(레코드마다 같은 값).

## 3-1. 공개 계약

`saju-pillars-v1` 기본 응답은 바뀌지 않는다. 격국 블록은 9단계에서 `options.include`(가칭 `gyeokguk`)로만 열고, 열기 전에는 `INVALID_OPTIONS`(include-only 규칙, `SAJU_PILLARS_API_V1.md`).

## 4. 골든 설계

| 표 | 행 | 셀 | 상태 축 |
| --- | --- | --- | --- |
| `GOLDEN-GYEOKGUK.md` | 50 + 보강 ≥5 | 세트 3개의 `candidates`·`ambiguous`·`unavailable` | `실행`(LC 재계산) + `학설`(G2-3) |

**보강 ≥5(회의 E2 표 · 설계에서 확정):** ① 월지 충 명식(8a 골든에 9행 있음 → 보강 불필요, 실측으로 대체) ② 월지 중기·여기 둘 다 투출, 정기 미투출(`ambiguous`) ③ 월지 비겁 양간(양인) ④ 월지 비겁 음간(월겁) ⑤ 사령 `nearThreshold` 행에서 사령 세트와 투출 세트가 갈리는 명식 ⑥ 시각 미상으로 시간 투출이 빠져 격이 바뀌는 명식. 착수 HO에서 골든 50을 먼저 실측하고 빈 칸만 보강한다(8a 방식).

**골든 선행 조건:** 8a 골든 confirmed. 8a 셀(투간·사령)이 확정되지 않으면 격국 골든도 `실행: pending`에 머문다.

**K3 실측(2026-10-26, HO-2026-1026):** 8a가 50/50 pending이라 `GOLDEN-GYEOKGUK.md`는 보류(8b-1 READINGS와 같은 분기). 대신 `l2/golden-gyeokguk.test.ts`가 8a md 셀(일간·득령·투간·사령) + `GOLDEN-PILLARS.md` 월지에서 기대 취격을 유도해 50행 대조하고 분포를 고정한다. 보강: ①③⑤는 골든 50에 있음(월지충 9행 · 양인 4행(골든 50 중 양인 판정 행 수 — §2 월겁 표 4행과 다른 숫자) · nearThreshold 갈림 g-1983-06-25-1525) · ②는 1행(g-1927-08-20-0915) + 보강 1 · ④ 월겁 보강 2 · ⑥ 시각 미상 격 변화 보강 1 · 고지 무투출 보강 2 = **보강 6**(실명 입력, 기둥 문자열 고정).

## 5. 교차 구현

lunar-typescript 1.8.6에는 격국 API가 없다(`dist/index.d.ts` grep: 십신 `getBaZiShiShen*`만 있음, 2026-10-25 실측). 차분 대상이 아니다. CROSS-IMPL-DIFF §6에 착수 HO에서 추기한다.

## 6. 완료 조건 (격국 착수 HO용)

| # | 조건 | 판정 |
| --- | --- | --- |
| K1 | `docs/rules/GEOKGUK.md`(세트 3개 규칙표 + 학파 선택표) ↔ 코드 상수 파서 테스트 | 동일성 |
| K2 | `l2/gyeokguk.ts` 순수 함수, 공개 계약 diff 0, export 추가만 | typecheck · 계약 테스트 |
| K3 | 골든 50 + 보강 ≥5, `실행: pending` → LC 재계산 → confirmed | 불일치 0 |
| K4 | 경계 테스트: `ambiguous` · 건록/양인/월겁 · 戊 일간 巳월(건록, 정기 편인) · 토 일간 고지 월지 · japyeong 사령 unavailable · 시각 미상 | 각 1건 이상 |
| K5 | 어휘 가드(성격·파격·길흉 단정·추천어 0), 기본 응답 바이트 동일 | 0건 · 스냅샷 |
| K6 | verify exit 0 · verifier PASS · LC 게이트 | G3 |

## 7. 사용자 확인 목록(결정 전 기본값으로 진행)

1. 외격 포함 여부 — 기본값 **제외**.
2. 투출 여러 개 우선순위 — 기본값 **둘 다 후보 + ambiguous**.
3. 음간 양인 — 기본값 **양간만**(음간은 월겁).
4. 건록·양인·월겁 3격 추가 — 회의 1003 E2 표는 「정격 8격만」이었다. 이 설계는 월지 비겁을 「격 없음」으로 버리지 않으려고 3격을 별도 id로 더했다(범위 확대). 기본값 **추가**, 거부 시 3 id를 `unavailable: "bigyeop-month"`로 접는다.
