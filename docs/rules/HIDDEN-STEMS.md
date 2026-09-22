# 지장간(支藏干) 표 — 정본

`packages/saju-core/src/l2/hidden-stems.data.ts`는 이 표에서 생성된 것과 같아야 하며 `l2/hidden-stems.test.ts`가 md를 직접 파싱해 동일성을 강제한다(열 이름 매핑). 코어는 **천간과 순서(여기·중기·정기)만 결정론으로 쓰고, 일수는 데이터 필드로 응답에 실을 뿐 가중 산식은 없다**(회의 2026-09-22 A2-1·F3).

- 천간 라벨은 로마자 `gap eul byeong jeong mu gi gyeong sin im gye`(甲乙丙丁戊己庚辛壬癸), 지지는 `ja chuk in myo jin sa o mi sin yu sul hae`(子丑寅卯辰巳午未申酉戌亥).
- 칸 표기 `천간:일수`(예 `im:10`). 일수 없음은 `천간`만. 빈칸은 `-`.
- 학파는 `options.hiddenStemSchool`로 고른다. 기본 `yeonhae`.

## 표 1 — `yeonhae` (기본): 『연해자평』 월률분야 일수 (전통 역술가 A2-1 확정, `r2-traditional.md`)

| 지지 | 여기 | 중기 | 정기 | 갈림 |
| --- | --- | --- | --- | --- |
| ja | im:10 | - | gye:20 | |
| chuk | gye:9 | sin:3 | gi:18 | |
| in | mu:7 | byeong:7 | gap:16 | ★여기 戊/己 |
| myo | gap:10 | - | eul:20 | |
| jin | eul:9 | gye:3 | mu:18 | |
| sa | mu:7 | gyeong:7 | byeong:16 | ★일수 5·9·16(삼명통회) |
| o | byeong:10 | gi:9 | jeong:11 | ★중기 己 유무·10·10·10 |
| mi | jeong:9 | eul:3 | gi:18 | |
| sin | mu:7 | im:7 | gyeong:16 | ★여기 戊/己 |
| yu | gyeong:10 | - | sin:20 | |
| sul | sin:9 | jeong:3 | mu:18 | |
| hae | mu:7 | gap:7 | im:16 | ★여기 戊 유무 |

## 표 2 — `japyeong`: 『자평진전』 인원용사 (일수 없음)

| 지지 | 여기 | 중기 | 정기 | 갈림 |
| --- | --- | --- | --- | --- |
| ja | - | - | gye | 여기 壬 없음 |
| chuk | gye | sin | gi | |
| in | mu | byeong | gap | 戊 채택 |
| myo | - | - | eul | 여기 甲 없음 |
| jin | eul | gye | mu | |
| sa | mu | gyeong | byeong | |
| o | - | gi | jeong | 중기 己 채택 |
| mi | jeong | eul | gi | |
| sin | mu | im | gyeong | 戊 채택 |
| yu | - | - | sin | 여기 庚 없음 |
| sul | sin | jeong | mu | |
| hae | - | gap | im | 여기 戊 없음 |

## 갈림 5칸의 대안 값 (기록용 — 학파 열이 어느 값을 택하는지 위 두 표에 명시)

| 칸 | `yeonhae` | 대안 | 대안 출처 | 십신 영향 |
| --- | --- | --- | --- | --- |
| 寅 여기 | 戊7 | 己7 | 일부 명리 교재(戊己 혼용) | 있음(戊→己는 음양이 바뀌어 편재↔정재 등 갈림) |
| 巳 일수 | 7·7·16 | 5·9·16 | 『삼명통회』 | 없음(일수만) |
| 午 중기 | 己9 (10·9·11) | 己 없음 / 10·10·10 | 일부 교재 | 己 유무만 십신 목록에 영향 |
| 申 여기 | 戊7 | 己7 | 일부 명리 교재 | 있음 |
| 亥 여기 | 戊7 | 없음 | 『자평진전』 | 있음(戊 십신 1개 유무) |

출처: 『연해자평(淵海子平)』 월률분야(月律分野) · 『자평진전(子平眞詮)』 인원용사(人元用事) · 회의록 2026-09-22 §3-2 A2-1(전통 역술가 발언 `docs/meeting-2026-0922/r2-traditional.md`). 세 번째 학파(삼명통회 일수)는 요청 시 표 3으로 추가한다.
