# 유료 3블록 뜻풀이 문장 — 정본 (HO-2026-1120 plain-reading)

`apps/web/src/paid-reading.ts`의 문장 조각은 이 문서 표 1의 id와 1:1이어야 하며 `apps/web/src/paid-reading.test.ts`가 md를 직접 파싱해 동일성을 강제한다. 설계 = `docs/handoffs/HO-2026-1120-saju-paid-3blocks-plain-reading-REPORT.md` §0.

- **조각만 쓴다.** 문장은 값별 조각(`Record<값>`) · 발화 조건별 조각(`Record<conditionId>`) · 잇는 문장으로 짠다. 사례별 완성 문장 표는 두지 않는다. 코어 상수(`STRENGTH_RULE_SETS` · `GYEOKGUK_RULE_SETS` · `EOKBU_RULES` · `JOHU_RULES`)에 새 값이나 조건이 생기면 `Record` 타입이 깨진다.
- **칸 3개.** `conclusion`(결론 1문장) · `meaning`(그래서 무슨 뜻) · `basis`(근거 · 방식 풀이 · 갈리는 까닭). 화면은 `basis`만 «왜 이렇게 봤나»로 접고, HTML 저장본(PDF 인쇄용)은 펼친다.
- **펼친 문장에 풀이 없는 전문 낱말 0.** 사전 `GLOSS`(낱말 → 같은 문장에 함께 나와야 하는 풀이 말)로 테스트한다. 방식은 펼친 문장에서 «태어난 달을 먼저 보는 방식»처럼 쉬운 이름으로 부른다.
- **학설은 고르지 않는다.** 코어에 기본 방식이 없다(`STRENGTH-READINGS.md:6` · `GEOKGUK.md:7` · `YONGSIN-CANDIDATES.md:6`). 갈리면 «보는 방식에 따라 갈린다»와 그 사주의 실제 글자로 까닭을 적는다. 세기 단정(«뚜렷하다» 등) · 좋다 나쁘다 · 결과 예언은 쓰지 않는다.
- **격국은 강약과 따로다.** 격국 입력은 8a 팩터뿐이다(`GEOKGUK.md:6` · `docs/design/gyeokguk-design.md:30`). 강약의 결과처럼 잇지 않는다.
- **«한눈에»는 카드 조각을 다시 쓴다.** ①② = 카드 ⓐ 머리, ③ = 카드 ⓑ 머리. ④는 무엇이 갈리는지만 말하고(두 카드 배지와 같은 값) 까닭은 카드 «방식끼리 비교» 줄 한 곳에만 둔다(LC 보정 0).
- **방식 이름은 하나로.** 처음 나오는 자리(줄 이름)에서 «쉬운 이름(전문 이름)», 그 뒤로는 쉬운 이름만(LC 보정 1). «세 가지 물음»은 나오는 자리에서 «태어난 달 · 날의 아랫글자 · 둘레 글자가 나를 돕는가»로 푼다(LC 보정 2).
- **조각이 말하는 조건은 코어 값으로 단언한다.** `paid-reading.test.ts` «문장 조각이 말하는 조건 = 코어 값»이 골든 50건 전부에서 조각이 나간 사례마다 조건을 계산해 참인지 본다. 코어 값으로 계산할 수 없는 조각(교재 입장 · 방식 정의 서술)은 REPORT «계산 못 하는 조각» 목록에 둔다.
- **쉬운 말 대응.** 천간 = 윗글자 · 지지 = 아랫글자 · 일간 = 나를 나타내는 글자(태어난 날의 윗글자) · 월지 = 태어난 달 · 정기/중기/여기 = 중심/가운데 구간/처음 구간 · 투출 = 윗글자(천간)로 드러남(연 · 월 · 시 윗글자, 월간 포함 — «다른 기둥 위로»라 쓰지 않는다) · 충 = 정면으로 부딪힘. 근거 = `HIDDEN-STEMS.md:5` · `STRENGTH.md:16-22` · `docs/i18n/ko.json:164-166`(일주 = 나의 중심) · `GEOKGUK.md:9`.
- 이 표의 명리학적 타당성은 G2-3(실제 역술가 대조) 전에는 검토되지 않았다. 화면 안내 `N-HEAD`가 이를 1회 알린다.

## 표 1 — 문장 id ↔ 근거 규칙 ↔ 출처

| id | 쓰는 자리 | 근거 규칙 | 출처 |
| --- | --- | --- | --- |
| N-HEAD | 머리 안내 1회 | 기본 방식 없음 · 미검토 | `STRENGTH-READINGS.md:6,8` · `GEOKGUK.md:7,12` · `YONGSIN-CANDIDATES.md:6,9` |
| N-TIME-UNKNOWN | 머리 안내(시각 미상) | 시각 미상이면 시주 제외 | `STRENGTH.md:66-68` · `STRENGTH-READINGS.md:10` |
| H-TITLE | 한눈에 제목 | 설계 A | REPORT §0 A |
| H-1-SAME | ① · 카드 ⓐ 머리 | 판독 세트 일치 | `STRENGTH-READINGS.md:9` · `docs/design/8b-strength-judgment.md` §2 `agreesAcrossSets` |
| H-1-SPLIT | ① · 카드 ⓐ 머리(«한 방식은 … 다른 방식은 …» 문장 꼴, `VERDICT_CLAUSE`) | 판독 세트 불일치 | `STRENGTH-READINGS.md:9,41` |
| H-1-NONE | ① · 카드 ⓐ 머리 | 모든 판독이 유보 | `STRENGTH-READINGS.md:27` |
| H-2-EOKBU | ② · 카드 ⓐ 머리 | 억부 후보 | `YONGSIN-CANDIDATES.md:5-7,19-26` |
| H-2-BOTH | ② · 카드 ⓐ 머리 | 억부 + 조후 병기 | `YONGSIN-CANDIDATES.md:6,53` |
| H-2-JOHU | ② · 카드 ⓐ 머리 | 조후만 | `YONGSIN-CANDIDATES.md:8,30-35` |
| H-2-NONE | ② · 카드 ⓐ 머리 | 후보 0 | `YONGSIN-CANDIDATES.md:26,34-35` |
| H-3-SAME | ③ · 카드 ⓑ 머리 | 격 일치 · 강약과 독립 | `GEOKGUK.md:6,14` |
| H-3-JUDGED-SAME | ③ · 카드 ⓑ 머리 | 결론 낸 세트끼리 일치 · 나머지 unavailable | `GEOKGUK.md:14,65-66` |
| H-3-READ | ③ 조각(«X로 읽고/읽습니다») | 세트 결과 격 1개 | `GEOKGUK.md:58-66` |
| H-3-READ-BOTH | ③ 조각(«X · Y 둘 다 후보로») | ambiguous | `GEOKGUK.md:63,102` |
| H-3-COUNT | ③ 조각(«두 방식은») | 같은 격 집합 세트 수 | `GEOKGUK.md:14` |
| H-3-SPLIT | ③ · 카드 ⓑ 머리 | 격 불일치 | `GEOKGUK.md:14,94-96` |
| H-3-ONE | ③ · 카드 ⓑ 머리 | 결론 낸 세트 1개 | `GEOKGUK.md:14` |
| H-3-NONE | ③ · 카드 ⓑ 머리 | 결론 낸 세트 0개 | `GEOKGUK.md:14,65-66` |
| H-4-NONE | ④ | 판독 일치 · 격 split 아님 | `STRENGTH-READINGS.md:9` · `GEOKGUK.md:14` |
| H-4-S | ④ | 판독 불일치만 | `STRENGTH-READINGS.md:9,41` |
| H-4-G | ④ | 격 불일치만 | `GEOKGUK.md:14,94-96` |
| H-4-BOTH | ④ | 판독 · 격 모두 불일치 | `STRENGTH-READINGS.md:9` · `GEOKGUK.md:14` |
| H-4-S-SAME | 카드 ⓐ 비교 | 판독 일치 | `STRENGTH-READINGS.md:9` |
| H-4-S-CLASH | ④ · 카드 ⓐ 비교(월지 · 상대 지지 · 유보한 방식) | 월지충 → 월령 우선 유보 | `STRENGTH-READINGS.md:27,38,41` · `STRENGTH.md:74` |
| H-4-S-RYEONG | ④ · 카드 ⓐ 비교(월지 · 정기 · 일지 장간 · 득세 개수) | 득령만 참 → 월령 우선 strong · 삼득 weak | `STRENGTH-READINGS.md:28,32` · `STRENGTH.md:16,19,22` |
| H-4-S-OTHER | ④ · 카드 ⓐ 비교(방어용) | 위 두 경우 밖의 불일치 | `STRENGTH-READINGS.md:25-32` |
| H-4-G-SAME | ④ · 카드 ⓑ 비교 | 격 일치 | `GEOKGUK.md:14` |
| H-4-G-JUDGED-SAME | ④ · 카드 ⓑ 비교 | 결론 낸 세트끼리 일치 | `GEOKGUK.md:14` |
| H-4-G-SPLIT | ④ · 카드 ⓑ 비교 | 격 불일치 | `GEOKGUK.md:14,94-96` |
| H-4-G-PICK | ④ 조각(방식 · 자리 · 천간) | 세트마다 고른 장간 | `GEOKGUK.md:13,72-84` |
| H-4-WHERE | ④ 조각(드러난 기둥) | 투출 위치 `exposedIn` | `GEOKGUK.md:9,13` |
| H-4-NOT-EXPOSED | ④ 조각 | 투출 없음 | `GEOKGUK.md:9` |
| H-4-G-ONE | ④ · 카드 ⓑ 비교 | 결론 낸 세트 1개 | `GEOKGUK.md:14` |
| H-4-G-NONE | ④ · 카드 ⓑ 비교 | 결론 낸 세트 0개 | `GEOKGUK.md:65-66` |
| C-ENERGY-TITLE | 카드 ⓐ 제목 | 강약 → 억부 사슬(`readingRef`) | `YONGSIN-CANDIDATES.md:5,7` · REPORT §0 B |
| Q-ENERGY | 카드 ⓐ 물음 | 강약 판독 · 용신 후보 | `STRENGTH-READINGS.md:5` · `YONGSIN-CANDIDATES.md:5-6` |
| L-CHAIN | 카드 ⓐ 줄 결론 | 판독 → 억부 후보 | `YONGSIN-CANDIDATES.md:7,19-25` |
| L-CHAIN-NONE | 카드 ⓐ 줄 결론 | 유보 → 억부 후보 0 | `YONGSIN-CANDIDATES.md:26` |
| L-EOKBU-ITEM | 카드 ⓐ 줄 뜻 조각 | 십신 묶음 → 오행 | `YONGSIN-CANDIDATES.md:17,21-25` |
| L-SEASON-LABEL | 카드 ⓐ 조후 줄 이름 | 조후는 판독과 무관 | `YONGSIN-CANDIDATES.md:8,44` |
| L-SEASON | 카드 ⓐ 조후 줄 결론 | 조후 후보 | `YONGSIN-CANDIDATES.md:32-33` |
| L-SEASON-NONE | 카드 ⓐ 조후 줄 결론 | 봄 · 가을 후보 0 | `YONGSIN-CANDIDATES.md:34-35` |
| L-SEASON-DIFFER | 카드 ⓐ 조후 줄 뜻 | 억부와 조후가 다른 오행 | `YONGSIN-CANDIDATES.md:6,53` |
| L-SEASON-MEET | 카드 ⓐ 조후 줄 뜻 | 억부와 조후가 같은 오행 | `YONGSIN-CANDIDATES.md:6-7` |
| L-COMPARE-LABEL | 두 카드 비교 줄 이름 | 세트 간 일치 | `STRENGTH-READINGS.md:9` · `GEOKGUK.md:14` |
| L-Y-SPLIT | 카드 ⓐ 비교 줄 뜻 | 판독 갈림 → 억부 묶음 따로 | `YONGSIN-CANDIDATES.md:7,54` |
| L-G-REST | 카드 ⓑ 비교 줄 뜻 | unavailable 세트 | `GEOKGUK.md:65-66,79-83` |
| T-MONTH-FIRST | 접힘 · 방식 풀이 | 월령 우선 표 | `STRENGTH-READINGS.md:27-30,38` |
| T-TRIAD | 접힘 · 방식 풀이 | 삼득 다수결 표 | `STRENGTH-READINGS.md:31-32,39` |
| T-DEUKRYEONG | 접힘 · 낱말 풀이 | 득령 정의 | `STRENGTH.md:16` |
| T-DEUKJI | 접힘 · 낱말 풀이 | 득지 정의 | `STRENGTH.md:19` |
| T-DEUKSE | 접힘 · 낱말 풀이 | 득세 정의(동률 = 득세) | `STRENGTH.md:22` |
| T-SUPPORT | 접힘 · 낱말 풀이 | 돕는 십신 | `STRENGTH.md:26-35` |
| T-EOKBU | 접힘 · 방식 풀이 | 억부 | `YONGSIN-CANDIDATES.md:19-25,43` |
| T-JOHU | 접힘 · 방식 풀이 | 조후 | `YONGSIN-CANDIDATES.md:8,30-35,44` · `STRENGTH.md:39-52` |
| T-GROUPS | 접힘 · 낱말 풀이 | 십신 다섯 묶음 | `docs/golden/GOLDEN-TENGODS.md:9` · `YONGSIN-CANDIDATES.md:17` |
| T-CYCLE | 접힘 · 낱말 풀이 | 상생 · 상극 순환 | `YONGSIN-CANDIDATES.md:17` · `packages/saju-core/src/l2/ten-gods.ts:40` |
| E-DAYMASTER | 접힘 · 근거 | 일간 · 오행 | `factors.dayMaster` · `packages/saju-core/src/five-elements.ts:19` |
| E-RYEONG | 접힘 · 근거 | 득령 근거 글자 | `factors.deukryeong`(`STRENGTH.md:71`) |
| E-JI | 접힘 · 근거 | 득지 근거 글자 | `factors.deukji` · `layers.hiddenStems`(`STRENGTH.md:68,71`) |
| E-SE | 접힘 · 근거 | 득세 개수 | `factors.deukse`(`STRENGTH.md:22,71`) |
| E-CLASH | 접힘 · 근거 | 월지충 상대 | `factors.monthBranchClashed`(`STRENGTH.md:74`) |
| E-NO-CLASH | 접힘 · 근거 | 월지충 없음 | `STRENGTH.md:74` |
| E-NO-TIME | 접힘 · 근거 꼬리 | 시각 미상 = 기둥 3 | `STRENGTH.md:66-68` · `GEOKGUK.md:9` |
| E-Y-EOKBU | 접힘 · 근거 | 후보 ← 판독(`readingRef`) | `YONGSIN-CANDIDATES.md:10` |
| E-Y-SEASON | 접힘 · 근거 | 월지 계절 | `STRENGTH.md:39-52` |
| D-S-CLASH | 접힘 · 갈림 까닭 | 월지충 유보는 월령 우선의 정의 · 반대 입장 | `STRENGTH-READINGS.md:41` |
| D-S-RYEONG | 접힘 · 갈림 까닭 | 득령 단독 strong vs 둘 이상 | `STRENGTH-READINGS.md:28,31-32` |
| D-S-OTHER | 접힘 · 갈림 까닭(방어용) | 세트 정의 차이 | `STRENGTH-READINGS.md:36-39` |
| D-Y-ORDER | 접힘 · 갈림 까닭 | 억부 vs 조후 | `YONGSIN-CANDIDATES.md:53` · 『궁통보감』 |
| D-Y-WEAK | 접힘 · 갈림 까닭 | 신약 묶음 다른 입장 | `YONGSIN-CANDIDATES.md:51` |
| D-Y-STRONG | 접힘 · 갈림 까닭 | 신강 묶음 다른 입장 | `YONGSIN-CANDIDATES.md:50` |
| C-FRAME-TITLE | 카드 ⓑ 제목 | 격국 취격 | `GEOKGUK.md:5` |
| Q-FRAME | 카드 ⓑ 물음 | 어느 십신의 격으로 읽는가 | `GEOKGUK.md:5` |
| N-FRAME-INDEPENDENT | 카드 ⓑ 머리 | 입력 = 8a만, 8b를 읽지 않음 | `GEOKGUK.md:6` · `docs/design/gyeokguk-design.md:30` |
| G-MEANING | 카드 ⓑ 줄 뜻(정격 8격만) | 격 id = 십신 id | `GEOKGUK.md:86-87` · `GOLDEN-TENGODS.md:9` |
| G-MEANING-TABLE | 카드 ⓑ 줄 뜻(건록 · 양인 · 월겁) | 일간 · 월지 짝의 표, 오행 주장 없음(무-사 · 기-오 록 · 무-오 양인은 정기가 화) | `GEOKGUK.md:18-40` |
| G-BOTH | 카드 ⓑ 줄 결론 꼬리 | ambiguous | `GEOKGUK.md:63,102` |
| T-EXPOSED | 접힘 · 방식 풀이 | 투출 우선 | `GEOKGUK.md:72-77,94` · 『자평진전』 논용신 |
| T-PRIMARY | 접힘 · 방식 풀이 | 정기 고정 | `GEOKGUK.md:78-80,95` |
| T-SARYEONG | 접힘 · 방식 풀이 | 사령 | `GEOKGUK.md:81-84,96` · `STRENGTH.md:72` · 『연해자평』 월률분야 |
| T-HIDDEN | 접힘 · 낱말 풀이 | 지장간 여기 · 중기 · 정기 | `HIDDEN-STEMS.md:9-24` |
| T-NAMES | 접힘 · 낱말 풀이 | 정 · 편 음양 · 록 · 양인 · 월겁 표 | `GOLDEN-TENGODS.md:9` · `GEOKGUK.md:18-40` |
| E-G-MONTH | 접힘 · 근거 | 월지 장간 | `layers.hiddenStems`(`GEOKGUK.md:6`) |
| E-G-EXPOSED | 접힘 · 근거 | 투출 기둥 | `layers.stems`(`GEOKGUK.md:9`) |
| E-G-SARYEONG | 접힘 · 근거 | 사령 경과일 · 경계 | `factors.saryeong`(`STRENGTH.md:72`) |
| E-G-NEAR | 접힘 · 근거 | 경계 근접 1일 | `STRENGTH.md:54-58,72` |
| E-G-NOON | 접힘 · 근거 | 시각 미상 = 12:00 | `STRENGTH.md:59,72` |
| E-G-NO-SARYEONG | 접힘 · 근거 | 사령 없음 | `STRENGTH.md:72` · `GEOKGUK.md:52` |
| E-G-PICK | 접힘 · 근거 | 세트별 고른 장간 → 격 | `GEOKGUK.md:13,58-66` |
| D-G-WHY | 접힘 · 갈림 까닭 | 세트 출처 | `GEOKGUK.md:94-96` · `docs/design/gyeokguk-design.md:37-39` |
| B-SAME | 배지 | 일치 | `STRENGTH-READINGS.md:9` · `GEOKGUK.md:14` |
| B-DIFF | 배지 | 불일치 | 같음 |
| B-JUDGED-NONE | 격국 배지 | 결론 낸 세트 0 | `GEOKGUK.md:14` |
| B-JUDGED-ONE | 격국 배지 | 결론 낸 세트 1 | `GEOKGUK.md:14` |
| B-JUDGED-SAME | 격국 배지 | 결론 낸 세트끼리 일치 | `GEOKGUK.md:14` |
| W-SUMMARY | 접기 제목 | LC 합의(접힘 = basis) | REPORT §0 F |
| ELEMENT_PLAIN | 값별 뜻 `Record<FiveElement>` | 오행 이름 + 한자 자훈(木 나무 · 火 불 · 土 흙 · 金 쇠 · 水 물) | `five-elements.ts:10` · 표준국어대사전 표제어 «나무» · «불» · «흙» · «쇠» · «물»(워커 가정 — 한자 훈과 같은 낱말, 본문 전재 없음) |
| GROUP_GLOSS | 값별 뜻 | 십신 묶음 = 일간 기준 생극 | `GOLDEN-TENGODS.md:9` · `YONGSIN-CANDIDATES.md:21-25` |
| EOKBU_GROUP | 값별 뜻 `Record<억부 ruleId>` | 억부 규칙 → 묶음 | `YONGSIN-CANDIDATES.md:21-25` |
| VERDICT_VALUE | 값별 뜻 `Record<StrengthVerdict>` | strong · weak · indeterminate | `STRENGTH-READINGS.md:7,25-32` |
| VERDICT_DIRECTION | 값별 뜻 `Record<StrengthVerdict>` | 판독 → 억부 방향(«덜어 내는 쪽 / 돕는 쪽») · 그 기운이 보탬(용신 후보)이 되는 사주로 읽음 | `YONGSIN-CANDIDATES.md:5-7,21-26,43` |
| VERDICT_CLAUSE | 값별 뜻 `Record<StrengthVerdict>`(한눈에 ① 문장 꼴) | strong · weak · indeterminate | `STRENGTH-READINGS.md:7,25-32` |
| VERDICT_PLAIN | 값별 뜻(한눈에 ① 같음) | strong · weak | `STRENGTH-READINGS.md:7` |
| TRIAD_PLAIN | 삼득 세 물음 풀이 구 | 득령 · 득지 · 득세 | `STRENGTH.md:16,19,22` |
| TABLE_GYEOKS | 값 집합(건록 · 양인 · 월겁) | 표 1로 붙는 격 | `GEOKGUK.md:18-40` |
| STRENGTH_SET_LABEL | 방식 이름(풀이) | 세트 관점 | `STRENGTH-READINGS.md:38-39` |
| STRENGTH_SET_PLAIN | 방식 쉬운 이름 | 세트 관점 | `STRENGTH-READINGS.md:38-39` |
| GYEOKGUK_SET_LABEL | 방식 이름(풀이) | 세트 관점 | `GEOKGUK.md:94-96` |
| GYEOKGUK_SET_PLAIN | 방식 쉬운 이름 | 세트 관점 | `GEOKGUK.md:94-96` |
| GYEOK_KO | 값별 뜻 `Record<GyeokId>` | 격 이름 | `GEOKGUK.md:20-38,87` |
| GYEOK_GROUP | 값별 뜻 `Record<GyeokId>` | 격 → 십신 묶음(건록 · 양인 · 월겁 = 비겁) | `GEOKGUK.md:18-40,87` |
| STRENGTH_REASON | 근거 조각 `Record<강약 conditionId>`(month-first.otherwise는 득지 · 득세 값으로 세 갈래) | 표 2 발화 조건 | `STRENGTH-READINGS.md:27-32` |
| GYEOKGUK_REASON | 근거 조각 `Record<격국 conditionId>`(투출 갈래는 `frameFactsOf` 정기 투출 여부로 고름) | 표 4 발화 조건 · 표 2 토큰(비겁 장간 제외) | `GEOKGUK.md:9-10,45-54,72-84` |
| UNAVAILABLE_REASON | 근거 조각 `Record<unavailable>` | 결론 없는 까닭 | `GEOKGUK.md:52,65-66,88` |
| UNAVAILABLE_VALUE | 값별 뜻 `Record<unavailable>` | 해당 격 없음 · 판정 불가 | `GEOKGUK.md:65-66` |
| JOHU_MEANING | 값별 뜻 `Record<조후 season>` | 계절 → 조후 오행 | `YONGSIN-CANDIDATES.md:30-35,44` |
